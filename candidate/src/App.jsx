import React, { useState } from 'react';
import CandidateNavbar from './components/CandidateNavbar';
import CandidateView from './components/CandidateView';

const API_URL = import.meta.env.VITE_API_URL || 'http://3.109.202.254';

export default function App() {
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
