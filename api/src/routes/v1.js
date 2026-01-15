const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { AppUser, Plan, Subscriber, Payment, CompanySetting, Nas } = require('../models');
const { signJwt, requireAuth, requireRole } = require('../lib/auth');
const { initiatePayment, confirmPaymentByTxRef } = require('../payments/paymentService');

const router = express.Router();

router.post('/auth/login', async (req, res) => {
  const { error, value } = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const user = await AppUser.findOne({ where: { email: value.email } });
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });

  const ok = await bcrypt.compare(value.password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  res.json({ token: signJwt({ id: user.id, email: user.email, role: user.role }) });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

router.post('/plans', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { error, value } = Joi.object({
    name: Joi.string().required(),
    price_ugx: Joi.number().integer().min(0).required(),
    validity_minutes: Joi.number().integer().min(1).required(),
    rate_down_kbps: Joi.number().integer().min(1).required(),
    rate_up_kbps: Joi.number().integer().min(1).required(),
    data_cap_mb: Joi.number().integer().min(1).allow(null),
    radius_group: Joi.string().max(64).required()
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  res.json({ plan: await Plan.create(value) });
});

router.get('/plans', requireAuth, async (req, res) => {
  const plans = await Plan.findAll({ order: [['id', 'DESC']] });
  res.json({ plans });
});

router.post('/subscribers', requireAuth, async (req, res) => {
  const { error, value } = Joi.object({
    customer_name: Joi.string().required(),
    phone_e164: Joi.string().allow(null),
    username: Joi.string().required(),
    password_plain: Joi.string().allow(null),
    mac_address: Joi.string().allow(null),
    auth_type: Joi.string().valid('USERNAME_PASSWORD', 'VOUCHER', 'MAC').default('USERNAME_PASSWORD')
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const subscriber = await Subscriber.create(value);
  res.json({ subscriber });
});

router.get('/subscribers', requireAuth, async (req, res) => {
  const subscribers = await Subscriber.findAll({ order: [['id', 'DESC']] });
  res.json({ subscribers });
});

router.post('/subscribers/:id/deactivate', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const subscriber = await Subscriber.findByPk(req.params.id);
  if (!subscriber) return res.status(404).json({ error: 'not_found' });
  subscriber.is_active = 0;
  await subscriber.save();
  res.json({ subscriber });
});

router.post('/payments/initiate', requireAuth, async (req, res) => {
  const { error, value } = Joi.object({
    subscriber_id: Joi.number().integer().required(),
    plan_id: Joi.number().integer().required(),
    network: Joi.string().valid('MTN', 'AIRTEL').required()
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const result = await initiatePayment({
    subscriberId: value.subscriber_id,
    planId: value.plan_id,
    network: value.network
  });
  res.json(result);
});

router.post('/payments/confirm', async (req, res) => {
  const { error, value } = Joi.object({ tx_ref: Joi.string().required() }).validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const result = await confirmPaymentByTxRef({ txRef: value.tx_ref });
  res.json(result);
});

router.get('/payments', requireAuth, async (req, res) => {
  const payments = await Payment.findAll({ order: [['id', 'DESC']] });
  res.json({ payments });
});

// Company settings
router.get('/company', async (req, res) => {
  let settings = await CompanySetting.findByPk(1);
  if (!settings) {
    settings = await CompanySetting.create({ id: 1, name: null, phone: null, address: null, note: null, logo_url: null });
  }
  res.json({ company: settings });
});

router.put('/company', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { error, value } = Joi.object({
    name: Joi.string().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    address: Joi.string().allow(null, ''),
    note: Joi.string().allow(null, ''),
    logo_url: Joi.string().uri().allow(null, '')
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  let settings = await CompanySetting.findByPk(1);
  if (!settings) {
    settings = await CompanySetting.create({ id: 1 });
  }
  Object.assign(settings, value);
  await settings.save();
  res.json({ company: settings });
});

// NAS / Routers
router.get('/nas', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const items = await Nas.findAll({ order: [['id', 'DESC']] });
  res.json({ nas: items });
});

router.post('/nas', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { error, value } = Joi.object({
    nasname: Joi.string().required(),
    shortname: Joi.string().allow(null, ''),
    type: Joi.string().default('other'),
    ports: Joi.number().integer().allow(null),
    secret: Joi.string().required(),
    description: Joi.string().allow(null, '')
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const nas = await Nas.create(value);
  res.json({ nas });
});

router.delete('/nas/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const nas = await Nas.findByPk(req.params.id);
  if (!nas) return res.status(404).json({ error: 'not_found' });
  await nas.destroy();
  res.json({ ok: true });
});

module.exports = router;
