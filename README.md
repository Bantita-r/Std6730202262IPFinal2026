# HR Manager & Salary Analytics System

An Expo web app and Express API for employee management and salary analytics.

## Run after cloning

Prerequisite: Node.js 22.13 or newer.

Clone the public repository, then run the backend and frontend in separate terminals:

    git clone https://github.com/Bantita-r/Std6730202262IPFinal-2026.git
    cd Std6730202262IPFinal-2026

### Terminal 1: backend

    cd backend
    Copy-Item .env.example .env
    npm install
    npm start

By default, the backend starts on port 3026 and loads five sample employees into memory. No MySQL server or private credentials are needed. Create, update-status, delete, and salary-cluster features work with this demo data. Changes reset when the backend restarts.

### Terminal 2: frontend

    cd frontend
    Copy-Item .env.example .env
    npm install
    npm run web

Open http://localhost:8081 and sign in with:

- Username: admin
- Password: password123

## Use MyPHP instead of demo data

To connect to MyPHP, add DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME to backend/.env. The backend then creates or migrates the employees table and uses MySQL. Never commit .env files; they contain credentials.

The required table structure is in backend/schema.sql. It uses BanRat_id, BanRat_name, BanRat_position, BanRat_status, and BanRat_salary. The backend inserts the sample employees only if the table is empty.

## Optional: serve a built website from the backend

The backend can also serve a production web build from backend/public. Set EXPO_PUBLIC_API_URL to the public backend URL before building, then run this in frontend:

    npm run build:web

Upload the contents of frontend/dist to backend/public on the server and restart the backend.