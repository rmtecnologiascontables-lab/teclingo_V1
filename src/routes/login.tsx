import { createFileRoute, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import {
  loginEmail,
  loginGoogleReal,
  loginGuest,
  ensureSeed,
  getSession,
  type Role,
} from "@/lib/demo-store";
import { Mail, Lock, GraduationCap, Briefcase, BookOpen, Globe, UserCircle2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Iniciar sesión · TecLingo" }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    role: (search.role as Role) || "student",
    demo: search.demo === "true",
  }),
});

function LoginPage() {
  const { role: initialRole, demo: isDemo } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole || "student");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    ensureSeed();
    const s = getSession();
    if (s) navigate({ to: "/dashboard" });
  }, [navigate]);

  useEffect(() => {
    if (isDemo) {
      router.clearCache();
      loginGuest(role);
      navigate({ to: "/dashboard" });
    }
  }, [isDemo, role, navigate, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await loginEmail(email, pwd);
    if ("error" in res) setError(res.error);
    else navigate({ to: "/dashboard" });
  };

  const google = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("DEBUG: Google Success! Token received.");
      try {
        const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((res) => res.json());

        const res = await loginGoogleReal(userInfo.email);

        if ("error" in res && res.isNew) {
          setError(res.error);
          setTimeout(() => navigate({ to: "/register" }), 2000);
        } else if ("error" in res) {
          setError(res.error);
        } else {
          navigate({ to: "/dashboard" });
        }
      } catch (err) {
        setError("Error al autenticar con Google");
      }
    },
    onError: () => setError("El login con Google fue cancelado o falló"),
  });

  const guest = () => {
    loginGuest(role);
    navigate({ to: "/dashboard" });
  };

  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col px-5 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-foreground/5 rounded-3xl mx-auto mb-4 flex items-center justify-center border border-border shadow-2xl">
            <Globe className="w-8 h-8 text-cyan-400" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/50 font-semibold">
            TecLingo · Institucional
          </p>
          <h1 className="text-3xl font-black text-foreground tracking-tighter mt-1">Bienvenido</h1>
          <p className="text-xs text-foreground/60 mt-1">Inicia sesión para continuar a tu panel</p>
        </motion.div>

        {/* Login Form */}
        <form onSubmit={submit} className="space-y-3" aria-label="Formulario de inicio de sesión">
          <Field
            icon={<Mail className="w-4 h-4" />}
            placeholder="Correo electrónico"
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

          {error && (
            <p
              className="text-[11px] text-red-300 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl py-3.5 text-sm font-bold mt-2 active:scale-[0.98] transition-all shadow-lg"
            style={{ background: "var(--gradient-cyan)", color: "var(--navy-deep)" }}
          >
            Entrar al sistema
          </button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-foreground/5" />
          <span className="text-[10px] text-foreground/30 uppercase tracking-[0.2em]">O BIEN</span>
          <div className="flex-1 h-px bg-foreground/5" />
        </div>

        {/* Google Login */}
        <button
          onClick={() => google()}
          className="w-full rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-3 glass-strong active:scale-[0.98] transition-all border border-border"
        >
          <img
            src="https://www.google.com/favicon.ico"
            className="w-4 h-4 grayscale opacity-70"
            alt=""
          />
          Acceder con Google
        </button>

        <div className="mt-auto pt-10">
          <p className="text-center text-xs text-foreground/50">
            ¿Aún no tienes cuenta institucional?
          </p>
          <Link
            to="/register"
            className="block w-full mt-3 py-3 text-center text-xs font-bold text-foreground glass rounded-2xl active:scale-95 transition-all"
          >
            Solicitar Registro / Crear cuenta
          </Link>
        </div>

        <Link
          to="/"
          className="text-center text-[10px] text-foreground/30 mt-8 uppercase tracking-widest hover:text-foreground transition-colors"
        >
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
    <label className="flex items-center gap-2 glass rounded-2xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-foreground/30">
      <span className="sr-only">{label}</span>
      <span className="text-foreground/50" aria-hidden>
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-foreground/35"
        required
      />
    </label>
  );
}
