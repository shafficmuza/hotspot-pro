CREATE TABLE IF NOT EXISTS radcheck (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '==',
  value VARCHAR(253) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY username (username(32))
);

CREATE TABLE IF NOT EXISTS radreply (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '=',
  value VARCHAR(253) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY username (username(32))
);

CREATE TABLE IF NOT EXISTS radgroupcheck (
  id INT NOT NULL AUTO_INCREMENT,
  groupname VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '==',
  value VARCHAR(253) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY groupname (groupname(32))
);

CREATE TABLE IF NOT EXISTS radgroupreply (
  id INT NOT NULL AUTO_INCREMENT,
  groupname VARCHAR(64) NOT NULL DEFAULT '',
  attribute VARCHAR(64) NOT NULL DEFAULT '',
  op CHAR(2) NOT NULL DEFAULT '=',
  value VARCHAR(253) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  KEY groupname (groupname(32))
);

CREATE TABLE IF NOT EXISTS radusergroup (
  username VARCHAR(64) NOT NULL DEFAULT '',
  groupname VARCHAR(64) NOT NULL DEFAULT '',
  priority INT NOT NULL DEFAULT 1,
  KEY username (username(32))
);

CREATE TABLE IF NOT EXISTS radacct (
  radacctid BIGINT NOT NULL AUTO_INCREMENT,
  acctsessionid VARCHAR(64) NOT NULL DEFAULT '',
  acctuniqueid VARCHAR(32) NOT NULL DEFAULT '',
  username VARCHAR(64) NOT NULL DEFAULT '',
  nasipaddress VARCHAR(15) NOT NULL DEFAULT '',
  acctstarttime DATETIME DEFAULT NULL,
  acctupdatetime DATETIME DEFAULT NULL,
  acctstoptime DATETIME DEFAULT NULL,
  acctsessiontime INT UNSIGNED DEFAULT NULL,
  acctinputoctets BIGINT UNSIGNED DEFAULT NULL,
  acctoutputoctets BIGINT UNSIGNED DEFAULT NULL,
  calledstationid VARCHAR(50) NOT NULL DEFAULT '',
  callingstationid VARCHAR(50) NOT NULL DEFAULT '',
  acctterminatecause VARCHAR(32) NOT NULL DEFAULT '',
  framedipaddress VARCHAR(15) NOT NULL DEFAULT '',
  PRIMARY KEY (radacctid),
  KEY acctuniqueid (acctuniqueid),
  KEY username (username(32))
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
