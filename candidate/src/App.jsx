import React, { useState, useEffect } from 'react';
import CandidateNavbar from './components/CandidateNavbar';
import CandidateView from './components/CandidateView';

const envApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (envApiUrl && !envApiUrl.includes('3.109.202.254')) ? envApiUrl : 'https://api.jobs.forgeindiaconnect.in';

export default function App() {
  useEffect(() => {
    // Extract referral code from URL search, hash, or full href
    const href = window.location.href;
    const match = href.match(/[?&]ref=([A-Za-z0-9-]+)/i);
    const ref = match ? match[1].toUpperCase() : null;
    if (ref) {
      localStorage.setItem('hr_referral', ref);
      sessionStorage.setItem('hr_referral', ref);
      // Track this click on the backend
      fetch(`${API_URL}/api/users/hr/${ref}/visit`, { method: 'POST' })
        .catch(() => {}); // Silently fail if error
    }
  }, []);

  const [currentUser] = useState({
    id: 'usr_candidate',
    candidateId: 'cand_guest',
    name: '',
    email: '',
    role: 'candidate',
    mobile: '',
    location: '',
    qualification: '',
    experience: '',
    skills: [],
    resumeUrl: ''
  });

  return (
    <div className="app-container">
      <CandidateNavbar />

      <main style={{ flex: 1 }}>
        <CandidateView
          API_URL={API_URL}
          currentUser={currentUser}
        />
      </main>
    </div>
  );
}
