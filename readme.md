# Library Management Service

## Project Description

The Library Management Service is a web application that helps institutions
manage their library operations: cataloging books, managing members and staff
(librarians and admins), handling issue/return workflows, tracking overdue
items, and sending notifications. The system is intended to support
small-to-medium libraries (schools, small universities, organizations) and can
be extended for larger deployments.

Key users and roles:

- **Super Admin:** full system access, user and role management, global
  settings.
- **Librarian:** manages books, approves/declines issue requests, views
  reporting dashboards.
- **Member:** searches the catalog, requests issues, views loan history.

## Specifications

- **Functional Specifications:**
  - Authentication and authorization with role-based access control (RBAC).
  - Book management: add/update/delete books, metadata, categories, and
    availability status.
  - Member management: create/update member profiles, membership status, and
    borrow limits.
  - Issue workflow: request, approve, issue, renew, and return books. Track due
    dates and fines/penalties (optional).
  - Notifications: email alerts for approvals, due soon, overdue, and system
    events.
  - Dashboards: per-role insights (admin, librarian, member) with summary
    statistics.

- **Non-Functional Specifications:**
  - API-based backend with JSON responses; frontend consumes API via REST.
  - Persistent relational storage (PostgreSQL recommended) with Sequelize ORM.
  - Secure storage of credentials and JWTs; transport over HTTPS in production.
  - Configurable via environment variables and prepared for containerized
    deployment.
  - Basic logging and error handling; extendable to centralized logging (e.g.,
    ELK, external log provider).

- **Performance & Scalability:**
  - Target small-to-medium load initially; design APIs and DB schema for
    horizontal scaling later (read replicas, caching).

- **Backup & Recovery:**
  - Regular DB backups recommended; provide scripts or use managed DB snapshots
    in production.

## Features

- User registration, login, and JWT authentication.
- Role-based access (Super Admin, Librarian, Member).
- Full CRUD for books with search and filters.
- Book issue request, approval, issuance, renewal, and return.
- Email notifications for requests, approvals, due reminders, and overdue alerts
  (configurable).
- Dashboard views for different roles with summary metrics.
- Input validation using `Joi` and centralized error responses.
- Structured logging using `winston` and simple health-check endpoints.

## Project Specification

**Overview:**

- **Purpose:**: A web-based Library Management Service to manage books, users
  (members, librarians, admins), book issue/return workflows, and notifications.
- **Stack:**: Backend Node.js + Express + Sequelize; Frontend Angular;
  PostgreSQL (or other SQL) via Sequelize.

**Table Of Contents:**

- **Overview:**: Short project summary and stack.
- **Requirements:**: Prerequisites and environment variables.
- **Structure:**: Project layout for `Backend/` and `Frontend/`.
- **Setup:**: How to install and run locally (backend & frontend).
- **API:**: Main routes and behaviors.
- **Database:**: Schema overview and migration notes.
- **Testing:**: How to run tests (frontend & backend).
- **Deployment:**: Basic production recommendations.
- **Contributing & Contact:**: How to contribute and contact details.

**Requirements:**

- **Node.js:**: v16+ recommended for backend and Angular CLI for frontend.
- **Database:**: PostgreSQL (preferred) or MySQL; configured via environment
  variables.

**Environment Variables:** Create a `.env` file in `Backend/` with the following
keys:

- **DB_NAME:**: Database name
- **DB_USER:**: Database username
- **DB_PASSWORD:**: Database password
- **DB_HOST:**: Database host (e.g., `localhost`)
- **DB_PORT:**: Database port (e.g., `5432`)
- **DB_DIALECT:**: `postgres` or `mysql`
- **JWT_SECRET:**: Secret used to sign JWT tokens
- **EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS:**: (If using email
  notifications)

**Project Structure (high level):**

- **Backend/**: Express app, controllers, models, services, routes, and
  utilities.
  - **`app.js`**: App entrypoint and server bootstrap.
  - **`config/`**: `dbConfig.js` uses environment variables and Sequelize.
  - **`models/`**: Sequelize models for `User`, `Book`, `BookIssue`, etc.
  - **`routes/`**: Route groups mounted under `/auth`, `/users`, `/book`,
    `/book-issues`, and dashboards.
- **Frontend/**: Angular application (components, services, routes).

**Quick Start (Backend):**

1. Open a terminal and change to the backend folder:

```powershell
cd "Backend"
```

2. Install dependencies and create `.env`:

```powershell
npm install
# create a .env file with the keys listed above
```

3. Run in development:

```powershell
npm run dev
```

4. Start production:

```powershell
npm start
```

**Quick Start (Frontend):**

1. Change to the frontend folder:

```powershell
cd "Frontend"
```

2. Install and run:

```powershell
npm install
npm start
```

The Angular app runs by default at `http://localhost:4200` and will talk to the
backend API (configure base API URL in `app.config.ts`).

**API Overview:**

- **Auth:**: `POST /auth/signup`, `POST /auth/login` — signup and login return
  JWT tokens.
- **Users:**: `GET|POST /users` — user management endpoints (admin-protected
  where required).
- **Books:**: `GET /book`, `POST /book`, `PUT /book/:id`, `DELETE /book/:id` —
  CRUD for books.
- **Book Issues:**: `POST /book-issues/request`, `GET /book-issues`,
  `PUT /book-issues/:id/approve`, `PUT /book-issues/:id/return` —
  request/approve/return flows.
- **Dashboards:**: `GET /admin-dashboard`, `GET /librarian-dashboard`,
  `GET /member-dashboard` — dashboard data endpoints.

Refer to the route files under `Backend/routes/` for exact route names and
request payloads.

**Database & Models:**

- **ORM:**: Sequelize configured in `Backend/config/dbConfig.js`.
- **Models:**: `User`, `Book`, `BookIssue` are located in `Backend/models/` and
  define relations (user ↔ book issues).
- **Migrations:**: If not using Sequelize CLI migrations, models sync at runtime
  (check `app.js`). For production, prefer migrations and seeders.

**Validation & Security:**

- **Validation:**: Request validation uses `Joi` (see `Backend/validation/`).
- **Auth:**: JWT-based auth with middleware in
  `Backend/middleware/authMiddleware.js` and role checks via
  `roleMiddleware.js`.
- **Logging:**: Winston logger is used (`Backend/utils/logger.js`).

**Testing:**

- **Backend:**: No unit tests included by default; add tests with Jest or
  Mocha/Chai for controllers and services.
- **Frontend:**: Use `npm test` in `Frontend/` (Angular Karma/Jasmine) — see
  `Frontend/package.json`.

**Deployment Notes:**

- Build frontend with `npm run build` and serve static files via a CDN or from
  the backend (serve `dist/` from Express).
- Use environment variables for DB and secrets in production; use a process
  manager like `pm2` or Docker for backend.
- Secure TLS/HTTPS at the reverse proxy (NGINX) and rotate `JWT_SECRET`
  securely.

**Contributing:**

- **Code style:**: Follow existing project style. Keep changes scoped and open
  PRs with clear descriptions.
- **Commits:**: Use small, focused commits and reference issues where
  applicable.

**Contact / Maintainers:**

- For questions or issues, open an issue in the repository or contact the
  maintainer listed in project metadata.

---

This file is the project specification for the Library Management Service.
Update it as the project evolves.
