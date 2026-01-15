import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import Users from './components/Users';
import Plans from './components/Plans';
import Payments from './components/Payments';
import CompanySettings from './components/CompanySettings';
import Routers from './components/Routers';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || '');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [company, setCompany] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    axios.get('/api/company')
      .then(res => setCompany(res.data.company))
      .catch(err => {
        console.error('Error loading company info:', err);
      });
  }, []);

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
      <div style={{ maxWidth: 400, margin: '40px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
        {company && company.logo_url && (
          <div style={{ marginBottom: 20 }}>
            <img
              src={company.logo_url}
              alt={company.name || 'Company logo'}
              style={{ maxWidth: 200, maxHeight: 200 }}
            />
          </div>
        )}
        {company && (
          <div style={{ marginBottom: 20 }}>
            {company.name && <div style={{ fontSize: 20, fontWeight: 'bold' }}>{company.name}</div>}
            {company.address && <div>{company.address}</div>}
            {company.phone && <div>{company.phone}</div>}
            {company.note && <div style={{ marginTop: 10, fontStyle: 'italic' }}>{company.note}</div>}
          </div>
        )}
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 10, textAlign: 'left' }}>
            <label>
              Email<br />
              <input type="email" name="email" required style={{ width: '100%' }} />
            </label>
          </div>
          <div style={{ marginBottom: 10, textAlign: 'left' }}>
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
            <li><Link to="/routers">Routers</Link></li>
            <li><Link to="/company">Company Settings</Link></li>
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
            <Route path="/routers" component={Routers} />
            <Route path="/company" component={CompanySettings} />
            <Redirect to="/users" />
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;
