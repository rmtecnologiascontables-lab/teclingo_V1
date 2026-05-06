import { useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { ArrowRight, Sparkles, ShieldCheck, Globe } from "lucide-react";

export const Route = createFileRoute("/welcome")({
  component: WelcomePage,
  head: () => ({
    meta: [
      { title: "Bienvenido · TecLingo" },
      {
        name: "description",
        content: "Bienvenido a TecLingo. Tu ruta de inglés técnico profesional.",
      },
    ],
  }),
});

function WelcomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({
      to: "/login",
      search: { role: "student", demo: false },
      replace: true,
    });
  }, [navigate]);

  const goLogin = () =>
    navigate({
      to: "/login",
      search: { role: "student", demo: false },
    });

  const goRegister = () => navigate({ to: "/register" });

  return (
    <PhoneFrame>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen flex flex-col px-6 pt-16 pb-10 relative overflow-hidden"
      >
        {/* Fondos decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -ml-32 -mb-32" />

        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl mb-8 self-center"
        >
          <Globe className="w-10 h-10 text-cyan-400" />
        </motion.div>

        {/* Content */}
        <div className="text-center flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-1.5 glass rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/80 font-bold">
                TecLingo · Next Gen
              </p>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter leading-[0.9] mb-4">
              Tu ruta de <br />
              <span className="text-gradient">inglés técnico</span>
            </h1>
            <p className="text-sm text-white/60 max-w-[260px] mx-auto leading-relaxed">
              Plataforma institucional con IA diseñada para la excelencia académica en el
              <span className="text-white font-bold ml-1">CLE · ITSP</span>.
            </p>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 mt-10"
        >
          <button
            onClick={goLogin}
            className="w-full rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl"
            style={{
              background: "var(--gradient-cyan)",
              color: "var(--navy-deep)",
            }}
          >
            Comenzar ahora
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={goRegister}
            className="w-full rounded-2xl py-4 text-sm font-bold glass text-white active:scale-95 transition-all"
          >
            Solicitar acceso
          </button>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Acceso Institucional Seguro
          </div>

          <div className="w-12 h-1 bg-white/10 rounded-full" />

          <p className="text-[10px] text-white/30 font-medium">Conceptos AI MX &copy; 2026</p>
        </motion.div>
      </motion.div>
    </PhoneFrame>
  );
}
