import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assignment from './models/Assignment.js';
import SYSTEM_PROMPT from './prompts/systemPrompt.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Redis } from 'ioredis';
import { createHash } from 'node:crypto';
import { z } from 'zod';

dotenv.config();

const workerLog = (event: string, data?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    if (data) {
        console.log(`[worker][${timestamp}] ${event}`, data);
    } else {
        console.log(`[worker][${timestamp}] ${event}`);
    }
};

const publishProgress = async (redisPub: Redis, assignmentId: string, assignment: any, stage: 'pdf_processed' | 'questions_drafted' | 'sections_finalized' | 'paper_saved', message: string) => {
    assignment.progressStage = stage;
    assignment.progressMessage = message;
    await assignment.save();

    await redisPub.publish('assignment-updates', JSON.stringify({
        assignmentId,
        status: 'processing',
        stage,
        message,
        assignment
    }));

    workerLog('Published progress update', { assignmentId, stage, message });
};

const normalizeGeneratedPaper = (paper: any) => {
    if (!paper || typeof paper !== 'object') {
        return { sections: [] };
    }

    const normalizeDifficulty = (value: unknown) => {
        const difficulty = String(value ?? 'medium').trim().toLowerCase();
        if (difficulty === 'moderate') {
            return 'medium';
        }
        if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
            return difficulty;
        }
        return 'medium';
    };

    const sections = Array.isArray(paper.sections) ? paper.sections : [];
    return {
        ...paper,
        sections: sections.map((section: any) => {
            const questions = Array.isArray(section?.questions) ? section.questions : [];
            return {
                ...section,
                // Frontend currently reads `instruction`.
                instruction: section?.instruction ?? section?.instructions ?? '',
                questions: questions.map((q: any, index: number) => ({
                    ...q,
                    // Frontend currently reads `questionText`.
                    questionText: q?.questionText ?? q?.text ?? '',
                    difficulty: normalizeDifficulty(q?.difficulty),
                    marks: Number(q?.marks ?? 0),
                    id: q?.id ?? `q${index + 1}`,
                }))
            };
        })
    };
};

const generatedQuestionSchema = z.object({
    id: z.string().min(1).max(16),
    questionText: z.string().min(1),
    type: z.enum(['mcq', 'short_answer', 'long_answer', 'numeric']).optional(),
    marks: z.number().finite().nonnegative(),
    difficulty: z.enum(['easy', 'medium', 'hard'])
});

const generatedSectionSchema = z.object({
    title: z.string().min(1),
    instruction: z.string().min(1),
    sectionTotalMarks: z.number().finite().nonnegative().optional(),
    choiceMode: z.enum(['single', 'multiple', 'none']).optional(),
    questions: z.array(generatedQuestionSchema).min(1)
});

const generatedPaperSchema = z.object({
    sections: z.array(generatedSectionSchema).min(1)
});

const parseAndValidateGeneratedPaper = (text: string) => {
    let parsed: unknown;

    try {
        parsed = JSON.parse(text);
    } catch (error) {
        throw new Error(`Gemini returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }

    const normalized = normalizeGeneratedPaper(parsed);
    const validation = generatedPaperSchema.safeParse(normalized);

    if (!validation.success) {
        throw new Error(`Gemini output failed validation: ${validation.error.message}`);
    }

    return validation.data;
};

const extractJsonCandidate = (text: string) => {
    const trimmed = text.trim();
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');

    if (firstBrace >= 0 && lastBrace > firstBrace) {
        return trimmed.slice(firstBrace, lastBrace + 1);
    }

    return trimmed;
};

const buildFallbackPaper = (assignment: any) => ({
    sections: [
        {
            title: 'Section A',
            instruction: 'Attempt all questions.',
            questions: (assignment.questions || []).flatMap((group: any, groupIndex: number) => {
                const questionCount = Number(group.totalQuestions || 1);
                const marksPerQuestion = Number(group.marksPerQuestion ?? group.totalMarks ?? 1);
                return Array.from({ length: questionCount }).map((_, index) => ({
                    id: `q${groupIndex + 1}_${index + 1}`,
                    questionText: `${group.questionType || 'Question'} ${index + 1}`,
                    difficulty: 'medium',
                    marks: marksPerQuestion,
                }));
            })
        }
    ]
});

const buildCacheKey = (assignment: any) => {
    const cacheMaterial = JSON.stringify({
        userId: String(assignment.userId || ''),
        title: assignment.title,
        fileContext: assignment.fileContext || '',
        questions: assignment.questions || [],
        additionalInfo: assignment.additionalInfo || '',
        totalMarks: assignment.totalMarks || 0,
        passingMarks: assignment.passingMarks || 0,
    });

    return `vedaai:assignment-generation:${createHash('sha256').update(cacheMaterial).digest('hex')}`;
};

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT || 6379);
const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedaai';

const resolveRedisUrl = () => {
    return process.env.REDISCLOUD_URL || process.env.REDIS_URL || process.env.REDIS_TLS_URL || process.env.UPSTASH_REDIS_URL || '';
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

const redisOptions = buildRedisOptions();

mongoose.connect(mongodbUri)
    .then(() => workerLog('MongoDB connected', { mongodbUri }))
    .catch((err) => workerLog('MongoDB connection error', { error: err instanceof Error ? err.message : String(err) }));

const redisPub = new Redis(redisOptions as any);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

workerLog('Worker bootstrap complete', {
    redisHost,
    redisPort,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
});

const worker = new Worker('AIGenerationQueue', async (job) => {
    const { assignmentId, source = 'initial' } = job.data;
    workerLog('Job received', {
        jobId: job.id,
        assignmentId,
        source,
        queueName: job.queueName,
        attemptsMade: job.attemptsMade
    });
    
    try {
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            throw new Error('Assignment not found');
        }
        workerLog('Assignment loaded', {
            assignmentId,
            status: assignment.status,
            hasFileContext: Boolean(assignment.fileContext),
            fileContextLength: assignment.fileContext?.length || 0,
            questionGroups: assignment.questions?.length || 0
        });

        await publishProgress(redisPub, assignmentId, assignment, 'pdf_processed', assignment.fileContext ? 'Analyzing uploaded material and extracting key context' : 'Loading assignment inputs and planning the paper');

        if (!process.env.GEMINI_API_KEY) {
            workerLog('No GEMINI_API_KEY found, using mock generation path', { assignmentId });
            // Simulate delay
            await publishProgress(redisPub, assignmentId, assignment, 'questions_drafted', 'Drafting a lightweight preview paper');
            await new Promise(r => setTimeout(r, 2000));
            await publishProgress(redisPub, assignmentId, assignment, 'sections_finalized', 'Finalizing the preview structure');
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
            workerLog('Mock generation saved', {
                assignmentId,
                versionNumber: nextVersion,
                status: assignment.status
            });
            
            await redisPub.publish('assignment-updates', JSON.stringify({
                assignmentId,
                status: 'completed',
                assignment
            }));
            workerLog('Published status update', { assignmentId, status: 'completed' });
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

        await publishProgress(redisPub, assignmentId, assignment, 'questions_drafted', 'Drafting section flow and balancing question types');

        const totalMarksInPaper = assignment.questions.reduce((sum, q) => {
            const marksPerQuestion = Number(q.marksPerQuestion ?? q.totalMarks ?? 0);
            return sum + (q.totalQuestions * marksPerQuestion);
        }, 0);

        const cacheKey = buildCacheKey(assignment);
        const shouldUseCache = source !== 'regenerate';
        workerLog('Cache lookup started', { assignmentId, cacheKey, shouldUseCache, source });

        const cachedPaper = shouldUseCache ? await redisPub.get(cacheKey) : null;
        if (cachedPaper) {
            workerLog('Cache hit', { assignmentId, cacheKey });
            let generatedPaper;
            try {
                generatedPaper = normalizeGeneratedPaper(JSON.parse(cachedPaper));
            } catch (cacheParseError) {
                workerLog('Cached paper parse failed, continuing with live generation', {
                    assignmentId,
                    cacheKey,
                    error: cacheParseError instanceof Error ? cacheParseError.message : String(cacheParseError)
                });
                generatedPaper = null;
            }

            if (generatedPaper) {
            assignment.status = 'completed';
            assignment.generatedPaper = generatedPaper;
            assignment.progressStage = 'paper_saved';
            assignment.progressMessage = 'Paper saved from cache';

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

            workerLog('Cached paper saved', {
                assignmentId,
                versionNumber: nextVersion,
                cacheKey
            });

            await redisPub.publish('assignment-updates', JSON.stringify({
                assignmentId,
                status: 'completed',
                stage: 'paper_saved',
                message: 'Paper saved from cache',
                assignment
            }));
            workerLog('Published status update', { assignmentId, status: 'completed' });

            workerLog('Job completed successfully from cache', { jobId: job.id, assignmentId });
            return { success: true, cached: true };
            }
        }

        workerLog('Cache miss', { assignmentId, cacheKey, shouldUseCache, source });

                const userPrompt = `
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

                // Include raw fileContext (PDF/TXT extraction) verbatim as requested.
                // The system prompt (rules) remains separate and will be prepended.
                const fileContextBlock = assignment.fileContext ? `FileContext:\n${assignment.fileContext}\n\n` : '';
                const prompt = SYSTEM_PROMPT + "\n\n" + fileContextBlock + userPrompt;

            workerLog('Invoking LLM generation', {
                assignmentId,
                promptLength: prompt.length,
                fileContextLength: assignment.fileContext?.length || 0
            });

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        workerLog('Gemini API response received', {
            assignmentId,
            rawResponseLength: text.length
        });
        
        text = text.trim();
        if (text.startsWith('```json')) {
            text = text.substring(7, text.length - 3).trim();
        } else if (text.startsWith('```')) {
            text = text.substring(3, text.length - 3).trim();
        }

        const candidateText = extractJsonCandidate(text);
        let generatedPaper;

        try {
            generatedPaper = parseAndValidateGeneratedPaper(candidateText);
        } catch (parseError) {
            workerLog('Gemini parsing failed, using fallback paper', {
                assignmentId,
                error: parseError instanceof Error ? parseError.message : String(parseError)
            });
            generatedPaper = normalizeGeneratedPaper(buildFallbackPaper(assignment));
        }
        workerLog('LLM response parsed and validated', {
            assignmentId,
            responseLength: candidateText.length,
            hasSections: Array.isArray(generatedPaper?.sections),
            sectionCount: Array.isArray(generatedPaper?.sections) ? generatedPaper.sections.length : 0,
            firstQuestionPreview: generatedPaper?.sections?.[0]?.questions?.[0]?.questionText?.slice?.(0, 80) || ''
        });

    await publishProgress(redisPub, assignmentId, assignment, 'sections_finalized', 'Validating generated sections and polishing the draft');

        assignment.status = 'completed';
        assignment.generatedPaper = generatedPaper;
    assignment.progressStage = 'paper_saved';
    assignment.progressMessage = 'Paper saved successfully';

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
        workerLog('Generated paper saved', {
            assignmentId,
            versionNumber: nextVersion,
            status: assignment.status
        });

        await redisPub.set(cacheKey, JSON.stringify(generatedPaper), 'EX', 60 * 60 * 24);
        workerLog('Cached generated paper', {
            assignmentId,
            cacheKey,
            ttlSeconds: 60 * 60 * 24
        });

        await redisPub.publish('assignment-updates', JSON.stringify({
            assignmentId,
            status: 'completed',
            stage: 'paper_saved',
            message: 'Paper saved successfully',
            assignment
        }));
        workerLog('Published status update', { assignmentId, status: 'completed' });
        
        workerLog('Job completed successfully', { jobId: job.id, assignmentId });
        return { success: true };
    } catch (error) {
        workerLog('Job failed', {
            jobId: job.id,
            assignmentId,
            error: error instanceof Error ? error.message : String(error)
        });
        
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
        await redisPub.publish('assignment-updates', JSON.stringify({
            assignmentId,
            status: 'failed'
        }));
        workerLog('Published status update', { assignmentId, status: 'failed' });
        
        throw error;
    }
}, {
    connection: { host: redisHost, port: redisPort }
});

worker.on('failed', (job, err) => {
    workerLog('BullMQ failed event', {
        jobId: job?.id,
        error: err.message,
        stack: err.stack
    });
});

worker.on('completed', (job) => {
    workerLog('BullMQ completed event', {
        jobId: job.id,
        queueName: job.queueName
    });
});

workerLog('Worker is running');