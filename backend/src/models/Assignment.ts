import mongoose, { Document, Schema } from 'mongoose';

export interface IGeneratedPaperVersion {
  versionNumber: number;
  generatedAt: Date;
  source: 'initial' | 'regenerate' | 'restore';
  generatedPaper: any;
}

export interface IAssignment extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  documentURl?: string;
  fileContext?: string;
  uploadedFile?: {
    originalName: string;
    mimeType: string;
    size: number;
  };
  dueDate: Date;
  totalMarks: number;
  passingMarks: number;
  questions: {
    questionType: string;
    totalQuestions: number;
    marksPerQuestion: number;
    sectionTotalMarks: number;
    totalMarks?: number;
  }[];
  additionalInfo?: string;
  status: 'pending' | 'completed' | 'failed';
  generatedPaper?: any;
  generatedPaperVersions: IGeneratedPaperVersion[];
  activeVersion?: number;
  progressStage?: 'pdf_processed' | 'questions_drafted' | 'sections_finalized' | 'paper_saved';
  progressMessage?: string;
}

const assignmentSchema = new Schema<IAssignment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  documentURl: { type: String, required: false },
  fileContext: { type: String, required: false },
  uploadedFile: {
    originalName: { type: String, required: false },
    mimeType: { type: String, required: false },
    size: { type: Number, required: false }
  },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  questions: [
    {
      questionType: { type: String, required: true },
      totalQuestions: { type: Number, required: true },
      marksPerQuestion: { type: Number, required: true },
      sectionTotalMarks: { type: Number, required: true },
      // Backward-compatible field for older documents and payloads.
      totalMarks: { type: Number, required: false }
    }
  ],
  additionalInfo: { type: String, required: false },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  generatedPaper: { type: Schema.Types.Mixed, required: false },
  generatedPaperVersions: [
    {
      versionNumber: { type: Number, required: true },
      generatedAt: { type: Date, required: true, default: Date.now },
      source: { type: String, enum: ['initial', 'regenerate', 'restore'], required: true },
      generatedPaper: { type: Schema.Types.Mixed, required: true }
    }
  ],
  activeVersion: { type: Number, required: false }
  ,
  progressStage: { type: String, enum: ['pdf_processed', 'questions_drafted', 'sections_finalized', 'paper_saved'], required: false },
  progressMessage: { type: String, required: false }
}, { timestamps: true });

assignmentSchema.index({ userId: 1, createdAt: -1 });

const Assignment = mongoose.model<IAssignment>("Assignment", assignmentSchema);
export default Assignment;
