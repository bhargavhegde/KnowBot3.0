"""
Django Settings for KnowBot.

This is the GLOBAL CONFIGURATION file for the entire backend.
It defines how the application connects to databases, what AI models to use, 
and how security is handled.

SECTIONS:
1. INFRASTRUCTURE: PATHS, Secret Keys, Debug Mode.
2. DATABASE: PostgreSQL connection details.
3. SECURITY: JWT Token settings and CORS (allowed frontends).
4. CELERY: Background task worker configuration (using Redis).
5. KNOWBOT-SPECIFIC: Ollama host, LLM models, and local data paths.
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- 1. SECURITY & INFRASTRUCTURE ---
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'dev-secret-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,0.0.0.0').split(',')

# Apps installed in this project
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party (DRF, CORS)
    'rest_framework',
    'corsheaders',
    # Local application domain
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',      # Must be first for CORS to work
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'knowbot.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'knowbot.wsgi.application'


# --- 2. DATABASE (PostgreSQL) ---
# We use Postgres for metadata (Users, Documents, Chat History).
# Vector data is stored separately in ChromaDB.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'knowbot'),
        'USER': os.environ.get('POSTGRES_USER', 'knowbot'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'knowbot_dev_password'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}


# --- 3. PASSWORD VALIDATION ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# Static files (CSS, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --- 4. DJANGO REST FRAMEWORK & JWT ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),     # User stays logged in for 24 hours
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'TOKEN_TYPE_CLAIM': 'token_type',
}


# CORS settings - allow frontend (React/Next.js) to connect
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True


# --- 5. CELERY CONFIGURATION (REDIS) ---
# Used for processing document embeddings in the background (Async).
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'


# --- 6. KNOWBOT AI & STORAGE ---

# Ollama Connection (Where Llama 3 lives)
OLLAMA_HOST = os.environ.get('OLLAMA_HOST', 'http://localhost:11434')
LLM_MODEL = 'llama3.1:8b'
EMBEDDING_MODEL = 'nomic-embed-text'


# Local Storage Paths
DATA_DIR = BASE_DIR / 'data'          # Raw PDF/TXT file storage
CHROMA_DIR = BASE_DIR / 'chroma_db'   # Vector database storage (Index)

# File Upload Limits
MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_UPLOAD_EXTENSIONS = ['.pdf', '.txt', '.md']

