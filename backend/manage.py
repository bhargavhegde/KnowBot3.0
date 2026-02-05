#!/usr/bin/env python
"""
KnowBot Management CLI.

This is the primary command-line tool for the backend.
It is used for:
1. `python manage.py runserver` -> Local development server.
2. `python manage.py migrate`   -> Syncing the database schema.
3. `python manage.py createsuperuser` -> Creating admin accounts.
"""

import os
import sys

# ... rest of the file ...


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'knowbot.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
