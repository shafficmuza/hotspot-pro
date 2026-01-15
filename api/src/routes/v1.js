const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { AppUser, Plan, Subscriber, Payment } = require('../models');
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

// NEW: list payments for admin dashboard
router.get('/payments', requireAuth, async (req, res) => {
  const payments = await Payment.findAll({ order: [['id', 'DESC']] });
  res.json({ payments });
});

module.exports = router;
