import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { Download, Award, Trophy, Flame, Zap, GraduationCap, ChevronRight } from "lucide-react";
import logo from "@/assets/teclingo-logo.jpeg";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Perfil · TecLingo" },
      {
        name: "description",
        content: "Tu progreso, medallas y reporte de horas para liberación de créditos.",
      },
    ],
  }),
});

const medals = [
  { icon: Flame, label: "14 días", color: "oklch(0.75 0.18 50)" },
  { icon: Zap, label: "2.8K XP", color: "var(--cyan-glow)" },
  { icon: Trophy, label: "Top Sistemas", color: "var(--gold)" },
  { icon: Award, label: "B1 → B2", color: "oklch(0.78 0.16 165)" },
  { icon: GraduationCap, label: "Mock 80+", color: "oklch(0.78 0.18 290)" },
];

function ProfilePage() {
  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col">
        <TopBar />

        {/* Identity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 glass-strong rounded-3xl p-5 relative overflow-hidden"
        >
          <div
            className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--gradient-cyan)" }}
          />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden border-2"
                style={{ borderColor: "var(--cyan-glow)", boxShadow: "var(--shadow-glow)" }}
              >
                <img src={logo} alt="" className="w-full h-full object-cover" />
              </div>
              <div
                className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
              >
                B2.1
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45 font-semibold">
                No. Control · 21080432
              </p>
              <h1 className="text-xl font-extrabold text-white mt-0.5">Rodrigo Méndez</h1>
              <p className="text-xs text-white/60">Ing. en Sistemas · 7° Sem</p>
            </div>
          </div>
        </motion.div>

        {/* League */}
        <div className="px-5 mt-4">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold">
                  Ranking por Carrera
                </p>
                <p className="text-sm font-bold text-white mt-0.5">Sistemas vs. Contabilidad</p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
              >
                #3 / 84
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                { n: "1. M. Hernández", xp: 3420, you: false },
                { n: "2. A. Ríos", xp: 3180, you: false },
                { n: "3. Tú", xp: 2840, you: true },
                { n: "4. L. Pérez", xp: 2710, you: false },
              ].map((r) => (
                <div
                  key={r.n}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                  style={
                    r.you
                      ? {
                          background: "oklch(0.85 0.14 215 / 0.18)",
                          border: "1px solid var(--cyan-glow)",
                        }
                      : { background: "oklch(1 0 0 / 0.04)" }
                  }
                >
                  <span className={`font-semibold ${r.you ? "text-white" : "text-white/75"}`}>
                    {r.n}
                  </span>
                  <span className="font-bold text-white/90">{r.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Medals */}
        <div className="px-5 mt-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold mb-2">
            Medallas
          </p>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            {medals.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-3 min-w-[88px] flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: `color-mix(in oklab, ${m.color} 18%, transparent)`,
                    color: m.color,
                  }}
                >
                  <m.icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-bold text-white text-center leading-tight">
                  {m.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Institutional report */}
        <div className="px-5 mt-4">
          <button className="w-full glass-strong rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "var(--gradient-cyan)" }}
            >
              <Download className="w-5 h-5" style={{ color: "var(--navy-deep)" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white">Reporte de horas</p>
              <p className="text-[11px] text-white/55">42 / 120 hrs · Liberación de créditos</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="px-5 mt-2 mb-2 space-y-2">
          <RowLink label="Coordinación de Inglés" sub="Centro de Idiomas · ext. 234" />
          <RowLink label="Configuración" sub="Notificaciones, idioma" />
        </div>

        <p className="text-center text-[9px] tracking-[0.3em] text-white/30 uppercase mt-2 mb-2">
          Powered by Conceptos AI MX · 2026
        </p>
      </div>
    </PhoneFrame>
  );
}

function RowLink({ label, sub }: { label: string; sub: string }) {
  return (
    <button className="w-full glass rounded-2xl p-3.5 flex items-center justify-between">
      <div className="text-left">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-[11px] text-white/55">{sub}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-white/40" />
    </button>
  );
}
