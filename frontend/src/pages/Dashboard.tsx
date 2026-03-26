import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getMockAddress } from '../wallet';
import { api } from '../api';

export default function Dashboard() {
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const wasConnected = localStorage.getItem('sui_wallet_was_connected') === 'true';
  const address = account?.address || getMockAddress();
  
  const [nickname, setNickname] = useState(localStorage.getItem('user_nickname') || 'Builder');
  const [profile, setProfile] = useState<any>(null);
  const [xp, setXp] = useState(0);
  const [recommendedGrants, setRecommendedGrants] = useState<any[]>([]);
  const [isReconnecting, setIsReconnecting] = useState(wasConnected && !address);
  const [loading, setLoading] = useState(true);

  // Rotating Tips
  const tips = [
    "Did you know? AI Idea Lab can brainstorm infinite unique concepts.",
    "Pro tip: Enhance your profile to get more accurate grant matches.",
    "Stay consistent: Submitting applications earns you high XP points.",
    "Your Proof-of-Idea is minted as an immutable identity on-chain."
  ];
  const [currentTipIdx, setCurrentTipIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTipIdx(i => (i + 1) % tips.length), 8000);
    return () => clearInterval(interval);
  }, [tips.length]);

  useEffect(() => {
    if (isReconnecting) {
      const timer = setTimeout(() => setIsReconnecting(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isReconnecting]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (address) {
          setIsReconnecting(false);
          const data = await api.getProfile(address);
          setProfile(data.profile);
          if (data.profile?.nickname) setNickname(data.profile.nickname);
          setXp(data.xp);
          
          const matchData = await api.matchGrants(data.profile);
          setRecommendedGrants(matchData?.matches?.slice(0, 3) || []);
        } else {
          // Guest mode fetching
          const matchData = await api.matchGrants({});
          setRecommendedGrants(matchData?.matches?.slice(0, 3) || []);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [address]);

  const apps = JSON.parse(localStorage.getItem('my_applications') || '[]');
  const activeApps = apps.filter((a: any) => a.status !== 'Submitted');
  
  // Synthesize activity feed
  const feed = [];
  if (address) {
    if (apps.length > 0) {
      const lastApp = apps[0];
      feed.push({ time: 'Just now', text: `Updated application for ${lastApp.grantTitle}` });
      if (apps.length > 1) {
        feed.push({ time: '2 hrs ago', text: `Brainstormed ideas for ${apps[1].grantTitle}` });
      }
      feed.push({ time: 'Yesterday', text: `Earned ${xp > 50 ? 50 : xp} XP for active participation` });
    } else {
      feed.push({ time: 'Today', text: `Connected wallet to OneGRANT.AI` });
      feed.push({ time: 'Today', text: `Viewed personalized grant recommendations` });
    }
  } else {
    feed.push({ time: 'Just now', text: `Exploring OneGRANT as a Guest` });
  }

  if (isReconnecting && !address) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="pulsing-text pulsing-glow" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>
          Reconnecting to OneChain...
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* 1. BUILDER HERO */}
      <div className="glass-2 glow-accent" style={{ 
        padding: '3rem', 
        borderRadius: '24px', 
        marginBottom: '2rem', 
        position: 'relative', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(20, 20, 43, 0.8) 0%, rgba(108, 92, 231, 0.1) 100%)',
        border: '1px solid rgba(0, 206, 255, 0.2)'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px' }}>
              OneGRANT Alpha
            </span>
            <div className="pulsing-glow" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
          </div>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', fontWeight: 900, lineHeight: 1.1 }}>
            {address ? (
              <>Welcome back, <span className="page-title" style={{ fontSize: 'inherit' }}>{nickname}</span>! <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', display: 'inline-block', marginLeft: '5px', color: 'var(--accent)' }}><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.82-2.82L7 15" /></svg></>
            ) : (
              <>Ignite your <span className="page-title" style={{ fontSize: 'inherit' }}>Journey</span>. <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', display: 'inline-block', marginLeft: '5px', color: 'var(--accent)' }}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" /><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" /></svg></>
            )}
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.6, marginBottom: '2rem' }}>
            {address 
              ? `You have ${activeApps.length} active applications tracking. Ready to submit your next big idea to OneChain?`
              : 'The elite platform for Web3 grant discovery and AI-powered idea generation. Join the OneChain ecosystem today.'
            }
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-primary" onClick={() => navigate('/grants')} style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
              Explore Grants
            </button>
            {!address && (
              <button className="btn-secondary" onClick={() => navigate('/connect')} style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        <div style={{ 
          position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', 
          background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.1, zIndex: 1 
        }} />
      </div>

      {/* 2. QUICK STATS STRIP */}
      {address && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(108, 92, 231, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Level</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{Math.floor(xp/100)+1}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 206, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m11.1 17.1 2.3 2.3 2.3-2.3"/><path d="M12 14.1v5.3"/><path d="M9.6 15.6c-4.1-1.6-4.5-5.9-4.5-8.2 0-3.3 2.1-4.8 4.2-4.8s4.2 1.5 4.2 4.8c0 2.3-.4 6.6-4.5 8.2Z"/><path d="M3 13.5v-2c0-2.8 1.3-4.5 3.3-5.5"/><path d="M21 13.5v-2c0-2.8-1.3-4.5-3.3-5.5"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total XP</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{xp}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(228, 77, 170, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e44daa' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Applications</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{apps.length}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 255, 128, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff80' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Match Rate</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>94%</div>
            </div>
          </div>
          
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* 3. ACTIVE PIPELINE */}
          <section>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" /><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" /></svg> Active Pipeline
            </h2>
            <div className="glass-2" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              {activeApps.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeApps.map((app: any, idx: number) => {
                    const progress = app.status === 'Idea' ? 33 : app.status === 'Draft' ? 66 : 100;
                    return (
                      <div key={idx} className="glass-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                          </div>
                          <div style={{ flex: 1, paddingRight: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem' }}>{app.grantTitle}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span className={`badge badge-${app.status?.toLowerCase() || 'idea'}`} style={{ padding: '2px 8px', fontSize: '0.65rem' }}>
                                  {app.status}
                                </span>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', flex: 1, overflow: 'hidden' }}>
                                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--gradient-main)' }} />
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={() => navigate('/applications')} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', textAlign: 'center', padding: '0.5rem', fontWeight: 600, marginTop: '0.5rem' }}>
                    View All Applications →
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>Your pipeline is empty</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Find a grant to kick off your next project.</p>
                  <button className="btn-secondary" onClick={() => navigate('/grants')}>Browse Grants</button>
                </div>
              )}
            </div>
          </section>

          {/* 4. DISCOVERY PULSE (Recommendations) */}
          <section>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> Top Picks For You
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {recommendedGrants.map((match: any, idx: number) => (
                <div key={idx} className="glass-2" style={{ padding: '1.2rem', borderRadius: '16px', cursor: 'pointer', transition: '0.3s', display: 'flex', flexDirection: 'column' }} onClick={() => navigate('/grants')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <div style={{ color: '#00ff80', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: 'rgba(0,255,128,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      {match.score ? `${match.score}% Match` : 'Recommended'}
                    </div>
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', lineHeight: 1.3 }}>{match.grant.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                    {match.grant.description}
                  </p>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'white', marginTop: '1rem' }}>{match.grant.reward}</div>
                </div>
              ))}
            </div>
            {recommendedGrants.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <button onClick={() => navigate('/grants')} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                  Browse All Matches →
                </button>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* 5. GUEST CTA (If guest) */}
          {!address && (
            <div className="glass-2 pulsing-glow" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--accent)', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Unlock On-Chain Identity
              </p>
              <button className="btn-primary" onClick={() => navigate('/connect')} style={{ marginTop: '1rem', width: '100%', padding: '0.75rem' }}>Get Started</button>
            </div>
          )}

          {/* 6. ACTIVITY FEED */}
          <section>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.2rem' }}>Recent Activity</h2>
            <div className="glass-card" style={{ padding: '1.5rem 1.5rem 1.5rem 2rem', position: 'relative' }}>
              {/* Timeline line */}
              <div style={{ position: 'absolute', top: '2.5rem', bottom: '2.5rem', left: '1.75rem', width: '2px', background: 'rgba(255,255,255,0.05)' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {feed.map((item, idx) => (
                  <div key={idx} style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                    <div style={{ position: 'absolute', top: '5px', left: '-5px', width: '10px', height: '10px', borderRadius: '50%', background: idx === 0 ? 'var(--accent)' : 'var(--text-secondary)', boxShadow: idx === 0 ? '0 0 10px rgba(0, 206, 255, 0.5)' : 'none' }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{item.time}</div>
                    <div style={{ fontSize: '0.9rem', color: idx === 0 ? 'white' : 'var(--text-secondary)', lineHeight: 1.4 }}>{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 7. ECOSYSTEM TIPS */}
          <section>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.2rem' }}>OneChain Insights</h2>
            <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(108, 92, 231, 0.05)', border: '1px solid rgba(108, 92, 231, 0.15)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <div style={{ color: 'var(--primary)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, minHeight: '40px' }} key={currentTipIdx} className="fade-in">
                    {tips[currentTipIdx]}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '1rem' }}>
                {tips.map((_, idx) => (
                  <div key={idx} style={{ width: '4px', height: '4px', borderRadius: '50%', background: idx === currentTipIdx ? 'var(--primary)' : 'rgba(255,255,255,0.2)', transition: '0.3s' }} />
                ))}
              </div>
            </div>
          </section>

          {/* 8. SYSTEM STATUS */}
          <div className="glass-2" style={{ padding: '1.2rem', borderRadius: '16px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Chain Status</span>
              <span style={{ color: '#00d2d3' }}>● OneChain Testnet</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>AI Agent</span>
              <span style={{ color: '#00d2d3' }}>● Online</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
