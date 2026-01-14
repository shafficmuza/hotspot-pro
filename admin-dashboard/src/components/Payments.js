import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios.get('/api/payments')
      .then(response => setPayments(response.data.payments))
      .catch(error => console.error('Error fetching payments:', error));
  }, []);

  return (
    <div>
      <h2>Payments</h2>
      <ul>
        {payments.map(payment => (
          <li key={payment.id}>{payment.tx_ref} - UGX {payment.amount_ugx} - {payment.status}</li>
        ))}
      </ul>
    </div>
  );
}

export default Payments;
