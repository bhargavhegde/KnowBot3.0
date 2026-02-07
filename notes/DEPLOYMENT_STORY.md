# Deploying AI: The "Memory Wall" Story

This document explains a critical architectural pivot made during the project. It is the story of **Local vs. Cloud Resources**.

---

## 1. The Original Plan: Local Privacy First
**Initial Stack:**
*   **LLM Provider:** Ollama (Llama 3.1 8b) running locally.
*   **Embedding Model:** `nomic-embed-text` (a high-performance open-source model).
*   **Why?** Free, private, and runs offline.

### What is Nomic Embeddings?
`nomic-embed-text` is a model that converts text into numbers (vectors). It is unique because it supports a long context window (8192 tokens) and rivals expensive models like OpenAI's `text-embedding-3-small`.
*   **The Catch:** To run it, you must load the model weights (~500MB) directly into **RAM**.

---

## 2. The Deployment Crash (The Problem)
When deploying to **Railway** (cloud hosting), the application crashed with an **OOM (Out Of Memory)** error.

*   **Constraint:** The Railway Starter Tier provides **512MB RAM** per container.
*   **The Math:**
    *   Django Overhead: ~150MB
    *   Operating System: ~50MB
    *   **Nomic Model (Loading): ~400MB**
    *   **Total:** > 600MB → **CRASH**.

The container was killed by the kernel before it could even safeguard the first request. This is a classic "Resource Constraint" problem in cloud engineering.

---

## 3. The Pivot: Cloud APIs (The Solution)
To fit within the 512MB budget, we had to offload the heavy computation.

**New Stack:**
*   **Embedding Provider:** OpenAI (`text-embedding-3-small`).
*   **LLM Provider:** Groq (Llama 3.3 70b) or OpenAI (GPT-3.5/4o-mini).

**Why this worked:**
*   Instead of loading a 500MB model into RAM, we send a tiny JSON request to OpenAI's API.
*   **RAM Usage:** Drop from ~600MB to ~200MB.
*   **Trade-off:** We now pay per token (Cost) but save massively on infrastructure (Compute).

---

## 4. How to Configure (The Switches)
All settings are controlled via Environment Variables (`.env`).

### Scenario A: Local Development (Free & Private)
Use this when running on your laptop with 16GB+ RAM.
```bash
# .env
LLM_PROVIDER=ollama
EMBEDDING_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
```

### Scenario B: Cloud Deployment (Lightweight & Fast)
Use this for Railway/Vercel/Heroku.
```bash
# .env
LLM_PROVIDER=groq
EMBEDDING_PROVIDER=openai
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
```

---

## 5. Technical Interview Q&A

**Q: Why did you switch from open-source models to OpenAI for embeddings?**
**A:** "It was an infrastructure decision. While Nomic provides excellent local embeddings, loading the model requires ~400MB of RAM. My deployment target (Railway) constrained containers to 512MB. By offloading embedding generation to OpenAI's API, I reduced the container's memory footprint by 60%, allowing it to run stably on the free tier. It was a trade-off: moving from Capital Expenditure (buying RAM) to Operational Expenditure (paying per API call)."
