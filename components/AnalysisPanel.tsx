import React from 'react';
import { AnalysisState } from '../types';
import { Sparkles, Activity, Music4, Info, Loader2 } from 'lucide-react';

interface AnalysisPanelProps {
  state: AnalysisState;
  onAnalyze: () => void;
  hasFile: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ state, onAnalyze, hasFile }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          AI Asystent Muzyczny
        </h2>
        {hasFile && !state.result && !state.loading && (
          <button
            onClick={onAnalyze}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            Analizuj Utwór
          </button>
        )}
      </div>

      {!hasFile && !state.result && (
        <div className="text-center py-8 text-slate-400 text-sm">
          Wgraj plik MP3 aby otrzymać analizę tonacji i tempa.
        </div>
      )}

      {state.loading && (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-indigo-200 animate-pulse text-sm">Gemini analizuje Twój utwór...</p>
        </div>
      )}

      {state.error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm">
          {state.error}
        </div>
      )}

      {state.result && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                <Activity size={12} /> BPM
              </div>
              <div className="text-2xl font-bold text-white">{state.result.bpm}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                <Music4 size={12} /> Tonacja
              </div>
              <div className="text-2xl font-bold text-indigo-300">{state.result.key}</div>
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info size={12} /> Opis i Gatunek
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-1">
              <span className="text-indigo-400 font-semibold">{state.result.genre}</span>
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              {state.result.description}
            </p>
          </div>

          <div>
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">
              Sugerowane Akordy
            </div>
            <div className="flex flex-wrap gap-2">
              {state.result.chords.map((chord, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-full text-xs font-mono text-emerald-300">
                  {chord}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};