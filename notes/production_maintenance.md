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
railway ssh --project=af06bd05-337a-443c-af31-41ed631d5649 --environment=fd755d40-b6b2-4111-8061-9820e9e178ad --service=e16766f7-1092-4864-bd5d-ed976cf8c816
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

## 💣 Total Reset (PostgreSQL)
If you want to wipe all users and data from the database, follow these steps in the **Railway Dashboard**:
1.  Click on your **Postgres** service card in the project view.
2.  Click on the **Data** tab in the top navigation bar of the service.
3.  Click the **"Query"** button (or similar icon) to open the SQL editor.
4.  Run these commands to drop and recreate the schema:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```
*(Note: Railway will automatically rebuild the tables on the next backend start/restart)*

## 🧠 Memory Stability
If you encounter `SIGKILL` or OOM errors in production:
- Ensure `railway.json` is set to `--workers 1`.
- Check that `Tavily` search depth is set to `basic` in `backend/rag/service.py`.
