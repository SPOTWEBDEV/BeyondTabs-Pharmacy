-- BeyondTabs Pharmacy — database schema
-- Import with: mysql -u root -p beyondtabs < schema.sql
-- (create the database first: CREATE DATABASE beyondtabs CHARACTER SET utf8mb4;)

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(30) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(190) NOT NULL,
  category VARCHAR(60) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  blurb TEXT,
  rx TINYINT(1) NOT NULL DEFAULT 0,
  image_path VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS consultations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) DEFAULT NULL,
  phone VARCHAR(30) NOT NULL,
  specialist_type ENUM('doctor', 'pharmacist', 'dentist', 'skin_specialist') NOT NULL,
  service VARCHAR(120) NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time VARCHAR(20) DEFAULT NULL,
  notes TEXT,
  status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  message TEXT NOT NULL,
  status ENUM('New', 'Read') NOT NULL DEFAULT 'New',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tagline VARCHAR(190) DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_period VARCHAR(30) NOT NULL DEFAULT 'month',
  features JSON NOT NULL,
  is_popular TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Single-row table holding store info editable from the admin Settings panel.
CREATE TABLE IF NOT EXISTS store_settings (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  store_name VARCHAR(150) NOT NULL DEFAULT 'BeyondTabs Pharmacy',
  phone VARCHAR(30) NOT NULL DEFAULT '0903 121 8118',
  hours_weekday VARCHAR(60) NOT NULL DEFAULT '8:00am – 10:00pm',
  address VARCHAR(255) NOT NULL DEFAULT 'Prince Ebeano Supermarket, Platinum Way, Jakande, Lagos',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO store_settings (id) VALUES (1);

-- Included for completeness / future use — the admin dashboard's Orders,
-- Customers and Prescriptions tables still run on demo data for now and
-- are not yet wired to these tables.
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  items TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(30) DEFAULT NULL,
  status ENUM('Pending', 'Processing', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS prescriptions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_name VARCHAR(150) NOT NULL,
  medication TEXT NOT NULL,
  status ENUM('Pending Review', 'Approved', 'Needs Clarification') NOT NULL DEFAULT 'Pending Review',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create your first admin account by running this from a terminal with PHP
-- installed (it prints a ready-to-run INSERT statement with a real bcrypt
-- hash — do NOT hand-type a password hash, it won't verify correctly):
--
--   php -r "echo \"INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ('BeyondTabs Admin', 'admin@beyondtabspharmacy.ng', '09031218118', '\" . password_hash('ChangeMe123!', PASSWORD_DEFAULT) . \"', 'admin');\" . PHP_EOL;"
--
-- Copy the printed INSERT statement and run it against your database, then
-- log in at /admin/login.html with that email/password and change it.
