# Detailed Project Plan

This document outlines the complete implementation plan for the Project Management MVP web app. Each part includes detailed substeps as checklists, testing requirements, and success criteria.

> Testing guidance updated: aim for 80% unit test coverage as a sensible target, but don’t add low-value tests just to hit a number; prioritize valuable coverage and practical quality over strict percentage gates.

## Part 1: Planning and Documentation

### Substeps:
- [x] Create AGENTS.md in frontend/ directory describing the existing frontend code structure, components, and functionality
- [x] Enrich this PLAN.md document with detailed substeps, checklists, tests, and success criteria for all 10 parts
- [x] Incorporate 80% minimum unit test coverage requirements and robust integration testing throughout the plan
- [ ] Get user approval on the enriched plan

### Tests:
- Verify frontend/AGENTS.md exists and accurately describes all components, data structures, and current functionality
- Validate that PLAN.md contains detailed breakdowns for all 10 parts with checklists, tests, and success criteria
- Run any existing tests to ensure current 80%+ coverage is maintained

### Success Criteria:
- frontend/AGENTS.md provides comprehensive documentation of existing code
- PLAN.md is fully detailed and ready for execution
- User reviews and approves the complete plan
- All documentation follows coding standards (concise, no emojis)

## Part 2: Docker and Backend Scaffolding

### Substeps:
- [ ] Set up Docker infrastructure with multi-stage build (frontend build + backend)
- [ ] Create backend/ directory with FastAPI application structure
- [ ] Implement basic FastAPI app that serves static HTML at / with "Hello World" content
- [ ] Add a simple API endpoint (e.g., /api/health) that returns JSON response
- [ ] Create Dockerfile using uv for Python package management
- [ ] Write start.sh and stop.sh scripts in scripts/ for Mac, PC, Linux
- [ ] Configure Docker Compose for local development
- [ ] Test Docker build and run locally
- [ ] Verify static HTML serves at / and API call works

### Tests:
- Unit tests for FastAPI routes (80%+ coverage)
- Integration tests for Docker container startup and API responses
- Test scripts execution on different platforms
- End-to-end test: Build Docker image, run container, verify / serves HTML and /api/health returns JSON

### Success Criteria:
- Docker container builds successfully
- App runs locally via Docker
- / serves static HTML with "Hello World"
- /api/health returns valid JSON
- Start/stop scripts work on target platforms
- Backend unit test coverage >= 80%

## Part 3: Frontend Integration

### Substeps:
- [ ] Update Dockerfile to build NextJS frontend statically
- [ ] Modify FastAPI to serve built NextJS static files at /
- [ ] Ensure Kanban board displays correctly when served from backend
- [ ] Update Docker configuration for production build
- [ ] Test static build process
- [ ] Verify drag-and-drop functionality works in served app

### Tests:
- Unit tests for all frontend components (maintain 80%+ coverage)
- Integration tests for NextJS build process
- End-to-end tests with Playwright for full Kanban functionality
- Test static file serving from FastAPI
- Cross-browser compatibility tests

### Success Criteria:
- Frontend builds to static files successfully
- Kanban board loads and functions at /
- All existing features work (drag-drop, add/edit/delete cards, rename columns)
- Frontend unit test coverage >= 80%
- Integration tests pass for build and serve process

## Part 4: User Authentication

### Substeps:
- [ ] Create login page component with username/password fields
- [ ] Implement client-side authentication logic (hardcoded "user"/"password")
- [ ] Add login state management (logged in/out)
- [ ] Protect Kanban board route - redirect to login if not authenticated
- [ ] Add logout functionality
- [ ] Update UI to show login status
- [ ] Persist login state in localStorage (for demo purposes)

### Tests:
- Unit tests for authentication components and logic (80%+ coverage)
- Integration tests for login/logout flow
- End-to-end tests: Login with correct credentials shows Kanban, incorrect denies access, logout redirects to login
- Test localStorage persistence across browser sessions

### Success Criteria:
- / redirects to login page when not authenticated
- Login with "user"/"password" grants access to Kanban
- Logout clears session and redirects to login
- Authentication state persists across page refreshes
- All auth-related code has 80%+ unit test coverage

## Part 5: Database Schema Design

### Substeps:
- [ ] Design SQLite database schema for users and Kanban boards
- [ ] Define tables: users, boards, columns, cards
- [ ] Create database migration/initialization scripts
- [ ] Document schema in docs/database-schema.md
- [ ] Implement database models in Python (using SQLAlchemy or similar)
- [ ] Create sample data population script
- [ ] Get user approval on schema design

### Tests:
- Unit tests for database models and schema validation
- Integration tests for database initialization and migrations
- Test data population and retrieval

### Success Criteria:
- Complete database schema documented and approved
- SQLite database creates successfully with all tables
- Sample data can be inserted and queried
- Schema supports multiple users and boards per user
- Database code has 80%+ unit test coverage

## Part 6: Backend API Implementation

### Substeps:
- [ ] Implement user authentication API endpoints
- [ ] Create Kanban CRUD API endpoints:
  - GET /api/board - get user's board
  - PUT /api/board - update board (move cards, rename columns, add/delete cards)
- [ ] Add database integration to all endpoints
- [ ] Implement proper error handling and validation
- [ ] Add request/response models with Pydantic
- [ ] Ensure database creates if it doesn't exist

### Tests:
- Comprehensive unit tests for all API endpoints (80%+ coverage)
- Integration tests for database operations
- API contract tests with request/response validation
- Test authentication middleware
- Load tests for concurrent board updates

### Success Criteria:
- All API endpoints return correct responses
- Database persists board state correctly
- Authentication protects endpoints
- Error handling provides meaningful responses
- Backend unit test coverage >= 80%
- API can handle full Kanban operations (CRUD)

## Part 7: Frontend-Backend Integration

### Substeps:
- [x] Replace frontend mock data with API calls
- [x] Implement authentication flow with backend
- [x] Add API client functions for all board operations
- [x] Update KanbanBoard to use real data from backend
- [x] Handle loading states and error cases
- [x] Implement optimistic updates for better UX
- [x] Test data persistence across sessions
- Notes: 
  - `src/lib/api.ts` now converts backend `BoardResponse` into local `BoardData` and builds `BoardUpdate` payloads.
  - `KanbanBoard` initializes from `/api/board`, persists changes with `/api/board` on drag/add/delete/rename, and falls back to local data with error banner.
  - `auth.login` now calls `/api/login` and uses localStorage for session state.

### Tests:
- Unit tests for API client functions (80%+ coverage)
- Integration tests for frontend-backend communication
- End-to-end tests for full user workflows (login, modify board, logout, login again - data persists)
- Test error handling (network failures, invalid responses)
- Performance tests for board loading and updates

### Success Criteria:
- Frontend authenticates with backend
- Board data loads from and saves to database
- All Kanban operations persist correctly
- App functions as complete persistent Kanban board
- Frontend unit test coverage >= 80%
- Robust integration tests cover all user journeys

## Part 8: AI Connectivity Setup

### Substeps:
- [x] Install OpenRouter Python client (via `httpx` + OpenRouter REST API)
- [x] Implement basic AI service class
- [x] Create test endpoint that calls AI with "2+2" and verifies response
- [x] Configure OpenRouter API key from environment
- [x] Add error handling for AI API failures
- [x] Test connectivity and response parsing

### Notes:
- Added `/api/chat` in `backend/app/main.py`, uses `app/ai_service.py`.
- Chat endpoint accepts `{ prompt, history }`, invalid/missing API key gives 502.
- `app/ai_service.py` calls `https://api.openrouter.ai/v1/chat/completions` with model `openai/gpt-oss-120b`, expects OpenRouter response.
- `backend/tests/test_api.py` includes integration test with real key (`OPENROUTER_API_KEY`) but skips when missing.


### Tests:
- Unit tests for AI service class (80%+ coverage)
- Integration tests for OpenRouter API calls
- Test API key configuration and error cases
- Verify "2+2" test returns expected result

### Success Criteria:
- AI service can successfully call OpenRouter
- Test query returns correct mathematical result
- API key is properly configured from .env
- Error handling works for API failures
- AI connectivity code has 80%+ unit test coverage

## Part 9: AI Chat with Structured Outputs

### Substeps:
- [x] Extend AI service to accept Kanban JSON + user question + history
- [x] Define Structured Output schema for AI responses (user message + optional board updates)
- [x] Implement conversation history management
- [x] Create backend endpoint for AI chat
- [x] Parse AI structured responses and apply board updates
- [x] Add validation for AI-generated board changes
- [x] Test various AI interaction scenarios

### Notes:
- `ChatRequest` now includes `board`; `ChatResponse` includes optional `updates`.
- `app/ai_service.py` now instructs model to emit JSON and attempts parse it.
- `/api/chat` processes structured output and returns `reply` & `updates`.
- `KanbanBoard` now includes minimal AI prompt UI and applies returned `updates` using `normalizeBoard`.
- Tests:
  - `backend/tests/test_api.py`: `/api/chat` 502 without key; optional real OpenRouter test with key
  - `backend/tests/test_ai_service.py`: function-level AI output parsing
  - `frontend/src/components/KanbanBoard.test.tsx`: creates/uses AI path and verifies board update application.


### Tests:
- Unit tests for AI response parsing and board update logic (80%+ coverage)
- Integration tests for full AI chat flow
- Test structured output validation
- Edge case tests (invalid AI responses, complex board changes)
- Conversation history persistence tests

### Success Criteria:
- AI can process Kanban state and user questions
- Structured outputs correctly update board when requested
- Conversation history maintained across interactions
- Invalid AI responses handled gracefully
- AI chat functionality has 80%+ unit test coverage

## Part 10: AI Chat UI Integration

### Substeps:
- [ ] Design and implement sidebar chat widget
- [ ] Add chat input and message display components
- [ ] Integrate with backend AI chat endpoint
- [ ] Implement real-time board updates when AI modifies Kanban
- [ ] Add loading states and error handling for chat
- [ ] Style chat widget to match app design
- [ ] Test full AI chat user experience

### Tests:
- Unit tests for chat components (80%+ coverage)
- Integration tests for chat-backend communication
- End-to-end tests for complete AI chat workflows
- Test board auto-refresh after AI updates
- Accessibility tests for chat interface

### Success Criteria:
- Beautiful sidebar chat widget integrated
- Users can chat with AI about Kanban board
- AI responses display in chat
- Board updates automatically when AI makes changes
- Chat persists conversation history
- Full application has 80%+ unit test coverage
- Comprehensive integration tests cover all features