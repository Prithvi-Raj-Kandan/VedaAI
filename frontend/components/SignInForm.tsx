'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { useUserStore, type AppUser } from '@/store/useUserStore'

interface SignInFormProps {
  initialEmail?: string
}

export default function SignInForm({ initialEmail = '' }: SignInFormProps) {
  const router = useRouter()
  const { signIn } = useUserStore()
  const [signinEmail, setSigninEmail] = useState(initialEmail)
  const [signinPassword, setSigninPassword] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsSigningIn(true)
      const response = await apiFetch('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: signinEmail,
          password: signinPassword,
        }),
      })

      if (!response.ok) {
        let message = 'Failed to sign in'
        try {
          const data = await response.json()
          message = data?.message || message
        } catch {
          // ignore
        }
        throw new Error(message)
      }

      const data = await response.json()
      signIn(data.user as AppUser)
      toast.success('Signed in successfully')
      router.push('/assignments')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign in failed')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-slate-900 flex items-center justify-center">
      <section className="mx-auto w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
            <LogIn className="h-4 w-4 text-orange-500" />
            Sign in page
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Log in to your account.</h1>
            <p className="mx-auto max-w-xl text-base leading-7 text-slate-600">
              An AI academic system for assessment, teaching, and personalised learning.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Existing account</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Sign in</h2>
            </div>
            <input
              value={signinEmail}
              onChange={(event) => setSigninEmail(event.target.value)}
              placeholder="Email"
              type="email"
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-orange-400"
            />
            <input
              value={signinPassword}
              onChange={(event) => setSigninPassword(event.target.value)}
              placeholder="Password"
              type="password"
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="submit"
              disabled={isSigningIn}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-70"
            >
              {isSigningIn && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>

            <p className="pt-2 text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-orange-500 hover:text-orange-400">
                Sign-Up
              </Link>
            </p>

            <div className="pt-2 text-sm">
              <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Back to home
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
