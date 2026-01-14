import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/subscribers')
      .then(response => setUsers(response.data.subscribers))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.customer_name} - {user.username}</li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
