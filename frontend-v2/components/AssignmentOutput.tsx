'use client'

import { Download } from 'lucide-react'

export default function AssignmentOutput() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-gray-400">Create New</span>
      </div>

      {/* AI Generated Banner */}
      <div className="bg-gray-800 rounded-2xl p-6 text-white">
        <p className="mb-3">
          Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes
          on the NCERT chapters:
        </p>
        <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-colors">
          <Download className="w-4 h-4" />
          Download as PDF
        </button>
      </div>

      {/* Question Paper */}
      <div className="bg-white rounded-2xl p-12 shadow-xl max-w-4xl mx-auto">
        {/* School Header */}
        <div className="text-center mb-8 pb-8 border-b-2 border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Delhi Public School, Sector-4, Bokaro
          </h1>
          <p className="text-lg text-gray-600 mb-1">Subject: English</p>
          <p className="text-lg text-gray-600">Class: 5th</p>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-gray-900 font-medium">Time Allowed: 45 minutes</p>
            <p className="text-gray-900 font-medium mt-1">Maximum Marks: 20</p>
          </div>
          <div></div>
        </div>

        {/* Instructions */}
        <p className="text-gray-900 mb-8 font-medium">
          All questions are compulsory unless stated otherwise.
        </p>

        {/* Student Info */}
        <div className="mb-8 space-y-2 font-medium text-gray-900">
          <p>Name: _________________</p>
          <p>Roll Number: _____________</p>
          <p>Class: 5th Section: _________</p>
        </div>

        {/* Section A */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Section A</h2>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Short Answer Questions</h3>
            <p className="text-sm text-gray-600 italic mb-6">Attempt all questions. Each question carries 2 marks</p>

            <ol className="space-y-4 text-gray-900">
              <li>
                <span className="font-medium">1. [Easy] Define electroplating. Explain its purpose. [2 Marks]</span>
              </li>
              <li>
                <span className="font-medium">
                  2. [Moderate] What is the role of a conductor in the process of electrolysis? [2 Marks]
                </span>
              </li>
              <li>
                <span className="font-medium">
                  3. [Easy] Why does a solution of copper sulfate conduct electricity? [2 Marks]
                </span>
              </li>
              <li>
                <span className="font-medium">
                  4. [Moderate] Describe one example of the chemical effect of electric current in daily life.
                  [2 Marks]
                </span>
              </li>
              <li>
                <span className="font-medium">
                  5. [Moderate] Explain why electric current is said to have chemical effects. [2 Marks]
                </span>
              </li>
              <li>
                <span className="font-medium">
                  6. [Challenging] How is sodium hydroxide prepared during the electrolysis of brine? Write the
                  chemical reaction involved. [2 Marks]
                </span>
              </li>
              <li>
                <span className="font-medium">
                  7. [Challenging] What happens at the cathode and anode during the electrolysis of water? Name the
                  gases evolved. [2 Marks]
                </span>
              </li>
              <li>
                <span className="font-medium">
                  8. [Easy] Mention the type of current used in electroplating and justify why it is used. [2 Marks]
                </span>
              </li>
              <li>
                <span className="font-medium">
                  9. [Moderate] What is the importance of electric current in the field of metallurgy? [2 Marks]
                </span>
              </li>
              <li>
                <span className="font-medium">
                  10. [Challenging] Explain with a chemical equation how copper is deposited during the electroplating
                  of an object. [2 Marks]
                </span>
              </li>
            </ol>
          </div>

          <p className="text-gray-900 font-bold">End of Question Paper</p>
        </div>

        {/* Answer Key */}
        <div className="mt-12 pt-8 border-t-2 border-gray-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Answer Key:</h2>

          <ol className="space-y-4 text-gray-700">
            <li>
              <span className="font-medium">1. </span>
              Electroplating is the process of depositing a thin layer of metal on the surface of another metal
              using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.
            </li>
            <li>
              <span className="font-medium">2. </span>
              A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling
              chemical changes at electrodes.
            </li>
            <li>
              <span className="font-medium">3. </span>
              Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus
              conducting electricity.
            </li>
            <li>
              <span className="font-medium">4. </span>
              An example is the electroplating of silver on jewelry to prevent tarnishing.
            </li>
            <li>
              <span className="font-medium">5. </span>
              Electric current causes the movement of ions leading to chemical changes at the electrodes, hence it
              shows chemical effects.
            </li>
            <li>
              <span className="font-medium">6. </span>
              Sodium hydroxide is formed at the cathode during brine electrolysis as water gains electrons:
              <div className="ml-4 mt-2 font-mono text-sm">
                2H₂O + 2e⁻ → H₂ + 2OH⁻
                <br />
                Na⁺ + OH⁻ → NaOH (in solution)
              </div>
            </li>
            <li>
              <span className="font-medium">7. </span>
              At the cathode: water is reduced to hydrogen gas and hydroxide ions.
              <br />
              At the anode: water is oxidized to oxygen gas and hydrogen ions.
            </li>
            <li>
              <span className="font-medium">8. </span>
              Direct current (DC) is used in electroplating because it ensures unidirectional flow of electrons,
              allowing controlled deposition of metal.
            </li>
            <li>
              <span className="font-medium">9. </span>
              Electric current is used in metallurgy for extracting metals from their ores (electrolysis) and for
              refining impure metals.
            </li>
            <li>
              <span className="font-medium">10. </span>
              During electroplating of copper, the object acts as the cathode where copper ions are reduced and
              deposited: Cu²⁺ + 2e⁻ → Cu
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
