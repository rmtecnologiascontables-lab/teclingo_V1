import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useDemoSession } from "@/lib/use-demo-auth";
import {
  getUsers,
  getMessages,
  conversationBetween,
  sendMessage,
  markConversationRead,
  type DemoUser,
  type Role,
} from "@/lib/demo-store";
import { ArrowLeft, Send, Search, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
  head: () => ({ meta: [{ title: "Mensajes · TecLingo" }] }),
});

function MessagesPage() {
  const navigate = useNavigate();
  const session = useDemoSession();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Role>("all");
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);

  // Re-render on store change
  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener("demo-store-change", h);
    return () => window.removeEventListener("demo-store-change", h);
  }, []);

  useEffect(() => {
    if (session === null && typeof window !== "undefined") {
      const t = setTimeout(() => {
        if (!window.localStorage.getItem("demo.session")) navigate({ to: "/login" });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [session, navigate]);

  const users = useMemo(() => getUsers(), [tick]);
  const messages = useMemo(() => getMessages(), [tick]);

  if (!session) {
    return (
      <PhoneFrame>
        <div className="min-h-screen flex items-center justify-center text-white/60 text-sm">
          Cargando…
        </div>
      </PhoneFrame>
    );
  }

  const others = users
    .filter((u) => u.id !== session.id)
    .filter((u) => (filter === "all" ? true : u.role === filter))
    .filter((u) => (query ? u.name.toLowerCase().includes(query.toLowerCase()) : true));

  const active = activeId ? (users.find((u) => u.id === activeId) ?? null) : null;

  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center gap-3">
          {active ? (
            <button
              onClick={() => setActiveId(null)}
              className="w-9 h-9 rounded-full glass flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          ) : (
            <Link
              to="/dashboard"
              className="w-9 h-9 rounded-full glass flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 font-semibold">
              Mensajería
            </p>
            <p className="text-sm font-bold text-white truncate">
              {active ? `${active.avatar ?? "👤"} ${active.name}` : "Bandeja interna"}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!active ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Filters */}
              <div className="px-5">
                <label className="flex items-center gap-2 glass rounded-2xl px-3 py-2 mb-2">
                  <Search className="w-4 h-4 text-white/45" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar usuario…"
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/35"
                  />
                </label>
                <div className="flex gap-1.5">
                  {(["all", "director", "teacher", "student"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-full transition-all"
                      style={
                        filter === f
                          ? { background: "var(--gradient-cyan)", color: "var(--navy-deep)" }
                          : {
                              background: "oklch(1 0 0 / 0.06)",
                              color: "white",
                              border: "1px solid oklch(1 0 0 / 0.1)",
                            }
                      }
                    >
                      {f === "all"
                        ? "Todos"
                        : f === "director"
                          ? "Directivos"
                          : f === "teacher"
                            ? "Docentes"
                            : "Alumnos"}
                    </button>
                  ))}
                </div>
              </div>

              {/* User list */}
              <div className="px-5 mt-3 space-y-1.5 pb-6 flex-1">
                {others.length === 0 && (
                  <div className="glass rounded-2xl p-6 text-center text-white/55 text-xs">
                    <MessageSquare className="w-5 h-5 mx-auto mb-2 opacity-60" />
                    Sin contactos en este filtro.
                  </div>
                )}
                {others.map((u) => {
                  const conv = conversationBetween(session.id, u.id);
                  const last = conv[conv.length - 1];
                  const unread = messages.filter(
                    (m) =>
                      m.fromId === u.id && m.toId === session.id && !m.readBy.includes(session.id),
                  ).length;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setActiveId(u.id);
                        markConversationRead(session.id, u.id);
                      }}
                      className="w-full glass-strong rounded-2xl p-3 flex items-center gap-3 active:scale-[0.99] transition-transform text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                        style={{ background: "oklch(1 0 0 / 0.08)" }}
                      >
                        {u.avatar ?? "👤"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-white truncate">{u.name}</p>
                          <span className="text-[9px] uppercase tracking-widest text-white/40">
                            {roleShort(u.role)}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/55 truncate">
                          {last
                            ? (last.fromId === session.id ? "Tú: " : "") + last.text
                            : "Sin mensajes aún"}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
                        >
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <Chat key="chat" me={session} other={active} onSent={() => setTick((t) => t + 1)} />
          )}
        </AnimatePresence>
      </div>
    </PhoneFrame>
  );
}

function roleShort(r: Role) {
  return r === "director" ? "DIR" : r === "teacher" ? "DOC" : "ALU";
}

function Chat({ me, other, onSent }: { me: DemoUser; other: DemoUser; onSent: () => void }) {
  const [text, setText] = useState("");
  const [tick, setTick] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = () => setTick((t) => t + 1);
    window.addEventListener("demo-store-change", h);
    return () => window.removeEventListener("demo-store-change", h);
  }, []);

  const conv = useMemo(() => conversationBetween(me.id, other.id), [me.id, other.id, tick]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conv.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(me.id, other.id, text);
    setText("");
    onSent();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="flex-1 flex flex-col"
    >
      <div ref={scrollRef} className="flex-1 px-4 overflow-y-auto space-y-2 pb-4 scrollbar-hide">
        {conv.length === 0 && (
          <div className="text-center text-white/45 text-xs mt-10">
            Inicia la conversación con {other.name.split(" ")[0]} 👋
          </div>
        )}
        {conv.map((m) => {
          const mine = m.fromId === me.id;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[78%] rounded-2xl px-3 py-2 text-[13px]"
                style={
                  mine
                    ? { background: "var(--gradient-cyan)", color: "var(--navy-deep)" }
                    : {
                        background: "oklch(1 0 0 / 0.08)",
                        color: "white",
                        border: "1px solid oklch(1 0 0 / 0.08)",
                      }
                }
              >
                <p className="leading-snug">{m.text}</p>
                <p className="text-[9px] mt-0.5 opacity-60 text-right">{formatTime(m.createdAt)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <form onSubmit={submit} className="px-4 pb-5 pt-2 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1 glass rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:ring-1 focus:ring-white/30"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
          style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}

function formatTime(t: number) {
  const d = new Date(t);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
