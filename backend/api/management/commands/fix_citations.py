from django.core.management.base import BaseCommand
from api.models import Document
from rag.service import DocumentProcessor, VectorStoreManager
from django.utils import timezone
import os

class Command(BaseCommand):
    help = 'Repairs knowledge base: Fixes metadata for existing files, removes ghosts for missing files.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Starting KNOWLEDGE BASE REPAIR...'))
        
        documents = Document.objects.all()
        total = documents.count()
        self.stdout.write(f"Found {total} documents.")
        
        processor = DocumentProcessor()
        
        fixed_count = 0
        deleted_count = 0
        
        for i, doc in enumerate(documents, 1):
            self.stdout.write(f"[{i}/{total}] Checking: {doc.original_filename}...")
            
            # Setup Vector Manager for this user
            manager = VectorStoreManager(user_id=doc.user.id if doc.user else None)
            
            if not os.path.exists(doc.file_path):
                # CASE 1: Ghost Document (File lost due to Ephemeral Storage)
                self.stdout.write(self.style.ERROR(f"  -> Physical file missing! Checking for ghost vectors..."))
                
                # Prune dead vectors
                try:
                    manager.delete_from_vector_store(doc.file_path)
                    self.stdout.write(self.style.WARNING("  -> Removed ghost vectors."))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  -> Error removing vectors: {e}"))
                
                # Remove DB record
                doc.delete()
                deleted_count += 1
                self.stdout.write(self.style.WARNING("  -> Deleted database record."))
                continue
                
            try:
                # CASE 2: Existing Document (Fix Metadata "Unknown" Issue)
                
                # Reload chunks with EXPLICIT original_filename
                chunks = processor.load_single_document(
                    doc.file_path, 
                    user_id=doc.user.id if doc.user else None,
                    original_filename=doc.original_filename
                )
                
                if not chunks:
                    self.stdout.write(self.style.WARNING("  -> No text extracted (empty file?)"))
                    continue

                # Clean old vectors (by file path)
                manager.delete_from_vector_store(doc.file_path)
                # Re-add fresh vectors with correct metadata
                manager.create_vector_store(chunks)
                
                # Update DB
                doc.index_status = Document.IndexStatus.INDEXED
                doc.chunk_count = len(chunks)
                doc.indexed_at = timezone.now()
                doc.error_message = None
                doc.save()
                
                fixed_count += 1
                self.stdout.write(self.style.SUCCESS(f"  -> FIXED: Re-indexed {len(chunks)} chunks."))
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  -> Failed: {str(e)}"))
                doc.index_status = Document.IndexStatus.FAILED
                doc.error_message = str(e)
                doc.save()
        
        self.stdout.write(self.style.SUCCESS(f"\nREPAIR COMPLETE."))
        self.stdout.write(f"Fixed/Re-indexed: {fixed_count}")
        self.stdout.write(f"Deleted (Ghosts): {deleted_count}")
