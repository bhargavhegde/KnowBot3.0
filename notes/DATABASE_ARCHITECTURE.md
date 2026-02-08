# Database Architecture Deep Dive: KnowBot 3.0

> **"Data is the foundation of specific intelligence."**

This document explains the "Dual-Brain" architecture of KnowBot 3.0. We use a **Hybrid Storage Pattern** that combines a traditional relational database (Postgres) with a semantic search engine (ChromaDB).

---

## 1. High-Level Architecture: The "Dual-Brain"

We do not store everything in one place. We split data based on its **access pattern**.

### Access Patterns

*   📊 **PostgreSQL (Structured Data)**
    *   **Stores:** Users, Auth, File Metadata.
    *   **Why:** ACID compliance, strict schemas, Foreign Keys.

*   🧠 **ChromaDB (Unstructured Data)**
    *   **Stores:** Document Content, Semantic Meaning.
    *   **Why:** Vector similarity search (HNSW), fuzzy matching.

### The "Golden Thread"
The link between these two worlds is the **`file_path`** and **`user_id`**.
-   When you delete a file in Postgres, the `file_path` is used to hunt down and destroy vectors in ChromaDB.

---

## 2. Relational Schema (PostgreSQL)
*The Backbone of the Application.*

### A. The Tables (Entities)

#### 1. `api_document`
**Purpose:** Tracks files uploaded by users. It acts as the "Receipt" or "Manifest" for what *should* be in the vector store.
*   `id` (PK): Auto-incrementing Integer.
*   `user_id` (FK): Links to `auth_user`. **Crucial for Multi-tenancy.**
*   `original_filename`: What the user named it (e.g., "Report.pdf").
*   `file_path`: Where the raw blob lives on disk (e.g., `/app/data/uuid-123.pdf`).
*   `index_status`: **State Machine**.
    *   `PENDING`: Uploaded, not processed.
    *   `PROCESSING`: Currently being chunked/embedded.
    *   `INDEXED`: Successfully in ChromaDB.
    *   `FAILED`: Something went wrong (check `error_message`).

#### 2. `api_chatsession`
**Purpose:** A "Folder" for messages. Allows users to have multiple contexts.
*   `title`: Auto-generated summary of the chat.
*   `user_id` (FK): Owner.

#### 3. `api_chatmessage`
**Purpose:** The actual conversation log.
*   `session_id` (FK): Links to the Session.
*   `role`: 'user' vs 'assistant'.
*   `content`: The text.
*   `citations` (JSON): A JSON blob storing the source snippets used for *that specific answer*. **This is a snapshot.** If the document is deleted later, this citation remains as historical proof.

### B. Entity-Relationship Diagram (ERD)

```mermaid
User (1) ----< (N) Document
User (1) ----< (N) ChatSession
ChatSession (1) ----< (N) ChatMessage
```

---

## 3. Vector Schema (ChromaDB)
*The Semantic Memory.*

### Structure
ChromaDB is not a table-based DB. It stores **Collections** (buckets of vectors). We use a single collection: `knowbot_docs`.

### The "Row" (Embedding)
Each "row" in ChromaDB is a **Vector Chunk**.
*   **Vector**: A list of 384 or 768 floating-point numbers (depending on model).
    *   `[0.021, -0.98, 0.55, ...]`
*   **Payload (Content)**: The actual text string (approx 800 chars).
*   **Metadata**: Key-Value tags for filtering.
    *   `user_id`: "42" (The Security Guard).
    *   `source`: "Report.pdf" (For citations).
    *   `file_path`: "/app/data/..." (For deletion).

### The Index (HNSW)
Chroma uses **Hierarchical Navigable Small World (HNSW)** graphs.
*   Think of it like a "Map of Meaning".
*   Concepts "King" and "Queen" are physically close to each other in this map.
*   Searching finds the "Nearest Neighbors" (Cosine Similarity).

---

## 4. The Data Lifecycle (Design Decisions)

### Q: Why not store the PDF content in Postgres `TEXT` column?
**A:** Postgres is terrible at semantic search (`LIKE %query%` is slow and dumb). Vectors allow us to find relevant text even if words don't exactly match (e.g., "Cost" matches "Price").

### Q: Why Foreign Keys everywhere?
**A:** `ON_DELETE=CASCADE`. If a User deletes their account, Postgres automatically wipes their Documents, Sessions, and Messages. (Note: We have to manually hook into this to wipe ChromaDB vectors too, using `signals` or custom `delete()` methods).

### Q: Why JSON for Citations?
**A:** It’s strictly "Read-Only History". We don't need to join on it. A JSON blob allows flexible schemas if we change how citations look later.

---

## 5. Architectural Trade-offs

*   🏢 **Shared Database (Multi-tenancy)**
    *   **Pro:** Easy to manage, cheap (1 RDS instance).
    *   **Con:** "Noisy Neighbor" problem (one heavy user slows down everyone).

*   💾 **Local File Storage**
    *   **Pro:** Zero latency, free.
    *   **Con:** Data Loss on Deploy (The Ephemeral Storage issue).

*   ⚡ **Async Indexing (Celery)**
    *   **Pro:** User UI never freezes.
    *   **Con:** Complexity (requires Redis + Worker container).
