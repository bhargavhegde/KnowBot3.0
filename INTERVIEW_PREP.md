# 🎙️ KnowBot 3.0 Interview Usage Guide

**Premise:** You are demoing "KnowBot 3.0" – a privacy-first, RAG-based Knowledge Assistant.
**Target Audience:** Radial (E-commerce/Data/AI focus).
**Goal:** Show you understand not just *how* to code, but *why* you made these choices and *how* to scale them.

---

## 🕒 Part 1: The Codebase Deep Dive (Demo Phase)

**Action:** Open VS Code. Have `docker-compose.yml` and `backend/rag/service.py` ready.

### 1. "Tell us about the Tech Stack"
*   **Frontend**: "I chose **Next.js 14** for the frontend to treat this as a modern web-app, not just a script. It handles client-side state for the chat history (`AuthContext`) and uses **Tailwind + Framer Motion** for the high-end UI you see."
*   **Backend**: "I used **Django** because in a real enterprise environment, you need an Admin panel, strict ORM, and security out of the box. Flask/FastAPI are great for microservices, but Django is better for a 'Monolith-first' approach that can be split later."
*   **The AI/RAG Engine**:
    *   **Vector DB**: "I'm using **ChromaDB** locally. It's lightweight and file-based for development. For production/scaling, I'd abstract this to use **Pinecone** or **Milvus**."
    *   **LLM Provider**: "I'm using **Ollama (Llama 3.1 8b)** locally. This demonstrates how to run *zero-cost* inference while developing. In the code, I implemented a switch (`LLM_PROVIDER`) to easily swap to OpenAI or Groq for production latency."

### 2. "Walk us through the RAG implementation"
**Action:** Open `backend/rag/service.py`.

*   **Ingestion (The "Chunking" Strategy)**:
    *   *Show Code:* Line 68 & 118 (`DocumentProcessor`).
    *   *Talk:* "I chose a **chunk size of 800 characters** with a **150-char overlap**.
    *   *Why?* "800 chars is roughly a paragraph—enough context to be Semantic, but small enough to fit 5-10 chunks in the context window. The 150 overlap prevents cutting context mid-sentence."
*   **Retrieval & Privacy (CRITICAL for Radial)**:
    *   *Show Code:* Line 464 (`vector_retriever`).
    *   *Talk:* "Data isolation is key. Every chunk in ChromaDB is tagged with a `user_id`. When we query, I force a filter: `filter={"user_id": str(self.user_id)}`. This means User A strictly cannot see User B's documents, even though they share the database."

### 3. "How do you handle async tasks / challenges?"
*   *Talk:* "I implemented an **asynchronous ingestion pipeline** using **Celery and Redis**. When a user uploads a file, it's immediately queued for background processing (`index_document_task.delay()`), preventing the UI from freezing."
*   *Resilience (The "Senior" Detail):* "I also built in a **failsafe mechanism**. If the Redis broker is unreachable, the system automatically degrades gracefully to **synchronous processing** so the user *never* experiences a failed upload, just a slightly slower one. You can see this logic in `backend/api/views.py` (Line 110)."

---

## 🚀 Part 2: System Design & Scaling (Collaborative Phase)

**Prompt:** "How would we scale this to 100x users or millions of documents?"

### 1. Scaling the Data Layer (The "Radial" Angle)
*   **Problem**: Postgres will choke on write-heavy chat logs; ChromaDB local file will lock up.
*   **Solution**:
    *   **SQL**: Move to AWS RDS. Enable **Read Replicas** for the frequent read operations (fetching chat history).
    *   **Vector Search**: Move from ChromaDB (local) to a distributed cluster like **Weaviate** or managed **Pinecone**.
    *   **Why?** "For an e-commerce context (like Radial), if we are indexing millions of product SKUs, we need a vector DB that supports **HNSW indexing on RAM** for sub-100ms retrieval."

### 2. RAG Optimization Strategies (Chunking & Retrieval)
If they ask "Retrieval is inaccurate/slow, how do you fix it?"
*   **Hybrid Search (Implemented!)**: "Vectors aren't magic. Sometimes you need exact keyword matches (e.g., 'Product ID 12345'). I implemented a Hybrid Search that combines **BM25 (Keyword)** + **Cosine Similarity (Vector)** results (Weighted 40/60)." (*Show `backend/rag/service.py` Line 475*)
*   **Re-ranking (The "Pro" Move)**: "To improve quality, I would implement a **Cross-Encoder Re-ranker** (like BGE-Reranker). We fetch 50 documents fast (cheap), then use the Re-ranker to score the top 5 accurately (slower/smart). This balances latency vs quality."

### 3. Balancing Cost, Latency, & Quality
*   **Cost**: "Embeddings are cheap; Generation is expensive. I would cache frequent queries (e.g., 'Return Policy') in Redis so we don't hit the GPU at all for repeated questions."
*   **Latency**: "I'd use **Speculative Decoding** or smaller, faster/quantized models (like Llama-3-70b-Groq) for the initial draft response."
*   **Quality**: "Implement a 'Human-in-the-loop' feedback mechanism (Thumbs up/down in UI) that saves 'Golden Samples' to fine-tune a small LoRA adapter later."

---

## 🧪 "Show us the UI"
**Action:**
1.  **Login** (Show the glassmorphism card).
2.  **Upload** 2 different files (e.g., a PDF and a text file) – demonstrate the "System Boot" loader.
3.  **Ask a question** found in File A. (Show it retrieving context).
4.  **Ask a question** found in File B.
5.  **Hover over the Bot** to show the slick animations (Attention to Detail).

**Closing Thought for Interviewer:**
"I built KnowBot 3.0 to explore the *full stack* of AI engineering—from the React animations down to the localized Vector embeddings. I deliberately chose 'Hard Mode' (Self-hosting LLMs) to understand the infrastructure challenges you likely face at Radial."
