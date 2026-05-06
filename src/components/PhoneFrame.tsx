import { ReactNode, useState } from "react";
import { BottomNav } from "./BottomNav";
import { useLocation, Link } from "@tanstack/react-router";
import { useDemoSession } from "@/lib/use-demo-auth";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Library,
  Sparkles,
} from "lucide-react";
import { logout } from "@/lib/demo-store";

export function PhoneFrame({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  const location = useLocation();
  const session = useDemoSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isAuthPage =
    location.pathname.includes("/login") ||
    location.pathname.includes("/register") ||
    location.pathname === "/" ||
    location.pathname.includes("/welcome") ||
    location.pathname.includes("/register-success") ||
    location.pathname.includes("/superadmin") ||
    location.pathname.includes("/solicitudes");

  const shouldHideNav = hideNav !== undefined ? hideNav : isAuthPage;
  const isDirector = session?.role === "director";

  // En PC para el Director, usamos un Layout de Pantalla Completa (CRM)
  // En Móvil o para Alumnos, mantenemos el PhoneFrame Premium
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* SIDEBAR (Solo visible en Desktop para Directores/Docentes si se desea) */}
      {!isAuthPage && isDirector && (
        <aside
          className={`hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ${sidebarCollapsed ? "w-20" : "w-72"}`}
        >
          <div className="p-6 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  T
                </div>
                <span className="font-bold tracking-tight text-foreground">TecLingo AI</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground ml-auto"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            <SidebarItem
              to="/dashboard"
              icon={<LayoutDashboard />}
              label="Dashboard"
              collapsed={sidebarCollapsed}
              active={location.pathname === "/dashboard"}
            />
            <SidebarItem
              to="/admin-users"
              icon={<Users />}
              label="Gestión de Usuarios"
              collapsed={sidebarCollapsed}
              active={location.pathname === "/admin-users"}
            />
            <SidebarItem
              to="/messages"
              icon={<MessageSquare />}
              label="Mensajería Institucional"
              collapsed={sidebarCollapsed}
              active={location.pathname === "/messages"}
            />
            <SidebarItem
              to="/library"
              icon={<Library />}
              label="Librería Digital"
              collapsed={sidebarCollapsed}
              active={location.pathname === "/library"}
            />
            <SidebarItem
              to="/ai-lab"
              icon={<Sparkles />}
              label="Laboratorio IA"
              collapsed={sidebarCollapsed}
              active={location.pathname === "/ai-lab"}
            />
            <SidebarItem
              to="/settings"
              icon={<Settings />}
              label="Configuración"
              collapsed={sidebarCollapsed}
              active={location.pathname === "/settings"}
            />
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm font-semibold">Cerrar Sesión</span>}
            </button>
          </div>
        </aside>
      )}

      {/* ÁREA DE CONTENIDO */}
      <main
        className={`flex-1 relative overflow-hidden ${isAuthPage ? "flex items-center justify-center" : "flex flex-col"}`}
      >
        {/* En PC para cualquier usuario autenticado, eliminamos el "celular" */}
        <div
          className={`relative transition-all duration-500 overflow-hidden ${
            isAuthPage
              ? "w-full max-w-[428px] md:rounded-[2.5rem] md:border md:border-border md:shadow-[var(--shadow-soft)] h-full md:h-[860px] md:max-h-[90vh]"
              : "flex-1 w-full h-full lg:max-w-none lg:rounded-none lg:border-none"
          }`}
        >
          <div className="absolute inset-0" style={{ background: "var(--background)" }} />
          <div className="relative h-full w-full overflow-y-auto scrollbar-hide">{children}</div>

          {/* BottomNav solo en móvil para usuarios autenticados */}
          {!shouldHideNav && (
            <div className={`${!isAuthPage ? "lg:hidden" : ""}`}>
              <BottomNav />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({
  to,
  icon,
  label,
  collapsed,
  active,
}: {
  to: string;
  icon: any;
  label: string;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
      {!collapsed && <span className="text-sm font-bold tracking-tight">{label}</span>}
    </Link>
  );
}
