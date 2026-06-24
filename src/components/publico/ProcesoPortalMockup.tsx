/** Mini mockups del portal — uno por paso del flujo de cumplimiento. */

import type { ReactNode } from "react";

function Chrome({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/90">
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="ml-2 truncate text-[9px] font-semibold tracking-wide text-slate-400">
          rdcontadores.com/portal
        </span>
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{titulo}</p>
        {children}
      </div>
    </div>
  );
}

function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${className}`}
    >
      {children}
    </span>
  );
}

function MockPorTrabajar() {
  return (
    <Chrome titulo="Cumplimiento · Mayo 2026">
      <p className="mt-1 text-base font-black text-slate-900">Documentos del mes</p>
      <div className="mt-4 space-y-2">
        {[
          { doc: "CFDIs de ingresos", ok: true },
          { doc: "CFDIs de gastos", ok: true },
          { doc: "Estados de cuenta", ok: false },
          { doc: "Nómina del periodo", ok: false },
        ].map((r) => (
          <div key={r.doc} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
            <span className="text-xs font-semibold text-slate-700">{r.doc}</span>
            <Badge className={r.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
              {r.ok ? "Recibido" : "Pendiente"}
            </Badge>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 p-3 text-center">
        <p className="text-[10px] font-bold text-indigo-600">Arrastra archivos o sube desde aquí</p>
      </div>
    </Chrome>
  );
}

function MockIniciando() {
  return (
    <Chrome titulo="Cumplimiento · Mayo 2026">
      <div className="mt-2 flex items-center gap-3">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <span className="absolute h-8 w-8 animate-ping rounded-xl bg-blue-200 opacity-40" />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="relative text-blue-600">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-black text-slate-900">Contabilidad en curso</p>
          <p className="text-[11px] text-slate-500">Clasificando movimientos…</p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {["Ingresos", "Deducciones", "Cálculo ISR"].map((t, i) => (
          <div key={t} className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                style={{ width: `${[100, 65, 30][i]}%` }}
              />
            </div>
            <span className="w-16 text-[10px] font-bold text-slate-500">{t}</span>
          </div>
        ))}
      </div>
    </Chrome>
  );
}

function MockPreliminar() {
  return (
    <Chrome titulo="Previo de impuestos">
      <p className="mt-1 text-base font-black text-slate-900">Mayo 2026 · Borrador</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">ISR</p>
          <p className="mt-1 text-lg font-black tabular-nums text-slate-900">$4,280</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">IVA</p>
          <p className="mt-1 text-lg font-black tabular-nums text-slate-900">$1,920</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Revisa antes de declarar</p>
        <p className="mt-1 text-xs text-amber-900/80">Valida montos y avísanos si algo no cuadra.</p>
      </div>
    </Chrome>
  );
}

function MockAceptacion() {
  return (
    <Chrome titulo="Confirmación del previo">
      <div className="mt-3 flex flex-col items-center py-2 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </span>
        <p className="mt-3 text-sm font-black text-slate-900">Previo aceptado</p>
        <p className="mt-1 text-xs text-slate-500">Generando declaraciones definitivas…</p>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" className="flex-1 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white">
          Aceptado ✓
        </button>
        <button type="button" className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-400 line-through">
          Rechazar
        </button>
      </div>
    </Chrome>
  );
}

function MockDeclaraciones() {
  return (
    <Chrome titulo="Declaraciones · Mayo 2026">
      <p className="mt-1 text-base font-black text-emerald-700">Presentadas</p>
      <div className="mt-4 space-y-2">
        {[
          { doc: "Acuse ISR", tipo: "PDF" },
          { doc: "Acuse IVA", tipo: "PDF" },
          { doc: "Línea de captura", tipo: "SAT" },
        ].map((r) => (
          <div key={r.doc} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-slate-800">{r.doc}</span>
            </div>
            <Badge className="bg-indigo-100 text-indigo-700">{r.tipo}</Badge>
          </div>
        ))}
      </div>
    </Chrome>
  );
}

function MockPago() {
  return (
    <Chrome titulo="Comprobante de pago">
      <p className="mt-1 text-base font-black text-slate-900">ISR + IVA · Mayo 2026</p>
      <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-600">Total: $6,200.00</p>
      <div className="mt-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 p-5 text-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-emerald-600" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="mt-2 text-xs font-bold text-emerald-700">Sube tu comprobante</p>
        <p className="mt-0.5 text-[10px] text-emerald-600/80">PDF o imagen · máx. 5 MB</p>
      </div>
    </Chrome>
  );
}

function MockCompletado() {
  return (
    <Chrome titulo="Mayo 2026">
      <div className="mt-2 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-black text-emerald-700">Periodo completado</p>
          <p className="text-[11px] text-slate-500">Todo archivado en tu portal</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {["Acuses", "Pagos", "Historial"].map((t) => (
          <div key={t} className="rounded-lg bg-emerald-50 py-2 text-center ring-1 ring-emerald-100">
            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">{t}</p>
            <p className="text-[10px] font-black text-emerald-600">✓</p>
          </div>
        ))}
      </div>
    </Chrome>
  );
}

const MOCKUPS = [
  MockPorTrabajar,
  MockIniciando,
  MockPreliminar,
  MockAceptacion,
  MockDeclaraciones,
  MockPago,
  MockCompletado,
] as const;

export default function ProcesoPortalMockup({ paso }: { paso: number }) {
  const idx = Math.min(Math.max(paso, 1), 7) - 1;

  return (
    <div className="relative min-h-[320px] sm:min-h-[340px]">
      {MOCKUPS.map((M, i) => (
        <div
          key={i}
          aria-hidden={paso !== i + 1}
          className={`transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            idx === i
              ? "relative z-10 opacity-100 translate-y-0 scale-100"
              : "pointer-events-none absolute inset-x-0 top-0 opacity-0 translate-y-5 scale-[0.98]"
          }`}
        >
          <M />
        </div>
      ))}
    </div>
  );
}
