# Runtime Architecture: WSGI & Gunicorn

This document explains how KnowBot 3.0 handles live web traffic in a production environment.

---

## 🔌 1. What is WSGI? (`wsgi.py`)

**WSGI** stands for **Web Server Gateway Interface**. 

Think of it as a **translator**. 
*   **The Web Server** (like Gginx or Railway's Proxy) speaks "HTTP".
*   **The Application** (Django) speaks "Python".
*   **WSGI** is the bridge that allows the web server to hand off an incoming request to your Python code and get a response back.

In `backend/knowbot/wsgi.py`, the line `application = get_wsgi_application()` creates the specific object that the server "talks" to.

---

## 🚀 2. Our Application Server: Gunicorn

In production, we use **Gunicorn** (Green Unicorn). You can see this in our `railway.json`:

```json
"startCommand": "gunicorn knowbot.wsgi:application --bind 0.0.0.0:${PORT} --workers 1"
```

### Why Gunicorn?
1.  **Concurrency:** It can handle multiple requests at once by spawning "Workers" (separate processes).
2.  **Robustness:** If a worker process crashes or leaks memory, Gunicorn automatically kills it and starts a fresh one.
3.  **Standard:** It is the industry standard for deploying Django apps.

---

## 🛠️ 3. The "Worker" Model

A "Worker" is a clone of your application running in memory. 

*   **1 Worker (Current Setup):** We use 1 worker on Railway because our AI models (even the cloud versions) and Django app need to stay within the **512MB - 1GB RAM** limit. Adding more workers would multiply the RAM usage and cause a `SIGKILL` error.
*   **Multiple Workers:** On a larger server (e.g., 4GB RAM), we would use `(2 x CPU Cores) + 1` workers. This would allow the bot to handle 10+ people chatting simultaneously without slowing down.

---

## 📡 4. WSGI vs. ASGI

While we use **WSGI** for the main API, modern Python also has **ASGI** (Asynchronous Server Gateway Interface).

### 📡 WSGI vs. ASGI Comparison

*   **WSGI (KnowBot 3.0)**
    *   **Philosophy:** Synchronous. One request = One thread.
    *   **Best For:** Standard REST APIs (Django DRF).
    *   **Server:** Gunicorn

*   **ASGI**
    *   **Philosophy:** Asynchronous. Can handle thousands of idle connections.
    *   **Best For:** WebSockets, Real-time notifications, Streaming.
    *   **Server:** Uvicorn / Daphne

**Note:** If we ever implement **Real-time Streaming** for the bot's text (seeing words appear one by one), we would likely migrate from `wsgi.py` to `asgi.py`.

---

## 🏎️ 6. Case Study: The Pivot from Celery to Synchronous

During production testing on Railway (1GB RAM tier), we initially attempted to run a **Celery Worker** inside the API container to handle heavy document indexing. However, we encountered a `SIGKILL` (Out of Memory) error during a large OCR task.

### The Conflict
*   **Worker Overhead:** The Celery worker process (even with `--concurrency=1`) consumed ~300MB of RAM just by idling.
*   **Memory Spike:** When Tesseract OCR processed a high-resolution image (3424x1926 px), it sent a memory spike that pushed the container past the 1GB limit.
*   **The Log:** `[ERROR] Worker was sent SIGKILL! Perhaps out of memory?`

### The Solution: "Graceful Fallback"
To prioritize system uptime over background processing, we pivoted to a **Synchronous Architecture** for the production tier.

**How it was implemented:**

1.  **Start Command Update (`railway.json`, Line 8):**
    We removed the `celery -A knowbot worker --detach` command. By not starting the worker, we recovered ~300MB of RAM for the main API to use during heavy OCR spikes.

2.  **Code-Level Fallback (`backend/api/views.py`, Lines 110-116):**
    The code is designed to *try* Celery first but catch the failure if no worker is running:
    ```python
    # Line 110: Try to offload to Celery
    try:
        from .tasks import index_document_task
        index_document_task.delay(document.id) # Line 112
    except Exception as e:
        # Line 116: Catch failure and process synchronously instead
        processor = DocumentProcessor()
        processor.load_single_document(...) # Line 119
    ```

### Decision Summary: Why we chose Synchronous

*   **Background (Celery) Mode**
    *   **RAM Usage:** High (~800MB - 1GB)
    *   **UX:** Instant (UI not blocked)
    *   **Stability:** Medium (Risk of OOM crashes)

*   **Synchronous (Current) Mode**
    *   **RAM Usage:** Low (~400MB - 600MB)
    *   **UX:** Delayed (UI waits for index)
    *   **Stability:** **High (Maximum RAM available for tasks)**

**Strategic Value:** This shows a senior engineering mindset—sacrificing "perceived speed" (background tasks) for "guaranteed uptime" (no crashes) when operating under strict infrastructure constraints.
