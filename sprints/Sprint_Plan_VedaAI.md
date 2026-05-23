# Project: VedaAI Final Polish — Personal Sprint Plan

**Owner: Samarth**
**Timeline: 1 Week**

> **Project Name: VedaAI** (AI Assessment Creator)
> 
> This sprint focuses on completing the final critical features and polish for the VedaAI project. By the end of this sprint, the application will process real file uploads (PDF/Text), robustly handle AI failures, implement intelligent caching, and fully support regenerating assignments.

---

## The Goal

Transform the existing VedaAI implementation from a working prototype into a robust, production-ready full-stack application. You will handle actual file streams, parse PDF content, optimize AI requests using Redis caching, and ensure the UI gracefully handles any Gemini AI failures.

**Success Standard:**
- Upload a real PDF syllabus in the Next.js frontend.
- The backend successfully extracts the text and uses it to guide the Gemini AI.
- The `Regenerate` button triggers a fresh BullMQ job and updates the UI via WebSockets without page reload.
- Identical assignment requests immediately return a cached response from Redis instead of hitting the Gemini API.

---

## Where You Are Starting

- The Next.js frontend is built, including the Sidebar, Layout, and an Assignment Creation form.
- The Node.js + Express backend is functional with MongoDB.
- BullMQ and Redis are wired up for background jobs, and Socket.io is successfully pushing real-time updates.
- The PDF export (`html2pdf.js`) is working on the Output page.
- **Missing:** Real file uploads, functional "Regenerate" button, Redis caching, and backend AI validation.

---

## What You Ship This Sprint

| Ticket | What | Priority | Days |
|--------|------|----------|------|
| VEDA-101 | File Upload & Parsing — `multer` integration and `pdf-parse` extraction | P0 | 1-2 |
| VEDA-102 | Gemini Context Injection — Update the BullMQ worker to use file context | P0 | 1 |
| VEDA-103 | Regenerate Flow — New API endpoint and frontend hookup | P0 | 1 |
| VEDA-104 | Redis Prompt Caching — Hash inputs to save LLM costs and latency | P1 | 1 |
| VEDA-105 | AI Fallback & Validation — Zod validation for LLM JSON output | P1 | 1 |
| VEDA-106 | UI Error Boundaries — Elegant toast notifications for failures | P2 | 1 |

---

### VEDA-101: File Upload & Parsing
**Priority: P0 | Days 1-2**

The UI has a file upload field, but it doesn't send data. Implement the pipeline to extract text from user-uploaded PDFs.

**Done when:**
- The frontend converts the file to a `FormData` payload.
- The backend uses `multer` to accept the file upload on `POST /api/assignment`.
- `pdf-parse` (or a similar library) extracts the text content from the file.
- The extracted text is saved to the MongoDB `Assignment` document.

---

### VEDA-102: Gemini Context Injection
**Priority: P0 | Day 3**

Make the AI actually use the uploaded document to generate relevant questions.

**Done when:**
- The BullMQ worker reads the extracted text from the database.
- The prompt is dynamically updated to include: "Based exclusively on the following text context: [TEXT]".
- Generated questions accurately reflect the content of the uploaded PDF.

---

### VEDA-103: Regenerate Flow
**Priority: P0 | Day 4**

Replace the mock `setTimeout` on the "Regenerate" button with real logic.

**Done when:**
- `POST /api/assignment/:id/regenerate` endpoint is created.
- The endpoint clears the existing `generatedPaper`, updates status to `pending`, and queues a new BullMQ job.
- The frontend button calls this API and the UI accurately reflects the loading state via WebSockets until the new paper arrives.

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

**Tech Stack:** Next.js, Node.js, Express, MongoDB, Redis, BullMQ, Google Generative AI, `multer`, `pdf-parse`.

**Local Setup:**
Ensure your Redis and MongoDB containers/services are running locally on their default ports.
```bash
# Terminal 1
npm run dev # in backend
# Terminal 2
npm run worker # in backend
# Terminal 3
npm run dev # in frontend
```

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
