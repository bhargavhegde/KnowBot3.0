"""
Celery Background Tasks for KnowBot.

This file handles ASYNCHRONOUS processing.
Certain operations (like converting a 50MB PDF into math vectors) take too 
long to do during a normal web request. We offload these to "Celery Workers".

KEY TASKS:
1. `index_document_task`: The bread-and-butter of the RAG pipeline.
   Runs after an upload to handle the heavy lifting of chunking/embedding.
2. `reindex_all_documents_task`: Maintenance task to rebuild the index.
3. `cleanup_orphaned_files_task`: Housekeeping to keep the disk clean.
"""

from celery import shared_task
from django.utils import timezone
from pathlib import Path

from .models import Document
from rag.service import DocumentProcessor, VectorStoreManager


@shared_task(bind=True, max_retries=3)
def index_document_task(self, document_id: int):
    """
    Main Indexing Task.
    Workflow: Load File -> Chunk Text -> Embed in ChromaDB -> Mark SUCCESS.
    
    This runs in a separate process/container (`knowbot-celery`).
    """
    try:
        document = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        return {'error': f'Document {document_id} not found'}
    
    # Get user ID for isolation (Ensures User A's task doesn't save to User B's folder)
    user_id = document.user_id
    
    # Update status so the frontend knows we've started
    document.index_status = Document.IndexStatus.PROCESSING
    document.save()
    
    try:
        # 1. Load and slice document into small chunks (800 chars)
        processor = DocumentProcessor()
        chunks = processor.load_single_document(
            document.file_path, 
            user_id=user_id,
            original_filename=document.original_filename
        )
        
        # 2. Save math vectors to ChromaDB
        manager = VectorStoreManager(user_id=user_id)
        manager.create_vector_store(chunks)
        
        # 3. Mark complete
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
        # If something breaks (e.g. Ollama is down), record the error and retry
        document.index_status = Document.IndexStatus.FAILED
        document.error_message = str(e)
        document.save()
        
        # Automatically try again up to 3 times
        raise self.retry(exc=e, countdown=60)


@shared_task(bind=True)
def reindex_all_documents_task(self):
    """
    Maintenance task to rebuild the entire knowledge base.
    Useful if switching embedding models or fixing corrupted indices.
    """
    from django.conf import settings
    
    try:
        # Load all documents from disk
        processor = DocumentProcessor()
        all_chunks = processor.load_all_documents()
        
        if not all_chunks:
            return {'message': 'No documents to index'}
        
        # Bulk-create new vector store
        manager = VectorStoreManager()
        manager.create_vector_store(all_chunks)
        
        # Update Postgres records in bulk
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
    Housekeeping: Deletes physical files on disk that no longer have a database record.
    Prevents the server from running out of storage.
    """
    from django.conf import settings
    
    data_dir = Path(settings.DATA_DIR)
    if not data_dir.exists():
        return {'message': 'Data directory does not exist'}
    
    # Get all active filenames from Postgres
    db_filenames = set(Document.objects.values_list('filename', flat=True))
    
    # Scan disk and delete any file not found in Postgres
    removed = []
    for file_path in data_dir.iterdir():
        if file_path.is_file() and file_path.name not in db_filenames:
            file_path.unlink()
            removed.append(file_path.name)
    
    return {
        'removed_files': removed,
        'count': len(removed)
    }
