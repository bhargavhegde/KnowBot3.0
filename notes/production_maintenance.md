# 🛠️ KnowBot 3.0 Production Maintenance Guide

This document contains the commands and links needed to manage the live production environment.

## 🌐 Production Links
- **Admin Dashboard:** [https://knowbot30-production.up.railway.app/admin/](https://knowbot30-production.up.railway.app/admin/)
- **Backend API:** [https://knowbot30-production.up.railway.app/api/](https://knowbot30-production.up.railway.app/api/)

## 🚀 Railway CLI Commands

### 1. Authenticate (First time)
```bash
railway login
```

### 2. Enter Production Shell
Use this to run management commands directly on the server:
```bash
railway ssh --project=af06bd05-337a-443c-af31-41ed631d5649 --environment=fd755d40-b6b2-4111-8061-9820e9e178ad --service=f281100c-b1b3-4a1e-9cbc-1b7fd46cdf5c
```

### 3. Initialize Admin User
Run this **inside** the `railway ssh` shell:
```bash
python manage.py createsuperuser
```

### 4. Database Migrations
Run this **inside** the `railway ssh` shell if you change models:
```bash
python manage.py migrate
```

## 🧠 Memory Stability
If you encounter `SIGKILL` or OOM errors in production:
- Ensure `railway.json` is set to `--workers 1`.
- Check that `Tavily` search depth is set to `basic` in `backend/rag/service.py`.
