const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const AppUser = sequelize.define('app_users', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(190), allowNull: false },
  password_hash: { type: DataTypes.STRING(190), allowNull: false },
  role: { type: DataTypes.ENUM('ADMIN','STAFF'), allowNull: false, defaultValue: 'ADMIN' },
}, { timestamps: false, underscored: true });

const Plan = sequelize.define('plans', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  price_ugx: { type: DataTypes.INTEGER, allowNull: false },
  validity_minutes: { type: DataTypes.INTEGER, allowNull: false },
  rate_down_kbps: { type: DataTypes.INTEGER, allowNull: false },
  rate_up_kbps: { type: DataTypes.INTEGER, allowNull: false },
  data_cap_mb: { type: DataTypes.INTEGER, allowNull: true },
  radius_group: { type: DataTypes.STRING(64), allowNull: false },
  is_active: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { timestamps: false, underscored: true });

const Subscriber = sequelize.define('subscribers', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  customer_name: { type: DataTypes.STRING(160), allowNull: false },
  phone_e164: { type: DataTypes.STRING(32), allowNull: true },
  username: { type: DataTypes.STRING(64), allowNull: false },
  password_plain: { type: DataTypes.STRING(64), allowNull: true },
  mac_address: { type: DataTypes.STRING(32), allowNull: true },
  auth_type: { type: DataTypes.ENUM('USERNAME_PASSWORD','VOUCHER','MAC'), allowNull: false, defaultValue: 'USERNAME_PASSWORD' },
  is_active: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { timestamps: false, underscored: true });

const Payment = sequelize.define('payments', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  provider: { type: DataTypes.STRING(32), allowNull: false },
  tx_ref: { type: DataTypes.STRING(120), allowNull: false },
  amount_ugx: { type: DataTypes.INTEGER, allowNull: false },
  subscriber_id: { type: DataTypes.BIGINT, allowNull: false },
  plan_id: { type: DataTypes.BIGINT, allowNull: false },
  status: { type: DataTypes.ENUM('INITIATED','PENDING','SUCCESS','FAILED'), allowNull: false, defaultValue: 'INITIATED' },
  provider_reference: { type: DataTypes.STRING(190), allowNull: true },
  raw_json: { type: DataTypes.JSON, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { timestamps: false, underscored: true });

module.exports = { sequelize, AppUser, Plan, Subscriber, Payment };
