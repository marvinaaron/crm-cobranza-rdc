"use client";

import { useEffect, useState, type ReactNode } from "react";
import PillDeslizable from "@/components/ui/PillDeslizable";
import { PM_SECCIONES } from "@/lib/regimen-general-expositor";

export function RegimenGeneralSeccionesNav() {
  const [seccion, setSeccion] = useState<string>(PM_SECCIONES[0].value);

  useEffect(() => {
    const ids = PM_SECCIONES.map((s) => s.value);
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
      aria-label="Secciones de la guía 601"
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
            opciones={PM_SECCIONES.map((s) => ({
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
  isr: {
    kicker: "ISR · Arts. 9, 14 y 17 LISR",
    titulo: "Se paga sobre lo facturado, no sobre lo cobrado",
  },
  iva: {
    kicker: "IVA · Art. 1-B LIVA · DIOT",
    titulo: "El IVA no funciona así: nace cuando cobras",
  },
  retenciones: {
    kicker: "Retenciones · ISR, IVA y salarios",
    titulo: "Si pagas a terceros, tú retienes",
  },
} as const;

export function PmMecanicaPills({
  isr,
  iva,
  retenciones,
}: {
  isr: ReactNode;
  iva: ReactNode;
  retenciones: ReactNode;
}) {
  const [tab, setTab] = useState<"isr" | "iva" | "retenciones">("isr");
  const meta = PANEL[tab];
  return (
    <div className="overflow-hidden rounded-[1.25rem] bg-white">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#3A48B0]">
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
            { value: "isr", label: "ISR" },
            { value: "iva", label: "IVA" },
            { value: "retenciones", label: "Retenciones" },
          ]}
        />
      </div>
      <div className="mx-4 sm:mx-5 border-t border-slate-100" />
      <div className="grid">
        <div
          className={`col-start-1 row-start-1 ${tab === "isr" ? "" : "invisible pointer-events-none"}`}
          aria-hidden={tab !== "isr"}
        >
          {isr}
        </div>
        <div
          className={`col-start-1 row-start-1 ${tab === "iva" ? "" : "invisible pointer-events-none"}`}
          aria-hidden={tab !== "iva"}
        >
          {iva}
        </div>
        <div
          className={`col-start-1 row-start-1 ${tab === "retenciones" ? "" : "invisible pointer-events-none"}`}
          aria-hidden={tab !== "retenciones"}
        >
          {retenciones}
        </div>
      </div>
    </div>
  );
}
