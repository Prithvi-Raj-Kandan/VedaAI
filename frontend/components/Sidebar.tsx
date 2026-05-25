'use client'

import { LayoutGrid, Users, FileText, Zap, Clock, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const menuItems = [
    { icon: LayoutGrid, label: 'Home', path: '/' },
    { icon: Users, label: 'My Groups', path: '/groups' },
    { icon: FileText, label: 'Assignments', path: '/assignments', badge: '10' },
    { icon: Zap, label: "AI Teacher's Toolkit", path: '/toolkit' },
    { icon: Clock, label: 'My Library', path: '/library', badge: '32' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white rounded-3xl shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">V</span>
          </div>
          <span className="text-xl font-bold text-gray-900">VedaAI</span>
        </div>
      </div>

      {/* Create Assignment Button */}
      <div className="p-4 w-full">
        <Link href="/create" className="w-full py-3 px-4 bg-gray-800 text-white rounded-full font-semibold flex items-center justify-center gap-2 border-2 border-orange-500 hover:shadow-lg transition-all">
          <span className="text-lg">✨</span>
          Create Assignment
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Settings & Profile */}
      <div className="border-t p-4 space-y-2">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
            isActive('/settings')
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>

        {/* School Card */}
        <div className="bg-orange-50 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
              🏫
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Delhi Public School</p>
              <p className="text-xs text-gray-600">Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
