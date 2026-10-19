"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { type Cliente } from "@/lib/clientes";
import { type EventoFiscal } from "@/lib/portal/fechas-fiscales";
import { hrefDeclaraciones } from "@/lib/portal/href-declaraciones";
import { descargarIcs } from "@/lib/portal/ics";
import PortalCalendarioFiscal, {
  type MesActivoCalendario,
} from "@/components/portal/PortalCalendarioFiscal";
import PortalGloboInfo from "@/components/portal/PortalGloboInfo";
import {
  GroupedButton,
  GroupedSection,
  IconCal,
} from "@/components/portal/PortalGroupedList";

type Props = {
  cliente: Cliente;
  eventos: EventoFiscal[];
  hoy: Date;
  mesInicial?: MesActivoCalendario;
};

function fmtDiaCorto(d: Date): string {
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

type GloboDia = {
  dia: number;
  eventos: EventoFiscal[];
  anchor: HTMLButtonElement;
};

export default function PortalInicioCalendario({
  cliente,
  eventos,
  hoy,
  mesInicial,
}: Props) {
  const [mesActivo, setMesActivo] = useState<MesActivoCalendario>(() =>
    mesInicial ?? {
      mes: hoy.getMonth(),
      anio: hoy.getFullYear(),
    }
  );
  const mesInicialAplicado = useRef(false);
  useEffect(() => {
    if (mesInicialAplicado.current || !mesInicial) return;
    mesInicialAplicado.current = true;
    setMesActivo(mesInicial);
  }, [mesInicial]);
  const [globo, setGlobo] = useState<GloboDia | null>(null);

  const proxima = eventos
    .filter((e) => e.fecha.getTime() >= hoy.getTime())
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())[0] ?? null;

  function abrirDia(
    dia: number,
    lista: EventoFiscal[],
    el: HTMLButtonElement
  ) {
    setGlobo((cur) =>
      cur && cur.dia === dia && cur.anchor === el
        ? null
        : { dia, eventos: lista, anchor: el }
    );
  }

  const fechaGlobo = globo
    ? new Date(mesActivo.anio, mesActivo.mes, globo.dia)
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
            setGlobo(null);
          }}
          onDiaClick={abrirDia}
        />
      </div>

      {globo && fechaGlobo ? (
        <PortalGloboInfo
          anchor={globo.anchor}
          title={fmtDiaCorto(fechaGlobo).replace(/^\w/, (c) => c.toUpperCase())}
          onClose={() => setGlobo(null)}
        >
          {globo.eventos.length === 0 ? (
            <p>Nada vence este día.</p>
          ) : (
            <ul className="space-y-1.5">
              {globo.eventos.map((e, i) => (
                <li key={`${e.tipo}-${i}`}>
                  {e.tipo === "sat" || e.tipo === "imss" || e.tipo === "estatal" ? (
                    <Link
                      href={hrefDeclaraciones(e.periodo)}
                      className="font-semibold text-[var(--portal-navy)]"
                    >
                      {e.etiqueta}
                    </Link>
                  ) : (
                    e.etiqueta
                  )}
                </li>
              ))}
            </ul>
          )}
        </PortalGloboInfo>
      ) : null}

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
