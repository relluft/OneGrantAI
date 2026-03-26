# OneChain Ecosystem Architecture Overview
When designing a hackathon project or grant proposal for OneChain, always build an architecture that leverages the unique strengths of the OneLabs Layer-1 blockchain:

- **Move Language Paradigm**: Emphasize the extreme safety, predictable transaction costs, and object-centric model of OneChain Move. Mention the use of resources, modules, and abilities (`key`, `store`, `drop`) for managing transparent digital assets on chain.
- **OneWallet & OneID Integration**: Proposals must incorporate OneWallet for user authentication (web3 login), onboarding, and transaction signing. OneID should be used for decentralized user profiles and on-chain identity representation.
- **High-Performance Layer-1**: OneChain is built for scalability and enterprise-grade dApps, offering dedicated RPC endpoints (e.g. `rpc-testnet.onelabs.cc`). High throughput and sub-second latency should be core selling points.
- **Programmable Transaction Blocks (PTBs)**: Highlight the ability to chain operations using PTBs, allowing developers to construct complex smart-contract interactions efficiently (e.g., gas smashing, passing transaction results directly as arguments to next calls).
- **On-chain Reputation & Proofs**: DApps should leverage Move smart contracts to store verifiable on-chain data permanently (e.g., Proof-of-Idea, Proof-of-Participation, GameFi XP, Leaderboards, NFT-badges).
