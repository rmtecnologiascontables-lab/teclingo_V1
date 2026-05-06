import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useDemoSession } from "@/lib/use-demo-auth";
import { Users, UserPlus, CheckCircle, ArrowRight, LogOut } from "lucide-react";

export const Route = createFileRoute("/superadmin")({
  component: SuperAdminPanel,
  head: () => ({
    meta: [{ title: "Panel Superadmin · TecLingo" }],
  }),
});

function SuperAdminPanel() {
  const session = useDemoSession();
  const navigate = useNavigate();
  const SUPER_ADMIN_EMAIL = "rmtecnologiascontables@gmail.com";
  const isSuperAdmin = session?.email === SUPER_ADMIN_EMAIL || session?.role === "superadmin";

  useEffect(() => {
    if (session && !isSuperAdmin) {
      navigate({ to: "/login", search: { role: "student" } });
    }
  }, [session, isSuperAdmin]);

  const handleLogout = () => {
    localStorage.removeItem("demo.session");
    window.dispatchEvent(new Event("demo-store-change"));
    navigate({ to: "/login", search: { role: "student" } });
  };

  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-zinc-800">
          <h1 className="text-lg font-bold text-zinc-100">Panel Superadmin</h1>
          <p className="text-xs text-zinc-500">Gestión de inscripciones</p>
        </div>

        {/* Opciones */}
        <div className="flex-1 p-4 space-y-3">
          {/* Gestionar Alumnos */}
          <Link to="/admin">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between p-4 bg-zinc-900/80 rounded-xl border border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">Gestionar Alumnos</p>
                  <p className="text-xs text-zinc-500">Ver usuarios, grupos y stats</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-500" />
            </motion.div>
          </Link>

          {/* Aprobar Solicitudes */}
          <Link to="/solicitudes">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between p-4 bg-zinc-900/80 rounded-xl border border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">Aprobar Solicitudes</p>
                  <p className="text-xs text-zinc-500">Revisar inscripciones pendientes</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-500" />
            </motion.div>
          </Link>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-zinc-400 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}