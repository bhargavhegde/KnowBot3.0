"""
Celery Configuration for KnowBot.

This file initializes the Celery application and connects it to Django.
Celery is the "Engine" that runs background tasks like document indexing
and OCR processing, ensuring they don't block the main web server.

HOW IT WORKS:
1. It reads the `CELERY_BROKER_URL` from settings.py (typically Redis).
2. `autodiscover_tasks()` finds all `tasks.py` files in our Django apps.
3. The `knowbot-celery` Docker container runs this file to start the worker.
"""

import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'knowbot.settings')

app = Celery('knowbot')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Simple task to verify that the worker is alive and communicating with Redis."""
    print(f'Request: {self.request!r}')
