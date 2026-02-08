# 🧠 KnowBot 3.0: RAG Interview Cheat Sheet

This document summarizes the core engineering concepts in `backend/rag/service.py`. Be prepared to explain these during your interview.

---

## 1. The RAG Lifecycle (The "Big Picture")
When asked "How does your bot answer questions?", use this 4-step flow:
1.  **Ingestion**: Files are broken into **Chunks** (800 chars) and converted into **Vectors** (numbers representing meaning).
2.  **Retrieval**: When a user asks a question, we convert the question into a vector and find the Top-5 most similar chunks.
3.  **Augmentation**: We "stuff" those 5 chunks into a prompt template as "Context".
4.  **Generation**: The LLM (Llama 3 via Groq) reads the context and the question to generate a cited answer.

---

## 2. Key Technical Concepts

### A. Vector Embeddings
*   **Definition**: A list of numbers (e.g., 768 or 1536 dimensions) that represents the *semantic meaning* of text.
*   **The Math**: Words with similar meanings (e.g., "Dog" and "Puppy") will have vectors that are physically close to each other in mathematical space.
*   **Why it matters**: It allows the bot to find information even if the exact keywords don't match (e.g., searching for "salary" can find "compensation").

### B. Vector Database (ChromaDB)
*   **Purpose**: A specialized database that can search by "distance" between vectors rather than exact text matches.
*   **Isolation**: In KnowBot, we use **Metadata Filtering**. Every vector has a `user_id`. Our search query includes a `where={"user_id": X}` clause to ensure privacy.

### C. Context Window Management
*   **The Problem**: LLMs have a limit on how much text they can "see" at once (Tokens).
*   **The Solution**: We don't send whole files. We use `RecursiveCharacterTextSplitter` to create small 800-character chunks with a 150-character **Overlap**. 
*   **Overlap**: This ensures that if a critical fact is split between two chunks, the context is preserved in both.

### D. LCEL (LangChain Expression Language)
*   **Syntax**: The pipe operator `|` (e.g., `prompt | llm | output_parser`).
*   **Why use it?**: It allows you to build a complex data pipeline (Chain) using standard Python syntax. It handles asynchronous calls and streaming automatically.

### E. Confidence Scoring & Fallbacks
*   **Concept**: We use `similarity_search_with_score`. 
*   **Engineering Decision**: If the best score is > 1.2 (meaning the AI found nothing relevant), the system doesn't hallucinate. Instead, it triggers a **Suggested Action** (Web Search).

---

## 3. Advanced Engineering Solutions

### Q: "How did you handle concurrent users?"
> "I implemented a **Singleton Pattern** for the ChromaDB client. In Python/Django, every request runs in a new thread. If two users uploaded files at once, they would fight over the SQLite file lock. I created `get_chroma_client` to ensure all threads share a single persistent connection, preventing 'Database is Locked' errors."

### Q: "Why use Groq instead of just local Ollama?"
> "Scalability and Speed. While Ollama is great for local development, it requires heavy GPU resources. Groq uses LPU (Language Processing Unit) technology to provide sub-second responses, which is critical for a premium User Experience."

### Q: "What happens if your vector database index gets corrupted?"
> "I built a **Health Check** into the `load_vector_store` method. It attempts to touch the HNSW index on the disk. If it detects corruption ('Nothing found on disk'), it gracefully notifies the user to reset their knowledge instead of crashing the entire API."
