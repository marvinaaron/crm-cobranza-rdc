"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import PillDeslizable from "@/components/ui/PillDeslizable";
import type { MetodoPago } from "@/components/portal/metodo-pago-ui";

const METODOS: { value: MetodoPago; label: string }[] = [
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
];

type Props = {
  transferencia: ReactNode;
  tarjeta: ReactNode;
  inicial?: MetodoPago;
};

export default function PortalPagoMetodo({
  transferencia,
  tarjeta,
  inicial = "transferencia",
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const snapTimer = useRef<number | null>(null);
  const [metodo, setMetodo] = useState<MetodoPago>(inicial);
  const [progress, setProgress] = useState(inicial === "tarjeta" ? 1 : 0);

  const irA = useCallback((next: MetodoPago) => {
    setMetodo(next);
    const el = trackRef.current;
    if (!el) return;
    const idx = next === "tarjeta" ? 1 : 0;
    el.style.scrollSnapType = "none";
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
    const restaurar = () => {
      el.style.scrollSnapType = "";
    };
    el.addEventListener("scrollend", restaurar, { once: true });
    window.setTimeout(restaurar, 480);
  }, []);

  const scrub = useCallback((p: number) => {
    const el = trackRef.current;
    if (!el || el.clientWidth <= 0) return;
    el.style.scrollSnapType = "none";
    el.scrollLeft = p * el.clientWidth;
    setProgress(p);
  }, []);

  const sincronizar = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth <= 0) return;
    const p = el.scrollLeft / el.clientWidth;
    setProgress(p);
    const next: MetodoPago = Math.round(p) >= 1 ? "tarjeta" : "transferencia";
    setMetodo(next);
    if (snapTimer.current != null) window.clearTimeout(snapTimer.current);
    snapTimer.current = window.setTimeout(() => {
      el.style.scrollSnapType = "";
    }, 80);
  }, []);

  useEffect(() => {
    if (inicial === "tarjeta") {
      const el = trackRef.current;
      if (el) el.scrollTo({ left: el.clientWidth, behavior: "auto" });
    }
    return () => {
      if (snapTimer.current != null) window.clearTimeout(snapTimer.current);
    };
  }, [inicial]);

  return (
    <div>
      <PillDeslizable
        acento="portal"
        value={metodo}
        onChange={irA}
        opciones={METODOS}
        progress={progress}
        instantThumb
        onScrub={scrub}
      />
      <div
        ref={trackRef}
        onScroll={sincronizar}
        className="mt-3 flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Método de pago"
      >
        <div className="w-full shrink-0 snap-start">{transferencia}</div>
        <div className="w-full shrink-0 snap-start">{tarjeta}</div>
      </div>
    </div>
  );
}
