# Packages
CREATE TABLE IF NOT EXISTS packages (
  id varchar(128) NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Package owners
CREATE TABLE IF NOT EXISTS package_owners (
  package_id varchar(128) NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  UNIQUE KEY (package_id, user_id),
  KEY (package_id),
  KEY (user_id)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
