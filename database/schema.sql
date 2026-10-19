CREATE DATABASE IF NOT EXISTS medivault
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medivault;

-- Run the table scripts in this order after creating the database:
-- 1. users.sql
-- 2. medicines.sql
-- 3. pharmacies.sql
-- 4. pharmacy_stock.sql
