# AI Website Builder

Describe a website in natural language — AI plans, designs, writes copy, and generates production-ready React code. Built with Next.js + FastAPI + Groq.

## ✨ Features

- **Natural Language Input** — Describe your website in plain English
- **Multi-Stage AI Pipeline** — Planning → Design Tokens → Copywriting → Components → Build
- **Live Preview** — See your website come to life instantly with device toggling (desktop/tablet/mobile)
- **AI Editing** — Make changes with natural language: *"Make buttons rounded"* or *"Use purple instead of blue"*
- **Version History** — Every edit is saved. Restore any previous version.
- **Export** — Download as a complete React project (ZIP with components, configs, and styles)
- **Real-Time Streaming** — WebSocket-powered generation progress updates
- **Interchangeable AI** — Built-in providers for Groq, Gemini, with extension points for OpenAI, Claude, GLM

## 🏗️ Architecture

```
User
  │
  ▼
Next.js Frontend (React + Tailwind + TypeScript)
  │
  REST API + WebSocket
  │
  ▼
FastAPI Backend (Python)
  │
  ├── PostgreSQL (Database)
  ├── Groq Cloud / Gemini (AI Provider)
  └── File Storage (Exports)
```

**AI Pipeline:**
```
User Prompt
  │
  ▼
[1] Planner → Structured JSON Plan (sections, theme, colors)
  │
  ▼
[2] Design Tokens → Colors, typography, spacing, shadows
  │
  ▼
[3] Copywriting → Hero, about, testimonials, FAQ text
  │
  ▼
[4] Component Generator → Individual React .jsx files
  │
  ▼
[5] Project Builder → Full project structure + configs
  │
  ▼
Preview + Edit + Export
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, SQLAlchemy, Alembic, PostgreSQL |
| **AI** | Groq Cloud (default), Google Gemini (fallback) |
| **Auth** | JWT (email/password), Supabase-ready for OAuth |
| **State** | Zustand, React Query, Axios |
| **Real-Time** | WebSockets (generation progress streaming) |
| **Animation** | Framer Motion |

## 📁 Project Structure

```
ai-website-builder/
├── backend/
│   ├── app/
│   │   ├── ai/          # AI providers (Groq, Gemini) & pipeline orchestrator
│   │   ├── api/         # REST API routes (auth, projects, versions, exports)
│   │   ├── auth/        # JWT authentication & dependencies
│   │   ├── database/    # SQLAlchemy connection & session management
│   │   ├── models/      # Database models (User, Project, Component, Version, etc.)
│   │   ├── schemas/     # Pydantic schemas for request/response validation
│   │   ├── services/    # Business logic (export, project assembly)
│   │   ├── prompts/     # Prompt templates for each AI pipeline step
│   │   ├── websocket/   # WebSocket manager for real-time streaming
│   │   └── utils/       # Utility functions
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # Reusable React components
│   │   ├── ui/          # Base UI (Button, Input, Modal, Spinner)
│   │   ├── auth/        # Login/Signup forms
│   │   ├── dashboard/   # Project cards & list
│   │   ├── editor/      # Prompt input, AI editing, generation progress
│   │   └── preview/     # Live preview frame & device toggle
│   ├── hooks/           # React hooks (useProjects, useGeneration)
│   ├── services/        # API client (Axios)
│   ├── store/           # Zustand state stores (auth, project)
│   ├── types/           # TypeScript type definitions
│   └── lib/             # Supabase client
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.13+
- Node.js 20+
- PostgreSQL 15+ (or [Supabase](https://supabase.com) free tier)
- A Groq API key ([console.groq.com](https://console.groq.com)) or Gemini API key

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings:
#   - DATABASE_URL (PostgreSQL connection string)
#   - GROQ_API_KEY (or GEMINI_API_KEY)
#   - JWT_SECRET (change the default)

# Start the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials (optional, for OAuth)

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Database Setup

You can use either a local PostgreSQL instance or [Supabase](https://supabase.com) (free tier):

```env
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_website_builder

# Supabase
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

Tables are created automatically on first startup (`Base.metadata.create_all`).

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/projects/` | List user's projects |
| `POST` | `/api/projects/` | Create project |
| `GET` | `/api/projects/{id}` | Get project details |
| `DELETE` | `/api/projects/{id}` | Delete project |
| `POST` | `/api/projects/{id}/generate` | Start AI generation |
| `POST` | `/api/projects/{id}/edit` | AI edit with prompt |
| `WS` | `/api/projects/{id}/ws` | WebSocket for progress |
| `GET` | `/api/projects/{id}/versions` | List versions |
| `POST` | `/api/projects/{id}/versions` | Save version |
| `POST` | `/api/projects/{id}/versions/{vid}/restore` | Restore version |
| `GET` | `/api/projects/{id}/export` | Download as ZIP |

## 🔄 AI Providers

The system is designed with a clean provider abstraction. Currently supported:

| Provider | Setup |
|---|---|
| **Groq** (default) | Set `AI_PROVIDER=groq` and `GROQ_API_KEY` in `.env` |
| **Gemini** | Set `AI_PROVIDER=gemini` and `GEMINI_API_KEY` in `.env` |

To add a new provider, implement the `BaseAIProvider` interface in `backend/app/ai/` and register it in the factory function in `pipeline.py`.

## 🐳 Deployment

### Backend (Railway / Render / DigitalOcean)

```bash
# Build command
pip install -r requirements.txt

# Start command
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel)

```bash
# Build command
npm run build

# Output directory
.next
```

## 📝 License

MIT
