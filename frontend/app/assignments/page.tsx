'use client'

import Sidebar from '@/components/Sidebar'
import AssignmentsList from '@/components/AssignmentsList'

export default function AssignmentsPage() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="w-64 fixed left-0 top-0 h-screen">
        <Sidebar />
      </div>

      <main className="flex-1 ml-64 p-6 space-y-6">
        <AssignmentsList />
      </main>
    </div>
  )
}
