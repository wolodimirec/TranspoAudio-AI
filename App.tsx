import React, { useState, useRef } from 'react';
import { Upload, Play, Pause, Volume2 } from 'lucide-react';
import { useAudioEngine } from './hooks/useAudioEngine';
import { Controls } from './components/Controls';
import { AnalysisPanel } from './components/AnalysisPanel';
import { AnalysisState } from './types';
import { analyzeAudioTrack } from './services/geminiService';

const App: React.FC = () => {
  const { 
    audioState, 
    settings, 
    loadFile, 
    togglePlay, 
    updateSettings 
  } = useAudioEngine();

  const [analysis, setAnalysis] = useState<AnalysisState>({
    loading: false,
    result: null,
    error: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic check for audio type
      if (!file.type.startsWith('audio/')) {
        alert("Proszę wgrać plik audio (MP3, WAV)");
        return;
      }
      await loadFile(file);
      // Reset analysis when new file loads
      setAnalysis({ loading: false, result: null, error: null });
    }
  };

  const handleGeminiAnalysis = async () => {
    if (!audioState.file) return;

    setAnalysis(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await analyzeAudioTrack(audioState.file);
      setAnalysis({ loading: false, result, error: null });
    } catch (e: any) {
      setAnalysis({ loading: false, result: null, error: e.message || "Błąd analizy AI" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              TranspoAudio AI
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            v1.0.0
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Player & Controls (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* File Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer group
              ${audioState.isLoaded 
                ? 'border-indigo-500/30 bg-indigo-500/5' 
                : 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50'
              }
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept="audio/mp3,audio/wav,audio/mpeg"
              className="hidden" 
            />
            <div className="flex flex-col items-center justify-center text-center">
              {audioState.isLoaded ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3">
                    <Volume2 className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-1">
                    {audioState.file?.name}
                  </h3>
                  <p className="text-sm text-slate-400">Kliknij aby zmienić plik</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-1">
                    Wgraj plik MP3
                  </h3>
                  <p className="text-sm text-slate-500">
                    Kliknij tutaj aby wybrać plik z urządzenia
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Main Controls */}
          <div className="relative">
             {!audioState.isLoaded && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] z-10 rounded-2xl flex items-center justify-center">
                    <span className="text-slate-400 font-medium">Wgraj utwór aby odblokować kontrolę</span>
                </div>
             )}
             <Controls 
               settings={settings} 
               onUpdate={updateSettings} 
               disabled={!audioState.isLoaded} 
             />
          </div>

          {/* Play/Pause Button (Sticky Action) */}
          <div className="sticky bottom-6 z-40">
             <button
               onClick={togglePlay}
               disabled={!audioState.isLoaded}
               className={`
                 w-full h-16 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl
                 ${audioState.isPlaying 
                   ? 'bg-red-500/90 hover:bg-red-600 text-white shadow-red-900/20' 
                   : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
                 }
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
               `}
             >
               {audioState.isPlaying ? (
                 <>
                   <Pause className="w-6 h-6 fill-current" /> PAUZA
                 </>
               ) : (
                 <>
                   <Play className="w-6 h-6 fill-current" /> ODTWARZAJ
                 </>
               )}
             </button>
          </div>

        </div>

        {/* Right Column: AI Analysis (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
           <AnalysisPanel 
             state={analysis} 
             onAnalyze={handleGeminiAnalysis} 
             hasFile={audioState.isLoaded}
           />
           
           <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-slate-400 font-medium mb-4 text-sm uppercase tracking-wider">Jak to działa?</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white shrink-0">1</span>
                      Aplikacja używa biblioteki <strong>Tone.js</strong> do zmiany tonacji w czasie rzeczywistym bez zmiany tempa.
                  </li>
                  <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white shrink-0">2</span>
                      Zmiana tempa jest niezależna od tonacji.
                  </li>
                  <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white shrink-0">3</span>
                      <strong>Gemini AI</strong> analizuje plik aby podać sugerowaną tonację, BPM i akordy, co ułatwia dobór transpozycji.
                  </li>
              </ul>
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;