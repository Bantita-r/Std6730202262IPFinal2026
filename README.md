HR Manager & Salary Analytics System (new independent project)
Backend uses the instructor's MyPHP/MySQL database. Copy backend/.env.example to backend/.env and enter the host, database, username, and password supplied by the instructor.
Backend: cd backend; npm install; npm start
Frontend (second terminal): cd frontend; npm install; npx expo start --web
Database structure: backend/schema.sql. GitHub stores this schema file, while the live MySQL database remains on the instructor-provided server. On first backend start, generic employee columns are renamed to BanRat_* automatically; five sample employees are added only when the table is empty.`nDemo login: admin / password123.