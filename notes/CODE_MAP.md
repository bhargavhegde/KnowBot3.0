# 🗺️ KnowBot 3.0 Code Navigation Map

This is your **interview cheat sheet** for navigating the codebase. Every important feature is mapped to specific files and line numbers.

---

## 🎯 Quick Reference: "Show Me Where You..."

### **...Handle User Authentication**
- **File**: [`backend/api/views.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/api/views.py)
  - **Registration**: Lines 38-45 (`RegisterView`)
  - **User Profile**: Lines 47-55 (`get_user_profile`)
- **Frontend Auth Context**: [`frontend/src/context/AuthContext.tsx`](file:///home/bhargav/Desktop/Knowbot3.0/frontend/src/context/AuthContext.tsx)
  - **Login/Logout Logic**: Full file
  - **JWT Token Management**: Uses `localStorage` and axios interceptors

### **...Upload and Process Documents**
- **File**: [`backend/api/views.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/api/views.py)
  - **Upload Endpoint**: Lines 74-140 (`DocumentViewSet.upload`)
    - Saves file to disk
    - Creates database record
    - Attempts async indexing via Celery
    - Falls back to sync processing if Celery is unavailable
  - **Processing Logic**: Lines 110-139 (Graceful degradation pattern)

### **...Delete All Documents** ⭐
- **File**: [`backend/api/views.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/api/views.py)
  - **Reset Knowledge Endpoint**: Lines 168-192 (`DocumentViewSet.reset_knowledge`)
    - Deletes all user documents from Postgres
    - Deletes vectors from ChromaDB
    - Deletes physical files from disk
    - Clears BM25 index

### **...Delete a Single Document**
- **File**: [`backend/api/views.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/api/views.py)
  - **Custom Delete**: Lines 194-217 (`DocumentViewSet.destroy`)
    - Removes from vector store
    - Deletes physical file
    - Deletes database record

### **...Perform RAG Query (The Brain)**
- **File**: [`backend/rag/service.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/rag/service.py)
  - **Main Query Method**: Lines 549-661 (`RAGEngine.query`)
    - **Step 1 (Lines 565-589)**: Semantic search with confidence scoring
    - **Step 2 (Lines 596-606)**: Citation extraction
    - **Step 3 (Lines 608-648)**: LLM generation with context
  - **Fallback to General Chat**: Lines 662-700 (`RAGEngine.general_query`)
  - **Web Search Integration**: Lines 702-796 (`RAGEngine.web_search_query`)

### **...Generate Embeddings (Text → Vectors)**
- **File**: [`backend/rag/service.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/rag/service.py)
  - **Vector Store Creation**: Lines 300-334 (`VectorStoreManager.create_vector_store`)
    - Tags chunks with `user_id` (Line 301)
    - Sends to embedding model (Lines 303-309)
    - Updates BM25 index for hybrid search (Lines 312-315)

### **...Implement Hybrid Search (RRF)**
- **File**: [`backend/rag/hybrid_search.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/rag/hybrid_search.py)
  - **RRF Algorithm**: Lines 141-173 (`HybridRetriever._reciprocal_rank_fusion`)
    - Formula implementation at Lines 158-168
  - **BM25 Index**: Lines 53-120 (`BM25Index` class)
  - **Hybrid Retriever**: Lines 123-202 (`HybridRetriever`)

### **...Chunk Documents (Context Window Management)**
- **File**: [`backend/rag/service.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/rag/service.py)
  - **Document Processor**: Lines 106-260 (`DocumentProcessor`)
  - **Splitter Initialization**: Lines 115-131 (`__init__`)
    - Chunk size: 800 characters
    - Overlap: 150 characters
  - **Single Document Loading**: Lines 133-213 (`load_single_document`)

---

## 📊 Database Schema (Models)

**File**: [`backend/api/models.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/api/models.py)

### Document Model (Lines 25-72)
- **Purpose**: Tracks uploaded files and their indexing status
- **Key Fields**:
  - `index_status`: PENDING → PROCESSING → INDEXED|FAILED
  - `file_path`: Absolute path to raw file
  - `chunk_count`: Number of vectors generated

### ChatSession Model (Lines 75-95)
- **Purpose**: Container for conversations
- **Key Fields**:
  - `title`: Auto-generated from first message
  - `user`: ForeignKey for isolation

### ChatMessage Model (Lines 98-128)
- **Purpose**: Individual Q&A exchanges
- **Key Fields**:
  - `role`: USER | ASSISTANT | SYSTEM
  - `citations`: JSON blob with source references
  - `session`: ForeignKey to ChatSession

---

## 🔄 Background Tasks (Celery)

**File**: [`backend/api/tasks.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/api/tasks.py)

### Main Indexing Task
- **Function**: `index_document_task` (Full file)
- **What it does**:
  1. Loads document from disk
  2. Chunks into 800-character pieces
  3. Generates embeddings
  4. Stores in ChromaDB
  5. Updates database status

### Graceful Degradation
- **Logic**: [`backend/api/views.py:110-139`](file:///home/bhargav/Desktop/Knowbot3.0/backend/api/views.py#L110-L139)
  - Try Celery first
  - Catch exception if worker is down
  - Fall back to synchronous processing

---

## 🎨 Frontend Components

**Directory**: [`frontend/src/components/`](file:///home/bhargav/Desktop/Knowbot3.0/frontend/src/components/)

### ChatContainer.tsx
- **Main chat interface**
- Handles message submission
- Displays thinking animations
- Manages session switching

### Sidebar.tsx
- **Document list**
- **Session history**
- Upload button
- Delete all button (Lines vary - use F12 to jump)

### MessageBubble.tsx
- **Individual message rendering**
- Citation display
- Text-to-speech integration
- Markdown rendering with syntax highlighting

### BrainHologram.tsx / BrainLoader.tsx
- **Animated UI elements**
- 3D effects and glassmorphism
- Loading states

---

## 🌐 API Endpoints

**File**: [`backend/api/urls.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/api/urls.py)

### ViewSet Routes (Lines 21-30)
- `/documents/` - CRUD for documents
- `/sessions/` - Chat session management

### Function-Based Routes (Lines 35-43)
- `/chat/` - Main intelligence endpoint
- `/suggestions/` - Initial question generation
- `/preview/<pk>/` - Secure document preview
- `/health/` - Health check

---

## 🔧 Configuration

### Django Settings
**File**: [`backend/knowbot/settings.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/knowbot/settings.py)

- **Database Config**: Lines 86-95 (PostgreSQL)
- **JWT Settings**: Lines 139-150
- **CORS**: Lines 154-167
- **Celery/Redis**: Lines 170-177
- **AI Models**: Lines 182-195
  - LLM Provider (Groq/Ollama)
  - Embedding Provider
  - Model names

### Environment Variables
**Critical Variables**:
- `GROQ_API_KEY` - For LLM inference
- `TAVILY_API_KEY` - For web search
- `POSTGRES_HOST` - Database connection
- `CELERY_BROKER_URL` - Redis connection

---

## 🛡️ Security & Isolation

### User Filtering (Multi-tenancy)
**Every query includes user isolation:**

1. **Vector Search**: [`backend/rag/service.py:467-475`](file:///home/bhargav/Desktop/Knowbot3.0/backend/rag/service.py#L467-L475)
   ```python
   vector_retriever = vector_store.as_retriever(
       search_kwargs={
           "k": k,
           "filter": {"user_id": str(self.user_id)}
       }
   )
   ```

2. **Database Queries**: All ViewSets use `get_queryset` with:
   ```python
   return Model.objects.filter(user=self.request.user)
   ```

### File Access Control
- **Preview Endpoint**: [`backend/api/views.py:388-405`](file:///home/bhargav/Desktop/Knowbot3.0/backend/api/views.py#L388-L405)
  - Checks ownership before serving file
  - Returns 404 if user doesn't own document

---

## 🧪 Management Commands

### Fix Citations (Data Integrity)
**File**: [`backend/api/management/commands/fix_citations.py`](file:///home/bhargav/Desktop/Knowbot3.0/backend/api/management/commands/fix_citations.py)

- **Purpose**: Audits and repairs the knowledge base
- **What it does**:
  - Finds "ghost" documents (in DB but file missing)
  - Deletes orphaned vectors from ChromaDB
  - Cleans up database records
- **Run with**: `python manage.py fix_citations`

---

## 📝 Interview Answers - Quick Lookup

### "How do you handle concurrent users?"
**Answer**: Singleton pattern for ChromaDB client
**Code**: [`backend/rag/service.py:85-103`](file:///home/bhargav/Desktop/Knowbot3.0/backend/rag/service.py#L85-L103) (`get_chroma_client`)

### "What happens if the vector database crashes?"
**Answer**: Health check with graceful degradation
**Code**: [`backend/rag/service.py:361-386`](file:///home/bhargav/Desktop/Knowbot3.0/backend/rag/service.py#L361-L386) (`load_vector_store`)

### "How do you prevent data leakage between users?"
**Answer**: Metadata filtering on `user_id`
**Code**: 
- Tagging: [`backend/rag/service.py:297-301`](file:///home/bhargav/Desktop/Knowbot3.0/backend/rag/service.py#L297-L301)
- Filtering: [`backend/rag/service.py:467-475`](file:///home/bhargav/Desktop/Knowbot3.0/backend/rag/service.py#L467-L475)

### "Why Reciprocal Rank Fusion?"
**Answer**: Normalizes incompatible score ranges (vector vs BM25)
**Code**: [`backend/rag/hybrid_search.py:141-173`](file:///home/bhargav/Desktop/Knowbot3.0/backend/rag/hybrid_search.py#L141-L173)
**Formula**: Line 150 - `rrf_score += weight / (rrf_k + rank)`

### "How does async processing work?"
**Answer**: Celery task with synchronous fallback
**Code**: [`backend/api/views.py:110-139`](file:///home/bhargav/Desktop/Knowbot3.0/backend/api/views.py#L110-L139)

---

## 🎯 Critical Functions Summary

| Feature | File | Function/Class | Lines |
|---------|------|----------------|-------|
| **Main Chat** | `api/views.py` | `chat()` | 262-372 |
| **RAG Query** | `rag/service.py` | `RAGEngine.query()` | 549-661 |
| **Upload** | `api/views.py` | `DocumentViewSet.upload()` | 74-140 |
| **Delete All** | `api/views.py` | `DocumentViewSet.reset_knowledge()` | 168-192 |
| **Vector Creation** | `rag/service.py` | `VectorStoreManager.create_vector_store()` | 300-334 |
| **RRF Fusion** | `rag/hybrid_search.py` | `HybridRetriever._reciprocal_rank_fusion()` | 141-173 |
| **Document Chunking** | `rag/service.py` | `DocumentProcessor.load_single_document()` | 133-213 |
| **Async Task** | `api/tasks.py` | `index_document_task()` | Full file |
