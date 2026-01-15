import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [confirming, setConfirming] = useState({});
  const [message, setMessage] = useState('');

  const loadPayments = () => {
    axios.get('/api/payments')
      .then(response => setPayments(response.data.payments))
      .catch(error => console.error('Error fetching payments:', error));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRetryConfirm = async (txRef) => {
    setMessage('');
    setConfirming(prev => ({ ...prev, [txRef]: true }));
    try {
      const res = await axios.post('/api/payments/confirm', { tx_ref: txRef });
      if (res.data.ok) {
        setMessage(`Payment ${txRef} confirmed and activated.`);
      } else {
        setMessage(`Payment ${txRef} verification failed.`);
      }
      loadPayments();
    } catch (err) {
      console.error('Error confirming payment:', err);
      setMessage(`Error confirming payment ${txRef}`);
    } finally {
      setConfirming(prev => ({ ...prev, [txRef]: false }));
    }
  };

  return (
    <div>
      <h2>Payments</h2>
      {message && <div style={{ marginBottom: 10 }}>{message}</div>}
      <ul>
        {payments.map(payment => (
          <li key={payment.id}>
            {payment.tx_ref} - UGX {payment.amount_ugx} - {payment.status}
            {' '}
            {payment.status !== 'SUCCESS' && (
              <button
                onClick={() => handleRetryConfirm(payment.tx_ref)}
                disabled={!!confirming[payment.tx_ref]}
              >
                {confirming[payment.tx_ref] ? 'Confirming...' : 'Retry Confirm'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Payments;
