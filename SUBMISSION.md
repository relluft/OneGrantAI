# OneGrant.AI — Hackathon Submission Documentation

> AI-Powered Grant Discovery & On-Chain Application Platform for OneChain

---

## 1. Project Overview

**OneGrant.AI** is a comprehensive, AI-powered platform that revolutionizes how Web3 builders discover, apply for, and track grants and hackathons — with a primary focus on the OneChain ecosystem.

The platform combines **AI-driven idea generation**, **intelligent grant matching**, and **on-chain Proof-of-Idea recording** to create a seamless end-to-end workflow: from finding the right opportunity to submitting an immutable, verifiable record of intellectual property on the OneChain blockchain.

### Core Value Proposition

| Problem | OneGrant.AI Solution |
|---|---|
| Builders waste hours searching for relevant grants across dozens of platforms | **AI Smart Match** — analyzes skills, interests, and experience to rank opportunities by fit score |
| Writing grant proposals from scratch is time-consuming and intimidating | **AI Idea Lab** — generates winning project ideas and complete application drafts in minutes |
| No verifiable proof of when an idea was conceived | **On-Chain Proof-of-Idea** — SHA-256 hash of the application is recorded immutably on OneChain via Move smart contract |
| No centralized hub specific to OneChain ecosystem grants | **OneChain-First Catalog** — curated database with OneHack 3.0, Builders' Hub, and Orbit Community grants |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)             │
│  Landing → Dashboard → Grant Search → AI Idea Lab   │
│  → Applications → Certificate → Profile → Help      │
│                                                      │
│  Tech: React 18, TypeScript, Vite 5, react-router-dom│
│  Wallet: @mysten/dapp-kit (OneWallet integration)    │
│  UI: Custom CSS (glassmorphism + cyberpunk aesthetic) │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (JSON)
                       ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND (FastAPI + Python)               │
│                                                      │
│  /api/profile     — Save/load builder profiles        │
│  /api/grants      — List all opportunities            │
│  /api/match       — AI-powered skill matching         │
│  /api/generate-idea  — AI idea generation (GPT)       │
│  /api/generate-draft — AI draft writing (GPT)         │
│  /api/chat-refine    — Interactive AI refinement       │
│  /api/analyze-match  — Deep AI compatibility analysis  │
│  /api/submit-onchain-finish — XP reward on submit     │
│                                                      │
│  AI Agent: OpenRouter → GPT-5.4-mini (fallback: 4o)  │
│  RAG: OneChain knowledge base (grants_info.md +       │
│       onechain_overview.md)                           │
└──────────────────────┬──────────────────────────────┘
                       │ Move Call (PTB)
                       ▼
┌─────────────────────────────────────────────────────┐
│           SMART CONTRACT (Move on OneChain)           │
│                                                      │
│  Module: oneweb3grant::registry                       │
│  Package ID: 0xe3eefc47a6d4e643e86f4c17bc430c07...   │
│                                                      │
│  Structs:                                            │
│    Registry (shared) — tracks total_submissions       │
│    Submission (owned) — owner, grant_id, idea_hash,   │
│                         timestamp                     │
│                                                      │
│  Functions:                                          │
│    submit() — creates Submission object, emits event  │
│    get_total_submissions() — read counter             │
│                                                      │
│  Deployed on: OneChain Testnet                        │
│  Verified via: OneScan Explorer                       │
└─────────────────────────────────────────────────────┘
```

---

## 3. Key Features

### 3.1 AI-Powered Grant Matching
- Analyzes builder profile (skills, interests, experience level, ecosystem preferences)
- Scores each grant/hackathon with a percentage-based match
- Supports filtering by ecosystem, deadline, reward range, team format, and opportunity type
- Bookmarking system for saved opportunities

### 3.2 AI Idea Lab (4-Step Wizard)
1. **Select Grant** — choose from the curated database
2. **Generate Idea** — AI creates a unique, technically deep project concept tailored to the grant requirements and builder profile. Includes project title, problem statement, solution, tech stack, roadmap, and competitive advantage
3. **Generate Draft** — AI writes a complete, professional grant application with introduction, technical solution, roadmap with milestones table, success metrics, and a requirements checklist
4. **Submit On-Chain** — SHA-256 hash of the application is recorded on OneChain via a Move smart contract call, creating an immutable Proof-of-Idea

### 3.3 Interactive AI Chat
- Built-in chat panel at every step of the wizard
- Allows real-time refinement of ideas and drafts
- Context-aware: the AI knows the current grant, profile, and generated content
- Supports both "idea" and "draft" refinement modes

### 3.4 On-Chain Proof-of-Idea
- Uses `@mysten/dapp-kit` for OneWallet transaction signing
- Calls `oneweb3grant::registry::submit()` Move function
- Records: owner address, grant_id, SHA-256 idea_hash, timestamp
- Emits `SubmissionCreated` event for indexing
- Verifiable on OneScan Explorer

### 3.5 Certificate of Intellectual Property
- Beautiful certificate page with on-chain verification badge
- Displays full decoded application content
- Direct link to OneScan blockchain explorer
- Watermarked, professional design

### 3.6 Gamification System (XP)
| Action | XP Earned |
|---|---|
| Save Profile | +50 |
| Search/Match Grants | +20 |
| Generate Idea | +30 |
| Generate Draft | +50 |
| Submit On-Chain | +100 |

### 3.7 Dashboard Command Center
- Builder hero with personalized greeting
- Quick stats strip (Level, XP, Applications, Match Rate)
- Active pipeline with progress tracking
- Top grant recommendations
- Activity feed timeline
- OneChain ecosystem insights carousel
- System status indicator (Chain + AI Agent)

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 |
| Routing | react-router-dom v6 |
| Wallet SDK | @mysten/dapp-kit v0.14 |
| Blockchain SDK | @mysten/sui v1.21 |
| UI Icons | lucide-react |
| Markdown | react-markdown + remark-gfm |
| State | React useState + localStorage |
| Styling | Custom CSS (glassmorphism, particles, cursor trail) |
| Backend | FastAPI (Python) |
| AI | OpenRouter API → GPT-5.4-mini + GPT-4o-mini fallback |
| RAG | File-based knowledge base (onechain_overview.md + grants_info.md) |
| Smart Contract | Move language on OneChain |
| Deployment | OneChain Testnet (RPC: rpc-testnet.onelabs.cc) |
| Explorer | OneScan (onescan.cc) |

---

## 5. Smart Contract Details

**Module**: `oneweb3grant::registry`  
**Package ID**: `0xe3eefc47a6d4e643e86f4c17bc430c07bfff2d8ef75320ec3f32560027ff21df`  
**Registry Object**: `0x4f5d520f45e3c05438b80cdbdb50ab2149073e768fe645f8722c331ed94c533d`

### Data Model (Move)

```move
public struct Registry has key {
    id: UID,
    total_submissions: u64,
}

public struct Submission has key, store {
    id: UID,
    owner: address,
    grant_id: u64,
    idea_hash: vector<u8>,
    timestamp: u64,
}
```

### Security Features
- **Object-centric model**: each Submission is an owned object transferred to the sender
- **Clock-based timestamps**: uses `one::clock` for accurate on-chain timing
- **Event emission**: `SubmissionCreated` event for off-chain indexing
- **SHA-256 hashing**: application content is hashed client-side before on-chain storage (privacy-preserving)

---

## 6. Grant Database

The platform currently indexes **13 opportunities** across 8 ecosystems:

| # | Title | Ecosystem | Type | Deadline |
|---|---|---|---|---|
| 1 | Ethereum Foundation Academic Grants | Ethereum | Grant | Closed |
| 2 | Aptos Payments Track | Aptos | Grant | Rolling |
| 3 | Arbitrum Foundation Growth Track | Arbitrum | Grant | Rolling |
| 4 | Sui Developer Grants | Sui | Grant | Rolling |
| 5 | ETHDenver 2026 Hackathon | Ethereum | Hackathon | Judging |
| 6 | Arbitrum x Uniswap Grant | Arbitrum | Grant | Apr 15 |
| 7 | Aptos Grant DAO Round 8 | Aptos | Bounty | Jun 27 |
| 8 | StableHacks 2026 | Solana | Hackathon | Apr 30 |
| 9 | Filecoin Builder Grants | Filecoin | Grant | Rolling |
| 10 | Zircuit Build 2025 | Zircuit | Grant | May 1 |
| **11** | **OneHack 3.0 — AI & GameFi** | **OneChain** | **Hackathon** | **Mar 27** |
| **12** | **Builders' Hub Grant** | **OneChain** | **Grant** | **Rolling** |
| **13** | **Orbit Community Grant** | **OneChain** | **Grant** | **Rolling** |

---

## 7. UI/UX Design

- **Theme**: Cyberpunk/Glassmorphism dark mode
- **Effects**: Animated particle background, cursor neon trail, pulsing glows, smooth transitions
- **Responsive**: Sticky sidebar, fluid grid layouts
- **Typography**: Clean, modern sans-serif
- **Color Palette**: Deep purple (#6C5CE7), Cyan accent (#00CEFF), Pink (#e44daa), Neon green (#00FF00)

---

## 8. How to Run

### Backend
```bash
cd backend
pip install -r requirements.txt   # or: pip install fastapi uvicorn openai python-dotenv
python main.py                     # Starts on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                        # Starts on http://localhost:5173
```

### Smart Contract (already deployed)
```bash
cd contracts/oneweb3grant
one move build
one client publish --gas-budget 100000000
```

---

## 9. Team

| Role | Name |
|---|---|
| Full-Stack Developer & Project Lead | relluft |
| AI Systems & Smart Contract | relluft |
| UI/UX Design | relluft |

Solo builder. Built from scratch in under 2 weeks.

---

## 10. Future Roadmap & Vision

OneGrant.AI is designed not just as a hackathon project, but as a **full-scale builder ecosystem** — a command center for any Web3 developer participating in grants and hackathons across ALL chains, not just OneChain.

### Phase 1: OneChain Deep Integration (Q2 2026)
- **OneID Integration** — As OneLabs ships their decentralized identity system, OneGrant.AI will integrate OneID for builder reputation, verified profiles, and cross-grant identity. Builders will carry their on-chain track record (Proof-of-Ideas, completed grants, XP score) as part of their OneID.
- **Mainnet Deployment** — Migrate the Proof-of-Idea smart contract from Testnet to OneChain Mainnet for production use.
- **NFT Achievement Badges** — Mint Move-based NFTs for milestones: "First Submission", "10 Grants Applied", "Hackathon Winner". These become part of the builder's on-chain identity.

### Phase 2: Advanced Gamification & Social (Q3 2026)
- **Leaderboard System** — Public builder leaderboards ranked by XP, submissions, and win rate. On-chain verification ensures no gaming the system.
- **Team Matching** — AI-powered team formation: match solo builders with complementary skills for hackathons. "You're a Move developer looking for a frontend partner? Here's a match."
- **Builder Reputation Score** — Composable, on-chain reputation built from: grants applied, grants won, peer reviews, code quality scores, and community contributions.

### Phase 3: Cross-Chain Expansion (Q4 2026)
- **Multi-Chain Support** — Extend Proof-of-Idea to Sui Mainnet, Aptos Mainnet, and EVM chains (via Solidity port). Same platform, any blockchain.
- **Live Grant Scraping** — Real-time aggregation from DoraHacks, Gitcoin, Questbook, Superteam, and ecosystem-specific grant portals. Always up-to-date, no manual curation needed.
- **Grant Application Status Tracking** — Two-way integration: submit through OneGrant.AI and track the status of your application directly in the dashboard.

### Phase 4: Full Ecosystem (2027+)
- **DAO-Governed Grant Reviews** — Community-driven review of grant proposals with token-weighted voting.
- **AI Grant Mentor** — Long-term AI assistant that learns from your past applications, writing style, and success patterns to continuously improve your proposals.
- **Enterprise API** — Allow grant programs and hackathon organizers to integrate OneGrant.AI as their official submission and matching platform.

---

*Built with ❤️ for OneChain by a solo degen builder.*
