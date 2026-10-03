# CodeCompass

**Navigate code. Find your contribution.**

CodeCompass is an AI-powered open-source contribution navigator. It helps developers understand any public GitHub repository, discover contribution opportunities, and get a personalized step-by-step plan for making their first (or next) contribution.

## What It Does

```
GitHub Repository → Understand → Find Opportunities → Match Skills → Recommend Contribution → Explain Exactly How to Contribute
```

1. **Paste any public GitHub URL** → CodeCompass fetches the repository data
2. **AI understands the codebase** → Architecture, tech stack, important files, navigation guide
3. **Finds contribution opportunities** → From GitHub issues and AI-detected improvements
4. **Matches your skills** → Personalized recommendations based on your experience
5. **Creates a contribution plan** → Step-by-step guide with exact files and commands

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Authentication | Firebase (Google + Email/Password) |
| Backend | Python, FastAPI |
| Repository Data | GitHub REST API |
| AI | Qwen3-Coder via OpenRouter (or any OpenAI-compatible API) |

## Project Structure

```
CodeCompass/
├── frontend/                   # React + Vite frontend
│   └── src/
│       ├── components/         # Reusable UI components
│       │   ├── dashboard/      # Dashboard section components
│       │   ├── GoogleButton.jsx
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── contexts/           # React contexts (Auth)
│       ├── firebase/           # Firebase configuration
│       ├── pages/              # Page components
│       ├── App.jsx             # Root app with routing
│       ├── main.jsx            # Entry point
│       └── index.css           # Global styles
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py       # API endpoints
│   │   ├── services/
│   │   │   ├── github_service.py  # GitHub API integration
│   │   │   └── ai_service.py     # AI (Qwen3-Coder) integration
│   │   └── main.py            # FastAPI entry point
│   └── requirements.txt
├── .env                        # Environment variables (not committed)
├── .env.example                # Environment template
├── .gitignore
└── README.md
```

## Setup

### 1. Clone & Install

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
# Firebase credentials (from Firebase Console > Project Settings)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# AI (get an API key from https://openrouter.ai/keys)
AI_API_KEY=your_openrouter_api_key
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL_NAME=qwen/qwen3-coder

# Optional: GitHub token for higher rate limits
GITHUB_TOKEN=
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
python -m uvicorn app.main:app --port 8000 --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open `http://localhost:5173`

## Features

### Authentication
- Firebase Email/Password login & signup
- Google Sign-In
- Protected dashboard routes
- Session persistence

### Dashboard
- Welcome overview with stats
- Recently analyzed repositories
- Latest contribution recommendation
- Quick navigation to all sections

### Repository Analyzer
- Paste any public GitHub URL
- **Repository Overview** — Name, owner, description, stars, forks, issues
- **Tech Stack** — Language breakdown with percentages
- **AI Understanding** — Project summary, architecture, important files, navigation guide
- **Contribution Opportunities** — From GitHub issues and AI detection
- **Skill Matching** — Personalized matches based on your skills
- **Contribution Plan** — Step-by-step guide with commands and tips
- **File Tree** — Interactive repository structure browser
- **README** — With AI-powered summary

### My Skills
- Add technical skills (tag-based input with suggestions)
- Set experience level (Beginner / Intermediate / Advanced)
- Select contribution interests
- Specify skills you want to learn
- All persisted locally

### Profile
- User info (name, email, avatar)
- Optional GitHub username
- Sign out


## AI Configuration

CodeCompass uses **Qwen3-Coder** through an OpenAI-compatible inference API. By default, it uses [OpenRouter](https://openrouter.ai).

The application works without AI configured — GitHub data is always available. AI adds:
- Project understanding and architecture analysis
- Smart contribution opportunity detection
- Skill-to-opportunity matching
- Personalized contribution plans

## License

MIT
