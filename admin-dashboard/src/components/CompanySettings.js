import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CompanySettings() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
    logo_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    axios.get('/api/company')
      .then(res => {
        const c = res.data.company || {};
        setForm({
          name: c.name || '',
          phone: c.phone || '',
          address: c.address || '',
          note: c.note || '',
          logo_url: c.logo_url || ''
        });
      })
      .catch(err => {
        console.error('Error loading company settings:', err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavedMessage('');
    setLoading(true);
    try {
      await axios.put('/api/company', {
        ...form,
        name: form.name || null,
        phone: form.phone || null,
        address: form.address || null,
        note: form.note || null,
        logo_url: form.logo_url || null
      });
      setSavedMessage('Settings saved.');
    } catch (err) {
      console.error('Error saving company settings:', err);
      setSavedMessage('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Company Settings</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Company Name:
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Phone:
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Address:
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Company Note:
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Logo URL:
            <input
              type="text"
              name="logo_url"
              value={form.logo_url}
              onChange={handleChange}
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
      {savedMessage && (
        <div style={{ marginTop: 10 }}>
          {savedMessage}
        </div>
      )}
      {form.logo_url && (
        <div style={{ marginTop: 20 }}>
          <h3>Logo Preview</h3>
          <img src={form.logo_url} alt="Company logo" style={{ maxWidth: 200, maxHeight: 200 }} />
        </div>
      )}
    </div>
  );
}

export default CompanySettings;
