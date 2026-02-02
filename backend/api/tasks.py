"""
Celery Tasks for KnowBot.
Handles async document processing and indexing.
"""

from celery import shared_task
from django.utils import timezone
from pathlib import Path

from .models import Document
from rag.service import DocumentProcessor, VectorStoreManager


@shared_task(bind=True, max_retries=3)
def index_document_task(self, document_id: int):
    """
    Async task to index a single document.
    
    This task:
    1. Loads and chunks the document
    2. Creates/updates the vector store for the user's collection
    3. Updates document status in database
    """
    try:
        document = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        return {'error': f'Document {document_id} not found'}
    
    # Get user ID for isolation
    user_id = document.user_id
    
    # Update status to processing
    document.index_status = Document.IndexStatus.PROCESSING
    document.save()
    
    try:
        # Load and chunk document with user context
        processor = DocumentProcessor()
        chunks = processor.load_single_document(
            document.file_path, 
            user_id=user_id,
            original_filename=document.original_filename
        )
        
        # Create/update vector store for specific user
        manager = VectorStoreManager(user_id=user_id)
        manager.create_vector_store(chunks)
        
        # Update document record
        document.index_status = Document.IndexStatus.INDEXED
        document.chunk_count = len(chunks)
        document.indexed_at = timezone.now()
        document.error_message = None
        document.save()
        
        return {
            'success': True,
            'document_id': document_id,
            'chunks': len(chunks),
            'user_id': user_id
        }
        
    except Exception as e:
        document.index_status = Document.IndexStatus.FAILED
        document.error_message = str(e)
        document.save()
        
        # Retry on failure
        raise self.retry(exc=e, countdown=60)


@shared_task(bind=True)
def reindex_all_documents_task(self):
    """
    Async task to reindex all documents.
    Useful after a document deletion or for rebuilding the vector store.
    """
    from django.conf import settings
    
    try:
        # Load all documents from data directory
        processor = DocumentProcessor()
        all_chunks = processor.load_all_documents()
        
        if not all_chunks:
            return {'message': 'No documents to index'}
        
        # Create new vector store
        manager = VectorStoreManager()
        manager.create_vector_store(all_chunks)
        
        # Update all document records
        Document.objects.filter(
            index_status__in=[Document.IndexStatus.INDEXED, Document.IndexStatus.FAILED]
        ).update(
            index_status=Document.IndexStatus.INDEXED,
            indexed_at=timezone.now(),
            error_message=None
        )
        
        return {
            'success': True,
            'total_chunks': len(all_chunks)
        }
        
    except Exception as e:
        return {'error': str(e)}


@shared_task
def cleanup_orphaned_files_task():
    """
    Cleanup task to remove files that are no longer in the database.
    """
    from django.conf import settings
    
    data_dir = Path(settings.DATA_DIR)
    if not data_dir.exists():
        return {'message': 'Data directory does not exist'}
    
    # Get all filenames from database
    db_filenames = set(Document.objects.values_list('filename', flat=True))
    
    # Check files in data directory
    removed = []
    for file_path in data_dir.iterdir():
        if file_path.is_file() and file_path.name not in db_filenames:
            file_path.unlink()
            removed.append(file_path.name)
    
    return {
        'removed_files': removed,
        'count': len(removed)
    }
