import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, RefreshCw, Volume2 } from "lucide-react";
import { useSpeechMeter, AccentType } from "@/hooks/useSpeechMeter";

interface AccentGaugeProps {
  targetText: string;
  phonetic?: string;
  label?: string;
  compact?: boolean;
}

const phoneticMap: Record<string, string> = {
  "hello": "/həˈloʊ/",
  "how are you today": "/haʊ ɑːr ju təˈdeɪ/",
  "welcome to techlingo english course": "/ˈwelkəm tuː ˈtɛkˈlɪŋoʊ ˈɪŋglɪʃ kɔːrs/",
  "architecture": "/ˈɑːrkɪtektʃər/",
  "technology": "/tɛkˈnɑːlədʒi/",
  "education": "/ˌɛdʒuˈkeɪʃən/",
  "international": "/ˌɪntərˈnæʃənəl/",
  "communication": "/kəmˌjuːnɪˈkeɪʃən/",
};

function getPhonetic(text: string): string {
  const lower = text.toLowerCase();
  return phoneticMap[lower] || `/${text.toLowerCase().split("").map(c => c === " " ? " " : c).join("")}/`;
}

function FrequencyVisualizer({ active, audioLevel, frequencyData }: { active: boolean; audioLevel: number; frequencyData?: number[] }) {
  const bars = 16;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const barWidth = width / bars - 2;
    const centerY = height / 2;

    for (let i = 0; i < bars; i++) {
      let barHeight: number;
      
      if (active && frequencyData && frequencyData.length > 0) {
        const dataIndex = Math.floor((i / bars) * frequencyData.length);
        const value = frequencyData[dataIndex] || 0;
        barHeight = Math.max(4, value * 36 + 4);
      } else {
        const baseHeight = active ? 10 + audioLevel * 30 : 4;
        barHeight = active 
          ? Math.max(4, baseHeight * (0.6 + Math.random() * 0.4)) 
          : 4;
      }

      const x = i * (barWidth + 2);
      const y = centerY - barHeight / 2;

      const intensity = active ? (audioLevel || 0.3) : 0.1;
      const r = Math.round(239 - intensity * 140);
      const g = Math.round(68 + intensity * 120);
      const b = Math.round(68);
      
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
      gradient.addColorStop(0.5, `rgb(${Math.max(0, r - 20)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 80)})`);
      gradient.addColorStop(1, `rgb(${r}, ${g}, ${b})`);

      ctx.fillStyle = gradient;
      ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      ctx.shadowBlur = active ? 10 : 0;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }
  }, [active, audioLevel, frequencyData]);

  return (
    <canvas 
      ref={canvasRef} 
      width={140} 
      height={40} 
      className="w-full h-10"
    />
  );
}

function Needle({ angle, isActive }: { angle: number; isActive: boolean }) {
  return (
    <motion.g>
      <defs>
        <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="70%" stopColor="#71717a" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.line
        x1="140"
        y1="140"
        x2="140"
        y2="50"
        stroke="url(#needleGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ rotate: angle }}
        transition={{ 
          type: isActive ? "tween" : "spring", 
          stiffness: isActive ? 300 : 120, 
          damping: isActive ? 20 : 15 
        }}
        style={{ transformOrigin: "140px 140px" }}
        filter="url(#neonGlow)"
      />
    </motion.g>
  );
}

export function AccentGauge({ targetText, phonetic, label = "Evaluación de Pronunciación", compact = false }: AccentGaugeProps) {
  const { score, isListening, error, startEvaluation, resetScore, accent, setAccentType, audioLevel, frequencyData, analysis, transcript } = useSpeechMeter(targetText);
  const [showResults, setShowResults] = useState(false);

  const actualPhonetic = phonetic || getPhonetic(targetText);
  const baseAngle = -90;
  const maxAngle = 90;
  
  const activeAngle = baseAngle + (audioLevel * 0.7) * (maxAngle - baseAngle);
  const finalAngle = baseAngle + (score / 100) * (maxAngle - baseAngle);
  const displayAngle = isListening ? activeAngle : finalAngle;

  useEffect(() => {
    if (!isListening && score > 0) {
      setShowResults(true);
    } else if (!isListening) {
      setShowResults(false);
    }
  }, [isListening, score]);

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-zinc-900/80 rounded-xl border border-zinc-700/50">
        <svg width="160" height="100" viewBox="0 0 160 100">
          <defs>
            <linearGradient id="gaugeGradientCompact" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path
            d="M 20 90 A 60 60 0 0 1 140 90"
            fill="none"
            stroke="url(#gaugeGradientCompact)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <Needle angle={displayAngle} isActive={isListening} />
          <circle cx="80" cy="90" r="6" fill="#fff" />
          <text x="80" y="65" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold">
            {score}%
          </text>
        </svg>
        
        <div className="flex gap-2">
          <button
            onClick={startEvaluation}
            disabled={isListening}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-600 rounded-lg text-white text-sm font-medium transition-colors"
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {isListening ? "Escuchando..." : "Evaluar"}
          </button>
          {score > 0 && (
            <button
              onClick={resetScore}
              className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-zinc-300 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
        
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-950/90 rounded-2xl border border-zinc-800 shadow-2xl max-w-[400px] mx-auto">
      <div className="text-center">
        <h3 className="text-base font-semibold text-zinc-100">{label}</h3>
      </div>

      {/* Mobile-first: stacked vertical layout */}
      <div className="flex flex-col gap-4">
        {/* Top: Gauge + Controls */}
        <div className="flex flex-col items-center">
          <svg width="180" height="100" viewBox="0 0 280 160" className="w-full max-w-[200px]">
            <defs>
              <linearGradient id="gaugeGradientFull" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glowFull">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            <path
              d="M 30 140 A 110 110 0 0 1 250 140"
              fill="none"
              stroke="url(#gaugeGradientFull)"
              strokeWidth="12"
              strokeLinecap="round"
              filter="url(#glowFull)"
            />
            
            <path
              d="M 30 140 A 110 110 0 0 1 250 140"
              fill="none"
              stroke="#27272a"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.3"
            />
            
            <Needle angle={displayAngle} isActive={isListening} />
            
            <circle cx="140" cy="140" r="10" fill="#18181b" stroke="#fff" strokeWidth="3" />
            
            <text x="30" y="165" fill="#71717a" fontSize="12">0</text>
            <text x="140" y="35" fill="#71717a" fontSize="12" textAnchor="middle">50</text>
            <text x="250" y="165" fill="#71717a" fontSize="12" textAnchor="end">100</text>
            
            <text x="140" y="100" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">
              {score}%
            </text>
            <text x="140" y="118" textAnchor="middle" fill="#a1a1aa" fontSize="10">
              {isListening ? "Escuchando..." : showResults ? "Completado" : "Listo"}
            </text>
          </svg>

          <div className="flex gap-2 mt-2 w-full max-w-[200px]">
            <button
              onClick={startEvaluation}
              disabled={isListening}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 rounded-lg text-sm font-medium transition-all"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {isListening ? "..." : "Evaluar"}
            </button>
            
            {score > 0 && (
              <button
                onClick={() => { resetScore(); setShowResults(false); }}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300"
              >
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Middle: Word + Accent (horizontal on mobile) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-700/50">
            <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Objetivo</p>
            <p className="text-lg font-black text-zinc-100 tracking-wide leading-tight">{targetText}</p>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{actualPhonetic}</p>
          </div>

          <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-700/50">
            <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Acento</p>
            <div className="flex gap-1">
              <button
                onClick={() => setAccentType("us")}
                className={`flex-1 px-2 py-1 rounded text-xs font-bold transition-all ${
                  accent === "us" ? "bg-cyan-600 text-white" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                USA
              </button>
              <button
                onClick={() => setAccentType("uk")}
                className={`flex-1 px-2 py-1 rounded text-xs font-bold transition-all ${
                  accent === "uk" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                UK
              </button>
            </div>
          </div>
        </div>

        {/* Spectrum */}
        <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-700/50">
          <p className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Espectro</p>
          <FrequencyVisualizer active={isListening} audioLevel={audioLevel} frequencyData={frequencyData} />
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="bg-zinc-900/60 rounded-lg p-2 border border-zinc-700/50">
            <p className="text-[8px] uppercase text-zinc-500 font-bold">Dijiste:</p>
            <p className="text-xs text-zinc-300 italic">"{transcript}"</p>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {showResults && analysis && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <div className="bg-zinc-900/60 rounded-lg p-2 border border-zinc-700/50">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] uppercase text-zinc-500 font-bold">Similitud</span>
                  <span className={`text-xs font-bold ${analysis.similarity >= 70 ? "text-green-400" : analysis.similarity >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                    {analysis.similarity}%
                  </span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ background: analysis.similarity >= 70 ? "#10b981" : analysis.similarity >= 40 ? "#f59e0b" : "#ef4444" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.similarity}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-zinc-900/60 rounded-lg p-2 border border-zinc-700/50">
                  <div className="flex justify-between">
                    <span className="text-[8px] uppercase text-zinc-500 font-bold">Fonética</span>
                    <span className="text-xs font-bold text-cyan-400">{analysis.phoneticAccuracy}%</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full mt-1">
                    <motion.div className="h-full bg-cyan-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${analysis.phoneticAccuracy}%` }} />
                  </div>
                </div>

                <div className="bg-zinc-900/60 rounded-lg p-2 border border-zinc-700/50">
                  <div className="flex justify-between">
                    <span className="text-[8px] uppercase text-zinc-500 font-bold">Ritmo</span>
                    <span className="text-xs font-bold text-purple-400">{analysis.rhythmIntonation}%</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full mt-1">
                    <motion.div className="h-full bg-purple-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${analysis.rhythmIntonation}%` }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-900/30 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}