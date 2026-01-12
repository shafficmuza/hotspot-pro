require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/db');
const { AppUser } = require('../src/models');

(async () => {
  await sequelize.authenticate();
  const email = 'admin@example.com';
  const password = 'ChangeMeNow!';
  const existing = await AppUser.findOne({ where: { email } });
  if (existing) {
    console.log('Admin exists:', email);
    process.exit(0);
  }
  const hash = await bcrypt.hash(password, 10);
  await AppUser.create({ email, password_hash: hash, role: 'ADMIN' });
  console.log('Seeded admin:', email, 'password:', password);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
