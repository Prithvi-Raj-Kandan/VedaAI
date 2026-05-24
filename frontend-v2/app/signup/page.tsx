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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-12 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <UserPlus className="h-4 w-4 text-orange-400" />
            Sign up page
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Create your account.</h1>
            <p className="max-w-xl text-base leading-7 text-slate-300">
              Enter your name, email, and password, then continue to sign in with the same email and password.
            </p>
          </div>

          <Link href="/signin" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition-colors hover:bg-white/10">
            Back to sign in
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
          <form onSubmit={handleSignUp} className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-orange-400">New account</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Sign up</h2>
            </div>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-orange-400"
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email ID"
              type="email"
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-orange-400"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="submit"
              disabled={isSigningUp}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 font-semibold text-slate-950 transition-colors hover:bg-orange-400 disabled:opacity-70"
            >
              {isSigningUp && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign Up
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}