# Package versions
CREATE TABLE IF NOT EXISTS package_versions (
  package_id varchar(128) NOT NULL,
  version INT UNSIGNED NOT NULL,
  created DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (package_id, version),
  KEY (package_id)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
