"use client";

import Link from "next/link";
import { MESES_NOM } from "@/lib/clientes";
import { GroupedSection } from "@/components/portal/PortalGroupedList";
import { useAnilloFill } from "@/hooks/useAnilloFill";

export type TonoPlazo =
  | "hecho"
  | "navy"
  | "negro"
  | "amarillo"
  | "naranja"
  | "gris"
  | "rojo";

export type AnilloPlazo = {
  id: string;
  label: string;
  fecha: Date;
  hecho: boolean;
  href: string;
  /** WhatsApp u otro enlace fuera del portal. */
  externo?: boolean;
  pie?: string;
  ventana?: number;
  /** Declaración / e.firma: no usan el verde de “hecho”. */
  tonoFijo?: TonoPlazo;
};

const COLOR: Record<TonoPlazo, { stroke: string; texto: string }> = {
  hecho: { stroke: "#10b981", texto: "text-emerald-600" },
  navy: { stroke: "var(--portal-navy, #1a164d)", texto: "text-[var(--portal-navy)]" },
  negro: { stroke: "#111111", texto: "text-slate-900" },
  amarillo: { stroke: "#eab308", texto: "text-yellow-600" },
  naranja: { stroke: "#FDB203", texto: "text-marca-naranja" },
  gris: { stroke: "#cbd5e1", texto: "text-slate-400" },
  rojo: { stroke: "#ef4444", texto: "text-red-500" },
};

export function tonoEfirma(diasRestantes: number): TonoPlazo {
  if (diasRestantes <= 1) return "rojo";
  if (diasRestantes <= 2) return "naranja";
  if (diasRestantes <= 5) return "amarillo";
  return "negro";
}

const BOX = 72;
const R = 28;
const STROKE = 5.5;
const CIRC = 2 * Math.PI * R;
const ARC_DEG = 270;
const ARC = (ARC_DEG / 360) * CIRC;
const VENTANA = 17;

export function tonoPlazo(hecho: boolean, diasRestantes: number): TonoPlazo {
  if (hecho) return "hecho";
  if (diasRestantes > 5) return "navy";
  if (diasRestantes >= 3) return "amarillo";
  return "naranja";
}

export function diasHastaFecha(fecha: Date, hoy = new Date()): number {
  const a = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const b = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function pctAnillo(
  tono: TonoPlazo,
  hecho: boolean,
  dias: number,
  ventana = VENTANA
): number {
  if (tono === "gris" || tono === "rojo" || hecho || dias < 0) return 100;
  return Math.min(
    100,
    Math.max(8, Math.round(((ventana - dias) / ventana) * 100))
  );
}

function fmtDiaMesCorto(d: Date): string {
  return `${d.getDate()} ${MESES_NOM[d.getMonth()].slice(0, 3).toLowerCase()}`;
}

function ChevronGris() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-400 shrink-0"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

type Props = { anillos: AnilloPlazo[]; hoy?: Date };

export default function PortalPlazosAnillos({ anillos, hoy }: Props) {
  const ahora = hoy ?? new Date();

  return (
    <GroupedSection label="Plazos">
      <div
        className={`grid gap-1 px-2 py-4 ${
          anillos.length >= 4
            ? "grid-cols-2 sm:grid-cols-4"
            : anillos.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
        }`}
      >
        {anillos.map((a, i) => (
          <AnilloPlazoItem
            key={a.id}
            anillo={a}
            hoy={ahora}
            delayMs={i * 70}
          />
        ))}
      </div>
    </GroupedSection>
  );
}

function AnilloPlazoItem({
  anillo: a,
  hoy,
  delayMs,
}: {
  anillo: AnilloPlazo;
  hoy: Date;
  delayMs: number;
}) {
  const dias = diasHastaFecha(a.fecha, hoy);
  const tono = a.tonoFijo ?? tonoPlazo(a.hecho, dias);
  const color = COLOR[tono];
  const pct = pctAnillo(tono, a.hecho, dias, a.ventana);
  const offset = useAnilloFill(ARC, pct);
  const inactivo = tono === "gris";
  const pie =
    a.pie ??
    (tono === "gris"
      ? "Pagado"
      : tono === "rojo" && a.id === "declaracion"
        ? "Pendiente"
        : a.hecho
          ? "Listo"
          : fmtDiaMesCorto(a.fecha));
  const claseFila = `flex flex-col items-center gap-0.5 rounded-xl px-1 py-1 active:bg-slate-50 ${
    inactivo ? "opacity-70" : ""
  }`;
  const interior = (
    <>
      <span
        className="relative shrink-0"
        style={{ width: BOX, height: BOX }}
        role="img"
        aria-label={`${a.label} · ${pie}`}
      >
        <svg
          width={BOX}
          height={BOX}
          className="rotate-[135deg]"
          aria-hidden
        >
          <circle
            cx={BOX / 2}
            cy={BOX / 2}
            r={R}
            fill="none"
            stroke="var(--rdc-ring-track)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${CIRC}`}
          />
          <circle
            cx={BOX / 2}
            cy={BOX / 2}
            r={R}
            fill="none"
            stroke={color.stroke}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${CIRC}`}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
            style={{ transitionDelay: `${delayMs}ms` }}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-bold tabular-nums text-[22px] leading-none ${color.texto}`}
        >
          {a.fecha.getDate()}
        </span>
      </span>
      <span
        className={`inline-flex items-center justify-center gap-0.5 -mt-1.5 text-[13px] font-semibold text-center leading-tight ${
          inactivo ? "text-slate-400" : "text-slate-900"
        }`}
      >
        {a.label}
        <ChevronGris />
      </span>
      <span className="text-[12px] text-slate-500 text-center leading-none">
        {pie}
      </span>
    </>
  );

  if (a.externo) {
    return (
      <a
        href={a.href}
        target="_blank"
        rel="noopener noreferrer"
        className={claseFila}
      >
        {interior}
      </a>
    );
  }

  return (
    <Link href={a.href} className={claseFila}>
      {interior}
    </Link>
  );
}
