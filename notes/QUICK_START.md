# 🚀 Quick Start Guide - Running Each Knowbot Version

## Version 1: Original Streamlit (Knowbot)

**Location**: `~/Desktop/Knowbot`

```bash
# 1. Setup virtual environment (first time only)
cd ~/Desktop/Knowbot
python3 -m venv rag_env
source rag_env/bin/activate
pip install -r requirements.txt

# 2. Ensure Ollama is running (separate terminal)
ollama serve

# 3. Pull required models (first time only)
ollama pull llama3.1:8b
ollama pull nomic-embed-text

# 4. Run Streamlit
streamlit run app.py
```

**Access**: Opens automatically at http://localhost:8501

**For Demo**: 
- Show the simple UI (30 seconds)
- Point out: single user, local only, blocking operations
- Mention: "This worked great, but I wanted to make it production-ready"

---

## Version 2: Knowbot2.0 (Docker/Tilt Setup)

**Location**: `~/Desktop/Knowbot2.0`

### Option A: Run with Tilt (Recommended)

```bash
cd ~/Desktop/Knowbot2.0
cp .env.example .env  # First time only
tilt up
```

**Access**: 
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api
- Tilt Dashboard: http://localhost:10350

**Stop**: `Ctrl+C` or `tilt down`

### Option B: Run with Docker Compose

```bash
cd ~/Desktop/Knowbot2.0
docker-compose up --build
```

### Option C: Just Show Streamlit (Quick Demo)

```bash
cd ~/Desktop/Knowbot2.0
source rag_env/bin/activate  # Create if needed
streamlit run app.py
```

**For Interview**: 
- If short on time: Just show folder structure and explain it was a Docker migration experiment
- If you have 2-3 minutes: Quick `tilt up` to show full stack running locally
- Talking point: "This taught me about containerization, but I went cloud-native for v3.0"

---

## Version 3: Production (Knowbot3.0)

**Live URL**: https://knowbot-gamma.vercel.app

**No local setup needed** - just use the live site.

**For Demo**:
1. Login with demo account
2. Upload a document
3. Ask a question
4. Show citations
5. Switch to code and explain architecture

---

## Demo Practice Version (demo_knowbot3.0)

**Location**: `~/Desktop/demo_knowbot3.0`

**Purpose**: Practice code walkthroughs with production-quality comments

```bash
# Open in VS Code
code ~/Desktop/demo_knowbot3.0
```

**This is NOT for running** - it's for practicing your explanations without verbose comments.

---

## Interview Flow Recommendation

1. **[0-1 min]** Show `~/Desktop` with all three folders
2. **[1-3 min]** Quick Streamlit demo (Terminal 1):
   ```bash
   cd ~/Desktop/Knowbot && source rag_env/bin/activate && streamlit run app.py
   ```
3. **[3-5 min]** Switch to live Knowbot3.0 in browser
4. **[5-45 min]** Deep dive in VS Code with `Knowbot3.0` or `demo_knowbot3.0`

---

## Troubleshooting

### Knowbot v1 Issues

**Ollama not running**:
```bash
# Start Ollama in separate terminal
ollama serve
```

**Missing models**:
```bash
ollama list  # Check installed models
ollama pull llama3.1:8b
ollama pull nomic-embed-text
```

**Missing dependencies**:
```bash
pip install -r requirements.txt
```

### Knowbot3.0 (Live) Issues

If the live site is down, mention:
> "This is deployed on Vercel and Railway. Let me show you the Railway dashboard and deployment logs..."

Then switch to showing the code while referencing the architecture.
