# AI Engineering Instructions & Agentic Development Log
## Systematic Architecture & Quality Strategy for ACME Salary Management

### 1. Intentional AI-Driven Engineering Strategy
This project was constructed using an **Agentic AI Pair-Programming workflow**, adhering to rigorous product and software engineering principles rather than unstructured code generation.

The guiding philosophy:
1. **Product Framing First:** Before generating code, align on who the user is (HR Manager), their actual workflow pain points (Excel spreadsheet paralysis, lack of pay equity visibility, 10,000 employee scale), and define crisp boundaries (in-scope vs. intentional non-goals).
2. **Architecture & Schema Contract:** Define explicit schema relationships, compound database indexes, and REST API contracts before implementing endpoints.
3. **Incremental Test-Driven Implementation:** Build models, serializers, business logic, endpoints, seeding scripts, and front-end state incrementally with automated unit tests gating each stage.
4. **Production Readiness:** Every line of code includes error handling, types, environment configurations, and Docker container definitions for seamless cloud deployment.

---

### 2. Decomposed Execution Plan

```
[Phase 1: Environment & Artifact Foundation]
  ├── Product Requirements Document (REQUIREMENTS.md)
  ├── Architecture & System Design (ARCHITECTURE.md)
  ├── Tradeoff Analysis & Performance Strategy (TRADEOFFS_AND_PERFORMANCE.md)
  └── Tooling setup: Python 3.12, Node.js LTS, Git

[Phase 2: Backend Development (Django 5 + DRF)]
  ├── Project structure: /backend/
  ├── Settings & Multi-environment config (.env.example, .env.local, .env.development, .env.production)
  ├── Core Models: Employee, SalaryStructure, SalaryRevision
  ├── Database indexing on critical query paths (10k optimization)
  ├── Optimized REST API ViewSets & Aggregation Analytics
  ├── Unit Test Suite (fast, deterministic, covering models, API, calculations)
  └── Realistic 10,000 Employee Seeder Command (bulk_create optimized)

[Phase 3: Frontend Development (React + TypeScript + Tailwind)]
  ├── Project structure: /frontend/
  ├── Modern Executive UI:
  │    ├── Global KPI Summary Cards (Total Spend, Avg, Median, Headcount)
  │    ├── Interactive Visualizations (Departmental spend, Gender pay parity, Geo map)
  │    ├── High-Performance Paginated Employee Table with multi-faceted filtering & search
  │    ├── Salary Revision Modal with Audit Trail History
  │    ├── New Employee Onboarding Modal
  │    └── Instant CSV Export for filtered views
  └── Mock & Live API Integration with loading skeletons and toast notifications

[Phase 4: Production Containerization & Deployment Setup]
  ├── Backend Dockerfile & Frontend multi-stage Nginx Dockerfile
  ├── Orchestrated docker-compose.yml
  ├── Production environment configurations
  └── Comprehensive README.md with architecture overview, local run instructions, and deployment steps
```

---

### 3. Prompting Patterns & System Directives Used
- **Schema Design Directive:** *"Design an immutable compensation revision history model linked to an employee entity. Ensure USD normalization is calculated on save to allow index seeks for multi-currency organizations."*
- **Seeder Optimization Directive:** *"Generate 10,000 realistic employees across 8 global hubs with realistic salary bands. Do not use row-by-row `.save()` calls; batch inserts using `bulk_create(batch_size=1000)` inside a single database transaction to guarantee <5s execution."*
- **Frontend Architecture Directive:** *"Build a high-performance HR executive table that remains snappy with 10k backend records. Use server-side pagination, debounced search, faceted filter chips, and accessible modal dialogs for salary modifications."*
