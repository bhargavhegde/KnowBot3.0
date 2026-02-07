# Talking Points for Technical Interview

## 1. System Design: Stateless vs. Stateful Architecture (The "Ephermal Storage Error")

**Scenario:** During deployment to a platform like Railway (or Kubernetes), users reported data loss (missing file uploads) and search failures immediately after a new version was pushed.

**The Problem:**
I initially stored user uploaded files and the Vector Database (ChromaDB) on the local container filesystem.
- **Ephemeral Storage:** Containerized environments are designed to be stateless. Every deployment or restart destroys the container and provisions a fresh one, wiping all local data.
- **Data Persistence Gap:** The relational database (Postgres) persisted (because it was a managed service), so the application "remembered" the file metadata, but the physical files and vector index were gone.

**The Solution:**
I re-architected the storage layer to decouple "Compute" from "Storage":
1.  **Blob Storage:** moved file uploads to an Object Store (like AWS S3) for durability.
2.  **Vector Persistence:** Switched to a managed Vector Database or mounted a Persistent Volume to the container.

**Key Takeaway:**
"In production cloud architecture, never rely on the local filesystem for user data. Always use managed services for state (Databases, Object Stores, Queues) to allow the application tier to scale horizontally and restart without data loss."

## 2. Advanced RAG: Contextual Query Reformulation (Overcoming Lazy User Input)

**The Problem:**
Users often speak in shorthand, especially in follow-up questions.
- User: "What is the latest YOLO version?"
- Bot: "YOLO v10 is..."
- User: **"Search for it."** (or "Check Google for more")

A naive implementation takes "Search for it" literally and sends it to the search API (e.g., Tavily or Google). The search results for "search for it" are garbage (meta-instructions on how to use search engines), leading to a hallucinated or unhelpful response.

**The Solution:**
I implemented an **Intermediate Reasoning Step** (Query Transformation) before the search tool execution.
1.  **Intercept:** The backend detects a search request.
2.  **Reformulate:** Instead of searching immediately, it passes the *Chat History* and the *User's Follow-up* to a small, fast LLM call.
3.  **Prompt:** "Given the history [YOLO conversation] and input [Search for it], rephrase the input to be a standalone search query."
4.  **Execute:** The LLM outputs "Latest YOLO object detection version features", which is then sent to the Search API.

**Key Takeaway:**
"Effective Agentic RAG isn't just about retrieving data; it's about **pre-processing user intent**. By transforming conversational shorthand into explicit, semantic queries, we dramatically improve the system's robustness and usability without the user ever knowing the query was rewritten."
