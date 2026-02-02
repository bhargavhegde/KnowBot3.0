import uuid
from pathlib import Path
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework import status, viewsets, generics, permissions
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
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
                chunks = processor.load_single_document(str(file_path))
                manager = VectorStoreManager()
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
    
    try:
        engine = RAGEngine(custom_prompt=custom_prompt)
        result = engine.query(message)
        response_text = result['response']
        citations = result['citations']
        
        ChatMessage.objects.create(
            session=session,
            role=ChatMessage.Role.ASSISTANT,
            content=response_text,
            citations=citations
        )
        
        if session.messages.count() <= 2:
            title = message[:50] + "..." if len(message) > 50 else message
            session.title = title
            session.save()
        
        return Response({
            'response': response_text,
            'session_id': session.id,
            'citations': citations
        })
    except Exception as e:
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
