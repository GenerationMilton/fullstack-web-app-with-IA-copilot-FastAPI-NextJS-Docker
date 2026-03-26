import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, User, Board, Column, Card


@pytest.fixture
def engine():
    """Create in-memory SQLite database for tests."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)


@pytest.fixture
def session(engine):
    """Get database session for tests."""
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_create_user(session):
    """Test creating a user."""
    user = User(username="testuser")
    session.add(user)
    session.commit()

    fetched = session.query(User).filter_by(username="testuser").first()
    assert fetched is not None
    assert fetched.username == "testuser"


def test_user_boards_relationship(session):
    """Test user-board relationship."""
    user = User(username="user1")
    board = Board(user=user, title="My Board")

    session.add(user)
    session.commit()

    assert user.boards[0].title == "My Board"


def test_board_columns_relationship(session):
    """Test board-columns relationship."""
    user = User(username="user1")
    board = Board(user=user, title="Board 1")
    col = Column(board=board, id="col-1", title="TODO", position=0)

    session.add(user)
    session.commit()

    assert board.columns[0].title == "TODO"


def test_column_cards_relationship(session):
    """Test column-cards relationship."""
    user = User(username="user1")
    board = Board(user=user, title="Board 1")
    col = Column(board=board, id="col-1", title="TODO", position=0)
    card = Card(column=col, id="card-1", title="Task 1", details="Do this", position=0)

    session.add(user)
    session.commit()

    assert col.cards[0].title == "Task 1"
    assert col.cards[0].details == "Do this"


def test_cascade_delete_board(session):
    """Test that deleting user deletes associated boards."""
    user = User(username="user1")
    board = Board(user=user, title="Board 1")

    session.add(user)
    session.commit()

    session.delete(user)
    session.commit()

    assert session.query(Board).count() == 0


def test_cascade_delete_column(session):
    """Test that deleting board deletes associated columns."""
    user = User(username="user1")
    board = Board(user=user, title="Board 1")
    col = Column(board=board, id="col-1", title="TODO", position=0)

    session.add(user)
    session.commit()

    session.delete(board)
    session.commit()

    assert session.query(Column).count() == 0
