import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Trash2, FolderOpen, Lock, Search, FileQuestion, Award, EyeOff, Eye } from 'lucide-react';
import { getMockAddress } from '../wallet';

const STATUS_COLORS: Record<string, string> = {
  'Idea': '#FFB142',
  'Draft': 'var(--accent)',
  'Submitted': '#00b894',
  'Won': 'gold'
};

const STATUS_PROGRESS: Record<string, number> = {
  'Idea': 25,
  'Draft': 75,
  'Submitted': 100,
  'Won': 100
};

export default function Applications() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const address = account?.address || getMockAddress();
  
  const [apps, setApps] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [hiddenDigests, setHiddenDigests] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('hidden_applications') || '[]');
  });
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    if (address) {
      const saved = JSON.parse(localStorage.getItem('my_applications') || '[]');
      setApps(saved.slice().reverse());
    }
  }, [address]);

  const handleDeleteApp = (createdAt: number) => {
    const saved = JSON.parse(localStorage.getItem('my_applications') || '[]');
    const updated = saved.filter((app: any) => app.createdAt !== createdAt);
    localStorage.setItem('my_applications', JSON.stringify(updated));
    setApps(updated.slice().reverse());
  };

  const handleToggleHide = (digest: string) => {
    let updated: string[];
    if (hiddenDigests.includes(digest)) {
      updated = hiddenDigests.filter(d => d !== digest);
    } else {
      updated = [...hiddenDigests, digest];
    }
    setHiddenDigests(updated);
    localStorage.setItem('hidden_applications', JSON.stringify(updated));
  };

  if (!address) {
    return (
      <div className="glass-card fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem' }}>
          <FolderOpen size={32} color="var(--accent)" /> My Applications
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(108, 92, 231, 0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(108, 92, 231, 0.3)', boxShadow: '0 0 20px rgba(108, 92, 231, 0.2)' }}>
            <Lock size={40} color="var(--accent)" />
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.2rem' }}>
          Connect your wallet to see your saved drafts and submitted applications.
        </p>
        <button className="btn-primary" onClick={() => navigate('/connect')} style={{ padding: '1rem 3rem' }}>
          Connect Wallet
        </button>
      </div>
    );
  }

  const filteredApps = apps
    .filter(a => filter === 'All' || a.status === filter)
    .filter(a => showHidden || !hiddenDigests.includes(a.digest));

  const hiddenCount = apps.filter(a => hiddenDigests.includes(a.digest)).length;

  return (
    <div className="glass-card fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <FolderOpen size={32} color="var(--accent)" /> My Applications
        </h1>
        <button className="btn-primary" onClick={() => navigate('/grants')} style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Find Grants <Search size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', overflowX: 'auto', whiteSpace: 'nowrap', alignItems: 'center' }}>
        {['All', 'Idea', 'Draft', 'Submitted'].map(f => (
           <button 
             key={f} 
             onClick={() => setFilter(f)}
             style={{ 
               background: 'transparent', border: 'none', color: filter === f ? 'white' : 'var(--text-secondary)', 
               fontWeight: filter === f ? 'bold' : 'normal', borderBottom: filter === f ? '2px solid var(--accent)' : '2px solid transparent',
               padding: '0.5rem 1rem', cursor: 'pointer', transition: '0.2s', fontSize: '1rem' 
             }}
           >
             {f}
           </button>
        ))}
        {hiddenCount > 0 && (
          <button
            onClick={() => setShowHidden(!showHidden)}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
              color: showHidden ? 'var(--accent)' : 'var(--text-secondary)',
              padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem', marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: '0.4rem', transition: '0.2s'
            }}
          >
            {showHidden ? <Eye size={14} /> : <EyeOff size={14} />}
            {showHidden ? 'Hide hidden' : `Show hidden (${hiddenCount})`}
          </button>
        )}
      </div>
      
      {filteredApps.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '1rem', opacity: 0.6 }}>
            <FileQuestion size={48} />
          </div>
          <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white' }}>No applications found for this status.</p>
          <button className="btn-secondary" onClick={() => navigate('/grants')}>Explore Opportunities</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredApps.map((app, idx) => {
            const progress = STATUS_PROGRESS[app.status] || 0;
            const color = STATUS_COLORS[app.status] || 'white';
            const isHidden = hiddenDigests.includes(app.digest);
            
            return (
              <div key={idx} className="glass-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${color}`, display: 'flex', flexDirection: 'column', gap: '1rem', transition: '0.3s', opacity: isHidden ? 0.5 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold' }}>
                        {app.status.toUpperCase()}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>{app.grantTitle || `Grant #${app.grantId}`}</h3>
                    </div>
                    {app.userIdea && (
                      <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', maxWidth: '600px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        "{app.userIdea}"
                      </p>
                    )}
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '1rem' }}>
                      <span>Created: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Unknown'}</span>
                      <span>Updated: {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {app.status === 'Submitted' ? (
                      <>
                        <button 
                          className="btn-secondary"
                          onClick={() => handleToggleHide(app.digest)}
                          style={{ 
                            padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                          title={isHidden ? 'Unhide application' : 'Hide application'}
                        >
                          {isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button className="btn-secondary glow-primary" onClick={() => navigate(`/certificate/${app.digest}`)} style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem', borderColor: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          View Certificate <Award size={18} color="var(--accent)" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="btn-secondary" 
                          onClick={() => handleDeleteApp(app.createdAt)} 
                          style={{ 
                            padding: '0.6rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderColor: 'rgba(255, 51, 51, 0.2)',
                            color: 'rgba(255, 255, 255, 0.6)'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#FF3333';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.background = 'rgba(255, 51, 51, 0.1)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255, 51, 51, 0.2)';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                            e.currentTarget.style.background = 'transparent';
                          }}
                          title="Delete draft"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button className="btn-primary" onClick={() => navigate(`/idealab?grantId=${app.grantId}`)} style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem' }}>
                          Continue →
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white', minWidth: '40px', textAlign: 'right' }}>{progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
