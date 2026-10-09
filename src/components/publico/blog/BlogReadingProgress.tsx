"use client";

import { useEffect, useState } from "react";

/**
 * Barra fina de progreso de lectura, fija arriba del viewport. Se llena
 * conforme el usuario baja por el artículo. Es un gancho de "engagement":
 * ver la barra avanzar invita a terminar de leer.
 *
 * Mide el avance sobre el elemento con id `articulo-blog` (el <article>).
 */
export default function BlogReadingProgress() {
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const articulo = document.getElementById("articulo-blog");
    if (!articulo) return;

    let frame = 0;
    const calcular = () => {
      frame = 0;
      const rect = articulo.getBoundingClientRect();
      const alturaViewport = window.innerHeight;
      // Total de scroll disponible dentro del artículo.
      const total = rect.height - alturaViewport;
      if (total <= 0) {
        setProgreso(rect.top <= 0 ? 100 : 0);
        return;
      }
      const recorrido = Math.min(Math.max(-rect.top, 0), total);
      setProgreso((recorrido / total) * 100);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(calcular);
    };

    calcular();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(139,92,246,0.6)]"
        style={{ width: `${progreso}%` }}
      />
    </div>
  );
}
