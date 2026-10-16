"use client";

import { useMemo, useState } from "react";
import { MESES_NOM, type Cliente } from "@/lib/clientes";
import {
  COLORES_EVENTO,
  type EventoFiscal,
} from "@/lib/portal/fechas-fiscales";
import { descargarIcs } from "@/lib/portal/ics";
import PortalCalendarioFiscal, {
  type MesActivoCalendario,
} from "@/components/portal/PortalCalendarioFiscal";
import {
  GroupedButton,
  GroupedSection,
  IconCal,
} from "@/components/portal/PortalGroupedList";

type Props = {
  cliente: Cliente;
  eventos: EventoFiscal[];
  hoy: Date;
};

function fmtDiaCorto(d: Date): string {
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function PortalInicioCalendario({
  cliente,
  eventos,
  hoy,
}: Props) {
  const [mesActivo, setMesActivo] = useState<MesActivoCalendario>(() => ({
    mes: hoy.getMonth(),
    anio: hoy.getFullYear(),
  }));
  const [popup, setPopup] = useState<{ dia: number; eventos: EventoFiscal[] } | null>(
    null
  );

  const proxima = eventos
    .filter((e) => e.fecha.getTime() >= hoy.getTime())
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())[0] ?? null;

  const proximos = useMemo(
    () =>
      eventos
        .filter((e) => e.fecha.getTime() >= hoy.getTime())
        .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
        .slice(0, 3),
    [eventos, hoy]
  );

  function abrirDia(dia: number, lista: EventoFiscal[]) {
    setPopup({ dia, eventos: lista });
  }

  function abrirEvento(e: EventoFiscal) {
    setMesActivo({ mes: e.fecha.getMonth(), anio: e.fecha.getFullYear() });
    const lista = eventos.filter(
      (x) =>
        x.fecha.getFullYear() === e.fecha.getFullYear() &&
        x.fecha.getMonth() === e.fecha.getMonth() &&
        x.fecha.getDate() === e.fecha.getDate()
    );
    setPopup({ dia: e.fecha.getDate(), eventos: lista });
  }

  const fechaPopup = popup
    ? new Date(mesActivo.anio, mesActivo.mes, popup.dia)
    : null;

  return (
    <GroupedSection label="Calendario">
      <div className="px-3 pt-3 pb-1">
        <PortalCalendarioFiscal
          eventos={eventos}
          hoy={hoy}
          embedded
          compacto
          showDetalleDia={false}
          showLeyenda={false}
          fechaProxima={proxima?.fecha ?? null}
          mesActivo={mesActivo}
          onMesActivoChange={(m) => {
            setMesActivo(m);
            setPopup(null);
          }}
          onDiaClick={abrirDia}
        />

        {popup && fechaPopup ? (
          <div className="mt-3 mb-2 rounded-2xl border border-slate-200 bg-white shadow-sm p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[15px] font-semibold text-slate-900 capitalize leading-snug">
                {fmtDiaCorto(fechaPopup)}
              </p>
              <button
                type="button"
                onClick={() => setPopup(null)}
                className="shrink-0 w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar"
              >
                <XIcon />
              </button>
            </div>
            {popup.eventos.length === 0 ? (
              <p className="mt-2 text-[13px] text-slate-500">
                Nada vence este día.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {popup.eventos.map((e, i) => {
                  const c = COLORES_EVENTO[e.tipo];
                  return (
                    <li
                      key={`${e.tipo}-${i}`}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${c.borde} ${c.fondoBadge}`}
                    >
                      <span className={`h-2 w-2 rounded-full shrink-0 ${c.dot}`} />
                      <span className={`text-[13px] font-semibold ${c.textoBadge}`}>
                        {e.etiqueta}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      {proximos.map((e) => (
        <GroupedButton
          key={`${e.tipo}-${e.fecha.toISOString()}`}
          onClick={() => abrirEvento(e)}
          icon={<IconCal />}
          iconClass="bg-[var(--portal-navy)]"
          title={e.etiqueta}
          subtitle={`${e.fecha.getDate()} de ${MESES_NOM[e.fecha.getMonth()].toLowerCase()}`}
        />
      ))}

      <GroupedButton
        onClick={() =>
          descargarIcs(
            eventos,
            "calendario-fiscal-rdc.ics",
            cliente.razonSocial
          )
        }
        icon={<IconCal />}
        iconClass="bg-slate-700"
        title="Agregar a mi celular"
        subtitle="Descarga las fechas a tu calendario"
      />
    </GroupedSection>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
