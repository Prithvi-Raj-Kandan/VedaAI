'use client'

import { Bell, ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  title?: string
  backLink?: string
}

export default function Header({ title, backLink }: HeaderProps) {
  return (
    <header className="bg-white rounded-3xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          {backLink && (
            <Link href={backLink} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-300 to-orange-400 rounded-lg flex items-center justify-center text-sm font-bold text-white">
              JD
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  )
}
