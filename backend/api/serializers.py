"""
API Serializers for KnowBot.

Serializers handle the conversion between complex data (like Django Model instances)
and JSON format that the frontend can understand. They also handle VALIDATION
for incoming data.

CONCEPTS:
1. Data Validation: Checking file sizes, allowed extensions, and required fields.
2. Nesting: Representing relationships (e.g., including Messages inside a Session).
3. Derived Fields: Calculating data on-the-fly (e.g., `message_count`).
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Document, ChatSession, ChatMessage, SystemPrompt


class UserSerializer(serializers.ModelSerializer):
    """Simple serializer for basic user information."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles user registration logic.
    Converts username/password JSON into a persistent User object.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def create(self, validated_data):
        """Hashes the password before saving to the database."""
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '')
        )
        return user


class DocumentSerializer(serializers.ModelSerializer):
    """
    Full representation of a document.
    Includes status flags and metadata about the file.
    """
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
    """
    Specialized serializer for the upload process.
    Handles strict validation of file types and sizes.
    """
    
    file = serializers.FileField()
    
    def validate_file(self, value):
        """
        Custom validation logic for uploaded files.
        Ensures we only accept supported formats and manageable file sizes.
        """
        # Check file extension (including images for OCR support)
        allowed_extensions = ['.pdf', '.txt', '.md', '.png', '.jpg', '.jpeg', '.tiff', '.tif', '.bmp']
        ext = '.' + value.name.split('.')[-1].lower() if '.' in value.name else ''
        
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Check file size (50MB limit to prevent server overload)
        max_size = 50 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File too large. Maximum size is 50MB."
            )
        
        return value


class ChatMessageSerializer(serializers.ModelSerializer):
    """Represents a single message in a conversation thread."""
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'citations', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    """
    Detailed session view.
    Includes the full message history (nested list of Message objects).
    """
    
    user = UserSerializer(read_only=True)
    messages = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ['id', 'user', 'title', 'created_at', 'updated_at', 'message_count', 'messages']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        """Calculates total messages in this session dynamically."""
        return obj.messages.count()


class ChatSessionListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer used for the sidebar list.
    Performance optimization: Doesn't load full message history.
    """
    
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'created_at', 'updated_at', 'message_count', 'last_message']
    
    def get_message_count(self, obj):
        # Use the annotated value from get_queryset if available (0 DB hits)
        if hasattr(obj, 'annotated_message_count'):
            return obj.annotated_message_count
        return obj.messages.count()
    
    def get_last_message(self, obj):
        """Returns a short snippet of the final message for display in the sidebar."""
        # Use prefetched objects if available to avoid N+1 N+1 DB hits
        if getattr(obj, '_prefetched_objects_cache', {}).get('messages'):
            messages = list(obj.messages.all())
            last = messages[-1] if messages else None
        else:
            last = obj.messages.last()
            
        if last:
            preview = last.content[:100] + "..." if len(last.content) > 100 else last.content
            return {'role': last.role, 'content': preview}
        return None


class ChatRequestSerializer(serializers.Serializer):
    """Validates the incoming payload when a user sends a message."""
    
    message = serializers.CharField(max_length=10000)
    session_id = serializers.IntegerField(required=False, allow_null=True)


class ChatResponseSerializer(serializers.Serializer):
    """Struct describing the data sent back to the user after a chat interaction."""
    
    response = serializers.CharField()
    session_id = serializers.IntegerField()
    citations = serializers.ListField(child=serializers.DictField())


class SystemPromptSerializer(serializers.ModelSerializer):
    """Handles CRUD and activation for Bot Personas."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SystemPrompt
        fields = ['id', 'user', 'name', 'content', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

