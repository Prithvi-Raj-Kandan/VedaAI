import Link from 'next/link';

export default function AssignmentsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Topbar */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4 text-gray-600">
          <button className="hover:text-gray-900 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-lg font-medium text-gray-900">Assignment</h1>
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

      {/* Main Content - Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {/* Abstract Illustration Placeholder */}
        <div className="w-64 h-64 relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-100 rounded-full opacity-50 scale-75"></div>
          <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <line x1="10" y1="9" x2="8" y2="9"></line>
          </svg>
          {/* Magnifying Glass overlay */}
          <div className="absolute bottom-4 right-4 bg-white rounded-full shadow-lg p-2 flex items-center justify-center z-20">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">No assignments yet</h2>
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
          Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
        </p>

        <Link 
          href="/assignments/create"
          className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full transition-colors flex items-center gap-2 shadow-sm"
        >
          <span>+</span>
          <span>Create Your First Assignment</span>
        </Link>
      </div>
    </div>
  );
}
