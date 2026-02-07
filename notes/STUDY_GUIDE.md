# Technical Interview Study Guide: KnowBot 3.0

This guide is designed to help you "walk the walk" of a Senior Engineer. It breaks down your project not just line-by-line, but by **Design Decisions**.

Open these files in order. Look for the `ARCHITECTURAL NOTE` comments I added.

## 1. The Foundation: Data Models
**File:** `backend/api/models.py`
**Concept:** "Hybrid Storage Pattern"

*   **What to say:** "I chose a hybrid storage approach. The relational database (Postgres) is the source of truth for metadata and ownership, while the vector database (Chroma) is a specialized index for semantic search. I link them via the file path."
*   **Key Detail:** Point out the `index_status` State Machine (`PENDING` -> `PROCESSING` -> `INDEXED`). This is how you handle eventual consistency.

## 2. The API Layer: Orchestration
**File:** `backend/api/views.py`
**Concept:** "Async Request-Reply Pattern"

*   **What to say:** "The API is thin. It validates the request and immediately offloads the heavy lifting (chunking PDFs) to a background worker. It returns a `201 Accepted` instantly so the UI doesn't freeze."
*   **Key Detail:** Show the `upload` method where `.delay()` is called. This is the handoff point between the web server and the worker.

## 3. The Brain: RAG Service
**File:** `backend/rag/service.py`
**Concept:** "Context Window Optimization"

*   **What to say:** "The biggest constraint in RAG is the LLM's context window. My `DocumentProcessor` splits files into 800-character chunks with overlap. This ensures I retrieve precise information without feeding the model 50 pages of noise."
*   **Key Detail:** Explain the `Singleton Pattern` for the Chroma Client. "Embedded databases like SQLite file locks will crash if you open a connection per request. I used a Singleton to share one connection across threads."

## 4. The Intelligence: Hybrid Search
**File:** `backend/rag/hybrid_search.py`
**Concept:** "Reciprocal Rank Fusion (RRF)"

*   **What to say:** "Vector search is great for concepts, but terrible for specific acronyms or part numbers. I implemented a Hybrid Retriever that runs BM25 (Keyword) and Vector Search in parallel, then merges them using RRF to get the best of both worlds."

## 5. The Engine Room: Async Tasks
**File:** `backend/api/tasks.py`
**Concept:** "Distributed Systems & Resilience"

*   **What to say:** "I use Celery to manage background jobs. I configured `max_retries=3` because LLM APIs are flaky. If OpenAI times out, the task automatically backs off and retries without the user noticing."

---

## Bonus: System Design Topics
If they ask "How would you scale this to 100k users?", use the **Ephemeral Storage** notes in `notes/talking_points.md`.
*   Move files to S3.
*   Move ChromaDB to a managed service (Pinecone).
*   Add more Celery workers.
