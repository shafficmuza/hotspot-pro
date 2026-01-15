import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import Users from './components/Users';
import Plans from './components/Plans';
import Payments from './components/Payments';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || '');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const t = res.data.token;
      setToken(t);
      localStorage.setItem('authToken', t);
    } catch (err) {
      console.error('Login failed:', err);
      setLoginError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('authToken');
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif' }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 10 }}>
            <label>
              Email<br />
              <input type="email" name="email" required style={{ width: '100%' }} />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>
              Password<br />
              <input type="password" name="password" required style={{ width: '100%' }} />
            </label>
          </div>
          {loginError && (
            <div style={{ color: 'red', marginBottom: 10 }}>
              {loginError}
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ fontFamily: 'sans-serif' }}>
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          <ul style={{ listStyle: 'none', display: 'flex', gap: '10px', margin: 0, padding: 0 }}>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/plans">Plans</Link></li>
            <li><Link to="/payments">Payments</Link></li>
            <li style={{ marginLeft: 'auto' }}>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </nav>
        <div style={{ padding: '10px' }}>
          <Switch>
            <Route path="/users" component={Users} />
            <Route path="/plans" component={Plans} />
            <Route path="/payments" component={Payments} />
            <Redirect to="/users" />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
