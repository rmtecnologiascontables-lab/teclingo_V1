import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { registerEmail, ensureSeed, getSession, type Role } from "@/lib/demo-store";
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Briefcase,
  BookOpen,
  Globe,
  Building2,
  Key,
  Hash,
  Calendar,
  Book,
  Loader2,
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [{ title: "Crear cuenta · TecLingo" }],
  }),
});

const CARRERAS = [
  "Licenciatura en Contaduría Pública",
  "Ingeniería Electrónica",
  "Ingeniería en Gestión Empresarial",
  "Ingeniería en Informática",
  "Ingeniería en Sistemas Computacionales",
  "Ingeniería Industrial",
  "Ingeniería Petrolera",
  "Maestría en Ingeniería Administrativa",
];

const SEMESTRES = ["1ro", "2do", "3ro", "4to", "5to", "6to", "7mo", "8vo", "9no"];

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [institutionName, setInstitutionName] = useState("ITSP (INSTITUTO TECNOLOGICO DE PANUCO)");
  const [carrera, setCarrera] = useState("");
  const [semestre, setSemestre] = useState("");
  const [numeroControl, setNumeroControl] = useState("");
  const [modalidad, setModalidad] = useState("Presencial");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const MODALIDADES = ["Presencial", "A Distancia", "Mixta"];

  useEffect(() => {
    ensureSeed();
    const s = getSession();
    if (s) navigate({ to: "/dashboard" });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    if (pwd.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");
    if (pwd !== pwd2) return setError("Las contraseñas no coinciden");

    if (role !== "director" && !institutionCode.trim()) {
      return setError("Ingresa el código institucional (ITSP-XXXX)");
    }

    if (role !== "director" && !institutionName.trim()) {
      return setError("Ingresa el nombre de la institución");
    }

    if (role === "student") {
      if (!carrera.trim()) return setError("Ingresa tu carrera");
      if (!semestre.trim()) return setError("Ingresa tu semestre");
      if (!numeroControl.trim()) return setError("Ingresa tu número de control");
    }

    setIsLoading(true);
    try {
      const res = await registerEmail(
        name || "Usuario",
        email,
        pwd,
        role,
        institutionCode.trim() || undefined,
        {
          institutionName: institutionName.trim(),
          carrera: carrera.trim(),
          semestre: semestre.trim(),
          numeroControl: numeroControl.trim(),
          modalidad: modalidad,
        },
      );

      if ("error" in res) {
        setError(res.error);
        setIsLoading(false);
      } else {
        navigate({ to: "/register-success" });
      }
    } catch (err) {
      setError("Error inesperado en el servidor");
      setIsLoading(false);
    }
  };

  const google = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((res) => res.json());

        setName(userInfo.name || "");
        setEmail(userInfo.email || "");
        setError(
          "¡Google enlazado! Completa tu contraseña y los datos faltantes para crear la cuenta.",
        );
      } catch (err) {
        setError("Error al obtener datos de Google");
      }
    },
    onError: () => setError("El registro con Google fue cancelado o falló"),
  });

  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col px-5 pt-10 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-semibold">
            TecLingo
          </p>
          <h1 className="text-2xl font-extrabold text-gradient mt-1">Crear cuenta</h1>
          <p className="text-xs text-white/60 mt-1">Regístrate para empezar</p>
        </motion.div>

        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold mb-2">
          Selecciona tu rol
        </p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(
            [
              { r: "student", label: "Alumno", Icon: GraduationCap },
              { r: "teacher", label: "Docente", Icon: BookOpen },
              { r: "director", label: "Director", Icon: Briefcase },
            ] as const
          ).map(({ r, label, Icon }) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className="rounded-2xl p-3 flex flex-col items-center gap-1 transition-all active:scale-95"
              style={
                role === r
                  ? { background: "var(--gradient-cyan)", color: "var(--navy-deep)" }
                  : {
                      background: "oklch(1 0 0 / 0.06)",
                      border: "1px solid oklch(1 0 0 / 0.12)",
                      color: "white",
                    }
              }
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-2" aria-label="Formulario de registro">
          <Field
            icon={<User className="w-4 h-4" />}
            placeholder="Nombre"
            value={name}
            onChange={setName}
            label="Nombre"
          />
          <Field
            icon={<Mail className="w-4 h-4" />}
            placeholder="correo@demo.mx"
            value={email}
            onChange={setEmail}
            type="email"
            label="Correo"
          />
          <Field
            icon={<Lock className="w-4 h-4" />}
            placeholder="Contraseña"
            value={pwd}
            onChange={setPwd}
            type="password"
            label="Contraseña"
          />
          <Field
            icon={<Lock className="w-4 h-4" />}
            placeholder="Confirmar contraseña"
            value={pwd2}
            onChange={setPwd2}
            type="password"
            label="Confirmar contraseña"
          />

          {role !== "director" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="glass rounded-2xl px-3 py-2.5 space-y-2"
            >
              <p className="text-[10px] text-white/50 mb-1">
                Datos de la Institución (obligatorio)
              </p>
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={institutionCode}
                  onChange={(e) => setInstitutionCode(e.target.value.toUpperCase())}
                  placeholder="Código Institucional (ITSP-0001)"
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/35 uppercase"
                  required
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Nombre de la Institución"
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/35"
                  required
                />
              </div>
            </motion.div>
          )}

          {role === "student" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              {/* Selector de Carrera */}
              <div className="flex items-center gap-2 glass rounded-2xl px-3 py-2.5">
                <Book className="w-4 h-4 text-white/40" />
                <select
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white appearance-none"
                  required
                >
                  <option value="" disabled className="bg-slate-900">
                    Selecciona tu Carrera
                  </option>
                  {CARRERAS.map((c) => (
                    <option key={c} value={c} className="bg-slate-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Semestre */}
              <div className="flex items-center gap-2 glass rounded-2xl px-3 py-2.5">
                <Calendar className="w-4 h-4 text-white/40" />
                <select
                  value={semestre}
                  onChange={(e) => setSemestre(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white appearance-none"
                  required
                >
                  <option value="" disabled className="bg-slate-900">
                    Selecciona tu Semestre
                  </option>
                  {SEMESTRES.map((s) => (
                    <option key={s} value={s} className="bg-slate-900">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de Modalidad */}
              <div className="flex items-center gap-2 glass rounded-2xl px-3 py-2.5">
                <Globe className="w-4 h-4 text-white/40" />
                <select
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white appearance-none"
                  required
                >
                  {MODALIDADES.map((m) => (
                    <option key={m} value={m} className="bg-slate-900">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                icon={<Hash className="w-4 h-4" />}
                placeholder="Número de Control (ej. ITSP-IND-0001)"
                value={numeroControl}
                onChange={setNumeroControl}
                label="Número de Control"
              />
            </motion.div>
          )}

          {error && (
            <p className="text-[11px] text-red-300" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl py-3 text-sm font-bold mt-2 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-white/40 uppercase tracking-widest">o</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          onClick={() => google()}
          className="w-full rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 glass-strong active:scale-[0.98] transition-transform"
        >
          <Globe className="w-4 h-4" />
          Registrarse con Google
        </button>

        <p className="text-center text-xs text-white/70 mt-5">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            search={{ role: "student", demo: false }}
            className="font-bold text-gradient underline-offset-2 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>

        <Link to="/" className="text-center text-[11px] text-white/50 mt-6">
          ← Volver al inicio
        </Link>
      </div>
    </PhoneFrame>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  label,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 glass rounded-2xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-white/30">
      <span className="sr-only">{label}</span>
      <span className="text-white/50" aria-hidden>
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/35"
        required
      />
    </label>
  );
}
