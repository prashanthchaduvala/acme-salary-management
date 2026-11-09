# Product Requirements Document (PRD)
## ACME Organization — Enterprise Salary Management System

**Document Version:** 1.0  
**Author:** Staff Product Engineer & HR Tech Architect  
**Target Audience:** HR Leadership, Engineering Assessment Panel  
**Target Release:** Production Phase 1  

---

### 1. Executive Summary & Problem Framing
ACME Organization has scaled to **10,000 employees** across multiple international regions (US, UK, Germany, India, Singapore, Australia, Canada, Japan). Historically, the HR team operated via fragmented, multi-tabbed spreadsheets. 

This approach has introduced severe operational bottlenecks:
- **Zero Real-time Visibility:** Calculating total organizational payroll, departmental distributions, or currency-adjusted spend takes days of manual VLOOKUPs.
- **Pay Parity Blindspots:** Analyzing gender pay ratios, cross-regional wage parity, or salary compression requires fragile manual formulas.
- **Data Integrity & Security Risks:** Excel sheets lack audit trails, validation rules, role-based controls, and performance guarantees at scale (10,000+ rows crash desktop spreadsheet applications).

**The Solution:** Build a dedicated, secure, web-based Salary Management Platform that empowers ACME's **HR Manager** to manage salary records, track compensation revisions, drill into departmental/regional analytics, and answer strategic compensation questions with sub-second latency.

---

### 2. User Persona: The HR Manager ("Alex")
- **Role:** Head of Global HR Operations & Total Rewards.
- **Core Needs:**
  1. *Executive Insights:* High-level aggregate KPIs (total global payroll, average salary, median compensation, bonus payouts, currency breakdowns).
  2. *Exploration & Search:* Rapidly filter 10,000 employees by country, department, role, salary range, or employment status.
  3. *Pay Equity & Analytics:* Analyze gender pay parity, departmental compensation distributions, and salary band compliance.
  4. *Salary Lifecycle Management:* Record and view salary adjustments, effective dates, bonuses, and allowance breakdowns.
  5. *Export & Reporting:* Export filtered audit data for executive presentation and payroll dispatch.

---

### 3. In-Scope Features (Phase 1 MVP)

| Module | Core Capabilities |
| :--- | :--- |
| **Executive Dashboard & Pay Analytics** | - Global metrics: Total Annualized Spend, Avg Salary, Median, Min/Max, Active Headcount.<br>- Interactive charts: Spend by Department, Geographic distribution (USD normalized), Gender Pay Ratio, Experience vs. Salary correlation.<br>- Currency toggle (USD base with dynamic conversion rates for EUR, GBP, INR, JPY, AUD, CAD, SGD). |
| **Employee & Salary Registry (10k Scale)** | - Server-side paginated grid (50, 100, 250 rows/page) optimized for 10,000+ records.<br>- Multi-column search (name, employee code, email, title, department).<br>- Faceted filtering: Country, Department, Employment Type (Full-time, Contract, Part-time), Currency, Salary Range.<br>- Sorting across all indexed attributes with sub-50ms response times. |
| **Salary Breakdown & Revisions** | - Granular compensation structure: Base Salary, Performance Bonus, Allowances (Housing, Transport, Remote), and Deductions (Tax, Pension/401k).<br>- Historical audit log of salary revisions (previous amount, new amount, increment %, reason, effective date, approver). |
| **Compensation Actions** | - Add new employee record with validation rules.<br>- Update employee salary / trigger salary revision with immediate audit logging.<br>- Bulk export to CSV with active filter context. |
| **Data Integrity & Seeding** | - CLI seeder generating exactly 10,000 realistic, geographically accurate employee records with diverse salary bands, realistic departments, and revision histories.<br>- Robust database indexing on lookup keys (`employee_id`, `department`, `country`, `base_salary_usd`, `gender`). |

---

### 4. Deliberately Out of Scope (Non-Goals) & Justification

To deliver a reliable, laser-focused, production-grade product within the assessment timeline, the following elements are intentionally excluded:

1. **Direct Banking Automated Clearing House (ACH) / Direct Deposit Gateway:**
   - *Reasoning:* Real-time banking rails require banking partner integration licenses, NACHA/SEPA file certification, and PCI/SOC2 banking compliance. In Phase 1, the system generates verified payroll exports consumed by existing payroll processors (e.g. ADP, Workday).
2. **Employee Self-Service (ESS) Portal:**
   - *Reasoning:* The prompt strictly targets the **HR Manager** persona managing organization-wide compensation. Adding an employee portal shifts focus to identity federation and payslip downloads, distracting from executive compensation analytics and salary governance.
3. **Complex Multi-Tenancy:**
   - *Reasoning:* ACME is a single global enterprise with 10k staff. Building a multi-tenant SaaS architecture adds unnecessary tenancy isolation complexity without solving ACME's immediate pain point.
4. **Complex Custom Workflow Approvals Engine:**
   - *Reasoning:* Heavy multi-level approval matrixes (BPMN) add overhead. Phase 1 provides audit logging and revision tracking directly administered by authorized HR personnel.

---

### 5. Technical Stack & Architectural Decisions

- **Backend:** Django 5.x + Django REST Framework (DRF)
  - *Why:* Python's rich ORM, built-in migration system, robust aggregation framework (`Sum`, `Avg`, `Count`, `StdDev`), and rock-solid validation make it ideal for financial data modeling.
- **Database:** SQLite (default for instant zero-dependency local evaluation) / PostgreSQL-ready (via `DATABASE_URL` environment configuration).
  - *Optimization for 10k rows:* Compound B-Tree indexes on `(department, country)`, `(base_salary_usd)`, and `employee_id`; Django ORM `select_related` and pre-computed USD normalized columns ensure zero N+1 queries.
- **Frontend:** React (Vite + TypeScript) + Tailwind CSS + Lucide Icons + Recharts
  - *Why:* Lightning fast Vite tooling, TypeScript type-safety for financial structures, rich charting for executive decision-making, and server-side paginated tables.
- **DevOps & Environments:**
  - Multi-stage Docker setup (`Dockerfile` for backend & frontend, `docker-compose.yml`).
  - Strict environment separation: `.env.example`, `.env.local`, `.env.development`, `.env.production`.

---

### 6. Success Metrics & Verification Criteria
- [x] **Latency:** < 100ms response time on paginated list and aggregate queries across 10,000 rows.
- [x] **Reliability:** 100% deterministic unit test suite covering models, aggregations, APIs, and seeding.
- [x] **UX Polish:** Zero blank screens; rich loading states, interactive filters, mobile responsiveness, toast feedback, and crisp financial formatting.
