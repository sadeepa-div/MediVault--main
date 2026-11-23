CREATE DATABASE IF NOT EXISTS medivault
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medivault;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  google_id VARCHAR(255) NULL,
  facebook_id VARCHAR(255) NULL,
  birthday DATE NULL,
  phone VARCHAR(20) NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_google_id (google_id),
  UNIQUE KEY uq_users_facebook_id (facebook_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medicines (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  generic_name VARCHAR(150) NULL,
  category VARCHAR(100) NULL,
  manufacturer VARCHAR(150) NULL,
  description TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_medicines_name (name),
  KEY idx_medicines_generic_name (generic_name)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pharmacies (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pharmacies_city (city)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pharmacy_stock (
  id INT NOT NULL AUTO_INCREMENT,
  pharmacy_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NULL,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pharmacy_stock_pharmacy_medicine (pharmacy_id, medicine_id),
  KEY idx_pharmacy_stock_medicine_quantity (medicine_id, quantity),
  CONSTRAINT fk_pharmacy_stock_pharmacy
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_pharmacy_stock_medicine
    FOREIGN KEY (medicine_id) REFERENCES medicines (id)
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Default data exported from the local database.
-- User accounts are intentionally excluded.

INSERT INTO pharmacies (name, address, city, phone, email)
SELECT 'City Pharmacy', 'Main Street', 'Colombo', '0112345678', 'city@example.com'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name = 'City Pharmacy' AND address = 'Main Street');

INSERT INTO pharmacies (name, address, city, phone, email)
SELECT 'HealthCare Pharmacy', 'Station Road', 'Negombo', '0312345678', 'healthcare@example.com'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name = 'HealthCare Pharmacy' AND address = 'Station Road');

INSERT INTO pharmacies (name, address, city, phone, email)
SELECT 'MediCare Pharmacy', 'Hospital Road', 'Gampaha', '0332345678', 'medicare@example.com'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name = 'MediCare Pharmacy' AND address = 'Hospital Road');

INSERT INTO medicines (name, generic_name, category, manufacturer, description)
SELECT 'Panadol', 'Paracetamol', 'Pain Relief', 'Haleon', 'Medicine product record'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Panadol');

INSERT INTO medicines (name, generic_name, category, manufacturer, description)
SELECT 'Amoxil', 'Amoxicillin', 'Antibiotic', 'GSK', 'Medicine product record'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Amoxil');

INSERT INTO medicines (name, generic_name, category, manufacturer, description)
SELECT 'Cetirizine', 'Cetirizine Hydrochloride', 'Antihistamine', 'Generic', 'Medicine product record'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Cetirizine');

INSERT INTO medicines (name, generic_name, category, manufacturer, description)
SELECT 'Vitamin C', 'Ascorbic Acid', 'Vitamin', 'Generic', 'Medicine product record'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM medicines WHERE name = 'Vitamin C');

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 100, 120.00
FROM pharmacies p JOIN medicines m ON m.name = 'Panadol'
WHERE p.name = 'City Pharmacy' AND p.address = 'Main Street'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 60, 125.00
FROM pharmacies p JOIN medicines m ON m.name = 'Panadol'
WHERE p.name = 'HealthCare Pharmacy' AND p.address = 'Station Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 0, 118.00
FROM pharmacies p JOIN medicines m ON m.name = 'Panadol'
WHERE p.name = 'MediCare Pharmacy' AND p.address = 'Hospital Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 30, 350.00
FROM pharmacies p JOIN medicines m ON m.name = 'Amoxil'
WHERE p.name = 'City Pharmacy' AND p.address = 'Main Street'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 15, 345.00
FROM pharmacies p JOIN medicines m ON m.name = 'Amoxil'
WHERE p.name = 'HealthCare Pharmacy' AND p.address = 'Station Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 70, 180.00
FROM pharmacies p JOIN medicines m ON m.name = 'Cetirizine'
WHERE p.name = 'HealthCare Pharmacy' AND p.address = 'Station Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 45, 175.00
FROM pharmacies p JOIN medicines m ON m.name = 'Cetirizine'
WHERE p.name = 'MediCare Pharmacy' AND p.address = 'Hospital Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 120, 250.00
FROM pharmacies p JOIN medicines m ON m.name = 'Vitamin C'
WHERE p.name = 'City Pharmacy' AND p.address = 'Main Street'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 90, 245.00
FROM pharmacies p JOIN medicines m ON m.name = 'Vitamin C'
WHERE p.name = 'MediCare Pharmacy' AND p.address = 'Hospital Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);
