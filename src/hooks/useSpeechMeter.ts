import { useState, useCallback } from "react";

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

type SpeechRecognitionType = {
  new (): SpeechRecognitionType;
  lang: string;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType;
    webkitSpeechRecognition: SpeechRecognitionType;
  }
}

export const useSpeechMeter = (targetText: string) => {
  const [score, setScore] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEvaluation = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Navegador no compatible con reconocimiento de voz");
      return;
    }

    setError(null);
    setIsListening(true);

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0];
      const transcript = result[0].transcript.toLowerCase();
      const confidence = result[0].confidence;

      let finalScore = 0;
      const targetLower = targetText.toLowerCase().trim();
      
      if (transcript.includes(targetLower) || targetLower.includes(transcript)) {
        finalScore = Math.round(confidence * 100);
      } else {
        const words = targetLower.split(" ").filter(w => w.length > 0);
        const matchedWords = words.filter(w => transcript.includes(w));
        finalScore = Math.round((matchedWords.length / words.length) * confidence * 50);
      }

      setScore(Math.max(0, Math.min(100, finalScore)));
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [targetText]);

  const resetScore = useCallback(() => {
    setScore(0);
    setError(null);
  }, []);

  return { score, isListening, error, startEvaluation, resetScore };
};