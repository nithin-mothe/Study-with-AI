# AI Study Companion

Production-oriented foundation for an AI-powered adaptive learning platform.

## Apps

- `frontend`: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Zustand, Firebase Auth.
- `backend`: Node.js Express, TypeScript, Firebase Admin/Firestore, Groq LLM API.

## Local Development

1. Copy `frontend/.env.example` to `frontend/.env.local`.
2. Copy `backend/.env.example` to `backend/.env`.
3. Install dependencies in both folders.
4. Start the backend on port `4000`.
5. Start the frontend on port `3000`.

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

## API Contract

- `POST /api/explain`
- `POST /api/learn/start`
- `POST /api/learn/next`
- `POST /api/quiz`
- `POST /api/quiz/submit`
- `GET /api/dashboard`
- `GET /api/progress`
- `POST /api/progress`

All API routes require `Authorization: Bearer <Firebase ID token>`.

## Phase 2 Features

- Groq-backed structured AI outputs with JSON validation, one retry, memory caching, and safe fallbacks.
- Micro-learning sessions with step navigation, examples, quick questions, and simpler explanation mode.
- Adaptive quiz difficulty based on topic accuracy.
- Immediate answer feedback with retry guidance and follow-up explanations.
- Gamification with XP, daily streaks, and levels: Beginner, Intermediate, Pro, Titan.
- Dashboard recommendations based on weak topics and current performance.

## Final-Phase Readiness

- `DEMO_MODE=true` enables Firebase-free demo auth and in-memory demo progress/quizzes.
- Common demo topics such as `Neural Networks`, `Photosynthesis`, and `Bayes theorem` use preloaded AI responses for instant, predictable walkthroughs.
- Backend requests are protected with input sanitization, rate limiting, request timeouts, and structured logging.
- Dashboard insights include accuracy, weak topics, strong topics, daily goal progress, XP, streak, and achievement badges.
- Frontend route panels are lazy-loaded with skeleton fallbacks and 200-300ms micro-interactions.

## Demo Walkthrough

1. Start the backend with `DEMO_MODE=true`.
2. Start the frontend with `NEXT_PUBLIC_DEMO_MODE=true`.
3. Open `/dashboard`, then click `Start recommended lesson`.
4. Complete one micro-learning step, then open `/quiz`.
5. Answer a question to show instant feedback, XP, streak, and dashboard updates.

## Security Notes

- Frontend and backend production dependency audits currently pass with `0 vulnerabilities`.
- Firebase Admin transitive Google Cloud packages are pinned through npm overrides to patched versions; run the verification matrix before changing those overrides.
- Never commit `.env`, `.env.local`, Firebase private keys, or Groq API keys.
