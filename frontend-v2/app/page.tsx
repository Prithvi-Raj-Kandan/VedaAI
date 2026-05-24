'use client'

import Link from 'next/link'

import { ArrowRight, BookOpen, LogIn, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur sm:p-10">
          <div className="space-y-4 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200">
              <Sparkles className="h-4 w-4 text-orange-400" />
              Veda AI Assignment Generator
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Generate assignments with a simple flow.</h1>
            
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link href="/signin" className="group rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-left transition-all hover:border-orange-400/40 hover:bg-slate-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Auth</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Sign-In</h2>
                </div>
                <LogIn className="h-5 w-5 text-orange-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">Open the sign-in page to enter your email and password.</p>
            </Link>

            
          </div>
        </div>
      </section>
    </main>
  )
}
