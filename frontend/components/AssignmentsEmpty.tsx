'use client'

import Header from './Header'

export default function AssignmentsEmpty() {
  return (
    <div className="space-y-6">
      <Header title="Assignments" />

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20">
        {/* Illustration - simplified version */}
        <div className="mb-8 relative w-64 h-64">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* Magnifying glass */}
            <circle cx="280" cy="120" r="60" fill="none" stroke="#E8D4F8" strokeWidth="2" />
            <line x1="330" y1="170" x2="370" y2="210" stroke="#8B7AB8" strokeWidth="4" />

            {/* Paper/Document */}
            <rect x="60" y="100" width="120" height="160" fill="#F0E6FF" stroke="#D4B5F0" strokeWidth="2" rx="8" />
            <line x1="80" y1="130" x2="160" y2="130" stroke="#B99DCC" strokeWidth="2" />
            <line x1="80" y1="150" x2="160" y2="150" stroke="#B99DCC" strokeWidth="2" />
            <line x1="80" y1="170" x2="160" y2="170" stroke="#B99DCC" strokeWidth="2" />
            <line x1="80" y1="190" x2="140" y2="190" stroke="#B99DCC" strokeWidth="2" />

            {/* X mark */}
            <circle cx="260" cy="200" r="50" fill="none" stroke="#D4B5F0" strokeWidth="3" />
            <line x1="230" y1="170" x2="290" y2="230" stroke="#FF6B6B" strokeWidth="4" />
            <line x1="290" y1="170" x2="230" y2="230" stroke="#FF6B6B" strokeWidth="4" />

            {/* Decorative dots */}
            <circle cx="150" cy="280" r="4" fill="#8B7AB8" />
            <circle cx="180" cy="300" r="3" fill="#B99DCC" />
            <circle cx="320" cy="280" r="5" fill="#8B7AB8" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">No assignments yet</h2>
        <p className="text-gray-600 text-center max-w-md mb-8">
          Create your first assignment to start collecting and grading student submissions. You can set up
          rubrics, define marking criteria, and let AI assist with grading.
        </p>

        <button className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Your First Assignment
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
