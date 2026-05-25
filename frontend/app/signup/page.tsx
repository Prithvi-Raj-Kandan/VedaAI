'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsSigningUp(true)
      const response = await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          displayName: name,
          email,
          password,
        }),
      })

      if (!response.ok) {
        let message = 'Failed to sign up'
        try {
          const data = await response.json()
          message = data?.message || message
        } catch {
          // ignore
        }
        throw new Error(message)
      }

      toast.success('Account created. Please sign in.')
      router.push(`/signin?email=${encodeURIComponent(email)}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign up failed')
    } finally {
      setIsSigningUp(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-16">
        <div className="w-full space-y-8">
          <div className="space-y-4 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              <UserPlus className="h-4 w-4 text-orange-500" />
              Sign up page
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Create your account.</h1>
            <p className="mx-auto max-w-xl text-base leading-7 text-slate-600">An AI academic system for assessment, teaching, and personalised learning.</p>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">New account</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">Sign up</h2>
                </div>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-orange-400"
                />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email ID"
                  type="email"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-orange-400"
                />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  type="password"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-70"
                >
                  {isSigningUp && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign Up
                </button>

                <p className="pt-2 text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link href="/signin" className="font-semibold text-orange-500 hover:text-orange-400">
                    Sign-In
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}