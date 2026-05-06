import QRCode from "qrcode";

export interface QRData {
  name: string;
  email: string;
  role: string;
  numeroControl?: string;
  institution: string;
  timestamp: number;
}

export async function generateQRDataURL(data: QRData): Promise<string> {
  const qrString = JSON.stringify({
    ...data,
    v: "1.0", // Versión del formato
    origin: "TecLingo-ITSP",
  });
  return QRCode.toDataURL(qrString, {
    width: 320,
    margin: 1,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H", // Alta recuperación de errores
  });
}

export async function generateQRBase64(data: QRData): Promise<string> {
  const qrString = JSON.stringify(data);
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, qrString, {
    width: 280,
    margin: 2,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
  return canvas.toDataURL("image/png").split(",")[1];
}
