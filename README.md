# HR Manager & Salary Analytics System

A React Native Expo frontend and Express/MySQL backend for employee management and salary analysis.

## Demo login

- Username: admin
- Password: password123

## Run locally

Run the backend and frontend in separate terminals.

### Backend

Copy backend/.env.example to backend/.env, then set the MyPHP host, database, username, and password for the database you can access.

    cd backend
    npm install
    npm start

### Frontend

Copy frontend/.env.example to frontend/.env. Keep EXPO_PUBLIC_API_URL pointed at the reachable backend (the course server value is in the example file).

    cd frontend
    npm install
    npm run web

The development website opens at http://localhost:8081.

## Publish the website on the course server

The backend serves both the API and the production website from one public port. This lets the instructor open the website from another computer and test employee create, update, and delete operations against the MyPHP database.

1. In frontend/.env, set EXPO_PUBLIC_API_URL to the public API URL, for example http://119.59.102.161:3026/api.
2. Build the production website:

       cd frontend
       npm install
       npm run build:web

   Expo exports the static site to frontend/dist.
3. Upload the contents of frontend/dist to /app/HRManagerSalaryExam/backend/public using SFTP. Do not upload node_modules.
4. Upload the updated backend/server.js to /app/HRManagerSalaryExam/backend. In FileZilla, create a public folder inside backend if it does not exist, then upload the contents of frontend/dist into it. Keep the server's existing backend/.env on the server; do not upload or commit it.
5. In PuTTY, restart the backend from /app/HRManagerSalaryExam/backend:

       npm install
       node server.js

6. Open http://119.59.102.161:3026 from a different device or a private browser window. Sign in and try adding, changing status, and deleting a test employee.

The public app depends on the course server process and its MySQL connection staying available.

## Database

backend/schema.sql defines the employees table with the instructor-required columns: BanRat_id, BanRat_name, BanRat_position, BanRat_status, and BanRat_salary. The backend creates the table if missing, renames the earlier generic columns while preserving existing rows, and inserts five mock employees only when the table is empty.

Do not commit .env files. They contain database credentials and are excluded by .gitignore.