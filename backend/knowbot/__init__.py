"""
KnowBot Root Package.

This file ensures that Celery starts automatically when Django launches, 
allowing shared tasks to be recognized by the worker.
"""

from .celery import app as celery_app

__all__ = ('celery_app',)
