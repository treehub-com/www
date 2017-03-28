# Codes
CREATE TABLE IF NOT EXISTS codes (
  code VARCHAR(64) NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  expires DATETIME NOT NULL,
  PRIMARY KEY (code),
  KEY (expires)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Tokens
CREATE TABLE IF NOT EXISTS tokens (
  token VARCHAR(36) NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires DATETIME NOT NULL,
  description VARCHAR(128),
  PRIMARY KEY (token),
  KEY (user_id),
  KEY (expires)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
