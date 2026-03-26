import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, ConnectModal } from '@mysten/dapp-kit';
import { getMockAddress, setMockAddress } from '../wallet';

type Status = 'connect' | 'success' | 'empty';

export default function Connect() {
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('connect');
  const [openConnect, setOpenConnect] = useState(false);

  useEffect(() => {
    // Check if originally connected before they landed here,
    // though the user expects to see the flow. If they were already logged in?
    if (account || getMockAddress()) {
      localStorage.setItem('sui_wallet_was_connected', 'true');
      if (status === 'connect') {
        setStatus('success');
      }
    }
  }, [account]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const handleDevLogin = () => {
    localStorage.setItem('sui_wallet_was_connected', 'true');
    setMockAddress("0xmock_user_12345");
    setStatus('success');
  };

  if (status === 'empty') {
    return <div style={{ minHeight: '60vh' }} />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '70vh',
      textAlign: 'center'
    }}>
      {status === 'success' ? (
        <h2 style={{ fontSize: '2.5rem', opacity: 0, animation: 'fadeInOut 3s forwards', color: 'var(--accent)' }}>
          You are logged in, Start your journey!
        </h2>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
          <ConnectModal
            open={openConnect}
            onOpenChange={setOpenConnect}
            trigger={
              <button 
                className="btn-primary" 
                style={{ fontSize: '1.5rem', padding: '1.2rem 4rem', boxShadow: '0 10px 30px rgba(108, 92, 231, 0.4)' }}
              >
                Connect Wallet
              </button>
            }
          />
          
          <button 
            onClick={handleDevLogin} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'rgba(255,255,255,0.2)', 
              cursor: 'pointer', 
              fontSize: '0.8rem',
              textDecoration: 'underline'
            }}
          >
            dev mode login
          </button>
        </div>
      )}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
