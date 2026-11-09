# System Architecture & Technical Design Document
## ACME Salary Management System (Scale: 10,000 Employees)

### 1. High-Level Architecture Overview

```mermaid
flowchart TD
    subgraph Client["Frontend: React 18 + TypeScript (Vite)"]
        UI["HR Executive Dashboard & Registry UI"]
        FilterEngine["Client-Side Filter & URL Query Sync"]
        ChartModule["Recharts Interactive Visualizations"]
        APIService["Axios / Fetch API Client with Interceptors"]
    end

    subgraph Server["Backend: Django 5 + Django REST Framework"]
        Router["DRF ViewSets & Custom API Endpoints"]
        AuthMiddleware["CORS & Request Validation Middleware"]
        AnalyticsService["Aggregate Compensation Analytics Engine"]
        SalaryManager["Employee & Salary Revision Lifecycle Logic"]
        Serializer["DRF Dynamic & Optimized Serializers"]
    end

    subgraph DataTier["Data Persistence: Relational DB (SQLite / PostgreSQL)"]
        EmpTable[("acme_employee\n- Indexed on: employee_id, dept, country, usd_salary")]
        SalTable[("acme_salary_structure\n- Base, Bonus, Allowances, Deductions")]
        RevTable[("acme_salary_revision_history\n- Previous vs New, Effective Date, Reason")]
    end

    UI --> FilterEngine
    FilterEngine --> APIService
    APIService -->|JSON over HTTP / REST| Router
    Router --> AuthMiddleware
    AuthMiddleware --> AnalyticsService
    AuthMiddleware --> SalaryManager
    AnalyticsService --> Serializer
    SalaryManager --> Serializer
    Serializer --> EmpTable
    Serializer --> SalTable
    Serializer --> RevTable
```

---

### 2. Entity-Relationship Data Model

```mermaid
erDiagram
    EMPLOYEE ||--|| SALARY_STRUCTURE : "has current"
    EMPLOYEE ||--o{ SALARY_REVISION : "has historical"

    EMPLOYEE {
        string employee_id PK "ACME-00001 to 10000 (Indexed)"
        string first_name
        string last_name
        string email UK
        string department "Engineering, Sales, HR, etc. (Indexed)"
        string job_title "Staff Engineer, VP, Specialist, etc."
        string country "US, UK, DE, IN, SG, JP, AU, CA (Indexed)"
        string city
        string currency "USD, EUR, GBP, INR, SGD, JPY, AUD, CAD"
        string gender "Female, Male, Non-Binary, Prefer-not-to-say"
        date hire_date
        string employment_status "Full-Time, Contract, Part-Time"
        decimal base_salary_usd "Normalized for cross-org analytics (Indexed)"
        datetime updated_at
    }

    SALARY_STRUCTURE {
        int id PK
        string employee_id FK
        decimal base_salary "Annualized in local currency"
        decimal bonus_percentage "Target annual bonus %"
        decimal housing_allowance "Monthly/Annualized"
        decimal transport_allowance
        decimal other_allowance
        decimal tax_deduction_rate
        decimal retirement_contribution
        decimal net_annual_salary
        datetime effective_from
    }

    SALARY_REVISION {
        int id PK
        string employee_id FK
        decimal previous_base
        decimal new_base
        decimal percentage_change
        string currency
        date effective_date
        string reason "Annual Review, Promotion, Market Adjustment"
        string approved_by
        datetime created_at
    }
```

---

### 3. Sub-Second Performance Strategy for 10,000 Employees

Handling 10,000 records smoothly in a web application requires specific optimizations across the database, server, and client:

1. **Database Indexing Strategy:**
   - B-Tree compound index on `(department, country)` for rapid faceted slicing.
   - Compound index on `(country, base_salary_usd)` for regional pay parity checks.
   - Dedicated index on `employee_id` and `email` for \(O(1)\) lookups.
   - Normalized `base_salary_usd` computed at write time, eliminating on-the-fly currency conversions during aggregate queries.

2. **Server-Side Aggregations (Zero Python Loop Overhead):**
   - Django ORM handles all math natively inside the SQL query engine:
     ```python
     aggregates = Employee.objects.aggregate(
         total_spend_usd=Sum('base_salary_usd'),
         avg_salary_usd=Avg('base_salary_usd'),
         min_salary_usd=Min('base_salary_usd'),
         max_salary_usd=Max('base_salary_usd'),
         headcount=Count('id')
     )
     ```
   - Eliminates loading 10,000 objects into Python memory.

3. **Server-Side Pagination:**
   - Standard page sizes of 25, 50, 100 with `SQL LIMIT` and `OFFSET`.
   - Payload size per request is kept under 50KB, ensuring snappy mobile and desktop responsiveness.

4. **Frontend Virtualization & Debounced Search:**
   - Keystroke search queries are debounced (300ms) before querying the backend.
   - Responsive loading skeletons prevent layout shift while data fetches asynchronously.

---

### 4. RESTful API Endpoints Contract

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics/summary/` | Global KPIs: Total spend (USD), avg, median, headcount, by currency |
| `GET` | `/api/analytics/departments/` | Departmental spend, avg salary, headcount breakdown |
| `GET` | `/api/analytics/geo/` | Country-by-country compensation & headcount distribution |
| `GET` | `/api/analytics/pay-parity/` | Gender pay gap metrics & salary band distributions |
| `GET` | `/api/employees/` | Paginated employee list with filters (`department`, `country`, `search`, `min_salary`, etc.) |
| `GET` | `/api/employees/{id}/` | Detailed employee record with current salary & revision history |
| `POST` | `/api/employees/` | Create a new employee with initial salary structure |
| `POST` | `/api/employees/{id}/revise-salary/` | Record a salary revision with reason and approval log |
| `GET` | `/api/employees/export-csv/` | Stream filtered dataset to CSV |
| `GET` | `/api/currencies/` | Supported currencies & exchange rate matrix |
| `GET` | `/api/health/` | Health check for Docker / orchestrator |
