'use client';

import { useRouter } from 'next/navigation';
import { Hammer, ArrowLeft } from 'lucide-react';

interface UnderDevelopmentProps {
  feature?: string;
  message?: string;
}

export default function UnderDevelopment({ 
  feature = 'This feature',
  message = 'We\'re working hard to bring you an amazing experience. Check back soon!'
}: UnderDevelopmentProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50/50 p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <Hammer className="w-16 h-16 text-orange-500 opacity-75" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {feature} is Under Development
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            {message}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            We're building this feature to make VedaAI even better. Stay tuned!
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
