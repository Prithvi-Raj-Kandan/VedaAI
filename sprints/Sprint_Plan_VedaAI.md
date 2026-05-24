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

## Stage 2: Ship-Ready Polish

This phase turns the working prototype into a shippable product. The priorities here are visual parity with the sample output, account management, stronger user feedback, question-type coverage, history visibility, and cloud deployment readiness.

**Stage 2 Success Standard:**
- Teachers can sign up, sign in, and manage a profile/settings page.
- Previously generated assignments are easy to find and re-open.
- Output layout matches the provided sample more closely.
- The frontend-v2 visual system becomes the primary UI while preserving all current functionality.
- Waiting states stay informative all the way through backend jobs.
- Question prompts adapt per question type, including MCQ options generation.
- Every non-core page shows an intentional under-development state instead of a hard 404.
- The project is ready for cloud deployment as the final ticket.

### Proposed Stage 2 Tickets

| Ticket | What | Priority | Days |
|--------|------|----------|------|
| VEDA-107 | Assignment History — surface previously generated assignments and reopen them from the UI | P0 | 1-2 |
| VEDA-108 | Output Format Parity — match the generated paper layout to the provided sample image/markdown | P0 | 1-2 |
| VEDA-109 | Frontend-v2 Merge — use `frontend-v2` styling as the main UI and port over all existing functionality/features | P0 | 2-3 |
| VEDA-110 | Authentication + Profile/Settings — sign up, sign in, sign out, and user settings/profile page | P0 | 2 |
| VEDA-111 | Under-Development Routes — replace 404s with intentional under development pages across unfinished routes | P1 | 1 |
| VEDA-112 | Job-Linked Waiting Experience — map UI progress states to backend job milestones like parsing, drafting, and finalizing | P1 | 1-2 |
| VEDA-113 | Question-Type Prompting — use specialized system prompts per question type, including MCQ option generation | P1 | 1-2 |
| VEDA-114 | Multi-Question Coverage Testing — test the generator with all supported question categories and edge cases | P1 | 1 |
| VEDA-115 | Cloud Deployment Readiness — container strategy, environment setup, backups, and deployment plan | P2 | 1-2 |

**Reference Output:** The attached `Frame 1618872449.md` and image should be treated as the layout target for VEDA-108. The output should feel like a real school question paper: centered institution header, subject/class/time/marks block, compulsory instruction line, student information lines, section heading hierarchy, question list formatting, and a teacher-facing answer key section.

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

### VEDA-107: Assignment History
**Priority: P0 | Days 1-2**

Give users a durable history view of all generated assignments.

**Done when:**
- The UI shows previous assignments generated by the logged-in user.
- Users can reopen an assignment from history and continue from its output page.
- History respects newest-first sorting and handles empty states gracefully.

---

### VEDA-108: Output Format Parity
**Priority: P0 | Days 1-2**

Make the generated paper visually closer to the provided sample output.

**Done when:**
- The output page matches the attached reference layout more closely.
- The generated paper includes the school header, subject, class, time allowed, maximum marks, and the compulsory-instruction block.
- Student info lines, section headings, question numbering, and answer-key formatting feel exam-paper-like.
- The PDF export uses the same final paper structure and spacing.
- The sample output is reproduced with the correct hierarchy for the questions and answer key.

---

### VEDA-109: Frontend-v2 Merge
**Priority: P0 | Days 2-3**

Use the `frontend-v2` folder as the visual baseline while preserving the current working features.

**Progress Update:**
- The v2 create flow now posts to the backend assignment endpoint and routes to the generated output screen.
- The sidebar and assignments page create actions now navigate to `/create`.
- The output screen now supports regenerate, version selection, and PDF export in the v2 UI.
- The create form now matches the v1 data contract: target marks, passing marks, full question-type list, date picker, and `questions` payload.
- The new `/assignments/[id]` route restores the intermediate waiting/generation screen instead of skipping directly to output.
- The home page is now a simple landing page and no longer reuses the assignments list UI.
- The output page now renders a paper-like layout with the test metadata and student information lines instead of the rounded preview card.
- The create form no longer shows the premature success toast, the marks inputs start empty, the stepper/counter controls are removed, and the loading page shows explicit completion ticks.

**Done when:**
- The `frontend-v2` CSS/layout language becomes the primary UI.
- Existing functionality from the original frontend is copied over intact.
- Extra features like regeneration, version control, sockets, and export remain functional.

---

### VEDA-110: Authentication + Profile
**Priority: P0 | Days 2**

Add account management so users can own their assignment history.

**Done when:**
- Users can sign up and sign in.
- A profile/settings page exists.
- Authentication state gates access to the main product flows.

---

### VEDA-111: Under-Development Routes
**Priority: P1 | Day 1 | ✅ COMPLETE**

Replace unfinished 404 paths with intentional product messaging.

**Done when:**
- Unfinished pages display an under development message.
- Users are not dropped into generic 404 pages for planned areas.

**Implementation Details:**
- Created reusable `UnderDevelopment.tsx` component with Hammer icon, feature name, custom message, and "Go Back" button.
- Created stub pages for planned routes: `/settings`, `/dashboard`, `/help`, `/about`.
- Each page has appropriate messaging (Profile & Settings, Dashboard, Help & Documentation, About VedaAI).
- All routes compile successfully and render the under-development UX instead of 404s.

**Completed Artifacts:**
- `frontend/src/components/UnderDevelopment.tsx` — Reusable component
- `frontend/src/app/settings/page.tsx` — Profile/Settings (for VEDA-110)
- `frontend/src/app/dashboard/page.tsx` — User dashboard
- `frontend/src/app/help/page.tsx` — Help documentation
- `frontend/src/app/about/page.tsx` — About VedaAI

---

### VEDA-112: Job-Linked Waiting Experience
**Priority: P1 | Days 1-2**

Make the waiting screen reflect backend work more precisely.

**Done when:**
- The UI updates through stages like PDF processed, questions drafted, sections finalized, and paper saved.
- These milestones map to backend job progress rather than a single spinner state.
- The user gets the sense that the system is actively working.

---

### VEDA-113: Question-Type Prompting
**Priority: P1 | Days 1-2**

Make the system prompt aware of different question types.

**Done when:**
- Different question types influence the prompt strategy.
- MCQ output includes generated options.
- The paper respects the intended structure for each question category.

---

### VEDA-114: Multi-Question Coverage Testing
**Priority: P1 | Day 1**

Stress-test generation across all supported question categories.

**Done when:**
- The generator is tested with MCQ, short answer, long answer, numerical, diagram/graph, case study, and true/false flows.
- Edge cases are checked for malformed or incomplete outputs.
- Prompt behavior is validated against multiple input combinations.

---

### VEDA-115: Cloud Deployment Readiness
**Priority: P2 | Days 1-2**

Prepare the app for cloud deployment as the final ticket in this phase.

**Done when:**
- The deployment architecture is documented.
- Redis and MongoDB deployment strategy is decided for cloud use.
- Environment variables, build steps, and runtime services are clear.
- The app is ready to be deployed after this ticket is completed.

**Cloud note:** For production, MongoDB and Redis should preferably be managed services rather than ad hoc containers unless the cloud setup includes persistent storage, backups, scaling, and monitoring.

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
5. **Shipping Readiness:** Completing the second phase proves the app can move from working prototype to a polished, deployable product.

---

## Demo Script

1. **The Setup:** Open the VedaAI frontend and have your Redis CLI ready.
2. **The Upload:** Create a new assignment and upload a sample PDF (e.g., a syllabus on "Photosynthesis").
3. **The Generation:** Show the UI loading state powered by WebSockets, followed by the appearance of AI questions specifically about Photosynthesis.
4. **The Cache Hit:** Generate a second assignment with the exact same inputs. Show that it resolves almost instantly because it hit the Redis cache.
5. **The Regenerate:** Click "Regenerate" and prove that the paper updates seamlessly.
