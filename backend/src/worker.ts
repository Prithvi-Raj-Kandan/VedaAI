import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assignment from './models/Assignment.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Redis } from 'ioredis';

dotenv.config();

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT || 6379);
const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedaai';

mongoose.connect(mongodbUri)
    .then(() => console.log("Worker connected to MongoDB"))
    .catch((err) => console.log("Worker MongoDB connection error", err));

const redisPub = new Redis({ host: redisHost, port: redisPort });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const worker = new Worker('AIGenerationQueue', async (job) => {
    const { assignmentId, source = 'initial' } = job.data;
    console.log(`Processing job for assignment ${assignmentId}`);
    
    try {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            throw new Error('Assignment not found');
        }

        // Notify that generation started
        redisPub.publish('assignment-updates', JSON.stringify({
            assignmentId,
            status: 'processing'
        }));

        if (!process.env.GEMINI_API_KEY) {
            console.warn("No GEMINI_API_KEY found, mocking generation for testing...");
            // Simulate delay
            await new Promise(r => setTimeout(r, 2000));
            assignment.status = 'completed';
            assignment.generatedPaper = {
                sections: [
                    {
                        title: "Section A",
                        instruction: "Attempt all questions.",
                        questions: [
                            { questionText: "What is AI?", difficulty: "Easy", marks: 5 }
                        ]
                    }
                ]
            };

            const nextVersion = (assignment.generatedPaperVersions?.length || 0) + 1;
            assignment.generatedPaperVersions = [
                ...(assignment.generatedPaperVersions || []),
                {
                    versionNumber: nextVersion,
                    generatedAt: new Date(),
                    source,
                    generatedPaper: assignment.generatedPaper,
                }
            ];
            assignment.activeVersion = nextVersion;
            await assignment.save();
            
            redisPub.publish('assignment-updates', JSON.stringify({
                assignmentId,
                status: 'completed',
                assignment
            }));
            return { success: true };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const questionConfigLines = assignment.questions
            .map((q, index) => {
                const marksPerQuestion = Number(q.marksPerQuestion ?? q.totalMarks ?? 0);
                const sectionTotalMarks = Number(q.sectionTotalMarks ?? (q.totalQuestions * marksPerQuestion));
                return `${index + 1}. ${q.questionType}: ${q.totalQuestions} questions, ${marksPerQuestion} marks per question, ${sectionTotalMarks} section marks.`;
            })
            .join('\n');

        const totalMarksInPaper = assignment.questions.reduce((sum, q) => {
            const marksPerQuestion = Number(q.marksPerQuestion ?? q.totalMarks ?? 0);
            return sum + (q.totalQuestions * marksPerQuestion);
        }, 0);

        const prompt = `
You are an AI Assessment Creator. Generate a question paper based on the following assignment details:
Title: ${assignment.title}
Target Total Marks (students should attempt): ${assignment.totalMarks}
Total Marks Present in Paper: ${totalMarksInPaper}
Passing Marks: ${assignment.passingMarks}
Additional Info: ${assignment.additionalInfo || 'None'}
Questions Config:
${questionConfigLines}

If Total Marks Present in Paper is greater than Target Total Marks, design the paper with optional-choice style instructions so students can choose a subset that matches target marks.

Please generate the output strictly as a JSON object with the following structure:
{
  "sections": [
    {
      "title": "Section Name",
      "instruction": "Instruction for the section",
      "questions": [
        {
          "questionText": "The actual question",
          "difficulty": "Easy" | "Moderate" | "Hard",
          "marks": number
        }
      ]
    }
  ]
}
Return ONLY valid JSON, without any markdown formatting. Do not wrap in \`\`\`json.
`;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        text = text.trim();
        if (text.startsWith('```json')) {
            text = text.substring(7, text.length - 3).trim();
        } else if (text.startsWith('```')) {
            text = text.substring(3, text.length - 3).trim();
        }
        
        const generatedPaper = JSON.parse(text);

        assignment.status = 'completed';
        assignment.generatedPaper = generatedPaper;

        const nextVersion = (assignment.generatedPaperVersions?.length || 0) + 1;
        assignment.generatedPaperVersions = [
            ...(assignment.generatedPaperVersions || []),
            {
                versionNumber: nextVersion,
                generatedAt: new Date(),
                source,
                generatedPaper,
            }
        ];
        assignment.activeVersion = nextVersion;
        await assignment.save();

        redisPub.publish('assignment-updates', JSON.stringify({
            assignmentId,
            status: 'completed',
            assignment
        }));
        
        console.log(`Successfully generated paper for ${assignmentId}`);
        return { success: true };
    } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
        redisPub.publish('assignment-updates', JSON.stringify({
            assignmentId,
            status: 'failed'
        }));
        
        throw error;
    }
}, {
    connection: { host: redisHost, port: redisPort }
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

console.log("Worker is running...");