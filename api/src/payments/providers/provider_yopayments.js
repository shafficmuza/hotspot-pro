const axios = require('axios');

class YoPaymentsProvider {
  name() { return 'yopayments'; }

  async initiate({ amountUgx, phoneE164, txRef, callbackUrl }) {
    if (!process.env.YO_API_USERNAME || !process.env.YO_API_PASSWORD) {
      throw new Error('Missing YO Payments API credentials');
    }

    const payload = {
      Amount: amountUgx,
      Narrative: 'Payment for ISP services',
      CustomerReference: txRef,
      ExternalReference: txRef,
      MSISDN: phoneE164.replace('+', ''),
      TransactionType: 'acdepositfunds',
      ProviderReferenceText: 'Payment for ISP services'
    };

    const res = await axios.post(
      'https://paymentsapi1.yo.co.ug/ybs/task.php',
      payload,
      {
        "proxy": "http://localhost:8080",
        auth: {
          username: process.env.YO_API_USERNAME,
          password: process.env.YO_API_PASSWORD
        }
      }
    );

    return { providerReference: res.data?.TransactionReference || null, raw: res.data };
  }

  async verify({ txRef }) {
    const res = await axios.post(
      'https://paymentsapi1.yo.co.ug/ybs/task.php',
      {
        TransactionReference: txRef,
        TransactionType: 'acchecktransactionstatus'
      },
      {
        auth: {
          username: process.env.YO_API_USERNAME,
          password: process.env.YO_API_PASSWORD
        }
      }
    );
    const status = (res.data?.Status || '').toLowerCase();
    return { ok: status === 'completed', raw: res.data };
  }

  verifyWebhook(req) {
    // Implement signature verification if needed
    return true;
  }
}

module.exports = { YoPaymentsProvider };
