import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
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
        if (data.user.role === 'admin' || data.user.role === 'hr' || data.user.role === 'agent') {
          localStorage.setItem('admin_user', JSON.stringify(data.user));
          setCurrentUser(data.user);
        } else {
          setError('Access denied. Only Admins, HRs and Agents can access this portal.');
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Background Decorative Elements */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', background: '#3b82f6', opacity: '0.15', filter: 'blur(100px)', borderRadius: '50%', top: '-100px', left: '-100px' }}></div>
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#f59e0b', opacity: '0.15', filter: 'blur(80px)', borderRadius: '50%', bottom: '-50px', right: '-50px' }}></div>
        
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '3rem 2.5rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', width: '100%', maxWidth: '420px', zIndex: 10, border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <img 
              src="/logo.png" 
              alt="Forge India Connect" 
              style={{ 
                width: '85px', 
                height: '85px', 
                borderRadius: '50%', 
                objectFit: 'cover', 
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                marginBottom: '1rem'
              }} 
            />
            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.5px' }}>Welcome Back</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '8px', fontStyle: 'italic' }}>"Connecting Talent with Limitless Opportunities"</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>{error}</div>}
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '600', fontSize: '0.9rem' }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', transition: 'all 0.2s', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                placeholder="admin@example.com"
              />
            </div>
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontWeight: '600', fontSize: '0.9rem' }}>Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px 45px 12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', transition: 'all 0.2s', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '38px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1.5rem', padding: '14px', width: '100%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '1rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { if(!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)'; } }}
            onMouseLeave={e => { if(!loading) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'; } }}
            >
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
        {currentUser.role === 'agent' && (
          <HrDashboard API_URL={API_URL} currentUser={currentUser} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isAgent />
        )}
      </main>
    </div>
  );
}
