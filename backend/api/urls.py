from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    DocumentViewSet, ChatSessionViewSet, SystemPromptViewSet,
    chat, health_check, RegisterView, get_user_profile
)

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'sessions', ChatSessionViewSet, basename='session')
router.register(r'prompts', SystemPromptViewSet, basename='prompt')

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', chat, name='chat'),
    path('health/', health_check, name='health'),
    # Auth
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', get_user_profile, name='auth_me'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
