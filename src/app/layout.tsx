import { headers } from "next/headers";
import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { esRutaAdmin } from "@/lib/auth/rutas";
import {
  buildPwaMetadata,
  buildPwaViewport,
  themeInitScriptForPath,
} from "@/lib/pwa-metadata";
import RootLayoutClient from "@/components/RootLayoutClient";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const pathname = (await headers()).get("x-pathname") ?? "";
  return buildPwaMetadata(pathname);
}

export async function generateViewport(): Promise<Viewport> {
  const pathname = (await headers()).get("x-pathname") ?? "";
  return buildPwaViewport(pathname);
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const usaAdminShell = esRutaAdmin(pathname);
  const themeScript = themeInitScriptForPath(pathname);

  return (
    <html lang="es-MX" className={fontVariables}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={
          usaAdminShell
            ? "rdc-admin min-h-dvh bg-slate-50 font-sans antialiased dark:bg-[#1c1c1e]"
            : "min-h-dvh bg-slate-50 font-sans antialiased dark:bg-[#1c1c1e]"
        }
      >
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
