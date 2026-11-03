# 🏛️ NIRMAAN 2.0

> **Intelligent Blueprint to 2D/3D Architecture & Compliance Design Platform**

[![Tech Stack](https://img.shields.io/badge/Architecture-Full--Stack-blue)](TECH_STACK.md)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Three.js-61DAFB)](frontend/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%28Python%29-009688)](backend/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

NIRMAAN 2.0 is a full-stack architectural design suite that bridges blueprint creation with real-time 3D walkthroughs, intelligent building code compliance checks, and automated Vastu/structural audits.

👉 **Looking for an exhaustive breakdown of all libraries, versions, and system architecture? See [TECH_STACK.md](TECH_STACK.md).**

---

## ✨ Features

- **📐 Interactive 2D Blueprint Editor**:
  - Draw, snap, and manipulate walls, doors, windows, and furniture items on a 20px magnetic grid.
  - Multi-tool canvas with real-time dimensioning and coordinate mapping.
  - Interactive furniture placement (Sofas, Beds, Indoor Plants, TV Units) with rotation and sizing.
  - Instant blueprint export and local persistence.

- **🌐 Immersive 3D Spatial Visualizer**:
  - WebGL / Three.js-powered real-time 3D room rendering.
  - Dynamic material presets (Natural Oak wood, Polished concrete, Architectural glass).
  - Orbit controls, natural directional sunlight with shadows, and ambient interior lighting.
  - Auto-rotation preview and full interactive inspection mode.

- **🤖 Automated Compliance & Audit Engine**:
  - Real-time rule evaluations for residential and commercial building norms.
  - Aspect ratio checks, enclosed wall validation, and minimum door clearance verifications.
  - Natural lighting and fenestration analysis.
  - Built-in Vastu Shastra directional harmony analysis.

- **🔐 Enterprise-Grade Authentication & Project Persistence**:
  - FastAPI asynchronous backend with MongoDB / Motor driver.
  - Secure JWT authentication with bcrypt password hashing.
  - Complete RESTful CRUD API with ownership enforcement per user.

---

## 🛠️ Quick Tech Stack Overview

| Tier | Core Technologies | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Three.js, Zustand, Tailwind CSS, Lucide React, Axios | SPA with WebGL 3D rendering & 2D canvas |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 | High-concurrency ASGI REST API |
| **Database** | MongoDB Atlas, Motor (AsyncIOMotorClient) | Cloud NoSQL document storage with indexing |
| **Security** | `python-jose` (JWT), `passlib` + `bcrypt`, `email-validator` | Salted hashing & token auth |
| **Testing** | `pytest`, `httpx`, `@playwright/test`, `oxlint` | Unit, integration, and E2E testing |

📖 *For a complete deep-dive into every dependency and architectural decision, view [`TECH_STACK.md`](TECH_STACK.md).*

---

## 📁 Repository Structure

```text
Nirmaan 2.0/
├── backend/
│   ├── audit/              # Building compliance & audit rule engine
│   │   ├── engine.py       # Pure functional scoring & rule logic
│   │   ├── routes.py       # POST /api/audit/evaluate endpoint
│   │   └── schemas.py      # Pydantic schemas for audit request/response
│   ├── auth/               # User authentication routes & JWT security
│   │   ├── routes.py       # Login, register, and current user endpoints
│   │   ├── schemas.py      # User authentication Pydantic models
│   │   └── security.py     # Bcrypt password hashing & JWT generation
│   ├── projects/           # Project CRUD routes & blueprint models
│   │   ├── routes.py       # REST API endpoints for projects
│   │   └── schemas.py      # Wall, door, window, and furniture schemas
│   ├── database.py         # Async Motor MongoDB connection manager
│   ├── main.py             # FastAPI entrypoint & CORS middleware
│   ├── requirements.txt    # Python dependencies
│   ├── test_audit.py       # Audit engine test suite
│   └── test_projects.py    # Auth & project lifecycle integration tests
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios API client & interceptors
│   │   ├── components/     # Reusable UI & 3D canvas (Room3DCanvas)
│   │   ├── features/auth/  # Login & Register views
│   │   ├── pages/          # Home, Dashboard, and Editor views
│   │   └── store/          # Zustand auth state & session storage
│   ├── package.json        # Frontend scripts and dependencies
│   ├── vite.config.js      # Vite build configuration
│   └── playwright.config.js# Playwright E2E configuration
├── TECH_STACK.md           # Exhaustive tech stack & architecture docs
├── NIRMAAN_2.0_Presentation.pptx     # 16:9 Presentation Deck
├── NIRMAAN_Presentation_Viewer.html  # Interactive in-browser slide deck
├── generate_presentation.py          # Script to compile the PPTX deck
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+)
- **MongoDB** (Local instance or MongoDB Atlas cluster URI)

---

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   - **PowerShell (Windows):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Command Prompt (Windows):**
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **Linux / macOS:**
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Create a `.env` file in the `backend/` directory (or use `.env.example` as a template):
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0
   DB_NAME=nirmaan_db
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE_HOURS=24
   CORS_ORIGINS=*
   ```

5. **Start the backend server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   Interactive API documentation will be available at:
   - **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the `frontend/` directory (or use `.env.example`):
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Server health check | No |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | No |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | Yes |
| `GET` | `/api/projects/` | List all projects belonging to the user | Yes |
| `POST` | `/api/projects/` | Create a new project blueprint | Yes |
| `GET` | `/api/projects/{id}` | Retrieve specific project layout data | Yes |
| `PUT` | `/api/projects/{id}` | Update walls, doors, windows, & furniture | Yes |
| `DELETE`| `/api/projects/{id}` | Delete a project | Yes |
| `POST` | `/api/audit/evaluate` | Run compliance and Vastu rule audit on layout | No |

---

## 🧪 Testing

### Backend Unit & Integration Tests
Run pytest in the `backend/` folder:
```bash
cd backend
pytest -v
```

### Frontend End-to-End Tests
Run Playwright tests in the `frontend/` folder:
```bash
cd frontend
npx playwright test
```

---

## 📊 Presentation Deck

An interactive presentation deck detailing the architecture and features is included:
- **Web Viewer**: Double-click [`NIRMAAN_Presentation_Viewer.html`](NIRMAAN_Presentation_Viewer.html) to present directly in any browser.
- **PowerPoint**: Open [`NIRMAAN_2.0_Presentation.pptx`](NIRMAAN_2.0_Presentation.pptx) in PowerPoint or Keynote.
- **Generator**: Regenerate slides via `python generate_presentation.py`.

---

## 📄 License

This project is licensed under the MIT License.
