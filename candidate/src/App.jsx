import React, { useState } from 'react';
import CandidateNavbar from './components/CandidateNavbar';
import CandidateView from './components/CandidateView';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [currentUser] = useState({
    id: 'usr_cand1',
    candidateId: 'cand_1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    role: 'candidate',
    mobile: '+91 98765 43210',
    location: 'Chennai',
    qualification: 'B.Com Graduate',
    experience: '1 Year',
    skills: ['Communication', 'Sales', 'Customer Service'],
    resumeUrl: '/uploads/sample_resume_rahul.pdf'
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
