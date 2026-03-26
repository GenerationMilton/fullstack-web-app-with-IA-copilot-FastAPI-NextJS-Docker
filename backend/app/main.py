from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os

app = FastAPI(title="Kanban Backend", version="0.1.0")

# Mount static files directory (will be used for serving built frontend)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main HTML page with Hello World content."""
    return """
    <!DOCTYPE html>
    <html>
        <head>
            <title>Kanban Project Management</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    text-align: center;
                }
                h1 {
                    color: #032147;
                    margin-bottom: 20px;
                }
                .status {
                    color: #888888;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Kanban Project Management</h1>
                <p>Hello World! The backend is running successfully.</p>
                <p class="status">This is a placeholder page. The full Kanban board will be served here once the frontend is integrated.</p>
            </div>
        </body>
    </html>
    """

@app.get("/api/health")
async def health_check():
    """Health check endpoint that returns JSON response."""
    return {
        "status": "healthy",
        "message": "Kanban backend is running",
        "version": "0.1.0"
    }