import { Sparkles } from 'lucide-react';
import ClientImageEditor from '@/components/ClientImageEditor';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium mb-4 animate-fade-in-up">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Gemini 2.5 Flash Image</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Transform Images with <span className="text-indigo-600">AI Magic</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload an image and describe how you want to change it. 
            From style transfers to object removal, just ask.
          </p>
        </div>

        {/* Editor Component */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <ClientImageEditor />
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-gray-500 pb-8">
          <p>Built with Next.js & Google Gemini API</p>
        </footer>

      </div>
    </main>
  );
}
