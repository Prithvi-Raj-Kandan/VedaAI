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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-12 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
            <LogIn className="h-4 w-4 text-orange-400" />
            Sign in page
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Keep auth separate and simple.</h1>
            <p className="max-w-xl text-base leading-7 text-slate-300">
              Sign in with email and password, then open your assignments. If you do not have an account yet, go to the sign-up page first.
            </p>
          </div>

          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 font-medium text-white transition-colors hover:bg-white/10">
            Back to home
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
          <form onSubmit={handleSignIn} className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Existing account</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Sign in</h2>
            </div>
            <input
              value={signinEmail}
              onChange={(event) => setSigninEmail(event.target.value)}
              placeholder="Email"
              type="email"
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-orange-400"
            />
            <input
              value={signinPassword}
              onChange={(event) => setSigninPassword(event.target.value)}
              placeholder="Password"
              type="password"
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="submit"
              disabled={isSigningIn}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition-colors hover:bg-slate-100 disabled:opacity-70"
            >
              {isSigningIn && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>

            <p className="pt-2 text-sm text-slate-300">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-orange-400 hover:text-orange-300">
                Sign-Up
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
