CREATE TABLE IF NOT EXISTS app_users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(190) NOT NULL,
  role ENUM('ADMIN','STAFF') NOT NULL DEFAULT 'ADMIN',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_email (email)
);

CREATE TABLE IF NOT EXISTS plans (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  price_ugx INT NOT NULL,
  validity_minutes INT NOT NULL,
  rate_down_kbps INT NOT NULL,
  rate_up_kbps INT NOT NULL,
  data_cap_mb INT NULL,
  radius_group VARCHAR(64) NOT NULL,
  is_active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_radius_group (radius_group)
);

CREATE TABLE IF NOT EXISTS subscribers (
  id BIGINT NOT NULL AUTO_INCREMENT,
  customer_name VARCHAR(160) NOT NULL,
  phone_e164 VARCHAR(32) NULL,
  username VARCHAR(64) NOT NULL,
  password_plain VARCHAR(64) NULL,
  mac_address VARCHAR(32) NULL,
  auth_type ENUM('USERNAME_PASSWORD','VOUCHER','MAC') NOT NULL DEFAULT 'USERNAME_PASSWORD',
  is_active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_username (username)
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  subscriber_id BIGINT NOT NULL,
  plan_id BIGINT NOT NULL,
  status ENUM('PENDING','ACTIVE','EXPIRED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  starts_at DATETIME NULL,
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_subscriber (subscriber_id)
  -- Foreign keys to subscribers(id) and plans(id) are intentionally omitted here
  -- to avoid issues when running this init script in environments where
  -- strict FK checks or creation order might cause errors.
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT NOT NULL AUTO_INCREMENT,
  provider VARCHAR(32) NOT NULL,
  tx_ref VARCHAR(120) NOT NULL,
  amount_ugx INT NOT NULL,
  subscriber_id BIGINT NOT NULL,
  plan_id BIGINT NOT NULL,
  status ENUM('INITIATED','PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'INITIATED',
  provider_reference VARCHAR(190) NULL,
  raw_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_tx_ref (tx_ref)
);

CREATE TABLE IF NOT EXISTS company_settings (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(190) NULL,
  phone VARCHAR(64) NULL,
  address VARCHAR(255) NULL,
  note TEXT NULL,
  logo_url VARCHAR(255) NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS nas (
  id INT NOT NULL AUTO_INCREMENT,
  nasname VARCHAR(128) NOT NULL,
  shortname VARCHAR(32),
  type VARCHAR(30) DEFAULT 'other',
  ports INT,
  secret VARCHAR(60) NOT NULL DEFAULT 'testing123',
  description VARCHAR(200),
  PRIMARY KEY (id),
  KEY nasname (nasname)
);
