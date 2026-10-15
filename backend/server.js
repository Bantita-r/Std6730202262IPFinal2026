const path = require('path');
require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = Number(process.env.PORT || 3026);
const DEMO_TOKEN = 'mock-jwt-token';
const EMPLOYEE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS employees (
    BanRat_id INT AUTO_INCREMENT PRIMARY KEY,
    BanRat_name VARCHAR(120) NOT NULL,
    BanRat_position VARCHAR(120) NOT NULL,
    BanRat_status ENUM('Active', 'On Leave') NOT NULL DEFAULT 'Active',
    BanRat_salary DECIMAL(12, 2) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

const databaseSettings = [process.env.DB_HOST, process.env.DB_USER, process.env.DB_NAME];
const hasDatabaseSettings = databaseSettings.some(Boolean);
const databaseConfigured = databaseSettings.every(Boolean);
if (hasDatabaseSettings && !databaseConfigured) {
  throw new Error('Set DB_HOST, DB_USER, and DB_NAME together, or omit them to use demo data.');
}

const db = databaseConfigured
  ? mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit: 5,
      waitForConnections: true,
    })
  : null;
let inMemoryEmployees = [];

app.use(cors());
app.use(express.json({ limit: '32kb' }));

function sendError(response, status, message) {
  return response.status(status).json({ success: false, message });
}

function toEmployee(row) {
  return { ...row, id: String(row.id), salary: Number(row.salary) };
}

function requireAuth(request, response, next) {
  if (request.headers.authorization !== `Bearer ${DEMO_TOKEN}`) {
    return sendError(response, 401, 'Unauthorized');
  }
  return next();
}

async function migrateEmployeeColumns() {
  const [columns] = await db.query('SHOW COLUMNS FROM employees');
  const existing = new Set(columns.map((column) => column.Field));
  const legacyColumns = [
    ['id', 'BanRat_id', 'INT NOT NULL AUTO_INCREMENT'],
    ['name', 'BanRat_name', 'VARCHAR(120) NOT NULL'],
    ['position', 'BanRat_position', 'VARCHAR(120) NOT NULL'],
    ['status', 'BanRat_status', "ENUM('Active', 'On Leave') NOT NULL DEFAULT 'Active'"],
    ['salary', 'BanRat_salary', 'DECIMAL(12, 2) NOT NULL'],
  ];

  for (const [oldName, newName, definition] of legacyColumns) {
    if (!existing.has(newName) && existing.has(oldName)) {
      await db.query(`ALTER TABLE employees CHANGE COLUMN \`${oldName}\` \`${newName}\` ${definition}`);
      existing.delete(oldName);
      existing.add(newName);
    }
  }
}


async function initializeDatabase() {
  if (!db) {
    inMemoryEmployees = [
      { id: '1', name: 'John Doe', position: 'Software Engineer', status: 'Active', salary: 45000 },
      { id: '2', name: 'Jane Smith', position: 'HR Manager', status: 'Active', salary: 65000 },
      { id: '3', name: 'Alex Brown', position: 'Designer', status: 'On Leave', salary: 35000 },
      { id: '4', name: 'Sam Lee', position: 'Accountant', status: 'Active', salary: 45000 },
      { id: '5', name: 'Maya Chen', position: 'Project Manager', status: 'Active', salary: 85000 },
    ];
    console.log('Using in-memory demo employees.');
    return;
  }

  await db.query(EMPLOYEE_TABLE_SQL);
  await migrateEmployeeColumns();
  const [[{ count }]] = await db.query('SELECT COUNT(*) AS count FROM employees');
  if (count > 0) return;

  const seedEmployees = [
    ['John Doe', 'Software Engineer', 'Active', 45000],
    ['Jane Smith', 'HR Manager', 'Active', 65000],
    ['Alex Brown', 'Designer', 'On Leave', 35000],
    ['Sam Lee', 'Accountant', 'Active', 45000],
    ['Maya Chen', 'Project Manager', 'Active', 85000],
  ];
  await db.query(
    'INSERT INTO employees (`BanRat_name`, `BanRat_position`, `BanRat_status`, `BanRat_salary`) VALUES ?',
    [seedEmployees],
  );
}

// Login required by the exam specification.
app.post('/api/login', (request, response) => {
  const { username, password } = request.body || {};
  if (username === 'admin' && password === 'password123') {
    return response.status(200).json({ success: true, token: DEMO_TOKEN });
  }
  return sendError(response, 401, 'Invalid username or password');
});

app.get('/api/employees', requireAuth, async (request, response) => {
  if (!db) return response.json(inMemoryEmployees);
  try {
    const [rows] = await db.query('SELECT `BanRat_id` AS id, `BanRat_name` AS name, `BanRat_position` AS position, `BanRat_status` AS status, `BanRat_salary` AS salary FROM employees ORDER BY `BanRat_id`');
    return response.json(rows.map(toEmployee));
  } catch (error) {
    console.error('Could not read employees:', error.message);
    return sendError(response, 500, 'Could not load employees');
  }
});

app.post('/api/employees', requireAuth, async (request, response) => {
  const { name, position, salary } = request.body || {};
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof position !== 'string' || !position.trim() ||
    typeof salary !== 'number' || !Number.isFinite(salary) || salary < 0
  ) {
    return sendError(response, 400, 'Name, position, and non-negative numeric salary are required');
  }

    try {
    if (!db) {
      const employee = {
        id: String(inMemoryEmployees.reduce((max, item) => Math.max(max, Number(item.id)), 0) + 1),
        name: name.trim(),
        position: position.trim(),
        status: 'Active',
        salary,
      };
      inMemoryEmployees.push(employee);
      return response.status(201).json(employee);
    }
    const [result] = await db.execute(
      'INSERT INTO employees (`BanRat_name`, `BanRat_position`, `BanRat_salary`) VALUES (?, ?, ?)',
      [name.trim(), position.trim(), salary],
    );
    return response.status(201).json({
      id: String(result.insertId),
      name: name.trim(),
      position: position.trim(),
      status: 'Active',
      salary,
    });
  } catch (error) {
    console.error('Could not add employee:', error.message);
    return sendError(response, 500, 'Could not add employee');
  }
});

app.put('/api/employees/:id/status', requireAuth, async (request, response) => {
  const { status } = request.body || {};
  if (!['Active', 'On Leave'].includes(status)) {
    return sendError(response, 400, 'Status must be Active or On Leave');
  }

    try {
    if (!db) {
      const employee = inMemoryEmployees.find((item) => item.id === String(request.params.id));
      if (!employee) return sendError(response, 404, 'Employee not found');
      employee.status = status;
      return response.json(employee);
    }
    const [result] = await db.execute(
      'UPDATE employees SET `BanRat_status` = ? WHERE `BanRat_id` = ?',
      [status, request.params.id],
    );
    if (!result.affectedRows) return sendError(response, 404, 'Employee not found');

    const [[employee]] = await db.execute(
      'SELECT `BanRat_id` AS id, `BanRat_name` AS name, `BanRat_position` AS position, `BanRat_status` AS status, `BanRat_salary` AS salary FROM employees WHERE `BanRat_id` = ?',
      [request.params.id],
    );
    return response.json(toEmployee(employee));
  } catch (error) {
    console.error('Could not update employee status:', error.message);
    return sendError(response, 500, 'Could not update employee status');
  }
});

app.delete('/api/employees/:id', requireAuth, async (request, response) => {
    try {
    if (!db) {
      const index = inMemoryEmployees.findIndex((item) => item.id === String(request.params.id));
      if (index < 0) return sendError(response, 404, 'Employee not found');
      inMemoryEmployees.splice(index, 1);
      return response.json({ success: true });
    }
    const [result] = await db.execute(
      'DELETE FROM employees WHERE `BanRat_id` = ?',
      [request.params.id],
    );
    if (!result.affectedRows) return sendError(response, 404, 'Employee not found');
    return response.json({ success: true });
  } catch (error) {
    console.error('Could not delete employee:', error.message);
    return sendError(response, 500, 'Could not delete employee');
  }
});

function kMeans(values, k = 3) {
  if (values.length < k) throw new Error(`At least ${k} employees are required`);
  const sorted = [...values].sort((left, right) => left - right);
  let centroids = [sorted[0], sorted[Math.floor((sorted.length - 1) / 2)], sorted[sorted.length - 1]];

  for (let iteration = 0; iteration < 100; iteration += 1) {
    const groups = centroids.map(() => []);
    values.forEach((value) => {
      let closest = 0;
      for (let index = 1; index < k; index += 1) {
        if (Math.abs(value - centroids[index]) < Math.abs(value - centroids[closest])) closest = index;
      }
      groups[closest].push(value);
    });

    const nextCentroids = groups.map((group, index) => (
      group.length ? group.reduce((sum, value) => sum + value, 0) / group.length : centroids[index]
    ));
    const converged = nextCentroids.every((value, index) => Math.abs(value - centroids[index]) < 0.000001);
    centroids = nextCentroids;
    if (converged) break;
  }

  const groups = centroids.map((centroid) => ({ centroid, values: [] }));
  values.forEach((value) => {
    let closest = 0;
    for (let index = 1; index < k; index += 1) {
      if (Math.abs(value - centroids[index]) < Math.abs(value - centroids[closest])) closest = index;
    }
    groups[closest].values.push(value);
  });

  return groups
    .filter((group) => group.values.length)
    .sort((left, right) => left.centroid - right.centroid)
    .map((group, index) => ({
      group: `Tier ${index + 1}`,
      centroid: Math.round(group.centroid),
      count: group.values.length,
      average: Math.round(group.values.reduce((sum, value) => sum + value, 0) / group.values.length),
    }));
}

app.get('/api/employees/salary-clusters', requireAuth, async (request, response) => {
    try {
    const rows = db
      ? (await db.query('SELECT BanRat_salary AS salary FROM employees'))[0]
      : inMemoryEmployees.map((employee) => ({ salary: employee.salary }));if (rows.length < 3) return sendError(response, 400, 'At least 3 employees are required');

    const salaries = rows.map((row) => Number(row.salary));
    const clusters = kMeans(salaries);
    return response.json({
      success: true,
      totalEmployees: salaries.length,
      overallAverage: Math.round(salaries.reduce((sum, value) => sum + value, 0) / salaries.length),
      clusters,
    });
  } catch (error) {
    console.error('Could not analyze salary data:', error.message);
    return sendError(response, 500, 'Could not analyze salary data');
  }
});

const frontendDirectory = path.join(__dirname, 'public');
app.use(express.static(frontendDirectory));
app.get(/^(?!\/api(?:\/|$)).*/, (_request, response, next) => {
  response.sendFile(path.join(frontendDirectory, 'index.html'), (error) => {
    if (error) next();
  });
});
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`HR API ready on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  }
}

startServer();