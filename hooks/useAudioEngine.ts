import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'https://esm.sh/tone@14.7.77';
import { AudioState, AudioSettings } from '../types';

export const useAudioEngine = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    file: null,
    buffer: null,
    duration: 0,
    isPlaying: false,
    currentTime: 0,
    isLoaded: false,
  });

  const [settings, setSettings] = useState<AudioSettings>({
    pitch: 0,
    tempo: 1.0,
    volume: 0, // 0dB
    isVocalRemoving: false,
  });

  // Tone.js References
  const playerRef = useRef<Tone.Player | null>(null);
  const pitchShiftRef = useRef<Tone.PitchShift | null>(null);
  const meterRef = useRef<Tone.Meter | null>(null);
  const crossFadeRef = useRef<Tone.CrossFade | null>(null);
  
  // Animation frame for tracking time
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize Tone Chain
    // Graph Overview:
    // Player -> [Splitter] -> (Left) + (-Right) -> [MonoSum] -> [KaraokeGain] -> CrossFade(B)
    // Player -----------------------------------------------------------------> CrossFade(A)
    // CrossFade -> PitchShift -> Meter -> Destination

    const pitchShift = new Tone.PitchShift({
      pitch: 0,
      windowSize: 0.1,
      delayTime: 0,
      feedback: 0
    }).toDestination();
    
    const meter = new Tone.Meter();
    pitchShift.connect(meter);

    const player = new Tone.Player();
    
    // Create CrossFade to switch between Normal (A) and VocalRemoved (B)
    const crossFade = new Tone.CrossFade(0); // 0 = 100% A (Normal)
    crossFade.connect(pitchShift);

    // --- Path A: Normal ---
    player.connect(crossFade.a);

    // --- Path B: Vocal Remover (Center Channel Cancellation) ---
    // 1. Split Stereo
    const split = new Tone.Split();
    player.connect(split);

    // 2. Invert Right Channel and Sum with Left
    // We sum Left (positive) and Right (negative).
    // Note: Tone.Gain sums its inputs.
    const rightInvert = new Tone.Gain(-1);
    const monoSum = new Tone.Gain(1); 
    
    // Connect Split Left (output 0) to Sum
    split.connect(monoSum, 0, 0);
    
    // Connect Split Right (output 1) to Inverter, then to Sum
    split.connect(rightInvert, 1, 0);
    rightInvert.connect(monoSum);

    // 3. Compensation Gain (L-R signals are often quieter)
    // Connecting Mono Sum to CrossFade B
    const compensationGain = new Tone.Gain(2.0); // Boost volume slightly
    monoSum.connect(compensationGain);
    compensationGain.connect(crossFade.b);

    // Save refs
    playerRef.current = player;
    pitchShiftRef.current = pitchShift;
    meterRef.current = meter;
    crossFadeRef.current = crossFade;

    return () => {
      // Cleanup
      player.dispose();
      pitchShift.dispose();
      meter.dispose();
      crossFade.dispose();
      split.dispose();
      rightInvert.dispose();
      monoSum.dispose();
      compensationGain.dispose();
    };
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setAudioState(prev => ({ ...prev, isLoaded: false, file }));
    
    const buffer = await file.arrayBuffer();
    const audioBuffer = await Tone.context.decodeAudioData(buffer);

    if (playerRef.current) {
      playerRef.current.buffer = new Tone.ToneAudioBuffer(audioBuffer);
      setAudioState(prev => ({
        ...prev,
        buffer: audioBuffer,
        duration: audioBuffer.duration,
        isLoaded: true,
        currentTime: 0
      }));
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!playerRef.current || !audioState.isLoaded) return;

    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    if (playerRef.current.state === 'started') {
      playerRef.current.stop();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    } else {
      const startOffset = audioState.currentTime >= audioState.duration ? 0 : audioState.currentTime;
      playerRef.current.start(undefined, startOffset);
      setAudioState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [audioState.isLoaded, audioState.currentTime, audioState.duration]);

  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      if (pitchShiftRef.current && newSettings.pitch !== undefined) {
        pitchShiftRef.current.pitch = newSettings.pitch;
      }
      
      if (playerRef.current && newSettings.tempo !== undefined) {
        playerRef.current.playbackRate = newSettings.tempo;
      }

      if (playerRef.current && newSettings.volume !== undefined) {
        playerRef.current.volume.value = newSettings.volume; 
      }

      if (crossFadeRef.current && newSettings.isVocalRemoving !== undefined) {
        // Smooth crossfade to avoid clicks
        crossFadeRef.current.fade.rampTo(newSettings.isVocalRemoving ? 1 : 0, 0.1);
      }

      return updated;
    });
  }, []);

  // Time Tracking Loop
  const updateLoop = useCallback(() => {
    // Optional: Add logic here to track playback time if needed for UI progress
    requestRef.current = requestAnimationFrame(updateLoop);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateLoop]);

  return {
    audioState,
    settings,
    loadFile,
    togglePlay,
    updateSettings,
    meterRef
  };
};