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

## Implementation Details

- **Entry point & API prefix:** The backend entrypoint is `Backend/app.js`. The
  Express app mounts routes under the `/api/v1` prefix (via
  `app.use('/api/v1', routes)`).

- **Database & ORM:** Sequelize is configured in `Backend/config/dbConfig.js`
  and models are defined under `Backend/models/`. On startup the app runs
  `sequelize.sync({ alter: true })` to synchronize models to the database —
  convenient for development but use migrations for production environments.

- **Models & Associations:** Primary models include `User`, `Book`, and
  `BookIssue`. Associations are declared in `Backend/models/index.js` (e.g.,
  `User.hasMany(BookIssue)`, `Book.hasMany(BookIssue)`). Note that
  `models/index.js` currently imports `BookIssue` for associations but only
  exports `User` and `Book`; consider exporting `BookIssue` too if other modules
  need it.

- **Authentication & Authorization:**
  - JWT-based auth is implemented in `Backend/utils/jwt.js` (`generateToken`,
    `verifyToken`).
  - `Backend/middleware/authMiddleware.js` (`checkAuthJWT`) extracts and
    verifies the Bearer token, loads the user by primary key, and attaches
    `req.user = { id, role }`.
  - `Backend/middleware/roleMiddleware.js` accepts a role or array of roles and
    enforces role-based access control for route handlers.

- **Standardized responses:** `Backend/middleware/responseMiddleware.js`
  attaches `res.sendResponse(...)` and `res.sendError(...)` helpers so
  controllers return a consistent JSON shape across the API.

- **Controllers, Services & Validation:** Controllers live in
  `Backend/controllers/` and delegate database/business logic to
  `Backend/services/`. Request validation uses `Joi` schemas in
  `Backend/validation/` to keep controllers thin and predictable.

- **Email & Events:** The app uses an internal `eventEmitter`
  (`utils/eventEmitter.js`). `utils/sendMail.js` registers a `sendEmail`
  listener at startup (it is required by `app.js`), which passes email jobs to
  `Backend/config/email.js`. This decouples sending emails from request
  handling.

- **Logging & errors:** `winston` is configured in `Backend/utils/logger.js`.
  `app.js` logs requests and startup actions; controllers should call
  `next(err)` for unexpected errors to allow centralized error handling.

- **Routing overview:** Routes are organized under `Backend/routes/` and mounted
  in `Backend/routes/index.js` (examples include `/auth`, `/users`, `/book`,
  `/book-issues`, and dashboards). Middleware (auth/role/validation) is applied
  per-route as needed.

- **Frontend integration:** The Angular frontend expects the backend API base
  URL to be configured in `Frontend/src/app/app.config.ts` (or an equivalent
  config file) and calls the `/api/v1/*` endpoints.

- **Development cautions:**
  - `sequelize.sync({ alter: true })` can change DB schema; prefer explicit
    migrations in production.
  - Ensure sensitive environment variables (`JWT_SECRET`, DB and email
    credentials) are set in `.env` and not committed.
  - Double-check `models/index.js` exports if other modules import models from
    that file.

## Frontend UI Summary

This project uses Angular standalone components and Angular Material for
interactive UI pieces (dialogs, snack/toasts, icons, datepicker). The UI stores
authentication state in `sessionStorage` (`jwt` and `role`) and the router
guards (`AuthGuard`, `RoleGuard`) use that to protect routes.

Pages / Views and key implementation notes:

- **Home (`/`)**: Simple landing page component under `src/app/home/`. Minimal
  layout and links to login/signup and books.

- **Auth (Login / Signup)**:
  - Implemented as standalone components using reactive forms (`Login`) and
    `ReactiveFormsModule`/`FormBuilder` (`Signup`) with client-side validation.
  - `Login` calls `AuthService.login()` and shows server errors using
    `ToastService` (Angular Material `MatSnackBar`).
  - `Signup` enforces password rules with a custom validator and displays
    field-level errors.

- **Books Listing (`/books`)**:
  - `BooksComponent` (`src/app/books/book-list/`) shows a responsive card grid
    of books with search. Search is debounced using an RxJS `Subject` with
    `debounceTime` and `distinctUntilChanged` to reduce API/UI work.
  - Librarian users see `Edit` and `Delete` controls; members see
    `Request Issue` buttons. Role detection uses
    `sessionStorage.getItem('role')`.
  - Add/Edit flows use `BookCreateDialog` (Material `MatDialog`) with a
    template-driven form and client-side validation for image URL and fields.
  - Requesting a book opens `BookRequestDialog` that accepts either a typed
    YYYY-MM-DD date or a Material datepicker; it validates the date and prevents
    past dates.

- **My Requests (`/myRequests`)**:
  - `MyRequestsComponent` lists the current user's issue requests, attaches book
    titles by calling `BookService.detail()` for missing titles, and supports
    requesting returns via a `ConfirmDialog`.

- **Dashboards (Super Admin & Librarian)**:
  - Implemented in `src/app/dashboard/`.
  - Both dashboards fetch stats, lists, and issue data via `DashboardService`
    and `BookIssueService` and present tabbed views (daily, users, issued,
    overdue, etc.). They normalize incoming API payloads defensively and attach
    member/book details when the API returns minimal objects.
  - Important: The Super Admin and Librarian dashboards use AdminLTE visual
    components and classes (the project includes `admin-lte` in dependencies).
    The templates use AdminLTE patterns such as `small-box`, `bg-gradient-*`,
    `icon` and table styles so the dashboards visually match the AdminLTE theme.

- **Shared UI components:**
  - `Navbar`: top navigation that reads `sessionStorage` to show role-specific
    links and a logout that clears session storage and reloads the app.
  - `ConfirmDialog`: small Material dialog used for confirmations (delete,
    return, etc.).
  - `ToastService`: centralized snack/toast wrapper using `MatSnackBar`.
  - `OverdueDetailsDialog`: dialog showing details for overdue items and a
    button to trigger the backend `notifyOverdue` email action.
  - `NotFound`: a simple 404 component for unknown routes.

- **HTTP & Interceptors:**
  - `auth.interceptor.ts` attaches the `Authorization: Bearer <token>` header to
    outgoing HTTP requests when a JWT is present in `sessionStorage`.
  - Services use a local `base` URL (`http://localhost:3000/api/v1`) and map
    backend responses defensively (normalize `data` wrappers and arrays).

- **UX patterns & accessibility:**
  - Dialogs use `MatDialog` and include ARIA roles when appropriate.
  - Loading states and basic keyboard-focus friendly patterns are present (e.g.,
    `loading` flags, role attributes on status elements).

Notes & Recommendations:

- Consider centralizing API base URL via an environment file or `app.config`.
- Replace `sessionStorage` role checks with a shared Auth service to avoid
  duplication and improve testability.
- Verify that AdminLTE CSS/JS are loaded in `index.html` (or via Angular styles)
  so dashboard classes render correctly in all environments.

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
