'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import Header from './Header'
import AssignmentCard from './AssignmentCard'

const mockAssignments = [
  { id: 1, title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
  { id: 2, title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
  { id: 3, title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
  { id: 4, title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
  { id: 5, title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
  { id: 6, title: 'Quiz on Electricity', assignedDate: '20-06-2025', dueDate: '21-06-2025' },
]

export default function AssignmentsList() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAssignments = mockAssignments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="flex gap-4">
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
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Filter By</span>
        </button>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            title={assignment.title}
            assignedDate={assignment.assignedDate}
            dueDate={assignment.dueDate}
            onView={() => console.log('View:', assignment.id)}
            onDelete={() => console.log('Delete:', assignment.id)}
          />
        ))}
      </div>

      {/* Create Button */}
      <div className="flex justify-center pt-4">
        <button className="px-8 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition-colors flex items-center gap-2 border-2 border-orange-500">
          <Plus className="w-5 h-5" />
          Create Assignment
        </button>
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
