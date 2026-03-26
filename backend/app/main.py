from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from sqlalchemy.orm import Session
import os

from app.database import init_db, get_session_factory, User, Board, Column, Card
from app.schemas import LoginRequest, LoginResponse, BoardResponse, BoardUpdate, ColumnResponse, CardResponse

app = FastAPI(title="Kanban Backend", version="0.1.0")

# Lazy database initialization
_engine = None
_SessionLocal = None


def get_engine():
    """Get or initialize database engine."""
    global _engine
    if _engine is None:
        _engine = init_db()
    return _engine


def get_session_factory_instance():
    """Get or initialize session factory."""
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_engine()
        _SessionLocal = get_session_factory(engine)
    return _SessionLocal


def get_db():
    """Dependency to get database session."""
    SessionLocal = get_session_factory_instance()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Hardcoded auth credentials for MVP
VALID_USERNAME = "user"
VALID_PASSWORD = "password"


@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Authenticate user with username and password."""
    if request.username == VALID_USERNAME and request.password == VALID_PASSWORD:
        return LoginResponse(success=True, message="Login successful")
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.get("/api/health")
async def health_check():
    """Health check endpoint that returns JSON response."""
    return {
        "status": "healthy",
        "message": "Kanban backend is running",
        "version": "0.1.0"
    }


@app.get("/api/board", response_model=BoardResponse)
async def get_board(db: Session = Depends(get_db)):
    """Get user's board (for MVP, always user_id=1)."""
    user = db.query(User).filter_by(username=VALID_USERNAME).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    board = db.query(Board).filter_by(user_id=user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    return board


@app.put("/api/board", response_model=BoardResponse)
async def update_board(request: BoardUpdate, db: Session = Depends(get_db)):
    """Update board structure (columns and cards)."""
    user = db.query(User).filter_by(username=VALID_USERNAME).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    board = db.query(Board).filter_by(user_id=user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    # Update columns
    for col_data in request.columns:
        col = db.query(Column).filter_by(id=col_data.id, board_id=board.id).first()
        if col:
            col.title = col_data.title
            col.position = col_data.position

    # Update cards
    for card_id, card_data in request.cards.items():
        card = db.query(Card).filter_by(id=card_id).first()
        if card:
            card.title = card_data.title
            card.details = card_data.details
            card.position = card_data.position
            card.column_id = card_data.id

    db.commit()
    return board


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
