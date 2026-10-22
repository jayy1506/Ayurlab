# Ayurlab - AI-Powered Ayurvedic Virtual Laboratory & Learning Platform 🌿🔬

[![CI Status](https://github.com/jayy1506/Ayurlab/actions/workflows/ci.yml/badge.svg)](https://github.com/jayy1506/Ayurlab/actions)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](./package.json)
[![Tests: 30 passing](https://img.shields.io/badge/tests-30%20passing-brightgreen.svg)](./tests)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](./package.json)

> **An Interactive Digital Simulation Laboratory and Generative AI Assistant for BAMS Medical Students, Researchers, and Practitioners in *Rasashastra & Bhaishajya Kalpana* (Ayurvedic Pharmaceutical Sciences).**

---

## 📖 Executive Summary

**Ayurlab** is a full-stack interactive virtual laboratory and educational platform designed to modernize Ayurvedic pharmaceutical training across the BAMS practical curriculum.

Traditional Ayurvedic drug preparation requires strict procedural adherence to classical texts (*Charaka Samhita*, *Sushruta Samhita*, *Rasa Tarangini*, *Sharangadhara Samhita*), precise thermal regulation (*Agni Pariksha*), multi-stage purification (*Shodhana*), and accurate observation of preparation endpoints (*Siddhi Lakshana*). Ayurlab replicates physical laboratory compounding through an interactive drag-and-drop & touch-accessible simulation canvas, video demonstrations, deterministic evaluation engines, in-browser MediaRecorder exam proctoring with privacy consent, and a context-aware RAG AI Tutor powered by Google Gemini.

---

## 🏛️ System Architecture Overview

```
                          ┌─────────────────────────────────────────────────────────┐
                          │               AYURLAB CLIENT (React 18 + Vite)          │
                          ├─────────────────────────────────────────────────────────┤
                          │  • Interactive Canvas (Drag-and-Drop + Tap/Click Touch) │
                          │  • Complete BAMS Practical Syllabus & Video Demonstrator│
                          │  • Exam Mode with MediaRecorder Proctoring & Audit      │
                          │  • Pre-Exam Privacy Consent & Supervised Alternative    │
                          │  • Student Analytics Dashboard & Performance Curves     │
                          │  • Faculty / Admin Management & Exam Review Portal      │
                          │  • Bilingual Classical Sanskrit (देवनागरी) & English    │
                          │  • Zero-Client-Key Architecture (Strict Backend Proxy)  │
                          └────────────────────────────┬────────────────────────────┘
                                                       │
                                        HTTPS / Dual-Token Cookie REST
                                                       │
                                                       ▼
                          ┌─────────────────────────────────────────────────────────┐
                          │               EXPRESS.JS BACKEND ENGINE (Node ESM)      │
                          ├─────────────────────────────────────────────────────────┤
                          │  • Dual-Token Auth (15m Access Token, 7d Refresh Cookie)│
                          │  • Security: Helmet, Strict CORS Whitelist, Rate Limit  │
                          │  • Zod Request Validation Middleware                    │
                          │  • Deterministic Simulation Evaluator (±5% Tolerance)   │
                          │  • Multi-Part Streaming Video Upload (Local / AWS S3)   │
                          │  • Automated 30-Day Recording Retention Cleanup Job     │
                          │  • Structured JSON Application Logger                   │
                          │  • Public Minimal Health Check (/health)                │
                          └──────────────┬───────────────────────────┬──────────────┘
                                         │                           │
                   Domain Data & Cache   │                           │ RAG Retrieval & AI Guardrails
                                         ▼                           ▼
            ┌────────────────────────────────────────┐  ┌───────────────────────────────────────┐
            │         PERSISTENT STORAGE TIER        │  │           AI & KNOWLEDGE TIER         │
            ├────────────────────────────────────────┤  ├───────────────────────────────────────┤
            │ • MongoDB Atlas (Users, Practicals,    │  │ • AI Safety Guardrails (108/112 Triage│
            │   Attempts, Exam Logs, AI History)     │  │   Allopathic Blocker, Prompt Shield)  │
            │ • Upstash Redis (High-Speed LLM Cache) │  │ • Classical Samhita RAG Retriever     │
            │ • S3 / Local Media Storage (Exam Recs) │  │ • Google Gemini Dynamic Key Pool      │
            └────────────────────────────────────────┘  └───────────────────────────────────────┘
```

---

## ✨ Core Feature Modules

### 1. 🧪 Laboratory Simulation Engine & Evaluator
- **Dual Interaction Modes**: Full drag-and-drop plus **click/tap-to-place** touch fallback with WAI-ARIA keyboard navigation (`Enter` / `Space`) for mobile and assistive technology users.
- **Classical Apparatus & Actions**: Simulates *Khalva Yantra* (Mortar & Pestle), *Dola Yantra*, *Kupi*, and crucible vessels with classical actions (*Mardana*, *Bhavana*, *Vastragalita*, *Agnidana*).
- **Deterministic Evaluation Engine**: Validates student attempts against canonical Standard Operating Procedures:
  - ±5% ingredient compounding weight tolerances.
  - Required sequence verification.
  - Temperature levels (*Mridu*, *Madhyama*, *Teekshna Agni*).
  - Organoleptic endpoint gating (*Siddhi Lakshanas* such as *Rekhapurnatva*, *Varitara*, *Tantumatva*).
- **Process Specification**: Complete faculty reference documented in [PRACTICAL_PROCESS_SPEC.md](./PRACTICAL_PROCESS_SPEC.md).

### 2. 🛡️ Exam Mode with In-Browser MediaRecorder Proctoring
- **Client-Side Media Capture**: Students complete compounding assessments under browser-native HTML5 `MediaRecorder` video capture (VP8/Opus WebM) running locally on the device — no continuous raw video streams leave the browser until explicit submission.
- **Automated Anti-Cheat Auditing**: Tracks and timestamps window blur, tab switching, and fullscreen exit violations.
- **Streaming Multi-Part Upload**: Supports exam video recordings up to 100MB via chunked streaming with automatic fallback from AWS S3 to local storage (`backend/utils/cloudStorage.js`).
- **Faculty Review Dashboard**: Dedicated playback interface in [Faculty.jsx](./frontend/src/pages/Faculty.jsx) displaying synchronized video playback and violation event markers.

### 3. 🤖 AI Tutor with Clinical Safety Guardrails & Samhita RAG
- **Zero Client-Key Exposure**: Complete isolation of AI credentials on the server.
- **Safety & Emergency Triage**: Intercepts emergency queries with official medical helpline information (108 / 112 / 911), restricts allopathic prescribing, and defends against prompt injection attempts.
- **Classical Samhita RAG**: Grounds responses with exact textual citations from *Charaka Samhita*, *Sushruta Samhita*, *Rasa Tarangini*, *Bhaishajya Ratnavali*, and *Sharangadhara Samhita*.
- **Toxicity Warnings (Schedule E-1)**: Enforces mandatory *Shodhana* (purification) warnings when handling poisonous botanical or mineral agents (*Vatsanabha*, *Kupilu*, *Bhallataka*, *Hingula*, *Gandhaka*).
- **Persistent Analytics & Ratings**: Records user interactions, response ratings, and feedback to MongoDB for faculty quality monitoring.

### 4. 🌐 Classical Sanskrit & Bilingual i18n
- **Devanagari & English Support**: Dynamic dictionary in [i18n.js](./frontend/src/utils/i18n.js) providing authentic Sanskrit terminology for classical equipment, compounding actions, and formulations.
- **Instant Language Switcher**: Global navbar toggle (`EN` / `संस्कृत`) with persistent preferences and screen-reader status announcements.

### 5. 🔒 Security & Access Control
- **Dual-Token Authentication**: 15-minute `accessToken` paired with 7-day HTTP-only `refreshToken` cookies, automatic renewal, and brute-force protection.
- **Strict Headers & Whitelisting**: Helmet security headers, fine-grained CORS origin whitelist, and anti-spam rate limiting.
- **Strict Schema Validation**: Zod-powered request body and query parsing middleware.

---

## 🔒 Exam Recording Privacy & Retention

### 1️⃣ Pre-Exam Consent Screen
- Students see a **consent modal** before the camera starts, explaining:
  - **What is recorded**: Video, audio, tab switches, and timeline events during the practical.
  - **Who can view it**: Authorized course faculty instructors and administrators only.
  - **Retention duration**: 30 days maximum before automated deletion.
- An explicit **checkbox** must be checked to proceed.
- Consent data (`version`, `timestamp`, `consentGiven`) is stored on the `ExamAttempt` document.

### 2️⃣ Retention Policy & Scheduled Cleanup
- Configured via environment variable **`RECORDING_RETENTION_DAYS`** (default **30**).
- A daily background scheduled job (`backend/jobs/recordingCleanup.js`) deletes recordings older than the retention period from AWS S3 or local uploads, clears the `recordingUrl`, and logs each deletion with structured metadata.

### 3️⃣ Non-Blocking Alternative Path (Faculty-Supervised Exam)
- If a student declines consent, they are **not blocked** from completing their coursework.
- They are routed to the **Faculty-Supervised Examination Path**:
  - **Direct Simulation (No Camera)**: Completes the compounding simulation with camera completely disabled; the session audit trail is submitted and flagged for manual faculty review.
  - **In-Person Wet Lab**: Clear scheduling instructions for taking the practical during in-person department laboratory hours.

### 4️⃣ Role-Based Course Ownership Restrictions
- Recording files and attempt details are strictly accessible to **the faculty who created/owns the course** (`practical.createdBy`) and **administrators**.
- Unauthorized faculty and student peers receive a **403 Forbidden** response.
- Direct downloads from `/uploads/exam_recordings` are protected with authentication and role verification.

---

## 📸 Screenshots & Workflow Walkthrough

| Module | Description |
|---|---|
| **Compounding Canvas** | Interactive laboratory workbench simulating classical vessels (*Khalva Yantra*), ingredient ratios, and heating stages (*Mridu/Madhyama/Teekshna Agni*). |
| **Exam Proctoring HUD** | Floating exam timer, active proctoring status pill, live preview toggle, and advisory anti-cheat flags counter. |
| **Privacy Consent Modal** | Pre-exam disclosure detailing data collection, authorized faculty access, and retention terms with an explicit agreement checkbox. |
| **Faculty Timeline Review** | Video player synchronized with timestamped proctoring flags (tab switches, focus loss, fullscreen exits) for instructor sign-off. |
| **Student Dashboard** | Performance trajectory, historical practical scores, organoleptic quality badges, and AI interaction history. |

---

## 🌐 Live Demo & Deployment Status

- **Development Server**: `http://localhost:5173` (Frontend) & `http://localhost:5000` (Backend API).
- **Production Container**: Production multi-stage Docker build served via Nginx / Express reverse proxy.
- **Database Status**: MongoDB Atlas cluster with automatic index synchronization.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend UI** | React 18, Vite, React Router 7, `@dnd-kit/core`, Lucide Icons, Custom Vanilla CSS |
| **Accessibility & i18n** | WAI-ARIA live regions, bilingual Devanagari Sanskrit dictionary, Touch-tap controls |
| **Backend API** | Node.js (ES Modules), Express.js, Helmet, CORS, Multer, Zod, Cookie-Parser |
| **Testing & CI** | Vitest test runner (26 tests passing across auth, evaluator, safety, storage, privacy, and i18n) |
| **AI & LLM** | Google Gemini SDK (`@google/genai`), Multi-Key failover pool, classical Samhita RAG |
| **Database & Cache** | MongoDB Atlas (Mongoose), Upstash Redis (Distributed query caching) |
| **Storage & Deployment** | AWS S3 / Local media storage fallback, Multi-stage Docker, Docker Compose |

---

## 📁 Repository Directory Structure

```
ayurveda/
├── backend/                          # Express.js REST API Server
│   ├── config/                       # Database connection configuration
│   ├── controllers/                  # Auth, Admin, AI, Practical, Simulation & Exam controllers
│   ├── jobs/                         # Background scheduled jobs (recording retention cleanup)
│   ├── middleware/                   # Auth (cookie JWT), RateLimiter, Zod Validation
│   ├── models/                       # User, Practical, SimulationAttempt, AIInteraction, ExamAttempt, ActivityLog
│   ├── routes/                       # REST routes (/api/auth, /api/practicals, /api/simulation, /api/ai, /api/exam)
│   ├── utils/                        # Evaluator, AI Safety, RAG Retriever, Storage, Logger, Seed scripts
│   └── server.js                     # Server entrypoint with /health minimal probe
│
├── frontend/                         # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/               # Auth, Layout, Practical (Canvas, Inventory, Camera), Shared
│   │   ├── contexts/                 # AuthContext, SimulationContext, DataContext
│   │   ├── data/                     # Expected process SOPs & syllabus data
│   │   ├── pages/                    # Home, Practical, Dashboard, Faculty, Admin
│   │   ├── services/                 # Backend API proxy client
│   │   └── utils/                    # Bilingual i18n dictionary, Activity tracking, Evaluator
│   ├── package.json
│   └── vite.config.js
│
├── tests/                            # Automated Vitest Test Suites (26 Tests)
│   ├── auth.test.js                  # Authentication & dual-token security tests
│   ├── evaluator.test.js             # Simulation evaluator & ±5% tolerance tests
│   ├── i18n.test.js                  # Classical Sanskrit & bilingual dictionary tests
│   ├── privacy.test.js               # Exam privacy consent, retention cleanup & access control
│   ├── safety.test.js                # AI triage & clinical safety guardrails tests
│   └── storage.test.js               # Multi-part cloud and local storage fallback tests
│
├── evaluation/                       # Samhita RAG Evaluation Harness
│   └── questions.json                # Benchmark questions for RAG accuracy & citation recall
│
├── Dockerfile                        # Multi-stage production container
├── docker-compose.yml                # Multi-service deployment specification
├── PRACTICAL_PROCESS_SPEC.md         # Faculty SOP & process evaluation specification
├── vitest.config.js                  # Root test runner configuration
├── package.json                      # Monorepo scripts & dependencies
└── README.md                         # Master Documentation
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# Authentication (Dual-Token JWT)
JWT_SECRET=your_jwt_access_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_min_32_chars
COOKIE_SECRET=your_secure_cookie_signing_secret

# MongoDB Atlas Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/ayurlab?retryWrites=true&w=majority

# Distributed Redis Cache (Upstash)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

# Google Gemini Multi-Key AI Pool (Backend Only - Never expose on client!)
GEMINI_KEY_1=AIzaSyYourKeyOne...
GEMINI_KEY_2=AIzaSyYourKeyTwo...
GEMINI_KEY_3=AIzaSyYourKeyThree...
GEMINI_API_KEY=AIzaSyPrimary...

# Cloud Media & Exam Recording Storage (Optional - Defaults to local disk if omitted)
STORAGE_TYPE=local
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=ayurlab-exam-recordings
RECORDING_RETENTION_DAYS=30  # Number of days to keep exam recordings (default: 30)
```

---

## 🚀 Installation & Running Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **MongoDB Atlas** or local MongoDB instance

### 2. Install Dependencies
```bash
# Install dependencies across all workspaces
npm install
```

### 3. Seed Classical Practical Catalog (65 Formulations)
```bash
# Seeds syllabus with authentic Samhita SOPs and Siddhi Lakshanas
npm run seed --workspace=backend
```

### 4. Run Development Servers
```bash
# Concurrently launch frontend (port 5173) and backend (port 5000)
npm run dev
```

### 5. Execute Automated Test Suites
```bash
# Run all Vitest suites (Evaluator, Safety, Auth, Storage, Privacy, i18n, Grading Visibility - 30 tests)
npm test
```

### 6. Build Frontend for Production
```bash
npm run build --workspace=frontend
```

---

## 🐳 Docker Deployment

To build and run the entire application stack using Docker Compose:

```bash
# Build multi-stage production image and launch services
docker compose up -d --build

# View container logs
docker compose logs -f

# Verify container health
curl http://localhost:5000/health
```

---

## 🩺 System Health Diagnostics

The backend provides health diagnostic endpoints:

### Public Health Check (`GET /health`)
Minimal, high-availability public probe suitable for container orchestrators, load balancers, and keep-alive monitors:
```json
{
  "status": "ok"
}
```

### Admin Diagnostics (`GET /health/details`)
Protected endpoint restricted to administrators providing detailed subsystem diagnostic status:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-21T19:50:00.000Z",
  "database": {
    "status": "connected",
    "name": "ayurlab"
  },
  "redis": {
    "status": "connected",
    "type": "Upstash Cloud Redis"
  },
  "storage": {
    "type": "local",
    "status": "ready",
    "retentionDays": 30
  },
  "process": {
    "uptimeSeconds": 3600,
    "memoryUsageMB": 68.4
  }
}
```

---

## ⚠️ Known Limitations

1. **Client-Side Face Presence**: In-browser face detection models run locally on the client's WebAssembly/WebGL thread. Detection accuracy depends on student ambient lighting, camera resolution, and unobstructed facial visibility.
2. **Discrete Thermal Simulation**: Formulation heating curves simulate canonical temperature bands (*Mridu/Madhyama/Teekshna Agni*) using discrete thermodynamic state transitions rather than continuous fluid dynamic simulations.
3. **Local Media Fallback in Containers**: When running in ephemeral container environments (e.g. Render, Heroku) without S3 credentials, local uploads stored in `uploads/` are non-persistent across redeployments. AWS S3 configuration is recommended for production persistence.

---

## ⚖️ Educational-Use Disclaimer

**Ayurlab is engineered exclusively for academic training, laboratory education, and research simulations within the accredited BAMS (*Bachelor of Ayurvedic Medicine and Surgery*) medical curriculum.**

- Compounding calculations, Siddhi Lakshana simulations, and AI tutor outputs are designed for didactic learning and laboratory preparation only.
- The platform **does not** provide medical diagnosis, clinical consultation, or direct patient prescribing guidance.
- Any medicinal formulations containing classical poisonous plants or heavy metals (*Schedule E-1*) must adhere to the Drugs and Cosmetics Act (1940) and should only be prepared in physical laboratories under licensed Ayurvedic pharmacy supervision.

---

## 📄 License & Attribution

Ayurlab is open-source academic software licensed under the **ISC License**. Developed for the preservation and digital advancement of Ayurvedic Pharmaceutical Sciences (*Rasashastra & Bhaishajya Kalpana*).