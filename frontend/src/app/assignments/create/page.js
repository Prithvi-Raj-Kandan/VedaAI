"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function CreateAssignmentPage() {
  const [questionTypes, setQuestionTypes] = useState([
    { id: 1, type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { id: 2, type: 'Short Questions', count: 3, marks: 2 },
    { id: 3, type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
    { id: 4, type: 'Numerical Problems', count: 5, marks: 5 },
  ]);

  const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = questionTypes.reduce((sum, qt) => sum + (qt.count * qt.marks), 0);

  const updateCount = (id, delta) => {
    setQuestionTypes(qts => qts.map(qt => {
      if (qt.id === id) {
        return { ...qt, count: Math.max(0, qt.count + delta) };
      }
      return qt;
    }));
  };

  const updateMarks = (id, delta) => {
    setQuestionTypes(qts => qts.map(qt => {
      if (qt.id === id) {
        return { ...qt, marks: Math.max(0, qt.marks + delta) };
      }
      return qt;
    }));
  };

  const addQuestionType = () => {
    setQuestionTypes([...questionTypes, { id: Date.now(), type: 'New Question Type', count: 0, marks: 0 }]);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Topbar */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-4 text-gray-600">
          <Link href="/" className="hover:text-gray-900 transition-colors flex items-center justify-center p-1 rounded-full hover:bg-gray-100">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <h1 className="text-lg font-medium text-gray-900">Create Assignment</h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-gray-500 hover:text-gray-900 transition-colors relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span className="absolute top-0 right-0 w-2 h-2 bg-veda-orange rounded-full"></span>
          </button>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 py-1 px-2 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">JD</div>
            <span className="text-sm font-medium text-gray-700">John Doe</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <div className="flex-1 p-8 flex justify-center pb-24">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Assignment Details</h2>
            <p className="text-gray-500 mt-1">Basic information about your assignment</p>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center mb-8 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <p className="text-gray-900 font-medium mb-1">Choose a file or drag & drop it here</p>
            <p className="text-gray-500 text-sm mb-4">JPEG, PNG, upto 10 MB</p>
            <button className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Browse Files
            </button>
            <p className="text-xs text-gray-400 mt-4 text-center">Upload images of your preferred document/image</p>
          </div>

          {/* Due Date */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="DD-MM-YYYY" 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-veda-orange/20 focus:border-veda-orange transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
            </div>
          </div>

          {/* Question Types */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
               <label className="block text-sm font-medium text-gray-700">Question Type</label>
               <div className="flex gap-16 pr-8">
                 <span className="text-xs font-medium text-gray-500">No. of Questions</span>
                 <span className="text-xs font-medium text-gray-500">Marks</span>
               </div>
            </div>

            <div className="space-y-3">
              {questionTypes.map((qt) => (
                <div key={qt.id} className="flex items-center gap-4 bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{qt.type}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                  
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>

                  <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden w-28">
                    <button onClick={() => updateCount(qt.id, -1)} className="px-3 py-2 text-gray-500 hover:bg-gray-50 border-r border-gray-200">-</button>
                    <div className="flex-1 text-center text-sm font-medium">{qt.count}</div>
                    <button onClick={() => updateCount(qt.id, 1)} className="px-3 py-2 text-gray-500 hover:bg-gray-50 border-l border-gray-200">+</button>
                  </div>

                  <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden w-28">
                    <button onClick={() => updateMarks(qt.id, -1)} className="px-3 py-2 text-gray-500 hover:bg-gray-50 border-r border-gray-200">-</button>
                    <div className="flex-1 text-center text-sm font-medium">{qt.marks}</div>
                    <button onClick={() => updateMarks(qt.id, 1)} className="px-3 py-2 text-gray-500 hover:bg-gray-50 border-l border-gray-200">+</button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addQuestionType} className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">+</span>
              Add Question Type
            </button>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end gap-1 mb-8">
            <p className="text-sm text-gray-600 font-medium">Total Questions : <span className="text-gray-900">{totalQuestions}</span></p>
            <p className="text-sm text-gray-600 font-medium">Total Marks : <span className="text-gray-900">{totalMarks}</span></p>
          </div>

          {/* Additional Information */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information (For better output)</label>
            <div className="relative">
              <textarea 
                rows={4}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-veda-orange/20 focus:border-veda-orange transition-all resize-none bg-gray-50/50"
              />
              <div className="absolute bottom-4 right-4 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <button className="px-6 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <span>←</span> Previous
            </button>
            <Link href="/assignments/output" className="px-8 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2">
              Next <span>→</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
