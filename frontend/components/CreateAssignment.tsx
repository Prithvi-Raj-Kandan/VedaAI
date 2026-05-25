'use client'

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, X, Plus } from 'lucide-react'
import Header from './Header'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'

type QuestionType = {
  questionType: string
  totalQuestions: number
  totalMarks: number
}

const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice',
  'Short Answer',
  'Long Answer',
  'Numerical Problem',
  'Diagram/Graph-Based',
  'Case Study',
  'True/False',
]

export default function CreateAssignment() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetTotalMarks, setTargetTotalMarks] = useState('')
  const [passingMarks, setPassingMarks] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [questions, setQuestions] = useState<QuestionType[]>([
    { questionType: 'Multiple Choice', totalQuestions: 4, totalMarks: 1 },
    { questionType: 'Short Answer', totalQuestions: 3, totalMarks: 2 },
  ])

  const totalQuestionsInPaper = useMemo(
    () => questions.reduce((sum, item) => sum + Number(item.totalQuestions || 0), 0),
    [questions],
  )

  const totalMarksInPaper = useMemo(
    () => questions.reduce((sum, item) => sum + Number(item.totalQuestions || 0) * Number(item.totalMarks || 0), 0),
    [questions],
  )

  const parsedTargetTotalMarks = Number(targetTotalMarks) || 0
  const parsedPassingMarks = Number(passingMarks) || 0
  const supportsChoiceMode = parsedTargetTotalMarks > 0 && totalMarksInPaper > parsedTargetTotalMarks
  const extraMarks = Math.max(totalMarksInPaper - parsedTargetTotalMarks, 0)

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
  }

  const updateQuestion = (index: number, field: keyof QuestionType, value: string | number) => {
    setQuestions((current) => {
      const next = [...current]
      next[index] = {
        ...next[index],
        [field]: value,
      }
      return next
    })
  }

  const addQuestionType = () => {
    setQuestions((current) => [...current, { questionType: '', totalQuestions: 1, totalMarks: 1 }])
  }

  const removeQuestionType = (index: number) => {
    setQuestions((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      toast.error('Assignment title is required')
      return
    }

    if (!dueDate) {
      toast.error('Due date is required')
      return
    }

    if (!questions.length) {
      toast.error('Add at least one question type')
      return
    }

      if (!parsedTargetTotalMarks) {
        toast.error('Target total marks is required')
        return
      }

      if (!parsedPassingMarks) {
        toast.error('Passing marks is required')
        return
      }

    try {
      const form = new FormData()
      form.append('title', title.trim())
      form.append('dueDate', dueDate)
        form.append('totalMarks', String(parsedTargetTotalMarks))
        form.append('passingMarks', String(parsedPassingMarks))
      form.append('additionalInfo', additionalInfo)
      form.append('questions', JSON.stringify(questions))

      if (selectedFile) {
        form.append('materialFile', selectedFile)
      }

      const response = await apiFetch('/api/assignment', {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        let message = 'Failed to create assignment'
        try {
          const errorData = await response.json()
          message = errorData?.message || message
        } catch {
          // keep fallback message
        }
        throw new Error(message)
      }

      const data = await response.json()
      const assignmentId = data?.assignment?._id || data?._id

      if (!assignmentId) {
        throw new Error('Assignment created without an id')
      }

      router.push(`/assignments/${assignmentId}`)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to create assignment')
    }
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Header title="Create Assignment" backLink="/" />
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Sign in to create assignments</h3>
          <p className="mt-2 text-sm text-gray-600">Creating and saving assignments now belongs to the signed-in user profile.</p>
          <Link href="/signin" className="mt-6 inline-flex rounded-full bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800">
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header title="Create Assignment" backLink="/assignments" />

      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <h2 className="font-bold text-gray-900">Create Assignment</h2>
        </div>
        <p className="text-sm text-gray-600">Set up a new assignment for your students</p>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
          <div className="bg-gray-600 h-1 rounded-full" style={{ width: '50%' }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl p-8 space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-lg">Assignment Details</h3>
              <p className="text-sm text-gray-600">Basic information about your assignment</p>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-gray-900 block">Assignment Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Quiz on Electricity"
                className="w-full px-4 py-3 border border-gray-300 rounded-full outline-none placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label className="font-bold text-gray-900 block">Due Date</label>
              <div className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-3 bg-white">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-900"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-bold text-gray-900 block">Target Total Marks</label>
                <input
                  type="number"
                  min={1}
                  value={targetTotalMarks}
                  onChange={(event) => setTargetTotalMarks(event.target.value)}
                  placeholder="Enter marks"
                  className="w-full px-4 py-3 border border-gray-300 rounded-full outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-gray-900 block">Passing Marks</label>
                <input
                  type="number"
                  min={1}
                  value={passingMarks}
                  onChange={(event) => setPassingMarks(event.target.value)}
                  placeholder="Enter marks"
                  className="w-full px-4 py-3 border border-gray-300 rounded-full outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="file-upload" className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors">
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-900" />
                    </div>
                  </div>
                  <p className="font-medium text-gray-900">Choose a file or drag & drop it here</p>
                  <p className="text-sm text-gray-500 mt-1">PDF or TXT, upto 10MB</p>
                  <button type="button" className="mt-4 px-6 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                    Browse Files
                  </button>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-600 text-center">
                Upload supporting material for better output
              </p>

              {selectedFile && (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Question Type</h3>
                <p className="text-sm text-gray-600">Add the question groups you want in the paper</p>
              </div>

              <button
                type="button"
                onClick={addQuestionType}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Question Type
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={`${question.questionType}-${index}`} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_140px_auto] items-center">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Question Type</label>
                    <select
                      value={question.questionType}
                      onChange={(event) => updateQuestion(index, 'questionType', event.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full outline-none"
                    >
                      <option value="">Select Question Type</option>
                      {QUESTION_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">No. of Qs</label>
                    <input
                      type="number"
                      min={1}
                      value={question.totalQuestions}
                      onChange={(event) => updateQuestion(index, 'totalQuestions', Number(event.target.value) || 0)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Marks / Q</label>
                    <input
                      type="number"
                      min={1}
                      value={question.totalMarks}
                      onChange={(event) => updateQuestion(index, 'totalMarks', Number(event.target.value) || 0)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestionType(index)}
                        className="p-3 text-gray-600 hover:bg-gray-100 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Total Questions in Paper</span>
                <span className="font-semibold text-gray-900">{totalQuestionsInPaper}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Total Marks in Paper</span>
                <span className="font-semibold text-gray-900">{totalMarksInPaper}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Target Marks (Students Attempt)</span>
                <span className="font-semibold text-gray-900">{targetTotalMarks || 0}</span>
              </div>
              {supportsChoiceMode && (
                <p className="mt-3 rounded-md bg-orange-50 px-3 py-2 text-xs text-orange-800">
                  Choice mode enabled: the paper contains {extraMarks} extra marks beyond the target total, so students can attempt {targetTotalMarks} marks from choice.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-gray-900 block">Additional Information (For better output)</label>
            <textarea
              value={additionalInfo}
              onChange={(event) => setAdditionalInfo(event.target.value)}
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none placeholder-gray-400 resize-none"
              rows={4}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button type="button" className="px-6 py-2 border border-gray-300 rounded-full font-medium text-gray-900 hover:bg-gray-50 transition-colors">
            ← Previous
          </button>
          <button type="submit" className="px-6 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
            Next →
          </button>
        </div>
      </form>
    </div>
  )
}
