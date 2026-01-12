const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { AppUser, Plan, Subscriber } = require('../models');
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

router.get('/plans', requireAuth, async (req, res) => res.json({ plans: await Plan.findAll({ order: [['id','DESC']] }) }));

router.post('/subscribers', requireAuth, async (req, res) => {
  const { error, value } = Joi.object({
    customer_name: Joi.string().required(),
    phone_e164: Joi.string().allow(null),
    username: Joi.string().required(),
    password_plain: Joi.string().allow(null),
    mac_address: Joi.string().allow(null),
    auth_type: Joi.string().valid('USERNAME_PASSWORD','VOUCHER','MAC').default('USERNAME_PASSWORD')
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  res.json({ subscriber: await Subscriber.create(value) });
});

router.get('/subscribers', requireAuth, async (req, res) => res.json({ subscribers: await Subscriber.findAll({ order: [['id','DESC']] }) }));

router.post('/payments/initiate', requireAuth, async (req, res) => {
  const { error, value } = Joi.object({
    subscriber_id: Joi.number().integer().required(),
    plan_id: Joi.number().integer().required(),
    network: Joi.string().valid('MTN','AIRTEL').required()
  }).validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  res.json(await initiatePayment({ subscriberId: value.subscriber_id, planId: value.plan_id, network: value.network }));
});

router.post('/payments/confirm', async (req, res) => {
  const { error, value } = Joi.object({ tx_ref: Joi.string().required() }).validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  res.json(await confirmPaymentByTxRef({ txRef: value.tx_ref }));
});

module.exports = router;
