import { Link, useLocation } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getMockAddress } from '../wallet';
import { useState, useEffect } from 'react';
import { api } from '../api';

const svgs = {
  dashboard: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  search: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  idealab: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  applications: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  profile: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  settings: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
};

export default function Sidebar() {
  const location = useLocation();
  const account = useCurrentAccount();
  const address = account?.address || getMockAddress();
  
  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (address) {
      api.getProfile(address).then(data => setXp(data.xp)).catch(() => {});
    }
  }, [address]);

  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const progressPercent = xpInLevel;
  
  let rankStr = 'Newcomer';
  if (level >= 2) rankStr = 'Learning';
  if (level >= 3) rankStr = 'Builder';
  if (level >= 4) rankStr = 'Advanced';
  if (level >= 5) rankStr = 'Expert';

  const groups = [
    {
      title: 'MAIN',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: svgs.dashboard },
        { path: '/grants', label: 'Grant Search', icon: svgs.search },
        { path: '/idealab', label: 'AI Idea Lab', icon: svgs.idealab },
      ]
    },
    {
      title: 'TOOLS',
      items: [
        { path: '/applications', label: 'My Applications', icon: svgs.applications },
      ]
    },
    {
      title: 'PERSONAL',
      items: [
        { path: '/profile', label: 'Profile', icon: svgs.profile },
        { path: '/settings', label: 'Settings', icon: svgs.settings, soon: true },
      ]
    }
  ];

  return (
    <div className="sidebar glass-card" style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', display: 'flex', flexDirection: 'column', height: '100vh', minWidth: '280px', flexShrink: 0 }}>
      <div style={{ marginBottom: '2.5rem', marginTop: '1rem', padding: '0 0.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '2px' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>
            <span style={{ 
              background: 'linear-gradient(135deg, var(--accent) 0%, #3498db 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent'
            }}>OneGrant</span>
            <span style={{ 
              background: 'linear-gradient(135deg, #a29bfe 0%, var(--primary) 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent'
            }}>.AI</span>
          </h2>
        </Link>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
        {groups.map((group, idx) => (
          <div key={idx}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '0.8rem', paddingLeft: '1.5rem' }}>
              {group.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path || 
                                 (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link 
                    key={item.path} 
                    to={item.soon ? '#' : item.path} 
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1.5rem',
                      textDecoration: 'none', transition: '0.2s',
                      color: isActive && !item.soon ? 'white' : 'var(--text-secondary)',
                      background: isActive && !item.soon ? 'rgba(108, 92, 231, 0.15)' : 'transparent',
                      borderLeft: isActive && !item.soon ? '3px solid var(--accent)' : '3px solid transparent',
                      cursor: item.soon ? 'not-allowed' : 'pointer',
                      opacity: item.soon ? 0.6 : 1
                    }}
                  >
                    <span style={{ color: isActive && !item.soon ? 'var(--accent)' : 'inherit', display: 'flex' }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: isActive && !item.soon ? 'bold' : 'normal' }}>
                      {item.label}
                    </span>
                    {item.soon && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                        SOON
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div style={{ padding: '1.2rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>Lvl {level} <span style={{ color: 'var(--text-secondary)' }}>&middot; {rankStr}</span></span>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold' }}>{xp} XP</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
        </div>
      </div>

      {/* Spacer pushes nothing to bottom, keeps sidebar clean */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
