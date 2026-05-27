"use client";

/**
 * Tarjeta-mockup con la R isotipo de RDC como protagonista.
 *
 * Efectos:
 *  - Tilt 3D: el card rota en X/Y según la posición del cursor.
 *  - Spotlight: un radial gradient violeta sigue al mouse.
 *  - Glow del logo: la R se acompaña de un halo violeta que se intensifica
 *    al pasar el cursor.
 *  - Anillos pulsantes detrás (ambient).
 *  - Micro-float en reposo cuando el mouse no está sobre el card.
 *
 * Respeta prefers-reduced-motion (sin tilt ni float, solo estado base).
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
    // Rango: -10..10 grados
    const ry = (px - 0.5) * 20;
    const rx = -(py - 0.5) * 20;
    setTilt({ x: rx, y: ry });
    setSpot({ x: px * 100, y: py * 100 });
  };

  const handleEnter = () => setHovering(true);
  const handleLeave = () => {
    setHovering(false);
    setTilt({ x: 0, y: 0 });
    setSpot({ x: 50, y: 50 });
  };

  const transform = reducedMotion
    ? undefined
    : `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${
        hovering ? 1.02 : 1
      })`;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`relative aspect-[16/10] rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-violet-900/40 cursor-pointer select-none ${
        !reducedMotion && !hovering ? "animate-[logoFloat_5s_ease-in-out_infinite]" : ""
      }`}
      style={{
        transform,
        transformStyle: "preserve-3d",
        transition: hovering
          ? "transform 80ms ease-out"
          : "transform 600ms cubic-bezier(.2,.8,.2,1)",
        background:
          "radial-gradient(circle at 30% 20%, #4c1d95 0%, #1e1b4b 45%, #0b0a1f 100%)",
      }}
      aria-label="Logo isotipo de RDC Contadores con efecto interactivo"
    >
      {/* Spotlight que sigue al mouse */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: hovering ? 1 : 0.35,
          background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(167, 139, 250, 0.45) 0%, transparent 55%)`,
        }}
        aria-hidden
      />

      {/* Grid sutil */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      {/* Anillos pulsantes detrás del logo */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border border-violet-300/30"
            style={{
              width: `${50 + i * 20}%`,
              aspectRatio: "1 / 1",
              animation: reducedMotion
                ? undefined
                : `logoRing 3.5s ${i * 0.7}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Capa central — R isotipo */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transform: reducedMotion ? undefined : "translateZ(60px)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Glow detrás del logo */}
        <div
          className="absolute w-56 h-56 rounded-full blur-3xl pointer-events-none transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle, rgba(167,139,250,0.9) 0%, rgba(124,58,237,0) 70%)",
            opacity: hovering ? 0.9 : 0.55,
          }}
          aria-hidden
        />

        <div className="relative w-32 h-32 sm:w-36 sm:h-36">
          <Image
            src="/logos/r-white.png"
            alt="Isotipo R de RDC Contadores"
            fill
            sizes="144px"
            className="object-contain drop-shadow-[0_8px_24px_rgba(124,58,237,0.6)]"
            priority
          />
        </div>
      </div>

      {/* Esquina inferior: badge de marca */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-violet-300/80">
            RDC · Contadores
          </p>
          <p className="text-sm font-black text-white mt-1">
            Despacho con tecnología propia
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/20 text-[9px] font-black uppercase tracking-widest text-white">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          En vivo
        </span>
      </div>

      {/* Esquina superior derecha — chip de release */}
      <div className="absolute top-4 right-4 pointer-events-none">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm text-[9px] font-bold text-violet-100 ring-1 ring-white/15">
          v2026
        </span>
      </div>
    </div>
  );
}
