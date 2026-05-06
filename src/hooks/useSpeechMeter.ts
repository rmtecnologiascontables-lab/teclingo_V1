import { useState, useCallback, useRef, useEffect } from "react";

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
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType;
    webkitSpeechRecognition: SpeechRecognitionType;
  }
}

export type AccentType = "us" | "uk";

interface AnalysisResult {
  similarity: number;
  phoneticAccuracy: number;
  rhythmIntonation: number;
}

export const useSpeechMeter = (targetText: string) => {
  const [score, setScore] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accent, setAccent] = useState<AccentType>("us");
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [transcript, setTranscript] = useState("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isAnalyzerActiveRef = useRef(false);

  const startAudioAnalyzer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = source;
      source.connect(analyser);

      isAnalyzerActiveRef.current = true;

      const updateAnalyzer = () => {
        if (!analyserRef.current || !isAnalyzerActiveRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average / 255);

        const frequencyValues = Array.from(dataArray).map(v => v / 255);
        setFrequencyData(frequencyValues);

        if (isAnalyzerActiveRef.current) {
          animationFrameRef.current = requestAnimationFrame(updateAnalyzer);
        }
      };

      updateAnalyzer();
    } catch (e) {
      console.warn("Microphone access denied:", e);
    }
  }, []);

  const stopAudioAnalyzer = useCallback(() => {
    isAnalyzerActiveRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAudioLevel(0);
    setFrequencyData([]);
  }, []);

  const startEvaluation = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Navegador no compatible con reconocimiento de voz");
      return;
    }

    setError(null);
    setScore(0);
    setAnalysis(null);
    setTranscript("");
    setAudioLevel(0);
    setFrequencyData([]);
    setIsListening(true);

    startAudioAnalyzer();

    const lang = accent === "uk" ? "en-GB" : "en-US";
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    const calculateAnalysis = (transcriptResult: string, confidenceScore: number): AnalysisResult => {
      const targetLower = targetText.toLowerCase().trim();
      const transcriptLower = transcriptResult.toLowerCase();
      
      const targetWords = targetLower.split(" ").filter(w => w.length > 0);
      const transcriptWords = transcriptLower.split(" ").filter(w => w.length > 0);
      const matchedWords = targetWords.filter(w => transcriptLower.includes(w));
      
      const similarity = Math.round((matchedWords.length / targetWords.length) * confidenceScore * 100);
      
      const phoneticScore = Math.max(60, Math.round(confidenceScore * 100 - 15 + Math.random() * 10));
      
      const rhythmScore = Math.max(50, Math.round(
        (similarity * 0.4) + (confidenceScore * 60) + (transcriptWords.length / Math.max(1, targetWords.length) * 20)
      ));

      return {
        similarity: Math.min(100, similarity),
        phoneticAccuracy: Math.min(100, phoneticScore),
        rhythmIntonation: Math.min(100, rhythmScore),
      };
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0];
      const spoken = result[0].transcript;
      const confidence = result[0].confidence;

      setTranscript(spoken);

      const finalScore = Math.round(confidence * 100);
      setScore(finalScore);

      const analysisResult = calculateAnalysis(spoken, confidence);
      setAnalysis(analysisResult);

      stopAudioAnalyzer();
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Error: ${event.error}`);
      stopAudioAnalyzer();
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        stopAudioAnalyzer();
        setIsListening(false);
      }
    };

    recognition.start();
  }, [targetText, accent, startAudioAnalyzer, stopAudioAnalyzer]);

  const setAccentType = useCallback((newAccent: AccentType) => {
    setAccent(newAccent);
  }, []);

  const resetScore = useCallback(() => {
    setScore(0);
    setError(null);
    setAnalysis(null);
    setTranscript("");
    setAudioLevel(0);
    setFrequencyData([]);
  }, []);

  useEffect(() => {
    return () => {
      stopAudioAnalyzer();
    };
  }, [stopAudioAnalyzer]);

  return { 
    score, 
    isListening, 
    error, 
    startEvaluation, 
    resetScore,
    accent,
    setAccentType,
    audioLevel,
    frequencyData,
    analysis,
    transcript
  };
};