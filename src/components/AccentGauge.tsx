import { motion } from "framer-motion";
import { Mic, MicOff, RefreshCw } from "lucide-react";
import { useSpeechMeter } from "@/hooks/useSpeechMeter";

interface AccentGaugeProps {
  targetText: string;
  label?: string;
  compact?: boolean;
}

export function AccentGauge({ targetText, label = "Evaluación de Pronunciación", compact = false }: AccentGaugeProps) {
  const { score, isListening, error, startEvaluation, resetScore } = useSpeechMeter(targetText);

  const scoreAngle = -90 + (score / 100) * 180;
  
  const getScoreColor = (s: number) => {
    if (s >= 70) return "#10b981";
    if (s >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 70) return "Excelente";
    if (s >= 40) return "Regular";
    return "Necesita Mejorar";
  };

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
          <motion.circle
            cx="80"
            cy="90"
            r="55"
            fill="none"
            stroke="#3f3f46"
            strokeWidth="2"
            animate={{ rotate: scoreAngle }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            style={{ transformOrigin: "80px 90px" }}
          />
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
    <div className="flex flex-col items-center gap-6 p-6 bg-zinc-950/90 rounded-2xl border border-zinc-800 shadow-2xl">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-zinc-100 mb-1">{label}</h3>
        <p className="text-zinc-400 text-sm">"{targetText}"</p>
      </div>

      <svg width="280" height="160" viewBox="0 0 280 160">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="glow">
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
          stroke="url(#gaugeGradient)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        <path
          d="M 30 140 A 110 110 0 0 1 250 140"
          fill="none"
          stroke="#27272a"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.3"
        />
        
        <motion.g filter="url(#glow)">
          <line
            x1="140"
            y1="140"
            x2="140"
            y2="45"
            stroke={getScoreColor(score)}
            strokeWidth="4"
            strokeLinecap="round"
            animate={{ rotate: scoreAngle }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
            style={{ transformOrigin: "140px 140px" }}
          />
        </motion.g>
        
        <circle cx="140" cy="140" r="10" fill="#18181b" stroke="#fff" strokeWidth="3" />
        
        <text x="30" y="165" fill="#71717a" fontSize="12">0</text>
        <text x="140" y="35" fill="#71717a" fontSize="12" textAnchor="middle">50</text>
        <text x="250" y="165" fill="#71717a" fontSize="12" textAnchor="end">100</text>
        
        <text x="140" y="100" textAnchor="middle" fill={getScoreColor(score)} fontSize="32" fontWeight="bold">
          {score}%
        </text>
        <text x="140" y="120" textAnchor="middle" fill="#a1a1aa" fontSize="14">
          {getScoreLabel(score)}
        </text>
      </svg>

      <div className="flex gap-4">
        <button
          onClick={startEvaluation}
          disabled={isListening}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/20"
        >
          {isListening ? (
            <>
              <span className="animate-pulse">●</span>
              <MicOff size={20} />
              <span>Escuchando...</span>
            </>
          ) : (
            <>
              <Mic size={20} />
              <span>Iniciar Evaluación</span>
            </>
          )}
        </button>
        
        {score > 0 && (
          <button
            onClick={resetScore}
            className="flex items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 font-medium transition-colors"
          >
            <RefreshCw size={20} />
            <span>Reiniciar</span>
          </button>
        )}
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-900/30 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}