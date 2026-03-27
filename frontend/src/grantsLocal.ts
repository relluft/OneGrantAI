// Client-side grants data — identical to backend/grants_data.py
// This ensures Grant Search always works, even if the Vercel serverless function is down.

export interface Grant {
  id: number;
  title: string;
  source: string;
  tracks: string[];
  required_skills: string[];
  deadline: string;
  reward: string;
  description: string;
  requirements: string;
  grant_type: string;
  ecosystem: string;
  url?: string;
  min_reward_usd: number;
  max_reward_usd: number;
  source_type: string;
}

export const GRANTS: Grant[] = [
  {
    id: 1,
    title: "Ethereum Foundation Academic Grants 2026",
    source: "Ethereum Foundation",
    tracks: ["Research", "Cryptography", "Security", "Economics"],
    required_skills: ["Research", "Math", "Ethereum", "Cryptography"],
    deadline: "Closed (Next Round: Jan 2027)",
    reward: "Up to $500,000 total pool",
    description: "Empowering and expanding Ethereum-related academic research across various disciplines, including Cryptography, Game Theory, and Protocol Design.",
    requirements: "Formal academic research, open-access with a free and permissive license. Must not be a commercial project or stablecoin.",
    grant_type: "Grant",
    ecosystem: "Ethereum",
    url: "https://esp.ethereum.foundation/academic-grants",
    min_reward_usd: 10000,
    max_reward_usd: 100000,
    source_type: "Manual"
  },
  {
    id: 2,
    title: "Aptos Payments Track",
    source: "Aptos Foundation",
    tracks: ["DeFi", "Payments", "Infrastructure"],
    required_skills: ["Move", "Aptos", "Payment Integration"],
    deadline: "Rolling (Priority: Mar-May 2026)",
    reward: "Up to $150,000",
    description: "For teams rethinking how money moves. Build wallets, APIs, compliance layers, and trusted infrastructure for programmable payments on Aptos.",
    requirements: "Must be built on Aptos, open-source by design, live product with early traction.",
    grant_type: "Grant",
    ecosystem: "Aptos",
    url: "https://aptosfoundation.org/grants",
    min_reward_usd: 50000,
    max_reward_usd: 150000,
    source_type: "Manual"
  },
  {
    id: 3,
    title: "Arbitrum Foundation Growth Track",
    source: "Arbitrum Foundation",
    tracks: ["DeFi", "Gaming", "dApps"],
    required_skills: ["Solidity", "Arbitrum", "TypeScript", "React"],
    deadline: "Rolling",
    reward: "$20,000 - $60,000",
    description: "Targets late-stage testnet projects with early traction aiming for mainnet launch. Requires a minimum of two milestones.",
    requirements: "Focus on dApps that can onboard millions of users. Must map out clear milestones.",
    grant_type: "Grant",
    ecosystem: "Arbitrum",
    url: "https://arbitrum.foundation/grants",
    min_reward_usd: 20000,
    max_reward_usd: 60000,
    source_type: "Manual"
  },
  {
    id: 4,
    title: "Sui Developer Grants",
    source: "Sui Foundation",
    tracks: ["DeFi", "Gaming", "Infrastructure"],
    required_skills: ["Move", "Sui", "TypeScript"],
    deadline: "Rolling",
    reward: "$10,000 - $100,000",
    description: "Funding for developers building innovative projects that offer long-term utility and promote the adoption of the Sui blockchain.",
    requirements: "Submit technical specifications, team background, budget, timeline, and sustainability plan.",
    grant_type: "Grant",
    ecosystem: "Sui",
    url: "https://sui.io/grants",
    min_reward_usd: 10000,
    max_reward_usd: 100000,
    source_type: "Manual"
  },
  {
    id: 5,
    title: "ETHDenver 2026 Hackathon",
    source: "SporkDAO",
    tracks: ["Infrastructure", "DeFi", "NFTs", "Public Goods"],
    required_skills: ["Solidity", "React", "Node.js", "Ethereum"],
    deadline: "Final Judging (Feb 21 – Mar 30)",
    reward: "Prize Pool over $1M",
    description: "The largest Web3 #BUIDLathon in the world. Build innovative solutions across multiple tracks.",
    requirements: "Must submit code repository, video demo, and deploy on specified networks.",
    grant_type: "Hackathon",
    ecosystem: "Ethereum",
    url: "https://ethdenver2026.devfolio.co/",
    min_reward_usd: 1000,
    max_reward_usd: 50000,
    source_type: "Manual"
  },
  {
    id: 6,
    title: "Arbitrum x Uniswap Grant Program",
    source: "Uniswap & Arbitrum",
    tracks: ["DeFi", "Liquidity", "AMM"],
    required_skills: ["Solidity", "DeFi Mathematics", "Arbitrum"],
    deadline: "2026-04-15",
    reward: "$50,000 - $250,000 in ARB",
    description: "Initiative providing grants for developers building within the Uniswap-Arbitrum ecosystem, focusing on liquidity, usability, and composability.",
    requirements: "Direct integration with Uniswap v3/v4 on Arbitrum.",
    grant_type: "Grant",
    ecosystem: "Arbitrum",
    url: "https://arbitrum.io/builders",
    min_reward_usd: 50000,
    max_reward_usd: 250000,
    source_type: "Manual"
  },
  {
    id: 7,
    title: "Aptos Grant DAO Round 8",
    source: "DoraHacks",
    tracks: ["Infrastructure", "ZK-Move", "Gaming", "Meme"],
    required_skills: ["Move", "Aptos", "Zero-Knowledge"],
    deadline: "2026-06-27",
    reward: "Varies (Quadratic Funding)",
    description: "Community-driven funding round supporting early-stage projects across multiple categories on Aptos.",
    requirements: "Must create a BUIDL profile on DoraHacks and actively engage with the community.",
    grant_type: "Bounty",
    ecosystem: "Aptos",
    url: "https://dorahacks.io/aptos/8",
    min_reward_usd: 1000,
    max_reward_usd: 20000,
    source_type: "Manual"
  },
  {
    id: 8,
    title: "StableHacks 2026",
    source: "Solana Foundation",
    tracks: ["Stablecoins", "Payments", "DeFi"],
    required_skills: ["Rust", "Solana", "Anchor"],
    deadline: "2026-04-30",
    reward: "$100,000 Prize Pool",
    description: "Global hackathon for experienced developers focusing on building institutional-grade stablecoin infrastructure on Solana.",
    requirements: "Must build heavy usage scenarios for stablecoins (payments, escrow, yielding) on Solana.",
    grant_type: "Hackathon",
    ecosystem: "Solana",
    url: "https://dorahacks.io/hackathon/stablehacks",
    min_reward_usd: 2000,
    max_reward_usd: 25000,
    source_type: "Manual"
  },
  {
    id: 9,
    title: "Filecoin Builder Next Step Grants",
    source: "Filecoin Foundation",
    tracks: ["Decentralized Storage", "Data Tooling", "DePIN"],
    required_skills: ["Rust", "Go", "IPFS", "Filecoin"],
    deadline: "Rolling",
    reward: "$5,000 - $10,000",
    description: "Targeted grants to help projects building on Filecoin take the next critical step toward mainnet launch or significant growth.",
    requirements: "Must actively use Filecoin storage primitives or build essential tooling for the ecosystem.",
    grant_type: "Grant",
    ecosystem: "Filecoin",
    url: "https://filecoin.io/grants",
    min_reward_usd: 5000,
    max_reward_usd: 10000,
    source_type: "Manual"
  },
  {
    id: 10,
    title: "Zircuit Build 2025 Grants",
    source: "Zircuit",
    tracks: ["DeFi", "Staking", "Super Apps"],
    required_skills: ["Solidity", "Zero-Knowledge", "zk-rollups"],
    deadline: "2026-05-01",
    reward: "Pool of $450,000",
    description: "Supporting projects developing Web3 super apps, including DeFi and staking infrastructure on Zircuit's zk-rollup.",
    requirements: "Must deploy on Zircuit testnet/mainnet and leverage specific zk features.",
    grant_type: "Grant",
    ecosystem: "Zircuit",
    url: "https://zircuit.com/grants",
    min_reward_usd: 10000,
    max_reward_usd: 50000,
    source_type: "Manual"
  },
  {
    id: 11,
    title: "OneHack 3.0 — AI & GameFi Edition",
    source: "OneChain",
    tracks: ["AI", "GameFi"],
    required_skills: ["Move", "Python", "AI", "React"],
    deadline: "2026-03-27 (Results: Apr 4)",
    reward: "$16,100",
    description: "Build innovative applications on OneChain utilizing AI and GameFi mechanics.",
    requirements: "Must use OneChain features, open source, clear documentation, working frontend.",
    grant_type: "Hackathon",
    ecosystem: "OneChain",
    url: "https://onechain.network/hackathon",
    min_reward_usd: 5000,
    max_reward_usd: 30000,
    source_type: "Manual"
  },
  {
    id: 12,
    title: "Builders' Hub Grant",
    source: "OneChain",
    tracks: ["infra", "DeFi", "AI"],
    required_skills: ["Move", "Rust", "TypeScript"],
    deadline: "Rolling",
    reward: "$10,000 - $50,000",
    description: "Support for core infrastructure and DeFi primitives on OneChain.",
    requirements: "Milestone based delivery, technical spec required.",
    grant_type: "Grant",
    ecosystem: "OneChain",
    url: "https://onechain.network/grants",
    min_reward_usd: 10000,
    max_reward_usd: 50000,
    source_type: "Manual"
  },
  {
    id: 13,
    title: "Orbit Community Grant",
    source: "OneChain Labs",
    tracks: ["Community", "Events", "Developer Tooling"],
    required_skills: ["Community Management", "Event Planning", "Technical Writing"],
    deadline: "Rolling",
    reward: "$1,000 - $15,000",
    description: "Designed for community building, localized events, and ecosystem integrations. Focus on sustainable growth and dev onboarding.",
    requirements: "Detailed event or tooling proposal, community impact metrics, and OneChain ecosystem alignment.",
    grant_type: "Grant",
    ecosystem: "OneChain",
    url: "https://onechain.network/community",
    min_reward_usd: 1000,
    max_reward_usd: 15000,
    source_type: "Manual"
  }
];

export interface MatchProfile {
  skills: string[];
  interests: string[];
  experience_level: number;
  opportunity_type: string;
  min_reward: number;
  max_reward: number;
  ecosystems: string[];
}

export function matchGrantsLocal(profile: MatchProfile): { grant: Grant; score: number }[] {
  const results: { grant: Grant; score: number }[] = [];

  for (const grant of GRANTS) {
    let score = 0;

    // 1. Ecosystem Match
    if (profile.ecosystems?.includes(grant.ecosystem)) {
      score += 50;
    } else if (grant.ecosystem === "General") {
      score += 20;
    }

    // 2. Tracks / Interests overlap
    if (profile.interests?.includes("Any") || !profile.interests?.length) {
      score += 30;
    } else {
      const tracksLower = grant.tracks.map(t => t.toLowerCase());
      const overlap = profile.interests.filter(i => tracksLower.includes(i.toLowerCase()));
      if (overlap.length) score += 30 + overlap.length * 5;
    }

    // 3. Skills overlap
    if (profile.skills?.includes("Any") || !profile.skills?.length) {
      score += 15;
    } else {
      const skillsLower = profile.skills.map(s => s.toLowerCase());
      const grantSkillsLower = grant.required_skills.map(s => s.toLowerCase());
      const overlap = skillsLower.filter(s => grantSkillsLower.includes(s));
      score += overlap.length * 15;
    }

    // 4. Experience bonus
    if (profile.experience_level >= 2) {
      score += Math.min(profile.experience_level * 10, 30);
    }

    // 5. Reward range filter
    if (profile.min_reward > 0 && grant.max_reward_usd > 0) {
      if (grant.max_reward_usd < profile.min_reward) score -= 20;
    }

    // 6. Opportunity type
    if (profile.opportunity_type && profile.opportunity_type !== "Both" && profile.opportunity_type !== grant.grant_type) {
      score -= 10;
    }

    results.push({ grant, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
