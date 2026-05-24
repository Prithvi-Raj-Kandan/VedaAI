'use client'

import { useState } from 'react'
import { Upload, X, Plus, Minus } from 'lucide-react'
import Header from './Header'

interface QuestionType {
  name: string
  count: number
  marks: number
}

export default function CreateAssignment() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [dueDate, setDueDate] = useState('')
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    { name: 'Multiple Choice Questions', count: 4, marks: 1 },
    { name: 'Short Questions', count: 3, marks: 2 },
    { name: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
    { name: 'Numerical Problems', count: 5, marks: 5 },
  ])
  const [additionalInfo, setAdditionalInfo] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const updateQuestionType = (index: number, field: string, value: any) => {
    const updated = [...questionTypes]
    updated[index] = { ...updated[index], [field]: value }
    setQuestionTypes(updated)
  }

  const addQuestionType = () => {
    setQuestionTypes([...questionTypes, { name: '', count: 0, marks: 0 }])
  }

  const removeQuestionType = (index: number) => {
    setQuestionTypes(questionTypes.filter((_, i) => i !== index))
  }

  const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0)
  const totalMarks = questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0)

  return (
    <div className="space-y-6">
      <Header title="Create Assignment" backLink="/assignments" />

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <h2 className="font-bold text-gray-900">Create Assignment</h2>
        </div>
        <p className="text-sm text-gray-600">Set up a new assignment for your students</p>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
          <div className="bg-gray-600 h-1 rounded-full" style={{ width: '50%' }}></div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-2xl p-8 space-y-8">
        {/* Assignment Details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-lg">Assignment Details</h3>
            <p className="text-sm text-gray-600">Basic information about your assignment</p>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label htmlFor="file-upload" className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-gray-400 transition-colors">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-900" />
                  </div>
                </div>
                <p className="font-medium text-gray-900">Choose a file or drag & drop it here</p>
                <p className="text-sm text-gray-500 mt-1">JPEG, PNG, upto 10MB</p>
                <button className="mt-4 px-6 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                  Browse Files
                </button>
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-600 text-center">
              Upload images of your preferred document/image
            </p>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="font-bold text-gray-900 block">Due Date</label>
            <div className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-3">
              <input
                type="text"
                placeholder="DD-MM-YYYY"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
              />
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Question Types */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-lg">Question Type</h3>

          <div className="space-y-3">
            {questionTypes.map((qt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <select
                    value={qt.name}
                    onChange={(e) => updateQuestionType(idx, 'name', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full outline-none"
                  >
                    <option value="">Select Question Type</option>
                    <option value="Multiple Choice Questions">Multiple Choice Questions</option>
                    <option value="Short Questions">Short Questions</option>
                    <option value="Diagram/Graph-Based Questions">
                      Diagram/Graph-Based Questions
                    </option>
                    <option value="Numerical Problems">Numerical Problems</option>
                  </select>
                </div>

                <button
                  onClick={() => removeQuestionType(idx)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
                  <button
                    onClick={() =>
                      updateQuestionType(idx, 'count', Math.max(0, qt.count - 1))
                    }
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{qt.count}</span>
                  <button
                    onClick={() =>
                      updateQuestionType(idx, 'count', qt.count + 1)
                    }
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
                  <button
                    onClick={() =>
                      updateQuestionType(idx, 'marks', Math.max(0, qt.marks - 1))
                    }
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{qt.marks}</span>
                  <button
                    onClick={() =>
                      updateQuestionType(idx, 'marks', qt.marks + 1)
                    }
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Type Button */}
          <button
            onClick={addQuestionType}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Question Type
          </button>

          {/* Totals */}
          <div className="space-y-1 text-right text-sm">
            <p className="font-bold text-gray-900">Total Questions : {totalQuestions}</p>
            <p className="font-bold text-gray-900">Total Marks : {totalMarks}</p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-2">
          <label className="font-bold text-gray-900 block">
            Additional Information (For better output)
          </label>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="e.g Generate a question paper for 3 hour exam duration..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none placeholder-gray-400 resize-none"
            rows={4}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button className="px-6 py-2 border border-gray-300 rounded-full font-medium text-gray-900 hover:bg-gray-50 transition-colors">
          ← Previous
        </button>
        <button className="px-6 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
          Next →
        </button>
      </div>
    </div>
  )
}
