# Employee Management System (EMS)

A highly responsive, aesthetically stunning, and secure **Employee Management System** built with **React (Vite + CSS)** and **Java Spring Boot 3.3.4**, integrated with a remote **Neon PostgreSQL** database server.

---

## 🌟 Premium Features

- **Dashboard & Analytics**: Rich, beautiful visual charts built with `Recharts` for tracking department employee headcounts and gender distributions, combined with summary metrics (salary costs, active staff, pending leave lists).
- **Core Corporate Directory**: Rich profiles representing personal, contact, and structural variables (job title, hiring date, salary bracket, department, status, address, gender).
- **Roster & Department Divisions**: Integrated control elements for corporate departments featuring automated headcount calculation, and deletion warnings when departments hold active staff.
- **Real-Time Attendance Portal**: Interactive clock-in/out console containing a live ticking workspace timer, automatic status evaluations (e.g. flagging check-ins past 9:15 AM as `LATE`), and manager-led override overrides.
- **Leave Request & Approvals Workflow**: Book personal leave types (`SICK`, `CASUAL`, `VACATION`, `UNPAID`) with automatic calendar date validation. Managers can approve or reject leaves with custom feedback remarks directly from their console.
- **Role-Based Security Model**: Custom JWT token-based Spring Security 6.x middleware dividing permissions across `ROLE_ADMIN`, `ROLE_MANAGER`, and `ROLE_EMPLOYEE`.

---

## 🗃️ Database Connection Details

The system is configured to interact with a high-performance cloud **Neon PostgreSQL** database. All tables are automatically schema-generated via Hibernate DDL during the backend's first startup.

- **Dialect**: `PostgreSQLDialect`
- **SSL Verification Mode**: `require` (enabled for secure cloud transactions)
- **Automatic Seed Initializer**: The database is automatically seeded with essential cost divisions, default employee logs, and credentials on startup if the records are blank.
