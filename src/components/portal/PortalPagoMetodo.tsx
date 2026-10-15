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
  const [metodo, setMetodo] = useState<MetodoPago>(inicial);

  const irA = useCallback((next: MetodoPago) => {
    setMetodo(next);
    const el = trackRef.current;
    if (!el) return;
    const idx = next === "transferencia" ? 0 : 1;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }, []);

  const sincronizar = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth <= 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setMetodo(i >= 1 ? "tarjeta" : "transferencia");
  }, []);

  useEffect(() => {
    if (inicial === "tarjeta") {
      const el = trackRef.current;
      if (el) el.scrollTo({ left: el.clientWidth, behavior: "auto" });
    }
  }, [inicial]);

  return (
    <div>
      <PillDeslizable
        acento="portal"
        value={metodo}
        onChange={irA}
        opciones={METODOS}
      />
      <p className="mt-2 text-center text-[12px] text-slate-400 sm:hidden">
        Desliza para cambiar de método
      </p>
      <div
        ref={trackRef}
        onScroll={sincronizar}
        className="mt-3 flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Método de pago"
      >
        <div className="w-full shrink-0 snap-start">{transferencia}</div>
        <div className="w-full shrink-0 snap-start">{tarjeta}</div>
      </div>
    </div>
  );
}
