from models import ProfileBase, Grant
from grants_data import get_all_grants
from datetime import datetime

def match_grants(profile: ProfileBase) -> list[dict]:
    grants = get_all_grants()
    results = []
    
    # We will assume current date is roughly around early March 2026 based on DB focus
    # For a real implementation, datetime.now() would be used.
    
    for grant in grants:
        score = 0
        
        # 1. Ecosystem Match (Heavy Weight)
        if profile.ecosystems and grant.ecosystem in profile.ecosystems:
            score += 50
        elif grant.ecosystem == "General":
            score += 20
            
        # 2. Tracks Overlap Map
        if "Any" in profile.interests or not profile.interests:
            score += 30
        else:
            tracks_overlap = set(profile.interests) & set([t.lower() for t in grant.tracks])
            if tracks_overlap:
                score += 30 + (len(tracks_overlap) * 5)
            
        # 3. Skills Overlap
        if "Any" in profile.skills or not profile.skills:
            score += 15
        else:
            skills_overlap = set([s.lower() for s in profile.skills]) & set([s.lower() for s in grant.required_skills])
            score += len(skills_overlap) * 15
        
        # 4. Experience Bonus
        if profile.experience_level >= 2:
            score += min(profile.experience_level * 10, 30)
            
        # 5. Reward Range Filter/Penalty
        if profile.min_reward > 0 and grant.max_reward_usd > 0:
            if grant.max_reward_usd < profile.min_reward:
                score -= 20 # Penalty for being too small
                
        # 6. Opportunity Type
        if profile.opportunity_type != "Both" and profile.opportunity_type != grant.grant_type:
             score -= 10
             
        # Add a slight boost if the source is an AI Agent (simulating future preference)
        if grant.source_type == "AI_Agent_Scraped":
             score += 5
            
        results.append({
            "grant": grant,
            "score": score
        })
        
    results.sort(key=lambda x: x["score"], reverse=True)
    return results
