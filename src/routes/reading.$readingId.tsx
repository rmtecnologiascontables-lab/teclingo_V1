import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Star,
  Volume2,
  Sparkles,
  Check,
  X,
  Trophy,
  RotateCcw,
} from "lucide-react";

export const Route = createFileRoute("/reading/$readingId")({
  component: ReadingPage,
  head: () => ({
    meta: [
      { title: "Lectura · TecLingo" },
      { name: "description", content: "Lee el texto y completa el quiz de comprensión." },
    ],
  }),
});

type Question = {
  prompt: string;
  options: { id: string; text: string }[];
  correct: string;
  explain: string;
};

type ReadingContent = {
  id: string;
  title: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  minutes: number;
  category: "Story" | "Article" | "Academic" | "TOEFL";
  rating: number;
  paragraphs: string[];
  questions: Question[];
};

const READINGS: Record<string, ReadingContent> = {
  r1: {
    id: "r1",
    title: "My First Day at School",
    level: "A1",
    minutes: 3,
    category: "Story",
    rating: 4.8,
    paragraphs: [
      "Sarah walks into her new classroom feeling nervous but excited. It is her first day at a new school, and she does not know anyone. The classroom is big and bright, with colorful posters on the walls and many desks in neat rows.",
      "Her teacher, Mrs. Brown, smiles warmly and says, “Good morning, Sarah. Welcome to our class!” Sarah smiles back shyly. She finds an empty desk near the window and sits down. A girl with curly hair turns around and says, “Hi! My name is Emma. What's your name?”",
      "“I'm Sarah,” she answers quietly. Emma is friendly and tells Sarah about the school: the library, the playground, and the cafeteria. At lunch, Emma invites Sarah to sit with her friends. They share sandwiches and laugh together.",
      "After school, Sarah walks home thinking about her day. She was nervous in the morning, but now she feels happy. She has a new friend, a kind teacher, and a beautiful classroom. Tomorrow, she will not be nervous anymore. Tomorrow, she will be excited to go to school again.",
    ],
    questions: [
      {
        prompt: "How does Sarah feel at the beginning of the day?",
        options: [
          { id: "a", text: "Bored and tired" },
          { id: "b", text: "Nervous but excited" },
          { id: "c", text: "Angry and sad" },
          { id: "d", text: "Confident and proud" },
        ],
        correct: "b",
        explain: "The text says: “Sarah walks into her new classroom feeling nervous but excited.”",
      },
      {
        prompt: "Who is the first person to talk to Sarah in the classroom?",
        options: [
          { id: "a", text: "Mrs. Brown, the teacher" },
          { id: "b", text: "A boy near the door" },
          { id: "c", text: "Emma, a girl with curly hair" },
          { id: "d", text: "Nobody talks to her" },
        ],
        correct: "a",
        explain:
          "Mrs. Brown greets her first: “Good morning, Sarah. Welcome to our class!” Emma talks to her after she sits down.",
      },
      {
        prompt: "What does Emma do at lunch?",
        options: [
          { id: "a", text: "She eats alone" },
          { id: "b", text: "She invites Sarah to sit with her friends" },
          { id: "c", text: "She goes home for lunch" },
          { id: "d", text: "She studies in the library" },
        ],
        correct: "b",
        explain: "“At lunch, Emma invites Sarah to sit with her friends.”",
      },
      {
        prompt: "How does Sarah feel at the end of the day?",
        options: [
          { id: "a", text: "Still very nervous" },
          { id: "b", text: "Tired and disappointed" },
          { id: "c", text: "Happy and excited for tomorrow" },
          { id: "d", text: "Confused about her new school" },
        ],
        correct: "c",
        explain: "The story ends: “Tomorrow, she will be excited to go to school again.”",
      },
    ],
  },
};

function ReadingPage() {
  const { readingId } = Route.useParams();
  const navigate = useNavigate();
  const reading = READINGS[readingId];

  const [phase, setPhase] = useState<"reading" | "quiz" | "results">("reading");
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const total = reading?.questions.length ?? 0;
  const progress = useMemo(() => {
    if (phase === "reading") return 0;
    if (phase === "results") return 100;
    return total === 0 ? 0 : ((qIdx + (revealed ? 1 : 0)) / total) * 100;
  }, [phase, qIdx, revealed, total]);

  if (!reading) {
    return (
      <PhoneFrame>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <BookOpen className="w-10 h-10 text-white/40 mb-3" />
          <p className="text-white font-bold">Lectura no encontrada</p>
          <p className="text-xs text-white/60 mt-1">
            Esta lectura aún no tiene contenido completo.
          </p>
          <Link
            to="/library"
            className="mt-5 text-[11px] font-bold px-4 py-2 rounded-full"
            style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
          >
            Volver a la Biblioteca
          </Link>
        </div>
      </PhoneFrame>
    );
  }

  const q = reading.questions[qIdx];

  const onCheck = () => {
    if (!selected) return;
    setRevealed(true);
    if (selected === q.correct) setScore((s) => s + 1);
  };

  const onNext = () => {
    if (qIdx + 1 >= total) {
      setPhase("results");
      return;
    }
    setQIdx(qIdx + 1);
    setSelected(null);
    setRevealed(false);
  };

  const restart = () => {
    setPhase("reading");
    setQIdx(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
  };

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
            onClick={() => navigate({ to: "/library" })}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="uppercase tracking-[0.2em] font-semibold">Biblioteca</span>
          </button>

          {/* Progress */}
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-4">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "var(--gradient-cyan)" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === "reading" && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="px-5 pb-6 flex-1"
            >
              <div className="glass-strong rounded-3xl p-5 relative overflow-hidden">
                <div
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-25 blur-3xl"
                  style={{ background: "var(--gradient-cyan)" }}
                />
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
                  >
                    {reading.level}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold">
                    {reading.category}
                  </span>
                </div>
                <h1 className="text-xl font-extrabold text-gradient leading-tight">
                  {reading.title}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[11px] text-white/55">
                    <Clock className="w-3 h-3" /> {reading.minutes} min
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/55">
                    <Star className="w-3 h-3" style={{ color: "var(--cyan-glow)" }} />{" "}
                    {reading.rating}
                  </span>
                  <button
                    className="ml-auto flex items-center gap-1 text-[11px] text-white/60 hover:text-white"
                    aria-label="Listen"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Escuchar
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="mt-4 glass rounded-3xl p-5 space-y-3.5">
                {reading.paragraphs.map((p, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-[13px] leading-relaxed text-white/85"
                  >
                    {p}
                  </motion.p>
                ))}
              </div>

              {/* CTA → Quiz */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={() => setPhase("quiz")}
                className="mt-5 w-full py-4 rounded-2xl font-extrabold text-sm tracking-wide flex items-center justify-center gap-2"
                style={{
                  background: "var(--gradient-cyan)",
                  color: "var(--navy-deep)",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                Comenzar Quiz · {total} preguntas
              </motion.button>
            </motion.div>
          )}

          {phase === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="px-5 pb-6 flex-1 flex flex-col"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/45 font-semibold">
                  Comprensión · {reading.level}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
                >
                  {qIdx + 1} / {total}
                </span>
              </div>

              <h2 className="mt-2 text-[22px] leading-tight font-extrabold text-white">
                {q.prompt}
              </h2>

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
                            background:
                              isSel || isRight ? "var(--gradient-cyan)" : "oklch(1 0 0 / 0.08)",
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

              {revealed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-2xl p-4"
                  style={{
                    background:
                      selected === q.correct
                        ? "oklch(0.78 0.16 165 / 0.15)"
                        : "oklch(0.65 0.22 25 / 0.15)",
                    border: `1px solid ${
                      selected === q.correct
                        ? "oklch(0.78 0.16 165 / 0.5)"
                        : "oklch(0.65 0.22 25 / 0.5)"
                    }`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className="w-4 h-4"
                      style={{
                        color:
                          selected === q.correct ? "oklch(0.78 0.16 165)" : "oklch(0.7 0.22 25)",
                      }}
                    />
                    <p className="text-sm font-bold text-white">
                      {selected === q.correct ? "¡Correcto!" : "Casi"}
                    </p>
                  </div>
                  <p className="mt-1.5 text-xs text-white/75 leading-relaxed">{q.explain}</p>
                  <button
                    onClick={onNext}
                    className="mt-3 w-full py-3 rounded-xl font-bold text-sm"
                    style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
                  >
                    {qIdx + 1 >= total ? "Ver resultados" : "Siguiente"}
                  </button>
                </motion.div>
              ) : (
                <button
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
                </button>
              )}
            </motion.div>
          )}

          {phase === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="px-5 pb-6 flex-1 flex flex-col"
            >
              <div className="glass-strong rounded-3xl p-6 text-center relative overflow-hidden">
                <div
                  className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full opacity-30 blur-3xl"
                  style={{ background: "var(--gradient-cyan)" }}
                />
                <div
                  className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--gradient-cyan)" }}
                >
                  <Trophy className="w-8 h-8" style={{ color: "var(--navy-deep)" }} />
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-white/55 font-semibold">
                  Quiz completado
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-gradient">
                  {score} / {total} correctas
                </h2>
                <p className="mt-2 text-xs text-white/65">
                  {score === total
                    ? "¡Comprensión perfecta! Estás listo para el siguiente nivel."
                    : score >= Math.ceil(total / 2)
                      ? "¡Buen trabajo! Repasa la lectura para mejorar aún más."
                      : "Repasa el texto y vuelve a intentarlo."}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={restart}
                    className="py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 glass"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reintentar
                  </button>
                  <button
                    onClick={() => navigate({ to: "/library" })}
                    className="py-3 rounded-xl font-bold text-xs"
                    style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
                  >
                    Más lecturas
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PhoneFrame>
  );
}
