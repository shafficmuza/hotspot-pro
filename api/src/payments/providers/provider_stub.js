class StubProvider {
  constructor(name) { this._name = name; }
  name() { return this._name; }

  async initiate() {
    // Implement provider API here.
    return { providerReference: null, raw: { note: 'not-implemented' } };
  }

  async verify() {
    // Implement provider verify/status check here.
    return { ok: false, raw: { note: 'not-implemented' } };
  }

  verifyWebhook() {
    // Implement signature verification here.
    return true;
  }
}

module.exports = { StubProvider };
