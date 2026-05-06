import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  ChevronLeft,
  ShieldCheck,
  Mail,
  Fingerprint,
  RefreshCcw,
} from "lucide-react";
import { useDemoSession } from "@/lib/use-demo-auth";
import { PhoneFrame } from "@/components/PhoneFrame";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin-users")({
  component: UserManagement,
});

function UserManagement() {
  const user = useDemoSession();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Solo permitir a directores
  useEffect(() => {
    if (user && user.role !== "director") {
      navigate({ to: "/dashboard" });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
      const resp = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({ action: "getUsers" }),
      });
      const result = await resp.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (targetUser: any) => {
    const newStatus = targetUser.status === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    setUpdatingId(targetUser.id);

    try {
      const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
      const resp = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "updateUser",
          id: targetUser.id,
          updates: { status: newStatus },
        }),
      });

      const result = await resp.json();
      if (result.success) {
        // Actualizar localmente
        setUsers(users.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.numeroControl?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  return (
    <PhoneFrame>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col transition-colors duration-500"
        style={{ background: "var(--background)" }}
      >
        {/* Header - Hidden on Desktop since we have Sidebar title */}
        <div className="lg:hidden pt-12 px-6 pb-6 border-b border-border">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center hover:bg-foreground/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-black text-foreground">Gestión de Usuarios</h1>
              <p className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold">
                Panel Administrativo
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Title */}
        <div className="hidden lg:block px-10 pt-10 pb-6">
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            Gestión de la Comunidad
          </h1>
          <p className="text-foreground/55 font-medium mt-1">
            Administra los accesos y expedientes de alumnos y docentes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="px-6 lg:px-10 py-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder="Buscar por nombre o control..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-foreground/5 border border-border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-foreground/30 outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 px-1">
              {filteredUsers.length} Usuarios encontrados
            </p>
            {loading && <RefreshCcw className="w-3 h-3 text-cyan-400 animate-spin" />}
          </div>
        </div>

        {/* User Content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 pb-28 lg:pb-10">
          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <RefreshCcw className="w-8 h-8 animate-spin text-cyan-400 mb-4" />
              <p className="text-sm font-medium text-foreground">Cargando base de datos...</p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW: Cards */}
              <div className="space-y-3 lg:hidden">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((u, idx) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.03 }}
                      className="glass-strong rounded-2xl p-4 border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-foreground/5 border border-border overflow-hidden relative">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="opacity-50 text-sm text-foreground">
                              {u.name?.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm truncate text-foreground/90">
                              {u.name}
                            </h3>
                            {u.role === "director" && (
                              <ShieldCheck className="w-3 h-3 text-cyan-400" />
                            )}
                          </div>
                          <p className="text-[9px] text-foreground/40 font-medium">
                            {u.numeroControl || "S/N"} • {u.carrera || "PERSONAL"}
                          </p>
                        </div>

                        <button
                          disabled={updatingId === u.id || u.id === user?.id}
                          onClick={() => toggleStatus(u)}
                          className={`h-9 px-3 rounded-xl text-[9px] font-black transition-all flex items-center gap-1.5 shadow-lg ${
                            u.status === "ACTIVO" || !u.status
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          } ${updatingId === u.id ? "opacity-50 animate-pulse" : "hover:scale-105 active:scale-95"}`}
                        >
                          {updatingId === u.id ? (
                            <RefreshCcw className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              {u.status === "ACTIVO" || !u.status ? (
                                <UserCheck className="w-3.5 h-3.5" />
                              ) : (
                                <UserX className="w-3.5 h-3.5" />
                              )}
                              {u.status || "ACTIVO"}
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* DESKTOP VIEW: Data Table */}
              <div className="hidden lg:block bg-foreground/[0.02] border border-border rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-foreground/5 border-b border-border">
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                        Usuario
                      </th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                        Control / Carrera
                      </th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                        Rol
                      </th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-foreground/[0.03] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold bg-foreground/5 border border-border overflow-hidden">
                              {u.avatar_url ? (
                                <img src={u.avatar_url} className="w-full h-full object-cover" />
                              ) : (
                                u.name?.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{u.name}</p>
                              <p className="text-[10px] text-foreground/40">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-semibold text-foreground/70">
                            {u.numeroControl || "SIN ASIGNAR"}
                          </p>
                          <p className="text-[10px] text-foreground/40">{u.carrera || "N/A"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase ${
                              u.role === "director"
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                : u.role === "teacher"
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${u.status === "ACTIVO" || !u.status ? "bg-emerald-400" : "bg-red-400"}`}
                            />
                            <span
                              className={`text-xs font-bold ${u.status === "ACTIVO" || !u.status ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {u.status || "ACTIVO"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            disabled={updatingId === u.id || u.id === user?.id}
                            onClick={() => toggleStatus(u)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${
                              u.status === "ACTIVO" || !u.status
                                ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                            } disabled:opacity-50`}
                          >
                            {updatingId === u.id ? (
                              <RefreshCcw className="w-3 h-3 animate-spin" />
                            ) : u.status === "ACTIVO" || !u.status ? (
                              "Desactivar"
                            ) : (
                              "Activar"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </PhoneFrame>
  );
}
