USE medivault;

CREATE TABLE IF NOT EXISTS pharmacies (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NULL,
  city VARCHAR(150) NULL,
  phone VARCHAR(32) NULL,
  PRIMARY KEY (id),
  KEY idx_pharmacies_city (city)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
