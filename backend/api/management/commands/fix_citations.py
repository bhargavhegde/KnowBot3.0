from django.core.management.base import BaseCommand
from api.models import Document
from rag.service import DocumentProcessor, VectorStoreManager
from django.utils import timezone
import os

class Command(BaseCommand):
    help = 'Re-indexes all documents to fix missing citation metadata (unknown source).'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Starting re-index process for ALL documents...'))

        # Get all documents that should be indexed
        documents = Document.objects.all()
        
        total = documents.count()
        self.stdout.write(f"Found {total} documents to process.")
        
        success_count = 0
        processor = DocumentProcessor()
        
        for i, doc in enumerate(documents, 1):
            self.stdout.write(f"[{i}/{total}] Processing: {doc.original_filename}...")
            
            if not os.path.exists(doc.file_path):
                self.stdout.write(self.style.ERROR(f"  -> File missing on disk: {doc.file_path}"))
                doc.index_status = Document.IndexStatus.FAILED
                doc.error_message = "File missing from disk during re-index"
                doc.save()
                continue
                
            try:
                # 1. Reload chunks with EXPLICIT original_filename
                chunks = processor.load_single_document(
                    doc.file_path, 
                    user_id=doc.user.id if doc.user else None,
                    original_filename=doc.original_filename  # <--- CRITICAL FIX
                )
                
                if not chunks:
                    self.stdout.write(self.style.WARNING("  -> No text extracted (empty file?)"))
                    continue

                # 2. Update Vector Store
                manager = VectorStoreManager(user_id=doc.user.id if doc.user else None)
                
                # Delete old vectors first to prevent duplicates
                manager.delete_from_vector_store(doc.file_path)
                manager.create_vector_store(chunks)
                
                # 3. Update DB Record
                doc.index_status = Document.IndexStatus.INDEXED
                doc.chunk_count = len(chunks)
                doc.indexed_at = timezone.now()
                doc.error_message = None
                doc.save()
                
                success_count += 1
                self.stdout.write(self.style.SUCCESS(f"  -> Successfully re-indexed {len(chunks)} chunks."))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  -> Failed: {str(e)}"))
                doc.index_status = Document.IndexStatus.FAILED
                doc.error_message = str(e)
                doc.save()
        
        self.stdout.write(self.style.SUCCESS(f"\nDONE! Re-indexed {success_count}/{total} documents."))
