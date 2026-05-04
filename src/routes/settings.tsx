import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/TopBar";
import { ensureSeed, getSession, logout, resetDemo, type DemoUser } from "@/lib/demo-store";
import { generateQRDataURL } from "@/lib/qr-utils";
import { jsPDF } from "jspdf";
import {
  Bell,
  Globe,
  Moon,
  ShieldCheck,
  HelpCircle,
  Info,
  RotateCcw,
  LogOut,
  ChevronRight,
  UserCircle2,
  Mail,
  Lock,
  Languages,
  Award,
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  Calendar,
  FileText,
  MapPin,
  Phone,
  Building,
  IdCard,
  CreditCard,
  CheckCircle,
  AlertCircle,
  QrCode,
  Download,
  Copy,
  Edit3,
  Save,
  X,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Perfil y Configuración · TecLingo" },
      { name: "description", content: "Tu perfil institucional, académico y configuración de TecLingo." },
    ],
  }),
});

const PREF_KEY = "demo.prefs";
type Prefs = {
  notifications: boolean;
  darkMode: boolean;
  language: "es" | "en";
  soundEffects: boolean;
  autoPlay: boolean;
};
const DEFAULT_PREFS: Prefs = {
  notifications: true,
  darkMode: true,
  language: "es",
  soundEffects: true,
  autoPlay: false,
};

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const v = window.localStorage.getItem(PREF_KEY);
    return v ? { ...DEFAULT_PREFS, ...JSON.parse(v) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}
function savePrefs(p: Prefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREF_KEY, JSON.stringify(p));
}

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"perfil" | "academico" | "config">("perfil");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para edición
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editModalidad, setEditModalidad] = useState("");
  const [editEntryDate, setEditEntryDate] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    showToast("Subiendo imagen a la nube...");
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(",")[1];
      try {
        const { updateUserData } = await import("@/lib/demo-store");
        const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
        
        const response = await fetch(scriptUrl, {
          method: "POST",
          body: JSON.stringify({
            action: "uploadFile",
            fileName: `avatar_${user.email}_${Date.now()}`,
            mimeType: file.type,
            data: base64String,
            folderType: "avatars"
          })
        });
        
        const result = await response.json();
        if (result.success && result.data.url) {
          const newAvatarUrl = result.data.url;
          await updateUserData(user.id, { avatar_url: newAvatarUrl });
          setUser({ ...user, avatar_url: newAvatarUrl });
          showToast("Foto de perfil sincronizada con éxito ✅");
        } else {
          throw new Error("Upload failed");
        }
      } catch (err) {
        console.error(err);
        showToast("Error al subir la imagen ❌");
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleConstancia = useCallback((tipo: string) => {
    if (!user) return;
    showToast(`Generando ${tipo}...`);
    
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102); // Azul institucional
    doc.text("INSTITUTO TECNOLÓGICO DE PÁNUCO", 105, 30, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("CONSTANCIA DE ESTUDIOS", 105, 50, { align: "center" });
    
    doc.setFontSize(12);
    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha: ${fecha}`, 160, 65);
    
    doc.text(`A QUIEN CORRESPONDA:`, 20, 85);
    doc.text(`Por medio de la presente se hace constar que el alumno(a):`, 20, 95);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(user.name.toUpperCase(), 105, 110, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Con número de control: ${user.numeroControl || "N/A"}`, 20, 125);
    doc.text(`Carrera: ${user.carrera || "INDUSTRIAL"}`, 20, 135);
    doc.text(`Semestre: ${user.semestre || "6to"}`, 20, 145);
    
    doc.text(`Se encuentra debidamente inscrito en esta institución para el presente periodo escolar.`, 20, 160);
    
    doc.text(`Atentamente,`, 105, 200, { align: "center" });
    doc.text(`___________________________`, 105, 220, { align: "center" });
    doc.text(`Dirección del CLE - ITSP`, 105, 230, { align: "center" });

    doc.save(`${tipo.replace(/\s+/g, '_')}_${user.name}.pdf`);
    showToast("Descarga completada");
  }, [user]);

  const handlePasswordChange = () => {
    showToast("🔒 Función de seguridad: Se ha enviado un enlace de cambio a tu correo.");
  };

  const handle2FA = (_?: boolean) => {
    const next = !twoFactor;
    setTwoFactor(next);
    showToast(next ? "✅ 2FA Activado" : "❌ 2FA Desactivado");
  };

  useEffect(() => {
    ensureSeed();
    const session = getSession();
    if (session) {
      setUser(session);
      setEditName(session.name);
      
      // Si es director, cargamos sus datos institucionales específicos desde el backend
      if (session.role === "director" && session.app_code) {
        import("@/lib/demo-store").then(({ getInstitutionData }) => {
          getInstitutionData(session.app_code!).then((data) => {
            if (data) {
              setEditPhone(data.telefono || "");
              setEditAddress(data.direccion || "");
              setEditInstitution(data.nombre_institucion || session.institutionName || "");
              setEditModalidad("Presencial");
              setEditEntryDate(session.fecha_ingreso || "2024-01-01");
            }
          });
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        setEditPhone(session.phone || ""); 
        setEditAddress(session.domicilio || ""); 
        setEditInstitution(session.institutionName || "ITSP · CLE");
        setEditModalidad(session.modalidad || "Presencial");
        setEditEntryDate(session.fecha_ingreso || today);
      }
    }
    const initialPrefs = loadPrefs();
    setPrefs(initialPrefs);
    if (initialPrefs.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const genQR = async () => {
      if (session) {
        const url = await generateQRDataURL({
          name: session.name,
          email: session.email,
          role: session.role,
          numeroControl: session.numeroControl,
          institution: session.institutionName || "ITSP",
          timestamp: Date.now(),
        });
        setQrDataUrl(url);
      }
    };
    genQR();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    showToast("Sincronizando con base de datos...");
    
    try {
      const { updateUserData, updateInstitutionData } = await import("@/lib/demo-store");
      
      // 1. Actualizar perfil personal (Usuarios)
      await updateUserData(user.id, { 
        name: editName,
        fecha_ingreso: editEntryDate,
        modalidad: editModalidad,
        phone: editPhone,
        domicilio: editAddress
      });

      // 2. Actualizar datos institucionales globales (Instituciones)
      if (user.role === "director" && user.app_code) {
        await updateInstitutionData(user.app_code, {
          nombre_institucion: editInstitution,
          direccion: editAddress,
          telefono: editPhone,
          director_name: editName
        });
      }

      setIsEditing(false);
      showToast("Cambios guardados con éxito ✅");
    } catch (err) {
      console.error(err);
      showToast("Error de conexión ❌");
    }
  };

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePrefs(next);
    
    // Aplicar Modo Oscuro al instante
    if (patch.darkMode !== undefined) {
      if (patch.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    
    showToast(`Preferencia: ${Object.keys(patch)[0]} actualizada`);
  };

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const doLogout = () => {
    logout();
    navigate({ to: "/login", search: { role: "student", demo: false } });
  };

  const doReset = () => {
    resetDemo();
    logout();
    showToast("Datos restablecidos");
    setTimeout(() => navigate({ to: "/welcome" }), 500);
  };

  const handleCopy = useCallback(() => {
    if (!user?.app_code) return;
    navigator.clipboard.writeText(user.app_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast("Código copiado al portapapeles 📋");
  }, [user]);

  const ensureBase64 = async (src: string) => {
    if (!src || src.startsWith("data:image")) return src;
    if (src.startsWith("http")) {
      try {
        // Intentar usar el puente de GAS para evitar CORS
        const fileId = src.split("id=")[1]?.split("&")[0] || src.split("/d/")[1]?.split("/")[0] || src.split("/d/")[1]?.split("&")[0];
        if (!fileId) return src;

        const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
        const resp = await fetch(scriptUrl, {
          method: "POST",
          body: JSON.stringify({ action: "getFileBase64", fileId })
        });
        const result = await resp.json();
        return result.success ? result.data : src;
      } catch (e) {
        return src;
      }
    }
    return src;
  };

  const handleDownloadPNG = useCallback(async () => {
    if (!qrDataUrl || !user) return;
    showToast("Generando credencial premium...");
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 1200;

    // --- Funciones de utilidad ---
    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(" ");
      let line = "";
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + " ";
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
    };

    // 1. Fondo base con esquinas redondeadas (Card)
    ctx.save();
    drawRoundedRect(0, 0, canvas.width, canvas.height, 60);
    ctx.clip();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Banner Superior (Gradiente Moderno)
    const grad = ctx.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, "#083344"); // cyan-950
    grad.addColorStop(1, "#0e7490"); // cyan-700
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, 300);

    // 3. Decoración de Fondo (Marca de agua sutil)
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 120px Inter";
    ctx.fillText("ITSP", 50, 250);
    ctx.globalAlpha = 1.0;

    // 4. Nombre de la Institución (Con ajuste de texto)
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.font = "bold 32px Inter, sans-serif";
    wrapText(user.institutionName || "INSTITUTO TECNOLÓGICO DE PÁNUCO", canvas.width / 2, 80, 600, 40);
    
    ctx.font = "500 20px Inter, sans-serif";
    ctx.globalAlpha = 0.8;
    ctx.fillText("CENTRO DE LENGUAS EXTRANJERAS", canvas.width / 2, 160);
    ctx.globalAlpha = 1.0;

    // 5. Círculo de Avatar (Personalizado con Puente Base64)
    const avatarX = canvas.width / 2;
    const avatarY = 320;
    const avatarR = 110;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarR + 10, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
    ctx.clip();
    
    const avatarSrc = await ensureBase64(user.avatar_url || user.avatar || "");
    if (avatarSrc && (avatarSrc.startsWith("data:image") || avatarSrc.startsWith("http"))) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = avatarSrc;
      
      // Añadir un timeout para que no se cuelgue
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Continuar aunque falle
        setTimeout(resolve, 3000); 
      });
      
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
      } else {
        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
      }
    } else {
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 80px Inter";
      ctx.fillText("👤", avatarX, avatarY + 30);
    }
    ctx.restore();

    // 6. Nombre del Usuario
    ctx.textAlign = "center";
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 52px Inter, sans-serif";
    ctx.fillText(user.name.toUpperCase(), canvas.width / 2, 520);
    
    ctx.fillStyle = "#0e7490";
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillText(user.role === "student" ? "ESTUDIANTE" : "PERSONAL", canvas.width / 2, 570);

    // 7. Divider
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 620);
    ctx.lineTo(700, 620);
    ctx.stroke();

    // 8. Ficha Técnica
    ctx.textAlign = "left";
    ctx.font = "bold 22px Inter, sans-serif";
    const infoY = 690;
    const spacing = 50;

    const drawInfo = (label: string, val: string, y: number) => {
      ctx.fillStyle = "#64748b";
      ctx.fillText(label, 120, y);
      ctx.fillStyle = "#1e293b";
      ctx.fillText(val, 320, y);
    };

    drawInfo("ID ACCESO:", user.app_code || "---", infoY);
    drawInfo("CONTROL:", user.numeroControl || "---", infoY + spacing);
    drawInfo("CARRERA:", user.carrera || "INDUSTRIAL", infoY + spacing * 2);
    drawInfo("SEMESTRE:", user.semestre || "---", infoY + spacing * 3);
    drawInfo("MODALIDAD:", user.modalidad || "PRESENCIAL", infoY + spacing * 4);

    // 9. QR Code (Estilizado)
    const qrSize = 220;
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise(r => qrImg.onload = r);
    
    // Borde suave al QR
    ctx.fillStyle = "#f8fafc";
    drawRoundedRect(canvas.width / 2 - (qrSize / 2 + 15), 940, qrSize + 30, qrSize + 30, 20);
    ctx.fill();
    ctx.drawImage(qrImg, canvas.width / 2 - qrSize / 2, 955, qrSize, qrSize);

    // 10. Footer
    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 18px monospace";
    ctx.fillText(`TECLINGO ID SYSTEM · ${new Date().getFullYear()}`, canvas.width / 2, 1170);

    // Finalizar Descarga
    const link = document.createElement("a");
    link.download = `Credencial_${user.app_code}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
    showToast("Credencial Premium generada ✨");
    ctx.restore();
  }, [qrDataUrl, user, ensureBase64]);

  const handleDownloadPDF = useCallback(async () => {
    if (!user || !qrDataUrl) return;
    showToast("Preparando PDF de alta calidad...");
    
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [100, 150]
    });

    // Colores
    const cPrimary = [8, 51, 68]; // cyan-950
    const cAccent = [14, 116, 144]; // cyan-700
    
    // 1. Cabecera Estilizada
    doc.setFillColor(cPrimary[0], cPrimary[1], cPrimary[2]);
    doc.rect(0, 0, 100, 40, "F");

    // 2. Textos Cabecera
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const instName = user.institutionName || "INSTITUTO TECNOLÓGICO DE PÁNUCO";
    const lines = doc.splitTextToSize(instName, 80);
    doc.text(lines, 50, 12, { align: "center" });

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("CENTRO DE LENGUAS EXTRANJERAS", 50, 28, { align: "center" });

    // 3. Avatar (Si existe - Usando puente seguro y recorte circular)
    const avatarSrc = await ensureBase64(user.avatar_url || user.avatar || "");
    if (avatarSrc && (avatarSrc.startsWith("data:image") || avatarSrc.startsWith("http"))) {
      try {
        // Crear un canvas temporal para recortar en círculo antes de pasar al PDF
        const tempCanvas = document.createElement("canvas");
        const tCtx = tempCanvas.getContext("2d");
        if (tCtx) {
          tempCanvas.width = 200;
          tempCanvas.height = 200;
          
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = avatarSrc;
          await new Promise((r) => { img.onload = r; img.onerror = r; });

          if (img.complete) {
            tCtx.beginPath();
            tCtx.arc(100, 100, 100, 0, Math.PI * 2);
            tCtx.clip();
            tCtx.drawImage(img, 0, 0, 200, 200);
            
            const circularBase64 = tempCanvas.toDataURL("image/png");
            doc.setFillColor(255, 255, 255);
            doc.circle(50, 42, 16, "F");
            doc.addImage(circularBase64, "PNG", 35, 27, 30, 30);
          }
        }
      } catch (e) {
        console.error("PDF Image error", e);
      }
    }

    // 4. Nombre y Rol
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text(user.name.toUpperCase(), 50, 65, { align: "center" });
    
    doc.setTextColor(cAccent[0], cAccent[1], cAccent[2]);
    doc.setFontSize(9);
    doc.text(user.role === "student" ? "ESTUDIANTE" : "PERSONAL", 50, 72, { align: "center" });

    // 5. Datos
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 78, 85, 78);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    let y = 88;
    const drawRow = (l: string, v: string) => {
      doc.setTextColor(100, 116, 139);
      doc.text(l, 20, y);
      doc.setTextColor(30, 41, 59);
      doc.text(v, 45, y);
      y += 6;
    };

    drawRow("ID ACCESO:", user.app_code || "---");
    drawRow("CONTROL:", user.numeroControl || "---");
    drawRow("CARRERA:", user.carrera || "---");
    drawRow("SEMESTRE:", user.semestre || "---");
    drawRow("MODALIDAD:", user.modalidad || "---");

    // 6. QR Code
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(32, 118, 36, 26, 3, 3, "F");
    doc.addImage(qrDataUrl, "PNG", 40, 120, 20, 20);
    
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(`VALIDACIÓN INSTITUCIONAL · ${new Date().getFullYear()}`, 50, 146, { align: "center" });

    doc.save(`Credencial_Premium_${user.app_code}.pdf`);
  }, [user, qrDataUrl]);

  const roleLabel =
    user?.role === "director"
      ? "Director"
      : user?.role === "teacher"
        ? "Docente"
        : user?.role === "student"
          ? "Alumno"
          : "Invitado";

  const studentData = {
    noControl: "21080432",
    carrera: "Ing. en Sistemas Computacionales",
    semeSemestre: "7°",
    grupo: "SC-701",
    modalidad: "Presencial",
    correoInstitucional: "21080432@panuco.tecnm.mx",
    telefono: "+52 876 543 210",
    domicilio: "Av. México #123, Pánuco, Ver.",
    fechaIngreso: "2024-08-15",
    estatus: "ACTIVO" as const,
    creditosAprobados: 98,
    creditosTotales: 164,
    promedio: 88.5,
    nivelMCER: "B2.1",
    horasLibreCert: 45,
  };

  return (
    <PhoneFrame>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="h-full flex flex-col transition-colors duration-500"
        style={{ background: "var(--background)" }}
      >
        {/* TopBar - Hidden on Desktop for Director since we have Sidebar */}
        <div className={user?.role === 'director' ? 'lg:hidden' : ''}>
          <TopBar />
        </div>

        {/* Desktop Title */}
        <div className="hidden lg:block px-10 pt-10 pb-6">
          <h1 className="text-4xl font-black text-foreground tracking-tighter">Mi Perfil Estudiantil</h1>
          <p className="text-foreground/55 font-medium mt-1">Gestiona tu información personal, académica y de seguridad.</p>
        </div>

        {/* Tabs - Centered on Desktop */}
        <div className="px-5 lg:px-10 mt-2 flex gap-1 bg-foreground/5 p-1 rounded-2xl mx-5 lg:mx-10">
          {(["perfil", "academico", "config"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${
                activeTab === t ? "bg-primary text-primary-foreground shadow-lg" : "text-foreground/40 hover:text-foreground/60"
              }`}
            >
              {t === "perfil" ? "Perfil" : t === "academico" ? "Académico" : "Ajustes"}
            </button>
          ))}
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />

        {activeTab === "perfil" && (
          <div className="flex-1 overflow-y-auto lg:px-10 lg:grid lg:grid-cols-12 lg:gap-8 pb-28 lg:pb-10 pt-6">
            {/* Sidebar Column: Photo & QR */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                  <div className="w-28 h-28 lg:w-40 lg:h-40 rounded-[2.5rem] bg-foreground/5 border-2 border-border overflow-hidden relative shadow-2xl transition-transform active:scale-95 group-hover:border-cyan-500/50">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-foreground/5">
                        <UserCircle2 className="w-16 h-16 text-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-black text-foreground tracking-tight leading-none">{user?.name}</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold mt-2">TecLingo ID · {user?.role?.toUpperCase()}</p>
                </div>
              </div>

              {qrDataUrl && (
                <div className="px-5 lg:px-0">
                  <div className="glass-strong rounded-3xl p-5 flex flex-col items-center border border-border shadow-xl">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 font-semibold mb-3">
                      Credencial Digital
                    </p>
                    <div className="bg-white p-3 rounded-2xl shadow-inner">
                      <img src={qrDataUrl} alt="QR Code" className="w-32 h-32" />
                    </div>
                    <p className="text-sm font-black text-foreground mt-4 tracking-tighter">{user?.app_code}</p>
                    <div className="grid grid-cols-3 gap-2 mt-4 w-full">
                      <button onClick={handleCopy} className="p-2.5 rounded-xl text-xs flex items-center justify-center gap-1 glass-strong border border-border text-foreground/70">
                        {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={handleDownloadPNG} className="p-2.5 rounded-xl text-xs flex items-center justify-center gap-1 glass-strong border border-border text-foreground/70">
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button onClick={handleDownloadPDF} className="p-2.5 rounded-xl text-xs flex items-center justify-center gap-1 glass-strong border border-border text-foreground/70">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Column: Sections */}
            <div className="lg:col-span-8 space-y-6 mt-6 lg:mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Section title="Información Personal">
                  <InfoRow 
                    icon={<UserCircle2 className="w-4 h-4" />} 
                    label="Nombre completo" 
                    value={isEditing ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)} className="bg-transparent outline-none w-full border-b border-border text-foreground" />
                    ) : user?.name ?? "Sin registro"} 
                  />
                  <InfoRow icon={<Mail className="w-4 h-4" />} label="Correo" value={user?.email ?? "Sin registro"} />
                  <InfoRow 
                    icon={<Phone className="w-4 h-4" />} 
                    label="Teléfono" 
                    value={isEditing ? (
                      <input value={editPhone} onChange={e => setEditPhone(e.target.value)} className="bg-transparent outline-none w-full border-b border-border text-foreground" />
                    ) : editPhone || "+52 876 543 210"} 
                  />
                  <InfoRow 
                    icon={<MapPin className="w-4 h-4" />} 
                    label="Domicilio" 
                    value={isEditing ? (
                      <input value={editAddress} onChange={e => setEditAddress(e.target.value)} className="bg-transparent outline-none w-full border-b border-border text-foreground" />
                    ) : editAddress || "Av. México #123, Pánuco, Ver."} 
                  />
                </Section>

                <Section title="Institución">
                  <InfoRow 
                    icon={<Building className="w-4 h-4" />} 
                    label="Escuela" 
                    value={isEditing && user?.role === "director" ? (
                      <input value={editInstitution} onChange={e => setEditInstitution(e.target.value)} className="bg-transparent outline-none w-full border-b border-border text-foreground" />
                    ) : editInstitution} 
                  />
                  <InfoRow 
                    icon={<Award className="w-4 h-4" />} 
                    label={user?.role === "director" ? "Departamento" : "Carrera"} 
                    value={user?.role === "director" ? "CLE · Centro de Lenguas Extranjeras" : (user?.carrera || "No asignada")} 
                  />
                  {user?.role === "student" && (
                    <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="Semestre" value={user?.semestre || "No asignado"} />
                  )}
                  <InfoRow 
                    icon={<Calendar className="w-4 h-4" />} 
                    label="Fecha de ingreso" 
                    value={isEditing ? (
                      <input type="date" value={editEntryDate} onChange={e => setEditEntryDate(e.target.value)} className="bg-transparent outline-none w-full border-b border-border text-foreground" />
                    ) : (editEntryDate ? new Date(editEntryDate).toLocaleDateString() : "No asignada")} 
                  />
                </Section>
              </div>

              {/* Botones de acción */}
              <div className="px-5 lg:px-0 flex gap-4 mt-6">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex-1 rounded-2xl py-3.5 bg-primary text-primary-foreground font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                    <Edit3 className="w-4 h-4" /> Editar Perfil
                  </button>
                ) : (
                  <button onClick={handleSave} className="flex-1 rounded-2xl py-3.5 bg-emerald-500 text-white font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                    <Save className="w-4 h-4" /> Guardar Cambios
                  </button>
                )}
                {isEditing && (
                  <button onClick={() => setIsEditing(false)} className="px-6 rounded-2xl bg-foreground/5 text-foreground font-bold flex items-center justify-center border border-border">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Académico Tab */}
        {activeTab === "academico" && (
          <div className="flex-1 overflow-y-auto lg:px-10 lg:grid lg:grid-cols-2 lg:gap-8 pb-28 pt-6">
            <Section title="Estatus Institucional">
              <div className="glass-strong rounded-3xl p-5 mb-4 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/45 font-semibold">Nivel MCER</p>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">{studentData.nivelMCER}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/45 font-semibold">Promedio</p>
                    <p className="text-2xl font-black text-foreground tracking-tight">{studentData.promedio}</p>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-foreground/5">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(studentData.creditosAprobados / studentData.creditosTotales) * 100}%` }} />
                </div>
                <p className="text-[10px] text-foreground/40 mt-2 text-center font-medium">
                  {studentData.creditosAprobados}/{studentData.creditosTotales} créditos aprobados
                </p>
              </div>
              <InfoRow icon={<Users className="w-4 h-4" />} label="Grupo" value={studentData.grupo} />
              <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="Semestre actual" value={studentData.semeSemestre} />
            </Section>
            
            <Section title="Documentación y Certificación">
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => handleConstancia("Constancia de Estudios")} className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-foreground/5 transition-colors border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                    <div className="text-left"><p className="text-sm font-bold text-foreground">Constancia de Estudios</p><p className="text-[10px] text-foreground/40">Generar PDF oficial firmado</p></div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/20" />
                </button>
                <button onClick={() => handleConstancia("Historial Académico")} className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-foreground/5 transition-colors border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                    <div className="text-left"><p className="text-sm font-bold text-foreground">Historial Académico</p><p className="text-[10px] text-foreground/40">Kárdex de calificaciones</p></div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/20" />
                </button>
                <div className="mt-4 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <p className="text-[10px] uppercase tracking-widest font-black">Liberación del CLE</p>
                  </div>
                  <p className="text-xs text-foreground/70 leading-relaxed">Faltan <span className="font-bold text-foreground">{studentData.horasLibreCert} horas</span> para completar el requisito institucional.</p>
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === "config" && (
          <div className="flex-1 overflow-y-auto lg:px-10 lg:grid lg:grid-cols-2 lg:gap-8 pb-28 pt-6">
            <Section title="Personalización del Interfaz">
              <ToggleRow icon={<Moon className="w-4 h-4" />} label="Modo Oscuro" desc="Tema visual de alta fidelidad" value={prefs.darkMode} onChange={v => update({ darkMode: v })} />
              <ToggleRow icon={<Bell className="w-4 h-4" />} label="Notificaciones Push" desc="Avisos académicos en tiempo real" value={prefs.notifications} onChange={v => update({ notifications: v })} />
              <ToggleRow icon={<Globe className="w-4 h-4" />} label="Efectos de Sonido" desc="Feedback auditivo de acciones" value={prefs.soundEffects} onChange={v => update({ soundEffects: v })} />
              <SelectRow icon={<Languages className="w-4 h-4" />} label="Idioma del Sistema" value={prefs.language} options={[{ v: "es", label: "Español" }, { v: "en", label: "English" }]} onChange={v => update({ language: v as Prefs["language"] })} />
            </Section>
            
            <div className="space-y-6">
              <Section title="Seguridad de la Cuenta">
                <button onClick={handlePasswordChange} className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-foreground/5 transition-colors border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center"><Lock className="w-5 h-5" /></div>
                    <div className="text-left"><p className="text-sm font-bold text-foreground">Cambiar Contraseña</p><p className="text-[10px] text-foreground/40">Actualizar credenciales de acceso</p></div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/20" />
                </button>
                <div className="mt-2">
                  <ToggleRow icon={<ShieldCheck className="w-4 h-4" />} label="Verificación en 2 pasos" desc="Protección adicional mediante OAuth" value={twoFactor} onChange={handle2FA} />
                </div>
              </Section>

              <Section title="Soporte y Legal">
                <div className="grid grid-cols-1 gap-2">
                  <LinkRow icon={<HelpCircle className="w-4 h-4" />} label="Centro de Ayuda" to="/" />
                  <LinkRow icon={<Info className="w-4 h-4" />} label="Acerca de TecLingo v2.0" to="/welcome" />
                  <LinkRow icon={<AlertCircle className="w-4 h-4" />} label="Aviso de Privacidad" to="/" />
                </div>
              </Section>

              <div className="px-5 lg:px-0">
                <button onClick={() => setConfirmLogout(true)} className="w-full rounded-2xl py-4 bg-red-500/10 text-red-500 font-black flex items-center justify-center gap-2 border border-red-500/10 active:scale-95 transition-transform shadow-sm">
                  <LogOut className="w-5 h-5" /> Cerrar Sesión Institucional
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 glass-strong px-6 py-3 rounded-2xl text-xs font-bold text-foreground shadow-2xl z-50 border border-border animate-bounce">
            {toast}
          </motion.div>
        )}

        {confirmLogout && (
          <ConfirmDialog
            title="¿Finalizar sesión?"
            desc="Se cerrará el acceso seguro a tu expediente institucional."
            confirmLabel="Cerrar sesión"
            danger
            onCancel={() => setConfirmLogout(false)}
            onConfirm={doLogout}
          />
        )}
      </motion.div>
    </PhoneFrame>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 mt-5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/45 font-semibold mb-2 px-1">
        {title}
      </p>
      <div className="glass rounded-2xl p-1.5 space-y-1">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl">
      <span className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/80" style={{ background: "var(--foreground-5)", border: "1px solid var(--border)" }}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-foreground/50 truncate">{label}</p>
        <div className="text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  desc,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl">
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/80"
        style={{ background: "var(--foreground-5)", border: "1px solid var(--border)" }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {desc && <p className="text-[11px] text-foreground/50 truncate">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-colors shrink-0"
        style={
          value ? { background: "var(--gradient-cyan)" } : { background: "var(--foreground-10)" }
        }
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform"
          style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

function SelectRow({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: { v: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl">
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/80"
        style={{ background: "var(--foreground-5)", border: "1px solid var(--border)" }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        {options.map((o) => {
          const active = o.v === value;
          return (
            <button
              key={o.v}
              type="button"
              onClick={() => onChange(o.v)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-all active:scale-95"
              style={
                active
                  ? { background: "var(--gradient-cyan)", color: "var(--navy-deep)" }
                  : {
                    background: "var(--foreground-5)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LinkRow({
  icon,
  label,
  to,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  to?: string;
  badge?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span
        className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/80"
        style={{ background: "var(--foreground-5)", border: "1px solid var(--border)" }}
      >
        {icon}
      </span>
      <span className="flex-1 text-sm font-semibold text-foreground">{label}</span>
      {badge && (
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "var(--foreground-10)", color: "var(--foreground)" }}
        >
          {badge}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-foreground/40" />
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl active:scale-[0.99] transition-transform text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={to || "/"}
      className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl active:scale-[0.99] transition-transform"
    >
      {content}
    </Link>
  );
}

function ConfirmDialog({
  title,
  desc,
  confirmLabel,
  danger,
  onCancel,
  onConfirm,
}: {
  title: string;
  desc: string;
  confirmLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-end justify-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 240 }}
        className="relative w-full max-w-[400px] m-4 glass-strong rounded-3xl p-5"
      >
        <h3 className="text-base font-extrabold text-foreground">{title}</h3>
        <p className="text-xs text-foreground/65 mt-1.5">{desc}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onCancel}
            className="rounded-2xl py-3 text-sm font-bold glass text-foreground active:scale-[0.98] transition-transform"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-2xl py-3 text-sm font-bold active:scale-[0.98] transition-transform"
            style={
              danger
                ? {
                  background: "linear-gradient(135deg, oklch(0.62 0.22 25), oklch(0.55 0.22 18))",
                  color: "white",
                }
                : { background: "var(--gradient-cyan)", color: "var(--navy-deep)" }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}