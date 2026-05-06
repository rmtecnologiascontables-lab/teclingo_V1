import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AccentGauge } from "@/components/AccentGauge";
import { AIChat } from "@/components/AIChat";
import { useDemoSession } from "@/lib/use-demo-auth";
import {
  getUsers,
  getMessages,
  logout,
  resetDemo,
  unreadCountFor,
  type Role,
} from "@/lib/demo-store";
import { gapi } from "@/lib/google-sheets";
import { generateQRDataURL } from "@/lib/qr-utils";
import {
  Users,
  MessageSquare,
  Activity,
  LogOut,
  RefreshCw,
  Shield,
  GraduationCap,
  BookOpen,
  ChevronRight,
  QrCode,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard · TecLingo" }] }),
});

function DashboardPage() {
  const navigate = useNavigate();
  const session = useDemoSession();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [studentStats, setStudentStats] = useState<any[]>([]);
  const [gsUsers, setGsUsers] = useState<any[]>([]);
  const [gsUnreadCount, setGsUnreadCount] = useState(0);

  useEffect(() => {
    if (session === null && typeof window !== "undefined") {
      const t = setTimeout(() => {
        if (!window.localStorage.getItem("demo.session"))
          navigate({ to: "/login", search: { role: "student", demo: false } });
      }, 50);
      return () => clearTimeout(t);
    }

    if (session?.status === "INACTIVO") {
      logout();
      navigate({ to: "/login", search: { role: "student", demo: false } });
      return;
    }

    const fetchData = async () => {
      if (session) {
        // QR
        const url = await generateQRDataURL({
          name: session.name,
          email: session.email,
          role: session.role,
          numeroControl: session.numeroControl,
          institution: session.institutionName || "ITSP",
          timestamp: Date.now(),
        });
        setQrDataUrl(url);

        // Stats if student
        if (session.role === "student") {
          try {
            const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
            const resp = await fetch(scriptUrl, {
              method: "POST",
              body: JSON.stringify({ action: "getStats", userId: session.id }),
            });
            const result = await resp.json();
            if (result.success) setStudentStats(result.data);
          } catch (e) {
            console.error(e);
          }
        }

        // GS unread count
        if (gapi.isConfigured()) {
          try {
            const users = await gapi.getUsers();
            setGsUsers(users);
            const gsUser = users.find((u: any) => u.email === session.email);
            if (gsUser?.id) {
            try {
              const msgs = await gapi.getMessagesByUser(gsUser.id);
              const unread = msgs.filter(
                (m: any) =>
                  m.toId === gsUser.id && (!m.readBy || !m.readBy.split(",").includes(gsUser.id)),
              ).length;
              setGsUnreadCount(unread);
            } catch (e) {
              console.error("GS messages error:", e);
              setGsUnreadCount(0);
            }
            }
          } catch (e) {
            console.error("GS messages error:", e);
          }
        }
      }
    };
    fetchData();
  }, [session, navigate]);

  if (!session) {
    return (
      <PhoneFrame>
        <div className="min-h-screen flex items-center justify-center text-white/60 text-sm">
          Cargando…
        </div>
      </PhoneFrame>
    );
  }

  const users = getUsers();
  const messages = getMessages();
  const unread =
    gapi.isConfigured() && gsUnreadCount > 0 ? gsUnreadCount : unreadCountFor(session.id);

  // Calcular progreso dinámico
  const completedCount = studentStats.filter((s) => s.metric === "lesson_completed").length;
  const dynamicProgress = Math.min(100, Math.round((completedCount / 20) * 100));

  const roleLabel: Record<Role, string> = {
    director: "Panel Directivo",
    teacher: "Panel Docente",
    student: "Panel Estudiante",
  };

  const roleStyles: Record<Role, string> = {
    director: "linear-gradient(180deg, oklch(0.2 0.05 260) 0%, oklch(0.25 0.06 260) 100%)",
    teacher: "linear-gradient(180deg, oklch(0.2 0.06 165) 0%, oklch(0.25 0.08 165) 100%)",
    student: "linear-gradient(180deg, oklch(0.18 0.05 265) 0%, oklch(0.22 0.06 265) 100%)",
  };

  return (
    <PhoneFrame>
      <div
        className="min-h-screen flex flex-col transition-colors duration-500"
        style={{ background: "var(--background)" }}
      >
        <div
          className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500"
          style={{ background: roleStyles[session.role], zIndex: 0 }}
        />
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header móvil - Oculto en Desktop para todos los roles */}
          <div className="px-5 pt-6 pb-3 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                style={{ background: "var(--gradient-cyan)" }}
              >
                {session.avatar ?? "👤"}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/55 font-semibold">
                  {roleLabel[session.role]}
                </p>
                <p className="text-sm font-bold text-foreground leading-tight">{session.name}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {session.app_code && (
                <button
                  onClick={() => navigate({ to: "/settings" })}
                  className="w-9 h-9 rounded-full glass flex items-center justify-center"
                  title="Ver credencial QR"
                >
                  <QrCode className="w-4 h-4 text-foreground/70" />
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/login", search: { role: "student", demo: false } });
                }}
                className="w-9 h-9 rounded-full glass flex items-center justify-center"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4 text-foreground/70" />
              </button>
            </div>
          </div>

          {/* Título Desktop - Visible solo en pantallas grandes */}
          <div className="hidden lg:flex lg:items-center lg:justify-between px-10 pt-10 pb-6">
            <div>
              {session.role === "director" && (
                <>
                  <h1 className="text-4xl font-black text-foreground tracking-tighter">
                    Panel de Gestión Institucional
                  </h1>
                  <p className="text-foreground/55 font-medium mt-1">
                    Bienvenido de nuevo, {session.name}
                  </p>
                </>
              )}
              {session.role === "student" && (
                <>
                  <h1 className="text-4xl font-black text-foreground tracking-tighter">
                    Mi Panel de Aprendizaje
                  </h1>
                  <p className="text-foreground/55 font-medium mt-1">
                    Bienvenido, {session.name} · {session.institutionName || "ITSP"}
                  </p>
                </>
              )}
              {session.role === "teacher" && (
                <>
                  <h1 className="text-4xl font-black text-foreground tracking-tighter">
                    Panel Docente
                  </h1>
                  <p className="text-foreground/55 font-medium mt-1">
                    Hola, {session.name} · Ciclo 2026-1
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-border"
                style={{ background: "var(--gradient-cyan)" }}
              >
                {session.avatar ?? "👤"}
              </div>
              <div>
                <p className="text-sm font-black text-foreground">{session.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">
                  {roleLabel[session.role]}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                {session.app_code && (
                  <button
                    onClick={() => navigate({ to: "/settings" })}
                    className="px-4 py-2 rounded-xl glass text-xs font-bold text-foreground/70 flex items-center gap-2 border border-border hover:bg-foreground/5 transition-colors"
                  >
                    <QrCode className="w-4 h-4" /> Mi Perfil
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    navigate({ to: "/login", search: { role: "student", demo: false } });
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/10 flex items-center gap-2 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Salir
                </button>
              </div>
            </div>
          </div>

          <div className="lg:px-10 lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Stats grid */}
              <div className="px-5 lg:px-0 grid grid-cols-3 gap-2 lg:gap-4">
                {session.role === "director" ? (
                  <>
                    <Stat
                      icon={<Users className="w-4 h-4" />}
                      label="Comunidad"
                      value={users.filter((u) => u.app_code === session.app_code).length}
                    />
                    <Stat
                      icon={<BookOpen className="w-4 h-4" />}
                      label="Docentes"
                      value={
                        users.filter((u) => u.app_code === session.app_code && u.role === "teacher")
                          .length
                      }
                    />
                    <Stat icon={<Activity className="w-4 h-4" />} label="Alertas" value={0} />
                  </>
                ) : session.role === "teacher" ? (
                  <>
                    <Stat icon={<Users className="w-4 h-4" />} label="Mis Grupos" value={1} />
                    <Stat
                      icon={<GraduationCap className="w-4 h-4" />}
                      label="Alumnos"
                      value={
                        users.filter((u) => u.app_code === session.app_code && u.role === "student")
                          .length
                      }
                    />
                    <Stat
                      icon={<MessageSquare className="w-4 h-4" />}
                      label="Mensajes"
                      value={unread}
                      highlight={unread > 0}
                    />
                  </>
                ) : (
                  <>
                    <Stat
                      icon={<GraduationCap className="w-4 h-4" />}
                      label="Nivel"
                      value="B2"
                      isString
                    />
                    <Stat
                      icon={<Activity className="w-4 h-4" />}
                      label="Progreso"
                      value={`${dynamicProgress}%`}
                      isString
                    />
                    <Stat
                      icon={<MessageSquare className="w-4 h-4" />}
                      label="Mensajes"
                      value={unread}
                      highlight={unread > 0}
                    />
                  </>
                )}
              </div>

              {/* Role-specific panel */}
              <div className="px-5 lg:px-0 mt-4 lg:mt-0">
                {session.role === "director" && <DirectorPanel />}
                {session.role === "teacher" && <TeacherPanel meId={session.id} />}
                {session.role === "student" && (
                  <StudentPanel meId={session.id} initialStats={studentStats} />
                )}
              </div>
            </div>

            <div className="lg:col-span-4 lg:space-y-6">
              {/* Quick actions */}
              <div className="px-5 lg:px-0 mt-4 lg:mt-0 space-y-2 pb-6 lg:pb-0 flex-1">
                <p className="hidden lg:block text-[10px] uppercase tracking-[0.25em] text-foreground/45 font-bold mb-4 px-1">
                  Acciones Rápidas
                </p>
                {session.role === "student" ? (
                  <>
                    <ActionRow
                      to="/messages"
                      icon={<MessageSquare className="w-4 h-4" />}
                      title="Consultar al Docente"
                      subtitle="Tutoría y dudas de clase"
                      badge={unread > 0 ? unread : undefined}
                    />
                    <ActionRow
                      to={session.last_category_id ? "/lesson" : "/levels"}
                      search={
                        session.last_category_id
                          ? { categoryId: session.last_category_id }
                          : undefined
                      }
                      icon={<BookOpen className="w-4 h-4" />}
                      title="Continuar mi Lección"
                      subtitle={
                        session.last_category_id
                          ? `Continuar en ${session.last_category_id.toUpperCase()}`
                          : "Explora tus niveles"
                      }
                    />
                  </>
                ) : session.role === "teacher" ? (
                  <>
                    <ActionRow
                      to="/messages"
                      icon={<MessageSquare className="w-4 h-4" />}
                      title="Mensajes de Alumnos"
                      subtitle="Atención y tutorías activas"
                      badge={unread > 0 ? unread : undefined}
                    />
                    <ActionRow
                      to="/program"
                      icon={<Users className="w-4 h-4" />}
                      title="Gestión de Grupos"
                      subtitle="Listas, asistencia y programas"
                    />
                    <ActionRow
                      to="/stats"
                      icon={<Activity className="w-4 h-4" />}
                      title="Reporte Académico"
                      subtitle="Progreso global de mis alumnos"
                    />
                  </>
                ) : (
                  <>
                    <ActionRow
                      to="/admin-users"
                      icon={<Users className="w-4 h-4" />}
                      title="Gestión de Alumnos"
                      subtitle="Control de estatus y expedientes"
                    />
                    <ActionRow
                      to="/messages"
                      icon={<MessageSquare className="w-4 h-4" />}
                      title="Mensajería interna"
                      subtitle="Chats por rol y usuario"
                      badge={unread > 0 ? unread : undefined}
                    />
                    <ActionRow
                      to="/settings"
                      icon={<ShieldCheck className="w-4 h-4" />}
                      title="Configuración Institucional"
                      subtitle="Gestión del CLE y Comunidad"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  highlight?: boolean;
  isString?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-3"
      style={highlight ? { boxShadow: "var(--shadow-glow)" } : undefined}
    >
      <div className="flex items-center gap-1.5 text-foreground/55">
        {icon}
        <span className="text-[9px] uppercase tracking-widest font-semibold">{label}</span>
      </div>
      <p className="text-xl font-extrabold text-foreground mt-1 leading-none">{value}</p>
    </motion.div>
  );
}

function ActionRow({
  to,
  icon,
  title,
  subtitle,
  badge,
  search,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: number;
  search?: any;
}) {
  return (
    <Link
      to={to}
      search={search}
      className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{title}</p>
        <p className="text-[11px] text-foreground/55 truncate">{subtitle}</p>
      </div>
      {badge !== undefined && (
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
        >
          {badge}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-foreground/40" />
    </Link>
  );
}

function DirectorPanel() {
  const session = useDemoSession();
  const allUsers = getUsers();

  // Filtramos usuarios que pertenecen a la misma institución que el director
  const institutionalUsers = allUsers.filter((u) => u.app_code === session?.app_code);
  const teachers = institutionalUsers.filter((u) => u.role === "teacher").length;
  const students = institutionalUsers.filter((u) => u.role === "student").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Tarjeta de Código Institucional */}
      <div className="glass-strong rounded-3xl p-5 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -mr-16 -mt-16" />
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">
              Código de Vinculación
            </p>
            <h3 className="text-2xl font-black text-foreground tracking-tighter mt-1">
              {session?.app_code}
            </h3>
          </div>
          <div className="bg-foreground/5 p-2 rounded-2xl border border-border">
            <QrCode className="w-6 h-6 text-foreground" />
          </div>
        </div>
        <p className="text-[11px] text-foreground/50 leading-relaxed">
          Comparte este código con tus alumnos y docentes para que se vinculen al{" "}
          {session?.institutionName || "ITSP"}.
        </p>
      </div>

      {/* Resumen de Usuarios */}
      <div className="glass-strong rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-foreground/90 mb-1">
          <Shield className="w-4 h-4 text-cyan-400" />
          <p className="text-xs font-bold uppercase tracking-widest">Estado de la Institución</p>
        </div>
        <Row label="Docentes vinculados" value={teachers} />
        <Row label="Alumnos registrados" value={students} />
        <Row label="Total miembros" value={institutionalUsers.length} />

        <div className="pt-2">
          <Link
            to="/settings"
            className="w-full py-2.5 bg-foreground/5 border border-border rounded-xl text-[11px] font-bold text-foreground flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            Gestionar Comunidad
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function TeacherPanel({ meId }: { meId: string }) {
  const session = useDemoSession();
  const messages = getMessages().filter((m) => m.toId === meId || m.fromId === meId);
  const institutionalUsers = getUsers().filter((u) => u.app_code === session?.app_code);
  const myStudents = institutionalUsers.filter((u) => u.role === "student");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Resumen Docente */}
      <div className="glass-strong rounded-3xl p-5 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/90">
              Gestión Académica
            </p>
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/20">
            Ciclo 2026-1
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-foreground/5 rounded-2xl p-3 border border-border/40">
            <p className="text-[9px] uppercase text-foreground/40 font-bold mb-1">Alumnos ITSP</p>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-lg font-black text-foreground">{myStudents.length}</p>
            </div>
          </div>
          <div className="bg-foreground/5 rounded-2xl p-3 border border-border/40">
            <p className="text-[9px] uppercase text-foreground/40 font-bold mb-1">Actividad</p>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-lg font-black text-foreground">Alta</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
          <Link to="/messages" className="block">
            <Row label="Mensajes pendientes" value={messages.length} />
          </Link>
          <Row label="Tareas por revisar" value={4} />
          <Row label="Promedio grupal" value="8.4" />
        </div>
      </div>

      {/* Material de Apoyo - Demo de Pronunciación */}
      <div className="glass-strong rounded-3xl p-5 border border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16" />
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-indigo-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/90">
            Material de Apoyo
          </p>
        </div>
        <p className="text-xs text-foreground/50 mb-4">
          Utiliza esta herramienta para demostrar la pronunciación correcta frente a la clase o grabar ejemplos.
        </p>
        <AccentGauge targetText="Welcome to TechLingo English course" label="" />
      </div>
    </motion.div>
  );
}

function StudentPanel({ meId, initialStats }: { meId: string; initialStats: any[] }) {
  const session = useDemoSession();
  const myMsgs = getMessages().filter((m) => m.toId === meId || m.fromId === meId);

  const completedCount = initialStats.filter((s) => s.metric === "lesson_completed").length;
  const xp = completedCount * 150;
  const progress = Math.min(100, Math.round((completedCount / 20) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Tarjeta de Progreso Académico */}
      <div className="glass-strong rounded-3xl p-5 border border-white/10 overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/90">
              Mi Progreso ITSP
            </p>
          </div>
          <span className="text-xl font-black text-cyan-400">{progress}%</span>
        </div>

        {/* Barra de progreso visual */}
        <div className="h-3 bg-foreground/5 rounded-full overflow-hidden border border-border/40 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "var(--gradient-cyan)" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-foreground/5 rounded-2xl p-3 border border-border/40">
            <p className="text-[9px] uppercase text-foreground/40 font-bold mb-1">Nivel</p>
            <p className="text-sm font-bold text-foreground">B2 Intermedio</p>
          </div>
          <div className="bg-foreground/5 rounded-2xl p-3 border border-border/40">
            <p className="text-[9px] uppercase text-foreground/40 font-bold mb-1">Semestre</p>
            <p className="text-sm font-bold text-foreground">{session?.semestre || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos de Estudio */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          to="/library"
          className="glass-strong rounded-2xl p-4 flex flex-col items-center gap-2 border border-border/40 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-xs font-bold text-foreground">Librería</span>
        </Link>
        <Link
          to="/ai-lab"
          className="glass-strong rounded-2xl p-4 flex flex-col items-center gap-2 border border-border/40 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-xs font-bold text-foreground">AI Lab</span>
        </Link>
      </div>

      {/* Resumen en texto */}
      <div className="glass-strong rounded-2xl p-4 space-y-2">
        <Row label="Lecciones completadas" value={completedCount} />
        <Row label="Conversaciones activas" value={myMsgs.length} />
        <Row label="Puntos de experiencia (XP)" value={xp.toLocaleString()} />
      </div>

      {/* Práctica de Pronunciación */}
      <div className="glass-strong rounded-3xl p-5 border border-white/10 overflow-hidden relative">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-indigo-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/90">
            Práctica de Pronunciación
          </p>
        </div>
        <AccentGauge targetText="Hello, how are you today" label="" compact />
      </div>

      {/* AI Chat Tutor */}
      <div className="glass-strong rounded-3xl p-4 border border-white/10 overflow-hidden">
        <AIChat initialLevel="B1" compact />
      </div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between text-foreground/80">
      <span className="text-[12px]">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}
