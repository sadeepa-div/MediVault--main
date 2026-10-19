USE medivault;

CREATE TABLE IF NOT EXISTS pharmacy_stock (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  pharmacy_id BIGINT UNSIGNED NOT NULL,
  medicine_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
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
