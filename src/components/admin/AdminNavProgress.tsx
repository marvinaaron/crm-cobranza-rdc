"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSidebarColapso } from "@/components/admin/SidebarColapsoContext";

/**
 * Barra fina arriba del chrome al cambiar de ruta admin.
 * Feedback inmediato mientras llega el RSC / chunk de la página.
 */
export default function AdminNavProgress() {
  const pathname = usePathname();
  const { colapsado } = useSidebarColapso();
  const [activo, setActivo] = useState(false);
  const [ancho, setAncho] = useState(0);
  const prev = useRef(pathname);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (prev.current === pathname) return;
    prev.current = pathname;

    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];

    setActivo(true);
    setAncho(12);
    timers.current.push(
      window.setTimeout(() => setAncho(55), 40),
      window.setTimeout(() => setAncho(78), 180),
      window.setTimeout(() => setAncho(100), 420),
      window.setTimeout(() => {
        setActivo(false);
        setAncho(0);
      }, 580)
    );

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [pathname]);

  if (!activo) return null;

  return (
    <div
      className={`pointer-events-none fixed top-0 right-0 z-[80] h-[2px] left-0 ${
        colapsado ? "lg:left-[4.5rem]" : "lg:left-64"
      }`}
      aria-hidden
    >
      <div
        className="h-full origin-left bg-violet-500 dark:bg-violet-400 transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ width: `${ancho}%` }}
      />
    </div>
  );
}
