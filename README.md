HR Manager & Salary Analytics System (new independent project)
Backend uses the instructor's MyPHP/MySQL database. Copy backend/.env.example to backend/.env and enter the host, database, username, and password supplied by the instructor.
Backend: cd backend; npm install; npm start
Frontend (second terminal): cd frontend; npm install; npx expo start --web
Demo login: admin / password123. On first backend start, the employees table uses BanRat_id, BanRat_name, BanRat_position, BanRat_status, and BanRat_salary. Existing generic columns are renamed automatically; five sample employees are added only when the table is empty.