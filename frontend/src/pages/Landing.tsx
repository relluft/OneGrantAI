import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getMockAddress } from '../wallet';
import HeroCanvas from '../components/HeroCanvas';

export default function Landing() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const address = account?.address || getMockAddress();

  return (
    <div className="hero-section" style={{ margin: '-2rem', padding: 0 }}>
      
      {/* Animated Glow Orbs */}
      <div className="hero-glow-orb" style={{ width: '500px', height: '500px', background: 'rgba(108, 92, 231, 0.12)', top: '10%', left: '50%', transform: 'translateX(-50%)', animation: 'float 8s ease-in-out infinite' }} />
      <div className="hero-glow-orb" style={{ width: '300px', height: '300px', background: 'rgba(228, 77, 170, 0.08)', top: '20%', right: '10%', animation: 'float 6s ease-in-out infinite reverse' }} />
      <div className="hero-glow-orb" style={{ width: '250px', height: '250px', background: 'rgba(0, 206, 255, 0.06)', bottom: '20%', left: '15%', animation: 'float 10s ease-in-out infinite' }} />

      {/* Interactive Hero Canvas */}
      <HeroCanvas />

      {/* Main Hero Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px' }}>
        
        {/* OneGrantAI Logo Title */}
        <h1 className="hero-title" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
          <span style={{ 
            background: 'linear-gradient(135deg, var(--accent) 0%, #3498db 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(0, 206, 255, 0.3))'
          }}>OneGrant</span>
          <span style={{ 
            background: 'linear-gradient(135deg, #a29bfe 0%, var(--primary) 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(108, 92, 231, 0.3))'
          }}>.AI</span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
          AI-powered grant & hackathon manager.
          <br />Match, brainstorm, and submit — all in one place.
        </p>

        {/* CTA Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', gap: '1rem' }}>
          {!address && (
            <button 
              className="btn-primary" 
              style={{ fontSize: '1.15rem', padding: '1rem 2.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}
              onClick={() => navigate('/dashboard?connect=true')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" /><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" /></svg> Connect Wallet
            </button>
          )}
          
          <button 
            className={address ? "btn-primary glow-primary" : "btn-secondary"}
            style={{ 
              fontSize: '1.15rem', 
              padding: '1rem 2.5rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.8rem',
              background: address ? 'var(--gradient-main)' : undefined,
              color: address ? 'white' : undefined,
              border: address ? 'none' : undefined
            }}
            onClick={() => navigate('/dashboard')}
          >
            {address ? (
              <>Enter Dashboard <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></>
            ) : (
              'Explore App'
            )}
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '5rem' }}>
          <div className="feature-card">
            <span className="feature-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
            </span>
            <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Smart Match</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              AI analyzes your skills and finds the best-fit grants & hackathons across all ecosystems.
            </p>
          </div>
          
          <div className="feature-card">
            <span className="feature-icon" style={{ animationDelay: '1s' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>
            </span>
            <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.2rem' }}>AI Brainstorm</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Generate winning project ideas and complete application drafts powered by RAG knowledge.
            </p>
          </div>
          
          <div className="feature-card">
            <span className="feature-icon" style={{ animationDelay: '2s' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
            </span>
            <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.2rem' }}>On-Chain Proof</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Record your Proof-of-Idea immutably on-chain with a single click via your connected wallet.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
