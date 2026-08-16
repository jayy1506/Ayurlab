# Ayurlab Monorepo

AI Virtual Lab for practical implementation of drug formulations in Ayurveda.

## Repository Structure

- **`frontend/`**: The React + Vite frontend application.
- **`backend/`**: The Express.js backend server.
- **`practical_experiments/`**: Scientific/practical experiment guides and references.
- **`scratch/`**: Custom data validation and helper scripts.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v7+ for workspaces support)

### Installation

To install all dependencies for both the frontend and backend projects, run the following command in the root directory:

```bash
npm install
```

### Running the Project

You can run both the frontend and backend concurrently using:

```bash
npm run dev
```

Alternatively, you can run them individually:

- **Frontend only**: `npm run dev:frontend`
- **Backend only**: `npm run dev:backend`