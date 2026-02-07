# 🎓 MASTER INTERVIEW GUIDE: KnowBot 3.0
**Target:** Radial (E-commerce/Data/AI).
**Goal:** Prove you are a Senior Engineer who understands *Architecture*, *Trade-offs*, and *Scale*.

---

## 🟢 PHASE 1: THE DEMO (5 Minutes)
**Objective:** Show a working, polished product.

### 1. The Script
1.  **Open the App**: Login and show the "Cinematic" UI (Glassmorphism, 3D buttons).
    *   *Say:* "I built the frontend with Next.js 14 and Framer Motion because I treat internal tools with the same UX standard as consumer apps."
2.  **Upload a File**: Upload a PDF (e.g., a spec sheet).
    *   *Say:* "Watch the 'Status' indicator. It goes from 'Pending' to 'Indexed'. This isn't just a UI toggle—it's tracking a background Celery task."
3.  **Ask a Question**: Ask something specific from the PDF.
    *   *Say:* "The bot retrieved the exact paragraph. Notice the citation—that's metadata preservation in action."

---

## 🟡 PHASE 2: CODE WALKTHROUGH (20 Minutes)
**Objective:** Explain *Why* you wrote the code, not just *What* it does.
**Action:** Open these files in VS Code in this exact order.

### 1. Data Models (`backend/api/models.py`)
*   **Concept:** "Hybrid Storage Pattern"
*   **Talking Point:** "I decoupled Metadata from Vector Data. Postgres stores the 'Business Logic' (Ownership, Status, Dates), while ChromaDB stores the 'Semantic Logic' (Vectors). I link them via the file path. This separation allows me to scale them independently."

### 2. The API Layer (`backend/api/views.py`)
*   **Concept:** "Async Request-Reply Pattern"
*   **Talking Point:** "The `upload` endpoint is non-blocking. It validates the file and immediately returns `201 Accepted` while dispatching a Celery task (`.delay()`). This ensures the API never times out on large files."

### 3. The Brain (`backend/rag/service.py`)
*   **Concept:** "Context Window Optimization"
*   **Talking Point:** "I split documents into **800-char chunks with 150-char overlap**.
    *   *Why 800?* It captures a full paragraph of meaning without filling the context window with noise.
    *   *Why Overlap?* To ensure we don't cut a sentence in half at the chunk boundary."
*   **Key Detail:** Point out the **Singleton Pattern** for the Chroma Client (Line 85) to prevent file-locking crashes.

### 4. Advanced Search (`backend/rag/hybrid_search.py`)
*   **Concept:** "Hybrid Retrieval (RRF)"
*   **Talking Point:** "Vector search is bad at exact matches (like IDs: 'XJ-900'). I implemented a Hybrid Retriever that runs **BM25 (Keyword)** and **Vector Search** in parallel, then merges results using Reciprocal Rank Fusion. This covers both 'Concept' questions and 'Specific Fact' questions."

### 5. Resilience (`backend/api/tasks.py`)
*   **Concept:** "Distributed Systems"
*   **Talking Point:** "I use Celery with Redis. I configured `max_retries=3` on the indexing task. If the LLM provider API blips (which happens often), the system gracefully retries instead of failing the user request."

---

## 🔴 PHASE 3: SYSTEM DESIGN & SCALING (Deep Dive)
**Objective:** Answer the "How would you scale to 1 million users?" question.

### Topic A: Storage Architecture (The "Ephermal Storage" Story)
*   **The Problem:** "In my v1 deployment on Railway, every deployment wiped the uploaded files because containers are ephemeral."
*   **The Fix:** "I re-architected the storage layer to decouple Compute from Storage."
    1.  **Blob Storage:** Move files to **AWS S3**.
    2.  **Vector Persistence:** Move vectors to **Pinecone** (Managed Service).
    3.  **Compute:** The Django container becomes stateless and can scale horizontally to infinite instances.

### Topic B: Database Scaling (Radial Context)
*   **Problem:** "Postgres will choke on write-heavy chat logs for 1M users."
*   **Solution:**
    *   **Read Replicas:** Route all `GET` requests (fetching chat history) to read-only replicas.
    *   **Sharding:** Shard the `ChatSession` table by `user_id` so no single DB node holds all the history.

### Topic C: Optimizing RAG Quality
*   **Re-ranking:** "To improve accuracy, I would add a Cross-Encoder (Re-ranker) step after retrieval. Fetch 50 candidates -> Re-rank top 5 -> Send to LLM."
*   **Caching:** "I would cache common queries (e.g., 'Return Policy') in Redis to skip the expensive LLM call entirely."

---

## 🏁 CLOSING PITCH
"I built KnowBot 3.0 to explore the full stack—from the React animations to the distributed background workers. I faced real production issues like ephemeral storage data loss and solved them by re-architecting for statelessness. I'm ready to apply these lessons at Radial."
