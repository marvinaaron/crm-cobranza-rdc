/**
 * Capturas estáticas del portal del cliente — mismo look que /portal/cumplimiento
 * (fondo claro, stepper, pills). Una vista por paso del flujo público.
 */

import type { ReactNode } from "react";
import Image from "next/image";

const PASOS_PORTAL = [
  "Sin iniciar",
  "En preparación",
  "Revisión de impuestos",
  "Confirmado",
  "Declarando",
  "Confirmando pago",
  "Completado",
] as const;

const STATUS_POR_PASO = [
  "Tu contador está recibiendo los documentos del periodo",
  "Estamos preparando tu contabilidad del periodo en CONTPAQi",
  "El preliminar de impuestos está listo para tu revisión",
  "Esperando tu confirmación del preliminar",
  "Tus declaraciones están siendo presentadas al SAT",
  "Sube tu comprobante de pago desde el portal",
  "Periodo completado y archivado en tu historial",
];

function PortalBrowserFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/25 ring-1 ring-slate-200/90">
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="ml-2 truncate text-[9px] font-semibold tracking-wide text-slate-500">
          rdcontadores.com/portal/cumplimiento
        </span>
      </div>
      <div className="border-b border-slate-100 bg-white px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image src="/logos/rdc-gray.png" alt="" width={56} height={22} className="h-[18px] w-auto" />
            <span className="hidden text-[10px] font-bold text-slate-400 sm:inline">|</span>
            <span className="text-[10px] font-bold text-slate-500">Inicio</span>
            <span className="text-[10px] font-bold text-blue-700">Cumplimiento</span>
          </div>
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-violet-600 text-[8px] font-black text-white">
              2
            </span>
          </span>
        </div>
      </div>
      <div className="bg-slate-50 p-4 sm:p-5">{children}</div>
    </div>
  );
}

function StepperPills({ pasoActivo }: { pasoActivo: number }) {
  const idx = pasoActivo - 1;
  const fillPct = Math.round((pasoActivo / 7) * 100);

  return (
    <div className="rounded-[18px] border border-slate-100 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-bold leading-tight text-blue-900">Tu cierre de Mayo 2026</p>
          <p className="mt-0.5 text-[11px] font-semibold text-indigo-600">
            {pasoActivo >= 7 ? "Completado" : `Paso ${pasoActivo} de 7`}
          </p>
        </div>
        <span className="text-[11px] font-semibold text-indigo-600">Ver más →</span>
      </div>
      <div className="my-2 h-1 overflow-hidden rounded bg-indigo-500/[0.12]">
        <div
          className="h-full rounded bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-700"
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PASOS_PORTAL.map((label, i) => {
          const completo = i < idx;
          const actual = i === idx;
          const clase = actual
            ? "bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]"
            : completo
              ? "border border-indigo-500/25 bg-indigo-500/10 text-indigo-600"
              : "bg-black/[0.04] text-[rgba(30,27,75,0.35)]";
          return (
            <span
              key={label}
              className={`shrink-0 whitespace-nowrap rounded-[20px] px-2.5 py-[5px] text-[10px] ${clase}`}
            >
              {completo ? "✓ " : ""}
              {label}
            </span>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="rdc-pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
        <p className="text-[11px] leading-snug text-[rgba(30,27,75,0.65)]">{STATUS_POR_PASO[idx]}</p>
      </div>
    </div>
  );
}

function BloqueContenido({ paso }: { paso: number }) {
  switch (paso) {
    case 1:
      return (
        <div className="mt-3 space-y-2">
          {[
            { t: "SAT · ISR e IVA", e: "En preparación", c: "bg-amber-100 text-amber-700" },
            { t: "Documentos del mes", e: "Recibiendo", c: "bg-slate-100 text-slate-600" },
          ].map((r) => (
            <div key={r.t} className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100">
              <span className="text-xs font-semibold text-slate-800">{r.t}</span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${r.c}`}>
                {r.e}
              </span>
            </div>
          ))}
        </div>
      );
    case 2:
      return (
        <div className="mt-3 rounded-xl bg-blue-50 px-3 py-3 ring-1 ring-blue-100">
          <p className="text-xs font-bold text-blue-900">Contabilidad en CONTPAQi</p>
          <div className="mt-2 space-y-1.5">
            {["Ingresos", "Gastos", "Conciliación"].map((t, i) => (
              <div key={t} className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blue-100">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${[70, 45, 20][i]}%` }} />
                </div>
                <span className="w-14 text-[9px] font-bold text-blue-700">{t}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 3:
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">ISR previo</p>
            <p className="mt-1 text-lg font-black tabular-nums text-slate-900">$4,280</p>
          </div>
          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">IVA previo</p>
            <p className="mt-1 text-lg font-black tabular-nums text-slate-900">$1,920</p>
          </div>
          <div className="col-span-2 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
            <p className="text-[10px] font-bold text-amber-800">Sin pago · solo revisión</p>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="mt-3 rounded-xl bg-violet-50 p-4 text-center ring-1 ring-violet-100">
          <p className="text-sm font-black text-violet-900">Confirma el previo</p>
          <button type="button" className="mt-3 w-full rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white">
            Aceptar previo
          </button>
        </div>
      );
    case 5:
      return (
        <div className="mt-3 space-y-2">
          {["Acuse de declaración", "Línea de captura SAT"].map((doc) => (
            <div key={doc} className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-100">
              <span className="text-xs font-semibold text-slate-800">{doc}</span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-700">PDF</span>
            </div>
          ))}
        </div>
      );
    case 6:
      return (
        <div className="mt-3 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/80 p-4 text-center">
          <p className="text-xs font-bold text-emerald-800">Sube tu comprobante de pago SAT</p>
        </div>
      );
    default:
      return (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">✓</span>
          <div>
            <p className="text-sm font-black text-emerald-800">Mes completado</p>
            <p className="text-[11px] text-emerald-700/80">Historial disponible en tu portal</p>
          </div>
        </div>
      );
  }
}

export default function ProcesoPortalMockup({ paso }: { paso: number }) {
  const n = Math.min(Math.max(paso, 1), 7);

  return (
    <PortalBrowserFrame>
      <StepperPills pasoActivo={n} />
      <BloqueContenido paso={n} />
    </PortalBrowserFrame>
  );
}
