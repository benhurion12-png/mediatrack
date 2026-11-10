import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/components/app-provider";
import { PwaManager } from "@/components/pwa-manager";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MediaTrack — контроль лекарственных назначений",
    template: "%s · MediaTrack",
  },
  description: "Единая платформа контроля приёма лекарств для пациента, врача и близких.",
  manifest: "/manifest.webmanifest",
  applicationName: "MediaTrack",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediaTrack",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/mediatrack-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/mediatrack-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/mediatrack-apple-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#4f7dff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body><AppProvider>{children}<PwaManager /></AppProvider></body>
    </html>
  );
}
