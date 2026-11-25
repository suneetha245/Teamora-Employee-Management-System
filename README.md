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
cp .env.example .env
npm run seed
npm run dev

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| HR/Admin | hr@teamora.com | Admin@123 |
| Employee | aarav.sharma@teamora.com | Employee@123 |

All seeded employees share `Employee@123`. Change these before any real use.

## How it works

- No public registration. HR creates employees and their login accounts.
- Employee IDs and department IDs are generated automatically.
- Passwords are securely hashed.
- HR and Employee permissions are enforced on the server.

## Project structure

```text
backend/   config · controllers · middleware · models · routes · utils · seed.js · server.js
frontend/  src/{components,pages,layouts,services,context,hooks,assets}
```

## Production notes

- Set a strong random `JWT_SECRET` and the correct `CLIENT_URL` in `backend/.env`.
- Never upload `.env` files or credentials to GitHub.
- Serve the API over HTTPS.