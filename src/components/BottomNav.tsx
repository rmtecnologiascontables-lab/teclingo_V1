import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  BookOpen,
  Sparkles,
  Settings,
  User,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const items = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/lesson", icon: BookOpen, label: "Lesson" },
  { to: "/ai-lab", icon: Sparkles, label: "AI Lab" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const activeItem = items.find((i) => i.to === pathname) ?? items[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 pointer-events-none flex flex-col items-center">
      {/* Toggle handle */}
      <div className="pointer-events-auto mb-1.5">
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expandir" : "Ocultar"}
          className="glass-strong rounded-full w-9 h-9 flex items-center justify-center active:scale-95 transition-transform"
        >
          {collapsed ? (
            <ChevronUp className="w-4 h-4 text-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-foreground" />
          )}
        </button>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {collapsed ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCollapsed(false)}
            className="pointer-events-auto flex items-center gap-2 glass-strong rounded-full px-4 py-2 absolute bottom-6"
          >
            <ActiveIcon className="w-4 h-4 text-foreground" />
            <span className="text-[11px] font-bold text-foreground tracking-wide">
              {activeItem.label}
            </span>
            <span className="text-[10px] text-foreground/50 ml-1">· open</span>
          </motion.button>
        ) : (
          <motion.nav
            key="expanded"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto glass-strong rounded-2xl px-1 py-1.5 flex items-center gap-1 absolute bottom-4 left-4 right-4"
          >
            {items.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all"
                  style={
                    active
                      ? { background: "var(--gradient-cyan)", color: "var(--primary-foreground)" }
                      : { color: "var(--foreground)" }
                  }
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[10px] font-semibold tracking-wide">{label}</span>
                </Link>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
