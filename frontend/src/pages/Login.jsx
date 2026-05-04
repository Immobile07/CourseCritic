import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center align-center" style={{ minHeight: '70vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4 text-gradient">Welcome Back</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleLogin} className="flex-col gap-4">
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Email</label>
            <input type="email" required className="input-glass" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-muted" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
            <input type="password" required className="input-glass" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary mt-4" style={{ width: '100%', padding: '12px' }}>Login</button>
        </form>
        <p className="text-center mt-4 text-muted">
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
