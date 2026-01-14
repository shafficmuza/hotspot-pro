const { FlutterwaveProvider } = require('./provider_flutterwave');
const { MTNMomoProvider } = require('./provider_mtnmomo');
const { StubProvider } = require('./provider_stub');

function getProvider() {
  const p = (process.env.PAYMENT_PROVIDER || 'flutterwave').toLowerCase();
  if (p === 'flutterwave') return new FlutterwaveProvider();
  if (p === 'mtnmomo') return new MTNMomoProvider();
  return new StubProvider(p);
}

module.exports = { getProvider };
