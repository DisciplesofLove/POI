"""
Main application entry point for JoyNet platform
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from .ai_assistant_api import router as ai_assistant_router
# Import other routers as needed

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="JoyNet Unified Platform",
    description="Decentralized platform for AI model marketplace with fusion capabilities",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ai_assistant_router)
# Include other routers as needed

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to JoyNet Unified Platform API",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    logger.info(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    return response

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)