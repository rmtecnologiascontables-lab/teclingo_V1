import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { gapi } from "@/lib/google-sheets";
import { useDemoSession } from "@/lib/use-demo-auth";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  FileText,
  Mail,
  Building2
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
  head: () => ({
    meta: [{ title: "Panel Superadmin · TecLingo" }],
  }),
});

interface Solicitud {
  id: string;
  codigo_inscripcion: string;
  nombre: string;
  email: string;
  numero_control: string;
  institutionName: string;
  app_code: string;
  status: string;
  created_at: string;
}

function AdminPanel() {
  const session = useDemoSession();
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const SUPER_ADMIN_EMAIL = "rmtecnologiascontables@gmail.com";
  const isSuperAdmin = session?.email === SUPER_ADMIN_EMAIL || session?.role === "superadmin";

  useEffect(() => {
    if (!gapi.isConfigured()) {
      setLoading(false);
      return;
    }
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    if (!gapi.isConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const data = await gapi.getSolicitudes({});
      setSolicitudes(data);
    } catch (e) {
      console.error("Error loading solicitudes:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoadingAction(id);
    try {
      await gapi.approveSolicitud(id, session?.email || "superadmin");
      await loadSolicitudes();
    } catch (e) {
      console.error("Error approving:", e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingAction(id);
    try {
      await gapi.rejectSolicitud(id, session?.email || "superadmin");
      await loadSolicitudes();
    } catch (e) {
      console.error("Error rejecting:", e);
    } finally {
      setLoadingAction(null);
    }
  };

  const pendingSolicitudes = solicitudes.filter(s => s.status === "pendiente");

  if (!isSuperAdmin) {
    return (
      <PhoneFrame>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-zinc-400">No tienes acceso a este panel.</p>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col">
        <div className="px-4 pt-4 pb-2 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-zinc-100">Panel Admin</h1>
            <button onClick={loadSolicitudes} className="p-2 text-zinc-400 hover:text-zinc-200">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <p className="text-xs text-zinc-500">Solicitudes de inscripción</p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {pendingSolicitudes.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-amber-400 uppercase mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Pendientes ({pendingSolicitudes.length})
                </h2>
                <div className="space-y-2">
                  {pendingSolicitudes.map((sol) => (
                    <motion.div
                      key={sol.id}
                      layout
                      className="bg-zinc-900/80 rounded-lg p-3 border border-zinc-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-zinc-100">{sol.nombre}</p>
                          <p className="text-xs text-zinc-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {sol.email}
                          </p>
                          {sol.numero_control && (
                            <p className="text-xs text-zinc-500 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {sol.numero_control}
                            </p>
                          )}
                        </div>
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                          {sol.codigo_inscripcion}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-zinc-500 mb-2">
                        <Building2 className="w-3 h-3" />
                        {sol.institutionName} · {sol.app_code}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(sol.id)}
                          disabled={loadingAction === sol.id}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 rounded text-xs font-medium"
                        >
                          {loadingAction === sol.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleReject(sol.id)}
                          disabled={loadingAction === sol.id}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 rounded text-xs font-medium"
                        >
                          {loadingAction === sol.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          Rechazar
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {solicitudes.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No hay solicitudes</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}