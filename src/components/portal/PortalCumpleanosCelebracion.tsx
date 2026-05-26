"use client";

import { useEffect, useMemo, useState } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import {
  fechaNacimientoDeRFC,
  formatearFechaNacimientoCorta,
} from "@/lib/clientes";

/**
 * Si hoy es el cumpleaños del cliente que inició sesión, dispara confeti y
 * un modal de felicitación. Se muestra una sola vez por día/dispositivo
 * (persistido en localStorage). Pensado para vivir dentro de PortalShell.
 */
export default function PortalCumpleanosCelebracion() {
  const { cliente } = usePortalAuth();
  const [abierto, setAbierto] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const hoy = useMemo(() => new Date(), []);
  const fechaNac = useMemo(
    () =>
      cliente
        ? fechaNacimientoDeRFC(cliente.rfc, cliente.esPersonaMoral)
        : null,
    [cliente]
  );
  const esCumpleHoy =
    !!fechaNac &&
    fechaNac.mes === hoy.getMonth() &&
    fechaNac.dia === hoy.getDate();

  // Decide si mostrar (una vez por día / cliente / dispositivo)
  useEffect(() => {
    if (!cliente || !esCumpleHoy) return;
    if (typeof window === "undefined") return;
    const key = `rdc-cumple-shown-${cliente.id}-${hoy.toISOString().slice(0, 10)}`;
    if (localStorage.getItem(key)) return;
    setConfetti(generarConfetti(80));
    setAbierto(true);
    localStorage.setItem(key, "1");
  }, [cliente, esCumpleHoy, hoy]);

  // Al cerrar dejamos que el confeti termine antes de desmontar
  useEffect(() => {
    if (abierto || confetti.length === 0) return;
    const id = setTimeout(() => setConfetti([]), 4500);
    return () => clearTimeout(id);
  }, [abierto, confetti.length]);

  if (!cliente || !esCumpleHoy) return null;

  const nombre =
    cliente.razonSocial?.split(/\s+/)[0] || cliente.razonSocial || "ti";

  return (
    <>
      {confetti.length > 0 && <ConfettiOverlay piezas={confetti} />}

      {abierto && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setAbierto(false)}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_30px_100px_rgba(15,23,42,0.25)] overflow-hidden animate-cumple-pop">
            <div
              className="relative px-8 pt-12 pb-10 text-center overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg,#7c3aed 0%,#ec4899 60%,#f59e0b 100%)",
              }}
            >
              <p className="text-6xl leading-none mb-3 drop-shadow-sm">🎂</p>
              <h2 className="text-3xl font-black text-white leading-tight">
                ¡Feliz cumpleaños!
              </h2>
              <p className="text-base font-bold text-white/95 mt-2">
                {nombre}
              </p>
              {fechaNac && (
                <p className="mt-3 inline-block text-[10px] font-black tracking-widest uppercase text-white/90 bg-white/15 rounded-full px-3 py-1 backdrop-blur">
                  {formatearFechaNacimientoCorta(fechaNac)}
                </p>
              )}
            </div>
            <div className="px-8 py-6 text-center">
              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                Hoy es tu día y queremos celebrarlo contigo. Te deseamos
                muchísimo éxito, salud y bendiciones.
              </p>
              <p className="mt-3 text-xs font-bold text-slate-400 leading-relaxed">
                Gracias por confiar en nosotros un año más.
              </p>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-black uppercase tracking-widest"
              >
                ¡Gracias! 🎉
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes rdc-confetti-fall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--rdc-dx, 0px), 110vh, 0)
              rotate(var(--rdc-rot, 360deg));
            opacity: 0.85;
          }
        }
        @keyframes rdc-cumple-pop {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(20px);
          }
          60% {
            opacity: 1;
            transform: scale(1.02) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-cumple-pop {
          animation: rdc-cumple-pop 280ms cubic-bezier(0.2, 0.9, 0.2, 1.1)
            both;
        }
      `}</style>
    </>
  );
}

type ConfettiPiece = {
  id: number;
  left: number;
  width: number;
  height: number;
  color: string;
  delay: number;
  duration: number;
  rot: number;
  dx: number;
  shape: "rect" | "circle";
};

const PALETA = [
  "#7c3aed", // violeta
  "#ec4899", // rosa
  "#f59e0b", // ámbar
  "#22d3ee", // cyan
  "#10b981", // esmeralda
  "#3b82f6", // azul
];

function generarConfetti(n: number): ConfettiPiece[] {
  const items: ConfettiPiece[] = [];
  for (let i = 0; i < n; i++) {
    const w = 6 + Math.random() * 8;
    const h = 8 + Math.random() * 12;
    const left = Math.random() * 100;
    items.push({
      id: i,
      left,
      width: w,
      height: Math.random() > 0.4 ? h : w,
      color: PALETA[i % PALETA.length],
      delay: Math.random() * 0.6,
      duration: 2.6 + Math.random() * 1.8,
      rot: 240 + Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
      dx: (Math.random() - 0.5) * 240,
      shape: Math.random() > 0.6 ? "circle" : "rect",
    });
  }
  return items;
}

function ConfettiOverlay({ piezas }: { piezas: ConfettiPiece[] }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[115] overflow-hidden"
    >
      {piezas.map((p) => (
        <span
          key={p.id}
          style={
            {
              position: "absolute",
              top: 0,
              left: `${p.left}%`,
              width: `${p.width}px`,
              height: `${p.height}px`,
              background: p.color,
              borderRadius: p.shape === "circle" ? "999px" : "2px",
              animation: `rdc-confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
              "--rdc-dx": `${p.dx}px`,
              "--rdc-rot": `${p.rot}deg`,
              willChange: "transform, opacity",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
