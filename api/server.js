require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { sequelize } = require('./src/db');
const routes = require('./src/routes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/', routes);

const port = parseInt(process.env.PORT || '8080', 10);

(async () => {
  await sequelize.authenticate();
  console.log('DB connected');
  app.listen(port, () => console.log(`API listening on :${port}`));
})().catch((e) => {
  console.error('Startup error:', e);
  process.exit(1);
});
