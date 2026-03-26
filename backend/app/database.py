from datetime import datetime
from sqlalchemy import Column as SQLColumn, DateTime, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import os

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = SQLColumn(Integer, primary_key=True)
    username = SQLColumn(String(255), unique=True, nullable=False)
    created_at = SQLColumn(DateTime, nullable=False, default=datetime.utcnow)

    boards = relationship("Board", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"


class Board(Base):
    __tablename__ = "boards"

    id = SQLColumn(Integer, primary_key=True)
    user_id = SQLColumn(Integer, ForeignKey("users.id"), nullable=False)
    title = SQLColumn(String(255), nullable=False, default="My Board")
    created_at = SQLColumn(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = SQLColumn(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="boards")
    columns = relationship("Column", back_populates="board", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Board(id={self.id}, user_id={self.user_id}, title={self.title})>"


class Column(Base):
    __tablename__ = "columns"

    id = SQLColumn(String(255), primary_key=True)
    board_id = SQLColumn(Integer, ForeignKey("boards.id"), nullable=False)
    title = SQLColumn(String(255), nullable=False)
    position = SQLColumn(Integer, nullable=False)
    created_at = SQLColumn(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = SQLColumn(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    board = relationship("Board", back_populates="columns")
    cards = relationship("Card", back_populates="column", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Column(id={self.id}, board_id={self.board_id}, title={self.title})>"


class Card(Base):
    __tablename__ = "cards"

    id = SQLColumn(String(255), primary_key=True)
    column_id = SQLColumn(String(255), ForeignKey("columns.id"), nullable=False)
    title = SQLColumn(String(255), nullable=False)
    details = SQLColumn(Text, nullable=False, default="")
    position = SQLColumn(Integer, nullable=False)
    created_at = SQLColumn(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = SQLColumn(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    column = relationship("Column", back_populates="cards")

    def __repr__(self):
        return f"<Card(id={self.id}, title={self.title}, position={self.position})>"


def get_database_url():
    """Get database URL from environment or use default SQLite."""
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return db_url
    # Default to SQLite in app directory
    db_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return f"sqlite:///{db_dir}/kanban.db"


def init_db():
    """Initialize database and create tables if they don't exist."""
    engine = create_engine(get_database_url(), echo=False)
    Base.metadata.create_all(engine)
    return engine


def get_session_factory(engine=None):
    """Get SQLAlchemy session factory."""
    if engine is None:
        engine = init_db()
    return sessionmaker(bind=engine)
