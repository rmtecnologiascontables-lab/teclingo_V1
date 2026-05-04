import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/teclingo-logo.jpeg";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/")({
  component: IndexPage,
  head: () => ({
    meta: [
      { title: "TecLingo · Splash" },
      { name: "description", content: "Cargando TecLingo..." },
    ],
  }),
});

function IndexPage() {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const seen = sessionStorage.getItem("teclingo-splash");

    if (seen) {
      navigate({ 
        to: "/login", 
        search: { role: "student", demo: false },
        replace: true 
      });
      return;
    }

    const t = setTimeout(() => {
      sessionStorage.setItem("teclingo-splash", "1");
      navigate({ 
        to: "/login", 
        search: { role: "student", demo: false },
        replace: true 
      });
    }, 2400);

    return () => clearTimeout(t);
  }, [navigate]);

  // 🔥 evita render innecesario después de skip
  if (!showSplash) return null;

  return (
    <PhoneFrame>
      <Splash onSkip={() => setShowSplash(false)} />
    </PhoneFrame>
  );
}

function Splash({ onSkip }: { onSkip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      onClick={onSkip}
      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
      style={{ background: "var(--gradient-bg)" }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <div
          className="absolute inset-0 blur-3xl opacity-60"
          style={{ background: "var(--gradient-cyan)" }}
        />
        <img
          src={logo}
          alt="TecLingo"
          className="relative w-64 h-auto rounded-3xl shadow-2xl animate-float"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-8 text-center px-6"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-white/60 font-semibold">
          Language Platform
        </p>
        <p className="mt-2 text-[11px] tracking-[0.3em] text-white/40">
          CEFR B2+ · TOEFL READY
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-10 text-[10px] tracking-[0.3em] text-white/30 uppercase"
      >
        Conceptos AI MX · 2026
      </motion.p>
    </motion.div>
  );
}