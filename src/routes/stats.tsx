import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { TrendingUp, Award, Target, Flame } from "lucide-react";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
  head: () => ({
    meta: [
      { title: "Stats · TecLingo" },
      {
        name: "description",
        content: "Tu progreso en las 4 habilidades del MCER y simulacros TOEFL.",
      },
    ],
  }),
});

const radar = [
  { skill: "Reading", value: 82, full: 100 },
  { skill: "Listening", value: 74, full: 100 },
  { skill: "Speaking", value: 61, full: 100 },
  { skill: "Writing", value: 78, full: 100 },
  { skill: "Use of Eng", value: 88, full: 100 },
];

const weekly = [40, 65, 30, 80, 55, 90, 72];
const days = ["L", "M", "M", "J", "V", "S", "D"];

function StatsPage() {
  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col">
        <TopBar />

        <div className="px-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/45 font-semibold">
            Diagnóstico actual
          </p>
          <h1 className="text-2xl font-extrabold text-white mt-0.5">Skill Radar</h1>
          <p className="text-xs text-white/55 mt-1">
            Estimado MCER: <span className="text-white font-bold">B2.1</span> · proyectado a B2+ en
            6 semanas
          </p>
        </div>

        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mx-5 mt-4 glass-strong rounded-3xl p-3 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-20 blur-3xl"
            style={{ background: "var(--gradient-cyan)" }}
          />
          <div className="relative h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="75%">
                <defs>
                  <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.92 0.06 215)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="oklch(0.70 0.18 220)" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="oklch(1 0 0 / 0.15)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "oklch(1 0 0 / 0.75)", fontSize: 10, fontWeight: 600 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="value"
                  stroke="oklch(0.85 0.14 215)"
                  strokeWidth={2}
                  fill="url(#radarFill)"
                  fillOpacity={1}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="px-5 mt-4 grid grid-cols-2 gap-2.5">
          <StatCard icon={Flame} label="Streak" value="14d" tint="oklch(0.75 0.18 50)" />
          <StatCard icon={TrendingUp} label="Esta semana" value="+340 XP" tint="var(--cyan-glow)" />
          <StatCard icon={Target} label="Precisión" value="86%" tint="oklch(0.78 0.16 165)" />
          <StatCard icon={Award} label="Medallas" value="12" tint="var(--gold)" />
        </div>

        {/* Weekly bars */}
        <div className="px-5 mt-4 glass rounded-2xl p-4 mx-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white">Actividad semanal</p>
            <p className="text-[10px] text-white/50">7d</p>
          </div>
          <div className="mt-3 flex items-end justify-between gap-1.5 h-24">
            {weekly.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${v}%` }}
                  transition={{ delay: i * 0.05, duration: 0.6, ease: "easeOut" }}
                  className="w-full rounded-md"
                  style={{ background: i === 5 ? "var(--gradient-cyan)" : "oklch(1 0 0 / 0.18)" }}
                />
                <span className="text-[10px] text-white/45 font-semibold">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOEFL projection */}
        <div className="px-5 mt-4 mb-4">
          <div className="glass-strong rounded-2xl p-4 flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--gradient-cyan)" }}
            >
              <Award className="w-6 h-6" style={{ color: "var(--navy-deep)" }} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold">
                Proyección TOEFL iBT
              </p>
              <p className="text-lg font-extrabold text-white">87 / 120</p>
            </div>
            <button className="text-xs font-bold px-3 py-2 rounded-xl glass text-white">
              Reporte
            </button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="glass rounded-2xl p-3.5">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: `color-mix(in oklab, ${tint} 18%, transparent)`, color: tint }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-white/50 font-semibold">
        {label}
      </p>
      <p className="text-base font-extrabold text-white">{value}</p>
    </div>
  );
}
