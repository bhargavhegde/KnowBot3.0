# KnowBot 2.0: RAG Architecture & Data Flow Guide

This document provides a deep dive into how KnowBot stores data, manages context for the Large Language Model (LLM), maps documents to specific users, and handles context window limitations.

---

## 1. 💾 The Dual-Database Strategy

KnowBot uses a **Hybrid Database Architecture** to store your data. We separate structured metadata from unstructured vector data.

### A. PostgreSQL (The Structured Brain)
**What it stores:** User accounts, Chat Sessions, Message History, and File Metadata.
**Code Location:** `backend/api/models.py`

When you upload a file, a record is created here:
```python
# backend/api/models.py

class Document(models.Model):
    user = models.ForeignKey(User, ...)  # <-- Links document to specific user
    filename = models.CharField(...)
    file_path = models.CharField(...)    # <-- Points to raw file on disk
    index_status = models.CharField(...) # <-- Tracks if it's ready for search
```
*   **Why?** Relational databases are perfect for tracking *who* owns *what* and keeping a history of chat interactions.

### B. ChromaDB (The Vector Brain)
**What it stores:** The "meaning" of your text. It converts your text into lists of floating-point numbers (Vectors/Embeddings).
**Code Location:** `backend/rag/service.py` -> `VectorStoreManager`

*   **Embeddings**: We use `nomic-embed-text` (via Ollama) to turn text into vectors.
*   **Storage**: These vectors are stored locally in the `backend/chroma_db` folder.

---

## 2. 🧠 How the LLM Gets Context (The RAG Pipeline)

The LLM (Llama 3) does not "know" your documents permanently. We must "feed" it the relevant information just in time. This process is called **Retrieval augmented Generation (RAG)**.

### Step 1: Ingestion (Teaching the Bot)
When you upload a file, the `DocumentViewSet.upload` method creates a background task:
1.  **Loading**: The file is read from disk (`DocumentProcessor.load_single_document`).
2.  **Chunking**: The text is split into smaller pieces (e.g., 800 characters).
    *   *Why?* We can't feed a whole book to the LLM at once.
    *   **Code**: `backend/rag/service.py` -> `RecursiveCharacterTextSplitter`.
3.  **Embedding & Storing**: Each chunk is converted to a vector and saved to ChromaDB with metadata.

### Step 2: Retrieval (The "Search")
When you ask a question:
1.  **Query Embedding**: Your question (e.g., "What is the project budget?") is converted into a vector.
2.  **Semantic Search**: ChromaDB finds the top 5 chunks of text that are mathematically closest to your question's meaning.
3.  **Context Assembly**: These text chunks are glued together into a big string called `{context}`.

### Step 3: Generation (The Answer)
We wrap the context in a specific prompt and send it to Llama 3:

```text
You are a helpful assistant. Use the following context to answer the question.

Context:
[Chunk 1: The project budget is $50,000...]
[Chunk 2: The allocation for marketing is...]

Question: What is the project budget?
```
**Code:** `backend/rag/service.py` -> `RAGEngine.build_chain()`

---

## 3. 🔒 User Isolation (Data Privacy)

How do we ensure User A doesn't see User B's documents?

**Mechanism:** Metadata Filtering.
When we save a vector to ChromaDB, we stamp it with the `user_id`.

**During Storage (`VectorStoreManager.create_vector_store`):**
```python
# backend/rag/service.py

for chunk in chunks:
    chunk.metadata['user_id'] = str(self.user_id)  # <--- STAMPED
```

**During Retrieval (`RAGEngine.get_retriever`):**
When searching, we explicitly tell ChromaDB to **only** look at vectors with that matching ID.
```python
# backend/rag/service.py

vector_retriever = vector_store.as_retriever(
    search_kwargs={
        "k": k,
        "filter": {"user_id": str(self.user_id)}   # <--- FILTERED
    }
)
```
This is a hard filter. The search algorithm will simply ignore any data that doesn't belong to you.

---

## 4. 📏 The Context Window Problem

**The Problem:**
LLMs have a limited "short-term memory" (Context Window). For Llama 3, this is typically 8,192 tokens (roughly 6,000 words).
If you try to send 100 pages of text, the model will crash or "forget" the beginning.

**Our Solution:**
1.  **Chunking:** We break documents into 800-character pieces.
2.  **Selective Retrieval:** Instead of sending the *whole* document, we only send the **Top 5** most relevant chunks.
    *   5 chunks * 800 chars ≈ 4,000 chars. This fits comfortably within the 8k limit.
3.  **Overlap:** We leave 150 characters of overlap between chunks so sentences aren't cut in half.

**Visualizing the Math:**
> Your Query + System Prompt + Top 5 Chunks < Model Context Limit

---

## 5. 🗺 Codebase Map for relevant features

| Feature | File | Function/Class |
| :--- | :--- | :--- |
| **Database Model** | `backend/api/models.py` | `Document` Class |
| **Text Chunking** | `backend/rag/service.py` | `DocumentProcessor.__init__` |
| **User Filtering** | `backend/rag/service.py` | `RAGEngine.get_retriever` |
| **Prompt Construction** | `backend/rag/service.py` | `RAGEngine.build_prompt` |
| **Orchestration** | `backend/api/views.py` | `chat` view function |
