# 🛠️ Comprehensive Troubleshooting & Logs Guide

This document is your "Firefighter Manual". It explains where to find logs, what they mean, and how to fix the most common errors in KnowBot 3.0.

---

## ⚡ STARTUP COMMANDS (Running Services Individually)
If you want to debug a specific service without `docker-compose`, use these commands.
**Note:** Ensure your `.env` file is loaded or set `export $(cat .env | xargs)` first.

### 1. Backend API (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000
```
*Port:* 8000

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
*Port:* 3000

### 3. Celery Worker (Background Tasks)
```bash
cd backend
source venv/bin/activate
celery -A knowbot worker --loglevel=info
```
*Requires:* Redisl running (`docker run -p 6379:6379 redis`)

### 4. Ollama (LLM Server)
```bash
ollama serve
```
*Port:* 11434

---

## 🔍 WHERE TO FIND LOGS

## 🔍 WHERE TO FIND LOGS

### 1. Local Development (Docker / Tilt)
If you are running `tilt up` or `docker-compose up`:

| Service | Command to View Logs | What it contains |
| :--- | :--- | :--- |
| **Backend (Django)** | `docker logs -f knowbot30-backend-1` | API requests, 500 errors, Print statements. |
| **Celery (Worker)** | `docker logs -f knowbot30-celery-1` | Background tasks, embedding generation, PDF parsing. |
| **Frontend (Next.js)** | `docker logs -f knowbot30-frontend-1` | React rendering errors, build failures. |
| **Database (Postgres)** | `docker logs -f knowbot30-db-1` | SQL queries, connection errors, startup logs. |
| **Ollama (LLM)** | `docker logs -f knowbot30-ollama-1` | Model loading status, inference speed, GPU errors. |

### 2. Production (Railway)
1.  Go to **Railway Dashboard**.
2.  Click on the specific service (e.g., `Backend`).
3.  Click the **Deployments** tab -> **View Logs**.

---

## 🔥 COMMON ERRORS & FIXES

### 1. Backend API (Django)

#### A. `OperationalError: no such table: api_document`
*   **Meaning:** The database exists but the tables haven't been created yet.
*   **Fix:** Run migrations.
    ```bash
    docker-compose exec backend python manage.py migrate
    ```

#### B. `CORS Network Error` (Frontend cannot talk to Backend)
*   **Meaning:** The browser blocked the request because the Backend didn't allow the Frontend's URL.
*   **Check Logs:** Look for `CORS_ALLOWED_ORIGINS` in your settings.
*   **Fix:** Ensure `http://localhost:3000` is in `CORS_ALLOWED_ORIGINS` in `.env`.

---

### 2. Celery Worker (The Background Engine)

#### A. `kombu.exceptions.OperationalError: [Errno 111] Connection refused`
*   **Meaning:** Celery cannot find Redis. The broker is down.
*   **Check Logs:** Check `docker logs knowbot30-redis-1`.
*   **Fix:** Restart Redis: `docker-compose restart redis`.

#### B. `ValueError: Expected 768 dimensions, got 384`
*   **Meaning:** Embedding Model Mismatch. You indexed documents with one model (e.g., `all-MiniLM-L6-v2`) but are searching with another (e.g., `nomic-embed-text`).
*   **Fix:** You must **Re-index** everything to match the new model.
    ```bash
    python manage.py reset_knowledge
    ```

#### C. `SoftTimeLimitExceeded`
*   **Meaning:** The task took too long (e.g., parsing a 500-page PDF).
*   **Fix:** Increase `CELERY_TASK_SOFT_TIME_LIMIT` in settings or split the PDF into smaller files.

---

### 3. Database (PostgreSQL)

#### A. `FATAL: password authentication failed for user "knowbot"`
*   **Meaning:** The Backend config has a different password than the Postgres container.
*   **Fix:** Check `.env`. Ensure `POSTGRES_PASSWORD` matches what was used when the DB container was *first created*. If needed, delete the database volume to reset it.
    ```bash
    docker-volume rm knowbot30_postgres_data
    ```

#### B. `IntegrityError: duplicate key value violates unique constraint`
*   **Meaning:** You tried to create a user or document that already exists (e.g., same username).
*   **Fix:** Catch this error in your code or delete the existing record.

---

### 4. Vector Database (ChromaDB)

#### A. `sqlite3.OperationalError: database is locked`
*   **Meaning:** Multiple processes are trying to write to the `chroma_db` file at the same time.
*   **Fix:** This is why we use the **Singleton Pattern** in `service.py`. Ensure you aren't running two Django instances (e.g., `runserver` AND `celery`) both trying to write to local disk without a client-server mode.
*   **Production Fix:** Use a dedicated Vector DB like Pinecone.

#### B. `InvalidDimensionException`
*   **Meaning:** Same as the Celery error above. Your vectors don't match the collection's shape.
*   **Fix:** Reset/Re-index.

---

### 5. Frontend (Next.js)

#### A. `Hydration failed because the initial UI does not match what was rendered on the server`
*   **Meaning:** Your HTML structure is invalid (e.g., a `<div>` inside a `<p>`) OR you are using `localStorage` during Server-Side Rendering (SSR).
*   **Fix:** Wrap client-side code in `useEffect` or use `dynamic(() => import(...), { ssr: false })`.

#### B. `Connection Refused` (fetching `/api/...`)
*   **Meaning:** Next.js (server-side) can't find the Django container.
*   **Fix:** Ensure internal Docker networking URLs are used (`http://backend:8000`) instead of `localhost`.

---

### 6. LLM Provider (Ollama / OpenAI)

#### A. `httpx.ConnectError: [Errno 111] Connection refused`
*   **Meaning:** Django cannot talk to Ollama.
*   **Fix:** Ensure `OLLAMA_HOST` is set correctly.
    *   **Mac/Windows Docker:** `host.docker.internal:11434`
    *   **Linux Docker:** `172.17.0.1:11434` (requires configuration)

#### B. `401 Unauthorized` (OpenAI/Groq)
*   **Meaning:** Your API Key is invalid or missing.
*   **Fix:** Check `.env` and restart the backend.
