'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAssignmentStore } from '@/store/useAssignmentStore';

const formSchema = z.object({
  title: z.string().min(3, "Title is required"),
  documentUrl: z.string().optional(),
  dueDate: z.string().min(1, "Due Date is required"),
  totalMarks: z.number().min(1, "Total marks must be greater than 0"),
  passingMarks: z.number().min(1, "Passing marks must be greater than 0"),
  additionalInfo: z.string().optional(),
  questions: z.array(z.object({
    questionType: z.string().min(1, "Type is required"),
    totalQuestions: z.number().min(1, "Must be > 0"),
    totalMarks: z.number().min(1, "Must be > 0")
  })).min(1, "At least one question configuration is required")
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { setActiveAssignment } = useAssignmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      questions: [{ questionType: 'Multiple Choice', totalQuestions: 1, totalMarks: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error("Failed to create assignment");
      
      const resData = await response.json();
      setActiveAssignment(resData.assignment._id);
      router.push(`/assignments/${resData.assignment._id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Assignment</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-gray-700">Assignment Title</label>
            <input 
              {...register('title')} 
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. Quiz on Electricity" 
            />
            {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Due Date</label>
            <input 
              type="date"
              {...register('dueDate')} 
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.dueDate && <p className="text-red-500 text-xs">{errors.dueDate.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">File Upload (Optional)</label>
            <input 
              type="file"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Total Marks</label>
            <input 
              type="number"
              {...register('totalMarks', { valueAsNumber: true })} 
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.totalMarks && <p className="text-red-500 text-xs">{errors.totalMarks.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Passing Marks</label>
            <input 
              type="number"
              {...register('passingMarks', { valueAsNumber: true })} 
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.passingMarks && <p className="text-red-500 text-xs">{errors.passingMarks.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Questions Configuration</label>
            <button 
              type="button" 
              onClick={() => append({ questionType: 'Multiple Choice', totalQuestions: 1, totalMarks: 1 })}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              + Add Section
            </button>
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-gray-500">Question Type</label>
                <select 
                  {...register(`questions.${index}.questionType`)}
                  className="w-full p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Multiple Choice">Multiple Choice</option>
                  <option value="Short Answer">Short Answer</option>
                  <option value="Long Answer">Long Answer</option>
                </select>
              </div>
              <div className="w-32 space-y-1">
                <label className="text-xs text-gray-500">No. of Qs</label>
                <input 
                  type="number"
                  {...register(`questions.${index}.totalQuestions`, { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="w-32 space-y-1">
                <label className="text-xs text-gray-500">Total Marks</label>
                <input 
                  type="number"
                  {...register(`questions.${index}.totalMarks`, { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {fields.length > 1 && (
                <button 
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {errors.questions && <p className="text-red-500 text-xs">{errors.questions.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Additional Instructions</label>
          <textarea 
            {...register('additionalInfo')} 
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Any specific instructions for the AI..."
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-medium rounded-full transition-colors shadow-sm"
          >
            {isSubmitting ? 'Generating...' : 'Generate with AI ✨'}
          </button>
        </div>
      </form>
    </div>
  );
}
