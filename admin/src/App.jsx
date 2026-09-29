import React, { useState } from 'react';
import AdminNavbar from './components/AdminNavbar';
import AdminDashboard from './components/AdminDashboard';
import HrDashboard from './components/HrDashboard';

const envApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (envApiUrl && !envApiUrl.includes('3.109.202.254')) ? envApiUrl : 'https://api.jobs.forgeindiaconnect.in';

export default function App() {
  // localStorage la saved user irundha load pannuvom - so refresh panna also login stay aagidum
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    setCurrentUser(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user.role === 'admin' || data.user.role === 'hr') {
          localStorage.setItem('admin_user', JSON.stringify(data.user));
          setCurrentUser(data.user);
        } else {
          setError('Access denied. Only Admins and HRs can access this portal.');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // If no user is logged in, show the Login Form
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: 'bold' }}>Portal Login</h2>
            <p style={{ color: '#64748b', marginTop: '4px' }}>Sign in to Admin / HR Dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '10px', borderRadius: '6px', fontSize: '0.9rem' }}>{error}</div>}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontWeight: '600', fontSize: '0.9rem' }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontWeight: '600', fontSize: '0.9rem' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem', padding: '12px', width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AdminNavbar
        currentUser={currentUser}
        onLogout={handleLogout}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <main style={{ flex: 1 }}>
        {currentUser.role === 'admin' && (
          <AdminDashboard API_URL={API_URL} currentUser={currentUser} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}
        {currentUser.role === 'hr' && (
          <HrDashboard API_URL={API_URL} currentUser={currentUser} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}
      </main>
    </div>
  );
}
