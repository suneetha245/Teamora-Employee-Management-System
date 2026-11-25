# Teamora – Smart Employee Management System

A full-stack HRMS: landing page, secure login, separate HR/Admin and Employee dashboards, employee CRUD, department management and Excel reporting.

**Stack:** React 18 (Vite), React Router, Axios, Recharts, Lucide, React Toastify · Node.js, Express · MongoDB + Mongoose · JWT, bcrypt hashing, role-based authorization · ExcelJS

## Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

## Run locally

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # then edit JWT_SECRET (and MONGO_URI if not local)
npm run seed                # demo departments, HR account, employees
npm run dev                 # API on http://localhost:5006

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                 # App on http://localhost:5173
```

## Demo accounts (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| HR/Admin | hr@teamora.com | Admin@123 |
| Employee | aarav.sharma@teamora.com | Employee@123 |

All seeded employees (`meera.nair`, `divya.rao`, `karthik.shetty`, … `@teamora.com`) share `Employee@123`. Change these before any real use.

## How it works
- **No public registration.** HR creates employees; Teamora creates their login with a random temporary password that HR sees once (and can reset from the employee profile). Everyone can change their password under Settings.
- **Permissions are enforced on the server.** `protect` verifies the JWT on every request; `hrOnly` guards all HR routes. Employees can call only `GET /api/employees/:id` for their own record (403 otherwise). The login also checks the selected role matches the account's role.
- **Employee IDs** (`EMP-0001…`) and department IDs (`DEP-001…`) are generated automatically.
- A department with employees can't be deleted; resigned employees can't sign in.

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/login | Public (rate limited) |
| POST | /api/auth/logout | Any |
| GET | /api/auth/me | Signed in |
| PUT | /api/auth/change-password | Signed in |
| POST/GET | /api/employees | HR |
| GET | /api/employees/:id | HR, or the employee for their own record |
| PUT/DELETE | /api/employees/:id | HR |
| POST | /api/employees/:id/reset-password | HR |
| POST/GET | /api/departments | HR |
| PUT/DELETE | /api/departments/:id | HR |
| GET | /api/reports/summary | HR (dashboard data) |
| GET | /api/reports/employees?department=ID_OR_all | HR (JSON preview) |
| GET | /api/reports/employees/export?department=ID_OR_all | HR (.xlsx download) |

`GET /api/employees` supports `search`, `department`, `status`, `page`, `limit`.

## Excel export
Choose a department (or all) under **Reports & Export**. A single department produces one sheet; "All departments" produces an **All Employees** sheet plus one sheet per department. **Share** uses the browser's native share sheet where supported (mostly mobile); otherwise download the file and share it.

## Images
The landing and login pages use placeholder team photos from Unsplash (see `frontend/src/config.js`). Drop your own images into `frontend/public/` and point those constants at them (e.g. `'/team.jpg'`). If an image fails to load, a navy background shows instead.

## Project structure
```
backend/   config · controllers · middleware · models · routes · utils · seed.js · server.js
frontend/  src/{components,pages,layouts,services,context,hooks,assets}
```

## Production notes
- Set a long random `JWT_SECRET` and the real `CLIENT_URL` in `backend/.env`.
- Uploaded photos are stored on disk in `backend/uploads`; use object storage (S3 etc.) if you deploy to ephemeral hosting.
- Serve the API over HTTPS. Tokens are sent as Bearer headers.
