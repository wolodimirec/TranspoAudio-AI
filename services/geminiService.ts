import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult } from "../types";

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeAudioTrack = async (file: File): Promise<GeminiAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing via process.env.API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = await blobToBase64(file);

  // We trim the file size limit logic for simplicity, assuming reasonable MP3 uploads.
  // In production, one might upload only the first 30 seconds for faster analysis.
  
  const prompt = `
    Analyze this audio track. Provide a music theory analysis.
    Identify the BPM (Tempo), the Key (Root and Scale), the Genre, and a short description of the mood/instrumentation.
    Also list the likely chord progression for the main section.
  `;

  // Define schema for structured JSON output
  const schema = {
    type: Type.OBJECT,
    properties: {
      bpm: { type: Type.STRING, description: "Estimated BPM, e.g. '120'" },
      key: { type: Type.STRING, description: "Musical Key, e.g. 'C Minor'" },
      genre: { type: Type.STRING, description: "Primary genre" },
      description: { type: Type.STRING, description: "Brief description of mood and instruments" },
      chords: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of estimated chords"
      }
    },
    required: ["bpm", "key", "genre", "description", "chords"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type || 'audio/mp3',
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as GeminiAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};