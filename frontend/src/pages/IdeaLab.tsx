import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { getMockAddress, CONTRACT } from '../wallet';
import { api } from '../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Inline Confetti Component
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const colors = ['#00CEFF', '#6C5CE7', '#e44daa', '#00FF00', '#FFD700'];
  return (
    <div className="confetti-container">
      {Array.from({ length: 60 }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          top: `-20px`,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          width: `${Math.random() * 8 + 6}px`,
          height: `${Math.random() * 8 + 6}px`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${Math.random() * 2 + 2}s`,
        };
        return <div key={i} className="confetti-piece" style={style} />;
      })}
    </div>
  );
}

async function hashString(message: string): Promise<Uint8Array> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  return new Uint8Array(hashBuffer);
}

export default function IdeaLab() {
  const navigate = useNavigate();
  const location = useLocation();
  const account = useCurrentAccount();
  const address = account?.address || getMockAddress();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const client = useSuiClient();
  
  const queryParams = new URLSearchParams(location.search);
  const initialGrantId = queryParams.get('grantId') || '';

  const [selectedGrantId, setSelectedGrantId] = useState<string>(initialGrantId);
  const [grants, setGrants] = useState<any[]>([]);
  const [matchScore, setMatchScore] = useState<number>(0);
  
  const [step, setStep] = useState(1);
  const [userIdea, setUserIdea] = useState("");
  const [aiIdea, setAiIdea] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); 
  const [digest, setDigest] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // AI Chat State
  const [ideaChat, setIdeaChat] = useState<{role: string, content: string}[]>([]);
  const [draftChat, setDraftChat] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isIdeaChatOpen, setIsIdeaChatOpen] = useState(false);
  const [isDraftChatOpen, setIsDraftChatOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatEndRef.current) {
      const parent = chatEndRef.current.parentElement;
      if (parent) {
        parent.scrollTo({
          top: parent.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [ideaChat, draftChat]);

  useEffect(() => {
    if (status === "success") {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    api.getGrants().then(setGrants).catch(console.error);
  }, []);

  useEffect(() => {
    if (!grants.length) return; // Wait until grants are loaded
    
    if (selectedGrantId) {
      // Calculate mock match score for UI purposes
      const g = grants.find(g => g.id.toString() === selectedGrantId);
      if (g) {
        setMatchScore(Math.floor(Math.random() * 40) + 60); // 60-99% mock score
      }

      const apps = JSON.parse(localStorage.getItem('my_applications') || '[]');
      const existing = apps.find((a: any) => a.grantId === selectedGrantId);
      
      if (existing) {
        setUserIdea(existing.userIdea || "");
        setAiIdea(existing.aiIdea || "");
        setDraft(existing.draft || "");
        
        if (existing.status === "Submitted") {
           setStep(4);
           setStatus("success");
           setDigest(existing.digest || "Loaded from history");
        } else if (existing.status === "Draft" && existing.draft) {
           setStep(3);
        } else if (existing.status === "Idea" && existing.aiIdea) {
           setStep(2);
        } else {
           setStep(2);
        }
      } else {
        setStep(2);
        setUserIdea("");
        setAiIdea("");
        setDraft("");
        setStatus("idle");
        setDigest("");
      }
    }
  }, [selectedGrantId, grants]);

  const saveToLocalStorage = (appData: any) => {
    const apps = JSON.parse(localStorage.getItem('my_applications') || '[]');
    const index = apps.findIndex((a: any) => a.grantId === appData.grantId);
    if (index >= 0) {
      apps[index] = { ...apps[index], ...appData, updatedAt: new Date().toISOString() };
    } else {
      apps.push({ ...appData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem('my_applications', JSON.stringify(apps));
  };

  const handleChatSend = async (mode: 'idea' | 'draft') => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', content: chatInput };
    const history = mode === 'idea' ? ideaChat : draftChat;
    const newHistory = [...history, userMsg];
    
    if (mode === 'idea') setIdeaChat(newHistory);
    else setDraftChat(newHistory);
    
    setChatInput("");
    setChatLoading(true);
    
    try {
      const res = await api.chatRefine({
        wallet_address: address || '0x0',
        grant_id: parseInt(selectedGrantId),
        context: mode === 'idea' ? aiIdea : draft,
        messages: newHistory,
        mode: mode
      });
      
      const assistantMsg = { role: 'assistant', content: res.response };
      if (mode === 'idea') setIdeaChat([...newHistory, assistantMsg]);
      else setDraftChat([...newHistory, assistantMsg]);
    } catch (e) {
      console.error(e);
      const errMsg = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
      if (mode === 'idea') setIdeaChat([...newHistory, errMsg]);
      else setDraftChat([...newHistory, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderChat = (mode: 'idea' | 'draft') => {
    const history = mode === 'idea' ? ideaChat : draftChat;
    const isOpen = mode === 'idea' ? isIdeaChatOpen : isDraftChatOpen;
    const setIsOpen = mode === 'idea' ? setIsIdeaChatOpen : setIsDraftChatOpen;

    if (!isOpen) return null;

    return (
      <div className="mini-chat-container animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, color: 'var(--accent)' }}>AI Assistant</h4>
          <button className="btn-secondary" onClick={() => setIsOpen(false)} style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>Close</button>
        </div>
        
        <div className="chat-messages custom-scroll">
          {history.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1rem' }}>
              Ask me to change something, clarify a point, or add more details!
            </div>
          )}
          {history.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <input 
            className="chat-input" 
            placeholder="Type your message..." 
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChatSend(mode)}
            disabled={chatLoading}
          />
          <button className="btn-chat-send" onClick={() => handleChatSend(mode)} disabled={chatLoading || !chatInput.trim()}>
            {chatLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    );
  };

  const selectedGrant = grants.find(g => g.id.toString() === selectedGrantId);

  const handleGenerateIdea = async (useUserIdea: boolean = true) => {
    if (!selectedGrantId) return;
    setLoading(true);
    setStep(2);
    try {
      const res = await api.generateIdea({
        wallet_address: address || '0x0',
        grant_id: parseInt(selectedGrantId),
        user_idea: useUserIdea ? userIdea : undefined
      });
      if (res.detail || !res.generated_idea) throw new Error(res.detail || "API Error");
      setAiIdea(res.generated_idea);
      saveToLocalStorage({
        grantId: selectedGrantId,
        grantTitle: selectedGrant?.title,
        status: "Idea",
        userIdea: useUserIdea ? userIdea : "",
        aiIdea: res.generated_idea
      });
    } catch (e) {
      console.error(e);
      setAiIdea("Failed to generate idea. Ensure AI is online.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    setLoading(true);
    setStep(3);
    try {
      const res = await api.generateDraft({
        wallet_address: address || '0x0',
        grant_id: parseInt(selectedGrantId),
        idea: aiIdea
      });
      if (res.detail || !res.draft_and_checklist) throw new Error(res.detail || "API Error");
      setDraft(res.draft_and_checklist);
      saveToLocalStorage({
        grantId: selectedGrantId,
        status: "Draft",
        draft: res.draft_and_checklist
      });
    } catch (e) {
      console.error(e);
      setDraft("Error generating draft.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const apps = JSON.parse(localStorage.getItem('my_applications') || '[]');
    const filtered = apps.filter((a: any) => a.grantId !== selectedGrantId);
    localStorage.setItem('my_applications', JSON.stringify(filtered));
    setStep(1);
    setUserIdea("");
    setAiIdea("");
    setDraft("");
    setStatus("idle");
    setDigest("");
  };

  const handleSubmit = async () => {
    setStep(4);
    setStatus("signing");
    try {
      if (CONTRACT.MOCK_MODE || !account) {
        await new Promise(r => setTimeout(r, 1500));
        const fakeDigest = "mock_digest_" + Math.random().toString(36).substring(2, 12);
        setDigest(fakeDigest);
        setStatus("success");
        await api.submitFinish(address || '0x0');
        saveToLocalStorage({
          grantId: selectedGrantId,
          status: "Submitted",
          digest: fakeDigest
        });
        return;
      }

      const ideaHash = await hashString(draft);
      const tx = new Transaction();

      tx.moveCall({
        target: `${CONTRACT.PACKAGE_ID}::registry::submit`,
        arguments: [
          tx.object(CONTRACT.REGISTRY_OBJECT_ID),
          tx.pure.u64(parseInt(selectedGrantId)),
          tx.pure.vector('u8', [].slice.call(ideaHash)),
          tx.object('0x6'),
        ]
      });

      const response = await signAndExecute({ transaction: tx as any });
      setDigest(response.digest);
      setStatus("success");
      await api.submitFinish(address || '0x0');
      saveToLocalStorage({
        grantId: selectedGrantId,
        status: "Submitted",
        digest: response.digest
      });
      
    } catch (e: any) {
      console.error("🔥 TRANSACTION FAILED DETAILS 🔥");
      console.error(e);
      if (e.message) console.error("Message:", e.message);
      if (e.data) console.error("Data:", e.data);
      setStatus("error");
    }
  };


  const steps = [
    { num: 1, label: "Select" },
    { num: 2, label: "Brainstorm" },
    { num: 3, label: "Draft" },
    { num: 4, label: "Submit" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: 'calc(100vh - 120px)' }}>
      
      {/* COMPACT TOP BANNER - INFO PANEL */}
      {selectedGrant && (
        <div className="glass-card fade-in" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'rgba(20, 20, 43, 0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 <svg width="60" height="60" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                   <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                   <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent)" strokeWidth="8" strokeDasharray={`${matchScore * 2.51} 251`} style={{ transition: 'stroke-dasharray 1s ease' }} />
                 </svg>
                 <div style={{ position: 'absolute', fontSize: '1rem', fontWeight: 'bold' }}>{matchScore}%</div>
             </div>
             <div>
                <span className="tag-chip" style={{ background: 'rgba(0,206,255,0.1)', color: 'var(--accent)', border: '1px solid rgba(0,206,255,0.3)', padding: '4px 10px', fontSize: '0.75rem' }}>{selectedGrant.ecosystem}</span>
                <h2 style={{ margin: '0.4rem 0', fontSize: '1.4rem' }}>{selectedGrant.title}</h2>
             </div>
          </div>
          
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <div>
               <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Reward Pool</div>
               <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>{selectedGrant.reward}</div>
            </div>
            <div>
               <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Deadline</div>
               <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>{selectedGrant.deadline}</div>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/applications')} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
               📁 History
            </button>
          </div>
        </div>
      )}

      {/* TWO COLUMNS WORKSPACE */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

        {/* LEFT COLUMN - WORKSPACE */}
        <div style={{ flex: '0 0 450px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Horizontal Stepper */}
          <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative' }}>
            {step > 1 && (
              <button 
                className="btn-secondary" 
                onClick={() => setStep(step - 1)} 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', zIndex: 1, whiteSpace: 'nowrap' }}
              >
                ← Back
              </button>
            )}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '2rem', right: '2rem', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '50%', left: '2rem', width: `${((step - 1) / 3) * 100}%`, height: '2px', background: 'var(--accent)', zIndex: 0, transition: '0.4s ease', boxShadow: '0 0 10px var(--accent)' }} />
              
              {steps.map(s => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                return (
                  <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', zIndex: 1, opacity: (isActive || isCompleted) ? 1 : 0.4, transition: '0.3s' }}>
                    <div style={{ 
                      width: '28px', height: '28px', borderRadius: '50%', 
                      background: isCompleted ? 'var(--accent)' : isActive ? 'var(--bg-card)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${isActive || isCompleted ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}`,
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      color: isCompleted ? '#000' : 'white',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      boxShadow: isActive ? '0 0 15px rgba(0,206,255,0.4)' : 'none'
                    }}>
                      {isCompleted ? '✓' : s.num}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? 'white' : 'var(--text-secondary)' }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 1-3: Main Workspace Column */}
          {step <= 3 && (
            <div className="glass-card fade-in" style={{ padding: '2rem', position: 'relative', overflow: 'hidden', minHeight: !address ? '420px' : 'auto' }}>
              
              {!address && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(20, 20, 43, 0.85)', backdropFilter: 'blur(8px)', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center', borderRadius: 'inherit' }}>
                  <div style={{ width: '80px', height: '80px', background: 'rgba(0, 206, 255, 0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', border: '1px solid rgba(0, 206, 255, 0.3)', boxShadow: '0 0 20px rgba(0, 206, 255, 0.2)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <h3 style={{ margin: '0 0 1rem 0', color: 'white', fontSize: '1.8rem' }}>AI Workspace Locked</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', maxWidth: '350px', lineHeight: '1.6' }}>Connect your wallet to unlock personalized AI idea generation and application drafting.</p>
                  <button className="btn-primary" onClick={() => navigate('/connect')} style={{ padding: '0.8rem 2.5rem', fontSize: '1.05rem' }}>Connect Wallet</button>
                </div>
              )}

              {step === 1 ? (
                <>
                  <h2 style={{ margin: '0 0 1rem 0' }}>Choose Opportunity</h2>
                  <select 
                    className="input-field" 
                    value={selectedGrantId} 
                    onChange={e => { setSelectedGrantId(e.target.value); navigate(`/idealab?grantId=${e.target.value}`, {replace:true}); }}
                    style={{ padding: '1rem', fontSize: '1.1rem', appearance: 'menulist' }}
                  >
                    <option value="">-- Select Grant or Hackathon --</option>
                    {grants.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                  {selectedGrantId && (
                     <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%', padding: '1rem' }} onClick={() => setStep(2)}>
                       Proceed to Brainstorm →
                     </button>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>{step === 2 ? 'Brainstorm Context' : 'Drafting Phase'}</h2>
                    {step === 2 && (
                      <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setSelectedGrantId("")}>
                        Change Grant
                      </button>
                    )}
                  </div>
                  
                  {step === 2 ? (
                    <>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Provide context or let AI invent from scratch (Optional)</label>
                      <textarea 
                        className="input-field" 
                        rows={6} 
                        placeholder="I want to build a decentralized exchange for game items..."
                        value={userIdea}
                        onChange={e => setUserIdea(e.target.value)}
                        disabled={loading}
                        style={{ fontSize: '1.05rem', padding: '1rem', resize: 'vertical' }}
                      />
                      
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button 
                          className="btn-secondary" 
                          onClick={() => handleGenerateIdea(false)} 
                          disabled={loading}
                          style={{ flex: 1, padding: '1rem', fontSize: '0.9rem' }}
                        >
                          🎲 Let AI decide
                        </button>
                        <button 
                          className="btn-primary" 
                          onClick={() => handleGenerateIdea(true)} 
                          disabled={loading} 
                          style={{ flex: 2, padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>✨</span> 
                          {userIdea.trim() ? 'Expand Concept' : 'Generate Concept'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1rem' }}>💡</span> Selected Concept
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scroll tiny-scroll">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiIdea}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: step === 2 ? '1.5rem' : '0' }}>
                    
                    {/* Step 2 specific actions */}
                    {aiIdea && step === 2 && (
                      <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <button 
                          className="btn-secondary" 
                          onClick={() => setIsIdeaChatOpen(true)} 
                          style={{ padding: '0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                          💬 Refine Idea with AI
                        </button>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>AI generated concepts on the right. Satisfied?</div>
                        <button className="btn-primary glow-primary" onClick={handleGenerateDraft} disabled={loading} style={{ padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                          Proceed to Draft <span style={{fontSize: '1.2rem'}}>→</span>
                        </button>
                      </div>
                    )}

                    {/* Step 3 specific actions */}
                    {draft && step === 3 && (
                      <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <button 
                          className="btn-secondary" 
                          onClick={() => setIsDraftChatOpen(true)} 
                          style={{ padding: '0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                          💬 Refine Draft with AI
                        </button>
                        <button className="btn-primary" onClick={handleSubmit} disabled={status === "signing"} style={{ width: '100%', padding: '1rem', background: '#00FF00', color: '#000', boxShadow: '0 0 15px rgba(0,255,0,0.4)' }}>
                          Finalize On-Chain 🔗
                        </button>
                      </div>
                    )}
                  </div>
                  {!address && <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>⚠️ Please connect wallet to save permanently.</p>}
                </>
              )}
            </div>
          )}

          {/* STEP 4: Submit Result & Celebratory Modal */}
          {step >= 4 && (
            <div className="glass-card fade-in" style={{ padding: '3rem 2rem', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {status === "signing" && (
                <div className="animate-slide-up">
                  <div className="spinner" style={{ margin: '0 auto 2rem auto', width: '60px', height: '60px', border: '4px solid rgba(0,206,255,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <h2 style={{ color: 'var(--accent)', letterSpacing: '1px' }}>PLEASE APPROVE IN WALLET</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Securing your IP on OneChain...</p>
                </div>
              )}

              {status === "success" && (
                <div className="celebration-overlay">
                  <Confetti active={showConfetti} />
                  <div className="celebration-modal">
                    <div className="success-check-large">✓</div>
                    <h1 style={{ 
                      marginBottom: '1rem', 
                      background: 'var(--gradient-main)', 
                      WebkitBackgroundClip: 'text', 
                      WebkitTextFillColor: 'transparent', 
                      fontSize: '3.5rem', 
                      fontWeight: 900, 
                      letterSpacing: '2px',
                      textShadow: '0 0 30px rgba(0, 206, 255, 0.3)'
                    }}>
                      CONGRATS!
                    </h1>
                    <h2 style={{ fontSize: '1.4rem', margin: '0 0 1.5rem 0', color: 'white' }}>Proof-of-Idea Recorded</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
                      Your intellectual property is now securely timestamped on-chain and protected.
                    </p>
                    
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '12px', marginBottom: '2.5rem', border: '1px dashed rgba(0,206,255,0.3)' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Transaction Digest</div>
                      <div style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: '0.95rem', wordBreak: 'break-all' }}>{digest}</div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button className="btn-primary glow-accent" onClick={() => navigate(`/certificate/${digest}`)} style={{ padding: '1rem 2rem', flex: '1', minWidth: '200px' }}>
                        📜 View My Certificate
                      </button>
                      <button className="btn-secondary" onClick={() => navigate('/applications')} style={{ padding: '1rem 1.5rem' }}>
                        My Apps
                      </button>
                      <button className="btn-secondary" onClick={handleReset} style={{ padding: '1rem 1.5rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                        New Idea 🔄
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="animate-slide-up">
                  <div style={{ width: '80px', height: '80px', background: 'rgba(255,0,0,0.1)', border: '2px solid #FF3333', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1.5rem auto', fontSize: '2.5rem', color: '#FF3333' }}>
                    ×
                  </div>
                  <h2 style={{ color: '#FF3333' }}>Transaction Failed</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Something went wrong while recording on-chain.</p>
                  <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setStatus("idle")}>
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN - RESULTS VIEW */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '400px' }}>
          
          {/* AI Chat Section - Prominent Top Placement */}
          {((step === 2 && isIdeaChatOpen) || (step === 3 && isDraftChatOpen)) && (
            <div className="glass-card animate-slide-up" style={{ padding: '1.5rem 2rem', border: '1px solid rgba(0,206,255,0.4)', background: 'rgba(10, 10, 31, 0.6)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              {step === 2 ? renderChat('idea') : renderChat('draft')}
            </div>
          )}

          {/* Default Placeholder */}
          {step === 1 && !loading && !aiIdea && (
             <div className="glass-card fade-in" style={{ padding: '4rem 3rem', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', opacity: 0.6, minHeight: '420px' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(0, 206, 255, 0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', border: '1px solid rgba(0, 206, 255, 0.3)', boxShadow: '0 0 20px rgba(0, 206, 255, 0.2)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>{address ? 'AI Workspace Ready' : 'AI Workspace Locked'}</h3>
                <p>{address ? 'Provide some context and click Generate Concept to brainstorm an idea.' : 'Connect wallet to brainstorm an idea.'}</p>
             </div>
          )}

          {/* AI Idea Output */}
          {step === 2 && (loading ? (
             <div className="glass-card fade-in" style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,206,255,0.3)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--gradient-main)', animation: 'pulse 1.5s infinite' }} />
                <div className="spinner" style={{ width: '60px', height: '60px', border: '4px solid rgba(0,206,255,0.1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '2rem' }} />
                <h3 className="pulsing-text" style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>AI is analyzing the ecosystem...</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Brainstorming optimal concepts based on your profile.</p>
             </div>
          ) : aiIdea ? (
             <div className="glass-card animate-slide-up" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(0,206,255,0.3)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '4px', background: 'var(--gradient-main)' }} />
                <div className="custom-scroll" style={{ padding: '2rem 3rem', maxHeight: '75vh', overflowY: 'auto' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0 0 1.5rem 0' }}>💡 Generated Concepts</h2>
                  <div className="markdown-body" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiIdea}</ReactMarkdown>
                  </div>
                </div>
             </div>
          ) : null)}

          {/* Draft Output */}
          {step === 3 && (loading ? (
             <div className="glass-card fade-in" style={{ padding: '4rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(108,92,231,0.3)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #6c5ce7, #a29bfe)', animation: 'pulse 1.5s infinite' }} />
                <div className="spinner" style={{ width: '60px', height: '60px', border: '4px solid rgba(108,92,231,0.1)', borderTopColor: '#6c5ce7', borderRadius: '50%', animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite', marginBottom: '2rem' }} />
                <h3 className="pulsing-text" style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#a29bfe' }}>AI is crafting your application...</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Fleshing out milestones, tech stack, and constraints.</p>
             </div>
          ) : draft ? (
             <div className="glass-card animate-slide-up" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(108,92,231,0.3)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '4px', background: 'linear-gradient(180deg, #6c5ce7, #a29bfe)' }} />
                <div className="custom-scroll" style={{ padding: '2rem 3rem', maxHeight: '75vh', overflowY: 'auto' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: '0 0 1.5rem 0' }}>📝 Application Draft</h2>
                  <div className="markdown-body" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft}</ReactMarkdown>
                  </div>
                </div>
             </div>
          ) : null)}

        </div>
      </div>
    </div>
  );
}
