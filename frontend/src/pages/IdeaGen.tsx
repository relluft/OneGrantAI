import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { api } from '../api';
import { getMockAddress } from '../wallet';

export default function IdeaGen() {
  const { grantId } = useParams();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const [userIdea, setUserIdea] = useState('');
  const [aiIdea, setAiIdea] = useState("");
  const [loading, setLoading] = useState(false);

  const wallet_address = account?.address || getMockAddress();

  useEffect(() => {
    if (!wallet_address) navigate('/connect');
  }, [wallet_address, navigate]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.generateIdea({
        wallet_address: wallet_address!,
        grant_id: parseInt(grantId!),
        user_idea: userIdea || undefined
      });
      setAiIdea(res.generated_idea);
    } catch (e) {
      console.error(e);
      setAiIdea("Failed to generate idea. Ensure AI backend is reachable and API key is set.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Generate Hackathon Idea</h2>
      <p className="page-subtitle">Let AI craft the perfect idea for this grant.</p>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Your initial idea (Optional)</label>
        <textarea
          className="input-field"
          rows={4}
          placeholder="I want to build a decentralized exchange for game items..."
          value={userIdea}
          onChange={e => setUserIdea(e.target.value)}
        />
        <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'AI is Thinking...' : 'Generate Idea'}
        </button>
      </div>

      {aiIdea && (
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--accent)', marginTop: 0 }}>AI Proposal</h3>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{aiIdea}</div>

          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <button className="btn-primary" onClick={() => navigate(`/draft/${grantId}`, { state: { idea: aiIdea } })}>
              Proceed to Draft Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
