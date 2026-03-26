from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
import os

app = FastAPI(title="Kanban Backend", version="0.1.0")

@app.get("/api/health")
async def health_check():
    """Health check endpoint that returns JSON response."""
    return {
        "status": "healthy",
        "message": "Kanban backend is running",
        "version": "0.1.0"
    }

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with static fallback for non-built UI."""
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path, media_type="text/html")
    return HTMLResponse("<h1>Kanban Project Management (backend only)</h1><p>Hello World</p>", status_code=200)

# Mount static files directory (will serve built frontend)
# This must be mounted after defining API routes so they are prioritized
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")