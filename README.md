# VedaAI

VedaAI is a full-stack web application designed to automatically generate assignments, quizzes, and question papers using AI. It leverages Google's Generative AI to process topics or documents and create comprehensive assessments in the background.

## Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Form Handling & Validation:** React Hook Form & Zod
- **Real-time Updates:** Socket.io Client
- **PDF Generation:** html2pdf.js

### Backend
- **Framework:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Message Queue & Background Jobs:** Redis, BullMQ
- **Real-time Communication:** Socket.io
- **AI Integration:** Google Generative AI SDK

## Prerequisites

Make sure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on default port `27017`)
- [Redis](https://redis.io/) (running locally on default port `6379`)

## Getting Started

### 1. Setup the Backend

Navigate to the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables (adjust as necessary):
```env
PORT=8000
GEMINI_API_KEY=your_google_generative_ai_api_key
```

Start the backend server and the worker process:
```bash
# Terminal 1: Run the API server
npm run dev

# Terminal 2: Run the background worker for AI tasks
npm run worker
```

### 2. Setup the Frontend

Navigate to the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### 3. Open the App

Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Core Features

- **Create Assignments:** Input a title, topic/document context, along with grading criteria.
- **AI-Powered Generation:** The backend worker asynchronously generates the questions using Google Gemini AI.
- **Real-Time Updates:** The UI receives live status updates via WebSockets as the AI finishes processing.
- **Export to PDF:** Download the finalized AI-generated assignments as PDF documents.
