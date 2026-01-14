import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Plans() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    axios.get('/api/plans')
      .then(response => setPlans(response.data.plans))
      .catch(error => console.error('Error fetching plans:', error));
  }, []);

  return (
    <div>
      <h2>Plans</h2>
      <ul>
        {plans.map(plan => (
          <li key={plan.id}>{plan.name} - UGX {plan.price_ugx}</li>
        ))}
      </ul>
    </div>
  );
}

export default Plans;
