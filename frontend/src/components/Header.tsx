import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { getMockAddress, clearMockAddress } from '../wallet';

export default function Header({ hideTitle = false }: { hideTitle?: boolean }) {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const mockAddr = getMockAddress();
  const navigate = useNavigate();
  const location = useLocation();

  const [openConnect, setOpenConnect] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('connect') === 'true' && !account && !mockAddr) {
      setOpenConnect(true);
      // Remove query param without triggering reload
      navigate(location.pathname, { replace: true });
    }
  }, [location, account, mockAddr, navigate]);

  const [nickname, setNickname] = useState(localStorage.getItem('user_nickname') || 'Builder');
  const [avatar, setAvatar] = useState(localStorage.getItem('user_avatar') || '🦄');

  useEffect(() => {
    const handleStorageChange = () => {
      setNickname(localStorage.getItem('user_nickname') || 'Builder');
      setAvatar(localStorage.getItem('user_avatar') || '🦄');
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for local changes in the same window (custom event might be better, 
    // but for now we can just use the initial state and manual triggers if needed)
    // However, Profile.tsx updates localStorage directly. To see it in Header instantly, 
    // we can use a small interval or just a custom event.
    const interval = setInterval(handleStorageChange, 1000); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sui_wallet_was_connected');
    disconnect();
    clearMockAddress();
    navigate('/welcome');
  };

  const isBase64Avatar = avatar.startsWith('data:image');

  return (
    <header style={{ display: 'flex', justifyContent: hideTitle ? 'flex-end' : 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
      {!hideTitle && (
        <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '2px' }}>
          <h2 style={{ margin: 0 }}>
            <span style={{ 
              background: 'linear-gradient(135deg, var(--accent) 0%, #3498db 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontWeight: 800
            }}>OneGrant</span>
            <span style={{ 
              background: 'linear-gradient(135deg, #a29bfe 0%, var(--primary) 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontWeight: 800
            }}>.AI</span>
          </h2>
        </Link>
      )}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        
        {/* User Profile Mini-Widget */}
        {(account || mockAddr) && (
          <div 
            onClick={() => navigate('/profile')}
            className="glass-2 animate-slide-up" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.5rem 1rem', 
              borderRadius: '12px', 
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: '0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ 
              width: '32px', height: '32px', 
              borderRadius: '8px', 
              background: isBase64Avatar ? `url(${avatar}) center/cover no-repeat` : 'var(--gradient-main)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 0 10px rgba(0, 206, 255, 0.2)'
            }}>
              {!isBase64Avatar && avatar}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', lineHeight: '1.1' }}>{nickname}</span>
              {(account?.address || mockAddr) && (
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', opacity: 0.8 }}>
                  {(account?.address || mockAddr)!.slice(0, 6)}...{(account?.address || mockAddr)!.slice(-4)}
                </span>
              )}
            </div>
          </div>
        )}

        {(account || mockAddr) ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {mockAddr && !account && (
              <span style={{ color: 'var(--accent)', fontSize: '0.8rem', background: 'rgba(0, 206, 255, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(108, 92, 231, 0.3)' }}>
                🛠 DEV MODE
              </span>
            )}
            <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <ConnectModal
            open={openConnect}
            onOpenChange={setOpenConnect}
            trigger={
              <button
                style={{
                  background: 'var(--gradient-main)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Connect Wallet
              </button>
            }
          />
        )}
      </div>
    </header>
  );
}
