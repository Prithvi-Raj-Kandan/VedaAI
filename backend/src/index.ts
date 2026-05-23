import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import Assignment from './models/Assignment.js';
import { Queue } from 'bullmq';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';

dotenv.config();

const apiLog = (event: string, data?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[api][${timestamp}] ${event}`, data);
  } else {
    console.log(`[api][${timestamp}] ${event}`);
  }
};

const app = express();
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT || 6379);
const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedaai';

const httpServer = createServer(app);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Since package.json has "type": "module" and we are compiling with tsc,
// we might need to be careful with extensions. But ts-node can handle it.
const AIGenerationQueue = new Queue('AIGenerationQueue', {
  connection: { host: redisHost, port: redisPort }
});

mongoose.connect(mongodbUri)
    .then(() => {
    apiLog('MongoDB connected', { mongodbUri });
    })
    .catch((err) => {
    apiLog('MongoDB connection failed', { error: err instanceof Error ? err.message : String(err) });
    });

app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  const startedAt = Date.now();
  const requestId = Math.random().toString(36).slice(2, 10);
  (req as any).requestId = requestId;

  apiLog('Request started', {
    requestId,
    method: req.method,
    path: req.path,
    contentType: req.headers['content-type'] || 'unknown'
  });

  res.on('finish', () => {
    apiLog('Request finished', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt
    });
  });

  next();
});

io.on("connection", (socket) => {
  apiLog('Socket connected', { socketId: socket.id });
  
  socket.on("joinAssignment", (assignmentId) => {
    socket.join(assignmentId);
    apiLog('Socket joined assignment room', { socketId: socket.id, assignmentId });
  });

  socket.on("disconnect", () => {
    apiLog('Socket disconnected', { socketId: socket.id });
  });
});

const redisSub = new Redis({ host: redisHost, port: redisPort });
const redisPub = new Redis({ host: redisHost, port: redisPort });
redisSub.subscribe('assignment-updates');
redisSub.on('message', (channel: string, message: string) => {
  if (channel === 'assignment-updates') {
    try {
      const data = JSON.parse(message);
      apiLog('Redis update received', {
        channel,
        assignmentId: data.assignmentId,
        status: data.status
      });
      io.to(data.assignmentId).emit('assignment-updated', data);
    } catch (e) {
      apiLog('Failed to parse redis message', {
        channel,
        error: e instanceof Error ? e.message : String(e)
      });
    }
  }
});

// Pass io to request object so we can use it in routes if needed (though we will emit from worker or webhook)
app.set('io', io);

app.get("/health", (req, res) => {
    res.status(200).json({ message: " ok" });
});

app.post("/api/assignment", upload.single('materialFile'), async (req, res) => {
    try {
    const requestId = (req as any).requestId;
        const title = req.body.title;
        const documentUrl = req.body.documentUrl;
        const dueDate = req.body.dueDate;
        const totalMarks = Number(req.body.totalMarks);
        const passingMarks = Number(req.body.passingMarks);
        const additionalInfo = req.body.additionalInfo;

        let questions = req.body.questions;
        if (typeof questions === 'string') {
          try {
            questions = JSON.parse(questions);
          } catch {
            return res.status(400).json({ message: 'Invalid questions payload. Expected JSON array.' });
          }
        }

        const normalizedQuestions = (questions || []).map((q: any) => {
          const totalQuestions = Number(q.totalQuestions || 0);
          const marksPerQuestion = Number(q.marksPerQuestion ?? q.totalMarks ?? 0);
          return {
            questionType: q.questionType,
            totalQuestions,
            marksPerQuestion,
            sectionTotalMarks: totalQuestions * marksPerQuestion,
            // Keep legacy key for backward compatibility with existing worker prompts and historical docs.
            totalMarks: marksPerQuestion,
          };
        });

        let extractedText = '';
        if (req.file) {
          apiLog('Material file received', {
            requestId,
            fileName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size
          });

          if (req.file.mimetype === 'application/pdf') {
            const parser = new PDFParse({ data: req.file.buffer });
            const parsed = await parser.getText();
            extractedText = parsed.text?.trim() || '';
            await parser.destroy();
          } else if (req.file.mimetype === 'text/plain') {
            extractedText = req.file.buffer.toString('utf-8').trim();
          } else {
            apiLog('Unsupported upload type', {
              requestId,
              mimeType: req.file.mimetype
            });
            return res.status(400).json({ message: 'Unsupported file type. Please upload PDF or TXT files.' });
          }

          apiLog('Material file parsed', {
            requestId,
            extractedTextLength: extractedText.length
          });
        } else {
          apiLog('No material file uploaded for assignment', { requestId });
        }

        const assignment = await Assignment.create({
            title,
            documentURl: documentUrl,
            fileContext: extractedText || undefined,
            uploadedFile: req.file ? {
              originalName: req.file.originalname,
              mimeType: req.file.mimetype,
              size: req.file.size,
            } : undefined,
            dueDate,
            totalMarks,
            passingMarks,
            questions: normalizedQuestions,
            additionalInfo,
            status: 'pending',
            generatedPaperVersions: []
        });

        apiLog('Assignment created', {
          requestId,
          assignmentId: String(assignment._id),
          hasFileContext: Boolean(assignment.fileContext),
          fileContextLength: assignment.fileContext?.length || 0,
          status: assignment.status
        });
        
        await AIGenerationQueue.add("generate-paper", {
            assignmentId: assignment._id,
        });

        apiLog('Job queued', {
          requestId,
          assignmentId: String(assignment._id),
          queueName: 'AIGenerationQueue',
          jobName: 'generate-paper'
        });
        
        res.status(201).json({ message: "assignment created successfully", assignment });
    }
    catch (error) {
        apiLog('Create assignment failed', {
          error: error instanceof Error ? error.message : String(error)
        });
        res.status(500).json({ message: "internal server error" });
    }
});

// Endpoints to get assignment data
app.get("/api/assignment/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/assignments", async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  apiLog('Server listening', { port: PORT, redisHost, redisPort });
});

app.post('/api/assignment/:id/regenerate', async (req, res) => {
  try {
    const requestId = (req as any).requestId;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.status = 'pending';
    await assignment.save();

    await AIGenerationQueue.add('generate-paper', {
      assignmentId: assignment._id,
      source: 'regenerate'
    });

    apiLog('Regeneration queued', {
      requestId,
      assignmentId: String(assignment._id),
      source: 'regenerate'
    });

    res.status(202).json({ message: 'Regeneration queued', assignment });
  } catch (error) {
    apiLog('Regenerate failed', {
      assignmentId: req.params.id,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/assignment/:id/versions', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).select('generatedPaperVersions activeVersion');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const versions = [...(assignment.generatedPaperVersions || [])].sort((a, b) => b.versionNumber - a.versionNumber);
    res.status(200).json({
      activeVersion: assignment.activeVersion,
      versions
    });
  } catch (error) {
    apiLog('Versions fetch failed', {
      assignmentId: req.params.id,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/assignment/:id/versions/:versionNumber/restore', async (req, res) => {
  try {
    const versionNumber = Number(req.params.versionNumber);
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const versionToRestore = assignment.generatedPaperVersions.find((v) => v.versionNumber === versionNumber);
    if (!versionToRestore) {
      return res.status(404).json({ message: 'Version not found' });
    }

    assignment.generatedPaper = versionToRestore.generatedPaper;
    assignment.activeVersion = versionNumber;
    assignment.status = 'completed';
    await assignment.save();

    const payload = {
      assignmentId: assignment._id,
      status: 'completed',
      assignment
    };
    await redisPub.publish('assignment-updates', JSON.stringify(payload));

    apiLog('Version restored', {
      assignmentId: String(assignment._id),
      restoredVersion: versionNumber,
      status: assignment.status
    });

    res.status(200).json({ message: 'Version restored', assignment });
  } catch (error) {
    apiLog('Restore version failed', {
      assignmentId: req.params.id,
      versionNumber: req.params.versionNumber,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ message: 'Internal server error' });
  }
});