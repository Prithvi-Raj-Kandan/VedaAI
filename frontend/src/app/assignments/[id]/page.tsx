'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { Download, RefreshCw, Loader2, FileText, CheckCircle2 } from 'lucide-react';

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
  const [isRestoringVersion, setIsRestoringVersion] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

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
      setIsRestoringVersion(false);
    }

    if (assignmentStatus === 'failed') {
      setIsRegenerating(false);
      setIsRestoringVersion(false);
    }
  }, [assignmentStatus]);

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin:       0.5,
      filename:     `${assignment?.title || 'Assignment'}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(printRef.current).save();
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

  const handleRestoreVersion = async () => {
    if (!selectedVersion) return;

    try {
      setIsRestoringVersion(true);
      const response = await fetch(`http://localhost:8000/api/assignment/${id}/versions/${selectedVersion}/restore`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to restore version');
      }

      const data = await response.json();
      hydrateAssignment(data.assignment);
      setIsRestoringVersion(false);
    } catch (error) {
      console.error(error);
      setIsRestoringVersion(false);
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
              <button
                onClick={handleRestoreVersion}
                disabled={!selectedVersion || isRestoringVersion}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {isRestoringVersion ? 'Restoring...' : 'Restore'}
              </button>
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
        <div 
          ref={printRef}
          className="max-w-4xl mx-auto bg-white p-12 shadow-sm border border-gray-200 rounded-sm"
          style={{ minHeight: '1056px' }}
        >
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
            {generatedData?.sections?.map((section: any, sIndex: number) => (
              <div key={sIndex} className="space-y-6">
                <div className="bg-gray-50/80 p-4 border-l-4 border-gray-900 rounded-r-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{section.title}</h3>
                  {section.instruction && <p className="text-sm text-gray-600 italic">{section.instruction}</p>}
                </div>
                
                <div className="space-y-8 px-4">
                  {section.questions?.map((q: any, qIndex: number) => (
                    <div key={qIndex} className="flex gap-4">
                      <span className="font-semibold text-gray-900 min-w-[24px]">Q{qIndex + 1}.</span>
                      <div className="flex-1 space-y-3">
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
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 uppercase tracking-widest">
            *** End of Paper ***
          </div>
        </div>
      </div>
    </div>
  );
}
