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
