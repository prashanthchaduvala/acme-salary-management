# Backend Dockerfile for ACME Salary Management System
FROM python:3.12-slim

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

# Default command runs database migrations, 10k seeder, and gunicorn WSGI server
CMD ["sh", "-c", "python manage.py migrate && python manage.py seed_salaries --count 10000 && gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120"]
