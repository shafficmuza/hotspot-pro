import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Routers() {
  const [routers, setRouters] = useState([]);
  const [form, setForm] = useState({
    nasname: '',
    shortname: '',
    type: 'other',
    ports: '',
    secret: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadRouters = () => {
    axios.get('/api/nas')
      .then(res => setRouters(res.data.nas))
      .catch(err => console.error('Error loading routers:', err));
  };

  useEffect(() => {
    loadRouters();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await axios.post('/api/nas', {
        nasname: form.nasname,
        shortname: form.shortname || null,
        type: form.type || 'other',
        ports: form.ports ? Number(form.ports) : null,
        secret: form.secret,
        description: form.description || null
      });
      setForm({
        nasname: '',
        shortname: '',
        type: 'other',
        ports: '',
        secret: '',
        description: ''
      });
      loadRouters();
      setMessage('Router added.');
    } catch (err) {
      console.error('Error adding router:', err);
      setMessage('Failed to add router.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this router?')) return;
    setMessage('');
    try {
      await axios.delete(`/api/nas/${id}`);
      loadRouters();
      setMessage('Router deleted.');
    } catch (err) {
      console.error('Error deleting router:', err);
      setMessage('Failed to delete router.');
    }
  };

  return (
    <div>
      <h2>Routers / NAS</h2>
      <section style={{ marginBottom: 20 }}>
        <h3>Add Router</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              IP / Host (nasname):
              <input
                type="text"
                name="nasname"
                value={form.nasname}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Short Name:
              <input
                type="text"
                name="shortname"
                value={form.shortname}
                onChange={handleChange}
              />
            </label>
          </div>
          <div>
            <label>
              Type:
              <input
                type="text"
                name="type"
                value={form.type}
                onChange={handleChange}
              />
            </label>
          </div>
          <div>
            <label>
              Ports:
              <input
                type="number"
                name="ports"
                value={form.ports}
                onChange={handleChange}
              />
            </label>
          </div>
          <div>
            <label>
              Secret:
              <input
                type="text"
                name="secret"
                value={form.secret}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Description:
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Router'}
          </button>
        </form>
      </section>

      {message && <div style={{ marginBottom: 10 }}>{message}</div>}

      <section>
        <h3>Existing Routers</h3>
        <ul>
          {routers.map(r => (
            <li key={r.id}>
              {r.nasname} ({r.shortname || 'no shortname'}) - type: {r.type}, secret: {r.secret}
              {' '}
              <button onClick={() => handleDelete(r.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Routers;
