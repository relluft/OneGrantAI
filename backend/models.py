from pydantic import BaseModel
from typing import List, Optional

class ProfileBase(BaseModel):
    wallet_address: str
    skills: List[str]
    interests: List[str]
    experience_level: int
    portfolio_link: Optional[str] = None
    opportunity_type: Optional[str] = "Both"
    min_reward: Optional[int] = 0
    max_reward: Optional[int] = 100000
    deadline_window: Optional[str] = "Any time"
    team_size: Optional[str] = "Any"
    ecosystems: Optional[List[str]] = ["OneChain"]

class Grant(BaseModel):
    id: int
    title: str
    source: str
    tracks: List[str]
    required_skills: List[str]
    deadline: str
    reward: str
    description: str
    requirements: str
    grant_type: str = "Grant" # "Grant", "Hackathon", "Bounty", "Incubator"
    ecosystem: str = "General"
    url: Optional[str] = None
    min_reward_usd: int = 0
    max_reward_usd: int = 0
    source_type: str = "Manual" # "Manual", "AI_Agent_Scraped" - room for future AI agent

class IdeaRequest(BaseModel):
    wallet_address: str
    grant_id: int
    user_idea: Optional[str] = None

class DraftRequest(BaseModel):
    wallet_address: str
    grant_id: int
    idea: str

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    wallet_address: str
    grant_id: int
    context: str          # current AI-generated idea or draft text
    messages: List[ChatMessage]  # conversation history
    mode: str             # "idea" or "draft"
