import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './models/User.js';
import Assignment from './models/Assignment.js';
import { Queue } from 'bullmq';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import multer from 'multer';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

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
const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedaai';
const defaultUserEmail = process.env.VEDAAI_DEFAULT_USER_EMAIL || 'teacher@vedaai.local';
const defaultUserDisplayName = process.env.VEDAAI_DEFAULT_USER_NAME || 'Demo Teacher';
const passwordKeyLength = 64;
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));
const corsOrigin = allowedOrigins.includes('*') ? true : allowedOrigins;

const resolveRedisUrl = () => {
  return process.env.REDISCLOUD_URL || process.env.REDIS_URL || process.env.REDIS_TLS_URL || process.env.UPSTASH_REDIS_URL || '';
};

const parsePdfBuffer = async (buffer: Buffer) => {
  const pdfParseModule = await import('pdf-parse');
  const Parser = (pdfParseModule as any).PDFParse || (pdfParseModule as any).default;

  if (!Parser) {
    throw new Error('pdf-parse export not found');
  }

  if (Parser.name === 'PDFParse') {
    const parser = new Parser({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy?.();
    return parsed.text?.trim() || '';
  }

  const parsed = await Parser(buffer);
  return parsed.text?.trim() || '';
};

const buildRedisOptions = () => {
  const redisUrlValue = resolveRedisUrl();

  if (redisUrlValue) {
    const redisUrl = new URL(redisUrlValue);
    return {
      username: redisUrl.username || 'default',
      host: redisUrl.hostname,
      port: Number(redisUrl.port || 6379),
      password: redisUrl.password || undefined,
      tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
    };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Redis config is missing. Set REDISCLOUD_URL, REDIS_URL, REDIS_TLS_URL, or UPSTASH_REDIS_URL in production.');
  }

  return {
    username: process.env.REDIS_USERNAME || 'default',
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    maxRetriesPerRequest: null,
  };
};

const httpServer = createServer(app);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});
const io = new Server(httpServer, {
  cors: {
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) {
        return callback(null, true);
      }

      const normalizedOrigin = requestOrigin.replace(/\/$/, '');
      if (corsOrigin === true || allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${requestOrigin}`));
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

const redisOptions = buildRedisOptions();

// Since package.json has "type": "module" and we are compiling with tsc,
// we might need to be careful with extensions. But ts-node can handle it.
const AIGenerationQueue = new Queue('AIGenerationQueue', { connection: redisOptions });

mongoose.connect(mongodbUri)
    .then(() => {
    apiLog('MongoDB connected', { mongodbUri });
    })
    .catch((err) => {
    apiLog('MongoDB connection failed', { error: err instanceof Error ? err.message : String(err) });
    });

app.use(cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) {
      return callback(null, true);
    }

    const normalizedOrigin = requestOrigin.replace(/\/$/, '');
    if (corsOrigin === true || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${requestOrigin}`));
  },
  credentials: true
}));

app.use(express.json());

const resolveCurrentUser = async (req: express.Request) => {
  const explicitUser = await resolveCurrentUserFromHeaders(req);
  if (explicitUser) {
    return explicitUser;
  }

  const email = defaultUserEmail;
  const displayName = defaultUserDisplayName;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return existingUser;
  }

  return User.create({ email, displayName });
};

const resolveCurrentUserFromHeaders = async (req: express.Request) => {
  const explicitUserId = req.header('x-user-id')?.trim();
  const explicitEmail = req.header('x-user-email')?.trim().toLowerCase();
  const explicitName = req.header('x-user-name')?.trim();

  if (explicitUserId) {
    const user = await User.findById(explicitUserId);
    if (user) {
      return user;
    }
  }

  const email = explicitEmail || defaultUserEmail;
  const displayName = explicitName || defaultUserDisplayName;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return existingUser;
  }

  return null;
};

const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, passwordKeyLength) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
};

const verifyPassword = (password: string, passwordHash?: string) => {
  if (!passwordHash) {
    return false;
  }

  const [salt, storedKey] = passwordHash.split(':');
  if (!salt || !storedKey) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, passwordKeyLength) as Buffer;
  const storedKeyBuffer = Buffer.from(storedKey, 'hex');
  if (storedKeyBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKeyBuffer, derivedKey);
};

app.post('/api/auth/signup', async (req, res) => {
  try {
    const displayName = String(req.body.displayName || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();

    if (!displayName || !email || !password) {
      return res.status(400).json({ message: 'Display name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await User.create({ displayName, email, passwordHash: hashPassword(password) });
    return res.status(201).json({ user });
  } catch (error) {
    apiLog('Signup failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    apiLog('Signin failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const progressPayload = (stage: 'pdf_processed' | 'questions_drafted' | 'sections_finalized' | 'paper_saved', message: string) => ({
  progressStage: stage,
  progressMessage: message,
});

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

const redisSub = new Redis(redisOptions as any);
const redisPub = new Redis(redisOptions as any);
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
    const currentUser = await resolveCurrentUser(req);
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
            extractedText = await parsePdfBuffer(req.file.buffer);
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
          userId: currentUser._id,
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
            generatedPaperVersions: [],
            ...progressPayload(req.file ? 'pdf_processed' : 'questions_drafted', req.file ? 'PDF processed and assignment queued' : 'Assignment queued for generation')
        });

        apiLog('Assignment created', {
          requestId,
          userId: String(currentUser._id),
          assignmentId: String(assignment._id),
          hasFileContext: Boolean(assignment.fileContext),
          fileContextLength: assignment.fileContext?.length || 0,
          status: assignment.status
        });
        
        await AIGenerationQueue.add("generate-paper", {
            assignmentId: assignment._id,
          userId: currentUser._id,
        });

        apiLog('Job queued', {
          requestId,
          assignmentId: String(assignment._id),
          userId: String(currentUser._id),
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
    const currentUser = await resolveCurrentUser(req);
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: currentUser._id });
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
    const currentUser = await resolveCurrentUser(req);
    const assignments = await Assignment.find({ userId: currentUser._id }).sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  apiLog('Server listening', { port: PORT, redisHost: redisOptions.host, redisPort: redisOptions.port, hasRedisUrl: Boolean(resolveRedisUrl()) });
});

app.post('/api/assignment/:id/regenerate', async (req, res) => {
  try {
    const requestId = (req as any).requestId;
    const currentUser = await resolveCurrentUser(req);
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: currentUser._id });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.status = 'pending';
    assignment.progressStage = 'questions_drafted';
    assignment.progressMessage = 'Regeneration queued';
    await assignment.save();

    await AIGenerationQueue.add('generate-paper', {
      assignmentId: assignment._id,
      userId: assignment.userId,
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
    const currentUser = await resolveCurrentUser(req);
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: currentUser._id }).select('generatedPaperVersions activeVersion');
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

app.delete('/api/assignment/:id', async (req, res) => {
  try {
    const currentUser = await resolveCurrentUser(req);
    const deletedAssignment = await Assignment.findOneAndDelete({ _id: req.params.id, userId: currentUser._id });

    if (!deletedAssignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    apiLog('Delete assignment failed', {
      assignmentId: req.params.id,
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/user/me', async (req, res) => {
  try {
    const currentUser = await resolveCurrentUserFromHeaders(req);
    if (!currentUser) {
      return res.status(404).json({ message: 'No active user session' });
    }
    const assignmentCount = await Assignment.countDocuments({ userId: currentUser._id });
    res.status(200).json({
      user: currentUser,
      assignmentCount,
    });
  } catch (error) {
    apiLog('Me fetch failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ message: 'Internal server error' });
  }
});

