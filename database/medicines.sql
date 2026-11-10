USE medivault;

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
