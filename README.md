# KnowBot 3.0 - The Neural Knowledge Assistant 🧠⚡



**KnowBot 2.0** is a high-fidelity, private RAG (Retrieval-Augmented Generation) application designed for high-performance personal knowledge management. Featuring a stunning cybernetic interface and a robust full-stack architecture, it allows you to chat with your local documents with zero data leaks.

---

## 🚀 What's New in 2.0?

KnowBot has evolved from a simple Streamlit script into a professional-grade full-stack beast:

- **Next-Gen Cybernetic UI**: Built with Next.js 15, Framer Motion, and Tailwind CSS. Features glassmorphism, holographic effects, and a custom-animated "Cyber Brain" avatar.
- **Persistent Chat History**: Full multi-session support. Save, resume, or delete your "neural threads" at any time.
- **Neural Knowledge Sync**: The AI explicitly tracks which files it has indexed feedback during document retrieval.
- **Enterprise-Ready Backend**: Django REST Framework handles orchestration, while **Celery + Redis** manage asynchronous document indexing.
- **Secure Multi-User**: Built-in authentication system with JWT. Your knowledge base is isolated to your account.
- **Async Indexing**: Upload mega-files and watch them process in the background without blocking the UI.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **Icons**: Custom SVG Cyber-Visuals
- **State Management**: React Context API

### Backend
- **Framework**: Django REST Framework
- **Task Queue**: Celery + Redis
- **Database**: PostgreSQL (Users/Sessions) + ChromaDB (Vector Store)
- **RAG Engine**: LangChain + Ollama

### AI Core
- **LLM**: Llama 3.1 8B (via Ollama)
- **Embeddings**: Nomic Embed Text
- **Vector Store**: Chroma (Persistent)

---

## 🏗️ Quick Start

The entire stack is containerized for a single-command deployment.

### 1. Prerequisites
- **Docker & Docker Compose** installed.
- **Ollama** running on your host machine (or accessible via network).
```bash
ollama pull llama3.1:8b
ollama pull nomic-embed-text
```

### 2. Setup Environment
Clone the repo and create your `.env` file:
```bash
git clone https://github.com/bhargavhegde/KnowBot-2.0.git
cd KnowBot-2.0
cp .env.example .env
```

### 3. Launch via Docker
```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000/api](http://localhost:8000/api)
- **Admin Dashboard**: [http://localhost:8000/admin](http://localhost:8000/admin)

---

## 📂 Project Structure

```text
KnowBot-2.0/
├── backend/            # Django REST Framework app
│   ├── api/            # Endpoints for chat, docs, and authentication
│   ├── rag/            # The LangChain RAG engine logic
│   └── knowbot/         # System settings & Celery config
├── frontend/           # Next.js 15 Application
│   ├── src/app/        # Pages (Login, Chat, Register)
│   ├── src/components/ # Cybernetic UI Components
│   └── src/context/    # State management
├── streamlit_backup/   # Legacy Streamlit code (v1.0)
└── docker-compose.yml  # Full-stack orchestration
```

---

## 📌 Features in Detail


### 🧠 System Prompts
Customize your AI's personality. Switch between a professional analyst, a creative tutor, or a strict fact-checker via the sidebar.

### 📄 Managed Knowledge
Upload **PDFs, TXTs, or MDs**. KnowBot chunks them, generates embeddings, and stores them in your private vector vault. You can delete documents individually or refresh your entire "Neural Memory" with one click.

---

## 🤝 Contributing
Feel free to fork this project and add new features! Whether it's more document loaders, new UI animations, or advanced RAG techniques, contributions are welcome.

## 📄 License
MIT License - 2024 Bhargav Hegde
