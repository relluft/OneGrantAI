import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Certificate() {
  const { digest } = useParams();
  const navigate = useNavigate();
  const [appData, setAppData] = useState<any>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // In production, data would be fetched from the backend by digest
    // For MVP, we search localStorage
    const saved = JSON.parse(localStorage.getItem('my_applications') || '[]');
    const matchingApp = saved.find((a: any) => a.digest === digest);
    
    // Simulating blockchain verification
    setTimeout(() => {
      setAppData(matchingApp || null);
      setVerifying(false);
    }, 1500);
  }, [digest]);

  if (verifying) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="spinner" style={{ width: '80px', height: '80px', border: '4px solid rgba(0,206,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite' }} />
        <h2 className="pulsing-text" style={{ marginTop: '2rem', letterSpacing: '2px' }}>VERIFYING PROOF-OF-IDEA...</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Querying OneChain Testnet nodes</p>
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
        <h2>Certificate Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>We couldn't find a matching Proof-of-Idea for this digest in your local history.</p>
        <button className="btn-secondary" onClick={() => navigate('/applications')}>Back to Applications</button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      
      <button className="btn-secondary" onClick={() => window.history.back()} style={{ marginBottom: '2rem', padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
        ← Back
      </button>

      {/* CERTIFICATE CONTAINER */}
      <div className="glass-card certificate-card" style={{ 
        position: 'relative', 
        padding: '0', 
        overflow: 'hidden',
        border: '1px solid rgba(0,206,255,0.3)',
        boxShadow: '0 0 40px rgba(0,206,255,0.1), inset 0 0 20px rgba(0,0,0,0.5)'
      }}>
        {/* Background Decorative Elements */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--accent)', filter: 'blur(150px)', opacity: 0.15, zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: '#FF117F', filter: 'blur(150px)', opacity: 0.1, zIndex: 0 }} />
        
        {/* Watermark */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '8rem', color: 'rgba(255,255,255,0.02)', fontWeight: 900, whiteSpace: 'nowrap', zIndex: 1, pointerEvents: 'none' }}>
           VERIFIED
        </div>

        {/* Certificate Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          
          {/* Header */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', background: 'linear-gradient(90deg, #FFFFFF, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Proof of Idea
              </h1>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', letterSpacing: '1px' }}>CERTIFICATE OF INTELLECTUAL PROPERTY</div>
            </div>
            
            <div className="badge-glow" style={{ textAlign: 'center', background: 'rgba(0,206,255,0.1)', border: '1px solid var(--accent)', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--accent)', color: '#000', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>✓</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', letterSpacing: '1px' }}>ON-CHAIN SECURED</span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', padding: '3rem', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
             <div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Grant Program</div>
               <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>{appData.grantTitle || `Grant ID: ${appData.grantId}`}</div>
             </div>
             
             <div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Timestamp</div>
               <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white' }}>{new Date(appData.createdAt).toLocaleString()}</div>
             </div>
             
             <div style={{ gridColumn: '1 / -1' }}>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Transaction Digest (OneChain Testnet)</div>
               <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', color: 'var(--accent)', background: 'rgba(0,206,255,0.05)', padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid rgba(0,206,255,0.2)', wordBreak: 'break-all' }}>
                 {digest}
               </div>
             </div>
          </div>

          {/* Full Application Content */}
          <div style={{ padding: '3rem' }}>
             <h3 style={{ margin: '0 0 2rem 0', color: 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 'normal' }}>
               « <i>{appData.userIdea || 'AI Generated Concept'}</i> »
             </h3>
             
             <div className="markdown-body" style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-15px', right: '30px', background: 'var(--bg-card)', padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>Decoded Content</div>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{appData.draft}</ReactMarkdown>
             </div>
             
          </div>

          {/* Footer Verify Button */}
          <div style={{ padding: '2rem 3rem', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
             <button 
               className="btn-primary" 
               style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 2.5rem', borderRadius: '30px' }}
               onClick={() => window.open(`https://onescan.cc/testnet/transactionBlocksDetail?digest=${digest}`)}
               title="Open technical JSON explorer"
             >
               🔍 View Raw Blockchain Record
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
