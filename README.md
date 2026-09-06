# Ayurlab - AI-Powered Ayurvedic Virtual Laboratory & Research Platform 🌿🔬

> **A Next-Generation Digital Laboratory and AI Tutor for BAMS Medical Students, Researchers, and Practitioners in *Rasashastra & Bhaishajya Kalpana* (Ayurvedic Pharmaceutical Sciences).**

---

## 📖 Executive Summary

**Ayurlab** is an immersive, full-stack educational and simulation platform that bridges classical Ayurvedic pharmaceutical knowledge with cutting-edge artificial intelligence and modern web engineering. 

Traditional Ayurvedic drug manufacturing requires strict adherence to classical texts (*Charaka Samhita*, *Sushruta Samhita*, *Rasa Tarangini*, *Sharangadhara Samhita*), precise heating temperatures (*Agni Pariksha*), multi-stage purification (*Shodhana*), and specific observation of completion signs (*Siddhi Lakshana*). Ayurlab replicates these physical laboratory environments digitally, pairing them with an intelligent, context-aware AI Tutor that guides students in real time.

---

## 🏛️ System Architecture Overview

```
                          ┌─────────────────────────────────────────────────────────┐
                          │               AYURLAB CLIENT (React 18 + Vite)           │
                          ├─────────────────────────────────────────────────────────┤
                          │  • Practical Virtual Lab (Simulations & Video Guides)   │
                          │  • Theory Hub & Viva Assessment System                 │
                          │  • Dashboard & Real-Time Student Activity Tracker       │
                          │  • Faculty / Admin Management Portal                    │
                          │  • Ayurvedic AI Tutor (ChatGPT-Style UI & Audio TTS)   │
                          │  • Tier 0 Cache: Browser SessionStorage (0ms Latency)   │
                          └────────────────────────────┬────────────────────────────┘
                                                       │
                                        HTTPS / REST API Requests
                                                       │
                                                       ▼
                          ┌─────────────────────────────────────────────────────────┐
                          │               EXPRESS.JS BACKEND ENGINE (Node ESM)      │
                          ├─────────────────────────────────────────────────────────┤
                          │  • Auth & Role-Based Access Control (Admin/Faculty/User)│
                          │  • AI Multi-Key Failover Router (/api/ai/tutor)         │
                          │  • Tier 1 Cache: In-Memory Fast LRU (7-Day TTL)         │
                          │  • Request Validation & Anti-Spam Rate Limiting         │
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

## ✨ Complete Feature Breakdown

### 1. 🤖 Ayurvedic AI Tutor (ChatGPT Experience & Conversational Memory)
- **ChatGPT-Style Sliding UI**: Minimalist header with sliding icon toggle button (`PanelLeft`), prominent `+ New chat` CTA, and persistent chat sessions under **"Recents"**.
- **Multi-Turn Conversational Memory**: Full context retention across questions. If a user discusses *Sitopaladi Churna* and asks a follow-up like *"give 5 viva questions"*, *"what is its dosage?"*, or *"explain precautions"*, the AI automatically scopes the answer to *Sitopaladi Churna*.
- **Medical & Classical Formatting**:
  - 🥇 **Ranked Badges**: Ranked breakdown of compounding stages, Lakshanas, and formulation steps.
  - 📜 **Classical Citation Chips**: Embedded references to classical textbooks (*Rasa Tarangini*, *Charaka Samhita*).
  - 💡 **Left-Accent Callout Quotes**: Highlighting crucial safety precautions (*Savadhani*) and classical insights.
- **Built-in Action Toolbar**:
  - 📋 **Copy to Clipboard** with instant toast feedback.
  - 🔊 **Voice Narration (Text-to-Speech)** using the Web Speech API.
  - 👍/👎 **Feedback Rating & Regeneration**: Allows students to regenerate or rate explanations.
- **Active Search Wave & Shimmer Effects**: Dynamic gradient text shimmer, glowing sparkle icon, spinning loader, and animated skeleton bars during inference.
- **Quick Topics Sidebar**: One-click quick prompts for *✦ Siddhi Lakshana*, *📖 Shloka & Source*, *🛡️ Precautions*, and *💊 Indications & Dose*.
- **Immersion Modes**: Switchable between side-drawer widget and full-page focused workspace.

---

### 2. ⚡ Resilient Multi-Key Failover & 3-Tier Caching System
- **High-Availability Key Rotation**: Automatically rotates across `GEMINI_KEY_1`, `GEMINI_KEY_2`, `GEMINI_KEY_3`, `GEMINI_KEY_4`, and `GEMINI_API_KEY`. If one key encounters a `429 Rate Limit` or `Quota Exhausted`, the engine seamlessly fails over to the next key without interrupting the student.
- **Multi-Model Fallback**: Automatically tries `gemini-2.5-flash` first for blazing-fast streaming, falling back to `gemini-2.5-pro` if needed.
- **3-Tier Zero-Latency Caching**:
  1. **Tier 0 (Browser Cache)**: Repeated queries load instantly in `0ms` with 100% token savings.
  2. **Tier 1 (Server LRU In-Memory)**: High-speed local cache for frequent student questions.
  3. **Tier 2 (Upstash Redis Persistent Cache)**: Distributed 7-day TTL caching across cloud deployments.
- **Direct Client-Side Fallback**: Direct client execution via `@google/genai` if the backend server is temporarily unreachable.

---

### 3. 🧪 Practical Virtual Lab (Simulations & Video Guides)
- **Interactive Formulations**: Step-by-step pharmaceutical workflows for classical formulations including:
  - *Sitopaladi Churna* (Pulverization, Sieve Standard #85, Sugar Matrix Ratio).
  - *Hingwastaka Churna* (Ghee-fried Hingu preparation, Deepana-Pachana ratios).
  - *Agnitundi Vati* (Purified Shuddha Kupilu, Shodhana, Bhavana cycles).
- **Synchronized Video Demonstrations**: High-definition video guides with interactive checkpoints, component ratios, and practical lab tests.
- **Safety & Quality Control**: Real-time validation of *Agni* heating stages, moisture limits, and storage standards.

---

### 4. 📚 Theory Hub, Viva & Assessment Modules
- **Classical Sanskrit Shloka Repository**: Authentic Sanskrit verses with English transliteration, literal meaning, and clinical significance.
- **Viva-Voce Question Bank**: Interactive Q&A for BAMS university practical examinations.
- **Formulation Cards**: Detailed breakdown of *Rasa*, *Guna*, *Virya*, *Vipaka*, *Prabhava*, *Dose*, and *Anupana* (adjuvants).

---

### 5. 📊 Student Dashboard & Real-Time Activity Tracking
- **Activity Tracker**: Automatically records student lab interactions, questions asked to AI, experiments simulated, and quizzes completed.
- **Personalized Analytics**: Visual progress charts, recent session history, and time-spent metrics.

---

### 6. 🛡️ Faculty & Administrator Portal
- **Student Progress Monitoring**: Faculty can view batch analytics, completion percentages, and lab performance.
- **Lab & Experiment Management**: Dynamic configuration of formulation guides and video attachments.
- **User & Role Management**: Multi-tier role permissions (**Admin**, **Faculty**, **Student**) with secure JWT authentication.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend UI** | React 18, Vite, React Router 6, Lucide Icons, Custom Vanilla CSS Design System |
| **State & Storage** | React Hooks, HTML5 SessionStorage / LocalStorage, Web Speech API |
| **Backend API** | Node.js (ES Modules), Express.js, CORS, Dotenv |
| **AI & LLM** | Google Gemini SDK (`@google/genai`), Google Gemini 2.5 Flash / Pro |
| **Database & Cache** | Upstash Redis (Cloud REST SDK), In-Memory LRU Cache |
| **Security & Auth** | JSON Web Tokens (JWT), Password Hashing, Multi-Key Dynamic Obfuscation |

---

## 📁 Repository Directory Structure

```
ayurveda/
├── frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── assets/                   # Images, diagrams, and herbal scenery
│   │   ├── components/
│   │   │   ├── auth/                 # Login & authentication modals
│   │   │   ├── layout/               # Header, Footer, and Navbar
│   │   │   ├── learning/             # AI Tutor (AITutor.jsx, AITutor.css)
│   │   │   ├── practical/            # Lab simulation canvases & video player
│   │   │   └── shared/               # TutorDrawer, Modals, Full-Page wrappers
│   │   ├── contexts/                 # Auth & global state contexts
│   │   ├── data/                     # Classical experiments, Shlokas & datasets
│   │   ├── pages/                    # Home, Practical, Learning, Dashboard, Admin, Faculty, Help
│   │   ├── services/                 # AI Client & Multi-Tier Cache (gemini.js)
│   │   ├── utils/                    # Activity tracker & helper utilities
│   │   ├── App.jsx                   # Application routing and theme provider
│   │   └── main.jsx                  # React DOM entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                          # Express.js REST API Server
│   ├── controllers/
│   │   ├── adminController.js        # Admin & student management logic
│   │   ├── aiController.js           # Multi-Key Failover, Redis & Memory Caching
│   │   └── authController.js         # JWT Auth, Register, Login & Password Reset
│   ├── routes/
│   │   ├── adminRoutes.js            # Admin REST endpoints
│   │   ├── aiRoutes.js               # POST /api/ai/tutor endpoint
│   │   └── authRoutes.js             # Authentication endpoints
│   ├── server.js                     # Main server entry with ESM dotenv preloading
│   └── package.json
│
├── practical_experiments/            # Laboratory documentation, SOPs & references
├── .env                              # Environment variables (API keys & Redis credentials)
└── README.md                         # Master Documentation
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory (or respective `backend/` and `frontend/` folders):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Distributed Redis Cache (Upstash)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

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

## 🚀 Installation & Local Development

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v7.0.0 or higher

### 2. Install Dependencies
```bash
# Install dependencies for both frontend and backend workspaces
npm install
```

### 3. Run the Development Server
```bash
# Concurrently launch both frontend and backend
npm run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:5173` (or `http://localhost:5174`)
- **Backend API**: `http://localhost:5000`

### 4. Build for Production
```bash
# Build frontend bundle
npm run build:frontend

# Build & test full monorepo
npm run build
```

---

## 🧪 AI Prompt Engineering & Safety Boundaries

The AI Tutor is governed by strict domain-specific prompt engineering:
- **Domain Confinement**: Strictly restricted to Ayurveda, herbal medicine, traditional compounding (*Bhaishajya Kalpana & Rasashastra*), and laboratory chemistry. Unrelated inquiries are gracefully filtered out.
- **Safety & Toxicity Alerts**: Formulations involving Schedule E-1 poisonous herbs (*Visha/Upavisha* such as *Vatsanabha*, *Kupilu*, *Bhallataka*) or heavy metals (*Parad*, *Gandhak*, *Abhrak*) mandate explicit purification warnings (*Shodhana* prerequisites).
- **Context Preservation**: Multi-turn history is analyzed to dynamically inject previous formulation context into single-phrase follow-up questions.

---

## 👥 Contributors & Acknowledgements

Developed for academic and clinical research in Ayurvedic Medical Education, empowering students and researchers with cutting-edge digital pharmaceutical simulation.

---

## 📄 License

This project is licensed for educational, institutional, and research use.