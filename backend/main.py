from fastapi import FastAPI, HTTPException
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from models import ProfileBase, IdeaRequest, DraftRequest, ChatRequest
from grants_data import get_all_grants, get_grant_by_id
from matching import match_grants
from ai_agent import generate_idea, generate_draft_and_checklist, analyze_match_reasons, chat_refine

app = FastAPI(title="OneWeb3Grant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PROFILES = {}
DB_XP = {}

@app.get("/")
def read_root():
    return {"status": "ok", "message": "OneWeb3Grant API is running"}

@app.post("/api/profile")
def save_profile(profile: ProfileBase):
    DB_PROFILES[profile.wallet_address] = profile
    if profile.wallet_address not in DB_XP:
        DB_XP[profile.wallet_address] = 0
    DB_XP[profile.wallet_address] += 50
    return {"status": "success", "xp_earned": 50, "total_xp": DB_XP[profile.wallet_address]}

@app.get("/api/profile/{wallet_address}")
def get_profile(wallet_address: str):
    if wallet_address in DB_PROFILES:
        return {"profile": DB_PROFILES[wallet_address], "xp": DB_XP.get(wallet_address, 0)}
    raise HTTPException(status_code=404, detail="Profile not found")

@app.get("/api/grants")
def list_grants():
    return get_all_grants()

@app.post("/api/match")
def match_builder_grants(profile: ProfileBase):
    matches = match_grants(profile)
    DB_XP[profile.wallet_address] = DB_XP.get(profile.wallet_address, 0) + 20
    return {"matches": matches, "xp_earned": 20}

@app.post("/api/generate-idea")
def api_generate_idea(req: IdeaRequest):
    profile = DB_PROFILES.get(req.wallet_address)
    if not profile:
        profile = ProfileBase(wallet_address=req.wallet_address, skills=["Move", "React"], interests=["DeFi"], experience_level=3)
    grant = get_grant_by_id(req.grant_id)
    
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
        
    idea_text = generate_idea(profile, grant, req.user_idea)
    DB_XP[req.wallet_address] = DB_XP.get(req.wallet_address, 0) + 30
    return {"generated_idea": idea_text, "xp_earned": 30}

@app.post("/api/generate-draft")
def api_generate_draft(req: DraftRequest):
    profile = DB_PROFILES.get(req.wallet_address)
    if not profile:
        profile = ProfileBase(wallet_address=req.wallet_address, skills=["Move", "React"], interests=["DeFi"], experience_level=3)
    grant = get_grant_by_id(req.grant_id)
    
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
        
    draft_content = generate_draft_and_checklist(profile, grant, req.idea)
    DB_XP[req.wallet_address] = DB_XP.get(req.wallet_address, 0) + 50
    return {"draft_and_checklist": draft_content, "xp_earned": 50}

@app.post("/api/submit-onchain-finish")
def on_chain_submitted(wallet_address: str):
    if wallet_address in DB_XP:
        DB_XP[wallet_address] += 100
        return {"status": "success", "xp_earned": 100, "total_xp": DB_XP[wallet_address]}
    return {"status": "failed"}

@app.post("/api/analyze-match")
def api_analyze_match(req: IdeaRequest):
    profile = DB_PROFILES.get(req.wallet_address)
    if not profile:
        profile = ProfileBase(wallet_address=req.wallet_address, skills=["Move", "React"], interests=["DeFi"], experience_level=3)
    grant = get_grant_by_id(req.grant_id)
    
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
        
    analysis = analyze_match_reasons(profile, grant)
    return {"analysis": analysis}

@app.post("/api/chat-refine")
def api_chat_refine(req: ChatRequest):
    profile = DB_PROFILES.get(req.wallet_address)
    if not profile:
        profile = ProfileBase(wallet_address=req.wallet_address, skills=["Move", "React"], interests=["DeFi"], experience_level=3)
    grant = get_grant_by_id(req.grant_id)
    
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
        
    response_text = chat_refine(profile, grant, req.context, req.messages, req.mode)
    return {"response": response_text}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

