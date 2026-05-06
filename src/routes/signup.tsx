import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { gapi } from "@/lib/google-sheets";
import { User, Mail, Hash, Building2, Loader2, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [{ title: "Inscripción · TecLingo" }],
  }),
});

const INSTITUCIONES = [
  "ITSP (INSTITUTO TECNOLOGICO DE PANUCO)",
  "ITSP (INSTITUTO TECNOLOGICO DE POZA RICA)",
  "OTRA INSTITUCION",
];

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [numeroControl, setNumeroControl] = useState("");
  const [institutionName, setInstitutionName] = useState("ITSP (INSTITUTO TECNOLOGICO DE PANUCO)");
  const [appCode, setAppCode] = useState("TECNM-4194");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await gapi.createSolicitud({
        nombre,
        email,
        numero_control: numeroControl,
        institutionName,
        app_code: appCode,
      });

      console.log("Solicitud creada:", result);
      setStep(2);
      setSuccess(`Tu solicitud ha sido enviada. Código: ${result.codigo_inscripcion}`);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <PhoneFrame>
        <div className="min-h-screen flex flex-col px-5 pt-10 pb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">Solicitud Enviada</h1>
            <p className="text-zinc-400 mb-6">
              Tu solicitud de inscripción ha sido enviada al administrador.
              Recibirás un correo cuando sea aprobada.
            </p>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="text-indigo-400 hover:text-indigo-300 text-sm"
            >
              Ir a Iniciar Sesión →
            </button>
          </motion.div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col px-5 pt-10 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-zinc-100">Inscripción</h1>
          <p className="text-zinc-400 text-sm">
            Completa el formulario para solicitar tu lugar en el curso
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-3 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Tu nombre completo"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-3 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Número de Control</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={numeroControl}
                onChange={(e) => setNumeroControl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-3 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="ITSP-0001"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Institución</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <select
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-3 text-zinc-100 text-sm focus:outline-none focus:border-indigo-500"
              >
                {INSTITUCIONES.map((inst) => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 py-2.5 rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Solicitud"
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate({ to: "/login" })}
              className="text-zinc-500 hover:text-zinc-400 text-xs"
            >
              ¿Ya tienes cuenta? Iniciar sesión
            </button>
          </div>
        </form>
      </div>
    </PhoneFrame>
  );
}