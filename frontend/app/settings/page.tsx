'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { apiFetch } from '@/lib/api'
import { useUserStore, type AppUser } from '@/store/useUserStore'
import { toast } from 'sonner'
import { ArrowRight, LogOut, UserCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { user, signIn, signOut } = useUserStore()
  const [assignmentCount, setAssignmentCount] = useState<number | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiFetch('/api/user/me')
        if (!response.ok) {
          return
        }

        const data = await response.json()
        if (data?.user) {
          signIn(data.user as AppUser)
          setAssignmentCount(data.assignmentCount ?? 0)
        }
      } finally {
        setLoadingProfile(false)
      }
    }

    if (user) {
      setLoadingProfile(false)
      loadProfile().catch(() => {})
      return
    }

    loadProfile().catch(() => {})
  }, [signIn, user])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-screen w-64">
        <Sidebar />
      </div>

      <main className="ml-64 flex-1 space-y-6 p-6">
        <Header title="Profile & Settings" backLink="/" />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <UserCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Profile</p>
                <h2 className="text-xl font-bold text-gray-900">{user?.displayName || 'Guest User'}</h2>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm text-gray-700">
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-gray-500">Email</p>
                <p className="mt-1 font-medium text-gray-900">{user?.email || 'Not signed in'}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-gray-500">Assignments</p>
                <p className="mt-1 font-medium text-gray-900">
                  {loadingProfile ? 'Loading...' : `${assignmentCount ?? 0} assignment(s)`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                signOut()
                setAssignmentCount(0)
                toast.success('Signed out')
                router.replace('/signin')
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>

            <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-800">
              Authentication now lives on the sign-in page.
              <Link href="/signin" className="ml-2 inline-flex items-center gap-1 font-semibold text-orange-600 hover:text-orange-700">
                Go to sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
