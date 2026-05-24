'use client'

import Link from 'next/link'
import { BookOpen, Sparkles, ArrowRight, FileText } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              <Sparkles className="h-4 w-4 text-orange-400" />
              VedaAI assignment builder
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-white sm:text-6xl">
                Create school-ready Assignments.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Build an assignment, queue generation, review the live output, regenerate versions, and export a polished PDF without leaving the product flow.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/create" className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-slate-950 transition-colors hover:bg-orange-400">
                <FileText className="h-4 w-4" />
                Create Assignment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/assignments" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
                <BookOpen className="h-4 w-4" />
                View Assignments
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="space-y-4 rounded-2xl bg-slate-950/80 p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Workflow</p>
              <div className="space-y-3 text-sm text-slate-200">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">1. Add title, date, file, and question structure</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">2. Generate paper in the background</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">3. Review output, regenerate, or download PDF</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
