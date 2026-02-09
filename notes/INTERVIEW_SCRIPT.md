# 🎬 KnowBot Interview Presentation Script

> **Total Time**: 90 minutes (1.5 hours)  
> **Format**: First 45 min = Code Deep Dive | Last 45 min = System Design Discussion  
> **Goal**: Demonstrate full-stack understanding, architectural thinking, and ownership mindset

---

## 🎯 Pre-Interview Checklist (15 min before)

### Terminal Setup
```bash
# Terminal 1: Knowbot (Streamlit - original)
cd ~/Desktop/Knowbot
source rag_env/bin/activate

# Terminal 2: VS Code with Knowbot3.0
code ~/Desktop/Knowbot3.0

# Browser Tabs Ready:
# 1. https://knowbot-gamma.vercel.app (Live 3.0)
# 2. https://railway.app/dashboard (Backend logs)
# 3. https://groq.com/console (API logs)
# 4. https://tavily.com/dashboard (Web search logs)
```

### VS Code Ready
- Open these files in tabs:
  - `backend/rag/service.py`
  - `backend/api/views.py`
  - `backend/api/models.py`
  - `backend/rag/hybrid_search.py`
  - `notes/CODE_MAP.md` (for quick reference)

---

# PART 1: THE EVOLUTION STORY (5 minutes)

## [0:00 - 1:00] Opening Hook

**SAY**: 
> "I built KnowBot as a personal project to solve a real problem—I was drowning in research papers and documentation. What started as a weekend Streamlit app has evolved into a production-grade RAG platform. Let me show you the journey."

**DO**: Show the three folders on Desktop
```
~/Desktop/Knowbot    → Version 1 (Streamlit)
~/Desktop/Knowbot2.0 → Version 2 (Docker Migration)
~/Desktop/Knowbot3.0 → Version 3 (Cloud Production)
```

---

## [1:00 - 3:00] Quick Streamlit Demo

**DO**: 
1. Open terminal in `~/Desktop/Knowbot`
2. Run: `streamlit run app.py`
3. Show the UI briefly (30 seconds max)

**SAY**:
> "This was version 1—simple Streamlit frontend, local Ollama for LLM, everything running on my laptop. It worked great for me personally, but it had problems:"

**POINT OUT** (don't dwell, just mention):
- Single user only (Line 30-31 in `app.py` - session state is local)
- No authentication
- No cloud deployment possible
- Blocking operations (UI freezes during indexing)

**SAY**:
> "For this interview, I decided to turn this into something that could actually be a product. Let me show you where it is now."

---

## [3:00 - 5:00] Jump to Live Production

**DO**: 
1. Stop Streamlit (`Ctrl+C`)
2. Open browser: https://knowbot-gamma.vercel.app
3. Show login screen → Login with demo account
4. Upload a quick document (have a small PDF ready)
5. Ask a question, show citation

**SAY**:
> "This is KnowBot 3.0—running on Vercel and Railway. Multi-user auth, JWT tokens, PostgreSQL for metadata, ChromaDB for vectors, and Groq's Llama 3 70B for inference. Sub-second responses in production."

**KEY ARCHITECTURE MENTION**:
> "The key architectural decision was splitting the monolith. Frontend is static on Vercel. Backend is a Django API container on Railway. The database and file storage are also on Railway. This separation allows independent scaling."

---

# PART 2: DEEP DIVE - THE RAG BRAIN (20 minutes)

## [5:00 - 10:00] The Core Engine (`service.py`)

### Opening the File

**DO**: 
1. Switch to VS Code
2. Open `backend/rag/service.py`
3. Use `Ctrl+G` to go to line 1

**SAY**:
> "This is the heart of the application—about 900 lines that handle the entire RAG pipeline. Let me walk you through the architecture."

### Show the File Header (Lines 1-30)

**SAY**:
> "I organized this into three main classes that map to the RAG lifecycle..."

**POINT TO each class in the outline** (use `Ctrl+Shift+O` to show symbols):
1. `DocumentProcessor` → "Handles **Ingestion**: Takes raw files and breaks them into chunks"
2. `VectorStoreManager` → "Handles **Storage**: Converts chunks to vectors and manages ChromaDB"
3. `RAGEngine` → "Handles **Retrieval & Generation**: The actual query processing"

---

### [DEMO] Tracing a Variable with Shortcuts

**SAY**:
> "Let me show you how the data flows. When a document is uploaded, it goes through this pipeline..."

**DO** (SHORTCUT DEMO - this is where you show off):

1. Go to `DocumentProcessor.__init__` (Line 115)
   - **Press**: `Ctrl+G`, type `115`
   
2. Hover over `CHUNK_SIZE`
   - **SAY**: "This is a constant, let me jump to its definition..."
   - **Press**: `F12` on `CHUNK_SIZE`
   - **RESULT**: Jumps to Line 66 where it's defined as `800`
   
3. **SAY**: 
   > "800 characters per chunk—this is tuned for Llama 3's context window. Too small and you lose semantic meaning. Too large and you overflow the context."

4. **Press**: `Alt + ←` to go back

5. Now trace `RecursiveCharacterTextSplitter`:
   - **Press**: `F12` on `RecursiveCharacterTextSplitter`
   - **SAY**: "This takes us into LangChain's library..."
   - **Show** the class briefly
   - **SAY**: 
   > "The 'Recursive' part is key—it tries to split on paragraphs first, then sentences, then words. This preserves semantic boundaries better than a naive fixed-length split."

6. **Press**: `Alt + ←` to go back

---

### [10:00 - 15:00] The Query Method - The Heart of RAG

**DO**: 
1. **Press**: `Ctrl+G`, type `549` (start of `RAGEngine.query`)
2. Collapse all methods except `query` using `Ctrl+Shift+[`

**SAY**:
> "This is the main intelligence method—about 100 lines that orchestrate the entire response generation."

**WALK THROUGH THE PHASES**:

#### Phase 1: Retrieval (Lines 565-589)
**SAY**:
> "First, we do semantic search. Notice the `filter` parameter—this ensures User A never sees User B's documents."

**POINT TO Line 575**:
```python
search_kwargs["filter"] = {"user_id": str(self.user_id)}
```

**SAY**:
> "This is the core of our multi-tenancy. Every vector is tagged with a user ID, and every query filters by it. No joins, no complex ACLs—just metadata filtering."

#### Phase 2: Confidence Check (Lines 580-590)
**SAY**:
> "Here's something I'm proud of—confidence scoring."

**POINT TO Line 582**:
```python
if not docs_with_scores or best_score > 1.2:
```

**SAY**:
> "L2 distance of 1.2 is my threshold. If the best match is worse than that, the system doesn't hallucinate—it suggests a web search instead. The LLM never sees weak context."

**INTERVIEWER QUESTION PREP**:
If asked "Why 1.2?":
> "I tuned this empirically. 0.0 is a perfect match. 0.5-0.8 is good relevance. Above 1.0 you start getting 'filler' chunks. 1.2 is where I saw hallucination risk increase."

#### Phase 3: Citation Extraction (Lines 596-606)
**TRACE THE VARIABLE** (Shortcut Demo):

1. **Highlight** `citations` on Line 597
2. **Press**: `Ctrl+D` to select all occurrences
3. **SAY**: 
   > "Watch how I trace this variable through the method..."
4. **Show** each occurrence highlighted

**SAY**:
> "We build citations from retrieved documents before generation. This way, even if we modify how the LLM responds, we always have ground-truth sources."

---

### [15:00 - 20:00] Hybrid Search (RRF Deep Dive)

**DO**: 
1. Open `backend/rag/hybrid_search.py`
2. **Press**: `Ctrl+G`, type `141`

**SAY**:
> "Vector search is great for meaning, but terrible for exact keywords. So I implemented hybrid search using Reciprocal Rank Fusion."

**SHOW THE FORMULA** (Lines 150-168):

**SAY**:
> "RRF is elegant because it's parameter-free for score normalization. BM25 scores can be 0 to infinity. Vector scores are 0 to 1. Instead of trying to normalize these, RRF only looks at **rank position**."

**POINT TO Line 158**:
```python
rrf_scores[doc_id] += self.semantic_weight / (self.rrf_k + rank)
```

**SAY**:
> "The formula: `weight / (k + rank)`. The constant `k=60` is industry standard—it prevents top results from dominating. I weight semantic at 60%, BM25 at 40% because semantic usually has better recall."

**INTERVIEWER QUESTION PREP**:
If asked "Why not 50/50?":
> "I tested this empirically. 60/40 gave me the best F1 score on my test queries. Semantic search catches paraphrases better, but BM25 is essential for exact terms like product IDs or acronyms."

---

### [20:00 - 25:00] Database Architecture

**DO**: Open `backend/api/models.py`

**SAY**:
> "Let me show you how I handle the 'Dual Brain' architecture—PostgreSQL for metadata, ChromaDB for vectors."

**SHOW Document Model (Lines 25-72)**

**POINT TO `index_status`**:
```python
class IndexStatus(models.TextChoices):
    PENDING = 'pending'
    PROCESSING = 'processing'
    INDEXED = 'indexed'
    FAILED = 'failed'
```

**SAY**:
> "This is a state machine for the RAG pipeline. When a file is uploaded, it's PENDING. When Celery picks it up, it's PROCESSING. Success means INDEXED. Any error gets captured in `error_message` and status becomes FAILED."

**TRACE the user ForeignKey**:

1. **Click** on `user = models.ForeignKey(...)` 
2. **SAY**: 
   > "Every model has this ForeignKey. Combined with `on_delete=CASCADE`, if a user deletes their account, Postgres automatically wipes their documents. But ChromaDB doesn't know about this..."

3. **SAY**:
   > "That's why I built a custom `delete()` method that syncs the deletion to the vector store."

**DO**: 
1. Open `backend/api/views.py`
2. **Press**: `Ctrl+G`, go to Line 194 (`destroy` method)

**SHOW the orchestration**:
```python
# 1. Delete from vector store
manager.delete_from_vector_store(document.file_path)

# 2. Delete physical file
Path(document.file_path).unlink()

# 3. Delete database record
document.delete()
```

**SAY**:
> "The order matters. If step 3 fails, we've already cleaned the vector store. I accept that risk because orphaned vectors are worse than orphaned metadata—metadata is easy to audit."

---

# PART 3: PRODUCTION ENGINEERING (15 minutes)

## [25:00 - 30:00] Async Processing & Graceful Degradation

**DO**: 
1. Stay in `views.py`
2. **Press**: `Ctrl+G`, go to Line 110

**SAY**:
> "Here's a pattern I'm proud of—graceful degradation for async tasks."

**SHOW the try/except**:
```python
try:
    from .tasks import index_document_task
    index_document_task.delay(document.id)
except Exception as e:
    # Fallback to synchronous processing
    ...
```

**SAY**:
> "I TRY to use Celery for background indexing. But if the worker isn't running—maybe Redis is down, or we're on a minimal deployment—it catches the exception and processes synchronously."

**KEY POINT**:
> "The app is 'Zero Config'. It works on a $5/month Railway deployment without any async infrastructure. But it's READY to scale—just spin up a Celery worker and it automatically starts using it."

---

## [30:00 - 35:00] Show External Dashboards

**DO**: Switch to browser

### Railway Dashboard
1. Open https://railway.app
2. Show the deployment
3. **SAY**: "Here's the backend container. You can see the build logs..."
4. Click into logs, show a recent request

### Groq Console
1. Open https://groq.com/console
2. Show API usage
3. **SAY**: "Groq gives us sub-second inference with Llama 3 70B. Look at these latencies—200-400ms for a full response. That's the LPU advantage."

### (Optional) Tavily Dashboard
1. Open https://tavily.com
2. **SAY**: "When RAG confidence is low, we fall back to web search via Tavily. This is the 'escape hatch' that prevents hallucination."

---

## [35:00 - 40:00] Security & Multi-tenancy

**DO**: Go back to VS Code

**OPEN**: `backend/rag/service.py`, Line 484

**SAY**:
> "Let me show you how I guarantee data isolation..."

**POINT TO the metadata filter**:
```python
vector_retriever = vector_store.as_retriever(
    search_kwargs={
        "k": k,
        "filter": {"user_id": str(self.user_id)}
    }
)
```

**SAY**:
> "This filter is the security boundary. Even if someone crafts a malicious query, ChromaDB will only return vectors tagged with their user ID."

**THEN SHOW** the tagging (Line 309):
```python
chunk.metadata['user_id'] = str(self.user_id)
```

**SAY**:
> "Every chunk is stamped at ingestion time. The filter at query time is just the enforcement layer."

---

## [40:00 - 45:00] What's Left for Production

**SAY**:
> "I mentioned this is 2-3 steps from production-grade. Let me be specific about what's missing..."

### Gap 1: Persistent File Storage
> "Right now, uploaded files live on Railway's ephemeral filesystem. On redeploy, they're wiped. The fix is AWS S3 or Cloudflare R2—about a day of work."

### Gap 2: CI/CD Pipeline
> "I'm pushing directly to main. A proper setup would have GitHub Actions running tests, linting, and staged deployments."

### Gap 3: Monitoring & Observability
> "I have basic logging, but no structured observability. I'd add Sentry for error tracking and OpenTelemetry for distributed tracing."

**SAY**:
> "These are gaps I KNOW about. That's the key—understanding what's missing and why I deferred it for an MVP."

---

# PART 4: SYSTEM DESIGN DISCUSSION PREP (45 minutes)

*At this point, the interviewer will likely take over with questions. Be ready for:*

## Scaling to 100x Users

### Anticipated Questions:

**Q: "How would you scale this to 100,000 users?"**

**ANSWER FRAMEWORK**:

1. **Database**: 
   > "PostgreSQL handles metadata well, but I'd add read replicas for the sessions/messages tables which see high read volume."

2. **Vector Store**: 
   > "ChromaDB is embedded right now. At scale, I'd migrate to Pinecone or Weaviate with proper sharding by user_id. Or I'd self-host Chroma Server with horizontal partitioning."

3. **Compute**: 
   > "The RAG queries are CPU-bound waiting on LLM. I'd move to a serverless function pattern—each query in its own container instance with auto-scaling."

4. **Caching**: 
   > "I'd add Redis caching for frequent queries. RAG responses are deterministic given the same context—perfect for caching."

---

## RAG Strategy Questions

**Q: "How do you handle documents that are constantly updated?"**

**ANSWER**:
> "Right now I do full re-indexing. For production, I'd implement incremental indexing—detect changed sections, delete old vectors for those sections, and add new ones. The `file_path` metadata makes this surgical."

**Q: "How do you ensure answer quality?"**

**ANSWER**:
> "Three layers: 
> 1. **Retrieval quality**: Hybrid search with RRF fusion
> 2. **Context quality**: Confidence scoring rejects weak matches
> 3. **Generation quality**: Structured prompts with explicit grounding instructions

I don't have automated eval yet, but I'd add RAGAS scores for groundedness and relevance tracking."

---

## Cost/Latency/Quality Tradeoffs

**Q: "How do you balance cost vs. quality?"**

**ANSWER**:
> "Groq is my sweet spot right now—fast AND cheap. But if I needed to optimize further:
> - **Cheaper**: Use smaller models (Llama 8B instead of 70B) for simple queries, route complex ones to 70B
> - **Faster**: Pre-embed common queries, implement streaming
> - **Better**: Add re-ranking with cross-encoder models before LLM generation"

---

## Questions YOU Should Ask (shows ownership thinking)

- "What's your current document volume—thousands or millions?"
- "Are these internal enterprise docs or user-generated content?"
- "What's your latency SLA—sub-second or best-effort?"
- "Do you need real-time updates or is eventual consistency okay?"

---

# 📌 EMERGENCY CHEAT SHEET

| Topic | File | Line | Key Code |
|-------|------|------|----------|
| Main query | `service.py` | 549 | `RAGEngine.query()` |
| User isolation | `service.py` | 575 | `filter: {user_id}` |
| Confidence check | `service.py` | 582 | `best_score > 1.2` |
| RRF formula | `hybrid_search.py` | 158 | `weight / (k + rank)` |
| Async fallback | `views.py` | 110 | `try: celery / except: sync` |
| Delete cascade | `views.py` | 194 | `destroy()` method |
| Chunk size | `service.py` | 66 | `CHUNK_SIZE = 800` |

---

# ⏱️ Time Management

| Segment | Duration | Cumulative |
|---------|----------|------------|
| Evolution Story | 5 min | 0:05 |
| RAG Deep Dive | 20 min | 0:25 |
| Production Eng | 15 min | 0:40 |
| Buffer/Questions | 5 min | 0:45 |
| System Design | 45 min | 1:30 |

**If running short on time**: Skip the Hybrid Search section (RRF) and Tavily dashboard.

**If they want more depth**: Dive into `tasks.py` for Celery implementation, or `serializers.py` for API design patterns.

---

## 🎤 Closing Statement

> "KnowBot started as a weekend hack and evolved into a system I could actually deploy tomorrow for a small team. The architecture decisions—splitting compute from storage, implementing multi-tenancy from day one, building graceful degradation—these reflect how I think about building real products. It's not about the 'perfect' architecture, it's about understanding trade-offs and building for the next level of scale."
