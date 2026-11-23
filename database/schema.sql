-- Medi_vault database schema (MySQL 8.0+)
SET NAMES utf8mb4;
-- Run:  mysql -u root -p < database/schema.sql

DROP DATABASE IF EXISTS medi_vault;
CREATE DATABASE medi_vault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medi_vault;

-- Everyone who can log in: customers, pharmacy owners and admins.
-- Owners start as 'pending' and can only log in after an admin approves them.
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  role          ENUM('customer','owner','admin') NOT NULL DEFAULT 'customer',
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  full_name     VARCHAR(120) NOT NULL,
  phone         VARCHAR(20),
  birthday      DATE,
  id_no         VARCHAR(20),               -- national ID (NIC) number
  address       VARCHAR(255),
  photo_url     VARCHAR(255),
  status        ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- One pharmacy (shop) per owner.
CREATE TABLE pharmacies (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  owner_id          INT NOT NULL UNIQUE,
  name              VARCHAR(120) NOT NULL,
  license_no        VARCHAR(50)  NOT NULL,   -- "pharmacy valid ID no"
  address           VARCHAR(255),
  city              VARCHAR(80),
  phone             VARCHAR(20),
  email             VARCHAR(120),
  description       TEXT,
  opening_hours     VARCHAR(120),
  is_open           TINYINT(1) NOT NULL DEFAULT 1,
  image_url         VARCHAR(255),
  bank_name         VARCHAR(80),
  bank_account_no   VARCHAR(40),
  bank_account_name VARCHAR(120),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pharmacy_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE medicines (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  pharmacy_id           INT NOT NULL,
  name                  VARCHAR(120) NOT NULL,
  generic_name          VARCHAR(120),
  category              VARCHAR(60),
  manufacturer          VARCHAR(120),
  dosage                VARCHAR(60),
  description           TEXT,
  price                 DECIMAL(10,2) NOT NULL,
  stock_qty             INT NOT NULL DEFAULT 0,
  low_stock_threshold   INT NOT NULL DEFAULT 10,
  requires_prescription TINYINT(1) NOT NULL DEFAULT 0,
  image_url             VARCHAR(255),
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_med_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
  INDEX idx_med_name (name)
);

CREATE TABLE cart_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_cart (user_id, medicine_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_med  FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

-- A checkout creates one order per pharmacy in the cart.
CREATE TABLE orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  customer_id      INT NOT NULL,
  pharmacy_id      INT NOT NULL,
  total            DECIMAL(10,2) NOT NULL,
  status           ENUM('pending','confirmed','ready','completed','cancelled') NOT NULL DEFAULT 'pending',
  payment_method   ENUM('cash_on_delivery','card','bank_transfer') NOT NULL,
  payment_status   ENUM('unpaid','paid') NOT NULL DEFAULT 'unpaid',
  delivery_address VARCHAR(255),
  contact_phone    VARCHAR(20),
  note             VARCHAR(255),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_order_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id)
);

CREATE TABLE order_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  medicine_id   INT,
  medicine_name VARCHAR(120) NOT NULL,
  unit_price    DECIMAL(10,2) NOT NULL,
  quantity      INT NOT NULL,
  CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_med   FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL
);

CREATE TABLE feedback (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  pharmacy_id INT NOT NULL,
  medicine_id INT,
  rating      TINYINT NOT NULL,
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fb_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fb_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
  CONSTRAINT fk_fb_med FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  type       VARCHAR(30) NOT NULL,   -- order, feedback, stock, account
  message    VARCHAR(255) NOT NULL,
  link       VARCHAR(120),
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
