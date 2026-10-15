# HR Manager & Salary Analytics System

Clone the project and run the frontend. It connects to the course backend, which uses the MyPHP employee database. The backend must be running on the course server while the instructor checks the app.

## Run after cloning

Prerequisite: Node.js 22.13 or newer.

    git clone https://github.com/Bantita-r/Std6730202262IPFinal-2026.git
    cd Std6730202262IPFinal-2026
    cd frontend
    npm install
    npm run web

Open http://localhost:8081 and sign in with:

- Username: admin
- Password: password123

The website uses the real API at http://119.59.102.161:3026/api, so employee create, status update, delete, and salary analysis use the MyPHP database. No local MySQL setup or database credentials are needed to run the frontend.

The backend source and database schema are included in this repository. The backend's private .env file stays on the course server and is not committed to GitHub. If the API is unavailable, the course server process needs to be restarted before checking the app.

The schema is in backend/schema.sql and uses BanRat_id, BanRat_name, BanRat_position, BanRat_status, and BanRat_salary.