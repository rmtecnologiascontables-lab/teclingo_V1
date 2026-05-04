import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { ArrowLeft, ChevronDown, ChevronUp, BookOpen, Target, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/program")({
  component: ProgramPage,
  head: () => ({
    meta: [
      { title: "Programa de Inglés · TecLingo" },
      {
        name: "description",
        content:
          "Programa académico de inglés del Tec de Pánuco dividido por niveles MCER A1–C2 y subniveles.",
      },
    ],
  }),
});

type SubLevel = { code: string; title: string; hours: number; goals: string[] };
type LevelProgram = {
  code: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  name: string;
  summary: string;
  subs: SubLevel[];
};

const PROGRAM: LevelProgram[] = [
  {
    code: "A1",
    name: "Breakthrough",
    summary: "Comunicación básica y supervivencia en inglés.",
    subs: [
      {
        code: "A1.1",
        title: "Foundations",
        hours: 30,
        goals: ["Saludos y presentaciones", "Verbo to be", "Vocabulario cotidiano"],
      },
      {
        code: "A1.2",
        title: "Survival English",
        hours: 30,
        goals: ["Presente simple", "Números, hora, fecha", "Compras y pedidos"],
      },
    ],
  },
  {
    code: "A2",
    name: "Waystage",
    summary: "Conversaciones simples sobre temas cotidianos.",
    subs: [
      {
        code: "A2.1",
        title: "Daily Life",
        hours: 32,
        goals: ["Pasado simple", "Rutinas y hábitos", "Descripción de personas"],
      },
      {
        code: "A2.2",
        title: "Travel & Society",
        hours: 32,
        goals: ["Futuro con will/going to", "Viajes y direcciones", "Comparativos"],
      },
    ],
  },
  {
    code: "B1",
    name: "Threshold",
    summary: "Independencia en contextos familiares.",
    subs: [
      {
        code: "B1.1",
        title: "Intermediate Core",
        hours: 36,
        goals: ["Presente perfecto", "Condicionales 0/1", "Opiniones simples"],
      },
      {
        code: "B1.2",
        title: "Workplace English",
        hours: 36,
        goals: ["Voz pasiva", "Reported speech básico", "Email profesional"],
      },
    ],
  },
  {
    code: "B2",
    name: "Vantage",
    summary: "Nivel objetivo institucional · TOEFL ready.",
    subs: [
      {
        code: "B2.1",
        title: "Upper-Intermediate",
        hours: 40,
        goals: ["Mixed conditionals", "Use of English", "Academic vocab"],
      },
      {
        code: "B2.2",
        title: "TOEFL Preparation",
        hours: 40,
        goals: ["Integrated writing", "Listening lab", "Speaking · AI"],
      },
    ],
  },
  {
    code: "C1",
    name: "Effective Operational",
    summary: "Dominio profesional y académico.",
    subs: [
      {
        code: "C1.1",
        title: "Advanced Discourse",
        hours: 44,
        goals: ["Discourse markers", "Argumentation", "Research reading"],
      },
      {
        code: "C1.2",
        title: "Professional Mastery",
        hours: 44,
        goals: ["Presentations", "Tech & AI English", "Negotiation skills"],
      },
    ],
  },
  {
    code: "C2",
    name: "Mastery",
    summary: "Nivel nativo · Proficiency.",
    subs: [
      {
        code: "C2.1",
        title: "Native Fluency",
        hours: 48,
        goals: ["Idiomatic mastery", "Academic papers", "Subtle nuance"],
      },
      {
        code: "C2.2",
        title: "Proficiency Test",
        hours: 48,
        goals: ["Native-level test", "Publication writing", "Conference speaking"],
      },
    ],
  },
];

function ProgramPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<string>("B2");

  return (
    <PhoneFrame>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen flex flex-col"
      >
        <TopBar />

        <div className="px-5">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="uppercase tracking-[0.2em] font-semibold">Inicio</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-strong rounded-3xl p-5 relative overflow-hidden"
          >
            <div
              className="absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-30 blur-3xl"
              style={{ background: "var(--gradient-cyan)" }}
            />
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4" style={{ color: "var(--cyan-glow)" }} />
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-semibold">
                Plan de estudios · TecNM Pánuco
              </p>
            </div>
            <h1 className="text-2xl font-extrabold text-gradient">Programa de Inglés</h1>
            <p className="mt-1 text-xs text-white/65">
              6 niveles · 12 subniveles · 460 horas totales · Alineado MCER + TOEFL
            </p>
          </motion.div>
        </div>

        <div className="px-5 mt-5 pb-6 flex-1 space-y-3">
          {PROGRAM.map((lv, i) => {
            const isOpen = open === lv.code;
            return (
              <motion.div
                key={lv.code}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="glass-strong rounded-3xl overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? "" : lv.code)}
                  className="w-full flex items-center gap-3 p-4 text-left active:scale-[0.99] transition-transform"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--gradient-cyan)", boxShadow: "var(--shadow-glow)" }}
                  >
                    <span className="text-sm font-extrabold" style={{ color: "var(--navy-deep)" }}>
                      {lv.code}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{lv.name}</p>
                    <p className="text-[11px] text-white/55 mt-0.5">{lv.summary}</p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-white/50 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/50 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4 space-y-2.5"
                  >
                    {lv.subs.map((sub) => (
                      <div key={sub.code} className="glass rounded-2xl p-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Target className="w-3.5 h-3.5" style={{ color: "var(--cyan-glow)" }} />
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 font-bold">
                              {sub.code} · {sub.title}
                            </p>
                          </div>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "oklch(1 0 0 / 0.08)", color: "var(--cyan-glow)" }}
                          >
                            {sub.hours}h
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {sub.goals.map((g) => (
                            <li
                              key={g}
                              className="flex items-start gap-2 text-[11px] text-white/75"
                            >
                              <span
                                className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                                style={{ background: "var(--cyan-glow)" }}
                              />
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </PhoneFrame>
  );
}
