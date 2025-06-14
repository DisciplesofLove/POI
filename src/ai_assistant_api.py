"""
API endpoints for the AI Assistant service
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
import logging
from .ai_assistant import AIAssistant
from .model_fusion import ModelFusion
from .model_marketplace import ModelMarketplace

# Initialize router
router = APIRouter(prefix="/ai-assistant", tags=["ai-assistant"])

# Models for request/response
class UserPreferenceRequest(BaseModel):
    user_id: str
    preferences: Dict[str, Any]

class ModelRecommendationRequest(BaseModel):
    user_id: Optional[str] = None
    task_description: Optional[str] = None
    model_type: Optional[str] = None
    budget_limit: Optional[float] = None
    performance_priority: Optional[str] = None

class FusionSuggestionRequest(BaseModel):
    selected_model_ids: Optional[List[str]] = None
    task_description: Optional[str] = None

class ConnectionConfigRequest(BaseModel):
    model_ids: List[str]

class UserInteractionRequest(BaseModel):
    user_id: str
    action: str
    data: Dict[str, Any]

# Dependency to get AI Assistant instance
def get_ai_assistant():
    # In production, this would be properly initialized with actual instances
    # For now, we'll create a new instance each time
    assistant = AIAssistant()
    
    # Initialize with mock instances for testing
    # In production, these would be properly configured
    try:
        # These would be properly initialized in production
        private_key = "0x0000000000000000000000000000000000000000000000000000000000000000"
        fusion_contract_address = "0x0000000000000000000000000000000000000000"
        marketplace_address = "0x0000000000000000000000000000000000000000"
        web3_provider = "http://localhost:8545"
        
        model_fusion = ModelFusion(
            private_key=private_key,
            fusion_contract_address=fusion_contract_address,
            marketplace_address=marketplace_address,
            web3_provider=web3_provider
        )
        
        marketplace = ModelMarketplace(
            private_key=private_key,
            marketplace_address=marketplace_address,
            web3_provider=web3_provider
        )
        
        assistant.set_model_fusion(model_fusion)
        assistant.set_marketplace(marketplace)
    except Exception as e:
        logging.warning(f"Could not initialize model fusion or marketplace: {e}")
        
    return assistant

# API Endpoints
@router.post("/preferences")
async def store_preferences(
    request: UserPreferenceRequest,
    assistant: AIAssistant = Depends(get_ai_assistant)
):
    """Store user preferences for better recommendations."""
    try:
        assistant.store_user_preference(request.user_id, request.preferences)
        return {"success": True, "message": "User preferences stored successfully"}
    except Exception as e:
        logging.error(f"Error storing user preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend-models")
async def recommend_models(
    request: ModelRecommendationRequest,
    assistant: AIAssistant = Depends(get_ai_assistant)
):
    """Get AI model recommendations based on user preferences and task."""
    try:
        recommendations = assistant.recommend_models(
            user_id=request.user_id,
            task_description=request.task_description,
            model_type=request.model_type,
            budget_limit=request.budget_limit,
            performance_priority=request.performance_priority
        )
        return {"success": True, "recommendations": recommendations}
    except Exception as e:
        logging.error(f"Error recommending models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-fusion")
async def suggest_fusion(
    request: FusionSuggestionRequest,
    assistant: AIAssistant = Depends(get_ai_assistant)
):
    """Suggest optimal model combinations for fusion."""
    try:
        suggestions = assistant.suggest_fusion_combinations(
            selected_model_ids=request.selected_model_ids,
            task_description=request.task_description
        )
        return {"success": True, "suggestions": suggestions}
    except Exception as e:
        logging.error(f"Error suggesting fusion combinations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-connection-config")
async def suggest_connection_config(
    request: ConnectionConfigRequest,
    assistant: AIAssistant = Depends(get_ai_assistant)
):
    """Suggest optimal connection configuration for selected models."""
    try:
        config = assistant.suggest_connection_config(request.model_ids)
        return config
    except Exception as e:
        logging.error(f"Error suggesting connection config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain-benefits")
async def explain_fusion_benefits(
    request: ConnectionConfigRequest,
    assistant: AIAssistant = Depends(get_ai_assistant)
):
    """Explain the benefits of fusing the selected models."""
    try:
        benefits = assistant.explain_fusion_benefits(request.model_ids)
        return benefits
    except Exception as e:
        logging.error(f"Error explaining fusion benefits: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-name")
async def generate_fusion_name(
    request: ConnectionConfigRequest,
    assistant: AIAssistant = Depends(get_ai_assistant)
):
    """Generate a creative name for the fused model."""
    try:
        name = assistant.generate_fusion_name(request.model_ids)
        return {"success": True, "name": name}
    except Exception as e:
        logging.error(f"Error generating fusion name: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/log-interaction")
async def log_user_interaction(
    request: UserInteractionRequest,
    assistant: AIAssistant = Depends(get_ai_assistant)
):
    """Log user interaction for improving recommendations."""
    try:
        assistant.log_user_interaction(
            user_id=request.user_id,
            action=request.action,
            data=request.data
        )
        return {"success": True, "message": "Interaction logged successfully"}
    except Exception as e:
        logging.error(f"Error logging user interaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/insights")
async def get_admin_insights(
    assistant: AIAssistant = Depends(get_ai_assistant)
):
    """Get insights for admin users about fusion trends and usage."""
    try:
        insights = assistant.get_admin_insights()
        return {"success": True, "insights": insights}
    except Exception as e:
        logging.error(f"Error getting admin insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))