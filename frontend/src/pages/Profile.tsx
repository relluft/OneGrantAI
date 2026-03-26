import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { api } from '../api';
import { getMockAddress } from '../wallet';

const icons = {
  edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  link: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  zap: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  trophy: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10M5 4h1M5 4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1M19 4h-1M19 4c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-1M9 4v13c0 1.6 1.3 3 3 3s3-1.4 3-3V4"/></svg>,
  diamond: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13"/><path d="M13 3l3 6-4 13"/></svg>,
  users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  code: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  terminal: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  user: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
};

export default function Profile() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const wallet_address = account?.address || getMockAddress();

  // Primary user editable states
  const [nickname, setNickname] = useState(localStorage.getItem('user_nickname') || 'Builder');
  const [editingName, setEditingName] = useState(false);
  const [bio, setBio] = useState(localStorage.getItem('user_bio') || 'Web3 Enthusiast building the decentralized future.');
  const [editingBio, setEditingBio] = useState(false);
  const [avatarStr, setAvatarStr] = useState(localStorage.getItem('user_avatar') || '');
  
  const [socials, setSocials] = useState({
    github: localStorage.getItem('user_github') || '',
    twitter: localStorage.getItem('user_twitter') || '',
    telegram: localStorage.getItem('user_telegram') || '',
    discord: localStorage.getItem('user_discord') || ''
  });
  const [editingSocials, setEditingSocials] = useState(false);
  
  const [customTeams, setCustomTeams] = useState<{name: string, role: string, members: number, type: 'hardcoded' | 'custom'}[]>(() => {
    const stored = localStorage.getItem('user_custom_teams');
    if (stored) return JSON.parse(stored);
    
    // Default teams if none stored
    return [
      { name: "DeFi Foxes", role: "Smart Contract Dev", members: 5, type: 'hardcoded' },
      { name: "Orbit Builders", role: "Frontend Lead", members: 3, type: 'hardcoded' }
    ];
  });
  const [addingTeam, setAddingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!wallet_address) return navigate('/connect');

    async function loadStats() {
      try {
        const data = await api.getProfile(wallet_address!);
        if (data.xp !== undefined) {
          setXp(data.xp);
        }
      } catch (e) {
        setXp(0);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [wallet_address, navigate]);

  const saveNickname = () => {
    localStorage.setItem('user_nickname', nickname);
    setEditingName(false);
  };

  const saveBio = () => {
    localStorage.setItem('user_bio', bio);
    setEditingBio(false);
  };

  const saveSocials = () => {
    localStorage.setItem('user_github', socials.github);
    localStorage.setItem('user_twitter', socials.twitter);
    localStorage.setItem('user_telegram', socials.telegram);
    localStorage.setItem('user_discord', socials.discord);
    setEditingSocials(false);
  };

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      const updated = [...customTeams, { name: newTeamName.trim(), role: "Member", members: 1, type: 'custom' as const }];
      setCustomTeams(updated);
      localStorage.setItem('user_custom_teams', JSON.stringify(updated));
    }
    setNewTeamName("");
    setAddingTeam(false);
  };

  const handleDeleteTeam = (idx: number) => {
    const updated = customTeams.filter((_, i) => i !== idx);
    setCustomTeams(updated);
    localStorage.setItem('user_custom_teams', JSON.stringify(updated));
  };

  const handleAvatarSelect = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarStr(result);
        localStorage.setItem('user_avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isBase64Avatar = avatarStr.startsWith('data:image');

  // Gamification logic
  const calculateLevel = (currentXp: number) => Math.floor(currentXp / 100) + 1;
  const xpForNextLevel = 100 - (xp % 100);
  const progressPercent = (xp % 100);
  const level = calculateLevel(xp);

  let rank = "Novice Explorer";
  let globalRating = "#12,402";
  if (level >= 3) { rank = "Grant Hunter"; globalRating = "#5,201"; }
  if (level >= 5) { rank = "Web3 Orchestrator"; globalRating = "#1,992"; }
  if (level >= 10) { rank = "OneChain Legend"; globalRating = "#142"; }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Builder Profile</h2>

      {/* Main Profile Card */}
      <div className="glass-card" style={{ display: 'flex', gap: '2.5rem', marginBottom: '2rem', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
        
        {/* Banner background */}
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, 
          width: '100%', height: '180px', 
          background: 'linear-gradient(180deg, rgba(0, 206, 255, 0.15) 0%, rgba(108, 92, 231, 0.08) 60%, transparent 100%)', 
          zIndex: 0 
        }} />
        
        {/* Avatar Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '20px', zIndex: 1 }}>
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              width: '140px', height: '140px', 
              borderRadius: '24px', 
              background: isBase64Avatar ? `url(${avatarStr}) center/cover no-repeat` : 'var(--gradient-main)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 0 20px rgba(108, 92, 231, 0.4)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              border: '4px solid var(--bg-dark)'
            }}
          >
            {!isBase64Avatar && <span style={{ color: 'white' }}>{icons.user}</span>}
            <div style={{
              position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', 
              color: 'white', fontSize: '0.75rem', textAlign: 'center', padding: '4px 0', opacity: 0, transition: 'opacity 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
              Change
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleAvatarSelect} accept="image/*" style={{ display: 'none' }} />
          
          <div style={{ textAlign: 'center', background: 'rgba(0, 206, 255, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(0, 206, 255, 0.3)', minWidth: '120px' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{globalRating}</div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Global Rating</div>
          </div>
        </div>

        {/* Info Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '40px', zIndex: 1 }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              {editingName ? (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input className="input-field" style={{ margin: 0, padding: '0.5rem', width: '250px' }} value={nickname} onChange={e => setNickname(e.target.value)} autoFocus />
                  <button className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={saveNickname}>Save</button>
                </div>
              ) : (
                <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {nickname} 
                  <span style={{ cursor: 'pointer', color: 'var(--text-secondary)', transition: '0.2s' }} className="hover-accent" onClick={() => setEditingName(true)}>
                    {icons.edit}
                  </span>
                </h3>
              )}
              <p style={{ color: 'var(--accent)', fontWeight: 'bold', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{rank}  •  Level {level}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Address</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {wallet_address?.substring(0, 6)}...{wallet_address?.substring(wallet_address.length - 4)}
                </span>
                <button 
                  onClick={() => navigator.clipboard.writeText(wallet_address || '')} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 0.2rem', display: 'flex', alignItems: 'center' }}
                  title="Copy Address"
                  className="hover-accent"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
          </div>

          <div>
            {editingBio ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <textarea className="input-field" rows={3} style={{ resize: 'none' }} value={bio} onChange={e => setBio(e.target.value)} autoFocus />
                <button className="btn-secondary" style={{ alignSelf: 'flex-start', padding: '0.4rem 1rem' }} onClick={saveBio}>Save Bio</button>
              </div>
            ) : (
              <div style={{ position: 'relative', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>{bio}</p>
                <div style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', color: 'var(--text-secondary)' }} className="hover-accent" onClick={() => setEditingBio(true)}>
                  {icons.edit}
                </div>
              </div>
            )}
          </div>

          {/* Social Links Block */}
          <div style={{ marginTop: '1.5rem' }}>
            {editingSocials ? (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>Edit Social Links</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input className="input-field" placeholder="GitHub URL" value={socials.github} onChange={e => setSocials({...socials, github: e.target.value})} style={{ marginBottom: 0 }} />
                  <input className="input-field" placeholder="X (Twitter) URL" value={socials.twitter} onChange={e => setSocials({...socials, twitter: e.target.value})} style={{ marginBottom: 0 }} />
                  <input className="input-field" placeholder="Telegram Username" value={socials.telegram} onChange={e => setSocials({...socials, telegram: e.target.value})} style={{ marginBottom: 0 }} />
                  <input className="input-field" placeholder="Discord Username" value={socials.discord} onChange={e => setSocials({...socials, discord: e.target.value})} style={{ marginBottom: 0 }} />
                </div>
                <button className="btn-secondary" style={{ marginTop: '1rem', padding: '0.4rem 1rem' }} onClick={saveSocials}>Save Links</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {socials.github && (
                    <a href={socials.github} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.95rem' }}>
                      GitHub: {socials.github.replace('https://', '')}
                    </a>
                  )}
                  {socials.twitter && (
                    <a href={socials.twitter} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.95rem' }}>
                      X (Twitter): {socials.twitter.replace('https://', '')}
                    </a>
                  )}
                  {socials.telegram && (
                    <a href={socials.telegram.startsWith('http') ? socials.telegram : `https://t.me/${socials.telegram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.95rem' }}>
                      Telegram: {socials.telegram}
                    </a>
                  )}
                  {socials.discord && (
                    <span style={{ color: 'var(--accent)', fontSize: '0.95rem' }}>
                      Discord: {socials.discord}
                    </span>
                  )}
                </div>
                
                <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setEditingSocials(true)}>
                  {(socials.github || socials.twitter || socials.telegram || socials.discord) ? <>{icons.edit} Edit Social Links</> : <>{icons.link} Add Social Links</>}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Progress & Achievements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-card">
            <h4 style={{ margin: '0 0 1.5rem 0' }}>XP & Progression</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Total XP: <strong>{xp}</strong></span>
              <span style={{ color: 'var(--accent)' }}>{xpForNextLevel} XP to Lvl {level + 1}</span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--gradient-main)', transition: 'width 0.5s ease-out' }} />
            </div>
          </div>

          <div className="glass-card">
            <h4 style={{ margin: '0 0 1.5rem 0' }}>Achievements (3)</h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(255,215,0,0.1)', border: '1px solid gold', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'gold' }}>
                  {icons.zap}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>First Draft</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(0,255,128,0.1)', border: '1px solid limegreen', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'limegreen' }}>
                  {icons.trophy}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hack Winner</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(0,206,255,0.1)', border: '1px solid var(--accent)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent)' }}>
                  {icons.diamond}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Move Dev</span>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h4 style={{ margin: '0 0 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              My Teams <span style={{ background: 'var(--primary-dark)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{customTeams.length}</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {customTeams.map((team, idx) => (
                <div key={idx} className="team-item-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', position: 'relative' }}>
                  <div style={{ 
                    width: '40px', height: '40px', 
                    background: team.type === 'hardcoded' 
                      ? (team.name.includes('Fox') ? 'linear-gradient(135deg, #FF6B6B, #FF8E53)' : 'linear-gradient(135deg, #4834D4, #686DE0)')
                      : 'linear-gradient(135deg, #10ac84, #1dd1a1)', 
                    borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' 
                  }}>
                    {team.type === 'hardcoded' ? (team.name.includes('Fox') ? icons.users : icons.code) : icons.terminal}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 0.2rem 0', fontWeight: 'bold', fontSize: '1rem' }}>{team.name}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Role: {team.role} • {team.members} Member{team.members > 1 ? 's' : ''}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteTeam(idx)}
                    style={{ 
                      background: 'rgba(255, 60, 60, 0.1)', 
                      border: '1px solid rgba(255, 60, 60, 0.2)', 
                      color: 'rgba(255, 60, 60, 0.8)',
                      borderRadius: '6px',
                      padding: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: '0.2s'
                    }}
                    className="hover-bright-red"
                    title="Remove Team"
                  >
                    {icons.trash}
                  </button>
                </div>
              ))}

              {addingTeam ? (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input className="input-field" placeholder="Team Name" style={{ margin: 0, padding: '0.5rem' }} value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} autoFocus />
                  <button className="btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={handleAddTeam}>Save</button>
                  <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => setAddingTeam(false)}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                  <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setAddingTeam(true)}>
                    {icons.plus} Add Team
                  </button>
                </div>
              )}
              
            </div>
          </div>

        </div>

        {/* Right Column: Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-card">
            <h4 style={{ margin: '0 0 1.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
              Active Projects <span style={{ background: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>2 In Progress</span>
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>OneHack AI Analytics Interface</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hackathon: OneHack 3.0 • Phase: Smart Contract Dev</p>
              </div>
              <div style={{ borderLeft: '3px solid rgba(255,255,255,0.3)', paddingLeft: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--text-secondary)' }}>DeFi Yield Aggregator</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', opacity: 0.6 }}>Grant: Builders' Hub • Phase: Design Drafts</p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(20,20,43,1) 0%, rgba(108,92,231,0.05) 100%)', border: '1px solid rgba(108, 92, 231, 0.3)' }}>
            <h4 style={{ margin: '0 0 1.5rem 0', color: 'gold' }}>Hall of Fame</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,215,0,0.05)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ color: 'gold' }}>{icons.trophy}</div>
              <div>
                <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold', color: 'white' }}>Metaverse Identity Protocol</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'gold' }}>1st Place — Orbit Community Hackathon (Feb 2026)</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
