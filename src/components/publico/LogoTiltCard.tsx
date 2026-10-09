"use client";

/**
 * Insignia-miniatura inclinada con el isotipo R de RDC.
 *
 * Por default está rotada ~-6° (diagonal natural). Al pasar el cursor:
 *  - Se endereza (acerca la rotación base a 0).
 *  - Hace tilt 3D fino siguiendo la posición del mouse.
 *  - El halo violeta detrás del logo se intensifica.
 *  - Pequeño spotlight sigue al cursor.
 *
 * En reposo el card flota suavemente. Respeta prefers-reduced-motion.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const BASE_ROTATE_DEG = -6;

export default function LogoTiltCard() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    // Rango fino: ±12° en cada eje
    const ry = (px - 0.5) * 24;
    const rx = -(py - 0.5) * 24;
    setTilt({ x: rx, y: ry });
    setSpot({ x: px * 100, y: py * 100 });
  };

  const handleEnter = () => setHovering(true);
  const handleLeave = () => {
    setHovering(false);
    setTilt({ x: 0, y: 0 });
    setSpot({ x: 50, y: 50 });
  };

  // En hover se endereza casi por completo (-1°), en reposo mantiene su tilt.
  const baseRotate = hovering ? -1 : BASE_ROTATE_DEG;
  const transform = reducedMotion
    ? `rotate(${BASE_ROTATE_DEG}deg)`
    : `perspective(800px) rotateZ(${baseRotate}deg) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${
        hovering ? 1.05 : 1
      })`;

  return (
    <div className="flex justify-center sm:justify-start">
      <div className="relative w-[160px] h-[160px] sm:w-[180px] sm:h-[180px]">
        {/* Halo exterior */}
        <div
          className="absolute inset-0 rounded-3xl blur-2xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(167,139,250,0.5) 0%, transparent 65%)",
            opacity: hovering ? 0.95 : 0.55,
            transition: "opacity 250ms ease",
          }}
          aria-hidden
        />

        <div
          ref={cardRef}
          onMouseMove={handleMove}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className={`relative w-full h-full rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-xl shadow-violet-900/40 cursor-pointer select-none ${
            !reducedMotion && !hovering
              ? "animate-[logoFloat_5s_ease-in-out_infinite]"
              : ""
          }`}
          style={{
            transform,
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            transition: hovering
              ? "transform 80ms ease-out"
              : "transform 500ms cubic-bezier(.2,.8,.2,1)",
            background:
              "radial-gradient(circle at 30% 20%, #4c1d95 0%, #1e1b4b 45%, #0b0a1f 100%)",
          }}
          aria-label="Isotipo R de RDC Contadores con efecto interactivo"
        >
          {/* Spotlight que sigue al cursor */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: hovering ? 1 : 0.4,
              background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(167, 139, 250, 0.45) 0%, transparent 55%)`,
              transition: "opacity 250ms ease",
            }}
            aria-hidden
          />

          {/* Trama de cuadrícula muy sutil */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden
          />

          {/* Anillos pulsantes detrás del logo */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden
          >
            {[0, 1].map((i) => (
              <span
                key={i}
                className="absolute rounded-full border border-violet-300/30"
                style={{
                  width: `${55 + i * 22}%`,
                  aspectRatio: "1 / 1",
                  animation: reducedMotion
                    ? undefined
                    : `logoRing 3.5s ${i * 0.7}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>

          {/* Glow + R */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: reducedMotion ? undefined : "translateZ(45px)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute w-32 h-32 rounded-full blur-2xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(167,139,250,0.9) 0%, rgba(124,58,237,0) 70%)",
                opacity: hovering ? 0.95 : 0.55,
                transition: "opacity 250ms ease",
              }}
              aria-hidden
            />
            <div className="relative w-[88px] h-[88px] sm:w-[100px] sm:h-[100px]">
              <Image
                src="/logos/r-white.png"
                alt="Isotipo R de RDC Contadores"
                fill
                sizes="100px"
                className="object-contain drop-shadow-[0_6px_16px_rgba(124,58,237,0.6)]"
                priority
              />
            </div>
          </div>

          {/* Indicador En vivo discreto */}
          <span
            className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/20 text-[8px] font-black uppercase tracking-widest text-white"
            aria-hidden
          >
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            En vivo
          </span>
        </div>
      </div>
    </div>
  );
}
