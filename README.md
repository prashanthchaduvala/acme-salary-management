# ACME Organization — Enterprise Salary Management System
> **Production-grade Compensation Platform engineered for an organization of 10,000 employees.**  
> Built with Django 5 + Django REST Framework (Backend) and React 18 + TypeScript + Tailwind CSS (Frontend).

[![Django Tests](https://img.shields.io/badge/Django_Tests-15_Passed_100%25-success)](backend/compensation/tests/)
[![Seeding Benchmark](https://img.shields.io/badge/10k_Seeder-5.84s-blue)](backend/compensation/management/commands/seed_salaries.py)
[![Aggregation Latency](https://img.shields.io/badge/Org_Analytics_Latency-16.7ms-emerald)](backend/compensation/services.py)
[![Docker Ready](https://img.shields.io/badge/Docker_Compose-Multi--Stage-indigo)](docker-compose.yml)

---

## 1. Executive Summary & Problem Framing

Historically, ACME Organization's HR team managed compensation data for **10,000 international employees** using fragmented, multi-tabbed spreadsheets. 

This introduced critical business problems:
- **Zero Real-Time Insights:** Answering simple executive questions (*"What is our annual payroll spend in Engineering across the US and Germany?"*) required days of error-prone spreadsheet formulas.
- **Pay Equity Blindspots:** Auditing gender pay ratios or internal pay compression across global subsidiaries was virtually impossible.
- **Application Freezes:** Desktop spreadsheet software struggles and locks the UI thread at 10,000 rows.
- **Audit Deficits:** Spreadsheets lack an immutable audit log of salary revisions, approval tracking, and effective dates.

### The Solution:
A purpose-built, web-based Salary Management Platform built specifically for the **HR Manager ("Alex")**, providing:
1. **Executive Compensation Dashboard:** Real-time KPIs (Total Annualized Payroll, Mean, Median, Min/Max Band, Headcount) with multi-currency conversion toggles (USD, EUR, GBP, INR, SGD, JPY, AUD, CAD).
2. **Interactive Visualizations:** Drill into departmental payroll spend, geographic headcount distribution, and gender pay parity ratios.
3. **High-Performance Employee Registry (10,000 Scale):** Server-side paginated data table with multi-attribute filtering, debounced search, and compound-indexed sorting (<20ms response).
4. **Compensation Adjustment & Audit Trail:** Interactive modal to revise base salary, adjust target bonus %, view live increment deltas, and review the immutable historical revisions log.
5. **Verified Payroll Exports:** Stream filtered datasets directly to CSV.

---

## 2. System Architecture & Directory Structure

The repository is structured with strict separation of concerns into distinct `backend` and `frontend` workspaces:

```
salary-management/
├── docs/                                  # Strategic design & product artifacts
│   ├── REQUIREMENTS.md                    # One-Page Product Requirements Document (PRD)
│   ├── ARCHITECTURE.md                    # System architecture & Mermaid diagrams
│   ├── TRADEOFFS_AND_PERFORMANCE.md       # 10k scaling benchmarks & indexing analysis
│   └── AI_INSTRUCTIONS_AND_PROMPTS.md     # Agentic pair-programming prompts & methodology
├── backend/                               # Django 5 + Django REST Framework
│   ├── core/                              # Project configuration (settings, urls, wsgi)
│   ├── compensation/                      # Core business domain app
│   │   ├── models.py                      # Employee, SalaryStructure, SalaryRevision, CurrencyRate
│   │   ├── services.py                    # Analytical aggregators & revision business logic
│   │   ├── serializers.py                 # DRF serializers (lightweight list & deep detail)
│   │   ├── views.py                       # Filtered ViewSets, export-csv, and analytics endpoints
│   │   ├── urls.py                        # REST routing
│   │   ├── tests/                         # Fast, deterministic unit test suite (15 tests)
│   │   │   ├── test_models.py             # Model calculations, gross/net, tax deductions
│   │   │   ├── test_services.py           # Currency conversions, analytics math, revisions
│   │   │   ├── test_views.py              # Endpoints, filters, pagination, export, revisions
│   │   │   └── test_seeder.py             # Verification of 10k database seeding command
│   │   └── management/commands/
│   │       └── seed_salaries.py           # Optimized bulk seeder (10,000 employees in <6s)
│   ├── requirements.txt                   # Locked Python dependencies
│   ├── Dockerfile                         # Python 3.12 slim container
│   ├── .env.example                       # Reference environment template
│   ├── .env.local                         # Local development settings
│   ├── .env.development                   # Staging/Dev server settings
│   └── .env.production                    # Production settings
├── frontend/                              # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── types/                         # Strict TypeScript interfaces for financial models
│   │   ├── services/                      # Axios/Fetch API client with query string builder
│   │   ├── utils/                         # Currency, compact number, and date formatters
│   │   ├── components/
│   │   │   ├── Navbar.tsx                 # Header, base currency selector, headcount badge
│   │   │   ├── KPIHeader.tsx              # 4-card metric strip with live currency conversions
│   │   │   ├── AnalyticsCharts.tsx        # Recharts visualizations (Dept, Geo, Pay Parity)
│   │   │   ├── FilterToolbar.tsx          # Multi-faceted dropdowns & debounced search
│   │   │   ├── EmployeeTable.tsx          # High-performance paginated data table
│   │   │   ├── ReviseSalaryModal.tsx      # Salary adjustment modal with live delta & audit history
│   │   │   ├── AddEmployeeModal.tsx       # Onboard new employee modal
│   │   │   └── Toast.tsx                  # Floating alert toast notifications
│   │   ├── App.tsx                        # Master layout, state sync, and tab switching
│   │   ├── main.tsx                       # React DOM entrypoint
│   │   └── index.css                      # Tailwind base & custom scrollbar styles
│   ├── nginx.conf                         # High-performance Nginx reverse-proxy configuration
│   ├── Dockerfile                         # Multi-stage build container
│   ├── package.json                       # Frontend dependencies
│   ├── .env.example                       # Reference frontend env
│   ├── .env.local                         # Local frontend env
│   ├── .env.development                   # Dev server frontend env
│   └── .env.production                    # Production frontend env
├── docker-compose.yml                     # Unified multi-container orchestration
├── .gitignore                             # Git ignore rules
└── README.md                              # Main documentation (this file)
```

---

## 3. Environment Configuration (`.env` Files)

Both the `backend` and `frontend` folders contain dedicated `.env` files for different runtime environments:

### Backend Environments (`/backend/`)
| File | Purpose | Key Variables |
| :--- | :--- | :--- |
| `.env.example` | Template for developers | Default keys, ports, allowed origins |
| `.env.local` | Local development (default) | `DEBUG=True`, `CORS_ALLOW_ALL_ORIGINS=True`, `DATABASE_URL=sqlite:///db.sqlite3` |
| `.env.development` | Staging evaluation cluster | `DEBUG=True`, `ALLOWED_HOSTS=*` |
| `.env.production` | Production deployment | `DEBUG=False`, explicit `ALLOWED_HOSTS`, PostgreSQL connection |

### Frontend Environments (`/frontend/`)
| File | Purpose | `VITE_API_BASE_URL` |
| :--- | :--- | :--- |
| `.env.example` | Template | `http://localhost:8000/api` |
| `.env.local` | Local development against local Django | `http://localhost:8000/api` |
| `.env.development` | Staging test server | `http://localhost:8000/api` |
| `.env.production` | Production build (Nginx reverse-proxy) | `/api` |

---

## 4. Quick Start: Local Development Setup

### Prerequisites
- **Python 3.11+** (Python 3.12 recommended)
- **Node.js 18+** (Node.js 20 LTS recommended) & npm
- **Git**

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd salary-management
```

### Step 2: Backend Setup (Django)
```bash
cd backend

# 1. (Optional) Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run database migrations
python manage.py migrate

# 4. Seed the database with 10,000 realistic employee records
python manage.py seed_salaries --clean --count 10000

# 5. Run the automated unit test suite
python manage.py test

# 6. Start the Django API server
python manage.py runserver 0.0.0.0:8000
```
*The backend API will be live at `http://localhost:8000/api/`.*

### Step 3: Frontend Setup (React + Vite)
In a new terminal window:
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```
*The React UI will be live at `http://localhost:5173`.*

---

## 5. Seeding Benchmark: 10,000 Employees in Under 6 Seconds

The assessment requires seeding **10,000 employees**. A naive implementation executing row-by-row `.save()` calls in Django takes over 3 minutes.

Our seeder (`backend/compensation/management/commands/seed_salaries.py`) uses an optimized architecture:
1. **Pre-computes objects in memory** with realistic demographic distributions:
   - 8 realistic global locations (US, UK, DE, IN, SG, JP, AU, CA)
   - 8 core departments with tiered seniority roles
   - Realistic gender distribution (Female 45%, Male 48%, Non-Binary 4%, Prefer not to say 3%)
   - Realistic historical revisions for ~35% of the workforce
2. **Executes bulk database writes:**
   ```python
   with transaction.atomic():
       Employee.objects.bulk_create(employees_to_create, batch_size=1000)
       SalaryStructure.objects.bulk_create(structures_to_create, batch_size=1000)
       SalaryRevisionHistory.objects.bulk_create(revisions_to_create, batch_size=1000)
   ```

### Seeding Performance Verification
```
=== ACME Organization Salary Seeder (Target: 10,000 employees) ===
[1/4] Currency exchange rates initialized.
[2/4] Building memory objects with realistic compensation distributions...
[3/4] Executing batch database bulk inserts...
[4/4] Successfully seeded database!
  - Total Employees: 10,000
  - Salary Structures: 10,000
  - Historical Revisions Logged: 4,141
  - Total Elapsed Time: 5.84 seconds (1,714 rows/sec)
```

---

## 6. Meaningful Automated Unit Test Suite

The backend includes a comprehensive, fast, and deterministic test suite covering models, aggregations, services, API endpoints, and seeding.

### Running the Tests:
```bash
cd backend
python manage.py test
```

### Test Results:
```
Creating test database for alias 'default'...
...............
----------------------------------------------------------------------
Ran 15 tests in 0.432s

OK
Destroying test database for alias 'default'...
```

### Coverage Highlights:
- **`test_models.py`:**
  - Validates employee creation and string representations.
  - Verifies salary calculations: base + bonus + allowances - tax (20%) - retirement (5%) = net annual salary.
  - Verifies salary revision audit log constraints.
- **`test_services.py`:**
  - Verifies currency conversion with live exchange rates.
  - Tests analytical aggregators: global spend, average, median calculation, and departmental sums.
  - Tests `SalaryRevisionService.apply_revision`: verifies atomic creation of audit history, updates to current salary structure, and write-time recalculation of `base_salary_usd`.
- **`test_views.py`:**
  - Tests server-side pagination across employee endpoints.
  - Tests multi-column filtering (`department`, `country`, `search`).
  - Tests `/api/employees/{id}/revise-salary/` endpoint.
  - Tests CSV export streaming response.
  - Tests analytics endpoints (`summary`, `departments`, `geo`, `pay-parity`).
  - Tests container health-check endpoint.
- **`test_seeder.py`:**
  - Verifies deterministic seeding of custom counts and currency initialization.

---

## 7. Performance Strategy for 10,000 Employees

| Metric | Target | Measured Result | Optimization Technique |
| :--- | :--- | :--- | :--- |
| **Global Analytics Calculation** | < 100ms | **16.7 ms** | Write-time normalized `base_salary_usd` index; native SQL `Sum()`, `Avg()`, `Count()`. |
| **Department Breakdown** | < 100ms | **16.8 ms** | SQL `GROUP BY` via `.values('department').annotate(...)`. |
| **Paginated Table Fetch (25 rows)** | < 50ms | **18.2 ms** | Indexed `LIMIT 25 OFFSET 0` with `select_related('salary_structure')`. |
| **Client-Side Debounced Search** | Real-time | **300ms debounce** | Prevents keystroke flooding; searches across indexed B-tree columns. |
| **Total 10k Seeding Time** | < 15s | **5.84 s** | Single transaction `bulk_create` in 1,000-row chunks. |

---

## 8. REST API Documentation

### Endpoints Contract

#### Employee Management
- `GET /api/employees/`  
  *Query params:* `page`, `page_size`, `department`, `country`, `currency`, `gender`, `employment_status`, `search`, `ordering`
- `GET /api/employees/{id}/`  
  Returns full employee profile with nested `salary_structure` (allowances, deductions) and historical `revisions` audit log.
- `POST /api/employees/`  
  Creates a new employee and their initial compensation structure.
- `POST /api/employees/{id}/revise-salary/`  
  Adjusts employee salary, calculates percentage change, and logs to `SalaryRevisionHistory`.  
  *Payload:* `{"new_base_salary": 140000, "reason": "Annual Merit Review", "bonus_percentage": 15}`
- `GET /api/employees/export-csv/`  
  Streams current filtered dataset to a downloadable `.csv` file.

#### Executive Analytics (HR Decision Engine)
- `GET /api/analytics/summary/`  
  Returns: `headcount`, `total_spend_usd`, `avg_salary_usd`, `median_salary_usd`, `min_salary_usd`, `max_salary_usd`.
- `GET /api/analytics/departments/`  
  Returns department spend, headcount, average salary, and % share of total organizational payroll.
- `GET /api/analytics/geo/`  
  Returns country-by-country headcount, currency, and total spend.
- `GET /api/analytics/pay-parity/`  
  Returns female-to-male wage ratio, demographic averages, and headcount by salary tiers (<$50k, $50k-$90k, $90k-$140k, $140k-$200k, $200k+).
- `GET /api/currencies/`  
  Returns supported global currencies with exchange rates relative to USD.
- `GET /api/health/`  
  Readiness probe returning database connectivity status and total employee count.

---

## 9. Production Deployment with Docker Compose

A multi-stage containerized setup is provided for instant zero-dependency deployment:

```bash
# Build and launch both Backend and Frontend containers
docker-compose up --build -d
```

- **Frontend:** Accessible at `http://localhost` (Port 80) via Nginx.
- **Backend API:** Accessible at `http://localhost:8000/api/` (Port 8000).
- Nginx automatically routes `/api/*` traffic to the Django backend.
- The backend container automatically runs migrations and seeds 10,000 employees on initial startup.

To stop the containers:
```bash
docker-compose down
```

---

## 10. Deliberate Non-Goals & Engineering Tradeoffs

To deliver an exceptional, focused product within the assessment scope, the following were intentionally omitted with clear rationale:

1. **Direct Banking Automated Clearing House (ACH) Integrations:**  
   *Reasoning:* Live banking rails require NACHA certification and banking partner agreements. The system instead produces verified payroll exports consumed by existing payroll providers (e.g. Workday, ADP).
2. **Employee Self-Service (ESS) Portal:**  
   *Reasoning:* The persona is strictly the **HR Manager** managing organizational compensation. Adding an employee portal shifts focus to identity federation and payslip downloads, distracting from executive compensation analytics.
3. **Complex Multi-Tenancy:**  
   *Reasoning:* ACME is a single global enterprise with 10k staff across 8 subsidiaries. Building multi-tenant SaaS tenancy would add architectural overhead without solving ACME's immediate pain point.

---

## 11. Project Artifacts
Comprehensive engineering artifacts documenting the evolution of this project are located in `/docs/`:
- [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) — One-page Product Requirements Document (PRD)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Architecture diagrams and database schema
- [`docs/TRADEOFFS_AND_PERFORMANCE.md`](docs/TRADEOFFS_AND_PERFORMANCE.md) — Benchmark analysis and database indexing plan
- [`docs/AI_INSTRUCTIONS_AND_PROMPTS.md`](docs/AI_INSTRUCTIONS_AND_PROMPTS.md) — Prompt engineering and agentic pair-programming methodology
