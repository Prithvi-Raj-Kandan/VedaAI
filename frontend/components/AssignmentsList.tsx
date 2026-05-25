'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Inbox } from 'lucide-react'
import Header from './Header'
import AssignmentCard from './AssignmentCard'
import { apiFetch } from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'
import { format } from 'date-fns'

type AssignmentItem = {
  _id: string
  title: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  dueDate?: string
}

export default function AssignmentsList() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const [searchQuery, setSearchQuery] = useState('')
  const [deadlineFilter, setDeadlineFilter] = useState<'all' | 'due' | 'completed'>('all')
  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    if (!user) {
      setAssignments([])
      setIsLoading(false)
      return
    }

    const loadAssignments = async () => {
      try {
        setIsLoading(true)
        const response = await apiFetch('/api/assignments')
        if (!response.ok) {
          throw new Error('Failed to load assignments')
        }

        const data = await response.json()
        setAssignments(data)
      } catch (loadError) {
        console.error(loadError)
        setError(loadError instanceof Error ? loadError.message : 'Failed to load assignments')
      } finally {
        setIsLoading(false)
      }
    }

    loadAssignments()
  }, [user])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 60000)

    return () => window.clearInterval(intervalId)
  }, [])

  const getLifecycleState = (assignment: AssignmentItem) => {
    if (!assignment.dueDate) {
      return 'due' as const
    }

    const dueDate = new Date(assignment.dueDate)
    return dueDate.getTime() < currentTime ? 'completed' : 'due'
  }

  const filteredAssignments = useMemo(
    () => assignments.filter((assignment) => {
      const titleMatches = assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
      const lifecycleState = getLifecycleState(assignment)
      const deadlineMatches = deadlineFilter === 'all' || lifecycleState === deadlineFilter

      return titleMatches && deadlineMatches
    }),
    [assignments, currentTime, deadlineFilter, searchQuery]
  )

  const handleDelete = async (assignmentId: string) => {
    const confirmed = window.confirm('Delete this assignment? This cannot be undone.')
    if (!confirmed) {
      return
    }

    try {
      setDeletingAssignmentId(assignmentId)
      const response = await apiFetch(`/api/assignment/${assignmentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete assignment')
      }

      setAssignments((current) => current.filter((assignment) => assignment._id !== assignmentId))
    } catch (deleteError) {
      console.error(deleteError)
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete assignment')
    } finally {
      setDeletingAssignmentId(null)
    }
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Header title="Assignments" />
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <Inbox className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Sign in to view assignments</h3>
          <p className="mt-2 text-sm text-gray-600">Authentication now starts on the sign-in page, and your assignments load from the signed-in user profile.</p>
          <Link href="/signin" className="mt-6 inline-flex rounded-full bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800">
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header title="Assignments" />

      {/* Description */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <h2 className="font-bold text-gray-900">Assignments</h2>
        </div>
        <p className="text-sm text-gray-600">Manage and create assignments for your classes.</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full outline-none placeholder-gray-400 focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <select
          value={deadlineFilter}
          onChange={(event) => setDeadlineFilter(event.target.value as 'all' | 'due' | 'completed')}
          className="min-w-40 rounded-full border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 outline-none hover:bg-gray-50 focus:ring-2 focus:ring-orange-400"
        >
          <option value="all">All</option>
          <option value="due">Due</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-3xl bg-white py-16 text-gray-500 shadow-sm">
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          Loading assignments...
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-red-50 px-6 py-4 text-sm text-red-700 border border-red-100">
          {error}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm border border-dashed border-gray-200">
          <Inbox className="mx-auto h-10 w-10 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No assignments yet</h3>
          <p className="mt-2 text-sm text-gray-600">Create the first assignment for your current user profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment._id}
              title={assignment.title}
              assignedDate={format(new Date(assignment.createdAt), 'dd MMM yyyy')}
              dueDate={assignment.dueDate ? format(new Date(assignment.dueDate), 'dd MMM yyyy') : undefined}
              lifecycleState={getLifecycleState(assignment)}
              onOpen={() => router.push(`/assignments/${assignment._id}`)}
              onDelete={() => handleDelete(assignment._id)}
            />
          ))}
        </div>
      )}

      {deletingAssignmentId && (
        <div className="text-center text-sm text-gray-500">Deleting assignment...</div>
      )}

      {/* Create Button */}
      <div className="flex justify-center pt-4">
        <Link href="/create" className="px-8 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition-colors flex items-center gap-2 border-2 border-orange-500">
          <Plus className="w-5 h-5" />
          Create Assignment
        </Link>
      </div>
    </div>
  )
}

function Plus({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}
