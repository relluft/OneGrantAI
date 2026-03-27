import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { api } from '../api';
import { getMockAddress } from '../wallet';
import { matchGrantsLocal } from '../grantsLocal';
import { clientAnalyzeMatch } from '../aiClient';

const AVAILABLE_SKILLS = ['Any', 'Move', 'Solidity', 'Rust', 'TypeScript', 'Python', 'React', 'Node.js', 'Go', 'Cairo'];
const AVAILABLE_INTERESTS = ['Any', 'DeFi', 'GameFi', 'NFT / Digital Art', 'AI / ML', 'Infrastructure', 'DAO / Governance', 'Social', 'Identity', 'Security', 'Education'];
const AVAILABLE_ECOSYSTEMS = ['Any', 'OneChain', 'Ethereum', 'Solana', 'Aptos', 'Sui', 'Polygon', 'Cosmos'];
const DEADLINE_OPTIONS = ['Any', 'Next 2 weeks', 'Next month', 'Next 3 months', '3+ months'];
const EXP_LABELS = ['Newcomer', 'Learning', 'Builder', 'Advanced', 'Expert'];

export default function GrantList() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"match" | "reward" | "deadline" | "name">("match");
  const [savedGrants, setSavedGrants] = useState<number[]>(JSON.parse(localStorage.getItem('saved_grants') || '[]'));
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Preferences form state
  const [skillsSelected, setSkillsSelected] = useState<string[]>(JSON.parse(localStorage.getItem('pref_skills_arr') || '["Any"]'));
  const [interestsSelected, setInterestsSelected] = useState<string[]>(JSON.parse(localStorage.getItem('pref_interests_arr') || '["Any"]'));
  const [experience, setExperience] = useState(parseInt(localStorage.getItem('pref_exp') || "2") || 2);
  const [opportunityType, setOpportunityType] = useState(localStorage.getItem('pref_type') || "Both");
  const [minReward, setMinReward] = useState<number | ''>(localStorage.getItem('pref_min') ? parseInt(localStorage.getItem('pref_min')!) : '');
  const [maxReward, setMaxReward] = useState<number | ''>(localStorage.getItem('pref_max') ? parseInt(localStorage.getItem('pref_max')!) : '');
  const [deadline, setDeadline] = useState(localStorage.getItem('pref_deadline') || "Any");
  const [teamSize, setTeamSize] = useState(localStorage.getItem('pref_team') || "Any");
  const [ecosystems, setEcosystems] = useState<string[]>(JSON.parse(localStorage.getItem('pref_eco') || '["OneChain"]'));

  // Custom Input states
  const [customSkill, setCustomSkill] = useState("");
  const [customInterest, setCustomInterest] = useState("");

  // Resizable sidebar
  const [sidebarWidth, setSidebarWidth] = useState(380);


  // Modal
  const [selectedGrant, setSelectedGrant] = useState<any | null>(null);
  const [matchAnalysis, setMatchAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const wallet_address = account?.address || getMockAddress();
  const wasConnected = localStorage.getItem('sui_wallet_was_connected') === 'true';

  useEffect(() => {
    if (wallet_address || !wasConnected) {
      fetchMatches();
    }
  }, [wallet_address, wasConnected]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // Build profile from localStorage preferences
      const localProfile = {
        wallet_address: wallet_address || '0x0',
        skills: JSON.parse(localStorage.getItem('pref_skills_arr') || '["Any"]'),
        interests: JSON.parse(localStorage.getItem('pref_interests_arr') || '["Any"]'),
        experience_level: parseInt(localStorage.getItem('pref_exp') || '2') || 2,
        opportunity_type: localStorage.getItem('pref_type') || 'Both',
        min_reward: parseInt(localStorage.getItem('pref_min') || '0') || 0,
        max_reward: parseInt(localStorage.getItem('pref_max') || '0') || 0,
        deadline_window: localStorage.getItem('pref_deadline') || 'Any',
        team_size: localStorage.getItem('pref_team') || 'Any',
        ecosystems: JSON.parse(localStorage.getItem('pref_eco') || '["OneChain"]'),
      };

      // Try backend API first
      try {
        const matchData = await api.matchGrants(localProfile);
        const matches = matchData?.matches || [];
        if (matches.length > 0) {
          setGrants(matches);
          return;
        }
      } catch (_) {
        console.warn('Backend API unavailable, using local matching');
      }

      // Fallback: client-side matching
      const localMatches = matchGrantsLocal(localProfile);
      setGrants(localMatches);
    } catch (e) {
      console.warn("Grant fetch error", e);
      // Ultimate fallback: show all grants with score 0
      const localMatches = matchGrantsLocal({
        skills: ['Any'], interests: ['Any'], experience_level: 2,
        opportunity_type: 'Both', min_reward: 0, max_reward: 0, ecosystems: ['OneChain']
      });
      setGrants(localMatches);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (id: number) => {
    const updated = savedGrants.includes(id) 
      ? savedGrants.filter(i => i !== id) 
      : [...savedGrants, id];
    setSavedGrants(updated);
    localStorage.setItem('saved_grants', JSON.stringify(updated));
  };

  const filteredAndSortedGrants = grants
    .filter(match => {
      const g = match.grant;
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            g.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSaved = !showSavedOnly || savedGrants.includes(g.id);
      return matchesSearch && matchesSaved;
    })
    .sort((a, b) => {
      if (sortMode === "match") {
         const diff = (b.score || 0) - (a.score || 0);
         // If scores are exactly tied (especially on initial blank profile), randomize them
         if (diff === 0) return Math.random() - 0.5;
         return diff;
      }
      if (sortMode === "reward") {
        const rA = parseInt(a.grant.reward.replace(/[^0-9]/g, "")) || 0;
        const rB = parseInt(b.grant.reward.replace(/[^0-9]/g, "")) || 0;
        return rB - rA;
      }
      if (sortMode === "deadline") return a.grant.deadline.localeCompare(b.grant.deadline);
      if (sortMode === "name") return a.grant.title.localeCompare(b.grant.title);
      return 0;
    });

  const toggleSelection = (item: string, list: string[], setList: (sl: string[]) => void) => {
    if (item === 'Any') {
      setList(['Any']);
      return;
    }
    
    let newList;
    if (list.includes(item)) {
      newList = list.filter(i => i !== item);
    } else {
      newList = [...list.filter(i => i !== 'Any'), item];
    }
    
    if (newList.length === 0) {
      setList(['Any']);
    } else {
      setList(newList);
    }
  };

  const resetPreferences = () => {
    setSkillsSelected(['Any']);
    setInterestsSelected(['Any']);
    setExperience(0);
    setOpportunityType("");
    setMinReward('');
    setMaxReward('');
    setDeadline("Any");
    setTeamSize("");
    setEcosystems(["OneChain"]);
  };

  const handleSavePreferences = async (e?: any) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    localStorage.setItem('pref_skills_arr', JSON.stringify(skillsSelected));
    localStorage.setItem('pref_interests_arr', JSON.stringify(interestsSelected));
    localStorage.setItem('pref_exp', experience.toString());
    localStorage.setItem('pref_type', opportunityType);
    localStorage.setItem('pref_min', minReward.toString());
    localStorage.setItem('pref_max', maxReward.toString());
    localStorage.setItem('pref_deadline', deadline);
    localStorage.setItem('pref_team', teamSize);
    localStorage.setItem('pref_eco', JSON.stringify(ecosystems));

    try {
      await api.saveProfile({
        wallet_address: wallet_address || '0x0',
        skills: skillsSelected.length ? skillsSelected : ['Any'],
        interests: interestsSelected.length ? interestsSelected : ['Any'],
        experience_level: experience || 0,
        opportunity_type: opportunityType || 'Both',
        min_reward: typeof minReward === 'number' ? minReward : 0,
        max_reward: typeof maxReward === 'number' ? maxReward : 0,
        deadline_window: deadline || 'Any',
        team_size: teamSize || 'Any',
        ecosystems: ecosystems.length ? ecosystems : ['OneChain']
      });
      await fetchMatches();
    } catch (error) {
      console.error(error);
      alert("Failed to save preferences.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedGrant || !wallet_address) return;
    setIsAnalyzing(true);
    setMatchAnalysis("");
    try {
      let analysisText = '';
      try {
        const data = await api.analyzeMatch({ wallet_address, grant_id: selectedGrant.grant.id });
        analysisText = data.analysis || '';
        if (!analysisText) throw new Error('Empty analysis from backend');
      } catch (backendErr) {
        console.warn('Backend analysis failed, using client-side fallback:', backendErr);
        analysisText = await clientAnalyzeMatch(selectedGrant.grant);
      }
      setMatchAnalysis(analysisText);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setMatchAnalysis("Analysis timed out. The AI service may be busy — please try again in a moment.");
      } else {
        setMatchAnalysis("Error fetching analysis. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Drag logic removed as per user request


  // Curated ecosystem-specific banner gradients
  const ECOSYSTEM_BANNERS: Record<string, string> = {
    'OneChain':  'linear-gradient(135deg, #1a0533 0%, #3d1259 30%, #6b21a8 60%, #0ea5e9 100%)',
    'Ethereum':  'linear-gradient(135deg, #1c1c3a 0%, #3c3c7a 30%, #627eea 60%, #c99bff 100%)',
    'Solana':    'linear-gradient(135deg, #0c0c2e 0%, #14173a 30%, #9945ff 55%, #14f195 100%)',
    'Aptos':     'linear-gradient(135deg, #0d1117 0%, #1a2332 30%, #00b4d8 60%, #2dd4bf 100%)',
    'Sui':       'linear-gradient(135deg, #0a1628 0%, #1e3a5f 30%, #4da2ff 60%, #77c8ff 100%)',
    'Arbitrum':  'linear-gradient(135deg, #0d1b2a 0%, #1b2d45 30%, #28a0f0 55%, #96beeb 100%)',
    'Filecoin':  'linear-gradient(135deg, #0a1929 0%, #1a2f4a 30%, #0090ff 55%, #42c6ff 100%)',
    'Zircuit':   'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 30%, #6366f1 55%, #a78bfa 100%)',
    'Polygon':   'linear-gradient(135deg, #1a0b2e 0%, #2d1b50 30%, #8247e5 55%, #a855f7 100%)',
    'Cosmos':    'linear-gradient(135deg, #0f0c29 0%, #1e1545 30%, #6c63ff 55%, #e2e8f0 100%)',
  };

  const GRANT_TYPE_ACCENT: Record<string, string> = {
    'Hackathon': 'radial-gradient(circle at 80% 20%, rgba(255, 71, 87, 0.25) 0%, transparent 50%)',
    'Grant':     'radial-gradient(circle at 80% 20%, rgba(0, 206, 255, 0.15) 0%, transparent 50%)',
    'Bounty':    'radial-gradient(circle at 80% 20%, rgba(255, 177, 66, 0.2) 0%, transparent 50%)',
  };

  const generateGradient = (id: any, opacity: number = 1, grant?: any) => {
    const ecosystem = grant?.ecosystem || '';
    const grantType = grant?.grant_type || '';
    
    // If the grant has a banner_url, use it as background image
    if (grant?.banner_url) {
      return `url(${grant.banner_url}) center/cover no-repeat`;
    }

    const base = ECOSYSTEM_BANNERS[ecosystem] || 'linear-gradient(135deg, #1a0533 0%, #2d1259 35%, #6b21a8 65%, #0ea5e9 100%)';
    const accent = GRANT_TYPE_ACCENT[grantType] || '';
    
    return `${accent ? accent + ', ' : ''}${base}`;
  };

  if (!wallet_address) {
    return (
      <div className="glass-card fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)', textAlign: 'center', border: '1px solid rgba(108, 92, 231, 0.2)' }}>
        <div style={{ width: '100px', height: '100px', background: 'rgba(108, 92, 231, 0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem', border: '1px solid rgba(108, 92, 231, 0.3)', boxShadow: '0 0 30px rgba(108, 92, 231, 0.2)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <path d="M11 8v6M8 11h6"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>Unlock Grant Search</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '450px', lineHeight: '1.6' }}>
          Connect your wallet to analyze your profile and find the perfect matching grants and hackathons.
        </p>
        <button className="btn-primary" onClick={() => navigate('/connect')} style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
          Connect Wallet
        </button>
      </div>
    );
  }

  if (loading) return (
    <div style={{ padding: '2rem' }}>
      <div className="skeleton-shimmer" style={{ width: '300px', height: '40px', borderRadius: '8px', marginBottom: '2rem' }} />
      <div className="stats-bar glass-2" style={{ height: '80px' }} />
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-card skeleton-shimmer" style={{ height: '200px', marginBottom: '2rem', width: '100%', borderRadius: '16px' }} />
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', minHeight: 'calc(100vh - 120px)' }}>
      
      {/* CENTER BANNERS LIST */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header & Search */}
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.8rem', fontWeight: 900 }}>Grant Search</h1>
          <p className="page-subtitle" style={{ margin: '0 0 2rem 0' }}>Professional-grade discovery hub for OneChain builders.</p>
          
          {/* Stats Bar */}
          <div className="stats-bar glass-2">
            <div className="stats-item">
              <span className="stats-label">Total Found</span>
              <span className="stats-value">{grants.length}</span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div className="stats-item">
              <span className="stats-label">Matching Query</span>
              <span className="stats-value">{filteredAndSortedGrants.length}</span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div className="stats-item">
              <span className="stats-label">Bookmarked</span>
              <span className="stats-value">{savedGrants.length}</span>
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search by title, description, or keywords..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ margin: 0, paddingLeft: '2.5rem' }}
              />
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Sort:</span>
              <button className={`sort-btn ${sortMode === 'match' ? 'active' : ''}`} onClick={() => setSortMode('match')}>Match</button>
              <button className={`sort-btn ${sortMode === 'reward' ? 'active' : ''}`} onClick={() => setSortMode('reward')}>Reward</button>
              <button className={`sort-btn ${sortMode === 'deadline' ? 'active' : ''}`} onClick={() => setSortMode('deadline')}>Deadline</button>
              <button className={`sort-btn ${sortMode === 'name' ? 'active' : ''}`} onClick={() => setSortMode('name')}>A-Z</button>
            </div>

            <button 
              className={`sort-btn ${showSavedOnly ? 'active' : ''}`} 
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span style={{ color: showSavedOnly ? 'gold' : 'inherit' }}>{showSavedOnly ? '★' : '☆'}</span> Saved Only
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {filteredAndSortedGrants.map((match: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              
              {/* Rank Marker */}
              <div style={{ flexShrink: 0, width: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.8 }}>
                <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-secondary)' }}>Rank</span>
                <span style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--accent)', background: generateGradient(match?.grant?.id, 1, match?.grant), WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {idx + 1}
                </span>
              </div>

              {/* Banner */}
              <div 
                className="glass-card"
                onClick={() => setSelectedGrant(match)}
                style={{ 
                  flex: 1, padding: 0, borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease',
                  display: 'flex', flexDirection: 'column'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Banner Image / Logo area */}
                <div style={{ height: '160px', width: '100%', background: generateGradient(match?.grant?.id, 0.8, match?.grant), position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '1.5rem' }}>
                  
                  {/* Top Bar on Banner: Bookmark and External Link */}
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.8rem', zIndex: 10 }}>
                    {match.grant.url && (
                      <a 
                        href={match.grant.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.1)', 
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          backdropFilter: 'blur(10px)',
                          transition: '0.3s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                         Link ↗
                      </a>
                    )}
                    <div 
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(match.grant.id); }}
                      className={`bookmark-icon ${savedGrants.includes(match.grant.id) ? 'saved' : ''}`}
                      style={{ background: 'rgba(0,0,0,0.5)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}
                    >
                      {savedGrants.includes(match.grant.id) ? '★' : '☆'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {match?.grant?.tracks?.slice(0, 3).map((track: string) => (
                        <span key={track} className="tag-chip" style={{ background: 'rgba(0, 206, 255, 0.2)', color: 'white', borderColor: 'var(--accent)' }}>{track}</span>
                      ))}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '2.2rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{match?.grant?.title || 'Unknown Grant'}</h3>
                  </div>
                </div>

                {/* Banner Content */}
                <div style={{ padding: '1.5rem', background: 'rgba(20, 20, 43, 0.6)' }}>
                  <p style={{ margin: '0 0 1.2rem 0', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {match?.grant?.description || 'No description provided.'}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        💰 {match?.grant?.reward || 'TBA'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                        ⏰ {match?.grant?.deadline || 'TBA'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {match?.grant?.required_skills?.slice(0, 2).map((skill: string) => (
                        <span key={skill} className="tag-chip">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RESIZER REMOVED */}


      {/* RIGHT SIDEBAR (PREFERENCES) */}
      <div 
        className="glass-card" 
        style={{ 
          width: `${sidebarWidth}px`, 
          flexShrink: 0,
          position: 'sticky',
          top: '2rem',
          height: 'calc(100vh - 6rem)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0
        }}
      >
        <div style={{ padding: '1.5rem 1.5rem 1.5rem 1.5rem', overflowY: 'auto', flex: 1, position: 'relative' }} className="custom-scroll">
          
          {/* GUEST OVERLAY */}
          {!wallet_address && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(20, 20, 43, 0.8)', backdropFilter: 'blur(5px)', zIndex: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</span>
              <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>Settings Locked</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>Connect your wallet to customize search preferences and enable AI matching.</p>
              <button className="btn-primary" onClick={() => navigate('/connect')} style={{ padding: '0.8rem 2rem' }}>Connect Wallet</button>
            </div>
          )}
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="2" y1="14" x2="6" y2="14" />
              <line x1="10" y1="8" x2="14" y2="8" />
              <line x1="18" y1="16" x2="22" y2="16" />
            </svg>
            Search Settings
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          
          {/* SECTION 1: TECH STACK */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Tech Stack</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>

              {skillsSelected.map(skill => (
                <div key={skill} onClick={() => toggleSelection(skill, skillsSelected, setSkillsSelected)} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', background: 'var(--primary-dark)', border: '1px solid var(--accent)', color: 'white', transition: '0.2s' }}>{skill}</div>
              ))}
              {AVAILABLE_SKILLS.filter(s => !skillsSelected.includes(s)).map(skill => (
                <div key={skill} onClick={() => toggleSelection(skill, skillsSelected, setSkillsSelected)} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', transition: '0.2s' }}>{skill}</div>
              ))}

            </div>
            <input 
              type="text" 
              className="input-field" 
              placeholder="+ Add custom skill..." 
              value={customSkill}
              onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && customSkill.trim()) {
                  if (!skillsSelected.includes(customSkill.trim())) {
                    setSkillsSelected([...skillsSelected, customSkill.trim()]);
                  }
                  setCustomSkill("");
                }
              }}
              style={{ margin: 0, padding: '0.5rem', fontSize: '0.8rem' }}
            />
          </div>

          {/* SECTION 2: INTERESTS */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Interest Areas</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>

              {interestsSelected.map(interest => (
                <div key={interest} onClick={() => toggleSelection(interest, interestsSelected, setInterestsSelected)} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', background: 'var(--primary-dark)', border: '1px solid var(--accent)', color: 'white', transition: '0.2s' }}>{interest}</div>
              ))}
              {AVAILABLE_INTERESTS.filter(i => !interestsSelected.includes(i)).map(interest => (
                <div key={interest} onClick={() => toggleSelection(interest, interestsSelected, setInterestsSelected)} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', transition: '0.2s' }}>{interest}</div>
              ))}

            </div>
            <input 
              type="text" 
              className="input-field" 
              placeholder="+ Add custom interest..." 
              value={customInterest}
              onChange={e => setCustomInterest(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && customInterest.trim()) {
                  if (!interestsSelected.includes(customInterest.trim())) {
                    setInterestsSelected([...interestsSelected, customInterest.trim()]);
                  }
                  setCustomInterest("");
                }
              }}
              style={{ margin: 0, padding: '0.5rem', fontSize: '0.8rem' }}
            />
          </div>

          {/* SECTION 3: OPPORTUNITY TYPE */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Opportunity Type</label>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {['Grants', 'Hackathons', 'Both'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', color: opportunityType === opt ? 'white' : 'var(--text-secondary)' }}>
                  <input type="radio" checked={opportunityType === opt} onChange={() => setOpportunityType(opt)} style={{ accentColor: 'var(--accent)' }} /> {opt}
                </label>
              ))}
            </div>
          </div>

          {/* SECTION 4: PRIZE POOL */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Prize Pool Range ($)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="number" className="input-field" style={{ margin: 0, padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} value={minReward} onChange={e => setMinReward(e.target.value ? Number(e.target.value) : '')} placeholder="Min" />
              <span style={{ color: 'var(--text-secondary)' }}>—</span>
              <input type="number" className="input-field" style={{ margin: 0, padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} value={maxReward} onChange={e => setMaxReward(e.target.value ? Number(e.target.value) : '')} placeholder="Max" />
            </div>
          </div>


          {/* SECTION 5: DEADLINE */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Deadline Window</label>
            <select className="input-field" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ padding: '0.5rem', fontSize: '0.85rem', appearance: 'menulist' }}>

              {DEADLINE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* SECTION 6: EXPERIENCE STEPPER */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Experience Level</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.2rem' }}>
              {EXP_LABELS.map((label, idx) => {
                const level = idx + 1;
                const isSelected = experience >= level;
                const isCurrent = experience === level;
                return (
                  <div key={label} onClick={() => setExperience(level)} style={{ flex: 1, textAlign: 'center', padding: '0.4rem 0', cursor: 'pointer', borderRight: idx < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: isCurrent ? 'rgba(108, 92, 231, 0.3)' : 'transparent', borderRadius: isCurrent ? '8px' : '0', transition: '0.2s' }}>

                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.2)', margin: '0 auto 0.4rem auto', transition: '0.2s' }} />
                    <div style={{ fontSize: '0.6rem', color: isSelected ? 'white' : 'var(--text-secondary)', fontWeight: isCurrent ? 'bold' : 'normal', transition: '0.2s' }}>{label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 7: TEAM SIZE */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', color: 'white', fontWeight: 'bold' }}>Team Format</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['Solo', 'Team', 'Any'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', color: teamSize === opt ? 'white' : 'var(--text-secondary)' }}>
                  <input type="radio" checked={teamSize === opt} onChange={() => setTeamSize(opt)} style={{ accentColor: 'var(--accent)' }} /> {opt}
                </label>
              ))}
            </div>
          </div>

          {/* SECTION 8: ECOSYSTEMS */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Ecosystems</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              
              <div onClick={() => toggleSelection('OneChain', ecosystems, setEcosystems)} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', background: ecosystems.includes('OneChain') ? 'var(--primary-dark)' : 'rgba(255,255,255,0.05)', border: ecosystems.includes('OneChain') ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)', color: ecosystems.includes('OneChain') ? 'white' : 'var(--text-secondary)', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                OneChain 
                <span style={{fontSize: '0.55rem', background: 'var(--accent)', color: '#000', padding: '1px 4px', borderRadius: '6px', fontWeight: 'bold', letterSpacing: '0.3px'}}>
                  PRO
                </span>
              </div>
              
              <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.2rem 0' }} />

              {AVAILABLE_ECOSYSTEMS.filter(e => e !== 'OneChain').map(eco => (
                <div key={eco} onClick={() => toggleSelection(eco, ecosystems, setEcosystems)} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer', background: ecosystems.includes(eco) ? 'var(--primary-dark)' : 'rgba(255,255,255,0.05)', border: ecosystems.includes(eco) ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)', color: ecosystems.includes(eco) ? 'white' : 'var(--text-secondary)', transition: '0.2s' }}>{eco}</div>
              ))}
            </div>
          </div>


          </div>
        </div>
          
        {/* STICKY ACTION BUTTONS — outside the scroll container */}
        <div style={{ 
          flexShrink: 0,
          padding: '1rem 1.5rem', 
          background: 'rgba(20, 20, 43, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          <button onClick={handleSavePreferences} className="btn-primary" style={{ padding: '0.8rem', fontSize: '1rem' }}>
            🔄 Apply & Refresh Search
          </button>
          <button onClick={resetPreferences} style={{ fontSize: '0.8rem', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>
            ↩ Reset Defaults
          </button>
        </div>
      </div>

      {/* OVERLAY MODAL */}
      {selectedGrant && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '2rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedGrant(null);
          }}
        >
          <div 
            className="glass-card" 
            style={{ 
              width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: 0, 
              display: 'flex', flexDirection: 'column', position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
            }}
          >
            <button 
              onClick={() => { setSelectedGrant(null); setMatchAnalysis(""); }} 
              style={{ 
                position: 'absolute', top: '1.5rem', right: '1.5rem', 
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', 
                color: 'white', borderRadius: '50%', width: '40px', height: '40px', 
                fontSize: '1.5rem', cursor: 'pointer', zIndex: 10,
                display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              ×
            </button>

            {/* Modal Banner Top */}
            <div style={{ width: '100%', height: '220px', background: generateGradient(selectedGrant?.grant?.id, 1, selectedGrant?.grant), display: 'flex', alignItems: 'flex-end', padding: '2rem', position: 'relative' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 <div style={{ display: 'flex', gap: '0.8rem' }}>
                   {selectedGrant?.grant?.tracks?.map((track: string) => (
                     <span key={track} className="tag-chip" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white' }}>{track}</span>
                   ))}
                 </div>
                 <h2 style={{ margin: 0, fontSize: '2.5rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                   {selectedGrant?.grant?.title || 'Unknown Grant'}
                 </h2>
                 <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' }}>Source: {selectedGrant?.grant?.source || 'Community'}</span>
               </div>
            </div>
            
            {/* Modal Content */}
            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '1.1rem', flex: 1, minWidth: '200px' }}>
                  <span style={{ fontSize: '1.5rem' }}>💰</span> 
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Reward Pool</div>
                    <div style={{ fontWeight: 'bold' }}>{selectedGrant?.grant?.reward || 'TBA'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '1.1rem', flex: 1, minWidth: '200px' }}>
                  <span style={{ fontSize: '1.5rem' }}>⏰</span> 
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Deadline</div>
                    <div style={{ fontWeight: 'bold' }}>{selectedGrant?.grant?.deadline || 'TBA'}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                  <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.25rem', borderLeft: '4px solid var(--accent)', paddingLeft: '1rem' }}>Description</h3>
                  <p style={{ lineHeight: '1.7', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                    {selectedGrant?.grant?.description || 'No description available.'}
                  </p>
                </div>
                <div>
                  <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.25rem', borderLeft: '4px solid var(--accent)', paddingLeft: '1rem' }}>Requirements</h3>
                  <p style={{ lineHeight: '1.7', fontSize: '1rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {selectedGrant?.grant?.requirements || 'No specific requirements listed.'}
                  </p>
                  <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>REQUIRED SKILLS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedGrant?.grant?.required_skills?.map((skill: string) => (
                        <span key={skill} className="tag-chip" style={{ background: 'rgba(108, 92, 231, 0.1)', color: 'var(--accent)', borderColor: 'rgba(108, 92, 231, 0.3)' }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI INSIGHT SECTION */}
              {(isAnalyzing || matchAnalysis) && (
                <div style={{ 
                  marginBottom: '2.5rem', padding: '1.5rem', borderRadius: '12px', 
                  background: 'rgba(0, 206, 255, 0.05)', border: '1px solid rgba(0, 206, 255, 0.2)',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🤖</span> AI Match Insight
                  </h4>
                  {isAnalyzing ? (
                    <p className="pulsing-text" style={{ margin: 0 }}>Analyzing your profile against this grant...</p>
                  ) : (
                    <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem', color: 'white', whiteSpace: 'pre-wrap' }}>{matchAnalysis}</p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => toggleBookmark(selectedGrant.grant.id)}
                    className={`btn-secondary ${savedGrants.includes(selectedGrant.grant.id) ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', color: savedGrants.includes(selectedGrant.grant.id) ? 'gold' : 'white' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{savedGrants.includes(selectedGrant.grant.id) ? '★' : '☆'}</span> 
                    {savedGrants.includes(selectedGrant.grant.id) ? 'Saved' : 'Save'}
                  </button>

                  {!matchAnalysis && (
                    <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', color: 'var(--accent)', borderColor: 'rgba(0, 206, 255, 0.4)', opacity: isAnalyzing ? 0.7 : 1 }}
                    >
                      {isAnalyzing ? (
                         <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(0,206,255,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      ) : (
                         <span>🚀</span>
                      )}
                      {isAnalyzing ? "Thinking..." : "Quick AI Analysis"}
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn-primary" 
                    style={{ fontSize: '1.1rem', padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                    onClick={() => navigate(`/idealab?grantId=${selectedGrant?.grant?.id}`)}
                  >
                    <span>✨</span> Generate Winning Idea
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
