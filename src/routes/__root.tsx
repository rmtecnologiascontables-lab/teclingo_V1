import { useEffect } from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      { title: "TecLingo" },
      {
        name: "description",
        content:
          "TecLingo - Programa académico de inglés del Tec de Pánuco. Niveles MCER A1-C2 y preparación TOEFL.",
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      {
        property: "og:description",
        content:
          "Tec English Accelerator is a web and mobile application for learning English, focusing on B2+ levels and TOEFL preparation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      {
        name: "twitter:description",
        content:
          "Tec English Accelerator is a web and mobile application for learning English, focusing on B2+ levels and TOEFL preparation.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5d71072f-55dc-4c0b-bf91-79aa6ce0b0a3/id-preview-0f0d18c2--11c55d0f-2ee0-49dc-a760-055bc363e553.lovable.app-1776834929315.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5d71072f-55dc-4c0b-bf91-79aa6ce0b0a3/id-preview-0f0d18c2--11c55d0f-2ee0-49dc-a760-055bc363e553.lovable.app-1776834929315.png",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/teclingo-logo.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // CONFIGURACIÓN MAESTRA: Este ID es el único válido para tu consola de Google
  const MASTER_CLIENT_ID =
    "723379547370-7c5kca1q2oi8lr8kgdddscniskjdbrt6.apps.googleusercontent.com";

  // Leemos del entorno, pero si es el ID erróneo (948555...) o está vacío, el Maestro toma el control
  const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const clientId = envId && !envId.startsWith("948555") ? envId : MASTER_CLIENT_ID;

  // Inicializar Tema Global (Basado en localStorage)
  useEffect(() => {
    try {
      const prefs = localStorage.getItem("demo.prefs");
      if (prefs) {
        const { darkMode } = JSON.parse(prefs);
        if (darkMode === true) {
          document.documentElement.classList.add("dark");
        } else if (darkMode === false) {
          document.documentElement.classList.remove("dark");
        }
      } else {
        // Por defecto oscuro si no hay preferencias
        document.documentElement.classList.add("dark");
      }
    } catch (e) {
      console.error("Theme init error", e);
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Outlet />
    </GoogleOAuthProvider>
  );
}
