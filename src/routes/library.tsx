import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import {
  ArrowLeft,
  BookOpen,
  Search,
  Clock,
  Star,
  FileText,
  Newspaper,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
  head: () => ({
    meta: [
      { title: "Biblioteca · TecLingo" },
      {
        name: "description",
        content:
          "Textos de aprendizaje de inglés: lecturas graduadas, artículos y materiales TOEFL.",
      },
    ],
  }),
});

type Reading = {
  id: string;
  title: string;
  excerpt: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  minutes: number;
  category: "Story" | "Article" | "Academic" | "TOEFL";
  rating: number;
};

const READINGS: Reading[] = [
  {
    id: "r1",
    title: "My First Day at School",
    excerpt: "Sarah walks into her new classroom feeling nervous but excited...",
    level: "A1",
    minutes: 3,
    category: "Story",
    rating: 4.8,
  },
  {
    id: "r2",
    title: "A Trip to the Market",
    excerpt: "Every Saturday, Tom goes to the local market with his mother...",
    level: "A2",
    minutes: 4,
    category: "Story",
    rating: 4.6,
  },
  {
    id: "r3",
    title: "The History of Coffee",
    excerpt: "Coffee was first discovered in Ethiopia centuries ago...",
    level: "B1",
    minutes: 6,
    category: "Article",
    rating: 4.7,
  },
  {
    id: "r4",
    title: "Climate Change & Renewable Energy",
    excerpt: "As global temperatures continue to rise, scientists urge...",
    level: "B2",
    minutes: 9,
    category: "Academic",
    rating: 4.9,
  },
  {
    id: "r5",
    title: "TOEFL Reading: Urban Architecture",
    excerpt: "The development of modern cities reflects centuries of...",
    level: "B2",
    minutes: 12,
    category: "TOEFL",
    rating: 5.0,
  },
  {
    id: "r6",
    title: "Artificial Intelligence in Education",
    excerpt: "AI-powered tutors are reshaping how students learn...",
    level: "C1",
    minutes: 11,
    category: "Academic",
    rating: 4.9,
  },
  {
    id: "r7",
    title: "The Ethics of Genetic Engineering",
    excerpt: "Recent breakthroughs in CRISPR technology raise profound questions...",
    level: "C1",
    minutes: 14,
    category: "Article",
    rating: 4.8,
  },
  {
    id: "r8",
    title: "Postmodern Literature Analysis",
    excerpt: "The fragmentation of narrative in contemporary fiction reveals...",
    level: "C2",
    minutes: 18,
    category: "Academic",
    rating: 5.0,
  },
];

const FILTERS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

function LibraryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const items = filter === "All" ? READINGS : READINGS.filter((r) => r.level === filter);

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
              <BookOpen className="w-4 h-4" style={{ color: "var(--cyan-glow)" }} />
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-semibold">
                Reading Lab
              </p>
            </div>
            <h1 className="text-2xl font-extrabold text-gradient">Biblioteca TecLingo</h1>
            <p className="mt-1 text-xs text-white/65">
              Lecturas graduadas · Artículos académicos · Material TOEFL
            </p>

            <div className="mt-4 flex items-center gap-2 glass rounded-2xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-white/50" />
              <input
                placeholder="Buscar lecturas..."
                className="bg-transparent outline-none text-xs text-white placeholder:text-white/40 flex-1"
              />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="px-5 mt-4 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
              style={
                filter === f
                  ? { background: "var(--gradient-cyan)", color: "var(--navy-deep)" }
                  : { background: "oklch(1 0 0 / 0.06)", color: "oklch(1 0 0 / 0.6)" }
              }
            >
              {f}
            </button>
          ))}
        </div>

        {/* Featured */}
        <div className="px-5 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-3xl p-4 relative overflow-hidden"
          >
            <div
              className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full opacity-25 blur-3xl"
              style={{ background: "var(--gradient-cyan)" }}
            />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--cyan-glow)" }} />
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 font-semibold">
                Lectura recomendada · B2
              </p>
            </div>
            <p className="text-sm font-bold text-white">TOEFL Reading: Urban Architecture</p>
            <p className="text-[11px] text-white/65 mt-1 leading-relaxed">
              Texto académico con preguntas estilo TOEFL. Mide tu velocidad y comprensión
              inferencial.
            </p>
            <button
              className="mt-3 text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
            >
              Leer ahora →
            </button>
          </motion.div>
        </div>

        {/* List */}
        <div className="px-5 mt-4 pb-6 flex-1 space-y-2.5">
          {items.map((r, i) => (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate({ to: "/reading/$readingId", params: { readingId: r.id } })}
              className="w-full glass rounded-2xl p-3.5 text-left active:scale-[0.98] transition-transform flex gap-3"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: "oklch(1 0 0 / 0.06)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                }}
              >
                {r.category === "Story" ? (
                  <FileText
                    className="w-4.5 h-4.5"
                    style={{ color: "var(--cyan-glow)", width: 18, height: 18 }}
                  />
                ) : r.category === "Article" ? (
                  <Newspaper
                    className="w-4.5 h-4.5"
                    style={{ color: "var(--cyan-glow)", width: 18, height: 18 }}
                  />
                ) : (
                  <BookOpen
                    className="w-4.5 h-4.5"
                    style={{ color: "var(--cyan-glow)", width: 18, height: 18 }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
                  >
                    {r.level}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.15em] text-white/45 font-semibold">
                    {r.category}
                  </span>
                </div>
                <p className="text-[12.5px] font-bold text-white leading-tight">{r.title}</p>
                <p className="text-[10.5px] text-white/55 mt-0.5 line-clamp-1">{r.excerpt}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-white/50">
                    <Clock className="w-2.5 h-2.5" /> {r.minutes} min
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-white/50">
                    <Star className="w-2.5 h-2.5" style={{ color: "var(--cyan-glow)" }} />{" "}
                    {r.rating}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </PhoneFrame>
  );
}
