const API_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchWithTimeout(url: string, options: any = {}, timeout = 180000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

export const api = {
  async saveProfile(profile: any) {
    const res = await fetchWithTimeout(`${API_URL}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    return res.json();
  },
  
  async getProfile(address: string) {
    const res = await fetchWithTimeout(`${API_URL}/profile/${address}`);
    if (!res.ok) throw new Error('Profile not found');
    return res.json();
  },

  async getGrants() {
    const res = await fetchWithTimeout(`${API_URL}/grants`);
    return res.json();
  },

  async matchGrants(profile: any) {
    const res = await fetchWithTimeout(`${API_URL}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    return res.json();
  },

  async generateIdea(req: { wallet_address: string, grant_id: number, user_idea?: string }) {
    const res = await fetchWithTimeout(`${API_URL}/generate-idea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    return res.json();
  },

  async generateDraft(req: { wallet_address: string, grant_id: number, idea: string }) {
    const res = await fetchWithTimeout(`${API_URL}/generate-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    return res.json();
  },

  async submitFinish(wallet_address: string) {
    const res = await fetchWithTimeout(`${API_URL}/submit-onchain-finish?wallet_address=${wallet_address}`, {
      method: 'POST'
    });
    return res.json();
  },

  async analyzeMatch(req: { wallet_address: string, grant_id: number }) {
    const res = await fetchWithTimeout(`${API_URL}/analyze-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    return res.json();
  },

  async chatRefine(req: { wallet_address: string, grant_id: number, context: string, messages: {role: string, content: string}[], mode: string }) {
    const res = await fetchWithTimeout(`${API_URL}/chat-refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    return res.json();
  }
}

