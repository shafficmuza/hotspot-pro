const axios = require('axios');

class FlutterwaveProvider {
  name() { return 'flutterwave'; }

  async initiate({ amountUgx, phoneE164, network, email, txRef, callbackUrl }) {
    if (!process.env.FLW_SECRET_KEY) throw new Error('Missing FLW_SECRET_KEY');
    const payload = {
      tx_ref: txRef,
      amount: String(amountUgx),
      currency: 'UGX',
      email: email || 'customer@example.com',
      phone_number: phoneE164.replace('+', ''),
      fullname: 'ISP Customer',
      network,
      redirect_url: callbackUrl
    };

    const res = await axios.post(
      'https://api.flutterwave.com/v3/charges?type=mobile_money_uganda',
      payload,
      { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } }
    );

    return { providerReference: res.data?.data?.flw_ref || null, raw: res.data };
  }

  async verify({ txRef }) {
    const res = await axios.get(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
      { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } }
    );
    const status = (res.data?.data?.status || '').toLowerCase();
    return { ok: status === 'successful', raw: res.data };
  }

  verifyWebhook(req) {
    const given = req.headers['verif-hash'];
    const expected = process.env.FLW_WEBHOOK_HASH;
    if (!expected) return false;
    return String(given || '') === String(expected);
  }
}

module.exports = { FlutterwaveProvider };
