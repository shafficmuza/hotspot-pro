const { v4: uuidv4 } = require('uuid');
const { Payment, Plan, Subscriber } = require('../models');
const { getProvider } = require('./providers');
const { applyPlanToUser } = require('../lib/radiusWriter');

function buildTxRef() {
  return `ISP-${Date.now()}-${uuidv4().slice(0,8)}`;
}

async function initiatePayment({ subscriberId, planId, network }) {
  const subscriber = await Subscriber.findByPk(subscriberId);
  if (!subscriber) throw new Error('subscriber_not_found');
  const plan = await Plan.findByPk(planId);
  if (!plan) throw new Error('plan_not_found');
  if (!subscriber.phone_e164) throw new Error('subscriber_missing_phone');

  const txRef = buildTxRef();
  const provider = getProvider();

  const payment = await Payment.create({
    provider: provider.name(),
    tx_ref: txRef,
    amount_ugx: plan.price_ugx,
    subscriber_id: subscriber.id,
    plan_id: plan.id,
    status: 'PENDING'
  });

  const resp = await provider.initiate({
    amountUgx: plan.price_ugx,
    phoneE164: subscriber.phone_e164,
    network,
    email: 'customer@example.com',
    txRef,
    callbackUrl: process.env.BASE_URL + '/payments/return?tx_ref=' + encodeURIComponent(txRef)
  });

  await payment.update({ provider_reference: resp.providerReference, raw_json: resp.raw });
  return { paymentId: payment.id, txRef, provider: payment.provider };
}

async function confirmPaymentByTxRef({ txRef }) {
  const payment = await Payment.findOne({ where: { tx_ref: txRef } });
  if (!payment) throw new Error('payment_not_found');

  const provider = getProvider();
  const verify = await provider.verify({ txRef, providerReference: payment.provider_reference });
  await payment.update({ raw_json: verify.raw });

  if (!verify.ok) {
    await payment.update({ status: 'FAILED' });
    return { ok: false };
  }

  await payment.update({ status: 'SUCCESS' });

  const plan = await Plan.findByPk(payment.plan_id);
  const subscriber = await Subscriber.findByPk(payment.subscriber_id);

  await applyPlanToUser({
    username: subscriber.username,
    passwordPlain: subscriber.password_plain,
    radiusGroup: plan.radius_group,
    validityMinutes: plan.validity_minutes,
    rateDownKbps: plan.rate_down_kbps,
    rateUpKbps: plan.rate_up_kbps
  });

  return { ok: true };
}

module.exports = { initiatePayment, confirmPaymentByTxRef };
