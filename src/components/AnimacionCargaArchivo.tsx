"use client";

import { useEffect, useState } from "react";

export type FaseCargaArchivo = "idle" | "cargando" | "listo";

/** Mientras `cargando` es true muestra progreso; al terminar, palomita 1 s. */
export function useFaseCargaArchivo(cargando: boolean): {
  fase: FaseCargaArchivo;
  progreso: number;
  ocupado: boolean;
} {
  const [fase, setFase] = useState<FaseCargaArchivo>("idle");
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    if (cargando) {
      setFase("cargando");
      setProgreso(10);
      const id = window.setInterval(() => {
        setProgreso((p) => (p >= 88 ? 88 : Math.min(88, p + 5 + Math.random() * 7)));
      }, 150);
      return () => window.clearInterval(id);
    }

    setFase((prev) => {
      if (prev !== "cargando") return prev;
      return "listo";
    });
    setProgreso((p) => (p > 0 ? 100 : p));
  }, [cargando]);

  useEffect(() => {
    if (fase !== "listo") return;
    const t = window.setTimeout(() => {
      setFase("idle");
      setProgreso(0);
    }, 1000);
    return () => window.clearTimeout(t);
  }, [fase]);

  return {
    fase,
    progreso,
    ocupado: fase === "cargando" || fase === "listo",
  };
}

type Props = {
  progreso: number;
  listo: boolean;
  size?: number;
};

export default function AnimacionCargaArchivo({
  progreso,
  listo,
  size = 56,
}: Props) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const pct = listo ? 1 : Math.min(1, Math.max(0, progreso) / 100);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="status"
      aria-label={listo ? "Archivo listo" : `Cargando ${Math.round(progreso)}%`}
    >
      <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90" aria-hidden>
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-slate-200"
          strokeWidth="3.25"
        />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="currentColor"
          className={listo ? "text-emerald-500" : "text-indigo-500"}
          strokeWidth="3.25"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 180ms linear, stroke 200ms ease" }}
        />
      </svg>
      {listo ? (
        <svg
          viewBox="0 0 24 24"
          className="absolute text-emerald-600"
          width={size * 0.42}
          height={size * 0.42}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{ animation: "rdc-check-pop 280ms ease-out" }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <span className="absolute text-[9px] font-black tabular-nums text-slate-600">
          {Math.round(progreso)}%
        </span>
      )}
      <style>{`@keyframes rdc-check-pop{from{transform:scale(.55);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
