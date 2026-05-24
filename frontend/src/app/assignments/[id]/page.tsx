'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { Download, RefreshCw, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AssignmentOutputPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { 
    connectSocket, 
    disconnectSocket, 
    setActiveAssignment, 
    assignmentStatus, 
    generatedData,
    setGeneratedData
  } = useAssignmentStore();
  
  const [assignment, setAssignment] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const hydrateAssignment = (data: any) => {
    setAssignment(data);

    if (data.status === 'completed') {
      setGeneratedData(data.generatedPaper, 'completed');
    }

    if (data.activeVersion) {
      setSelectedVersion(data.activeVersion);
      return;
    }

    const versions = data.generatedPaperVersions || [];
    if (versions.length > 0) {
      const latest = versions.reduce((acc: any, curr: any) => {
        return curr.versionNumber > acc.versionNumber ? curr : acc;
      }, versions[0]);
      setSelectedVersion(latest.versionNumber);
    }
  };

  const fetchAssignment = async () => {
    const response = await fetch(`http://localhost:8000/api/assignment/${id}`);
    if (!response.ok) throw new Error('Failed to fetch assignment');
    const data = await response.json();
    hydrateAssignment(data);
  };

  useEffect(() => {
    fetchAssignment()
      .catch(err => console.error(err));

    connectSocket();
    setActiveAssignment(id);

    return () => {
      // Optional cleanup
    };
  }, [id]);

  useEffect(() => {
    if (assignmentStatus === 'completed') {
      fetchAssignment().catch((err) => console.error(err));
      setIsRegenerating(false);
    }

    if (assignmentStatus === 'failed') {
      setIsRegenerating(false);
    }
  }, [assignmentStatus]);

  const handleDownloadPDF = async () => {
    const paper = generatedData || assignment?.generatedPaper;
    if (!paper?.sections?.length) {
      toast.error('No generated paper available to download');
      return;
    }

    try {
      const loadingToast = toast.loading('Preparing PDF...');

      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' });
      doc.setFont('helvetica', 'normal');
      doc.setLineHeightFactor(1.15);

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 48;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const formatDifficulty = (value: any) => {
        const difficulty = String(value || 'medium').toLowerCase();
        if (difficulty === 'easy') return { label: 'EASY', fill: [220, 252, 231] as [number, number, number], text: [22, 101, 52] as [number, number, number] };
        if (difficulty === 'hard') return { label: 'HARD', fill: [254, 226, 226] as [number, number, number], text: [153, 27, 27] as [number, number, number] };
        return { label: 'MEDIUM', fill: [254, 249, 195] as [number, number, number], text: [161, 98, 7] as [number, number, number] };
      };

      const drawPageHeader = (continued = false) => {
        y = margin;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(continued ? 14 : 22);
        doc.text(continued ? `${assignment?.title || 'ASSESSMENT'} (continued)` : (assignment?.title || 'ASSESSMENT'), pageWidth / 2, continued ? y + 8 : y + 14, { align: 'center' });

        if (continued) {
          doc.setDrawColor(17, 24, 39);
          doc.setLineWidth(1);
          doc.line(margin, y + 20, pageWidth - margin, y + 20);
          y += 34;
          return;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Total Marks: ${assignment?.totalMarks || 100}`, margin, y + 42);
        doc.text('Time Allowed: 2 Hours', pageWidth - margin, y + 42, { align: 'right' });

        doc.setDrawColor(17, 24, 39);
        doc.setLineWidth(1.2);
        doc.line(margin, y + 54, pageWidth - margin, y + 54);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Name:', margin, y + 92);
        doc.text('Date:', pageWidth / 2 + 30, y + 92);
        doc.text('Roll No:', margin, y + 124);
        doc.text('Section:', pageWidth / 2 + 30, y + 124);

        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.7);
        doc.line(margin + 50, y + 95, pageWidth / 2 - 18, y + 95);
        doc.line(pageWidth / 2 + 75, y + 95, pageWidth - margin, y + 95);
        doc.line(margin + 66, y + 127, pageWidth / 2 - 18, y + 127);
        doc.line(pageWidth / 2 + 87, y + 127, pageWidth - margin, y + 127);

        y += 160;
      };

      const ensureSpace = (requiredHeight: number) => {
        if (y + requiredHeight > pageHeight - margin) {
          doc.addPage();
          drawPageHeader(true);
        }
      };

      const writeWrappedText = (text: string, x: number, width: number) => {
        const lines = doc.splitTextToSize(text || '', width);
        doc.text(lines, x, y);
        y += lines.length * 15;
      };

      const drawSection = (section: any, sectionIndex: number) => {
        const sectionTitle = section?.title || `Section ${sectionIndex + 1}`;
        const sectionInstruction = section?.instruction || '';

        const titleHeight = sectionInstruction ? 48 : 34;
        ensureSpace(titleHeight + 18);

        doc.setFillColor(245, 245, 245);
        doc.setDrawColor(17, 24, 39);
        doc.setLineWidth(1.2);
        doc.rect(margin, y, contentWidth, titleHeight, 'F');
        doc.line(margin, y, margin, y + titleHeight);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(sectionTitle, margin + 12, y + 20);

        if (sectionInstruction) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(10);
          doc.text(doc.splitTextToSize(sectionInstruction, contentWidth - 24), margin + 12, y + 36);
        }

        y += titleHeight + 14;

        (section.questions || []).forEach((question: any, questionIndex: number) => {
          const questionText = String(question?.questionText || '');
          const wrappedQuestion = doc.splitTextToSize(questionText, contentWidth - 66);
          const questionHeight = wrappedQuestion.length * 15 + 28;
          ensureSpace(questionHeight + 8);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(`Q${questionIndex + 1}.`, margin, y);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.text(wrappedQuestion, margin + 34, y);

          const badge = formatDifficulty(question?.difficulty);
          const badgeY = y + wrappedQuestion.length * 15 + 5;
          doc.setFillColor(...badge.fill);
          doc.setDrawColor(...badge.fill);
          doc.rect(margin + 34, badgeY, 56, 16, 'F');
          doc.setTextColor(...badge.text);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text(badge.label, margin + 62, badgeY + 10.5, { align: 'center' });

          doc.setTextColor(75, 85, 99);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(`[${question?.marks || 0} ${Number(question?.marks) === 1 ? 'Mark' : 'Marks'}]`, margin + 96, badgeY + 10.5);

          y = badgeY + 26;
        });
      };

      drawPageHeader(false);
      paper.sections.forEach((section: any, index: number) => drawSection(section, index));

      const footerY = Math.min(pageHeight - margin + 6, y + 24);
      if (footerY < pageHeight - 20) {
        doc.setDrawColor(209, 213, 219);
        doc.setLineWidth(0.8);
        doc.line(margin, footerY, pageWidth - margin, footerY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text('*** End of Paper ***', pageWidth / 2, footerY + 18, { align: 'center' });
      }

      doc.save(`${assignment?.title || 'Assignment'}.pdf`);
      toast.dismiss(loadingToast);
      toast.success('PDF downloaded');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.dismiss();
      toast.error('PDF download failed');
    }
  };

  const renderSections = (paper: any) => {
    if (!paper?.sections?.length) {
      return null;
    }

    return paper.sections.map((section: any, sIndex: number) => (
      <div key={sIndex} className="space-y-4 break-inside-avoid-page">
        <div className="border-l-4 border-gray-900 bg-gray-50 px-4 py-3">
          <h3 className="text-base font-bold text-gray-900">{section.title}</h3>
          {section.instruction && <p className="text-sm text-gray-600 italic mt-1">{section.instruction}</p>}
        </div>

        <div className="space-y-6 px-2">
          {section.questions?.map((q: any, qIndex: number) => (
            <div key={qIndex} className="break-inside-avoid-page">
              <div className="flex gap-3">
                <span className="font-semibold text-gray-900 min-w-[28px]">Q{qIndex + 1}.</span>
                <div className="flex-1 space-y-2">
                  <p className="text-gray-900 leading-relaxed text-base">{q.questionText}</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      q.difficulty?.toLowerCase() === 'easy' ? 'bg-green-100 text-green-700' :
                      q.difficulty?.toLowerCase() === 'hard' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {q.difficulty}
                    </span>
                    <span className="text-sm font-semibold text-gray-500">
                      [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const response = await fetch(`http://localhost:8000/api/assignment/${id}/regenerate`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate assignment');
      }

      setGeneratedData(null, 'pending');
    } catch (error) {
      console.error(error);
      toast.error('Failed to regenerate assignment');
      setIsRegenerating(false);
    }
  };

  const handleVersionSelect = (versionNumber: number) => {
    setSelectedVersion(versionNumber);
    const version = assignment?.generatedPaperVersions?.find((v: any) => v.versionNumber === versionNumber);
    if (version) {
      setGeneratedData(version.generatedPaper, 'completed');
    }
  };

  if (assignmentStatus === 'pending' || assignmentStatus === 'processing' || (!generatedData && assignmentStatus !== 'failed')) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50/50">
        <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Question Paper</h2>
        <p className="text-gray-500 max-w-md mb-8">
          AI is analyzing your requirements and structuring the perfect assessment...
        </p>
        <div className="flex flex-col gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-green-500" /> Requirements parsed successfully
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-sm border border-orange-100">
            {assignmentStatus === 'processing' ? <Loader2 className="w-5 h-5 animate-spin text-orange-500" /> : <Loader2 className="w-5 h-5 animate-spin text-gray-300" />} Structuring sections & questions
          </div>
        </div>
      </div>
    );
  }

  if (assignmentStatus === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-red-500 mb-4 text-xl">⚠️ Generation Failed</div>
        <button onClick={() => router.push('/assignments/create')} className="text-blue-500 hover:underline">Try Again</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 overflow-hidden">
      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center px-8 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900 truncate max-w-xs">{assignment?.title}</h2>
        </div>
        <div className="flex gap-3 items-center">
          {(assignment?.generatedPaperVersions?.length || 0) > 0 && (
            <div className="flex items-center gap-2">
              <select
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                value={selectedVersion ?? ''}
                onChange={(e) => handleVersionSelect(Number(e.target.value))}
              >
                {(assignment.generatedPaperVersions || [])
                  .slice()
                  .sort((a: any, b: any) => b.versionNumber - a.versionNumber)
                  .map((version: any) => (
                    <option key={version.versionNumber} value={version.versionNumber}>
                      Version {version.versionNumber} ({version.source})
                    </option>
                  ))}
              </select>
            </div>
          )}
          <button 
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Paper Container */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-4xl mx-auto bg-white p-12 shadow-sm border border-gray-200 rounded-sm" style={{ minHeight: '1056px' }}>
          {/* Header */}
          <div className="text-center mb-10 pb-6 border-b-2 border-gray-900">
            <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{assignment?.title || 'ASSESSMENT'}</h1>
            <div className="flex justify-between text-sm font-medium text-gray-600 mt-4 px-4">
              <span>Total Marks: {assignment?.totalMarks || 100}</span>
              <span>Time Allowed: 2 Hours</span>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-12 px-4">
            <div className="flex items-end">
              <span className="font-semibold mr-3 whitespace-nowrap text-gray-800">Name:</span>
              <div className="flex-1 border-b border-gray-300"></div>
            </div>
            <div className="flex items-end">
              <span className="font-semibold mr-3 whitespace-nowrap text-gray-800">Date:</span>
              <div className="flex-1 border-b border-gray-300"></div>
            </div>
            <div className="flex items-end">
              <span className="font-semibold mr-3 whitespace-nowrap text-gray-800">Roll No:</span>
              <div className="flex-1 border-b border-gray-300"></div>
            </div>
            <div className="flex items-end">
              <span className="font-semibold mr-3 whitespace-nowrap text-gray-800">Section:</span>
              <div className="flex-1 border-b border-gray-300"></div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-12">
            {renderSections(generatedData)}
          </div>
          
          <div className="mt-20 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 uppercase tracking-widest">
            *** End of Paper ***
          </div>
        </div>
      </div>

    </div>
  );
}
