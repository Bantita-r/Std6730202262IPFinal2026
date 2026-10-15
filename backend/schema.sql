-- HR Manager & Salary Analytics System
-- Employee table schema for the instructor-provided MySQL database.
-- This file contains structure only; it does not export live employee records.

CREATE TABLE IF NOT EXISTS employees (
  BanRat_id INT NOT NULL AUTO_INCREMENT,
  BanRat_name VARCHAR(120) NOT NULL,
  BanRat_position VARCHAR(120) NOT NULL,
  BanRat_status ENUM('Active', 'On Leave') NOT NULL DEFAULT 'Active',
  BanRat_salary DECIMAL(12, 2) NOT NULL,
  PRIMARY KEY (BanRat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
