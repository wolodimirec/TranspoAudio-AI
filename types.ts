export interface AudioState {
  file: File | null;
  buffer: AudioBuffer | null;
  duration: number;
  isPlaying: boolean;
  currentTime: number;
  isLoaded: boolean;
}

export interface AudioSettings {
  pitch: number; // Semitones (-12 to +12)
  tempo: number; // Multiplier (0.5 to 2.0)
  volume: number; // Decibels or linear gain (0 to 1)
}

export interface GeminiAnalysisResult {
  bpm: number | string;
  key: string;
  genre: string;
  description: string;
  chords: string[];
}

export interface AnalysisState {
  loading: boolean;
  result: GeminiAnalysisResult | null;
  error: string | null;
}