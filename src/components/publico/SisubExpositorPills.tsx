"use client";

import { useEffect, useState, type ReactNode } from "react";
import PillDeslizable from "@/components/ui/PillDeslizable";
import { SISUB_SECCIONES } from "@/lib/sisub-expositor";

export function SisubSeccionesNav() {
  const [seccion, setSeccion] = useState<string>(SISUB_SECCIONES[0].value);

  useEffect(() => {
    const ids = SISUB_SECCIONES.map((s) => s.value);
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
      aria-label="Secciones de la guía SISUB"
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
            opciones={SISUB_SECCIONES.map((s) => ({
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
  declaracion: {
    kicker: "Declaración · INFONAVIT · cuatrimestral",
    titulo: "No es un pago. Es un acuse, tres veces al año",
  },
  plantilla: {
    kicker: "Plantilla · NSS, RFC y SDI",
    titulo: "Cada trabajador tiene que cuadrar con el ICSOE",
  },
  cruce: {
    kicker: "Cruce · ICSOE y REPSE",
    titulo: "Misma gente, otra autoridad, mismo cuatrimestre",
  },
} as const;

export function SisubMecanicaPills({
  declaracion,
  plantilla,
  cruce,
}: {
  declaracion: ReactNode;
  plantilla: ReactNode;
  cruce: ReactNode;
}) {
  const [tab, setTab] = useState<"declaracion" | "plantilla" | "cruce">(
    "declaracion"
  );
  const meta = PANEL[tab];
  return (
    <div className="overflow-hidden rounded-[1.25rem] bg-white">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C41622]">
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
            { value: "declaracion", label: "Declaración" },
            { value: "plantilla", label: "Plantilla" },
            { value: "cruce", label: "Cruce" },
          ]}
        />
      </div>
      <div className="mx-4 sm:mx-5 border-t border-slate-100" />
      <div className="grid">
        <div
          className={`col-start-1 row-start-1 h-full min-h-0 ${tab === "declaracion" ? "" : "invisible pointer-events-none"}`}
          aria-hidden={tab !== "declaracion"}
        >
          {declaracion}
        </div>
        <div
          className={`col-start-1 row-start-1 h-full min-h-0 ${tab === "plantilla" ? "" : "invisible pointer-events-none"}`}
          aria-hidden={tab !== "plantilla"}
        >
          {plantilla}
        </div>
        <div
          className={`col-start-1 row-start-1 h-full min-h-0 ${tab === "cruce" ? "" : "invisible pointer-events-none"}`}
          aria-hidden={tab !== "cruce"}
        >
          {cruce}
        </div>
      </div>
    </div>
  );
}
