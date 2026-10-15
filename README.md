# Nutrition & Diet Tracker

Full-stack project with React + Vite frontend and Node.js + Express + SQLite backend.

## Requirements
- Node.js 18+ (Node 22 recommended)
- npm

## Run backend
```bash
cd backend
npm install
npm start
```
Backend: http://localhost:4000

## Run frontend (separate terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

Register with an email and password on the first screen, then log in. The frontend uses the backend API at `http://localhost:4000`.

## Features
- Email/password registration and login; bcrypt password hashing; JWT auth
- Manual food logging
- Barcode camera scanning when supported by the browser; manual barcode lookup through Open Food Facts
- Daily and weekly calorie, carbohydrate and protein summaries
- User-configurable daily calorie goal and on-screen warning when exceeded
- Optional email notification (requires SMTP environment variables)
- Same food limited to 3 logs per local calendar day
- Prevents two logs for the same user at the exact timestamp
- User-scoped log history, with API retrieval defaulting to the last year
- Recent logs and basic nutrition chart
- Large accessible controls
- No Docker files and no push endpoint

## Email alerts (optional)
Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in your environment before starting backend. Configure notification email and enable notifications in Profile. Without SMTP settings, on-screen alerts still work.

## Notes
- Open Food Facts nutrition values are often per 100 g; check the returned product details before relying on them.
- Camera access requires localhost or HTTPS and browser permission.
- SQLite database is created at `backend/data.sqlite3` on first start.

## Project Status
Developed as a full-stack academic project.