"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import Fiscalino from "@/components/Fiscalino";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type ServicioTheme = {
  tint: string;
  glow: string;
  ring: string;
  iconBg: string;
};

type Servicio = {
  titulo: string;
  descripcion: string;
  detalle: string[];
  nota: string;
  icono: React.ReactNode;
  theme: ServicioTheme;
};

const SERVICIOS: Servicio[] = [
  {
    titulo: "Cumplimiento fiscal mensual",
    descripcion:
      "Declaraciones provisionales, definitivas, DIOT y obligaciones informativas presentadas a tiempo.",
    detalle: [
      "ISR e IVA provisionales y definitivos",
      "DIOT y obligaciones informativas",
      "Retenciones de ISR, IVA e IEPS",
      "Calendario de vencimientos en tu portal",
    ],
    nota: "Incluido en tu honorario mensual",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
    theme: {
      tint: "from-indigo-100/80 via-violet-50/50 to-white",
      glow: "from-indigo-400/35 to-violet-300/20",
      ring: "ring-indigo-200/60",
      iconBg: "bg-indigo-600 text-white shadow-indigo-500/30",
    },
  },
  {
    titulo: "Contabilidad electrónica",
    descripcion:
      "Registro contable conforme a NIF, generación de XML para SAT y conciliaciones bancarias.",
    detalle: [
      "Pólizas y auxiliares conforme a NIF",
      "XML de contabilidad electrónica al SAT",
      "Conciliación bancaria mensual",
      "Reportes para toma de decisiones",
    ],
    nota: "Incluido en tu honorario mensual",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-5" />
      </svg>
    ),
    theme: {
      tint: "from-sky-100/80 via-cyan-50/50 to-white",
      glow: "from-sky-400/35 to-cyan-300/20",
      ring: "ring-sky-200/60",
      iconBg: "bg-sky-600 text-white shadow-sky-500/30",
    },
  },
  {
    titulo: "Nóminas y SUA / IMSS",
    descripcion:
      "Cálculo de nómina, timbrado, alta y baja de trabajadores y cumplimiento ante el IMSS e Infonavit.",
    detalle: [
      "Cálculo y timbrado de nómina (CFDI)",
      "Altas, bajas y movimientos afiliatorios",
      "SUA, IDSE y cuotas obrero-patronales",
      "ISN e Infonavit al día",
    ],
    nota: "Cotización según número de trabajadores",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    theme: {
      tint: "from-emerald-100/80 via-teal-50/50 to-white",
      glow: "from-emerald-400/35 to-teal-300/20",
      ring: "ring-emerald-200/60",
      iconBg: "bg-emerald-600 text-white shadow-emerald-500/30",
    },
  },
  {
    titulo: "Declaración anual",
    descripcion:
      "Personas físicas y morales: deducciones autorizadas, saldos a favor y devoluciones automáticas.",
    detalle: [
      "Declaración anual PF y PM",
      "Revisión de deducciones autorizadas",
      "Saldos a favor y devoluciones",
      "Acompañamiento ante requerimientos",
    ],
    nota: "Servicio anual · cotización aparte",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14l2 2 4-4" />
      </svg>
    ),
    theme: {
      tint: "from-amber-100/80 via-orange-50/50 to-white",
      glow: "from-amber-400/35 to-orange-300/20",
      ring: "ring-amber-200/60",
      iconBg: "bg-amber-600 text-white shadow-amber-500/30",
    },
  },
  {
    titulo: "Asesoría fiscal y planeación",
    descripcion:
      "Optimización de carga fiscal con estrategias legales, simuladores y atención de requerimientos del SAT.",
    detalle: [
      "Simuladores de régimen e ISR",
      "Estrategias de deducción legales",
      "Atención de requerimientos del SAT",
      "Planeación fiscal a mediano plazo",
    ],
    nota: "Por proyecto o retainer mensual",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    theme: {
      tint: "from-violet-100/80 via-fuchsia-50/50 to-white",
      glow: "from-violet-400/35 to-fuchsia-300/20",
      ring: "ring-violet-200/60",
      iconBg: "bg-violet-600 text-white shadow-violet-500/30",
    },
  },
  {
    titulo: "Constitución de empresas",
    descripcion:
      "Apoyo en la formación de personas morales y régimen fiscal óptimo según su giro y proyección.",
    detalle: [
      "Trámite ante notaría y SAT",
      "Elección de régimen fiscal óptimo",
      "Alta en RFC persona moral",
      "e.firma y primeros pasos de cumplimiento",
    ],
    nota: "Honorario único por constitución",
    icono: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="12" y1="11" x2="12" y2="16" />
        <line x1="9.5" y1="13.5" x2="14.5" y2="13.5" />
      </svg>
    ),
    theme: {
      tint: "from-rose-100/80 via-pink-50/50 to-white",
      glow: "from-rose-400/35 to-pink-300/20",
      ring: "ring-rose-200/60",
      iconBg: "bg-rose-600 text-white shadow-rose-500/30",
    },
  },
];

/** Expansión vertical (solo prefers-reduced-motion). */
function ExpandArrow({ expanded }: { expanded: boolean }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/35 ring-2 ring-white transition-transform duration-500 ${
        expanded ? "rotate-180" : ""
      }`}
      aria-hidden
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14" />
        <path d="m19 12-7 7-7-7" />
      </svg>
    </span>
  );
}
/** Volteo horizontal (rotateY) — flecha → / ← */
function FlipArrow({ flipped }: { flipped: boolean }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/35 ring-2 ring-white transition-transform duration-500 ${
        flipped ? "scale-x-[-1]" : ""
      }`}
      aria-hidden
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12h11" />
        <path d="m13 7 5 5-5 5" />
        <path d="M4 4v16" opacity="0.35" strokeWidth="2" />
      </svg>
    </span>
  );
}

function ServicioFlipCard({
  servicio,
  flipped,
  expanded,
  reduced,
  onToggle,
}: {
  servicio: Servicio;
  flipped: boolean;
  expanded: boolean;
  reduced: boolean;
  onToggle: () => void;
}) {
  const { theme } = servicio;

  if (reduced) {
    return (
      <div className={`overflow-hidden rounded-2xl bg-gradient-to-br shadow-md ring-1 ring-slate-200/80 ${theme.tint}`}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex w-full items-start gap-4 p-5 text-left sm:p-6"
        >
          <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${theme.iconBg} shadow-md`}>
            {servicio.icono}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-slate-900">{servicio.titulo}</h3>
            <p className="mt-1 text-sm text-slate-600">{servicio.descripcion}</p>
          </div>
          <ExpandArrow expanded={expanded} />
        </button>
        {expanded && (
          <div className="border-t border-slate-100/80 px-5 pb-5 sm:px-6 sm:pb-6">
            <ul className="space-y-2 text-sm text-slate-700">
              {servicio.detalle.map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-semibold text-indigo-600">{servicio.nota}</p>
            <Link href="/contacto" className="mt-3 inline-block text-sm font-bold text-violet-600 hover:underline">
              Solicitar cotización →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={flipped}
      aria-label={flipped ? `Cerrar detalle de ${servicio.titulo}` : `Ver detalle de ${servicio.titulo}`}
      className="group relative min-h-[240px] w-full rounded-2xl text-left shadow-md ring-1 ring-slate-200/80 [perspective:1000px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div
        className={`relative h-full min-h-[240px] w-full rounded-2xl transition-transform duration-[550ms] ease-[cubic-bezier(0.4,0,0.2,1)] [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Frente */}
        <div
          className={`absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br p-6 sm:p-7 [backface-visibility:hidden] ${theme.tint}`}
        >
          <div
            aria-hidden
            className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${theme.glow} blur-2xl opacity-70 transition-opacity group-hover:opacity-100`}
          />
          <div className="relative flex flex-1 flex-col">
            <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${theme.iconBg} shadow-md ring-2 ${theme.ring}`}>
              {servicio.icono}
            </span>
            <h3 className="relative mt-4 text-base font-black leading-snug text-slate-900">{servicio.titulo}</h3>
            <p className="relative mt-2 flex-1 text-sm leading-relaxed text-slate-600">{servicio.descripcion}</p>
            <div className="relative mt-4 flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600/80">
                Girar tarjeta →
              </span>
              <FlipArrow flipped={false} />
            </div>
          </div>
        </div>

        {/* Reverso */}
        <div
          className={`absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br p-6 sm:p-7 [backface-visibility:hidden] [transform:rotateY(180deg)] ${theme.tint}`}
        >
          <h3 className="text-sm font-black text-slate-900">{servicio.titulo}</h3>
          <ul className="mt-3 flex-1 space-y-2 text-sm text-slate-700">
            {servicio.detalle.map((d) => (
              <li key={d} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                {d}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs font-semibold text-indigo-600">{servicio.nota}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Link
              href="/contacto"
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-bold text-violet-600 hover:underline"
            >
              Cotizar →
            </Link>
            <FlipArrow flipped />
          </div>
        </div>
      </div>
    </button>
  );
}

function FiscalinoGuia() {
  return (
    <div className="hidden shrink-0 flex-col items-center lg:flex lg:w-[210px] xl:w-[230px]">
      <div className="relative w-full rounded-2xl border border-indigo-100 bg-white p-4 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-50">
        <p className="text-center text-sm font-bold leading-snug text-slate-800">
          ¡Haz clic en cualquier servicio!
        </p>
        <p className="mt-1.5 text-center text-xs leading-relaxed text-slate-500">
          La tarjeta se voltea y te muestra qué incluye cada uno.
        </p>
        <div
          aria-hidden
          className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-indigo-100 bg-white"
        />
      </div>
      <div className="relative mt-5">
        <div aria-hidden className="absolute -inset-4 rounded-full bg-indigo-200/40 blur-2xl" />
        <Fiscalino mood="happy" size={120} className="relative mx-auto" />
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M8 12h11" />
            <path d="m13 7 5 5-5 5" />
          </svg>
        </span>
        Toca la card para girarla
      </p>
    </div>
  );
}

export default function ServiciosGrid() {
  const reduced = usePrefersReducedMotion();
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = useCallback(
    (index: number) => {
      if (reduced) {
        setExpandedIndex((prev) => (prev === index ? null : index));
      } else {
        setFlippedIndex((prev) => (prev === index ? null : index));
      }
    },
    [reduced],
  );

  return (
    <section className="bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
      <div className="border-b border-slate-200/80 bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <RevealOnScroll>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-indigo-600">
              Servicios
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Soluciones contables y fiscales{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                integrales
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Todo lo que tu persona física o moral necesita, en un solo despacho — respaldado por
              portal propio y procesos claros mes con mes.
            </p>
            <p className="mx-auto mt-2 max-w-md text-xs text-slate-400 lg:hidden">
              Toca un servicio para ver qué incluye.
            </p>
          </RevealOnScroll>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <RevealOnScroll delay={80}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
            <FiscalinoGuia />

            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-5">
                {SERVICIOS.map((s, i) => (
                  <ServicioFlipCard
                    key={s.titulo}
                    servicio={s}
                    flipped={flippedIndex === i}
                    expanded={expandedIndex === i}
                    reduced={reduced}
                    onToggle={() => toggle(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
