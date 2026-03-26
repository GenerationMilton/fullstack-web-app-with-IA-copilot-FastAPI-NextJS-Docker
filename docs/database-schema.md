# Database Schema

## Overview
SQLite database supporting multi-user Kanban boards. Each user has one board with 5 columns and multiple cards per column.

## Tables

### `users`
User accounts for authentication.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| username | TEXT | UNIQUE NOT NULL |
| created_at | DATETIME | NOT NULL, default=now |

### `boards`
Kanban boards, one per user.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FOREIGN KEY (users.id), NOT NULL |
| title | TEXT | NOT NULL, default="My Board" |
| created_at | DATETIME | NOT NULL, default=now |
| updated_at | DATETIME | NOT NULL, default=now |

### `columns`
Board columns (Backlog, Discovery, In Progress, Review, Done).

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| board_id | INTEGER | FOREIGN KEY (boards.id), NOT NULL |
| title | TEXT | NOT NULL |
| position | INTEGER | NOT NULL |
| created_at | DATETIME | NOT NULL, default=now |
| updated_at | DATETIME | NOT NULL, default=now |

### `cards`
Task cards within columns.

| Column | Type | Constraints |
|--------|------|-------------|
| id | TEXT | PRIMARY KEY |
| column_id | TEXT | FOREIGN KEY (columns.id), NOT NULL |
| title | TEXT | NOT NULL |
| details | TEXT | default="" |
| position | INTEGER | NOT NULL |
| created_at | DATETIME | NOT NULL, default=now |
| updated_at | DATETIME | NOT NULL, default=now |

## Relationships

```
users (1) ──── (1) boards
              │
              └── (N) columns
                       │
                       └── (N) cards
```

## Design Notes

- Text IDs for columns and cards allow frontend to maintain consistency with existing component IDs (e.g., "col-backlog", "card-1")
- Integer IDs for users and boards for simplicity
- Position fields maintain column/card order (0-indexed, updated on drag-drop)
- created_at and updated_at allow audit tracking
- For MVP, one board per user; schema supports multiple boards per user for future expansion
