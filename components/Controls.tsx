import React from 'react';
import { AudioSettings } from '../types';
import { Minus, Plus, Gauge, Music2, MicOff, Mic } from 'lucide-react';

interface ControlsProps {
  settings: AudioSettings;
  onUpdate: (settings: Partial<AudioSettings>) => void;
  disabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ settings, onUpdate, disabled }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl space-y-8">
      
      {/* Pitch Control */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-slate-200">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-indigo-400" />
            <span className="font-medium tracking-wide">Transpozycja (Tonacja)</span>
          </div>
          <span className="text-xl font-bold font-mono text-indigo-400">
            {settings.pitch > 0 ? '+' : ''}{settings.pitch} st
          </span>
        </div>
        
        <div className="relative">
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={settings.pitch}
              disabled={disabled}
              onChange={(e) => onUpdate({ pitch: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
             <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
                <span>-12</span>
                <span>0</span>
                <span>+12</span>
            </div>
        </div>
        
        <div className="flex justify-center gap-4">
            <button 
                onClick={() => onUpdate({ pitch: settings.pitch - 1 })}
                disabled={disabled || settings.pitch <= -12}
                className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
                <Minus size={16} />
            </button>
            <button 
                onClick={() => onUpdate({ pitch: 0 })}
                disabled={disabled}
                className="px-4 py-1 rounded-full text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-colors font-mono"
            >
                RESET
            </button>
            <button 
                onClick={() => onUpdate({ pitch: settings.pitch + 1 })}
                disabled={disabled || settings.pitch >= 12}
                className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
                <Plus size={16} />
            </button>
        </div>
      </div>

      <div className="h-px bg-slate-700/50" />

      {/* Tempo Control */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-slate-200">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-400" />
            <span className="font-medium tracking-wide">Tempo (Szybkość)</span>
          </div>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {Math.round(settings.tempo * 100)}%
          </span>
        </div>

        <div className="relative">
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={settings.tempo}
              disabled={disabled}
              onChange={(e) => onUpdate({ tempo: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
                <span>50%</span>
                <span>100%</span>
                <span>200%</span>
            </div>
        </div>

        <div className="flex justify-center gap-4">
            <button 
                onClick={() => onUpdate({ tempo: Math.max(0.5, settings.tempo - 0.1) })}
                disabled={disabled}
                className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
                <Minus size={16} />
            </button>
            <button 
                onClick={() => onUpdate({ tempo: 1.0 })}
                disabled={disabled}
                className="px-4 py-1 rounded-full text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-colors font-mono"
            >
                RESET
            </button>
            <button 
                onClick={() => onUpdate({ tempo: Math.min(2.0, settings.tempo + 0.1) })}
                disabled={disabled}
                className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
                <Plus size={16} />
            </button>
        </div>
      </div>

      <div className="h-px bg-slate-700/50" />

      {/* Vocal Remover Control */}
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.isVocalRemoving ? (
                <MicOff className="w-5 h-5 text-rose-400" />
            ) : (
                <Mic className="w-5 h-5 text-slate-400" />
            )}
            <div className="flex flex-col">
                <span className={`font-medium tracking-wide ${settings.isVocalRemoving ? 'text-rose-400' : 'text-slate-200'}`}>
                    Usuń Wokal
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Efekt Karaoke (Stereo)
                </span>
            </div>
          </div>
          
          <button
            onClick={() => onUpdate({ isVocalRemoving: !settings.isVocalRemoving })}
            disabled={disabled}
            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
                ${settings.isVocalRemoving ? 'bg-rose-500' : 'bg-slate-700'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings.isVocalRemoving ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
      </div>

    </div>
  );
};