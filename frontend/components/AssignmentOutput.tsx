"use client"

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useAssignmentStore } from '@/hooks/useAssignmentStore'
import { apiFetch } from '@/lib/api'
import { useUserStore } from '@/store/useUserStore'

interface AssignmentOutputProps {
  assignmentId?: string
}

export default function AssignmentOutput({ assignmentId }: AssignmentOutputProps) {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const [id, setId] = useState<string | null>(assignmentId || null)
  const [isLoading, setIsLoading] = useState(true)

  const { setActiveAssignment, setGeneratedData, assignmentStatus, generatedData } = useAssignmentStore()

  const [assignment, setAssignment] = useState<any>(null)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const paper = useMemo(() => generatedData || assignment?.generatedPaper, [assignment?.generatedPaper, generatedData])
  const paperIsLoading = assignmentStatus === 'pending' || assignmentStatus === 'processing' || (!paper && assignmentStatus !== 'failed')

  const fetchAssignment = async (assignmentId: string) => {
    try {
      setIsLoading(true)
      const res = await apiFetch(`/api/assignment/${assignmentId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAssignment(data)
      setGeneratedData(data.generatedPaper || null, data.status || 'pending')

      if (data.status === 'completed') {
        setGeneratedData(data.generatedPaper, 'completed')
      }

      if (data.activeVersion) {
        setSelectedVersion(data.activeVersion)
        return
      }

      const versions = data.generatedPaperVersions || []
      if (versions.length > 0) {
        const latest = versions.reduce((acc: any, curr: any) => (curr.versionNumber > acc.versionNumber ? curr : acc), versions[0])
        setSelectedVersion(latest.versionNumber)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const paramId = assignmentId || params?.get('id') || null
    setId(paramId)
    if (!paramId) return
    fetchAssignment(paramId)
    setActiveAssignment(paramId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId])

  useEffect(() => {
    if (!id || assignmentStatus === 'completed' || assignmentStatus === 'failed') {
      return
    }

    const intervalId = window.setInterval(() => {
      fetchAssignment(id).catch(() => {})
    }, 2000)

    return () => window.clearInterval(intervalId)
  }, [id, assignmentStatus])

  useEffect(() => {
    if (assignmentStatus === 'completed') {
      if (id) fetchAssignment(id).catch(() => {})
      setIsRegenerating(false)
    }

    if (assignmentStatus === 'failed') {
      setIsRegenerating(false)
    }
  }, [assignmentStatus])

  

  const handleDownloadPDF = async () => {
    const currentPaper = generatedData || assignment?.generatedPaper
    if (!currentPaper?.sections?.length) {
      toast.error('No generated paper available to download')
      return
    }

    try {
      const loading = toast.loading('Preparing PDF...')
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
      doc.setFont('helvetica', 'normal')
      doc.setLineHeightFactor(1.15)

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 48
      const contentWidth = pageWidth - margin * 2
      let y = margin

      const formatDifficulty = (value: any) => {
        const difficulty = String(value || 'medium').toLowerCase()
        if (difficulty === 'easy') return { label: 'EASY', fill: [220, 252, 231] as [number, number, number], text: [22, 101, 52] as [number, number, number] }
        if (difficulty === 'hard') return { label: 'HARD', fill: [254, 226, 226] as [number, number, number], text: [153, 27, 27] as [number, number, number] }
        return { label: 'MEDIUM', fill: [254, 249, 195] as [number, number, number], text: [161, 98, 7] as [number, number, number] }
      }

      const drawPageHeader = (continued = false) => {
        y = margin
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(continued ? 14 : 22)
        doc.text(continued ? `${assignment?.title || 'ASSESSMENT'} (continued)` : (assignment?.title || 'ASSESSMENT'), pageWidth / 2, continued ? y + 8 : y + 14, { align: 'center' })

        if (continued) {
          doc.setDrawColor(17, 24, 39)
          doc.setLineWidth(1)
          doc.line(margin, y + 20, pageWidth - margin, y + 20)
          y += 34
          return
        }

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.text(`Total Marks: ${assignment?.totalMarks || 100}`, margin, y + 42)
        doc.text('Time Allowed: 2 Hours', pageWidth - margin, y + 42, { align: 'right' })

        doc.setDrawColor(17, 24, 39)
        doc.setLineWidth(1.2)
        doc.line(margin, y + 54, pageWidth - margin, y + 54)

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Name:', margin, y + 92)
        doc.text('Date:', pageWidth / 2 + 30, y + 92)
        doc.text('Roll No:', margin, y + 124)
        doc.text('Section:', pageWidth / 2 + 30, y + 124)

        doc.setDrawColor(180, 180, 180)
        doc.setLineWidth(0.7)
        doc.line(margin + 50, y + 95, pageWidth / 2 - 18, y + 95)
        doc.line(pageWidth / 2 + 75, y + 95, pageWidth - margin, y + 95)
        doc.line(margin + 66, y + 127, pageWidth / 2 - 18, y + 127)
        doc.line(pageWidth / 2 + 87, y + 127, pageWidth - margin, y + 127)

        y += 160
      }

      const ensureSpace = (requiredHeight: number) => {
        if (y + requiredHeight > pageHeight - margin) {
          doc.addPage()
          drawPageHeader(true)
        }
      }

      const drawSection = (section: any, sectionIndex: number) => {
        const sectionTitle = section?.title || `Section ${sectionIndex + 1}`
        const sectionInstruction = section?.instruction || ''

        const titleHeight = sectionInstruction ? 48 : 34
        ensureSpace(titleHeight + 18)

        doc.setFillColor(245, 245, 245)
        doc.setDrawColor(17, 24, 39)
        doc.setLineWidth(1.2)
        doc.rect(margin, y, contentWidth, titleHeight, 'F')
        doc.line(margin, y, margin, y + titleHeight)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text(sectionTitle, margin + 12, y + 20)

        if (sectionInstruction) {
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(10)
          doc.text(doc.splitTextToSize(sectionInstruction, contentWidth - 24), margin + 12, y + 36)
        }

        y += titleHeight + 14

        ;(section.questions || []).forEach((question: any, questionIndex: number) => {
          const questionText = String(question?.questionText || '')
          const wrappedQuestion = doc.splitTextToSize(questionText, contentWidth - 66)
          const questionHeight = wrappedQuestion.length * 15 + 28
          ensureSpace(questionHeight + 8)

          doc.setFont('helvetica', 'bold')
          doc.setFontSize(11)
          doc.text(`Q${questionIndex + 1}.`, margin, y)

          doc.setFont('helvetica', 'normal')
          doc.setFontSize(11)
          doc.text(wrappedQuestion, margin + 34, y)

          const badge = formatDifficulty(question?.difficulty)
          const badgeY = y + wrappedQuestion.length * 15 + 5
          doc.setFillColor(...badge.fill)
          doc.setDrawColor(...badge.fill)
          doc.rect(margin + 34, badgeY, 56, 16, 'F')
          doc.setTextColor(...badge.text)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(8.5)
          doc.text(badge.label, margin + 62, badgeY + 10.5, { align: 'center' })

          doc.setTextColor(75, 85, 99)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(10)
          doc.text(`[${question?.marks || 0} ${Number(question?.marks) === 1 ? 'Mark' : 'Marks'}]`, margin + 96, badgeY + 10.5)

          y = badgeY + 26
        })
      }

      drawPageHeader(false)
      currentPaper.sections.forEach((section: any, index: number) => drawSection(section, index))

      const footerY = Math.min(pageHeight - margin + 6, y + 24)
      if (footerY < pageHeight - 20) {
        doc.setDrawColor(209, 213, 219)
        doc.setLineWidth(0.8)
        doc.line(margin, footerY, pageWidth - margin, footerY)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(156, 163, 175)
        doc.text('*** End of Paper ***', pageWidth / 2, footerY + 18, { align: 'center' })
      }

      doc.save(`${assignment?.title || 'Assignment'}.pdf`)
      toast.dismiss(loading)
      toast.success('PDF downloaded')
    } catch (error) {
      console.error('PDF export failed:', error)
      toast.dismiss()
      toast.error('PDF download failed')
    }
  }

  const handleRegenerate = async () => {
    if (!id) return
    try {
      setIsRegenerating(true)
      const res = await apiFetch(`/api/assignment/${id}/regenerate`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to regenerate')
      setGeneratedData(null, 'pending')
    } catch (err) {
      console.error(err)
      toast.error('Failed to regenerate assignment')
      setIsRegenerating(false)
    }
  }

  const handleVersionSelect = (versionNumber: number) => {
    setSelectedVersion(versionNumber)
    const version = assignment?.generatedPaperVersions?.find((v: any) => v.versionNumber === versionNumber)
    if (version) setGeneratedData(version.generatedPaper, 'completed')
  }



  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 px-8 py-14 shadow-2xl backdrop-blur">
          <div className="text-2xl font-bold">Sign in to view this assignment</div>
          <p className="text-slate-300">Assignments are now tied to the signed-in user profile.</p>
          <Link href="/signin" className="inline-flex rounded-full bg-white px-6 py-3 font-medium text-slate-900 hover:bg-slate-100">
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  if (paperIsLoading) {
    return (
      <div className="h-full min-h-screen bg-slate-950 px-6 py-8 text-center text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-6 rounded-3xl border border-white/10 bg-white/5 px-6 py-16 shadow-2xl backdrop-blur">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-400 border-t-transparent" />
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Generating Question Paper</h2>
            <p className="mx-auto max-w-xl text-slate-300">Generating response...</p>
          </div>
        </div>
      </div>
    )
  }

  if (assignmentStatus === 'failed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 px-8 py-14 shadow-2xl backdrop-blur">
          <div className="text-2xl font-bold text-red-300">Generation Failed</div>
          <button onClick={() => router.push('/assignments/create')} className="rounded-full bg-white px-6 py-3 font-medium text-slate-900 hover:bg-slate-100">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl backdrop-blur">
        <button onClick={() => router.back()} className="text-slate-300 hover:text-white transition-colors">Back</button>
        <div className="flex items-center gap-3">
          {(assignment?.generatedPaperVersions?.length || 0) > 0 && (
            <select
              value={selectedVersion ?? ''}
              onChange={(e) => handleVersionSelect(Number(e.target.value))}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900"
            >
              {(assignment?.generatedPaperVersions || []).slice().sort((a: any, b: any) => b.versionNumber - a.versionNumber).map((version: any) => (
                <option key={version.versionNumber} value={version.versionNumber}>
                  Version {version.versionNumber} ({version.source})
                </option>
              ))}
            </select>
          )}
          <button onClick={handleRegenerate} disabled={isRegenerating} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-medium text-slate-900 hover:bg-slate-100 disabled:opacity-70">
            <RefreshCw className="h-4 w-4" />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
          <button onClick={handleDownloadPDF} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-medium text-slate-900 hover:bg-slate-100">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl bg-white px-10 py-12 shadow-2xl ring-1 ring-black/5 sm:px-14">
        <div className="border-b-2 border-slate-900 pb-6 text-center">
          <h1 className="mt-3 text-3xl font-bold text-slate-950">{assignment?.title || 'ASSESSMENT'}</h1>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm font-medium text-slate-600">
            <span>Total Marks: {assignment?.totalMarks || targetTotalMarksPlaceholder(assignment)}</span>
            <span>Time Allowed: 2 Hours</span>
          </div>
        </div>

        <div className="grid gap-4 border-b border-slate-200 py-8 text-sm font-medium text-slate-900 sm:grid-cols-2">
          <div className="flex items-end gap-3">
            <span className="whitespace-nowrap">Name:</span>
            <div className="flex-1 border-b border-slate-300" />
          </div>
          <div className="flex items-end gap-3">
            <span className="whitespace-nowrap">Date:</span>
            <div className="flex-1 border-b border-slate-300" />
          </div>
          <div className="flex items-end gap-3">
            <span className="whitespace-nowrap">Roll No:</span>
            <div className="flex-1 border-b border-slate-300" />
          </div>
          <div className="flex items-end gap-3">
            <span className="whitespace-nowrap">Section:</span>
            <div className="flex-1 border-b border-slate-300" />
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <p className="font-medium text-slate-900">All questions are compulsory unless stated otherwise.</p>

          <div className="space-y-10">
            {paper?.sections?.map((section: any, sIndex: number) => (
              <div key={sIndex} className="space-y-4">
                <div className="border-l-4 border-slate-900 bg-slate-50 px-4 py-3">
                  <h3 className="text-lg font-bold text-slate-950">{section.title}</h3>
                  {section.instruction && <p className="mt-1 text-sm italic text-slate-600">{section.instruction}</p>}
                </div>

                <div className="space-y-6 pl-2">
                  {section.questions?.map((question: any, qIndex: number) => (
                    <div key={qIndex} className="break-inside-avoid-page">
                      <div className="flex gap-3">
                        <span className="min-w-[32px] font-semibold text-slate-950">Q{qIndex + 1}.</span>
                        <div className="flex-1 space-y-2">
                            <p className="leading-relaxed text-slate-900">{question.questionText}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                              String(question.difficulty || '').toLowerCase() === 'easy'
                                ? 'bg-green-100 text-green-700'
                                : String(question.difficulty || '').toLowerCase() === 'hard'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {String(question.difficulty || 'medium')}
                            </span>
                            <span className="text-sm font-semibold text-slate-500">
                              [{question.marks} {Number(question.marks) === 1 ? 'Mark' : 'Marks'}]
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-200 text-center text-xs uppercase tracking-[0.35em] text-slate-400">
            *** End of Paper ***
          </div>
        </div>
      </div>
    </div>
  )
}

function targetTotalMarksPlaceholder(assignment: any) {
  return assignment?.targetTotalMarks || assignment?.totalMarks || 100
}
