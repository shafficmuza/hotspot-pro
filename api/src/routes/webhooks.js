const express = require('express');
const router = express.Router();
const { getProvider } = require('../payments/providers');
const { confirmPaymentByTxRef } = require('../payments/paymentService');

router.post('/flutterwave', async (req, res) => {
  const provider = getProvider();
  if (provider.name() !== 'flutterwave') return res.status(400).json({ error: 'provider_mismatch' });
  if (!provider.verifyWebhook(req)) return res.status(401).json({ error: 'invalid_signature' });

  const txRef = req.body?.data?.tx_ref || req.body?.tx_ref || req.body?.txRef;
  if (!txRef) return res.status(400).json({ error: 'missing_tx_ref' });

  await confirmPaymentByTxRef({ txRef });
  res.json({ ok: true });
});

router.post('/:provider', async (req, res) => {
  const provider = getProvider();
  if (provider.name() !== req.params.provider) return res.status(400).json({ error: 'provider_mismatch' });

  const txRef = req.body?.tx_ref || req.body?.txRef || req.query?.tx_ref;
  if (!txRef) return res.status(400).json({ error: 'missing_tx_ref' });

  await confirmPaymentByTxRef({ txRef });
  res.json({ ok: true });
});

module.exports = router;
