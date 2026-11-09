# ACME Organization Salary Management System
## Production Deployment Guide

This guide details multiple production-ready deployment options for the ACME Organization Salary Management application.

---

### Method 1: 1-Click Cloud Deployment via Render.com Blueprint (Recommended)

The repository includes a complete Infrastructure-as-Code specification ([`render.yaml`](file:///C:/Users/HP/.gemini/antigravity/scratch/salary-management/render.yaml)) defining both the Django REST backend and React Vite frontend.

#### Steps:
1. Log in or create a free account at [https://render.com](https://render.com).
2. From the Render dashboard, click **New +** → **Blueprint**.
3. Connect your GitHub account and select the repository:  
   `https://github.com/prashanthchaduvala/acme-salary-management.git`
4. Render automatically parses `render.yaml` and sets up:
   - **`acme-salary-backend`**: Python 3.12 Web Service running Gunicorn, automatic migrations, and 10,000-record seeder.
   - **`acme-salary-frontend`**: Node 20 Static Site running Vite build and automatic SPA route rewrites.
5. Click **Apply Blueprint**. Both services will build and deploy with full SSL certificates (`https://...`).

---

### Method 2: Multi-Stage Production Docker Compose

The application is containerized with multi-stage Dockerfiles for both backend (Python 3.12-slim + Gunicorn) and frontend (Node 20-alpine build + Nginx Alpine reverse proxy).

#### Prerequisites:
- Docker Engine & Docker Compose installed.

#### Run in Production:
```bash
# Clone the repository
git clone https://github.com/prashanthchaduvala/acme-salary-management.git
cd acme-salary-management

# Build and start all containers in detached mode
docker-compose up -d --build

# Verify container health
docker-compose ps
```

- **Frontend Application:** Available at `http://localhost` (or server IP / custom domain) on port 80.
- **Backend API & Swagger:** Proxied via Nginx to `http://localhost/api/` (internally port 8000).

---

### Method 3: Instant Live Public Tunnel (Zero-Setup Demo)

To share a live public link instantly without waiting for cloud builds:

1. Double-click [`launch_live_public_tunnel.bat`](file:///C:/Users/HP/.gemini/antigravity/scratch/salary-management/launch_live_public_tunnel.bat) in the project root.
2. The script establishes an encrypted HTTPS tunnel directly to your running application:
   ```
   Live Public Demo URL: https://acme-salary-prashanth.loca.lt
   ```
3. Share the URL with anyone to evaluate the live application on any device.

---

### Method 4: Deploying on Railway.app

1. Go to [https://railway.app](https://railway.app) and click **New Project** → **Deploy from GitHub repo**.
2. Select `prashanthchaduvala/acme-salary-management`.
3. Railway detects the `docker-compose.yml` or `backend/` and `frontend/` folders automatically.
4. Click **Deploy**.

---

### Method 5: Frontend on Vercel + Backend on Render

- **Frontend:**
  1. Open [https://vercel.com](https://vercel.com) → **Add New** → **Project**.
  2. Import `prashanthchaduvala/acme-salary-management`.
  3. Set Root Directory to `frontend`.
  4. Set Environment Variable: `VITE_API_BASE_URL` to your backend URL.
  5. Click **Deploy** (builds in ~30 seconds).

---

### Default Evaluation Credentials

| Username / Email | Password | Role / Access Level |
| :--- | :--- | :--- |
| **`prashanth`** (`prashanthpatelc@gmail.com`) | **`Welcome@123`** | **Head of HR & People Operations (Full Admin - Write)** |
| **`alex.hr`** (`alex.hr@acme.org`) | **`Welcome@123`** | **Head of Total Rewards (Full Admin - Write)** |
| **`jessica.emp`** (`jessica.lewis.4313@acme.org`) | **`Welcome@123`** | **Senior Software Engineer (Employee - Read-Only ESS)** |
