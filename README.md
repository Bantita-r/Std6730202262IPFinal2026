# HR Manager & Salary Analytics System

A React Native (Expo) frontend and Express/MySQL backend for employee management and salary analysis.

## Run the frontend

From `frontend`, install dependencies, copy `.env.example` to `.env`, then start Expo Web:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run web
```

The example frontend API URL points to the deployed course backend. Sign in with the exam demo account `admin` / `password123`.

## Run the backend locally

The backend needs MySQL access. Copy `backend/.env.example` to `backend/.env` and fill in the MyPHP host, database, username, and password provided for your environment. Then run:

```powershell
cd backend
npm install
npm start
```

Do not commit `.env` files. They contain connection credentials and are excluded by `.gitignore`.

## Database

`backend/schema.sql` defines the `employees` table using `BanRat_id`, `BanRat_name`, `BanRat_position`, `BanRat_status`, and `BanRat_salary`. The live MySQL database remains on the MyPHP server; GitHub stores the schema, not the running database. On backend startup, existing generic employee columns are renamed while preserving rows. Five mock employees are inserted only when the table is empty.
