"""
WSGI Configuration for KnowBot.

WSGI (Web Server Gateway Interface) is the standard interface between
the Python application and the web server (like Gunicorn or Nginx).
It is used for SYNCHRONOUS communication in production.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'knowbot.settings')

application = get_wsgi_application()
