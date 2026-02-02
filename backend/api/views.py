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
    """View for user registration."""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request):
    """Get current user profile."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing documents."""
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'], url_path='upload')
    def upload(self, request):
        """Upload a new document."""
        serializer = DocumentUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = serializer.validated_data['file']
        
        data_dir = Path(settings.DATA_DIR)
        data_dir.mkdir(parents=True, exist_ok=True)
        
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
        
        try:
            from .tasks import index_document_task
            index_document_task.delay(document.id)
        except Exception as e:
            try:
                processor = DocumentProcessor()
                chunks = processor.load_single_document(str(file_path), user_id=request.user.id)
                manager = VectorStoreManager(user_id=request.user.id)
                manager.create_vector_store(chunks)
                document.index_status = Document.IndexStatus.INDEXED
                document.chunk_count = len(chunks)
                document.indexed_at = timezone.now()
                document.save()
            except Exception as sync_error:
                document.index_status = Document.IndexStatus.FAILED
                document.error_message = str(sync_error)
                document.save()
        
        return Response(DocumentSerializer(document).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='status')
    def get_status(self, request, pk=None):
        document = self.get_object()
        return Response({
            'id': document.id,
            'index_status': document.index_status,
            'chunk_count': document.chunk_count,
            'error_message': document.error_message
        })
    
    def destroy(self, request, *args, **kwargs):
        document = self.get_object()
        try:
            file_path = Path(document.file_path)
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            print(f"Error deleting file: {e}")
        return super().destroy(request, *args, **kwargs)


class ChatSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing chat sessions."""
    
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
        session = self.get_object()
        messages = session.messages.all()
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'], url_path='clear')
    def clear_messages(self, request, pk=None):
        session = self.get_object()
        session.messages.all().delete()
        return Response({'message': 'Messages cleared'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def chat(request):
    """Main chat endpoint."""
    serializer = ChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    message = serializer.validated_data['message']
    session_id = serializer.validated_data.get('session_id')
    
    if session_id:
        try:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        except ChatSession.DoesNotExist:
            session = ChatSession.objects.create(user=request.user)
    else:
        session = ChatSession.objects.create(user=request.user)
    
    ChatMessage.objects.create(
        session=session,
        role=ChatMessage.Role.USER,
        content=message
    )
    
    custom_prompt = None
    try:
        active_prompt = SystemPrompt.objects.get(is_active=True, user=request.user)
        custom_prompt = active_prompt.content
    except SystemPrompt.DoesNotExist:
        pass
    
    # Check if user has any indexed documents
    has_docs = Document.objects.filter(
        user=request.user, 
        index_status=Document.IndexStatus.INDEXED
    ).exists()

    if not has_docs:
        response_text = "I don't have any documents to answer from yet. Please upload some documents."
        citations = []
    else:
        try:
            engine = RAGEngine(custom_prompt=custom_prompt, user_id=request.user.id)
            result = engine.query(message)
            response_text = result['response']
            citations = result['citations']
        except Exception as e:
            # Fallback for RAG errors
            response_text = f"I encountered an error while searching your documents: {str(e)}"
            citations = []

    ChatMessage.objects.create(
        session=session,
        role=ChatMessage.Role.ASSISTANT,
        content=response_text,
        citations=citations
    )
    
    return Response({
        'response': response_text,
        'citations': citations,
        'session_id': session.id
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def preview_document(request, pk):
    """Securely preview a document."""
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
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SystemPromptViewSet(viewsets.ModelViewSet):
    """ViewSet for managing system prompts."""
    serializer_class = SystemPromptSerializer

    def get_queryset(self):
        return SystemPrompt.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='active')
    def get_active(self, request):
        try:
            prompt = SystemPrompt.objects.get(is_active=True, user=request.user)
            return Response(SystemPromptSerializer(prompt).data)
        except SystemPrompt.DoesNotExist:
            return Response({'message': 'No active prompt. Using default.'})
    
    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        prompt = self.get_object()
        prompt.is_active = True
        prompt.save()
        return Response(SystemPromptSerializer(prompt).data)
    
    @action(detail=False, methods=['post'], url_path='reset')
    def reset_to_default(self, request):
        SystemPrompt.objects.filter(is_active=True, user=request.user).update(is_active=False)
        return Response({'message': 'Reset to default prompt'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint."""
    return Response({
        'status': 'healthy',
        'service': 'knowbot-api',
        'timestamp': timezone.now().isoformat()
    })
