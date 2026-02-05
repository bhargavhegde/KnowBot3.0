"""
API Views for KnowBot.

This file acts as the ORCHESTRATOR for the backend.
It defines the endpoints (URLs) and the logic that runs when a user interacts with the app.

KEY RESPONSIBILITIES:
1. Document Management: Uploading files, triggering the RAG indexing, and managing deletion.
2. Chat Logic: Handling user messages, retrieving context from RAG, and formatting LLM responses.
3. Authentication: Managing user profiles and registration.
4. Prompt Management: Allowing users to switch between different AI personalities/instructions.

WORKFLOW:
Frontend Request -> View Function -> Serializer (Validation) -> Models/RAG Service -> JSON Response.
"""

import uuid
import os
from pathlib import Path
from django.conf import settings
from django.utils import timezone
from django.http import FileResponse
from django.contrib.auth.models import User
from rest_framework import status, viewsets, generics, permissions
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document, ChatSession, ChatMessage, SystemPrompt
from rag.service import RAGEngine, DocumentProcessor, VectorStoreManager
from .serializers import (
    DocumentSerializer, DocumentUploadSerializer,
    ChatSessionSerializer, ChatSessionListSerializer,
    ChatMessageSerializer, ChatRequestSerializer, ChatResponseSerializer,
    SystemPromptSerializer, RegisterSerializer, UserSerializer
)


class RegisterView(generics.CreateAPIView):
    """
    Handles new user registration.
    Uses the RegisterSerializer to validate password strength and unique usernames.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request):
    """
    Returns the current logged-in user's details.
    Used by the frontend to confirm state after login.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing documents (CRUD operations).
    
    SPECIAL ACTIONS:
    - upload: Receives a file, saves it to disk, and triggers the RAG indexing task.
    - status: Checks if a document is PENDING, INDEXED, or FAILED.
    - preview: Safely serves the file content (e.g., PDF) to the browser.
    - reset: Completely wipes all documents and the vector store for the user.
    """
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        """Ensure users only see THEIR OWN documents."""
        return Document.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'], url_path='upload')
    def upload(self, request):
        """
        Main upload entry point.
        Workflow: Save File -> Create DB Record -> Start Indexing (Celery or Sync).
        """
        serializer = DocumentUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = serializer.validated_data['file']
        
        data_dir = Path(settings.DATA_DIR)
        data_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate a unique filename to prevent overwrites
        ext = '.' + uploaded_file.name.split('.')[-1].lower()
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = data_dir / unique_filename
        
        with open(file_path, 'wb') as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)
        
        document = Document.objects.create(
            user=request.user,
            filename=unique_filename,
            original_filename=uploaded_file.name,
            file_path=str(file_path),
            file_size=uploaded_file.size,
            file_type=ext.lstrip('.'),
            index_status=Document.IndexStatus.PENDING
        )
        
        # Try to offload to Celery worker if available, otherwise process synchronously
        try:
            from .tasks import index_document_task
            index_document_task.delay(document.id)
            print(f"🚀 Document {document.id} queued for background indexing.")
        except Exception as e:
            # Fallback to synchronous processing if Celery is down
            print(f"⚠️ Celery not available, processing document {document.id} synchronously: {e}")
            try:
                processor = DocumentProcessor()
                chunks = processor.load_single_document(str(file_path), user_id=request.user.id)
                manager = VectorStoreManager(user_id=request.user.id)
                manager.create_vector_store(chunks)
                
                document.index_status = Document.IndexStatus.INDEXED
                document.chunk_count = len(chunks)
                document.indexed_at = timezone.now()
                document.save()
                print(f"✅ Synchronous indexing successful for {document.original_filename}")
            except Exception as sync_error:
                print(f"❌ Synchronous indexing failed for {document.original_filename}: {sync_error}")
                document.index_status = Document.IndexStatus.FAILED
                document.error_message = str(sync_error)
                document.save()
                # We return success for the upload itself, but the status will show FAILED
                # This prevents the frontend from timing out on the initial POST
        
        return Response(DocumentSerializer(document).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='status')
    def get_status(self, request, pk=None):
        """Polling endpoint for the frontend to check if indexing is complete."""
        document = self.get_object()
        return Response({
            'id': document.id,
            'index_status': document.index_status,
            'chunk_count': document.chunk_count,
            'error_message': document.error_message
        })
    
    @action(detail=True, methods=['get'], url_path='preview')
    def preview(self, request, pk=None):
        """Serve the document file for preview in the UI."""
        import mimetypes
        from django.http import FileResponse
        
        document = self.get_object()
        file_path = Path(document.file_path)
        
        if not file_path.exists():
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
            
        mime_type, _ = mimetypes.guess_type(file_path)
        return FileResponse(open(file_path, 'rb'), content_type=mime_type or 'application/octet-stream')
    
    @action(detail=False, methods=['post'], url_path='reset')
    def reset_knowledge(self, request):
        """HARD RESET: Wipes all user documents from Postgres and ChromaDB."""
        try:
            # Wipe ChromaDB
            manager = VectorStoreManager(user_id=request.user.id)
            manager.reset_vector_store()
            
            # Delete files from disk
            data_dir = Path(settings.DATA_DIR)
            documents = self.get_queryset()
            for doc in documents:
                try:
                    path = Path(doc.file_path)
                    if path.exists():
                        path.unlink()
                except Exception as e:
                    print(f"Error unlinking file {doc.file_path}: {e}")
            
            # Delete DB records
            documents.delete()
            
            return Response({'message': 'Knowledge base reset successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        """Custom delete logic to ensure vectors and files are removed too."""
        document = self.get_object()
        doc_filename = document.original_filename
        try:
            # Delete from Vector Store first
            # Now safe because VectorStoreManager uses lazy embeddings!
            manager = VectorStoreManager(user_id=request.user.id)
            manager.delete_from_vector_store(document.file_path)
            
            # Delete file from disk
            file_path = Path(document.file_path)
            if file_path.exists():
                file_path.unlink()
                print(f"✅ Deleted file: {file_path}")
            
            import gc
            gc.collect() # Helper for memory pressure
            
        except Exception as e:
            print(f"⚠️ Non-critical error during file/vector deletion for {doc_filename}: {e}")
            # We continue anyway to super().destroy() to remove the DB record
            
        return super().destroy(request, *args, **kwargs)


class ChatSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing chat sessions.
    Allows users to have multiple independent conversations.
    """
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ChatSessionListSerializer
        return ChatSessionSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'], url_path='messages')
    def messages(self, request, pk=None):
        """Returns the full message history for a specific session."""
        session = self.get_object()
        messages = session.messages.all()
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'], url_path='clear')
    def clear_messages(self, request, pk=None):
        """Wipes messages but keeps the session container."""
        session = self.get_object()
        session.messages.all().delete()
        return Response({'message': 'Messages cleared'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chat(request):
    """
    Main chat endpoint (The Intelligence Engine).
    
    LOGIC:
    1. Receive user message.
    2. Check if user has INDEXED documents.
    3. If YES: Run RAGEngine (Semantic Search -> LLM).
    4. If NO: Use General Chat (LLM only).
    5. Save User Q and Assistant A to Postgres history.
    """
    serializer = ChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    message = serializer.validated_data['message']
    session_id = serializer.validated_data.get('session_id')
    
    # Get or Create Session
    if session_id:
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            session = ChatSession.objects.create(user=request.user)
    else:
        session = ChatSession.objects.create(user=request.user)
    
    # Save user message
    ChatMessage.objects.create(
        session=session,
        role=ChatMessage.Role.USER,
        content=message
    )
    
    # Load custom prompt if active
    custom_prompt = None
    try:
        active_prompt = SystemPrompt.objects.get(is_active=True, user=request.user)
        custom_prompt = active_prompt.content
    except SystemPrompt.DoesNotExist:
        pass
    
    # Check document status for better context
    user_docs = Document.objects.filter(user=request.user)
    has_indexed = user_docs.filter(index_status=Document.IndexStatus.INDEXED).exists()
    has_pending = user_docs.filter(index_status__in=[Document.IndexStatus.PENDING, Document.IndexStatus.PROCESSING]).exists()

    try:
        engine = RAGEngine(custom_prompt=custom_prompt, user_id=request.user.id)
        
        if has_indexed:
            # Standard RAG Query (Retrieval Augmented Generation)
            result = engine.query(message)
        else:
            # Fallback to General Chat (No documents found)
            result = engine.general_query(message)
            
            # Subtly notify user if their docs are still being processed
            if has_pending:
                result['response'] = f"*Note: Your documents are currently being processed.*\n\n{result['response']}"
                
        response_text = result['response']
        citations = result['citations']

    except Exception as e:
        # Fallback for errors (e.g. Ollama down)
        response_text = f"I encountered an error: {str(e)}"
        citations = []

    # Save LLM response to DB
    ChatMessage.objects.create(
        session=session,
        role=ChatMessage.Role.ASSISTANT,
        content=response_text,
        citations=citations
    )
    
    # Auto-title session based on first message
    if session.title == "New Chat":
        session.title = message[:50] + ("..." if len(message) > 50 else "")
        session.save()
    else:
        # Update timestamp for sorting
        session.updated_at = timezone.now()
        session.save()
    
    return Response({
        'response': response_text,
        'citations': citations,
        'session_id': session.id
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def preview_document(request, pk):
    """Securely preview a document by checking ownership first."""
    try:
        document = Document.objects.get(pk=pk, user=request.user)
        if not os.path.exists(document.file_path):
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
            
        file_handle = open(document.file_path, 'rb')
        response = FileResponse(file_handle, content_type='application/pdf') # Default to PDF
        if document.file_type in ['txt', 'md']:
             response = FileResponse(file_handle, content_type='text/plain')
             
        response['Content-Disposition'] = f'inline; filename="{document.original_filename}"'
        return response
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)


class SystemPromptViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing system prompts (Personas).
    Ensures that only ONE prompt is active at a time per user.
    """
    serializer_class = SystemPromptSerializer

    def get_queryset(self):
        return SystemPrompt.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='active')
    def get_active(self, request):
        """Returns the currently selected persona."""
        try:
            prompt = SystemPrompt.objects.get(is_active=True, user=request.user)
            return Response(SystemPromptSerializer(prompt).data)
        except SystemPrompt.DoesNotExist:
            return Response({'message': 'No active prompt. Using default.'})
    
    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        """Set a specific prompt as the current persona."""
        prompt = self.get_object()
        prompt.is_active = True
        prompt.save()
        return Response(SystemPromptSerializer(prompt).data)
    
    @action(detail=False, methods=['post'], url_path='reset')
    def reset_to_default(self, request):
        """Deactivates all custom prompts, falling back to System default."""
        SystemPrompt.objects.filter(is_active=True, user=request.user).update(is_active=False)
        return Response({'message': 'Reset to default prompt'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """
    Basic health check endpoint.
    Used by Tilt/Docker to confirm the API is reachable.
    """
    return Response({
        'status': 'healthy',
        'service': 'knowbot-api',
        'timestamp': timezone.now().isoformat()
    })

