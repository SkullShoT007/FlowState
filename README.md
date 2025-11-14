## FlowState

Personal productivity hub that combines Tasks, Habits, Pomodoro, XP gamification, Analytics, and an AI Assistant. Built with React, Redux Toolkit, Dexie (IndexedDB), Firebase Auth/Firestore, Recharts, and Tailwind-like utility classes.

### Features
- Tasks and Habits with local persistence (IndexedDB via Dexie)
- XP system with levels and history; XP persists automatically
- Pomodoro timer with accurate countdown, auto-advance, logging, and keyboard shortcuts
- Analytics dashboard: trends, completion, difficulty, XP progress, Pomodoro stats
- AI Assistant sidebar powered by a Netlify Function calling Gemini, personalized with Firestore data
- Google Sign-In; automatic sync from IndexedDB to Firestore per user
- Daily habit reset stored in `appMeta`

### Tech Stack
- React 19, React Router, Redux Toolkit, React-Redux
- Dexie for IndexedDB, Firebase Auth + Firestore
- Recharts for charts
- Netlify Functions for serverless Gemini calls

### Project Structure
- `src/components` UI and features
  - `TaskManager`, `HabitManager`, `Pomodoro`, `analytics/*`, `AIAgentSidebar`, `Header`, `Sidebar`
  - `routes/AllRoutes.js` main routing
- `src/components/indexedDB/*` Dexie schema and data access (tasks, habits, xp, pomodoro, history, appMeta)
- `src/components/store/*` Redux slices and middlewares
- `src/firebase/*` Firebase initialization, AI service, and sync
- `src/netlify/functions/gemini.js` Netlify serverless function

### Getting Started
Prereqs: Node 18+, npm, a Firebase project, and an API key for Gemini.

1) Install
```
npm install
```

2) Environment variables
Create `.env` in project root with:
```
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=1:...:web:...

# Netlify function (server-side) env var
GEMINI_API_KEY=your_gemini_api_key
```

3) Run dev server
```
npm start
```
App runs at `http://localhost:3000`.

### Key Workflows
- Local persistence: Redux writes to Dexie via `indexedDB/*` helpers and `xpPersistenceMiddleware`
- Auto sync: `dataSyncMiddleware` debounces POSTing all IndexedDB data to a local server (`/sync-data`) and `firebase_sync.js` saves to Firestore when authenticated
- Daily habit reset: `App.js` checks `appMeta.lastHabitReset` and clears `completed` each day
- AI Assistant: `AIAgentSidebar` → `firebase/AiService.askGemini` → Netlify function `gemini.js` (Gemini API). Responses can reflect user’s Firestore data

### Pomodoro
Single-file component with:
- Modes: focus/short/long; auto-advance and cycles
- Accurate countdown using end-time math (no drift)
- Start/Pause/Reset/Skip; Space/R/S shortcuts
- Optional sound + desktop notifications
- Logs each session to IndexedDB and Redux, enabling analytics

### Analytics
Located in `src/components/analytics/*` and includes:
- Task completion and difficulty charts
- Habit trend and type charts
- XP radial + progress charts (persisted in `xp` and `xpHistory`)
- Pomodoro daily and by-mode charts

### Firebase
- `src/firebase/config.js` initializes Firebase (Auth + Firestore) from env vars
- Google Sign-In in `Header` component; auth state stored in `localStorage`
- `firebase_sync.js` consolidates IndexedDB tables and writes them to `users/{uid}` in Firestore

### Optional Local Sync Server
`dataSync.js` can POST your IndexedDB snapshot to a local server at `http://localhost:8000/sync-data` and GET from `/data`. This is optional. If unused, calls will fail harmlessly in console.

### Netlify Deployment
- `netlify.toml` sets build and functions dir: `src/netlify/functions`
- Set `GEMINI_API_KEY` in your Netlify site Environment Variables
- Deploy steps:
  1. Push to GitHub
  2. Connect repo in Netlify
  3. Add env vars (React + `GEMINI_API_KEY`)
  4. Trigger build

### Scripts
```
npm start      # run CRA dev server
npm run build  # production build to /build
npm test       # jest/react-testing-library (if tests added)
```

### Notes
- Ensure Firestore security rules restrict access to a user’s own document
- Replace the inline audio placeholder in `Pomodoro.js` if desired
- Frames in `public/Frames` are used in `Header` and unlock by XP level


