# Job Portal (React + Node/Express + MySQL)

## Features
- Email/password signup & login with JWT, bcrypt hashing, two roles: **Job Seeker** and **Employer**
- Job search with keyword, location, type, category filters + pagination
- Apply to jobs with cover letter + resume upload (PDF/DOC/DOCX), one application per job
- Save / unsave jobs, track application status
- Employers: post / edit / close / delete jobs, view applicants, download resumes, update status
- Profile editing and change password

## Setup
1. Create an empty MySQL database (default name `job_portal`):
   `CREATE DATABASE job_portal;`
2. Open `backend/.env` and fill in `DB_USER`, `DB_PASSWORD` (and `DB_NAME` if you used a different name). Set a strong `JWT_SECRET`.
3. In the project root run:
   ```
   npm run install-all
   npm run dev
   ```
4. Open http://localhost:5173 (API runs on http://localhost:5000). Tables are created automatically on first start.

Run separately: `cd backend && npm run dev` and `cd frontend && npm run dev`.

## API overview
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET/PUT | /api/auth/me | auth |
| PUT | /api/auth/password | auth |
| GET | /api/jobs?search=&location=&type=&category=&page= | public |
| GET | /api/jobs/:id, /api/jobs/categories | public |
| POST/PUT/DELETE | /api/jobs, /api/jobs/:id | employer |
| GET | /api/jobs/employer/mine | employer |
| POST | /api/applications/:jobId (multipart `resume`) | job seeker |
| GET | /api/applications/mine | job seeker |
| GET | /api/applications/job/:jobId | employer |
| PATCH | /api/applications/:id/status | employer |
| GET / POST(toggle) | /api/saved, /api/saved/:jobId | job seeker |
