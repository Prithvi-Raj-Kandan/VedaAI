'use client'

import { create } from 'zustand'

interface AssignmentStore {
  activeAssignmentId: string | null
  assignmentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'idle'
  generatedData: any | null
  progressStage: 'pdf_processed' | 'questions_drafted' | 'sections_finalized' | 'paper_saved' | null
  progressMessage: string | null
  setActiveAssignment: (id: string) => void
  reset: () => void
  setGeneratedData: (data: any, status: 'pending' | 'processing' | 'completed' | 'failed') => void
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  activeAssignmentId: null,
  assignmentStatus: 'idle',
  generatedData: null,
  progressStage: null,
  progressMessage: null,

  setActiveAssignment: (id: string) => {
    set({ activeAssignmentId: id, assignmentStatus: 'pending', generatedData: null, progressStage: null, progressMessage: null })
  },

  setGeneratedData: (data: any, status: 'pending' | 'processing' | 'completed' | 'failed') => {
    set({ generatedData: data, assignmentStatus: status })
  },

  reset: () => set({ activeAssignmentId: null, assignmentStatus: 'idle', generatedData: null, progressStage: null, progressMessage: null }),
}))
