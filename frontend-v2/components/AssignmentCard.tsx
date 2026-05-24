
'use client'

import { Trash2 } from 'lucide-react'

interface AssignmentCardProps {
  title: string
  assignedDate: string
  dueDate?: string
  lifecycleState: 'due' | 'completed'
  onOpen?: () => void
  onDelete?: () => void
}

export default function AssignmentCard({
  title,
  assignedDate,
  dueDate,
  lifecycleState,
  onOpen,
  onDelete,
}: AssignmentCardProps) {
  const statusLabel = lifecycleState === 'completed' ? 'Completed' : 'Due'
  const statusStyles = lifecycleState === 'completed'
    ? 'bg-green-50 text-green-700 border-green-100'
    : 'bg-amber-50 text-amber-700 border-amber-100'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen?.()
        }
      }}
      className="relative cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onDelete?.()
        }}
        className="absolute right-4 top-4 rounded-full border border-red-100 bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
        aria-label={`Delete ${title}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 pr-8">{title}</h3>

        <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusStyles}`}>
          {statusLabel}
        </div>

        {dueDate && (
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Due</span>: {dueDate}
          </div>
        )}

        <div className="space-y-2 text-sm">
          <p className="text-gray-600">
            <span className="font-semibold">Assigned on</span>: {assignedDate}
          </p>
        </div>
      </div>
    </div>
  )
}
