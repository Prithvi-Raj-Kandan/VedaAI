import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex-1 h-full flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto p-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">VedaAI — AI Assessment Creator</h1>
        <p className="text-gray-600 mb-8">Create, generate, and export professional question papers using AI. Sign up to get started.</p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800">Sign Up</Link>
          <Link href="/signin" className="px-6 py-3 bg-white border border-gray-200 rounded-full font-medium hover:bg-gray-50">Sign In</Link>
          <Link href="/assignments" className="px-6 py-3 text-sm text-gray-600 underline">Browse Assignments</Link>
        </div>
      </div>
    </div>
  );
}
