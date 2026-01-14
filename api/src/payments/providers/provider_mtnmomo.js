const axios = require('axios');

class MTNMomoProvider {
  name() { return 'mtnmomo'; }

  async initiate({ amountUgx, phoneE164, txRef, callbackUrl }) {
    if (!process.env.MTN_MOMO_API_KEY || !process.env.MTN_MOMO_USER_ID || !process.env.MTN_MOMO_PRIMARY_KEY) {
      throw new Error('Missing MTN MoMo API credentials');
    }

    const payload = {
      amount: String(amountUgx),
      currency: 'UGX',
      externalId: txRef,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phoneE164.replace('+', '')
      },
      payerMessage: 'Payment for ISP services',
      payeeNote: 'Thank you for using our service'
    };

    const res = await axios.post(
      'https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay',
      payload,
      {
        headers: {
          'X-Reference-Id': txRef,
          'X-Target-Environment': 'sandbox',
          'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_PRIMARY_KEY,
          'Authorization': `Bearer ${process.env.MTN_MOMO_API_KEY}`
        }
      }
    );

    return { providerReference: res.data?.referenceId || null, raw: res.data };
  }

  async verify({ txRef }) {
    const res = await axios.get(
      `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${txRef}`,
      {
        headers: {
          'X-Target-Environment': 'sandbox',
          'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_PRIMARY_KEY,
          'Authorization': `Bearer ${process.env.MTN_MOMO_API_KEY}`
        }
      }
    );
    const status = (res.data?.status || '').toLowerCase();
    return { ok: status === 'success', raw: res.data };
  }

  verifyWebhook(req) {
    // Implement signature verification if needed
    return true;
  }
}

module.exports = { MTNMomoProvider };
