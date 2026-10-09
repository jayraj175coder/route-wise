import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from starlette.responses import FileResponse
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

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))

@app.get("/")
def root(request: Request):
    accept = request.headers.get("accept", "")
    frontend_index = os.path.join(frontend_dist, "index.html")
    if "text/html" in accept and os.path.exists(frontend_index):
        return FileResponse(frontend_index)
    return {
        "service": "RouteWise — Risk-Aware Personal Mobility Decision Engine",
        "status": "online",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "frontend_url": "http://localhost:5173",
        "message": "Welcome to RouteWise API! Visit /docs for interactive API documentation or open the React frontend at http://localhost:5173."
    }

app.include_router(api_router, prefix="/api")

# Serve frontend static assets & SPA routes if frontend dist exists
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path == "openapi.json":
            return {"error": "Not found"}
        target_file = os.path.join(frontend_dist, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return {"error": "Not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
