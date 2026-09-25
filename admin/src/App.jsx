import React, { useState } from 'react';
import AdminNavbar from './components/AdminNavbar';
import AdminDashboard from './components/AdminDashboard';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : (import.meta.env.VITE_API_URL || 'https://jobportal-oind.onrender.com');

export default function App() {
  const [currentUser, setCurrentUser] = useState({
    id: 'usr_admin',
    name: 'System Admin',
    email: 'admin@recruitment.com',
    role: 'admin'
  });

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="app-container">
      <AdminNavbar
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1 }}>
        {currentUser && currentUser.role === 'admin' ? (
          <AdminDashboard
            API_URL={API_URL}
            currentUser={currentUser}
          />
        ) : (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '440px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#0f172a' }}>Admin Login Required</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Sign in with your Admin credentials to access the Recruitment Control Panel.
            </p>
            <button className="btn-primary" onClick={() => setCurrentUser({ id: 'usr_admin', name: 'System Admin', email: 'admin@recruitment.com', role: 'admin' })}>
              Sign In as Admin
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
