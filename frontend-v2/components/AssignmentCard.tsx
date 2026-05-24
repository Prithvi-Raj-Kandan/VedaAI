'use client'

import { MoreVertical, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'

interface AssignmentCardProps {
  title: string
  assignedDate: string
  dueDate?: string
  onView?: () => void
  onDelete?: () => void
}

export default function AssignmentCard({
  title,
  assignedDate,
  dueDate,
  onView,
  onDelete,
}: AssignmentCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative border border-gray-100">
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute top-10 right-0 bg-white rounded-lg shadow-md border border-gray-100 z-10">
            <button
              onClick={() => {
                onView?.()
                setShowMenu(false)
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg"
            >
              <Eye className="w-4 h-4" />
              View Assignment
            </button>
            <button
              onClick={() => {
                onDelete?.()
                setShowMenu(false)
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg border-t border-gray-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 pr-8">{title}</h3>

        <div className="space-y-2 text-sm">
          <p className="text-gray-600">
            <span className="font-semibold">Assigned on</span>: {assignedDate}
          </p>
          {dueDate && (
            <p className="text-gray-600">
              <span className="font-semibold">Due</span>: {dueDate}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
