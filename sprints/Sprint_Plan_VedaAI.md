# Project: VedaAI Build Plan — Personal Sprint Plan

**Owner: Samarth**
**Timeline: 1 Week**

> **Project Name: VedaAI** (AI Assessment Creator)
>
> This sprint focuses on turning the current prototype into a complete assignment-generation system built around three primary tracks: assignment creation, AI question generation, and the backend orchestration layer.

---

## The Goal

Transform the existing VedaAI implementation from a working prototype into a robust, production-ready full-stack application. The build should support file-aware assignment creation, structured AI generation, and a reliable backend pipeline with queues, caching, and real-time updates.

**Success Standard:**
- Create an assignment from the frontend with validation, optional file upload, and websocket-driven state.
- Generate a structured paper from the input, including sections, questions, difficulty, and marks.
- Persist assignments and generated results in MongoDB.
- Queue generation jobs through BullMQ and notify the frontend in real time.
- Cache repeated AI requests in Redis so identical inputs return quickly.

---

## Three Core Tracks

### 1. Assignment Creation (Frontend)

Build the teacher-facing form with:
- File upload for PDF/text input, optional.
- Due date.
- Question types.
- Number of questions and marks.
- Additional instructions.

Requirements:
- Proper validation for empty and negative values.
- Zustand or Redux state management.
- WebSocket state management for assignment progress.

### 2. AI Question Generation

Convert the assignment input into a structured prompt and generate:
- Sections such as A, B, and so on.
- Questions inside each section.
- Difficulty labels: easy, medium, hard.
- Marks per question.

Requirements:
- Do not render raw LLM output directly.
- Parse and validate the model output before storing it.
- Use the uploaded file context when available.

### 3. Backend System

Build the infrastructure layer with:
- MongoDB for assignments and generated results.
- Redis for caching and queue state.
- BullMQ for background generation jobs.
- Socket.io for live status updates.

Flow:
1. API request comes in.
2. Job is added to BullMQ.
3. Worker processes the assignment.
4. Result is stored in MongoDB.
5. Frontend is notified over WebSocket.

## Where You Are Starting

- The Next.js frontend already has a landing page, assignments page, create page, and output page.
- Zustand is already wired for socket and assignment state.
- The Node.js + Express backend already has MongoDB, BullMQ, Redis, and Socket.io wiring.
- The PDF export on the output page is working.
- **Still missing:** real file parsing, prompt caching, regenerate API flow, strong AI validation, and polished error handling.

---

## What You Ship This Sprint

| Ticket | What | Priority | Days |
|--------|------|----------|------|
| VEDA-101 | Assignment Creation Form — file upload, validation, Zustand, socket state | P0 | 1-2 |
| VEDA-102 | AI Prompt Generation — structured prompt + section/question output | P0 | 1 |
| VEDA-103 | Backend Job Flow — queue, worker, store result, notify frontend | P0 | 1 |
| VEDA-104 | Redis Prompt Caching — hash inputs to save LLM costs and latency | P1 | 1 |
| VEDA-105 | AI Fallback & Validation — Zod validation for LLM JSON output | P1 | 1 |
| VEDA-106 | UI Error Boundaries — toast notifications for failures | P2 | 1 |

---

### VEDA-101: Assignment Creation Form
**Priority: P0 | Days 1-2**

The frontend form must capture teacher input cleanly and safely.

**Done when:**
- The frontend form includes all requested fields.
- Validation blocks empty values and negative counts.
- Zustand handles the assignment and websocket state.
- File upload is ready to send in `FormData`.

---

### VEDA-102: AI Prompt Generation
**Priority: P0 | Day 3**

Convert assignment input into a structured model prompt.

**Done when:**
- The worker builds a sectioned prompt from title, instructions, question config, and file context.
- The prompt instructs the LLM to return sections, questions, difficulty, and marks.
- The generated structure matches the output page format.

---

### VEDA-103: Backend Job Flow
**Priority: P0 | Day 4**

Make the backend orchestrate the generation pipeline end to end.

**Done when:**
- `POST /api/assignment` creates the assignment document.
- A BullMQ job is queued for generation.
- The worker saves the generated result in MongoDB.
- Socket.io notifies the frontend when the status changes.

---

### VEDA-104: Redis Prompt Caching
**Priority: P1 | Day 5**

Implement the "Better caching" bonus requirement.

**Done when:**
- Before hitting the Gemini API, the worker creates a deterministic hash of the (Title + File Context + Questions Config).
- The worker checks Redis for this hash. If found, it immediately returns the cached JSON.
- If not found, it generates the paper via Gemini, then caches the successful JSON response in Redis with a TTL (e.g., 24 hours).

---

### VEDA-105: AI Fallback & Validation
**Priority: P1 | Day 6**

LLMs are unpredictable. Ensure your backend doesn't crash or save corrupted data if Gemini returns invalid JSON.

**Done when:**
- Use a `try/catch` around `JSON.parse(text)`.
- Use a `Zod` schema in the worker to validate that the parsed JSON strictly matches the expected `{ sections: [...] }` structure.
- If it fails validation, log the error and mark the job status as `failed` (which the UI will catch).

---

### VEDA-106: UI Error Boundaries
**Priority: P2 | Day 7**

Improve the UX by replacing native browser alerts with polished notifications.

**Done when:**
- A toast notification library (like `sonner` or `react-hot-toast`) is installed.
- Creation failures, file upload errors, and WebSocket disconnection events trigger elegant toast notifications.

---

## Environment & Setup

**Tech Stack:** Next.js, Node.js, Express, MongoDB, Redis, BullMQ, Google Generative AI, Zustand, Socket.io, `multer`, `pdf-parse`, `zod`, `html2pdf.js`.

**Local Setup:**
Use Docker to start MongoDB and Redis, then run the backend and frontend separately.

```bash
# Start infrastructure
docker compose up -d

# Backend
cd backend
npm install
npm run dev

# Worker
cd backend
npm run worker

# Frontend
cd frontend
npm install
npm run dev
```

**Environment Variables:**
- `backend/.env` should contain `PORT`, `MONGODB_URI`, `REDIS_HOST`, `REDIS_PORT`, and `GEMINI_API_KEY`.
- Use the example files in the repo as templates.

---

## Why This Matters — For Your Portfolio

By completing these features, you are demonstrating:
1. **End-to-End File Handling:** Processing binary streams to text extraction is a highly practical full-stack skill.
2. **LLM Orchestration:** You aren't just calling an API; you are safely handling its output, validating schemas, and injecting context.
3. **Performance Optimization:** Implementing an intelligent Redis caching layer proves you care about costs, latency, and system efficiency.
4. **Resilience:** Building real-time state resets (Regenerate) and error boundaries shows product-minded engineering.

---

## Demo Script

1. **The Setup:** Open the VedaAI frontend and have your Redis CLI ready.
2. **The Upload:** Create a new assignment and upload a sample PDF (e.g., a syllabus on "Photosynthesis").
3. **The Generation:** Show the UI loading state powered by WebSockets, followed by the appearance of AI questions specifically about Photosynthesis.
4. **The Cache Hit:** Generate a second assignment with the exact same inputs. Show that it resolves almost instantly because it hit the Redis cache.
5. **The Regenerate:** Click "Regenerate" and prove that the paper updates seamlessly.
