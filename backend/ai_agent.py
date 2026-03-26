import os
import time
import openai
from dotenv import load_dotenv

load_dotenv()

# OpenRouter Configuration
api_key = os.getenv("OPENAI_API_KEY")
base_url = "https://openrouter.ai/api/v1"

# Initialize the client (redirects to OpenRouter if using their key)
client = openai.OpenAI(
    base_url=base_url if api_key and api_key.startswith("sk-or-v1") else None,
    api_key=api_key,
    timeout=180.0,
    default_headers={
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "OneWeb3Grant",
    }
)

PRIMARY_MODEL = "openai/gpt-5.4-mini"
FALLBACK_MODEL = "openai/gpt-4o-mini"

def call_llm(messages, temperature=0.7, max_tokens=600, retries=2):
    """Call LLM with retry logic and automatic fallback to another model."""
    models_to_try = [PRIMARY_MODEL, FALLBACK_MODEL]
    last_error = Exception("All models failed")
    
    for model in models_to_try:
        for attempt in range(retries):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                return response.choices[0].message.content
            except Exception as e:
                last_error = e
                print(f"[AI] Attempt {attempt+1} with {model} failed: {e}")
                if attempt < retries - 1:
                    time.sleep(2 * (attempt + 1))  # exponential backoff
        print(f"[AI] All retries exhausted for {model}, trying fallback...")
    
    raise last_error


def load_knowledge_base():
    kb_path = os.path.dirname(__file__) + "/rag_knowledge/"
    overview = "OneChain is a fast Web3 network using Move programming language with a focus on developer experience, PTBs, and Sponsored Transactions."
    grants = "Various grants are available including OneHack 3.0, Builders' Hub, and Orbit Community."
    
    try:
        with open(os.path.join(kb_path, "onechain_overview.md"), "r", encoding="utf-8") as f:
            overview = f.read()
        with open(os.path.join(kb_path, "grants_info.md"), "r", encoding="utf-8") as f:
            grants = f.read()
    except FileNotFoundError:
        pass

    return f"{overview}\n\n{grants}"

def generate_idea(profile, grant, user_idea=None):
    if not api_key:
        # MOCK AI RESPONSE for testing
        return f"""## 🎯 Project Title: NextGen {grant.ecosystem} Solution (Mock)
(A catchy project name for {grant.title})

## 📋 The Problem
The {grant.ecosystem} ecosystem lacks convenient developer tools for {grant.required_skills[0]}. This slows down dApp development.

## 💡 The Solution
We are building a fast and secure protocol that automates {grant.tracks[0]}. This will reduce development time by 40%.

## 🛠 Technical Stack
- **Smart Contracts**: Move/Solidity (depending on ecosystem)
- **Backend**: FastAPI + Python
- **Frontend**: React + Vite

## 🗓 Roadmap (4 Weeks)
- **Week 1**: Smart contract architecture and design.
- **Week 2**: Backend logic and data storage.
- **Week 3**: Frontend and wallet integration.
- **Week 4**: Testnet testing and submission.

## 🏆 Why This Will Win
Unique usage of {grant.required_skills[-1]} and a strong UX focus will make this project a jury favorite.

*This is a mock response (MOCK) because no OpenAI API key was found.*"""
        
    kb = load_knowledge_base()
    
    sys_prompt = f"""You are a leading Web3 hackathon strategist and grant expert with experience evaluating 500+ applications.
Your task is to generate UNIQUE and TECHNICALLY FEASIBLE project ideas that win grants and hackathons.

## YOUR PRINCIPLES:
1. **Originality**: Never suggest generic ideas like "yet another DEX" or "NFT marketplace". Judges have seen thousands. Combine unexpected domains: AI + DeFi, Gaming + Identity, Social + Storage.
2. **Ecosystem Specificity**: Always use unique features of the target blockchain. For Move chains — mention the object model, PTBs (Programmable Transaction Blocks), Sponsored Transactions. For Solana — parallel execution, local fee markets. For Arbitrum — Stylus, Orbit chains.
3. **Technical Depth**: Specify concrete languages (Move, Solidity, Rust), frameworks (React, Next.js, FastAPI), tools (Hardhat, Foundry, Movement CLI). Don't write "we will build a dApp" — write "we will deploy a Move module with pattern matching for on-chain verification".
4. **Realism**: The MVP must be achievable in 2-6 weeks by a team of 1-4 people.
5. **Metrics Focus**: Propose specific success metrics (DAU, TVL, transaction count).

## KNOWLEDGE BASE:
{kb}

## LANGUAGE OF RESPONSE:
Always respond in English. Use professional, clear, and persuasive language.
"""
    
    skills_str = ', '.join(profile.skills) if profile.skills else 'Not specified'
    interests_str = ', '.join(profile.interests) if profile.interests else 'Not specified'
    tracks_str = ', '.join(grant.tracks) if grant.tracks else 'General'

    prompt = f"""Generate a winning project idea for the following grant/hackathon.

### DEVELOPER PROFILE:
- **Skills**: {skills_str}
- **Interests**: {interests_str}

### TARGET GRANT:
- **Title**: {grant.title}
- **Ecosystem**: {grant.ecosystem}
- **Description**: {grant.description}
- **Requirements**: {grant.requirements}
- **Tracks**: {tracks_str}
"""
    if user_idea:
        prompt += f"""
### USER'S INITIAL IDEA:
{user_idea}

Expand and strengthen this idea. Make it technically deeper, add a unique competitive advantage and concrete architecture. Preserve the user's core concept.
"""
    else:
        prompt += """
The user wants the AI to generate an idea from scratch. Create something original and powerful.
"""
        
    prompt += """
### RESPONSE FORMAT (Strictly in Markdown):

## 🎯 Project Title
(catchy, memorable title in English, 2-4 words)

## 📋 The Problem
(what specific problem in the ecosystem this solves, 2-3 sentences with data or facts)

## 💡 The Solution
(exactly how the project solves the problem, unique value proposition, 3-4 sentences)

## 🛠 Technical Stack
- **Smart Contracts**: (specific language and patterns)
- **Backend**: (framework, database, API)
- **Frontend**: (framework, libraries)
- **Infrastructure**: (deployment, monitoring)

## 🗓 Roadmap (4 Weeks)
- **Week 1**: (specific tasks with deliverables)
- **Week 2**: (specific tasks with deliverables)
- **Week 3**: (specific tasks with deliverables)
- **Week 4**: (specific tasks with deliverables)

## 🏆 Why it will win
(2-3 sentences: unique competitive advantage and why the jury will choose this project)
"""

    try:
        return call_llm(
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=610
        )
    except Exception as e:
        return f"AI Generation Error: {str(e)}"

def generate_draft_and_checklist(profile, grant, idea):
    if not api_key:
        # MOCK AI RESPONSE for testing
        return f"""## 📝 Grant Application Draft (Mock)
**Project**: {grant.title}
**Description**: This is a professional draft application. We plan to implement an innovative solution for the {grant.tracks[0]} track, leveraging our expertise in {profile.skills}. The project fully aligns with {grant.ecosystem} criteria.

**Implementation Phases**:
1. Core protocol development (Week 0-1).
2. Interface and SDK creation (Week 1-3).
3. Audit and launch (Week 3-4).

## ✅ Requirements Checklist
- [x] Using {grant.ecosystem} (Status: Met)
- [x] Open source (Status: Met)
- [x] Technical documentation (Status: Missing — will be added in Week 3)

*This is a mock response (MOCK) because no OpenAI API key was found.*"""

    kb = load_knowledge_base()
    tracks_str = ', '.join(grant.tracks) if grant.tracks else 'General'
    skills_str = ', '.join(profile.skills) if profile.skills else 'Not specified'

    sys_prompt = f"""You are a professional grant writer and technical writer in Web3 with experience successfully securing 50+ grants.
Your task is to transform raw ideas into PERSUASIVE, STRUCTURED grant applications that pass selection.

## YOUR PRINCIPLES:
1. **Professional Tone**: Write confidently, like an experienced team, not students. Use phrases: "We implement...", "Our architecture ensures...", "The project solves a critical problem...".
2. **Application Structure**: Every application must contain: Introduction, Problem Description, Technical Solution, Architecture, Roadmap with specific milestones, and Success Metrics.
3. **Requirements Compliance**: Before writing, analyze ALL grant requirements. Each requirement must be EXPLICITLY covered in the application text.
4. **Checklist**: For each grant requirement, specify status: ✅ Met (briefly how), ⚠️ Partial (what needs work), ❌ Not covered (action plan).
5. **Specifics Over Fluff**: Specify concrete technologies, timelines in days, metrics in numbers.

## KNOWLEDGE BASE:
{kb}

## LANGUAGE:
Write exclusively in English.
"""
    
    prompt = f"""Write a complete professional grant application and a requirements compliance checklist.

### GRANT DATA:
- **Title**: {grant.title}
- **Ecosystem**: {grant.ecosystem}
- **Requirements**: {grant.requirements}
- **Tracks**: {tracks_str}

### TEAM PROFILE:
- **Skills**: {skills_str}

### PROJECT IDEA (basis for the application):
{idea}

### RESPONSE FORMAT (Strictly in Markdown):

## 📝 Grant Application

### Introduction
(1-2 paragraphs: who we are, what we are building, and why it matters for the {grant.ecosystem} ecosystem)

### The Problem
(2-3 paragraphs: detailed problem description with specific data and examples)

### Technical Solution
(3-4 paragraphs: system architecture, technologies used, how it works under the hood)

### Roadmap and Milestones
| Week | Task | Deliverable |
|------|------|-------------|
| 1 | ... | ... |
| 2 | ... | ... |
| 3 | ... | ... |
| 4 | ... | ... |

### Success Metrics
(specific KPIs: DAU, transaction count, TVL, number of integrations)

### Team
(brief description of team competencies based on the profile)

---

## ✅ Grant Requirements Checklist
(for EVERY requirement from the grant description, specify):
- ✅ / ⚠️ / ❌ Requirement — status and brief explanation
"""
    try:
        return call_llm(
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=1500
        )
    except Exception as e:
        return f"AI Generation Error: {str(e)}"

def analyze_match_reasons(profile, grant):
    if not api_key:
        # MOCK AI RESPONSE for testing
        skills_str = ", ".join(profile.skills[:2]) if profile.skills else "your skills"
        interest_str = profile.interests[0] if profile.interests else "Web3"
        return f"This grant ({grant.title}) is a great fit for you because your profile lists {skills_str}, which are key skills for the {grant.tracks[0] if grant.tracks else 'project'} track. Additionally, your interest in {interest_str} aligns perfectly with this project's mission."

    skills_str = ', '.join(profile.skills) if profile.skills else 'Not specified'
    interests_str = ', '.join(profile.interests) if profile.interests else 'Not specified'
    tracks_str = ', '.join(grant.tracks) if grant.tracks else 'General'

    kb = load_knowledge_base()
    
    sys_prompt = f"""You are a Senior Web3 Grant Assessor. Your goal is to provide a highly professional, structured evaluation of why a builder's profile fits a grant, and provide actionable project ideas.

## KNOWLEDGE BASE
{kb}

## OUTPUT RULES:
1. DO NOT use markdown bolding (asterisks). Use ALL CAPS for section headers.
2. Structure the response STRICTLY into 3 sections separated by empty lines (newlines):
   ECOSYSTEM ALIGNMENT
   (Explain the target blockchain architecture based on the Knowledge Base, e.g. "OneChain is a Move-based L1..." and briefly state why the grant matters.)

   PROFILE STRENGTH
   (Professionally explain why their specific skills/interests make them a strong candidate. Explain the architectural value they bring, e.g., "Python allows rapid deployment of AI-agents while Move ensures safe settlement".)

   PROJECT CONCEPTS
   (Provide 5 quick, high-level ideas they could build, formatted as "Idea 1: [desc]")

3. The total length must be concise, around 150-200 words. No fluff.
4. Output exclusively in English.
"""

    prompt = f"""Evaluate this profile against the grant and provide structured insight.

### PROFILE:
- Skills: {skills_str}
- Interests: {interests_str}

### GRANT:
- Title: {grant.title}
- Ecosystem: {grant.ecosystem}
- Description: {grant.description}
- Tracks: {tracks_str}
"""
    try:
        return call_llm(
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=610
        )
    except Exception as e:
        return f"AI Analysis Error: {str(e)}"

def chat_refine(profile, grant, context, messages, mode):
    """
    Handles follow-up chat to refine an idea or a draft.
    context: the current version of the idea/draft.
    messages: history of the conversation (last user message is at the end).
    mode: "idea" or "draft".
    """
    if not api_key:
        return f"This is a (MOCK) AI response to your request: '{messages[-1].content}'. I'm ready to help you refine the {mode}."

    kb = load_knowledge_base()
    
    # System prompt based on mode
    if mode == "idea":
        task_desc = "refining and brainstorming a winning hackathon idea"
        context_label = "CURRENT IDEA"
    else:
        task_desc = "perfecting a professional grant application draft"
        context_label = "CURRENT DRAFT"

    sys_prompt = f"""You are a world-class Web3 strategist and technical writer.
You are currently helping a user {task_desc} for the '{grant.title}' grant ({grant.ecosystem}).

## KNOWLEDGE BASE:
{kb}

## {context_label} YOU GENERATED EARLIER:
{context}

## YOUR GOAL:
1. Answer the user's questions about the current content.
2. Provide short, concise, and actionable refinements.
3. If the user asks for changes, explain HOW you would change it or provide the improved snippet.
4. Keep the tone professional, encouraging, and expert.
5. If the user wants to 'Apply' or 'Replace', summarize the changes clearly.
6. Always respond in English.
"""

    # Convert Pydantic messages to OpenAI format
    chat_history = [{"role": m.role, "content": m.content} for m in messages]
    
    try:
        return call_llm(
            messages=[
                {"role": "system", "content": sys_prompt},
                *chat_history
            ],
            temperature=0.7,
            max_tokens=800
        )
    except Exception as e:
        return f"AI Chat Error: {str(e)}"

