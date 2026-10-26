"use client";

import { useEffect, useState, type ReactNode } from "react";
import PillDeslizable from "@/components/ui/PillDeslizable";
import { RIF_SECCIONES } from "@/lib/rif-expositor";

export function RifSeccionesNav() {
  const [seccion, setSeccion] = useState<string>(RIF_SECCIONES[0].value);

  useEffect(() => {
    const ids = RIF_SECCIONES.map((s) => s.value);
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setSeccion(visible.target.id);
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0.08, 0.2, 0.4] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      aria-label="Secciones de la guía 621"
      className="sticky top-16 z-40 pointer-events-none"
    >
      <div className="flex justify-center px-4 pt-4 pb-2.5">
        <div className="pointer-events-auto max-w-full rounded-full bg-white/90 p-1 shadow-[0_8px_28px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.05] backdrop-blur-md">
          <PillDeslizable
            acento="claro"
            size="sm"
            compact
            scrollable
            className="max-w-full [&_.rdc-ios-pill-claro]:bg-[#e5e5ea]"
            opciones={RIF_SECCIONES.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
            value={seccion}
            onChange={(v) => {
              setSeccion(v);
              document.getElementById(v)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          />
        </div>
      </div>
    </nav>
  );
}

const PANEL = {
  permanecer: {
    kicker: "En 621 · reglas de transición",
    titulo: "Bimestral, con la reducción de tu año de alta",
  },
  migrar: {
    kicker: "Salida · Art. 113-E LISR",
    titulo: "RESICO es el régimen que sigue vigente",
  },
} as const;

export function RifPermanecerMigrarPills({
  permanecer,
  migrar,
}: {
  permanecer: ReactNode;
  migrar: ReactNode;
}) {
  const [tab, setTab] = useState<"permanecer" | "migrar">("permanecer");
  const meta = PANEL[tab];
  return (
    <div className="overflow-hidden rounded-[1.25rem] bg-white">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#A06030]">
            {meta.kicker}
          </p>
          <p className="mt-1 text-[17px] font-bold tracking-tight text-slate-900">
            {meta.titulo}
          </p>
        </div>
        <PillDeslizable
          acento="claro"
          size="sm"
          compact
          className="[&_.rdc-ios-pill-claro]:bg-[#e5e5ea]"
          value={tab}
          onChange={setTab}
          opciones={[
            { value: "permanecer", label: "Permanecer" },
            { value: "migrar", label: "Migrar" },
          ]}
        />
      </div>
      <div className="mx-4 sm:mx-5 border-t border-slate-100" />
      <div className="grid">
        <div
          className={`col-start-1 row-start-1 ${tab === "permanecer" ? "" : "invisible pointer-events-none"}`}
          aria-hidden={tab !== "permanecer"}
        >
          {permanecer}
        </div>
        <div
          className={`col-start-1 row-start-1 ${tab === "migrar" ? "" : "invisible pointer-events-none"}`}
          aria-hidden={tab !== "migrar"}
        >
          {migrar}
        </div>
      </div>
    </div>
  );
}
