"""
Models for KnowBot API.

This file defines the DATABASE SCHEMA for the application.
It uses Django's ORM (Object-Relational Mapping) to translate Python classes into PostgreSQL database tables.

KEY CONCEPTS:
1. User Isolation: Every model has a `user` ForeignKey, ensuring data is siloed per user.
2. RAG Integration: The `Document` model tracks the status of files in the Vector Database (ChromaDB).
3. Chat History: `ChatSession` and `ChatMessage` store the conversation history, which is crucial for
   providing context to the LLM (though currently RAG retrieves from documents, future updates may retrieve from history).

DATABASE STRUCTURE:
- Documents: Structured metadata about files (PDFs, TXTs). The *actual vectors* are in ChromaDB, linked by `file_path`.
- ChatSessions: Containers for conversations.
- ChatMessages: Individual exchanges (User Q -> Assistant A).
- SystemPrompts: Custom personalities or instructions for the bot.
"""

from django.db import models
from django.utils import timezone
from django.conf import settings


class Document(models.Model):
    """
    Represents an uploaded document for RAG indexing.
    
    RELATIONSHIP TO RAG:
    This model stores METADATA (filename, upload time). 
    The ACTUAL CONTENT is chunked and stored in ChromaDB (Vector Store).
    
    The `index_status` field is critical—it tells the frontend and backend whether 
    the document is ready to be searched by the LLM.
    """
    
    class IndexStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'          # Uploaded, waiting for Celery task
        PROCESSING = 'processing', 'Processing' # Currently being chunked/embedded
        INDEXED = 'indexed', 'Indexed'          # Successfully stored in ChromaDB
        FAILED = 'failed', 'Failed'             # Error during processing
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents',
        null=True, blank=True,
        help_text="The owner of this document. Ensures data isolation."
    )
    filename = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=512, help_text="Absolute path to the raw file on disk.")
    file_size = models.IntegerField(default=0)
    file_type = models.CharField(max_length=50)  # pdf, txt, md
    
    index_status = models.CharField(
        max_length=20,
        choices=IndexStatus.choices,
        default=IndexStatus.PENDING,
        help_text="Current state of the document in the RAG pipeline."
    )
    chunk_count = models.IntegerField(default=0, help_text="Number of vector chunks generated from this file.")
    error_message = models.TextField(blank=True, null=True, help_text="Stores traceback if indexing fails.")
    
    uploaded_at = models.DateTimeField(default=timezone.now)
    indexed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.original_filename} ({self.index_status})"


class ChatSession(models.Model):
    """
    Represents a chat session with the RAG system.
    Acts as a container for related messages.
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions',
        null=True, blank=True
    )
    title = models.CharField(max_length=255, default="New Chat")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Session {self.id}: {self.title}"


class ChatMessage(models.Model):
    """
    Individual message in a chat session.
    
    CONTEXT WINDOW:
    While these are stored in Postgres, a limited number of recent messages 
    can be fed back into the LLM to provide "conversation memory" (simulated context).
    """
    
    class Role(models.TextChoices):
        USER = 'user', 'User'
        ASSISTANT = 'assistant', 'Assistant'
        SYSTEM = 'system', 'System'
    
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(max_length=20, choices=Role.choices)
    content = models.TextField()
    citations = models.JSONField(default=list, blank=True, help_text="List of source snippets used to generate this answer.")
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        preview = self.content[:50] + "..." if len(self.content) > 50 else self.content
        return f"{self.role}: {preview}"



