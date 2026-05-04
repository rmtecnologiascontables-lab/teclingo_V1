import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ArrowLeft, Heart, Volume2, Check, X, HelpCircle, Sparkles } from "lucide-react";
import { useDemoSession } from "@/lib/use-demo-auth";
import { updateUserData } from "@/lib/demo-store";

export const Route = createFileRoute("/lesson")({
  component: LessonPage,
  head: () => ({
    meta: [
      { title: "Listening Lab · TecLingo" },
      {
        name: "description",
        content: "Ejercicio interactivo de inglés con feedback inmediato por IA.",
      },
    ],
  }),
});

type Question = {
  prompt: string;
  context: string;
  options: { id: string; text: string }[];
  correct: string;
  explain: string;
};

const QUESTIONS: Question[] = [
  {
    prompt: "Complete the sentence",
    context: "If the research had been peer-reviewed earlier, the findings ___ much sooner.",
    options: [
      { id: "a", text: "would be published" },
      { id: "b", text: "would have been published" },
      { id: "c", text: "will have published" },
      { id: "d", text: "had been publishing" },
    ],
    correct: "b",
    explain: "Mixed third conditional: past hypothetical → past perfect modal in passive voice.",
  },
  {
    prompt: "Choose the most academic synonym",
    context: "The results were really good and showed a big improvement in performance.",
    options: [
      { id: "a", text: "remarkable / substantial" },
      { id: "b", text: "nice / large" },
      { id: "c", text: "okay / decent" },
      { id: "d", text: "amazing / huge" },
    ],
    correct: "a",
    explain: "Academic register prefers precise, formal lexis: remarkable + substantial.",
  },
];

function LessonPage() {
  const { categoryId } = Route.useSearch() as { categoryId?: string };
  const user = useDemoSession();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hearts, setHearts] = useState(5);
  const navigate = useNavigate();

  // Guardar inicio de lección
  useEffect(() => {
    if (categoryId && user && user.last_category_id !== categoryId) {
      const updateProgress = async () => {
        try {
          const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
          await fetch(scriptUrl, {
            method: "POST",
            body: JSON.stringify({ 
              action: "updateUser", 
              id: user.id, 
              updates: { last_category_id: categoryId } 
            })
          });
          updateUserData(user.id, { last_category_id: categoryId });
        } catch (e) {
          console.error("Error saving progress", e);
        }
      };
      updateProgress();
    }
  }, [categoryId, user]);

  const q = QUESTIONS[idx];
  const progress = ((idx + (revealed ? 1 : 0)) / QUESTIONS.length) * 100;
  const correct = revealed && selected === q.correct;

  const onCheck = () => {
    if (!selected) return;
    setRevealed(true);
    if (selected !== q.correct) setHearts((h) => Math.max(0, h - 1));
  };

  const onNext = async () => {
    if (idx + 1 >= QUESTIONS.length) {
      // Guardar estadísticas finales
      if (user) {
        try {
          const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
          await fetch(scriptUrl, {
            method: "POST",
            body: JSON.stringify({ 
              action: "saveStats", 
              stats: { 
                user_id: user.id, 
                metric: "lesson_completed", 
                value: `Category: ${categoryId}, Hearts: ${hearts}`,
                date: new Date().toISOString()
              } 
            })
          });
        } catch (e) {
          console.error("Error saving stats", e);
        }
      }
      navigate({ to: "/stats" });
      return;
    }
    setIdx(idx + 1);
    setSelected(null);
    setRevealed(false);
  };

  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col px-5 pt-12 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/" className="w-9 h-9 rounded-full glass flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
          <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "var(--gradient-cyan)" }}
            />
          </div>
          <div className="flex items-center gap-1 glass rounded-full px-2.5 py-1.5">
            <Heart
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.7 0.22 25)", fill: "oklch(0.7 0.22 25)" }}
            />
            <span className="text-xs font-bold text-white">{hearts}</span>
          </div>
        </div>

        {/* Tag */}
        <div className="mt-8 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/45 font-semibold">
            Use of English · B2
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
          >
            +25 XP
          </span>
        </div>

        <h2 className="mt-2 text-[26px] leading-tight font-extrabold text-white">{q.prompt}</h2>

        {/* Context card */}
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 glass-strong rounded-2xl p-5"
        >
          <button className="absolute" aria-label="play audio">
            <Volume2 className="w-5 h-5 text-white/70" />
          </button>
          <div className="flex items-start justify-between gap-3">
            <p className="text-base text-white/95 font-medium leading-relaxed">{q.context}</p>
            <Volume2 className="w-5 h-5 text-white/60 shrink-0 mt-1" />
          </div>
        </motion.div>

        {/* Options */}
        <div className="mt-5 space-y-2.5">
          {q.options.map((opt, i) => {
            const isSel = selected === opt.id;
            const isRight = revealed && opt.id === q.correct;
            const isWrong = revealed && isSel && opt.id !== q.correct;
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !revealed && setSelected(opt.id)}
                disabled={revealed}
                className="w-full text-left rounded-2xl p-4 transition-all border"
                style={{
                  background: isRight
                    ? "oklch(0.78 0.16 165 / 0.18)"
                    : isWrong
                      ? "oklch(0.65 0.22 25 / 0.18)"
                      : isSel
                        ? "oklch(0.85 0.14 215 / 0.18)"
                        : "oklch(1 0 0 / 0.04)",
                  borderColor: isRight
                    ? "oklch(0.78 0.16 165)"
                    : isWrong
                      ? "oklch(0.65 0.22 25)"
                      : isSel
                        ? "var(--cyan-glow)"
                        : "oklch(1 0 0 / 0.10)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
                    style={{
                      background: isSel || isRight ? "var(--gradient-cyan)" : "oklch(1 0 0 / 0.08)",
                      color: isSel || isRight ? "var(--navy-deep)" : "oklch(1 0 0 / 0.7)",
                    }}
                  >
                    {opt.id.toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-white">{opt.text}</span>
                  {isRight && (
                    <Check
                      className="w-5 h-5"
                      style={{ color: "oklch(0.78 0.16 165)" }}
                      strokeWidth={3}
                    />
                  )}
                  {isWrong && (
                    <X
                      className="w-5 h-5"
                      style={{ color: "oklch(0.65 0.22 25)" }}
                      strokeWidth={3}
                    />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Tutor help */}
        <button className="mt-5 mx-auto flex items-center gap-1.5 text-xs text-white/55 hover:text-white/80">
          <HelpCircle className="w-4 h-4" />
          Ayuda de Tutoría · Centro de Idiomas
        </button>

        {/* Action / feedback */}
        <AnimatePresence mode="wait">
          {revealed ? (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-2xl p-4"
              style={{
                background: correct ? "oklch(0.78 0.16 165 / 0.15)" : "oklch(0.65 0.22 25 / 0.15)",
                border: `1px solid ${correct ? "oklch(0.78 0.16 165 / 0.5)" : "oklch(0.65 0.22 25 / 0.5)"}`,
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: correct ? "oklch(0.78 0.16 165)" : "oklch(0.7 0.22 25)" }}
                />
                <p className="text-sm font-bold text-white">
                  {correct ? "¡Excellent!" : "Sigamos practicando"}
                </p>
              </div>
              <p className="mt-1.5 text-xs text-white/75 leading-relaxed">{q.explain}</p>
              <button
                onClick={onNext}
                className="mt-3 w-full py-3 rounded-xl font-bold text-sm"
                style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
              >
                Continuar
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="check"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onCheck}
              disabled={!selected}
              className="mt-4 w-full py-4 rounded-2xl font-extrabold text-sm tracking-wide transition-all disabled:opacity-40"
              style={{
                background: selected ? "var(--gradient-cyan)" : "oklch(1 0 0 / 0.08)",
                color: selected ? "var(--navy-deep)" : "oklch(1 0 0 / 0.5)",
                boxShadow: selected ? "var(--shadow-glow)" : "none",
              }}
            >
              COMPROBAR
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
}
