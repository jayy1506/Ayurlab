# Ayurlab - AI-Powered Ayurvedic Virtual Laboratory & Research Platform 🌿🔬

> **A Comprehensive Digital Laboratory, E-Library, and Intelligent AI Tutor for BAMS (Bachelor of Ayurvedic Medicine and Surgery) Scholars, Faculty, and Researchers in *Rasashastra & Bhaishajya Kalpana* (Ayurvedic Pharmaceutical Sciences).**

---

## 📖 Project Overview

**Ayurlab** is an interactive, full-stack educational and simulation platform designed to digitalize classical Ayurvedic pharmaceutical compounding. 

In traditional Ayurvedic medicine, formulating medicines requires strict adherence to classical texts (*Charaka Samhita*, *Sushruta Samhita*, *Rasa Tarangini*, *Sharangadhara Samhita*), precise ingredient proportions, multi-stage grinding (*Bhavana*), controlled heating (*Agni Pariksha*), and observation of traditional completion signs (*Siddhi Lakshana*). 

Ayurlab provides an interactive virtual laboratory for students to practice compounding procedures, a comprehensive classical e-library, an intelligent AI Tutor with conversational memory, real-time activity tracking, and an administrative portal for faculty proctoring.

---

## 🏛️ System Architecture

```
                          ┌─────────────────────────────────────────────────────────┐
                          │               AYURLAB FRONTEND (React 18 + Vite)        │
                          ├─────────────────────────────────────────────────────────┤
                          │  • Practical Virtual Lab (Drag & Drop Canvas + Proctor) │
                          │  • Ayurvedic E-Library (SOPs, Shlokas & Cinema Videos)  │
                          │  • Dashboard & Real-Time Activity Tracker (24-Hour Log) │
                          │  • Faculty & Admin Management Portal                    │
                          │  • Ayurvedic AI Tutor (ChatGPT UX, TTS Audio & Shimmer) │
                          │  • Tier 0 Cache: Browser SessionStorage (0ms Latency)   │
                          └────────────────────────────┬────────────────────────────┘
                                                       │
                                        REST API / HTTPS Requests
                                                       │
                                                       ▼
                          ┌─────────────────────────────────────────────────────────┐
                          │               EXPRESS.JS BACKEND ENGINE (Node ESM)      │
                          ├─────────────────────────────────────────────────────────┤
                          │  • JWT Auth & Role-Based Access Control (Admin/Faculty) │
                          │  • AI Multi-Key Failover Router (/api/ai/tutor)         │
                          │  • Tier 1 Cache: In-Memory Fast LRU (7-Day TTL)         │
                          │  • Exam Mode & Academic Integrity Lock Controller       │
                          └──────────────┬───────────────────────────┬──────────────┘
                                         │                           │
                   Cache Miss / Distributed Sync         Multi-Key API Pool (Rotation)
                                         │                           │
                                         ▼                           ▼
                    ┌─────────────────────────┐       ┌───────────────────────────────┐
                    │  UPSTASH REDIS CLOUD    │       │     GOOGLE GEMINI AI POOL     │
                    │  (Tier 2 Persistent)    │       │ • gemini-2.5-flash            │
                    │  • Key/Value JSON Cache │       │ • gemini-2.5-pro              │
                    │  • 604,800s Expiry      │       │ • Keys 1..4 Dynamic Failover  │
                    └─────────────────────────┘       └───────────────────────────────┘
```

---

## 🌟 Complete Feature Analysis (What Really Exists in Ayurlab)

### 1. 🧪 Practical Virtual Laboratory (`/practical`)
- **Drag-and-Drop Compounding Canvas**: Powered by `@dnd-kit/core`, allows students to drag utensils, raw herbs, minerals, and liquids directly onto an interactive laboratory workbench.
- **Utensils & Inventory**: Includes authentic classical apparatus such as *Khalva Yantra* (Mortar & Pestle), heating vessels (*Patra*), liquids (*Kwatha*, *Taila*), and herbal powders.
- **Precision Weight Measurement Modal**: Allows students to input exact weights (grams/milliliters) before adding ingredients to utensils.
- **Action & Recipe Engine**: Triggers compounding actions such as Grinding (*Mardan*), Heating (*Paka/Agni*), Mixing, and *Bhavana* cycles.
- **Exam Mode & Video Proctoring**: Integrated `CameraRecorder` and IndexedDB storage to capture student practical exam sessions for faculty evaluation.

---

### 2. 📚 Ayurvedic E-Library & Formulation SOPs (`/learning`)
- **Category Filter System**: Browse formulations classified into classical pharmaceutical forms:
  - 🌿 **Churna** (Fine Powders, e.g., *Sitopaladi Churna*, *Hingwastaka Churna*)
  - 💊 **Vati / Gutika** (Pills & Tablets, e.g., *Agnitundi Vati*)
  - 🟣 **Guggulu** (Resin-based formulations)
  - 🧴 **Taila & Ghrita** (Medicated Oils and Clarified Butter preparations)
  - 🏺 **Leha / Avaleha** (Confections & Pastes)
  - 🧪 **Mineral / Lauha / Bhasma** (Processed mineral and metallic compounds)
  - 💧 **Arka, Varti, Lavana, Kalpana**
- **Comprehensive Formulation Cards**:
  - 📜 **Classical Sanskrit Shloka & Reference**: Authentic classical verses with text attribution (*Charaka*, *Sushruta*, *Rasa Tarangini*).
  - 🌿 **Ingredients & Proportions**: Exact ingredient breakdown with quantities.
  - 🥣 **Required Apparatus**: Utensils and equipment list.
  - 📋 **Method of Preparation**: Step-by-step Standard Operating Procedures (SOPs).
  - ⚠️ **Precautions (*Savadhani*)**: Heating, handling, and safety measures.
  - ✨ **Observations & Specifications**: Target organoleptic properties (Color, Odour, Consistency, *Siddhi Lakshana*).
- **Cinema Mode Video Demonstrations**: High-definition video player modal for step-by-step physical laboratory preparation.
- **Context-Aware AI Tutor Drawer**: Dedicated sliding assistant attached directly to the active formulation.

---

### 3. 🤖 Ayurvedic AI Tutor (ChatGPT-Style UI & Conversational Intelligence)
- **ChatGPT Modern Layout**:
  - Clean sliding sidebar button ([`PanelLeft`](file:///c:/Users/jthak/OneDrive/Attachments/Desktop/ayurveda/frontend/src/components/learning/AITutor.jsx#L518-L525) / `PanelLeftClose`) with zero clutter.
  - Prominent **`+ New chat`** button and persistent history sessions under **"Recents"**.
  - Dynamic user message bubbles (`width: fit-content; max-width: 80%`) preventing text stretching.
  - Full-Page immersion toggle for focused research sessions.
- **Multi-Turn Conversational Memory**:
  - The AI maintains context across questions. When a student is viewing or discussing *Sitopaladi Churna* and asks a follow-up like *"give 5 viva questions"*, *"what is the dose?"*, or *"explain precautions"*, the AI automatically binds its response specifically to *Sitopaladi Churna*.
- **Medical & Classical Formatting**:
  - 🥇 **Ranked Badges** (`🥇`, `🥈`, `🥉`, `4️⃣`, `5️⃣`) for prioritized preparation stages and *Siddhi Lakshanas*.
  - 💡 **Left-Accent Callout Quotes** for critical clinical points and safety guidelines.
  - 🏷️ **Classical Source Citation Chips** (`[G Rasa Tarangini]`, `[G Charaka Samhita]`).
- **Interactive Action Toolbar**:
  - 📋 **One-Click Copy** to clipboard.
  - 🔊 **Read Aloud (Voice Narration)** using the Web Speech Synthesis API.
  - 👍/👎 **Feedback Rating & Regeneration**.
- **Active Wave Shimmer & Animated Search**:
  - Shimmering gradient text (*"Generating insights from classical texts"*), pulsing star glow, spinning loader, and glowing skeleton bars during live response streaming.
- **Quick Topics Sidebar**:
  - ✦ **Siddhi Lakshana** (Signs of proper completion)
  - 📖 **Shloka & Source** (Classical verse citations)
  - 🛡️ **Precautions** (Heating & handling safety)
  - 💊 **Indications & Dose** (Therapeutic uses & *Matra*)

---

### 4. ⚡ Resilient Multi-Key Failover & 3-Tier Caching System
- **High-Availability Key Rotation**: Automatically rotates across `GEMINI_KEY_1`, `GEMINI_KEY_2`, `GEMINI_KEY_3`, `GEMINI_KEY_4`, and `GEMINI_API_KEY`. If one key hits rate limits (HTTP 429) or quota exhaustion, it instantly switches to the next available key with zero student interruption.
- **Multi-Model Fallback**: Streams from `gemini-2.5-flash` first for speed, with automatic fallback to `gemini-2.5-pro`.
- **3-Tier Zero-Latency Caching**:
  1. **Tier 0 (Browser SessionStorage)**: Instant 0ms response for repeated queries with 100% token savings.
  2. **Tier 1 (Server In-Memory LRU Map)**: Rapid memory cache for frequent student inquiries.
  3. **Tier 2 (Upstash Cloud Redis)**: Distributed persistent cloud cache with 7-day TTL (604,800s).
- **Direct Client-Side Fallback**: Client-side execution via `@google/genai` if the backend server is unreachable.

---

### 5. 📊 Scholar Dashboard & Real-Time Activity Tracking (`/dashboard`)
- **Real-Time 24-Hour Activity Log**: Automatically tracks student actions:
  - 🧪 Experiments simulated in the practical lab.
  - 🤖 Questions asked to the AI Tutor.
  - 🎥 Video guides watched.
  - 📖 Formulations reviewed in the E-Library.
- **Personalized Scholar Hub**: Displays user greeting, quick access platform cards, and relative timestamps.

---

### 6. 🛡️ Faculty & Administrator Management Portal (`/admin` & `/faculty`)
- **Student Account Management**: Add student accounts, view active/disabled statuses, reset passwords, delete accounts, and search users.
- **Faculty Account Management**: Assign roles, create faculty accounts, manage credentials, and toggle access.
- **Experiment & SOP Management**: Add new classical formulations, descriptions, steps, and video URLs.
- **Inventory & Recipe Manager**: Configure raw herbs, minerals, utensils, and mixing rules.
- **Academic Integrity Lock (`isLearningBlocked`)**: Allows faculty/admins to temporarily lock the E-Library during practical examinations.
- **Exam Mode & Proctoring Review**: Review recorded video submissions from student practical lab exams.

---

## 🛠️ Complete Technical Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | **React 18** + **Vite** | Single Page Application (SPA) with hot module replacement |
| **Routing** | **React Router 6** | Role-protected routes (`ProtectedRoute`, `FacultyRoute`, `AdminRoute`) |
| **Drag & Drop** | **@dnd-kit/core** | Sensors, collision detection, and drag overlays for virtual lab workbench |
| **Styling & Design** | **Custom Vanilla CSS** | Glassmorphism design system, responsive grids, and CSS keyframe animations |
| **Icons** | **Lucide React** | Consistent iconography across library, lab, and AI tutor |
| **Audio / Speech** | **Web Speech API** | Client-side `SpeechSynthesisUtterance` for voice read-aloud |
| **Backend Runtime** | **Node.js (ES Modules)** | Modern ECMAScript modules with top-level `dotenv/config` preloading |
| **Backend Framework** | **Express.js 5** | RESTful endpoints, CORS middleware, error handling |
| **AI / LLM Engine** | **Google Gemini SDK** | `@google/genai` (`gemini-2.5-flash`, `gemini-2.5-pro`) |
| **Distributed Cache** | **Upstash Redis** | `@upstash/redis` REST SDK with 7-day TTL persistence |
| **Authentication** | **JWT (JSON Web Tokens)** | Secure token authentication in `localStorage` and Authorization headers |
| **Video Storage** | **IndexedDB / HTML5 Video** | Local video proctoring recordings and MP4 demonstration playback |

---

## 📁 Repository Directory Structure

```
ayurveda/
├── frontend/                         # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── assets/                   # Images, diagrams, and herbal scenery
│   │   ├── components/
│   │   │   ├── auth/                 # ProtectedRoute, AdminRoute, FacultyRoute
│   │   │   ├── layout/               # Navbar and Header components
│   │   │   ├── learning/             # AI Tutor component (AITutor.jsx, AITutor.css)
│   │   │   ├── practical/            # Drag & drop canvas, inventory, action panel, proctor
│   │   │   └── shared/               # TutorDrawer, VideoModal, and full-page modals
│   │   ├── contexts/                 # AuthContext, DataContext, SimulationContext
│   │   ├── data/                     # Classical experiments dataset (learningPracticals.js)
│   │   ├── pages/                    # Home, Learning, Practical, Dashboard, Admin, Faculty, Login
│   │   ├── services/                 # AI client service (gemini.js), adminService.js
│   │   ├── utils/                    # Activity tracker (activityTracker.js), db.js (IndexedDB)
│   │   ├── App.jsx                   # Application routing and providers
│   │   └── main.jsx                  # React DOM mount point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                          # Node.js + Express.js API Server
│   ├── config/                       # Upstash Redis & database configurations
│   ├── controllers/
│   │   ├── adminController.js        # Student/Faculty CRUD & SOP management
│   │   ├── aiController.js           # Multi-key failover pool, Redis & Memory caching
│   │   └── authController.js         # JWT login, register, password change
│   ├── middleware/                   # Auth & role verification middleware
│   ├── models/                       # Data stores and schemas
│   ├── routes/
│   │   ├── adminRoutes.js            # /api/admin endpoints
│   │   ├── aiRoutes.js               # POST /api/ai/tutor endpoint
│   │   └── authRoutes.js             # /api/auth endpoints
│   ├── utils/                        # Helper functions and utilities
│   ├── server.js                     # Express server entry point
│   └── package.json
│
├── README_EXPERIMENTS.md             # Formulation SOPs, classical references & scientific datasets
├── .env                              # Environment variables (API keys & Redis credentials)
└── README.md                         # Project Master Documentation
```

---

## ⚙️ Environment Variables Configuration

Create a `.env` file in the root directory (or inside `backend/` and `frontend/`):

```env
# Server Port & Environment
PORT=5000
NODE_ENV=development

# Distributed Redis Cache (Upstash)
UPSTASH_REDIS_REST_URL=https://your-upstash-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Multi-Key Gemini API Pool (Backend Failover)
GEMINI_KEY_1=AIzaSyYourKeyOne...
GEMINI_KEY_2=AIzaSyYourKeyTwo...
GEMINI_KEY_3=AIzaSyYourKeyThree...
GEMINI_KEY_4=AIzaSyYourKeyFour...
GEMINI_API_KEY=AIzaSyPrimary...

# Frontend Fallback Gemini API Keys (Vite)
VITE_GEMINI_KEY_1=AIzaSyYourKeyOne...
VITE_GEMINI_KEY_2=AIzaSyYourKeyTwo...
VITE_GEMINI_KEY_3=AIzaSyYourKeyThree...
VITE_GEMINI_KEY_4=AIzaSyYourKeyFour...
VITE_GEMINI_API_KEY=AIzaSyPrimary...
```

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v7.0.0` or higher

### 2. Installation
Install all dependencies across both frontend and backend workspaces:
```bash
npm install
```

### 3. Run Development Server
Concurrently launch both frontend and backend dev servers:
```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173` (or `http://localhost:5174`)
- **Backend API**: `http://localhost:5000`

### 4. Build for Production
```bash
# Build frontend bundle across workspace
npm run build

# Or build frontend workspace specifically
npm run build --workspace=frontend
```

---

## 📄 License & Academic Attribution

Developed for academic, clinical, and scientific research in Ayurvedic Medical Education (*BAMS*). All classical references are sourced from standard textbooks recognized by the National Commission for Indian System of Medicine (NCISM).