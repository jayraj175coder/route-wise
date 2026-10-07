import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.endpoints import router as api_router
from app.db.database import engine, Base
import app.db.models  # Ensure models are registered

load_dotenv()

# Initialize SQLite tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RouteWise API",
    description="Risk-Aware Personal Mobility Decision Engine",
    version="1.0.0"
)

# CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "RouteWise — Risk-Aware Personal Mobility Decision Engine",
        "status": "online",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "frontend_url": "http://localhost:5173",
        "message": "Welcome to RouteWise API! Visit /docs for interactive API documentation or open the React frontend at http://localhost:5173."
    }

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
