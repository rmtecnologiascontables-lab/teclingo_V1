import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { getSession, type Role } from "@/lib/demo-store";
import { generateQRDataURL } from "@/lib/qr-utils";
import { jsPDF } from "jspdf";
import { CheckCircle2, QrCode, Download, Copy, Timer, ArrowRight, User } from "lucide-react";

export const Route = createFileRoute("/register-success")({
  component: RegisterSuccessPage,
  head: () => ({
    meta: [{ title: "Registro exitoso · TecLingo" }],
  }),
});

const COUNTDOWN_SECONDS = 10;

function RegisterSuccessPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate({ to: "/register", replace: true });
      return;
    }

    const genQR = async () => {
      if (session.app_code) {
        const url = await generateQRDataURL({
          name: session.name,
          email: session.email,
          app_code: session.app_code,
        });
        setQrDataUrl(url);
      }
    };
    genQR();
  }, [session]);

  useEffect(() => {
    if (countdown <= 0) {
      navigate({ to: "/dashboard" });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  const handleDownloadPNG = useCallback(async () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `${session?.app_code || "qr"}.png`;
    link.href = qrDataUrl;
    link.click();
  }, [qrDataUrl, session]);

  const handleDownloadPDF = useCallback(() => {
    if (!session?.app_code) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("TecLingo - Credencial Digital", 20, 20);
    doc.setFontSize(14);
    doc.text(`Nombre: ${session.name}`, 20, 35);
    doc.text(`Email: ${session.email}`, 20, 45);
    doc.text(`ID: ${session.app_code}`, 20, 55);
    doc.text(
      `Rol: ${session.role === "director" ? "Director" : session.role === "teacher" ? "Docente" : "Alumno"}`,
      20,
      65,
    );
    if (session.institutionName) doc.text(`Institución: ${session.institutionName}`, 20, 75);
    if (session.carrera) doc.text(`Carrera: ${session.carrera}`, 20, 85);
    if (session.semestre) doc.text(`Semestre: ${session.semestre}`, 20, 95);
    if (session.numeroControl) doc.text(`No. Control: ${session.numeroControl}`, 20, 105);
    doc.save(`${session.app_code}.pdf`);
  }, [session]);

  const handleCopy = useCallback(() => {
    if (!session?.app_code) return;
    navigator.clipboard.writeText(session.app_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [session]);

  if (!session) return null;

  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col px-5 pt-10 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
            style={{ background: "var(--gradient-cyan)" }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: "var(--navy-deep)" }} />
          </motion.div>

          <h1 className="text-xl font-extrabold text-gradient mt-4">¡Registro exitoso!</h1>
          <p className="text-xs text-white/60 mt-1">
            Bienvenido a TecLingo, {session.name.split(" ")[0]}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-col items-center"
        >
          {/* Tarjeta de Identificación Profesional (Vertical) */}
          <div className="relative w-[280px] h-[440px] bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden">
            {/* Header / Banner */}
            <div className="h-[100px] w-full" style={{ background: "var(--gradient-cyan)" }}></div>

            {/* Avatar Circle */}
            <div className="absolute top-[50px] left-1/2 -translate-x-1/2 w-[100px] h-[100px] bg-gray-100 rounded-full border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
              <User className="w-12 h-12 text-gray-400" />
            </div>

            {/* Content */}
            <div className="mt-[60px] px-6 flex flex-col items-center flex-1 text-center">
              <h2 className="text-xl font-bold text-gray-800 leading-tight">{session.name}</h2>
              <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mt-1">
                {session.role === "director"
                  ? "Director"
                  : session.role === "teacher"
                    ? "Docente"
                    : "Alumno"}
              </p>

              <div className="mt-4 w-full text-xs text-gray-600 space-y-1 text-left">
                <p>
                  <span className="font-bold">Institución:</span>{" "}
                  {session.institutionName || "TecLingo"}
                </p>
                {session.role === "student" && (
                  <>
                    <p>
                      <span className="font-bold">Carrera:</span> {session.carrera}
                    </p>
                    <p>
                      <span className="font-bold">Semestre:</span> {session.semestre}
                    </p>
                    <p>
                      <span className="font-bold">No. Control:</span> {session.numeroControl}
                    </p>
                  </>
                )}
              </div>

              {/* QR Code Container */}
              <div className="mt-auto mb-6 flex flex-col items-center">
                <div className="p-2 border border-gray-200 rounded-xl bg-white">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" className="w-[80px] h-[80px]" />
                  ) : (
                    <div className="w-[80px] h-[80px] flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-mono font-bold text-gray-400 mt-2">
                  {session.app_code}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex gap-2"
        >
          <button
            onClick={handleCopy}
            className="flex-1 rounded-2xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 glass-strong active:scale-[0.98] transition-transform"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado" : "Copiar ID"}
          </button>

          <button
            onClick={handleDownloadPNG}
            className="flex-1 rounded-2xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 glass-strong active:scale-[0.98] transition-transform"
          >
            <QrCode className="w-4 h-4" />
            QR PNG
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex-1 rounded-2xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 glass-strong active:scale-[0.98] transition-transform"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-auto"
        >
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              background: "var(--gradient-cyan)",
              color: "var(--navy-deep)",
            }}
          >
            Ir al dashboard
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 mt-4 text-white/40">
            <Timer className="w-3 h-3" />
            <span className="text-xs">Redirección en {countdown}s...</span>
          </div>
        </motion.div>
      </div>
    </PhoneFrame>
  );
}
