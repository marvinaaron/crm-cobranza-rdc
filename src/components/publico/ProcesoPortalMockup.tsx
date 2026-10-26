/**
 * Declaraciones dentro del iPhone de PortalShowcase:
 * bisel slate-900, Dynamic Island, barra de estado, indicador de inicio.
 */

import type { ReactNode } from "react";
import { FLUJO_CUMPLIMIENTO_LABELS } from "@/lib/cumplimiento";

const NAVY = "#1a164d";
const VIOLETA = "#7c3aed";
const CYAN = "#06b6d4";
const SURFACE = "#f2f2f7";

const PILLS = [
  FLUJO_CUMPLIMIENTO_LABELS.por_trabajar,
  FLUJO_CUMPLIMIENTO_LABELS.iniciando_contabilidad,
  FLUJO_CUMPLIMIENTO_LABELS.preliminar,
  FLUJO_CUMPLIMIENTO_LABELS.aceptacion,
  FLUJO_CUMPLIMIENTO_LABELS.declaraciones,
  FLUJO_CUMPLIMIENTO_LABELS.pago,
  FLUJO_CUMPLIMIENTO_LABELS.completado,
] as const;

const STATUS = [
  "Tu contador está recibiendo los documentos del periodo",
  "Tu contador está iniciando el cierre de este periodo",
  "Resumen de tu mes listo · ingresos, gastos e impuestos",
  "Resumen visto · preparamos tu declaración",
  "Tus declaraciones están listas · sube tu comprobante de pago",
  "Recibimos tu comprobante · tu contador lo está validando",
  "Periodo completado y archivado",
] as const;

function IconHome({ on }: { on?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} fillOpacity={on ? 0.22 : undefined} stroke="currentColor" strokeWidth={on ? 1.75 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconDocs({ on }: { on?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} fillOpacity={on ? 0.22 : undefined} stroke="currentColor" strokeWidth={on ? 1.75 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

function IconCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function IconCfdi() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </svg>
  );
}

function CierreCard({ paso, compact = false }: { paso: number; compact?: boolean }) {
  const idx = paso - 1;
  const fillPct = Math.round((paso / 7) * 100);
  return (
    <div className={`rounded-[18px] bg-white ${compact ? "px-3 py-2.5" : "px-3.5 py-3.5"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-bold leading-tight text-[#1e3a8a]">
            Tu cierre de Mayo 2026
          </p>
          <p className="mt-0.5 text-[11px] font-semibold" style={{ color: VIOLETA }}>
            {paso >= 7 ? "Completado" : `Paso ${paso} de 7`}
          </p>
        </div>
        {compact ? null : (
          <span className="text-[11px] font-semibold" style={{ color: VIOLETA }}>
            Ver más →
          </span>
        )}
      </div>
      <div className="my-2 h-1 overflow-hidden rounded" style={{ background: "rgba(124,58,237,0.14)" }}>
        <div
          className="h-full rounded"
          style={{ width: `${fillPct}%`, background: VIOLETA }}
        />
      </div>
      <div className="flex gap-1 overflow-hidden">
        {PILLS.slice(Math.max(0, idx - 1), idx + 2).map((label, i) => {
          const real = Math.max(0, idx - 1) + i;
          const actual = real === idx;
          const completo = real < idx;
          return (
            <span
              key={label}
              className="shrink-0 rounded-full px-2.5 py-[5px] text-[10px] whitespace-nowrap"
              style={
                actual
                  ? { background: VIOLETA, color: "#fff", fontWeight: 600 }
                  : completo
                    ? { background: "rgba(124,58,237,0.1)", color: VIOLETA }
                    : { background: "rgba(0,0,0,0.04)", color: "rgba(30,27,75,0.35)" }
              }
            >
              {completo ? (
                <svg className="mr-0.5 inline -translate-y-px" width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2 6.5 4.5 9 10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
              {label}
            </span>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: CYAN }} />
        <p className="text-[11px] leading-snug text-[rgba(30,27,75,0.65)]">
          {STATUS[idx]}
        </p>
      </div>
    </div>
  );
}

function FilaMonto({ label, valor, fuerte }: { label: string; valor: string; fuerte?: boolean }) {
  return (
    <li className="flex items-baseline justify-between gap-3">
      <span className={`text-[13px] font-semibold ${fuerte ? "text-slate-800" : "text-slate-500"}`}>
        {label}
      </span>
      <span className={`text-[15px] font-semibold tabular-nums ${fuerte ? "text-slate-900" : "text-slate-800"}`}>
        {valor}
      </span>
    </li>
  );
}

function Cifras({ visto }: { visto?: boolean }) {
  return (
    <div className="mt-3 rounded-[18px] bg-white px-3.5 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-slate-500">Cifras de Mayo 2026</p>
        {visto ? (
          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white">
            Visto
          </span>
        ) : null}
      </div>
      <ul className="mt-3 space-y-2">
        <FilaMonto label="Ingresos" valor="$182,400" />
        <FilaMonto label="Gastos" valor="$41,260" />
        <FilaMonto label="A pagar" valor="$6,210" fuerte />
        <FilaMonto label="Fecha de pago" valor="17 jun" />
      </ul>
      {!visto ? (
        <span
          className="mt-3 flex h-10 items-center justify-center rounded-full text-[13px] font-bold text-white"
          style={{ background: NAVY }}
        >
          Marcar como visto
        </span>
      ) : (
        <span className="mt-3 flex h-9 items-center justify-center rounded-full bg-slate-100 text-[13px] font-semibold text-slate-600">
          ¿Duda del importe? Escríbenos
        </span>
      )}
    </div>
  );
}

function Pantalla({ paso, compact = false }: { paso: number; compact?: boolean }) {
  if (paso <= 2) {
    return (
      <div className={`${compact ? "mt-2" : "mt-3"} space-y-2`}>
        {[
          {
            t: "SAT · ISR e IVA",
            e: paso === 1 ? "Sin iniciar" : "En preparación",
            c: paso === 1 ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-800",
          },
          { t: "Documentos del mes", e: "Recibiendo", c: "bg-slate-100 text-slate-600" },
        ].map((r) => (
          <div
            key={r.t}
            className={`flex items-center justify-between rounded-[18px] bg-white px-3.5 ${
              compact ? "py-2" : "py-3"
            }`}
          >
            <span className="text-[13px] font-semibold text-slate-800">{r.t}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.c}`}>
              {r.e}
            </span>
          </div>
        ))}
      </div>
    );
  }
  if (paso === 3) return <Cifras />;
  if (paso === 4) return <Cifras visto />;
  if (paso === 5) {
    return (
      <div className="mt-3 space-y-2">
        {["Acuse de declaración SAT", "Línea de captura"].map((doc) => (
          <div key={doc} className="flex items-center justify-between rounded-[18px] bg-white px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-[10px] font-black text-red-600">
                PDF
              </span>
              <span className="text-[13px] font-semibold text-slate-800">{doc}</span>
            </div>
            <span className="text-[13px] font-bold" style={{ color: NAVY }}>Bajar</span>
          </div>
        ))}
        <p className="px-1 pt-1 text-[13px] font-semibold text-slate-500">
          Paga en tu banco o en el SAT. Aquí solo se descargan.
        </p>
      </div>
    );
  }
  if (paso === 6) {
    return (
      <div className="mt-3 rounded-[18px] bg-white px-4 py-5 text-center">
        <p className="text-[14px] font-bold" style={{ color: NAVY }}>Subir comprobante de pago</p>
        <p className="mt-1 text-[13px] leading-snug text-slate-500">
          Foto o PDF del acuse que te dio el banco o el SAT.
        </p>
      </div>
    );
  }
  return (
    <div className="mt-3 flex items-center gap-3 rounded-[18px] bg-white px-3.5 py-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
        <svg width="16" height="16" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 6.5 4.5 9 10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div>
        <p className="text-[14px] font-bold text-emerald-800">Mayo 2026 archivado</p>
        <p className="text-[13px] text-slate-500">Acuses, línea y pago en tu historial</p>
      </div>
    </div>
  );
}

function Tab({
  icon,
  label,
  on,
}: {
  icon: ReactNode;
  label: string;
  on?: boolean;
}) {
  return (
    <span className={`relative flex flex-col items-center gap-0.5 pt-2 ${on ? "" : "text-slate-400"}`} style={on ? { color: NAVY } : undefined}>
      {on ? <span className="absolute top-0 h-1 w-7 rounded-full bg-current" /> : null}
      {icon}
      <span className={`text-[10px] leading-none ${on ? "font-semibold" : "font-medium"}`}>{label}</span>
    </span>
  );
}

function PantallaPortal({ paso, enFoto = false }: { paso: number; enFoto?: boolean }) {
  const n = Math.min(Math.max(paso, 1), 7);
  return (
    <div
      data-ui
      className="pointer-events-none flex h-full min-h-0 flex-col select-none overflow-hidden [color-scheme:light]"
      style={{ background: SURFACE }}
    >
      <div
        className={`flex items-center justify-between px-3 pb-1.5 ${
          enFoto ? "pt-10" : "pt-5"
        }`}
      >
        <p className="text-[13px] font-black text-slate-900">Declaraciones</p>
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white"
          style={{ background: NAVY }}
        >
          A
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-2.5 pb-2">
        <CierreCard paso={n} />
        <Pantalla paso={n} />
      </div>
      <div className="bg-white">
        <div className="grid h-[52px] grid-cols-5 items-start px-1">
          <Tab icon={<IconHome />} label="Inicio" />
          <Tab icon={<IconDocs on />} label="Declaraciones" on />
          <span className="relative flex justify-center">
            <span
              className="-mt-4 flex h-9 w-9 items-center justify-center rounded-full text-white"
              style={{ background: NAVY }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </span>
          <Tab icon={<IconCard />} label="Honorarios" />
          <Tab icon={<IconCfdi />} label="CFDI" />
        </div>
      </div>
    </div>
  );
}

export default function ProcesoPortalMockup({
  paso,
  enFoto = false,
}: {
  paso: number;
  enFoto?: boolean;
}) {
  const pantalla = <PantallaPortal paso={paso} enFoto={enFoto} />;
  if (enFoto) {
    return (
      <div className="relative h-full" aria-hidden>
        {pantalla}
        <div className="proceso-island">
          <span className="proceso-island-lente" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl ring-1 ring-white/20"
      aria-hidden
    >
      <div className="relative">
        <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[72px] -translate-x-1/2 rounded-full bg-black ring-1 ring-black/60">
          <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-700/70" />
        </div>
        <div className="overflow-hidden rounded-[2rem]">{pantalla}</div>
      </div>
    </div>
  );
}
