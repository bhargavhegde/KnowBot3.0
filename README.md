# KnowBot 3.0 - Production RAG Platform 🧠⚡

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://knowbot-gamma.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-purple)](https://railway.app)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**KnowBot 3.0** is a production-grade RAG (Retrieval-Augmented Generation) platform deployed on cloud infrastructure. Features multi-user authentication, hybrid search, async processing, and a stunning cybernetic UI.

> **Live Demo**: [knowbot-gamma.vercel.app](https://knowbot-gamma.vercel.app)

---

## 🚀 What's New in 3.0?

From local Streamlit to production deployment:

- **Cloud-Native Architecture**: Frontend on Vercel, Backend + DB on Railway
- **Hybrid Search (RRF)**: Combines semantic (vector) + keyword (BM25) search using Reciprocal Rank Fusion
- **Multi-User with JWT Auth**: Secure token-based authentication with data isolation
- **Async Processing**: Celery + Redis for non-blocking document indexing
- **Groq LLM Integration**: Sub-second inference with Llama 3 70B
- **Web Search Fallback**: Tavily integration when RAG confidence is low
- **Production Database**: PostgreSQL for metadata, ChromaDB for vectors
- **Confidence Scoring**: Prevents hallucination on weak document matches

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: React Context API

### Backend
- **Framework**: Django REST Framework
- **Deployment**: Railway
- **Task Queue**: Celery + Redis (with synchronous fallback)
- **Database**: PostgreSQL (metadata) + ChromaDB (vectors)

### AI/RAG Pipeline
- **LLM**: Groq (Llama 3.3 70B)
- **Embeddings**: Ollama (nomic-embed-text)
- **Vector Store**: ChromaDB (embedded)
- **Search**: Hybrid (Vector + BM25 via RRF)
- **Web Search**: Tavily API

---

## 📂 Project Structure

```
KnowBot3.0/
├── backend/
│   ├── api/                # REST endpoints
│   │   ├── views.py       # Document/chat/auth handlers
│   │   ├── models.py      # DB schema (Document, ChatSession, ChatMessage)
│   │   ├── serializers.py # Request/response validation
│   │   └── tasks.py       # Celery async tasks
│   ├── rag/
│   │   ├── service.py     # RAG engine (DocumentProcessor, VectorStoreManager, RAGEngine)
│   │   └── hybrid_search.py  # BM25 + RRF implementation
│   └── knowbot/
│       ├── settings.py    # Django config
│       └── celery.py      # Task queue config
├── frontend/
│   └── src/
│       ├── app/           # Pages (login, chat, register)
│       ├── components/    # UI components (ChatContainer, Sidebar, MessageBubble)
│       └── context/       # Auth + Chat state
└── notes/                 # Documentation
    ├── CODE_MAP.md        # File navigation guide
    ├── INTERVIEW_SCRIPT.md   # Demo presentation guide
    ├── INTERVIEW_CHEATSHEET.md  # Technical talking points
    └── DATABASE_ARCHITECTURE.md  # System design notes
```

---

## 🔧 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis (optional - for async tasks)
- Ollama (for embeddings)

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys

# Run migrations
python manage.py migrate

# Start Django server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit with backend URL

# Start dev server
npm run dev
```

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy --prod
```

### Backend (Railway)
- Connect GitHub repo to Railway
- Set environment variables (see `.env.example`)
- Deploy from `main` branch

**Environment Variables Required:**
- `GROQ_API_KEY` - LLM inference
- `TAVILY_API_KEY` - Web search
- `POSTGRES_*` - Database credentials
- `CELERY_BROKER_URL` - Redis connection (optional)

---

## 🎯 Key Features Explained

### Hybrid Search with RRF
Combines semantic (embedding-based) and keyword (BM25) search using Reciprocal Rank Fusion:
```
RRF_score = Σ(weight / (k + rank))
```
- 60% semantic weight (better for paraphrases)
- 40% BM25 weight (better for exact terms)
- `k=60` industry standard constant

### Graceful Degradation
- Tries Celery async processing first
- Falls back to synchronous if worker unavailable
- Works on minimal deployments without Redis

### Data Isolation
Every vector chunk tagged with `user_id` metadata:
```python
search_kwargs["filter"] = {"user_id": str(self.user_id)}
```
Multi-tenancy enforced at vector store level.

### Confidence Scoring
L2 distance threshold (1.2) prevents hallucination:
- `<0.8`: High relevance, proceed with RAG
- `>1.2`: Low relevance, suggest web search
- Transparent to user via "thinking steps"

---

## 🔄 Version History

- **[v1.0](https://github.com/bhargavhegde/RAG-KnowBot)**: Local Streamlit app
- **[v2.0](https://github.com/bhargavhegde/KnowBot-2.0)**: Docker migration experiment
- **v3.0** (this repo): Production cloud deployment

---

## 📚 Documentation

- **[CODE_MAP.md](notes/CODE_MAP.md)**: Navigate codebase by feature
- **[INTERVIEW_SCRIPT.md](notes/INTERVIEW_SCRIPT.md)**: 90-min demo guide
- **[DATABASE_ARCHITECTURE.md](notes/DATABASE_ARCHITECTURE.md)**: System design
- **[QUICK_START.md](notes/QUICK_START.md)**: Run all versions locally

---

## 🤝 Contributing

Contributions welcome! Key areas:
- S3/R2 for persistent file storage
- RAGAS evaluation pipeline
- CI/CD with GitHub Actions
- OpenTelemetry observability

---

## 📄 License

MIT License - 2024 Bhargav Hegde

Built as a technical interview project demonstrating full-stack RAG architecture, cloud deployment, and production engineering patterns.
