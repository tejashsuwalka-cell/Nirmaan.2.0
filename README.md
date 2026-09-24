# 🏛️ NIRMAAN 2.0

> **Intelligent Blueprint to 2D/3D Architecture & Compliance Design Platform**

NIRMAAN 2.0 is a full-stack architectural design suite that bridges blueprint creation with real-time 3D walkthroughs, intelligent building code compliance checks, and automated Vastu/structural audits.

---

## ✨ Features

- **📐 Interactive 2D Blueprint Editor**:
  - Draw, snap, and manipulate walls, doors, windows, and furniture.
  - Multi-tool canvas with real-time dimensioning and coordinate mapping.
  - Export capabilities for high-resolution blueprints and schematics.

- **🌐 Immersive 3D Spatial Visualizer**:
  - WebGL / Three.js-powered real-time 3D room rendering.
  - Dynamic material presets (Oak wood, Polished concrete, Architectural glass).
  - Orbit controls, natural directional sunlight, and ambient interior lighting.

- **🤖 Automated Compliance & Audit Engine**:
  - Real-time rule evaluations for residential and commercial building norms.
  - Aspect ratio checks, minimum ventilation and door clearance verifications.
  - Built-in Vastu Shastra directional harmony analysis.

- **🔐 Enterprise-Grade Authentication & Project Persistence**:
  - FastAPI asynchronous backend with MongoDB / Motor driver.
  - Secure JWT authentication with bcrypt password hashing.
  - Complete RESTful CRUD API with ownership enforcement.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **3D Engine**: [Three.js](https://threejs.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: Modern Responsive Vanilla CSS (Tailored Design System, Dark Mode, Glassmorphism)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Playwright](https://playwright.dev/) for End-to-End Testing

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous ASGI)
- **Server**: [Uvicorn](https://www.uvicorn.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Motor](https://motor.readthedocs.io/)
- **Authentication**: JWT (`python-jose`) + `passlib` with `bcrypt`
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **Testing**: [pytest](https://docs.pytest.org/) + `httpx` async client

---

## 📁 Repository Structure

```text
Nirmaan 2.0/
├── backend/
│   ├── audit/              # Building compliance & audit rule engine
│   ├── auth/               # User authentication routes & JWT security
│   ├── projects/           # Project CRUD routes & Pydantic schemas
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
│   │   └── store/          # Zustand auth state
│   ├── package.json        # Frontend scripts and dependencies
│   └── vite.config.js      # Vite build configuration
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
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Create a `.env` file in the `backend/` directory (or use `.env.example` as a template):
   ```env
   MONGO_URI=mongodb://localhost:27017
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
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

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
   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

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
