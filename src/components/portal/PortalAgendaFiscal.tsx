"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EventoFiscal } from "@/lib/portal/fechas-fiscales";
import { descargarIcs } from "@/lib/portal/ics";
import {
  COLORES_EVENTO,
  proximosVencimientosDesde,
} from "@/lib/portal/agenda-fiscal";
import PortalCalendarioFiscal, {
  type MesActivoCalendario,
} from "@/components/portal/PortalCalendarioFiscal";

type Props = {
  eventos: EventoFiscal[];
  hoy: Date;
  nombreCliente?: string;
};

type VistaAgenda = "agenda" | "calendario";

export default function PortalAgendaFiscal({
  eventos,
  hoy,
  nombreCliente,
}: Props) {
  const [vista, setVista] = useState<VistaAgenda>("agenda");
  const [mesActivo, setMesActivo] = useState<MesActivoCalendario>(() => ({
    mes: hoy.getMonth(),
    anio: hoy.getFullYear(),
  }));
  const [diaSel, setDiaSel] = useState(hoy.getDate());

  const vencimientos = useMemo(
    () => proximosVencimientosDesde(eventos, hoy),
    [eventos, hoy]
  );

  const fechaProxima = useMemo(() => {
    const futuro = vencimientos.find((v) => v.tono !== "bad");
    return futuro?.fecha ?? vencimientos[0]?.fecha ?? null;
  }, [vencimientos]);

  const enfocarFecha = (fecha: Date) => {
    setMesActivo({ mes: fecha.getMonth(), anio: fecha.getFullYear() });
    setDiaSel(fecha.getDate());
    setVista("calendario");
  };

  const handleExportar = () => {
    if (eventos.length === 0) return;
    descargarIcs(eventos, "calendario-fiscal-rdc.ics", nombreCliente);
  };

  return (
    <div className="rdc-card bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Tu agenda fiscal
          </p>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">
            {vista === "agenda"
              ? "Próximos vencimientos"
              : "Calendario del mes"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportar}
          disabled={eventos.length === 0}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[var(--portal-navy)] bg-[var(--portal-navy-soft)] hover:bg-[var(--portal-navy-muted)] disabled:opacity-40 text-[10px] font-black uppercase tracking-widest shrink-0"
          aria-label="Agregar al calendario de tu teléfono"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
            <path d="M12 14v6" />
            <path d="m9 17 3 3 3-3" />
          </svg>
          <span className="hidden sm:inline">Agregar a mi calendario</span>
          <span className="sm:hidden">.ics</span>
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Vista de agenda fiscal"
        className="inline-flex w-full sm:w-auto rounded-full bg-slate-100 p-0.5 mb-4"
      >
        {(
          [
            { id: "agenda" as const, label: "Agenda" },
            { id: "calendario" as const, label: "Calendario" },
          ] as const
        ).map((tab) => {
          const activo = vista === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => setVista(tab.id)}
              className={`flex-1 sm:flex-none sm:min-w-[7.5rem] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                activo
                  ? "bg-white text-[var(--portal-navy)] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {vista === "agenda" ? (
        vencimientos.length === 0 ? (
          <p className="text-sm font-bold text-slate-500">
            No hay vencimientos próximos en tu calendario.
          </p>
        ) : (
          <ul className="space-y-2">
            {vencimientos.map((v, i) => {
              const c = COLORES_EVENTO[v.tipo];
              return (
                <li
                  key={`${v.tipo}-${i}`}
                  className={`flex items-stretch gap-0 rounded-xl border overflow-hidden ${c.borde} ${c.fondoBadge}`}
                >
                  <button
                    type="button"
                    onClick={() => enfocarFecha(v.fecha)}
                    className="flex-1 min-w-0 flex items-center gap-3 py-2.5 pl-3 pr-2 text-left hover:brightness-[0.98] transition"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] font-black ${c.textoBadge} truncate`}>
                        {v.titulo}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5 truncate">
                        {v.accion}
                      </p>
                    </div>
                    <p
                      className={`text-[10px] font-black uppercase tracking-wide shrink-0 ${
                        v.tono === "bad"
                          ? "text-red-600"
                          : v.tono === "warn"
                            ? "text-amber-600"
                            : "text-slate-500"
                      }`}
                    >
                      {v.fechaLabel}
                    </p>
                  </button>
                  <Link
                    href={v.href}
                    className={`shrink-0 flex items-center justify-center px-3 border-l ${c.borde} bg-white/50 hover:bg-white/80 text-[var(--portal-navy)] transition`}
                    aria-label={`Ir a ${v.titulo}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <PortalCalendarioFiscal
          embedded
          eventos={eventos}
          hoy={hoy}
          mesActivo={mesActivo}
          onMesActivoChange={setMesActivo}
          diaSel={diaSel}
          onDiaSelChange={setDiaSel}
          fechaProxima={fechaProxima}
          showDetalleDia
          showLeyenda
          compacto={false}
        />
      )}
    </div>
  );
}
