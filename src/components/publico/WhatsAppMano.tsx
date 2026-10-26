"use client";

import { useEffect, useState, type MouseEvent, type PointerEvent } from "react";
import { usePathname } from "next/navigation";
import { waUrlDeRuta } from "@/lib/contacto-publico";
import "./whatsapp-mano.css";

/** Ruta donde el visitante ocultó el botón. Al cambiar de página, reaparece. */
const STORAGE_KEY = "rdc-wa-mano-oculto-en";

export default function WhatsAppMano() {
  const pathname = usePathname() || "/";
  const [href, setHref] = useState(() => waUrlDeRuta(pathname));
  const [listo, setListo] = useState(false);
  const [ocultoEn, setOcultoEn] = useState<string | null>(null);

  useEffect(() => {
    setHref(waUrlDeRuta(pathname));
  }, [pathname]);

  useEffect(() => {
    try {
      setOcultoEn(sessionStorage.getItem(STORAGE_KEY));
    } catch {
      setOcultoEn(null);
    }
    setListo(true);
  }, []);

  /** Si ocultó en otra ruta (o nunca), se muestra de nuevo. */
  const cerrado = listo && ocultoEn === pathname;

  function cerrar(e: MouseEvent | PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOcultoEn(pathname);
    try {
      sessionStorage.setItem(STORAGE_KEY, pathname);
    } catch {
      /* private mode */
    }
  }

  if (!listo || cerrado) return null;

  return (
    <div className="wa-mano" role="group" aria-label="Contacto por WhatsApp">
      <button
        type="button"
        className="wa-mano-cerrar"
        aria-label="Ocultar WhatsApp en esta página"
        onClick={cerrar}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path
            d="M2 2l6 6M8 2 2 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp"
        className="wa-mano-btn"
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
          <path d="M16.001 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.26.6 4.46 1.74 6.4L3.2 28.8l6.56-1.72A12.78 12.78 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8S23.07 3.2 16 3.2zm7.44 18.05c-.31.88-1.83 1.61-2.56 1.71-.65.09-1.48.16-2.39-.15-.55-.18-1.26-.41-2.17-.8-3.82-1.65-6.31-5.5-6.5-5.76-.19-.25-1.55-2.06-1.55-3.93s.98-2.79 1.33-3.17c.34-.37.75-.47 1-.47h.72c.23 0 .54-.09.84.64.31.75 1.05 2.58 1.14 2.77.09.19.16.41.03.66-.12.25-.19.41-.37.63-.19.22-.39.49-.56.66-.19.19-.38.39-.16.76.22.37 1 1.65 2.14 2.67 1.48 1.32 2.72 1.73 3.1 1.92.38.19.6.16.82-.09.22-.25.94-1.1 1.19-1.47.25-.37.5-.31.84-.19.34.12 2.17 1.02 2.54 1.21.37.19.62.28.71.44.09.16.09.94-.22 1.82z" />
        </svg>
      </a>
    </div>
  );
}
