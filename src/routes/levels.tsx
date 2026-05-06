import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useDemoSession } from "@/lib/use-demo-auth";
import { updateUserData } from "@/lib/demo-store";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import {
  ArrowLeft,
  Folder,
  FolderOpen,
  Lock,
  Check,
  BookOpen,
  MessageCircle,
  Headphones,
  PenLine,
  Mic,
  Briefcase,
  GraduationCap,
  Globe2,
  Brain,
  FileText,
  Sparkles,
  Trophy,
  ClipboardCheck,
  Library,
  ChevronRight,
  Flag,
  Award,
} from "lucide-react";

export const Route = createFileRoute("/levels")({
  component: LevelsPage,
  head: () => ({
    meta: [
      { title: "Niveles MCER A1–C2 · TecLingo" },
      {
        name: "description",
        content:
          "Explora los 6 niveles del Marco Común Europeo (A1 a C2) con módulos temáticos para cada etapa.",
      },
    ],
  }),
});

type LevelStatus = "completed" | "current" | "locked";

type Category = {
  id: string;
  title: string;
  lessons: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type Level = {
  code: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  name: string;
  tagline: string;
  status: LevelStatus;
  progress: number;
  categories: Category[];
};

const LEVELS: Level[] = [
  {
    code: "A1",
    name: "Breakthrough",
    tagline: "Survival English",
    status: "completed",
    progress: 100,
    categories: [
      { id: "a1-1", title: "Greetings & Intro", lessons: 12, icon: MessageCircle },
      { id: "a1-2", title: "Basic Vocabulary", lessons: 18, icon: BookOpen },
      { id: "a1-3", title: "Numbers & Time", lessons: 10, icon: Brain },
      { id: "a1-4", title: "Listening Basics", lessons: 8, icon: Headphones },
    ],
  },
  {
    code: "A2",
    name: "Waystage",
    tagline: "Elementary",
    status: "completed",
    progress: 100,
    categories: [
      { id: "a2-1", title: "Daily Routines", lessons: 14, icon: MessageCircle },
      { id: "a2-2", title: "Past Simple", lessons: 16, icon: BookOpen },
      { id: "a2-3", title: "Travel & Places", lessons: 12, icon: Globe2 },
      { id: "a2-4", title: "Short Dialogues", lessons: 10, icon: Headphones },
    ],
  },
  {
    code: "B1",
    name: "Threshold",
    tagline: "Intermediate",
    status: "completed",
    progress: 100,
    categories: [
      { id: "b1-1", title: "Conditionals I & II", lessons: 16, icon: Brain },
      { id: "b1-2", title: "Opinion Writing", lessons: 14, icon: PenLine },
      { id: "b1-3", title: "Workplace Talk", lessons: 18, icon: Briefcase },
      { id: "b1-4", title: "Podcast Listening", lessons: 12, icon: Headphones },
    ],
  },
  {
    code: "B2",
    name: "Vantage",
    tagline: "Upper-Intermediate · Tu nivel actual",
    status: "current",
    progress: 42,
    categories: [
      { id: "b2-1", title: "Use of English", lessons: 22, icon: BookOpen },
      { id: "b2-2", title: "Academic Vocab", lessons: 20, icon: GraduationCap },
      { id: "b2-3", title: "Listening Lab", lessons: 18, icon: Headphones },
      { id: "b2-4", title: "Integrated Writing", lessons: 16, icon: PenLine },
      { id: "b2-5", title: "Speaking · AI", lessons: 14, icon: Mic },
      { id: "b2-6", title: "Mock TOEFL", lessons: 6, icon: FileText },
    ],
  },
  {
    code: "C1",
    name: "Effective Operational",
    tagline: "Advanced",
    status: "locked",
    progress: 0,
    categories: [
      { id: "c1-1", title: "Discourse Markers", lessons: 18, icon: Brain },
      { id: "c1-2", title: "Research Reading", lessons: 20, icon: BookOpen },
      { id: "c1-3", title: "Argumentation", lessons: 16, icon: PenLine },
      { id: "c1-4", title: "Presentations", lessons: 14, icon: Mic },
      { id: "c1-5", title: "Tech & AI English", lessons: 18, icon: Sparkles },
    ],
  },
  {
    code: "C2",
    name: "Mastery",
    tagline: "Proficiency",
    status: "locked",
    progress: 0,
    categories: [
      { id: "c2-1", title: "Idiomatic Mastery", lessons: 20, icon: Sparkles },
      { id: "c2-2", title: "Academic Papers", lessons: 18, icon: GraduationCap },
      { id: "c2-3", title: "Negotiation", lessons: 16, icon: Briefcase },
      { id: "c2-4", title: "Native-Level Test", lessons: 8, icon: Trophy },
    ],
  },
];

function LevelsPage() {
  const navigate = useNavigate();
  const session = useDemoSession();
  const [openLevel, setOpenLevel] = useState<Level["code"]>("B2");

  return (
    <PhoneFrame>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen flex flex-col"
      >
        <TopBar />

        {/* Header */}
        <div className="px-5">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="uppercase tracking-[0.2em] font-semibold">Path</span>
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
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-semibold">
              CEFR Framework · Marco Común Europeo
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-gradient">Niveles A1 → C2</h1>
            <p className="mt-1 text-xs text-white/65">
              6 niveles · 32 categorías · Ruta certificable hasta TOEFL Mastery
            </p>

            {/* Mini map */}
            <div className="mt-4 flex items-center gap-1.5">
              {LEVELS.map((lv) => (
                <button
                  key={lv.code}
                  onClick={() => setOpenLevel(lv.code)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    openLevel === lv.code ? "h-2" : ""
                  }`}
                  style={{
                    background:
                      lv.status === "completed"
                        ? "var(--gradient-cyan)"
                        : lv.status === "current"
                          ? "var(--gradient-cyan)"
                          : "oklch(1 0 0 / 0.12)",
                    opacity: lv.status === "current" ? 1 : lv.status === "completed" ? 0.7 : 1,
                  }}
                />
              ))}
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-white/40 font-semibold">
              {LEVELS.map((lv) => (
                <span key={lv.code} className={openLevel === lv.code ? "text-white" : ""}>
                  {lv.code}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick links: Programa & Biblioteca */}
        <div className="px-5 mt-4 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => navigate({ to: "/program" })}
            className="glass-strong rounded-2xl p-3 text-left active:scale-[0.98] transition-transform relative overflow-hidden"
          >
            <div
              className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-25 blur-2xl"
              style={{ background: "var(--gradient-cyan)" }}
            />
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
              style={{ background: "oklch(1 0 0 / 0.08)", border: "1px solid oklch(1 0 0 / 0.1)" }}
            >
              <GraduationCap className="w-4 h-4" style={{ color: "var(--cyan-glow)" }} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold">
              Plan
            </p>
            <p className="text-[12.5px] font-bold text-white">Programa de Inglés</p>
          </button>
          <button
            onClick={() => navigate({ to: "/library" })}
            className="glass-strong rounded-2xl p-3 text-left active:scale-[0.98] transition-transform relative overflow-hidden"
          >
            <div
              className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-25 blur-2xl"
              style={{ background: "var(--gradient-cyan)" }}
            />
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
              style={{ background: "oklch(1 0 0 / 0.08)", border: "1px solid oklch(1 0 0 / 0.1)" }}
            >
              <Library className="w-4 h-4" style={{ color: "var(--cyan-glow)" }} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold">
              Lectura
            </p>
            <p className="text-[12.5px] font-bold text-white">Biblioteca</p>
          </button>
        </div>

        {/* Level cards */}
        <div className="px-5 mt-5 pb-6 flex-1 space-y-3">
          {LEVELS.map((level, i) => (
            <LevelCard
              key={level.code}
              level={level}
              index={i}
              isOpen={openLevel === level.code}
              onToggle={() =>
                setOpenLevel(openLevel === level.code ? ("" as Level["code"]) : level.code)
              }
              onCategoryTap={async (catId) => {
                if (level.status !== "locked") {
                  if (session?.id) {
                    await updateUserData(session.id, { last_category_id: catId });
                  }
                  navigate({ to: "/lesson", search: { categoryId: catId } });
                }
              }}
            />
          ))}
        </div>
      </motion.div>
    </PhoneFrame>
  );
}

function ExamArea({ levelCode, onTap }: { levelCode: string; onTap: () => void }) {
  const [open, setOpen] = useState(false);
  const exams = [
    {
      id: "diag",
      label: "Diagnóstico inicial",
      sub: `Evalúa tu base al iniciar ${levelCode}`,
      icon: Flag,
      tag: "INICIO",
    },
    {
      id: "final",
      label: "Examen final",
      sub: `Certifica tu dominio de ${levelCode}`,
      icon: Award,
      tag: "FINAL",
    },
  ];

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full glass rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99] transition-transform relative overflow-hidden"
        style={{ border: "1px solid oklch(1 0 0 / 0.12)" }}
      >
        <div
          className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full opacity-25 blur-2xl"
          style={{ background: "var(--gradient-cyan)" }}
        />
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--gradient-cyan)" }}
        >
          <ClipboardCheck
            className="w-4.5 h-4.5"
            style={{ color: "var(--navy-deep)", width: 18, height: 18 }}
          />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/55 font-semibold">
            Área de exámenes · {levelCode}
          </p>
          <p className="text-[12.5px] font-bold text-white">2 evaluaciones disponibles</p>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-white/50 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-2 space-y-2 pl-2 border-l border-dashed border-white/15 ml-3"
        >
          {exams.map((ex, i) => {
            const Icon = ex.icon;
            return (
              <motion.button
                key={ex.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={onTap}
                className="w-full glass rounded-xl p-2.5 flex items-center gap-2.5 text-left active:scale-[0.98] transition-transform"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "oklch(1 0 0 / 0.08)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: "var(--cyan-glow)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
                    >
                      {ex.tag}
                    </span>
                    <p className="text-[12px] font-bold text-white leading-tight">{ex.label}</p>
                  </div>
                  <p className="text-[10px] text-white/55 mt-0.5">{ex.sub}</p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

function LevelCard({
  level,
  index,
  isOpen,
  onToggle,
  onCategoryTap,
}: {
  level: Level;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onCategoryTap: (catId: string) => void;
}) {
  const isLocked = level.status === "locked";
  const isCurrent = level.status === "current";
  const isDone = level.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong rounded-3xl overflow-hidden relative"
    >
      {isCurrent && (
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: "var(--gradient-cyan)" }}
        />
      )}

      <button
        onClick={onToggle}
        disabled={isLocked}
        className="w-full flex items-center gap-3 p-4 text-left disabled:cursor-not-allowed active:scale-[0.99] transition-transform"
      >
        {/* Level badge */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 relative ${
            isCurrent ? "animate-pulse-glow" : ""
          }`}
          style={
            isLocked
              ? { background: "oklch(1 0 0 / 0.05)", border: "1px dashed oklch(1 0 0 / 0.18)" }
              : { background: "var(--gradient-cyan)", boxShadow: "var(--shadow-glow)" }
          }
        >
          {isLocked ? (
            <Lock className="w-5 h-5 text-white/40" />
          ) : isDone ? (
            <Check className="w-6 h-6" style={{ color: "var(--navy-deep)" }} strokeWidth={3} />
          ) : (
            <span className="text-base font-extrabold" style={{ color: "var(--navy-deep)" }}>
              {level.code}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 font-semibold">
              {level.code} · {level.name}
            </p>
            {isCurrent && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
              >
                ACTIVO
              </span>
            )}
          </div>
          <p className={`text-sm font-bold mt-0.5 ${isLocked ? "text-white/40" : "text-white"}`}>
            {level.tagline}
          </p>
          {!isLocked && (
            <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${level.progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full"
                style={{ background: "var(--gradient-cyan)" }}
              />
            </div>
          )}
        </div>

        <div className="shrink-0 text-white/50">
          {isLocked ? (
            <Lock className="w-4 h-4" />
          ) : isOpen ? (
            <FolderOpen className="w-5 h-5" />
          ) : (
            <Folder className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Categories */}
      {isOpen && !isLocked && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="px-4 pb-4"
        >
          <div className="grid grid-cols-2 gap-2.5">
            {level.categories.map((cat, idx) => (
              <CategoryFolder
                key={cat.id}
                category={cat}
                index={idx}
                onTap={() => onCategoryTap(cat.id)}
              />
            ))}
          </div>

          {/* Exam Area */}
          <ExamArea levelCode={level.code} onTap={() => onCategoryTap(`exam-${level.code}`)} />
        </motion.div>
      )}

      {isLocked && (
        <div className="px-4 pb-4">
          <div className="rounded-2xl border border-dashed border-white/10 px-3 py-2.5 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-white/40" />
            <p className="text-[11px] text-white/45">
              Completa <span className="text-white/70 font-semibold">B2</span> para desbloquear este
              nivel
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CategoryFolder({
  category,
  index,
  onTap,
}: {
  category: Category;
  index: number;
  onTap: () => void;
}) {
  const Icon = category.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={onTap}
      className="glass rounded-2xl p-3 text-left active:scale-[0.97] transition-transform relative overflow-hidden group"
    >
      <div
        className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full opacity-0 group-hover:opacity-30 blur-2xl transition-opacity"
        style={{ background: "var(--gradient-cyan)" }}
      />
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
        style={{ background: "oklch(1 0 0 / 0.08)", border: "1px solid oklch(1 0 0 / 0.1)" }}
      >
        <Icon
          className="w-4.5 h-4.5"
          style={{ color: "var(--cyan-glow)", width: 18, height: 18 }}
        />
      </div>
      <p className="text-[12px] font-bold text-white leading-tight">{category.title}</p>
      <p className="text-[10px] text-white/50 mt-0.5">{category.lessons} lecciones</p>
    </motion.button>
  );
}
