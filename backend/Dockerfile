FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies (including Tesseract OCR for scanned documents)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    tesseract-ocr \
    tesseract-ocr-eng \
    libmagic1 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Optimize Image Size:
# 1. Install Torch CPU version explicitly (saves ~2GB)
# 2. Install sentence-transformers (pulls in small dependencies)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir sentence-transformers

# Install the rest of the Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY backend/ .

# Expose port
EXPOSE 8000

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
