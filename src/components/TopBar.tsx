import { Flame, Zap, Trophy, Home } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/teclingo-logo.jpeg";

export function TopBar({
  streak = 14,
  xp = 2840,
  league = "B2",
  showHome = true,
}: {
  streak?: number;
  xp?: number;
  league?: string;
  showHome?: boolean;
}) {
  return (
    <div className="px-5 pt-12 pb-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {showHome ? (
          <Link
            to="/dashboard"
            className="w-10 h-10 rounded-xl overflow-hidden border border-white/15 shadow-[0_4px_16px_oklch(0_0_0/0.5)] flex items-center justify-center hover:scale-105 transition-transform"
            style={{ background: "var(--gradient-cyan)" }}
          >
            <Home className="w-5 h-5" style={{ color: "var(--navy-deep)" }} />
          </Link>
        ) : (
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/15 shadow-[0_4px_16px_oklch(0_0_0/0.5)]">
            <img src={logo} alt="TecLingo" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="leading-tight">
          <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/50 font-semibold">
            TecLingo
          </p>
          <p className="text-sm font-bold text-foreground">Tec de Pánuco</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Pill icon={<Flame className="w-3.5 h-3.5" />} value={streak} color="oklch(0.75 0.18 50)" />
        <Pill
          icon={<Zap className="w-3.5 h-3.5" />}
          value={xp.toLocaleString()}
          color="var(--cyan-glow)"
        />
        <Pill icon={<Trophy className="w-3.5 h-3.5" />} value={league} color="var(--gold)" />
      </div>
    </div>
  );
}

function Pill({
  icon,
  value,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  color: string;
}) {
  return (
    <div className="glass rounded-full px-2.5 py-1.5 flex items-center gap-1">
      <span style={{ color }}>{icon}</span>
      <span className="text-xs font-bold text-foreground">{value}</span>
    </div>
  );
}
