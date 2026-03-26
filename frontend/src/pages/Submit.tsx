import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { api } from '../api';
import { CONTRACT, getMockAddress } from '../wallet';

async function hashString(message: string): Promise<Uint8Array> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  return new Uint8Array(hashBuffer);
}

export default function Submit() {
  const { grantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  
  const draft = location.state?.draft || "";
  const [status, setStatus] = useState("idle"); 
  const [digest, setDigest] = useState("");

  const wallet_address = account?.address || getMockAddress();

  useEffect(() => {
    if (!wallet_address) return navigate('/connect');
    if (!draft) return navigate('/grants');
  }, [wallet_address, draft, navigate]);

  const handleSubmit = async () => {
    setStatus("signing");
    try {
      if (CONTRACT.MOCK_MODE || !account) {
        // MOCK SUBMISSION (Skip Blockchain)
        console.log("Mock submission mode active...");
        await new Promise(r => setTimeout(r, 1500)); // Simulate delay
        setDigest("mock_digest_" + Math.random().toString(36).substring(2, 12));
        setStatus("success");
        await api.submitFinish(wallet_address!);
        return;
      }

      // Real blockchain submission
      const ideaHash = await hashString(draft);
      const tx = new Transaction();
      tx.moveCall({
        target: `${CONTRACT.PACKAGE_ID}::registry::submit`,
        arguments: [
          tx.object(CONTRACT.REGISTRY_OBJECT_ID),
          tx.pure.u64(grantId!),
          tx.pure.vector('u8', [].slice.call(ideaHash)),
          tx.object('0x6'), // Clock
        ]
      });

      const response = await signAndExecute({
        transaction: tx,
      });

      setDigest(response.digest);
      setStatus("success");
      await api.submitFinish(wallet_address!);
      
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Submit Proof-of-Idea</h2>
      <p className="page-subtitle">Record your application hash on OneChain.</p>

      {status === "idle" && (
        <div>
          <p>By submitting, you create an immutable record of your idea tied to your OneWallet.</p>
          <button className="btn-primary" style={{ marginTop: '2rem', padding: '1rem 3rem', fontSize: '1.2rem' }} onClick={handleSubmit}>
            Sign & Submit On-Chain
          </button>
        </div>
      )}

      {status === "signing" && (
        <div style={{ margin: '3rem 0' }}>
          <h3 style={{ color: 'var(--accent)' }}>Please approve the transaction in OneWallet...</h3>
        </div>
      )}

      {status === "success" && (
        <div style={{ margin: '2rem 0' }}>
          <h2 style={{ color: '#00FF00' }}>Success!</h2>
          <p>Your Proof-of-Idea is now recorded on-chain.</p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', marginTop: '1rem', borderRadius: '8px', wordBreak: 'break-all' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Transaction Digest:</span><br/>
            {digest}
          </div>
          <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/profile')}>
            Return to Profile
          </button>
        </div>
      )}

      {status === "error" && (
        <div style={{ margin: '2rem 0' }}>
          <h3 style={{ color: '#FF3333' }}>Transaction Failed</h3>
          <p>Ensure your wallet is on Testnet and has enough OCT for gas.</p>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setStatus("idle")}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
