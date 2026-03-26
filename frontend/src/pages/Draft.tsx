import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { api } from '../api';
import { getMockAddress } from '../wallet';

export default function Draft() {
  const { grantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const account = useCurrentAccount();
  
  const initialIdea = location.state?.idea || "";
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  const wallet_address = account?.address || getMockAddress();

  useEffect(() => {
    if (!wallet_address) return navigate('/connect');
    if (!initialIdea) return navigate('/grants');

    async function generateDraft() {
      try {
        const res = await api.generateDraft({
          wallet_address: wallet_address!,
          grant_id: parseInt(grantId!),
          idea: initialIdea
        });
        setDraft(res.draft_and_checklist);
      } catch (e) {
        console.error(e);
        setDraft("Error generating draft.");
      } finally {
        setLoading(false);
      }
    }
    generateDraft();
  }, [wallet_address, grantId, initialIdea, navigate]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Application Draft & Checklist</h2>
      <p className="page-subtitle">AI-generated full application ready for submission.</p>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <h3>AI is writing your full application & checking requirements...</h3>
        </div>
      ) : (
        <div className="glass-card">
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '8px' }}>
            {draft}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary)' }} onClick={() => navigate(-1)}>
              Back to Edit Idea
            </button>
            <button className="btn-primary" onClick={() => navigate(`/submit/${grantId}`, { state: { draft } })}>
              Finalize & Submit On-Chain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
