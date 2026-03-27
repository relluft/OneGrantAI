/**
 * Client-side AI service that calls OpenRouter directly from the browser.
 * This is the fallback when the Vercel backend API fails.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_KEY = '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';
const MODEL = 'openai/gpt-5.4-mini';

async function callLLM(messages: {role: string, content: string}[], maxTokens = 600, temperature = 0.7): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'OneWeb3Grant',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenRouter error (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response from AI';
}

export async function clientGenerateIdea(grant: any, userIdea?: string): Promise<string> {
  const sysPrompt = `You are a leading Web3 hackathon strategist. Generate UNIQUE, TECHNICALLY FEASIBLE project ideas that win grants.
Principles: Originality, Ecosystem Specificity, Technical Depth, Realism (MVP in 2-6 weeks), Metrics Focus.
Always respond in English with professional, clear language.`;

  let prompt = `Generate a winning project idea for this grant/hackathon.

### TARGET GRANT:
- **Title**: ${grant.title}
- **Ecosystem**: ${grant.ecosystem || 'General'}
- **Description**: ${grant.description || ''}
- **Tracks**: ${(grant.tracks || []).join(', ') || 'General'}
- **Required Skills**: ${(grant.required_skills || []).join(', ')}
`;

  if (userIdea) {
    prompt += `\n### USER'S INITIAL IDEA:\n${userIdea}\n\nExpand and strengthen this idea. Make it technically deeper with a unique competitive advantage.\n`;
  } else {
    prompt += `\nGenerate an original and powerful idea from scratch.\n`;
  }

  prompt += `
### RESPONSE FORMAT (Markdown):
## 🎯 Project Title
## 📋 The Problem
## 💡 The Solution
## 🛠 Technical Stack
## 🗓 Roadmap (4 Weeks)
## 🏆 Why it will win`;

  return callLLM([
    { role: 'system', content: sysPrompt },
    { role: 'user', content: prompt },
  ], 610, 0.7);
}

export async function clientGenerateDraft(grant: any, idea: string): Promise<string> {
  const sysPrompt = `You are a professional grant writer in Web3 with experience securing 50+ grants.
Transform raw ideas into PERSUASIVE, STRUCTURED grant applications.
Principles: Professional Tone, Structured Application, Requirements Compliance, Specifics Over Fluff.
Write exclusively in English.`;

  const prompt = `Write a complete professional grant application and requirements checklist.

### GRANT:
- **Title**: ${grant.title}
- **Ecosystem**: ${grant.ecosystem || 'General'}
- **Requirements**: ${grant.requirements || 'Not specified'}
- **Tracks**: ${(grant.tracks || []).join(', ') || 'General'}

### PROJECT IDEA:
${idea}

### FORMAT (Markdown):
## 📝 Grant Application
### Introduction
### The Problem
### Technical Solution
### Roadmap and Milestones
| Week | Task | Deliverable |
|------|------|-------------|
### Success Metrics
### Team

---
## ✅ Grant Requirements Checklist`;

  return callLLM([
    { role: 'system', content: sysPrompt },
    { role: 'user', content: prompt },
  ], 1500, 0.4);
}

export async function clientAnalyzeMatch(grant: any): Promise<string> {
  const skills = JSON.parse(localStorage.getItem('pref_skills_arr') || '["Any"]');
  const interests = JSON.parse(localStorage.getItem('pref_interests_arr') || '["Any"]');

  const sysPrompt = `You are a Senior Web3 Grant Assessor. Provide a professional, structured evaluation of why a builder's profile fits a grant.
Structure: ECOSYSTEM ALIGNMENT, PROFILE STRENGTH, PROJECT CONCEPTS (5 ideas).
Be concise (~150-200 words). Output in English. Do NOT use markdown bolding.`;

  const prompt = `Evaluate this profile against the grant.

### PROFILE:
- Skills: ${skills.join(', ')}
- Interests: ${interests.join(', ')}

### GRANT:
- Title: ${grant.title}
- Ecosystem: ${grant.ecosystem || 'General'}
- Description: ${grant.description || ''}
- Tracks: ${(grant.tracks || []).join(', ') || 'General'}`;

  return callLLM([
    { role: 'system', content: sysPrompt },
    { role: 'user', content: prompt },
  ], 610, 0.6);
}

export async function clientChatRefine(
  grant: any,
  context: string,
  messages: {role: string, content: string}[],
  mode: string
): Promise<string> {
  const taskDesc = mode === 'idea' ? 'refining a hackathon idea' : 'perfecting a grant application draft';
  const contextLabel = mode === 'idea' ? 'CURRENT IDEA' : 'CURRENT DRAFT';

  const sysPrompt = `You are a world-class Web3 strategist helping a user ${taskDesc} for '${grant.title}' (${grant.ecosystem || 'General'}).

## ${contextLabel}:
${context}

Answer questions, provide concise refinements, and explain changes clearly. Always respond in English.`;

  return callLLM([
    { role: 'system', content: sysPrompt },
    ...messages,
  ], 800, 0.7);
}
