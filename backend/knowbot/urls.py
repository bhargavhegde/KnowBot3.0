"""
Root URL Configuration for KnowBot.

This is the main entry point for all web requests.
It divides traffic into two main categories:
1. /admin/ -> The Django Administrative Backend.
2. /api/   -> The primary REST API for the KnowBot frontend.
"""

from django.contrib import admin
from django.urls import path, include

# Customize Admin Dashboard appearance
admin.site.site_header = "KnowBot Admin"
admin.site.site_title = "KnowBot Admin Portal"
admin.site.index_title = "Welcome to KnowBot Admin"
admin.site.site_url = "http://localhost:3000"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
