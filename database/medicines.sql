USE medivault;

CREATE TABLE IF NOT EXISTS medicines (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255) NULL,
  category VARCHAR(150) NULL,
  manufacturer VARCHAR(255) NULL,
  description TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_medicines_name (name),
  KEY idx_medicines_generic_name (generic_name)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
