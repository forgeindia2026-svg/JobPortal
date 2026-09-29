import React, { useState, useEffect } from 'react';
import CandidateNavbar from './components/CandidateNavbar';
import CandidateView from './components/CandidateView';

const envApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (envApiUrl && !envApiUrl.includes('3.109.202.254')) ? envApiUrl : 'https://api.jobs.forgeindiaconnect.in';

export default function App() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('hr_referral', ref);
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
