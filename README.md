# HR Manager & Salary Analytics System

Clone the project, then run the backend and frontend in two terminals. No MySQL setup or environment files are needed for the demo.

## 1. Clone

    git clone https://github.com/Bantita-r/Std6730202262IPFinal-2026.git
    cd Std6730202262IPFinal-2026

## 2. Start the backend

In the first terminal:

    cd backend
    npm install
    npm start

The backend starts on port 3026 and uses five sample employees in memory.

## 3. Start the website

In a second terminal, from the project folder:

    cd frontend
    npm install
    npm run web

Open http://localhost:8081 and sign in with username admin and password password123. Create, change status, and delete employees from the website.

Demo changes reset when the backend restarts.

## MyPHP database (optional)

To use MyPHP instead of demo data, set the DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME environment values for the backend. The table structure is in backend/schema.sql. Never commit private .env files.