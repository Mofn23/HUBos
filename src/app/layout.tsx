import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HUBos — Super-App & Ecosistema Modular",
  description: "Contenedor modular unificado para iOS con RecompAI y Subscription Manager",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HUBos",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#131313",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased select-none bg-[#131313] text-[#F5F5F7]">
        <div className="app-frame">
          {children}
        </div>
      </body>
    </html>
  );
}
