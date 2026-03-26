"""Sample data population script for development."""
from app.database import init_db, get_session_factory, User, Board, Column, Card


def populate_sample_data():
    """Create sample user, board, columns, and cards."""
    engine = init_db()
    Session = get_session_factory(engine)
    session = Session()

    # Clear existing data
    session.query(Card).delete()
    session.query(Column).delete()
    session.query(Board).delete()
    session.query(User).delete()
    session.commit()

    # Create user
    user = User(username="user")
    session.add(user)
    session.commit()

    # Create board
    board = Board(user_id=user.id, title="My Kanban Board")
    session.add(board)
    session.commit()

    # Create columns
    columns_data = [
        ("col-backlog", "Backlog", 0),
        ("col-discovery", "Discovery", 1),
        ("col-progress", "In Progress", 2),
        ("col-review", "Review", 3),
        ("col-done", "Done", 4),
    ]

    columns = {}
    for col_id, col_title, position in columns_data:
        col = Column(id=col_id, board_id=board.id, title=col_title, position=position)
        session.add(col)
        columns[col_id] = col
    session.commit()

    # Create sample cards
    cards_data = [
        ("col-backlog", "card-1", "Align roadmap themes", "Draft quarterly themes with impact statements and metrics.", 0),
        ("col-backlog", "card-2", "Gather customer signals", "Review support tags, sales notes, and churn feedback.", 1),
        ("col-discovery", "card-3", "Prototype analytics view", "Sketch initial dashboard layout and key drill-downs.", 0),
        ("col-progress", "card-4", "Refine status language", "Standardize column labels and tone across the board.", 0),
        ("col-progress", "card-5", "Design card layout", "Add hierarchy and spacing for scanning dense lists.", 1),
        ("col-review", "card-6", "QA micro-interactions", "Verify hover, focus, and loading states.", 0),
        ("col-done", "card-7", "Ship marketing page", "Final copy approved and asset pack delivered.", 0),
        ("col-done", "card-8", "Close onboarding sprint", "Document release notes and share internally.", 1),
    ]

    for col_id, card_id, title, details, position in cards_data:
        card = Card(
            id=card_id,
            column_id=col_id,
            title=title,
            details=details,
            position=position,
        )
        session.add(card)

    session.commit()
    session.close()
    print("✓ Sample data populated successfully")


if __name__ == "__main__":
    populate_sample_data()
