# KnowBot 3.0 Backend

The backend for KnowBot 3.0 is a **Django REST Framework** application that orchestrates the RAG pipeline, manages users, and handles vector storage via ChromaDB. It is designed to be deployed on **Railway**.

---

## 🚀 Features

- **API**: Django REST Framework (DRF)
- **RAG Engine**: LangChain + Ollama (Llama 3.1)
- **Vector Database**: ChromaDB (Persistent storage)
- **Task Queue**: Celery + Redis for async document processing
- **Database**: PostgreSQL for relational data (Users, Sessions)

---

## 🛠️ Development Setup

### Prerequisites
- Python 3.10+
- Docker (for Redis/Postgres) or local installations
- Ollama (running locally)

### Installation

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   Create a `.env` file in the `backend` directory (see `.env.example`).

4. **Run Migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start Server**
   ```bash
   python manage.py runserver
   ```

6. **Start Celery Worker**
   ```bash
   celery -A knowbot worker --loglevel=info
   ```

---

## ☁️ Deployment on Railway

This project includes a `railway.json` for easy deployment.

1. **Push to GitHub**: Ensure your code is in a GitHub repository.
2. **Create Railway Project**:
   - Go to [Railway](https://railway.app/).
   - "New Project" -> "Deploy from GitHub repo".
3. **Add Services**:
   - **PostgreSQL**: Add a Postgres database service.
   - **Redis**: Add a Redis service.
4. **Configure Variables**:
   In the settings for your Django service, set:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `REDIS_URL`: `${{Redis.REDIS_URL}}`
   - `SECRET_KEY`: Generate a strong random key.
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `*` (or your frontend domain)
   - `CORS_ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g., `https://knowbot30frontend-439w28wq2-bhargavhegdes-projects.vercel.app`)

---

## 📂 Architecture

For a deep dive into the RAG pipeline and data flow, check out [RAG_ARCHITECTURE.md](RAG_ARCHITECTURE.md).
