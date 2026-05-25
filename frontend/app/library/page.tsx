'use client'

import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function LibraryPage() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="w-64 fixed left-0 top-0 h-screen">
        <Sidebar />
      </div>

      <main className="flex-1 ml-64 p-6 space-y-6">
        <Header title="My Library" backLink="/" />
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-gray-600">My Library coming soon...</p>
        </div>
      </main>
    </div>
  )
}
