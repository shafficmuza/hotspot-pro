import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [newUser, setNewUser] = useState({
    customer_name: '',
    phone_e164: '',
    username: '',
    password_plain: '',
    mac_address: '',
    auth_type: 'USERNAME_PASSWORD'
  });
  const [paymentForm, setPaymentForm] = useState({
    subscriber_id: '',
    plan_id: '',
    network: 'MTN'
  });
  const [loading, setLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  const loadData = () => {
    axios.get('/api/subscribers')
      .then(response => setUsers(response.data.subscribers))
      .catch(error => console.error('Error fetching users:', error));

    axios.get('/api/plans')
      .then(response => setPlans(response.data.plans))
      .catch(error => console.error('Error fetching plans:', error));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/subscribers', {
        ...newUser,
        phone_e164: newUser.phone_e164 || null,
        mac_address: newUser.mac_address || null,
        password_plain: newUser.password_plain || null
      });
      setNewUser({
        customer_name: '',
        phone_e164: '',
        username: '',
        password_plain: '',
        mac_address: '',
        auth_type: 'USERNAME_PASSWORD'
      });
      loadData();
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Failed to create user');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this subscriber?')) return;
    try {
      await axios.post(`/api/subscribers/${id}/deactivate`);
      loadData();
    } catch (err) {
      console.error('Error deactivating user:', err);
      alert('Failed to deactivate user');
    }
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setPaymentMessage('');
    setLoading(true);
    try {
      const res = await axios.post('/api/payments/initiate', {
        subscriber_id: Number(paymentForm.subscriber_id),
        plan_id: Number(paymentForm.plan_id),
        network: paymentForm.network
      });
      setPaymentMessage(`Payment initiated. tx_ref: ${res.data.txRef}, provider: ${res.data.provider}`);
    } catch (err) {
      console.error('Error initiating payment:', err);
      setPaymentMessage('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Users</h2>

      <section style={{ marginBottom: 20 }}>
        <h3>Add Subscriber</h3>
        <form onSubmit={handleCreateUser}>
          <div>
            <label>
              Customer Name:
              <input
                type="text"
                name="customer_name"
                value={newUser.customer_name}
                onChange={handleNewUserChange}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Phone (E.164):
              <input
                type="text"
                name="phone_e164"
                value={newUser.phone_e164}
                onChange={handleNewUserChange}
              />
            </label>
          </div>
          <div>
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleNewUserChange}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Password:
              <input
                type="text"
                name="password_plain"
                value={newUser.password_plain}
                onChange={handleNewUserChange}
              />
            </label>
          </div>
          <div>
            <label>
              MAC Address:
              <input
                type="text"
                name="mac_address"
                value={newUser.mac_address}
                onChange={handleNewUserChange}
              />
            </label>
          </div>
          <div>
            <label>
              Auth Type:
              <select
                name="auth_type"
                value={newUser.auth_type}
                onChange={handleNewUserChange}
              >
                <option value="USERNAME_PASSWORD">Username/Password</option>
                <option value="VOUCHER">Voucher</option>
                <option value="MAC">MAC</option>
              </select>
            </label>
          </div>
          <button type="submit">Create Subscriber</button>
        </form>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h3>Initiate Payment</h3>
        <form onSubmit={handleInitiatePayment}>
          <div>
            <label>
              Subscriber:
              <select
                name="subscriber_id"
                value={paymentForm.subscriber_id}
                onChange={handlePaymentFormChange}
                required
              >
                <option value="">Select subscriber</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.customer_name} ({u.username})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>
              Plan:
              <select
                name="plan_id"
                value={paymentForm.plan_id}
                onChange={handlePaymentFormChange}
                required
              >
                <option value="">Select plan</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - UGX {p.price_ugx}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>
              Network:
              <select
                name="network"
                value={paymentForm.network}
                onChange={handlePaymentFormChange}
                required
              >
                <option value="MTN">MTN</option>
                <option value="AIRTEL">AIRTEL</option>
              </select>
            </label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Initiating...' : 'Initiate Payment'}
          </button>
        </form>
        {paymentMessage && (
          <div style={{ marginTop: 10 }}>
            {paymentMessage}
          </div>
        )}
      </section>

      <section>
        <h3>Subscribers List</h3>
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.customer_name} - {user.username} - {user.is_active ? 'Active' : 'Inactive'}
              {' '}
              {user.is_active && (
                <button onClick={() => handleDeactivate(user.id)}>
                  Deactivate
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Users;
