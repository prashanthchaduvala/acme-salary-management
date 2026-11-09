# ACME Organization Salary Management System
## Official Video Demo Walkthrough Script (3 to 4 Minutes)

> **Recording Tips:**
> - **Fastest Recording (Zero Install):** Press **`Win + Alt + R`** on Windows to immediately start screen recording with audio. Press again to finish.
> - **Browser Extension (Recommended for instant share link):** Use [Loom.com](https://www.loom.com) to generate an instant cloud link.
> - **Display Resolution:** Set your browser zoom to 100% or 90% at `http://localhost:5173`.

---

### Segment 1: Introduction & Executive Problem Framing (0:00 - 0:40)
* **Visual on Screen:** Open browser at `http://localhost:5173` showing the **ACME HR Security Portal** login screen.
* **Narration Script:**
  > *"Hello, my name is Prashanth Chaduvala. Today I am excited to demonstrate the ACME Organization Enterprise Salary Management & Compensation Platform.*
  > 
  > *ACME has scaled to 10,000 employees across 8 international hubs: the United States, UK, Germany, India, Singapore, Japan, Australia, and Canada. Historically, managing payroll across 10,000 records using multi-tabbed spreadsheets created severe data integrity issues, formula corruption, and complete blindspots regarding gender pay equity and currency parity.*
  > 
  > *To solve this, we engineered a high-performance web platform built with Django REST Framework, React 18, TypeScript, Tailwind CSS, and Recharts. The architecture is compound-indexed to deliver sub-20 millisecond SQL aggregations across all 10,000 staff members.*
  > 
  > *The system features three distinct, role-based dashboards tailored for Head of HR Operations, Head of Total Rewards, and Standard Staff Self-Service."*

---

### Segment 2: Head of HR & People Operations Dashboard (0:40 - 1:40)
* **Visual on Screen:**
  1. Click **`Prashanth Chaduvala (HR Admin)`** 1-Click login.
  2. The screen enters the **Global People & Workforce Operations Hub**.
  3. Point out the top operations banner and high-priority KPIs ($1.24B total payroll, 10,000 active headcount, $123.8k mean salary).
  4. Scroll down to show the **Spend by Department** bar chart and the **International Subsidiaries** map.
  5. Click **"Employee Registry (10k)"** tab.
  6. In the search box, type `"Engineering"` or `"San Francisco"`. Show how the server-side pagination responds in under 30 milliseconds.
  7. Click **`+ Add Employee`** button to show the modal form for onboarding new hires.
* **Narration Script:**
  > *"First, let's explore the workspace from the perspective of Prashanth Chaduvala, Head of HR & Global People Operations.*
  > 
  > *As you can see, the Executive Overview provides real-time visibility into ACME's 1.24 billion dollar annualized payroll across our 8 global divisions. All charts are dynamic and currency-normalized.*
  > 
  > *When we switch to the Employee Registry, our server handles pagination, multi-column search, and faceted filtering across all 10,000 records with sub-50 millisecond latency thanks to compound database indexing on department, country, and base salary.*
  > 
  > *As an HR administrator with full write authority, I can onboard new employees, filter by seniority, or export filtered rosters directly to payroll-compliant CSV."*

---

### Segment 3: Head of Total Rewards Dashboard (1:40 - 2:30)
* **Visual on Screen:**
  1. At the very top bar, click the **`2. Total Rewards (Alex)`** persona button.
  2. The view instantly transforms into the purple **Total Rewards & Pay Parity Center** on the **`Pay Parity & Bands`** tab.
  3. Show the **Gender Pay Ratio by Department** bar chart (highlighting the 0.97 parity benchmark).
  4. Show the **Regional Salary Compression** and 8-currency conversion toggle (switch from USD to EUR or GBP).
  5. Select an employee to open the **Salary Adjustment & Audit History** modal. Change their salary and highlight the automatic increment percentage calculation.
* **Narration Script:**
  > *"Next, let's switch personas with one click to Alex Rivera, our Head of Total Rewards and Compensation Strategy.*
  > 
  > *Notice how the interface immediately shifts to focus on compensation governance. Alex's primary dashboard is Pay Parity & Bands. Here we can analyze gender wage equity across every department—currently holding at a healthy 0.97 parity ratio.*
  > 
  > *We also have real-time currency conversion across 8 global hubs, allowing leadership to evaluate salary compression regardless of local currency.*
  > 
  > *When we select an employee, Alex can perform a live salary revision. The system automatically computes delta percentages, enforces approval requirements, and commits an immutable record into the database audit trail."*

---

### Segment 4: Employee Self-Service (ESS) Portal (2:30 - 3:15)
* **Visual on Screen:**
  1. Click **`3. Staff ESS (Jessica)`** in the top switcher bar.
  2. The view transforms into the emerald **Employee Self-Service (ESS)** portal for Jessica Lewis (`ACM-04313`).
  3. Point out the **Personalized Profile Header**, the **Next Payday countdown (Nov 30, 2026)**, and the 4 financial cards (Base Salary, 15% Bonus, Monthly Take-Home).
  4. Show the **Total Rewards Allocation Donut Chart** and the **Monthly Paycheck Simulation** with 20% tax and 5% pension deductions.
  5. Click **"Salary Growth & Promotions"** tab to show the career milestones timeline.
  6. Click **"Company Teammates"** tab to show colleague directory.
  7. Click **`Download Paystub`** button to show the downloaded official statement.
* **Narration Script:**
  > *"Now let's switch to Jessica Lewis, a Senior Software Engineer at ACME.*
  > 
  > *Jessica sees an entirely different, personalized Employee Self-Service experience. Instead of organization-wide payroll data, she sees her personal compensation breakdown, her 15% target bonus, and an estimated monthly take-home simulation after taxes and pension contributions.*
  > 
  > *An interactive donut chart breaks down her total rewards package. The Career Growth timeline highlights her promotion history and merit increments over her tenure.*
  > 
  > *She can browse ACME teammates across our global offices with peer privacy safeguards, and click 'Download Paystub' to immediately receive an official payroll statement."*

---

### Segment 5: Engineering Quality, Tests & Conclusion (3:15 - 3:45)
* **Visual on Screen:**
  1. Quickly show terminal running `python manage.py test compensation` (22/22 tests passing in OK).
  2. Show Docker Compose configuration or GitHub repository page (`https://github.com/prashanthchaduvala/acme-salary-management`).
* **Narration Script:**
  > *"Under the hood, the entire backend is verified by 22 automated unit tests covering financial models, SQL services, API views, and seeding performance.*
  > 
  > *The project is fully containerized with Docker and ready for single-command deployment via Docker Compose or our Render.com blueprint.*
  > 
  > *All code, comprehensive documentation, and performance benchmarks are committed on GitHub. Thank you for your time, and I look forward to your feedback!"*
