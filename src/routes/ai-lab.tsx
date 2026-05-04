import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { Sparkles, Mic, FileText, GraduationCap, Cpu, Wand2, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/ai-lab")({
  component: AILabPage,
  head: () => ({
    meta: [
      { title: "AI Lab · TecLingo | Conversación, TOEFL Scorer & Vocab Adaptativo" },
      {
        name: "description",
        content:
          "Funciones de IA generativa: simulador de entrevistas, corrector TOEFL en tiempo real y vocabulario adaptado a tu carrera.",
      },
    ],
  }),
});

function AILabPage() {
  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col">
        <TopBar />

        {/* Header */}
        <div className="px-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-3xl p-5 relative overflow-hidden"
          >
            <div
              className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-40 blur-3xl"
              style={{ background: "var(--gradient-cyan)" }}
            />
            <div className="relative flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--gradient-cyan)" }}
              >
                <Cpu className="w-5 h-5" style={{ color: "var(--navy-deep)" }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-semibold">
                  The AI Lab
                </p>
                <h1 className="text-2xl font-extrabold text-gradient leading-tight">
                  Generative Intelligence
                </h1>
              </div>
            </div>
            <p className="relative mt-3 text-xs text-white/65">
              Funciones exclusivas de TecLingo · más allá del nivel B2
            </p>
          </motion.div>
        </div>

        {/* 1. AI Conversation Simulator */}
        <div className="px-5 mt-5">
          <ConversationSimulator />
        </div>

        {/* 2. Real-Time Essay Scorer */}
        <div className="px-5 mt-4">
          <EssayScorer />
        </div>

        {/* 3. Dynamic Vocabulary */}
        <div className="px-5 mt-4">
          <VocabWidget />
        </div>

        {/* AI Tutor Orb */}
        <div className="px-5 mt-6 mb-4 flex flex-col items-center">
          <TutorOrb />
          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">
            Tap to summon AI Tutor
          </p>
        </div>

        <div className="px-5 pb-2">
          <p className="text-center text-[9px] tracking-[0.3em] text-white/30 uppercase">
            Powered by Conceptos AI MX · 2026
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}

function ConversationSimulator() {
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: 28 }, () => Math.random()));
  useEffect(() => {
    const t = setInterval(() => setBars(Array.from({ length: 28 }, () => Math.random())), 180);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-strong rounded-3xl p-5 relative overflow-hidden"
    >
      <div
        className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--gradient-cyan)" }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold">
            Live Simulation
          </p>
        </div>
        <span className="text-[10px] text-white/50">02:41</span>
      </div>

      <h3 className="relative mt-2 text-base font-bold text-white">Engineering Interview · NASA</h3>
      <p className="relative text-[11px] text-white/50">Career: Ing. en Sistemas Computacionales</p>

      {/* Waveform */}
      <div className="relative mt-4 h-20 flex items-center justify-center gap-[3px] glass rounded-2xl px-3">
        {bars.map((v, i) => (
          <motion.span
            key={i}
            animate={{ height: `${20 + v * 60}%` }}
            transition={{ duration: 0.18 }}
            className="w-[4px] rounded-full"
            style={{
              background: "var(--gradient-cyan)",
              boxShadow: "0 0 8px oklch(0.85 0.14 215 / 0.6)",
            }}
          />
        ))}
      </div>

      {/* AI Feedback Bubble */}
      <div className="relative mt-4 flex items-start gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--gradient-cyan)" }}
        >
          <Sparkles className="w-4 h-4" style={{ color: "var(--navy-deep)" }} />
        </div>
        <div className="glass rounded-2xl rounded-tl-sm px-3 py-2 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold">
            AI Coach · B2 Feedback
          </p>
          <p className="text-[12px] text-white/85 mt-1 leading-relaxed">
            "Excellent use of technical terms — try the{" "}
            <span className="text-gradient font-semibold">passive voice</span> for more formality."
          </p>
        </div>
      </div>

      <button
        className="relative mt-4 w-full h-11 rounded-2xl flex items-center justify-center gap-2 font-semibold text-[13px]"
        style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
      >
        <Mic className="w-4 h-4" /> Continue speaking
      </button>
    </motion.div>
  );
}

function EssayScorer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-strong rounded-3xl p-5 relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-white/70" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold">
            Essay Scorer · TOEFL
          </p>
        </div>
        <span className="text-[10px] text-white/50">Live</span>
      </div>

      <div className="mt-3 glass rounded-2xl p-3 text-[12px] leading-relaxed text-white/80">
        Climate change is one of the most{" "}
        <span
          className="px-1 rounded"
          style={{ background: "oklch(0.78 0.16 215 / 0.25)", color: "oklch(0.92 0.06 215)" }}
        >
          pressing
        </span>{" "}
        issues of our time.{" "}
        <span className="underline decoration-wavy decoration-amber-300/70 underline-offset-4">
          Goverments
        </span>{" "}
        must{" "}
        <span
          className="px-1 rounded"
          style={{ background: "oklch(0.78 0.16 165 / 0.22)", color: "oklch(0.85 0.16 165)" }}
        >
          collaborate
        </span>{" "}
        to{" "}
        <span
          className="px-1 rounded"
          style={{ background: "oklch(0.78 0.16 215 / 0.25)", color: "oklch(0.92 0.06 215)" }}
        >
          mitigate
        </span>{" "}
        its impact on{" "}
        <span className="underline decoration-wavy decoration-amber-300/70 underline-offset-4">
          enviroment
        </span>
        .
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
            style={{ background: "var(--gradient-cyan)", boxShadow: "var(--shadow-glow)" }}
          >
            <span
              className="text-lg font-extrabold leading-none"
              style={{ color: "var(--navy-deep)" }}
            >
              7.5
            </span>
            <span
              className="text-[8px] font-bold tracking-widest"
              style={{ color: "var(--navy-deep)" }}
            >
              / 9
            </span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-1.5">
          <Crit label="Grammar" v={82} />
          <Crit label="Lexical" v={74} />
          <Crit label="Cohesion" v={88} />
        </div>
      </div>

      <p className="mt-3 text-[11px] text-white/55">
        2 spelling errors · 3 lexical upgrades sugeridos
      </p>
    </motion.div>
  );
}

function Crit({ label, v }: { label: string; v: number }) {
  return (
    <div className="glass rounded-xl px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-white/50 font-semibold">{label}</p>
      <p className="text-xs font-bold text-white">{v}%</p>
      <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 1, delay: 0.4 }}
          className="h-full rounded-full"
          style={{ background: "var(--gradient-cyan)" }}
        />
      </div>
    </div>
  );
}

function VocabWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-strong rounded-3xl p-5 relative overflow-hidden"
    >
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-cyan)" }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-white/70" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/60 font-semibold">
            Word of the Day · Adaptive
          </p>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full glass text-white/70">
          Ing. Industrial
        </span>
      </div>

      <div className="relative mt-3 flex items-baseline gap-2">
        <h3 className="text-3xl font-extrabold text-gradient">Throughput</h3>
        <span className="text-[11px] text-white/45 italic">/ˈθruːpʊt/ · noun</span>
      </div>
      <p className="relative mt-1 text-[12px] text-white/75 leading-relaxed">
        The amount of material or items passing through a system or process.
      </p>
      <div className="relative mt-2 glass rounded-xl px-3 py-2">
        <p className="text-[11px] text-white/65 italic">
          "We optimized the assembly line to increase{" "}
          <span className="text-gradient font-semibold">throughput</span> by 23%."
        </p>
      </div>

      <button className="relative mt-3 w-full h-9 rounded-xl flex items-center justify-center gap-2 text-[11px] font-semibold glass text-white/85">
        <ArrowUpRight className="w-3.5 h-3.5" /> Ver vocabulario de mi carrera
      </button>
    </motion.div>
  );
}

function TutorOrb() {
  return (
    <button className="relative w-28 h-28 group">
      {/* outer halos */}
      <span
        className="absolute inset-0 rounded-full opacity-70 blur-2xl animate-pulse-glow"
        style={{ background: "var(--gradient-cyan)" }}
      />
      <span
        className="absolute inset-3 rounded-full opacity-40 blur-xl"
        style={{ background: "var(--gradient-cyan)" }}
      />
      {/* core */}
      <span
        className="absolute inset-4 rounded-full flex items-center justify-center transition-transform group-active:scale-95"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, oklch(0.98 0.04 215), oklch(0.70 0.18 220) 60%, oklch(0.30 0.12 250))",
          boxShadow:
            "var(--shadow-glow), inset 0 4px 12px oklch(1 0 0 / 0.4), inset 0 -8px 20px oklch(0 0 0 / 0.4)",
        }}
      >
        <GraduationCap
          className="w-9 h-9"
          style={{ color: "var(--navy-deep)" }}
          strokeWidth={2.4}
        />
      </span>
      {/* orbit ring */}
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-dashed"
        style={{ borderColor: "oklch(0.85 0.14 215 / 0.4)" }}
      />
    </button>
  );
}
