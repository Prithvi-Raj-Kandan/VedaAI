import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  title: string;
  documentURl?: string;
  dueDate: Date;
  totalMarks: number;
  passingMarks: number;
  questions: {
    questionType: string;
    totalQuestions: number;
    totalMarks: number;
  }[];
  additionalInfo?: string;
  status: 'pending' | 'completed' | 'failed';
  generatedPaper?: any;
}

const assignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  documentURl: { type: String, required: false },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  questions: [
    {
      questionType: { type: String, required: true },
      totalQuestions: { type: Number, required: true },
      totalMarks: { type: Number, required: true }
    }
  ],
  additionalInfo: { type: String, required: false },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  generatedPaper: { type: Schema.Types.Mixed, required: false }
}, { timestamps: true });

const Assignment = mongoose.model<IAssignment>("Assignment", assignmentSchema);
export default Assignment;
