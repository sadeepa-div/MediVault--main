-- Seed data exported from the configured local MySQL database.
-- Contains medicines, pharmacies, and stock only; user accounts are excluded.
-- Pharmacy name/address and medicine name identify records when this file is re-run.
USE medivault;

-- Pharmacies
INSERT INTO pharmacies (name, address, city, phone, email)
SELECT 'City Pharmacy', 'Main Street', 'Colombo', '0112345678', 'city@example.com'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name = 'City Pharmacy' AND address = 'Main Street');

INSERT INTO pharmacies (name, address, city, phone, email)
SELECT 'HealthCare Pharmacy', 'Station Road', 'Negombo', '0312345678', 'healthcare@example.com'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name = 'HealthCare Pharmacy' AND address = 'Station Road');

INSERT INTO pharmacies (name, address, city, phone, email)
SELECT 'MediCare Pharmacy', 'Hospital Road', 'Gampaha', '0332345678', 'medicare@example.com'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM pharmacies WHERE name = 'MediCare Pharmacy' AND address = 'Hospital Road');

-- Medicines
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

-- Pharmacy stock
INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 100, '120.00'
FROM pharmacies p JOIN medicines m ON m.name = 'Panadol'
WHERE p.name = 'City Pharmacy' AND p.address = 'Main Street'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 60, '125.00'
FROM pharmacies p JOIN medicines m ON m.name = 'Panadol'
WHERE p.name = 'HealthCare Pharmacy' AND p.address = 'Station Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 0, '118.00'
FROM pharmacies p JOIN medicines m ON m.name = 'Panadol'
WHERE p.name = 'MediCare Pharmacy' AND p.address = 'Hospital Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 30, '350.00'
FROM pharmacies p JOIN medicines m ON m.name = 'Amoxil'
WHERE p.name = 'City Pharmacy' AND p.address = 'Main Street'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 15, '345.00'
FROM pharmacies p JOIN medicines m ON m.name = 'Amoxil'
WHERE p.name = 'HealthCare Pharmacy' AND p.address = 'Station Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 70, '180.00'
FROM pharmacies p JOIN medicines m ON m.name = 'Cetirizine'
WHERE p.name = 'HealthCare Pharmacy' AND p.address = 'Station Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 45, '175.00'
FROM pharmacies p JOIN medicines m ON m.name = 'Cetirizine'
WHERE p.name = 'MediCare Pharmacy' AND p.address = 'Hospital Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 120, '250.00'
FROM pharmacies p JOIN medicines m ON m.name = 'Vitamin C'
WHERE p.name = 'City Pharmacy' AND p.address = 'Main Street'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);

INSERT INTO pharmacy_stock (pharmacy_id, medicine_id, quantity, price)
SELECT p.id, m.id, 90, '245.00'
FROM pharmacies p JOIN medicines m ON m.name = 'Vitamin C'
WHERE p.name = 'MediCare Pharmacy' AND p.address = 'Hospital Road'
  AND NOT EXISTS (SELECT 1 FROM pharmacy_stock ps WHERE ps.pharmacy_id = p.id AND ps.medicine_id = m.id);
