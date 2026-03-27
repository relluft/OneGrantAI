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
    if (!res.ok) {
      console.warn('saveProfile failed with status', res.status);
      // Don't throw — profile save is non-critical on Vercel (stateless)
      return { status: 'skipped' };
    }
    return res.json();
  },
  
  async getProfile(address: string) {
    const res = await fetchWithTimeout(`${API_URL}/profile/${address}`);
    if (!res.ok) throw new Error('Profile not found');
    return res.json();
  },

  async getGrants() {
    const res = await fetchWithTimeout(`${API_URL}/grants`);
    if (!res.ok) throw new Error(`getGrants failed: ${res.status}`);
    return res.json();
  },

  async matchGrants(profile: any) {
    const res = await fetchWithTimeout(`${API_URL}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error(`matchGrants failed: ${res.status}`);
    return res.json();
  },

  async generateIdea(req: { wallet_address: string, grant_id: number, user_idea?: string }) {
    const res = await fetchWithTimeout(`${API_URL}/generate-idea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`generateIdea failed (${res.status}): ${errBody.slice(0, 200)}`);
    }
    return res.json();
  },

  async generateDraft(req: { wallet_address: string, grant_id: number, idea: string }) {
    const res = await fetchWithTimeout(`${API_URL}/generate-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`generateDraft failed (${res.status}): ${errBody.slice(0, 200)}`);
    }
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
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`analyzeMatch failed (${res.status}): ${errBody.slice(0, 200)}`);
    }
    return res.json();
  },

  async chatRefine(req: { wallet_address: string, grant_id: number, context: string, messages: {role: string, content: string}[], mode: string }) {
    const res = await fetchWithTimeout(`${API_URL}/chat-refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`chatRefine failed (${res.status}): ${errBody.slice(0, 200)}`);
    }
    return res.json();
  }
}

