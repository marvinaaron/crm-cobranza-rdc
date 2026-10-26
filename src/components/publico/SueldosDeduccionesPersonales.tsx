"use client";

import Link from "next/link";
import { useState } from "react";
import {
  SUELDOS_DEDUCCIONES,
  type SueldosDeduccionId,
} from "@/lib/sueldos-expositor";

type ColegiaturaTope = { nivel: string; topeFmt: string };

function Icono({
  id,
  className,
}: {
  id: SueldosDeduccionId;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    className,
    "aria-hidden": true as const,
  };
  switch (id) {
    case "medicos":
      return (
        <svg {...common}>
          <path
            d="M12 3.5v17M4.5 12h15"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "colegiaturas":
      return (
        <svg {...common}>
          <path
            d="M12 7.2c-2.4-1.4-4.6-1.7-7-.6V18c2.4-1.1 4.6-.8 7 .6 2.4-1.4 4.6-1.7 7-.6V6.6c-2.4 1.1-4.6 1.4-7 .6Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M12 7.2V18.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "hipotecarios":
      return (
        <svg {...common}>
          <path
            d="M4 12 L12 5 l8 7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M6.5 11.5V19h11v-7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M10.5 19v-5h3v5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "afore":
      return (
        <svg {...common}>
          <path
            d="M5 16.5c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M4.5 19.5h15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "donativos":
      return (
        <svg {...common}>
          <path
            d="M12 19s-6.5-4.1-6.5-8.2A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 6.5 2.8C18.5 14.9 12 19 12 19Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "seguros":
      return (
        <svg {...common}>
          <path
            d="M12 3.5 5.5 6.2v6.3c0 4 2.8 6.6 6.5 8 3.7-1.4 6.5-4 6.5-8V6.2L12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 12.2l2.1 2.1 4-4.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "funerarios":
      return (
        <svg {...common}>
          <path
            d="M12 4.5c1.8 2.4 3 4.4 3 6.2A3 3 0 1 1 9 10.7c0-1.8 1.2-3.8 3-6.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M6 19.5h12M8.5 19.5v-4h7v4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "transporte":
      return (
        <svg {...common}>
          <rect
            x="4.5"
            y="6"
            width="15"
            height="9.5"
            rx="2.2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M4.5 12.5h15"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="8" cy="17.5" r="1.4" fill="currentColor" />
          <circle cx="16" cy="17.5" r="1.4" fill="currentColor" />
        </svg>
      );
  }
}

export default function SueldosDeduccionesPersonales({
  anioUma,
  cincoUmaFmt,
  umaAnualFmt,
  colegiaturas,
}: {
  anioUma: number;
  cincoUmaFmt: string;
  umaAnualFmt: string;
  colegiaturas: readonly ColegiaturaTope[];
}) {
  const [activa, setActiva] = useState<SueldosDeduccionId>("medicos");
  const item = SUELDOS_DEDUCCIONES.find((d) => d.id === activa) ?? SUELDOS_DEDUCCIONES[0];

  return (
    <div>
      <div className="rounded-[1.25rem] bg-white px-4 py-4 sm:px-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#3A6A88]">
          Tope conjunto · 15% o 5 UMA
        </p>
        <p className="mt-1.5 text-[15px] text-slate-600 leading-relaxed">
          Médicos, funerarios, seguros y transporte se suman. El SAT toma el
          menor entre el 15% de tus ingresos del año y 5 UMA anuales (
          {cincoUmaFmt} en {anioUma}). Hipoteca, AFORE, donativos y
          colegiaturas van por su propia regla.
        </p>
        <Link
          href="/herramientas/uma"
          className="mt-2 inline-flex text-[14px] font-semibold text-[#3A6A88] hover:text-[#1C2533]"
        >
          Cómo se calcula la UMA →
        </Link>
      </div>

      <div
        className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5"
        role="tablist"
        aria-label="Deducciones personales"
      >
        {SUELDOS_DEDUCCIONES.map((d) => {
          const selected = d.id === activa;
          return (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiva(d.id)}
              className={`flex h-[8.25rem] sm:h-[9rem] flex-col rounded-2xl p-3 text-left transition ${
                selected
                  ? "bg-white ring-2 ring-[#1C2533] shadow-[0_8px_24px_rgba(28,37,51,0.12)]"
                  : "bg-white ring-1 ring-black/[0.04] hover:ring-[#1C2533]/25"
              }`}
            >
              <span
                className={`flex size-11 items-center justify-center rounded-xl ${
                  selected
                    ? "bg-[#1C2533] text-[#9EC9E0]"
                    : "bg-[#f2f2f7] text-[#1C2533]"
                }`}
              >
                <Icono id={d.id} className="h-6 w-6" />
              </span>
              <span className="mt-3 block text-[15px] font-bold tracking-tight text-slate-900">
                {d.corto}
              </span>
              <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
                {d.topeCorto}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        className="mt-3 rounded-[1.25rem] bg-white px-4 py-4 sm:px-5 sm:py-5"
        aria-labelledby={`deduccion-${item.id}`}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#3A6A88]">
          {item.fundamento}
        </p>
        <h3
          id={`deduccion-${item.id}`}
          className="mt-1 text-[18px] font-bold tracking-tight text-slate-900"
        >
          {item.titulo}
        </h3>
        <p className="mt-2 text-[15px] text-slate-600 leading-relaxed">
          {item.queEs}
        </p>

        <div className="mt-4 rounded-2xl bg-[#f2f2f7] px-4 py-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3A6A88]">
            Cómo saber el tope
          </p>
          <ul className="mt-2.5 space-y-2.5">
            {item.comoSaber.map((paso) => (
              <li key={paso.label}>
                <p className="text-[14px] font-semibold text-slate-900">
                  {paso.label}
                </p>
                <p className="mt-0.5 text-[14px] text-slate-600 leading-relaxed">
                  {paso.texto}
                </p>
              </li>
            ))}
          </ul>
          {item.id === "colegiaturas" ? (
            <ul className="mt-3 divide-y divide-slate-200/80 rounded-xl bg-white overflow-hidden">
              {colegiaturas.map((n) => (
                <li
                  key={n.nivel}
                  className="flex items-baseline justify-between gap-3 px-3 py-2 text-[14px]"
                >
                  <span className="text-slate-600">{n.nivel}</span>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {n.topeFmt}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {item.id === "funerarios" ? (
            <p className="mt-3 text-[14px] font-semibold tabular-nums text-slate-900">
              1 UMA {anioUma}: {umaAnualFmt}
            </p>
          ) : null}
          {item.id === "afore" || item.entraAlConjunto ? (
            <p className="mt-3 text-[14px] font-semibold tabular-nums text-slate-900">
              5 UMA {anioUma}: {cincoUmaFmt}
            </p>
          ) : null}
        </div>

        <p className="mt-3 text-[14px] text-slate-600 leading-relaxed">
          {item.cfdi}
        </p>
        {item.herramienta ? (
          <Link
            href={item.herramienta.href}
            className="mt-3 inline-flex text-[14px] font-semibold text-[#3A6A88] hover:text-[#1C2533]"
          >
            {item.herramienta.label} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
