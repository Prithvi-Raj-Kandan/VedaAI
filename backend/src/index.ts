import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import Assignment from './models/Assignment.js';
import { Queue } from 'bullmq';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';

dotenv.config();

const app = express();
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
    connection: { host: '127.0.0.1', port: 6379 }
});

mongoose.connect('mongodb://localhost:27017/vedaai')
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

const redisSub = new Redis({ host: '127.0.0.1', port: 6379 });
redisSub.subscribe('assignment-updates');
redisSub.on('message', (channel, message) => {
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
        const assignment = await Assignment.create({
            title,
            documentURl: documentUrl,
            dueDate,
            totalMarks,
            passingMarks,
            questions,
            additionalInfo,
            status: 'pending'
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