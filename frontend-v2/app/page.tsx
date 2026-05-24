'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AssignmentsList from '@/components/AssignmentsList'
import AssignmentsEmpty from '@/components/AssignmentsEmpty'

export default function Home() {
  const [isEmpty, setIsEmpty] = useState(false)

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className="w-64 fixed left-0 top-0 h-screen p-3">
        <Sidebar />
      </div>

      <main className="flex-1 ml-64 p-6 space-y-6">
        {isEmpty ? <AssignmentsEmpty /> : <AssignmentsList />}
      </main>
    </div>
  )
}
