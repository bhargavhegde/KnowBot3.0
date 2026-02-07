# 🎯 Code ADAPTATIONS & DECISION SCRIPT

This file highlights the **Deviations from Standard Tutorials**. Use this script during the "Code Walkthrough" phase to prove you aren't just copy-pasting code, but *engineering* a system.

---

## 1. The Singleton Anti-Lock Mechanism (Scalability)
**File:** `backend/rag/service.py`
**Line:** ~85 (`get_chroma_client`)

**The Code:**
```python
def get_chroma_client(...):
    global _CHROMA_CLIENT
    if _CHROMA_CLIENT is None:
        # One connection to rule them all
        _CHROMA_CLIENT = chromadb.PersistentClient(...)
```

**What to Say:**
> "Most RAG tutorials initialize the DB client inside every request. I deviated from that here.
> 
> **The Problem:** ChromaDB (locally) uses SQLite. If 5 users hit the API at once, 5 threads try to acquire a file lock on `chroma.sqlite3`. This causes `OperationalError: database is locked` crashes.
> 
> **My Adaptation:** I implemented a **Singleton Pattern**. I use a global client instance that persists across requests. This forces all threads to share one connection, eliminating file contention and allowing the backend to handle concurrent users."

---

## 2. The Semantic Math: Reciprocal Rank Fusion (Algorithm)
**File:** `backend/rag/hybrid_search.py`
**Line:** ~141 (`_reciprocal_rank_fusion`)

**The Code:**
```python
def _reciprocal_rank_fusion(self, semantic_docs, bm25_results, k):
    # RRF score = sum(weight / (rrf_k + rank))
    for rank, doc in enumerate(semantic_docs, start=1):
        rrf_scores[doc_id] += self.semantic_weight / (self.rrf_k + rank)
```

**What to Say:**
> "Standard LangChain retrievers just fetch vectors. I needed accuracy for specific terms (like 'Product ID 500').
> 
> **The Problem:** Vector search returns cosine similarity (0.0 to 1.0). Keyword search (BM25) returns probabilistic scores (0 to infinity). You can't just add them: `0.85 + 15.2` makes the vector score irrelevant.
> 
> **My Adaptation:** I implemented **Reciprocal Rank Fusion (RRF)** manually. Instead of adding raw scores, I rank the results (1st, 2nd, 3rd) and score them based on *position*. This normalizes the two different algorithms into a single meaningful ranking."

---

## 3. The "Fail-Over" Upload Pipeline (Resilience)
**File:** `backend/api/views.py`
**Line:** ~110 (`upload`)

**The Code:**
```python
try:
    index_document_task.delay(document.id) # Try Celery (Async)
except Exception as e:
    # Fallback to Synchronous!
    processor = DocumentProcessor()
    # ... process immediately in this thread ...
```

**What to Say:**
> "I built this system to be resilient to infrastructure failures.
> 
> **The Problem:** If the Redis broker goes down (common in distributed systems), the Celery task queue fails. The user's upload would just error out.
> 
> **My Adaptation:** I added a `try/except` block around the async task dispatch. If Celery is unreachable, it *automatically degrades* to synchronous processing. The user experiences a slightly slower upload, but it *works*. This is 'Graceful Degradation'."

---

## 4. The "Ghost Vector" Reaper (Data Integrity)
**File:** `backend/api/management/commands/fix_citations.py`
**Line:** Whole File

**The Code:**
```python
if not os.path.exists(doc.file_path):
    manager.delete_from_vector_store(doc.file_path) # Remove ghost
    doc.delete() 
```

**What to Say:**
> "I encountered a data consistency issue where the vector database had 'Ghost Vectors'—embeddings pointing to files that were deleted from disk (due to ephemeral storage).
> 
> **The Problem:** Users were getting search results that said 'Source: Unknown' because the metadata link was broken.
> 
> **My Adaptation:** I wrote a custom Management Command that audits the database. It cross-references the SQL table with the physical disk. If a file is missing, it surgically removes the orphaned vectors from ChromaDB. This ensures 100% Citation Validity."
