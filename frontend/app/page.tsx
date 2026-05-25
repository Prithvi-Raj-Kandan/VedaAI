'use client'

import Link from 'next/link'

import { ArrowRight, BookOpen, LogIn, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-16">
        <div className="w-full space-y-8">
          <div className="space-y-4 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Veda AI Assignment Generator
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Generate assignments with a simple flow.</h1>
            <p className="mx-auto max-w-xl text-base leading-7 text-slate-600">An AI academic system for assessment, teaching, and personalised learning.</p>
          </div>

          <div className="mx-auto w-full max-w-md">
            <Link href="/signin" className="group block rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-md transition-all hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Auth</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Sign-In</h2>
                </div>
                <LogIn className="h-6 w-6 text-orange-500 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">Open the sign-in page to enter your email and password.</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
