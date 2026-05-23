import Link from 'next/link';

export default function OutputPage() {
  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Topbar */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-4 text-gray-600">
          <Link href="/assignments/create" className="hover:text-gray-900 transition-colors flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
             <span className="text-sm font-medium">Create New</span>
          </Link>
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

      {/* Main Content */}
      <div className="flex-1 p-8 pb-24 flex justify-center">
        <div className="w-full max-w-4xl">
          
          {/* Top AI Status Banner */}
          <div className="bg-[#1f2937] text-white rounded-2xl p-6 mb-8 flex items-center justify-between shadow-md">
            <div>
              <p className="text-sm font-medium text-gray-200">
                Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:
              </p>
            </div>
            <button className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download as PDF
            </button>
          </div>

          {/* The Question Paper Document */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 max-w-3xl mx-auto font-serif text-gray-900 leading-relaxed">
            
            {/* Document Header */}
            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold mb-2">Delhi Public School, Sector-4, Bokaro</h1>
              <p className="text-lg font-semibold">Subject: Science</p>
              <p className="text-lg font-semibold">Class: 8th</p>
            </div>

            {/* Exam Details */}
            <div className="flex justify-between font-medium mb-6">
              <p>Time Allowed: 45 minutes</p>
              <p>Maximum Marks: 20</p>
            </div>
            
            <p className="italic mb-8 border-b border-gray-300 pb-4">All questions are compulsory unless stated otherwise.</p>

            {/* Student Info Lines */}
            <div className="space-y-4 mb-12">
              <p className="font-medium">Name: <span className="inline-block w-64 border-b border-black"></span></p>
              <p className="font-medium">Roll Number: <span className="inline-block w-64 border-b border-black"></span></p>
              <p className="font-medium">Class: 8th Section: <span className="inline-block w-48 border-b border-black"></span></p>
            </div>

            {/* Section A */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-center mb-6">Section A</h2>
              
              <div className="mb-6">
                <h3 className="font-bold text-lg">Short Answer Questions</h3>
                <p className="italic text-sm text-gray-600">Attempt all questions. Each question carries 2 marks</p>
              </div>

              <div className="space-y-6">
                <Question 
                  num="1" 
                  diff="Easy" 
                  text="Define electroplating. Explain its purpose." 
                  marks="2" 
                />
                <Question 
                  num="2" 
                  diff="Moderate" 
                  text="What is the role of a conductor in the process of electrolysis?" 
                  marks="2" 
                />
                <Question 
                  num="3" 
                  diff="Easy" 
                  text="Why does a solution of copper sulfate conduct electricity?" 
                  marks="2" 
                />
                <Question 
                  num="4" 
                  diff="Moderate" 
                  text="Describe one example of the chemical effect of electric current in daily life." 
                  marks="2" 
                />
                <Question 
                  num="5" 
                  diff="Moderate" 
                  text="Explain why electric current is said to have chemical effects." 
                  marks="2" 
                />
                <Question 
                  num="6" 
                  diff="Challenging" 
                  text="How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved." 
                  marks="2" 
                />
                <Question 
                  num="7" 
                  diff="Challenging" 
                  text="What happens at the cathode and anode during the electrolysis of water? Name the gases evolved." 
                  marks="2" 
                />
              </div>
            </div>

            <div className="text-center font-bold my-12 pt-8 border-t border-gray-300">
              End of Question Paper
            </div>

            {/* Answer Key */}
            <div>
              <h3 className="font-bold text-lg mb-4">Answer Key:</h3>
              <ol className="list-decimal list-outside pl-5 space-y-4 text-sm">
                <li>Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.</li>
                <li>A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes.</li>
                <li>Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity.</li>
              </ol>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function Question({ num, diff, text, marks }) {
  // Map difficulty to a badge color (optional subtle styling)
  let diffColor = "text-gray-500 bg-gray-100";
  if (diff === "Easy") diffColor = "text-green-700 bg-green-50 border-green-200";
  if (diff === "Moderate") diffColor = "text-yellow-700 bg-yellow-50 border-yellow-200";
  if (diff === "Challenging") diffColor = "text-red-700 bg-red-50 border-red-200";

  return (
    <div className="flex gap-2">
      <span className="font-medium">{num}.</span>
      <div>
        <span className={`inline-block px-2 py-0.5 text-xs rounded border ${diffColor} font-sans mr-2 align-middle`}>
          {diff}
        </span>
        <span className="align-middle">
          {text} <span className="font-semibold ml-1">[{marks} Marks]</span>
        </span>
      </div>
    </div>
  );
}
