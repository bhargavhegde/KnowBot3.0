from django.contrib import admin
from .models import Document, ChatSession, ChatMessage, SystemPrompt


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['original_filename', 'user', 'file_type', 'index_status', 'chunk_count', 'uploaded_at']
    list_filter = ['index_status', 'file_type', 'user']
    search_fields = ['original_filename', 'filename', 'user__username']
    readonly_fields = ['filename', 'file_path', 'indexed_at']


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title', 'created_at', 'updated_at']
    list_filter = ['user']
    search_fields = ['title', 'user__username']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'role', 'short_content', 'created_at']
    list_filter = ['role', 'session__user', 'session']
    search_fields = ['content', 'session__user__username']
    
    def short_content(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    short_content.short_description = 'Content'


@admin.register(SystemPrompt)
class SystemPromptAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'user']
