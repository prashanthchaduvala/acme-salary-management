# Backend Dockerfile for ACME Salary Management System
FROM python:3.12-slim

# Prevent Python from writing .pyc files & enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libsqlite3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . /app/

# Collect static assets
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Default command runs production WSGI server or Django runserver
CMD ["sh", "-c", "python manage.py migrate && python manage.py seed_salaries --count 10000 && python manage.py runserver 0.0.0.0:8000"]
