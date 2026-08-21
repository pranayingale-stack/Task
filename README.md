# Committee Task Board

A full-stack, role-based task management system for a college tech committee.
A **Tech Head** creates, assigns, edits, and deletes tasks; **Co-Committee
Members** see only the tasks assigned to them and update their status.

---

## Features

- Session-based authentication using JWTs (8-hour expiry)
- Role-based authorization enforced on the **backend**, not just hidden in
  the UI — a Co-Committee Member cannot read, edit, or delete another
  member's task even by calling the API directly with a guessed task ID
- Task fields: title, description, assignee, status, priority, deadline,
  created/updated timestamps
- Statuses: `Pending`, `In Progress`, `Completed`
- Priorities: `Low`, `Medium`, `High`
- Filter tasks by status, assigned member, and priority
- Full frontend workflows: login, create/edit/delete/assign (Tech Head),
  status updates (Co-Committee Member), loading states, empty states,
  success/error toasts, delete confirmation dialog
- Responsive layout (desktop and mobile), protected routes per role
- Server-side input validation with clear field-level error messages
- Passwords hashed with bcrypt; secrets kept out of the repo via `.env`
- Rate-limited login endpoint, Helmet security headers, CORS allow-list
- Automated backend test suite (Jest + Supertest) covering the actual
  permission boundaries, not just happy paths

---

## Tech Stack

| Layer      | Technology                                             |
|------------|---------------------------------------------------------|
| Frontend   | React 18, Vite, React Router, Tailwind CSS               |
| Backend    | Node.js, Express                                        |
| Database   | SQLite via Node's built-in `node:sqlite` module          |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs` for password hashing   |
| Security   | `helmet`, `express-rate-limit`, CORS allow-list          |
| Testing    | Jest, Supertest                                          |

SQLite was chosen over a hosted database so the project runs with zero
external setup (`npm install` is enough) while still using a real relational
schema with foreign keys, indexes, and constraints — not a flat JSON file.

**Note on the SQLite driver:** this project uses Node's built-in
`node:sqlite` module (`DatabaseSync`) instead of the third-party
`better-sqlite3` package. Both expose the same synchronous
prepare/run/get/all API, but `better-sqlite3` is a native addon — it needs
a prebuilt binary matching your exact Node version, OS, and CPU
architecture, and compiles from source (via `node-gyp`) if one isn't
available, which commonly fails on brand-new Node releases or machines
without build tools installed. `node:sqlite` ships inside Node itself, so
there's nothing to compile. **This requires Node.js 22.13.0 or later**
(check with `node -v`; if you're on an older version, install a current
LTS release from nodejs.org or via `nvm`). You'll see a one-line
`ExperimentalWarning: SQLite is an experimental feature` in the console —
that's expected and harmless. Swapping to PostgreSQL/MySQL later would
only mean changing `src/db.js` and the SQL dialect in the controllers,
since the query shapes are standard SQL.

---

## Project Structure

```
committee-task-manager/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Business logic (auth, tasks, users)
│   │   ├── middleware/        # JWT auth, role authorization, error handler
│   │   ├── routes/            # Express route definitions
│   │   ├── utils/validate.js  # Input validation helpers
│   │   ├── db.js              # SQLite connection + schema
│   │   ├── seed.js            # Demo users + sample tasks
│   │   └── server.js          # App entry point
│   ├── tests/                 # Jest + Supertest integration tests
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/client.js      # Fetch wrapper (auth header, error handling)
    │   ├── context/AuthContext.jsx
    │   ├── components/        # Navbar, TaskCard, TaskFormModal, etc.
    │   └── pages/              # Login, TechHeadDashboard, MemberDashboard
    ├── tailwind.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Open .env and set JWT_SECRET to a long random string
npm run seed     # creates the SQLite DB file and demo accounts/tasks
npm run dev       # starts the API on http://localhost:5000
```

Run the test suite any time with:
```bash
npm test
```

### 2. Frontend setup

In a second terminal:
```bash
cd frontend
npm install
npm run dev       # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000`
(see `frontend/vite.config.js`), so no CORS configuration is needed locally.

**Note on versions:** this project pins `vite@^8.2.2` and
`@vitejs/plugin-react@^6.1.0` together, since older plugin-react releases
(4.x) don't support Vite 8 and will fail during `npm install` with an
`ERESOLVE` peer-dependency error. If your npm still resolves an
incompatible pair (e.g. after editing dependencies), delete
`node_modules` and `package-lock.json` and reinstall.

### 3. Log in

Open `http://localhost:5173` and use one of the seeded accounts:

| Role                | Username   | Password        |
|---------------------|------------|-----------------|
| Tech Head           | `techhead` | `TechHead@123`  |
| Co-Committee Member | `member1`  | `Member1@123`   |
| Co-Committee Member | `member2`  | `Member2@123`   |

---

## Authentication & Authorization

**Authentication** — On login, the backend verifies the username/password
(bcrypt-hashed) and issues a signed JWT containing the user's id, username,
role, and name. The frontend stores this token and attaches it as a
`Bearer` header on every API call. Every protected route runs an
`authenticate` middleware that verifies the token's signature and expiry
before anything else executes.

**Authorization** — A second `authorize(...roles)` middleware checks the
decoded role against the roles allowed for that route (e.g. only
`tech_head` can hit `POST /api/tasks` or `DELETE /api/tasks/:id`). For the
one route both roles share — `PATCH /api/tasks/:id/status` — the controller
itself checks that a Co-Committee Member is only ever updating a task
where `assignee_id` matches their own user id; otherwise it returns `403`.
Fetching another member's task by ID returns `404` rather than `403`, so a
member can't use the error code to confirm a task exists at all. All of
this is enforced server-side — the dashboards simply reflect what the API
allows, so hiding a button in the UI is never the only line of defense.

---

## Brownie Points Addressed

- **Proper database with a well-structured data model** — SQLite with a
  normalized `users` / `tasks` schema, foreign keys (`ON DELETE CASCADE`
  for a deleted user's tasks), `CHECK` constraints on `role`, `status`, and
  `priority`, and indexes on the columns used for filtering.
- **Testing important workflows and role permissions** — 14 Jest/Supertest
  tests in `backend/tests/tasks.test.js`, covering login, invalid
  credentials, missing/invalid input, and every cross-role permission
  boundary (a member editing/deleting/viewing another member's task).
- **Better API error handling and validation messages** — a centralized
  error handler returns consistent `{ error, details }` JSON with
  field-level messages (see `utils/validate.js`), and login always returns
  a generic "invalid username or password" so it never reveals which part
  was wrong.
- **Security improvements beyond the basics** — bcrypt password hashing,
  JWT expiry, a rate limiter on the login endpoint, Helmet security
  headers, a CORS allow-list, and a request body size limit.
- **Handling edge cases and unexpected inputs** — server rejects tasks
  assigned to a Tech Head (only Co-Committee Members can be assignees),
  rejects invalid status/priority/date values, trims and length-limits
  text fields, and treats a deleted user's tasks via a cascading foreign
  key instead of leaving orphaned rows.
- **Clean, modular architecture** — routes → controllers → db, with
  validation and auth as separate middleware/utility layers, mirrored by a
  component/page/context split on the frontend.

**Not yet done:** the app has not been deployed to a live URL (e.g. Vercel
for the frontend + Railway/Render for the backend). The codebase is
deploy-ready — set the frontend's API base URL and the backend's
`CORS_ORIGIN`/`JWT_SECRET` env vars for the production domain — but no
live link is included in this submission.

---

## Screenshots

Add screenshots of the login page, Tech Head dashboard, and Co-Committee
Member dashboard here after running the app locally, as required by the
submission checklist.
