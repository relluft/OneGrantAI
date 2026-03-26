import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getMockAddress } from './wallet';
import Landing from './pages/Landing'
import Connect from './pages/Connect'
import Profile from './pages/Profile'
import GrantList from './pages/GrantList'
import Dashboard from './pages/Dashboard'
import IdeaLab from './pages/IdeaLab'
import Applications from './pages/Applications'
import Certificate from './pages/Certificate'
import Help from './pages/Help'
import Header from './components/Header'
import DashboardLayout from './components/DashboardLayout'
import CursorTrail from './components/CursorTrail'

import { useState } from 'react';

// Particle Background Component
function ParticlesBg() {
  const [particles] = useState(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 2}px`,
      duration: `${Math.random() * 12 + 8}s`, // Much faster (8s to 20s)
      delay: `-${Math.random() * 20}s`,
      color: i % 3 === 0 
        ? 'rgba(108, 92, 231, 0.7)' // Primary
        : i % 3 === 1 
          ? 'rgba(0, 206, 255, 0.7)' // Accent
          : 'rgba(228, 77, 170, 0.7)', // Pink
    }))
  );

  return (
    <div className="particles-bg">
      {particles.map(p => (
        <div 
          key={p.id} 
          className="particle" 
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 10px ${p.color}`,
            animationDuration: p.duration,
            animationDelay: p.delay
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const account = useCurrentAccount();
  
  useEffect(() => {
    if (account) {
      localStorage.setItem('sui_wallet_was_connected', 'true');
    }
  }, [account]);

  const wasConnected = localStorage.getItem('sui_wallet_was_connected') === 'true';
  const isConnected = !!(account || getMockAddress() || wasConnected);

  return (
    <Router>
      {/* Global Particle Background */}
      <ParticlesBg />
      <CursorTrail />
      
      <Routes>
        {/* Always show Landing on root path for unauthenticated users, else redirect to dashboard */}
        <Route path="/" element={
          (account || getMockAddress()) ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <div className="app-container">
              <Header hideTitle={false} />
              <Landing />
            </div>
          )
        } />

        <Route path="/welcome" element={<Navigate to="/" replace />} />

        {/* Dashboard Layout pages */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/connect" element={(account || getMockAddress()) ? <Navigate to="/dashboard" replace /> : <Connect />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/grants" element={<GrantList />} />
          <Route path="/idealab" element={<IdeaLab />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/certificate/:digest" element={<Certificate />} />
          <Route path="/help" element={<Help />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
