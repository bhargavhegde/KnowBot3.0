from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Document, ChatSession, ChatMessage, SystemPrompt


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '')
        )
        return user


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for Document model."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'user', 'filename', 'original_filename', 'file_size', 'file_type',
            'index_status', 'chunk_count', 'error_message',
            'uploaded_at', 'indexed_at'
        ]
        read_only_fields = [
            'id', 'user', 'filename', 'file_size', 'index_status', 'chunk_count',
            'error_message', 'uploaded_at', 'indexed_at'
        ]


class DocumentUploadSerializer(serializers.Serializer):
    """Serializer for document upload."""
    
    file = serializers.FileField()
    
    def validate_file(self, value):
        # Check file extension
        allowed_extensions = ['.pdf', '.txt', '.md']
        ext = '.' + value.name.split('.')[-1].lower() if '.' in value.name else ''
        
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Check file size (50MB limit)
        max_size = 50 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File too large. Maximum size is 50MB."
            )
        
        return value


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for ChatMessage model."""
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'citations', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer for ChatSession model."""
    
    user = UserSerializer(read_only=True)
    messages = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ['id', 'user', 'title', 'created_at', 'updated_at', 'message_count', 'messages']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()


class ChatSessionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing chat sessions."""
    
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at', 'message_count', 'last_message']
    
    def get_message_count(self, obj):
        return obj.messages.count()
    
    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            preview = last.content[:100] + "..." if len(last.content) > 100 else last.content
            return {'role': last.role, 'content': preview}
        return None


class ChatRequestSerializer(serializers.Serializer):
    """Serializer for incoming chat requests."""
    
    message = serializers.CharField(max_length=10000)
    session_id = serializers.IntegerField(required=False, allow_null=True)


class ChatResponseSerializer(serializers.Serializer):
    """Serializer for chat responses."""
    
    response = serializers.CharField()
    session_id = serializers.IntegerField()
    citations = serializers.ListField(child=serializers.DictField())


class SystemPromptSerializer(serializers.ModelSerializer):
    """Serializer for SystemPrompt model."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SystemPrompt
        fields = ['id', 'user', 'name', 'content', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
