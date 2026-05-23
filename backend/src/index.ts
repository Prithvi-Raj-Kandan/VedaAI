import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import Assignment from './models/Assignment.js';
import { Queue } from 'bullmq';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';

dotenv.config();

const app = express();
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT || 6379);
const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedaai';

const httpServer = createServer(app);
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
        console.log("mongodb connected");
    })
    .catch((err) => {
        console.log("mongodb not connected", err);
    });

app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));

app.use(express.json());

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on("joinAssignment", (assignmentId) => {
    socket.join(assignmentId);
    console.log(`Socket ${socket.id} joined room ${assignmentId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const redisSub = new Redis({ host: redisHost, port: redisPort });
const redisPub = new Redis({ host: redisHost, port: redisPort });
redisSub.subscribe('assignment-updates');
redisSub.on('message', (channel: string, message: string) => {
  if (channel === 'assignment-updates') {
    try {
      const data = JSON.parse(message);
      io.to(data.assignmentId).emit('assignment-updated', data);
    } catch (e) {
      console.error("Failed to parse redis message", e);
    }
  }
});

// Pass io to request object so we can use it in routes if needed (though we will emit from worker or webhook)
app.set('io', io);

app.get("/health", (req, res) => {
    res.status(200).json({ message: " ok" });
});

app.post("/api/assignment", async (req, res) => {
    try {
        const { title, documentUrl, dueDate, totalMarks, passingMarks, questions, additionalInfo } = req.body;
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

        const assignment = await Assignment.create({
            title,
            documentURl: documentUrl,
            dueDate,
            totalMarks,
            passingMarks,
            questions: normalizedQuestions,
            additionalInfo,
            status: 'pending',
            generatedPaperVersions: []
        });
        
        await AIGenerationQueue.add("generate-paper", {
            assignmentId: assignment._id,
        });
        
        res.status(201).json({ message: "assignment created successfully", assignment });
    }
    catch (error) {
        console.log("error ", error);
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
    console.log(`Server listening on port ${PORT}`);
});

app.post('/api/assignment/:id/regenerate', async (req, res) => {
  try {
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

    res.status(202).json({ message: 'Regeneration queued', assignment });
  } catch (error) {
    console.error('regenerate error', error);
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
    console.error('versions fetch error', error);
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

    res.status(200).json({ message: 'Version restored', assignment });
  } catch (error) {
    console.error('restore version error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});