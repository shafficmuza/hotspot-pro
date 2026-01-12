const { FlutterwaveProvider } = require('./provider_flutterwave');
const { StubProvider } = require('./provider_stub');

function getProvider() {
  const p = (process.env.PAYMENT_PROVIDER || 'flutterwave').toLowerCase();
  if (p === 'flutterwave') return new FlutterwaveProvider();
  return new StubProvider(p);
}

module.exports = { getProvider };
