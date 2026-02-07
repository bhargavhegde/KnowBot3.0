"""
URL Configuration for KnowBot API.

This file maps URIs (web addresses) to View functions.
It uses DRF (Django REST Framework) Routers to automatically generate 
standard CRUD paths for Documents and Sessions.

ROUTES:
1. /api/documents/   -> File management and indexing status.
2. /api/sessions/    -> Chat history and session management.
3. /api/chat/        -> The main interaction endpoint.
4. /api/auth/        -> User registration and profile lookups.
5. /api/token/       -> JWT Security tokens (Login/Refresh).
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    DocumentViewSet, ChatSessionViewSet, SystemPromptViewSet,
    chat, health_check, RegisterView, get_user_profile, preview_document,
    get_initial_suggestions
)

# Use DefaultRouter for automated ViewSet routing (provides /list, /create, etc.)
router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'sessions', ChatSessionViewSet, basename='session')
router.register(r'prompts', SystemPromptViewSet, basename='prompt')

urlpatterns = [
    # Router paths (Documents, Sessions, Prompts)
    path('', include(router.urls)),
    
    # Core RAG interaction
    path('chat/', chat, name='chat'),
    path('chat/suggestions/', get_initial_suggestions, name='initial_suggestions'),
    
    # Protected preview
    path('documents/<int:pk>/preview/', preview_document, name='preview_document'),
    
    # Infrastructure
    path('health/', health_check, name='health'),
    
    # Authentication & User Management
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', get_user_profile, name='auth_me'),
    
    # JWT Security Tokens
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
