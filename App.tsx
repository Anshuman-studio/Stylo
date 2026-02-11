
import React, { useState, useEffect, useCallback } from 'react';
import { AppStatus, ImageData, GenerationResult } from './types';
import ImageUploader from './components/ImageUploader';
import { generateBlendedImage } from './services/geminiService';

// Extend window for AI Studio helpers. 
// Using the AIStudio interface name to match existing global definitions and avoid modifier conflicts.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [adultImage, setAdultImage] = useState<ImageData | null>(null);
  const [childImage, setChildImage] = useState<ImageData | null>(null);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = useCallback(async () => {
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setStatus('key-selection');
        return false;
      }
      return true;
    } catch (e) {
      console.error("Error checking API key:", e);
      return false;
    }
  }, []);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success after opening dialog
      setStatus('idle');
    } catch (e) {
      setError("Failed to open key selection dialog.");
    }
  };

  const handleGenerate = async () => {
    if (!adultImage || !childImage) return;

    const hasKey = await checkApiKey();
    if (!hasKey) return;

    setStatus('generating');
    setError(null);

    try {
      const data = await generateBlendedImage(adultImage, childImage);
      setResult({
        imageUrl: data.imageUrl,
        explanation: data.text
      });
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setStatus('key-selection');
        setError("Your API key session might have expired or is invalid. Please select it again.");
      } else {
        setError(err.message || "An unexpected error occurred during image generation.");
        setStatus('error');
      }
    }
  };

  const reset = () => {
    setAdultImage(null);
    setChildImage(null);
    setResult(null);
    setStatus('idle');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Style</h1>
          </div>
          {status === 'success' && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {status === 'key-selection' ? (
          <div className="max-w-md mx-auto text-center space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mt-12">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">API Key Required</h2>
              <p className="text-slate-500">To use Gemini 3 Pro models, you must select your own API key from a paid Google Cloud project.</p>
            </div>
            <div className="pt-4 space-y-4">
              <button
                onClick={handleSelectKey}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Select API Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-sm text-indigo-600 hover:underline"
              >
                Learn about API billing
              </a>
            </div>
            {error && <p className="text-red-500 text-sm mt-4 bg-red-50 p-3 rounded-xl">{error}</p>}
          </div>
        ) : status === 'success' && result ? (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Your Blended Moment</h2>
              <p className="text-slate-500">Advanced AI synthesis has created this unique memory based on your inputs.</p>
            </div>
            
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 max-w-4xl mx-auto">
              <div className="aspect-square w-full relative">
                <img 
                  src={result.imageUrl} 
                  alt="Blended result" 
                  className="w-full h-full object-cover"
                />
              </div>
              {result.explanation && (
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                   <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Model Description</h3>
                   <p className="text-slate-700 italic leading-relaxed">"{result.explanation}"</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <a 
                href={result.imageUrl} 
                download="style-blended-moment.png"
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Masterpiece
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <section className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Capture the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Perfect Embrace</span>
              </h2>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                Upload two separate photos. Our high-fidelity AI will synthesize them into a realistic, emotionally resonant moment of connection.
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <ImageUploader 
                label="Step 1: The Adult"
                image={adultImage}
                onUpload={setAdultImage}
                onClear={() => setAdultImage(null)}
                placeholder="Upload adult portrait"
              />
              <ImageUploader 
                label="Step 2: The Child"
                image={childImage}
                onUpload={setChildImage}
                onClear={() => setChildImage(null)}
                placeholder="Upload child portrait"
              />
            </div>

            <div className="pt-8 flex flex-col items-center gap-6">
              <button
                disabled={!adultImage || !childImage || status === 'generating'}
                onClick={handleGenerate}
                className={`
                  w-full max-w-md px-8 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl
                  ${(!adultImage || !childImage) 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 shadow-indigo-200'}
                `}
              >
                {status === 'generating' ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Synthesizing Moment...
                  </span>
                ) : 'Generate Warm Embrace'}
              </button>

              {status === 'generating' && (
                <div className="space-y-2 text-center animate-pulse">
                  <p className="text-indigo-600 font-medium">Using Nano Banana Pro deep learning...</p>
                  <p className="text-slate-400 text-sm">Aligning lighting, textures, and features for realism.</p>
                </div>
              )}

              {error && (
                <div className="max-w-md bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 items-start">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 mt-20">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
             <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <p className="text-sm font-semibold tracking-wider text-slate-800 uppercase">Style AI Studio</p>
          </div>
          <p className="text-slate-400 text-sm text-center">
            Powered by Gemini 3 Pro • High-Quality Image Generation
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <span className="hover:text-indigo-600 cursor-pointer">Privacy</span>
            <span className="hover:text-indigo-600 cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
