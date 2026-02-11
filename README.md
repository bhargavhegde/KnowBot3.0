# KnowBot 3.0 - The Neural Knowledge Assistant 🧠⚡

![KnowBot 3.0 Banner](https://github.com/user-attachments/assets/ed61a9c1-fd7e-42a5-9214-24f9cfea72c6)

[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://knowbot-3-0-frontend.vercel.app/)
[![Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**KnowBot 3.0** is the latest evolution of the high-fidelity, private RAG (Retrieval-Augmented Generation) application. Rebuilt for scalability and performance, it features a decoupled architecture with a **Next.js 15 frontend hosted on Vercel** and a **Django REST Framework backend hosted on Railway**.

---

## 🚀 What's New in 3.0?

KnowBot 3.0 transitions from a monolithic Docker setup to a cloud-native microservices architecture:

- **Cloud-Native Architecture**: Frontend and Backend are decoupled for independent scaling.
- **Enhanced UI/UX**: Premium "Cybernetic" interface with refined animations, glassmorphism, and responsive design.
- **Robust RAG Pipeline**: Improved document chunking, hybrid search capabilities, and optimized vector retrieval.
- **Production Ready**: Configured for effortless deployment on Vercel and Railway.

---

## 🛠️ Tech Stack

### Frontend (Vercel)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **State**: React Context API
- **HTTP Client**: Axios with Interceptors

### Backend (Railway)
- **Framework**: Django REST Framework
- **Database**: PostgreSQL (Railway)
- **Vector Store**: ChromaDB (Persistent)
- **Async Tasks**: Celery + Redis
- **LLM Engine**: LangChain + Ollama (Llama 3.1)

---

## 🏗️ Quick Start

You can run KnowBot 3.0 locally using Docker Compose or individually.

### Prerequisites
- **Docker & Docker Compose**
- **Ollama** running locally (for local RAG)
  ```bash
  ollama pull llama3.1:8b
  ollama pull nomic-embed-text
  ```

### Local Setup (Docker)

1. **Clone the repository**
   ```bash
   git clone https://github.com/bhargavhegde/KnowBot3.0.git
   cd KnowBot3.0
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Update .env with your configuration
   ```

3. **Start the Stack**
   ```bash
   docker-compose up --build
   ```
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`

---

## ☁️ Deployment

### Frontend (Vercel)
1. Push `frontend/` to your GitHub repository.
2. Import the project into Vercel.
3. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL`: URL of your Railway backend (e.g., `https://web-production-xxxx.up.railway.app`)

### Backend (Railway)
1. Push `backend/` (or the root) to GitHub.
2. Create a new project on Railway.
3. Provision a **PostgreSQL** database and **Redis** service.
4. Deploy the repository and set Environment Variables:
   - `DATABASE_URL`: Your Railway Postgres URL.
   - `REDIS_URL`: Your Railway Redis URL.
   - `ALLOWED_HOSTS`: `*` (or your Vercel domain).
   - `CORS_ALLOWED_ORIGINS`: Your Vercel domain.

---

## 📂 Project Structure

```text
KnowBot3.0/
├── backend/            # Django application (Railway)
├── frontend/           # Next.js application (Vercel)
├── tilt_logs.txt       # Development logs
├── requirements.txt    # Python dependencies
└── docker-compose.yml  # Local orchestration
```

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License
MIT License - 2024 Bhargav Hegde
