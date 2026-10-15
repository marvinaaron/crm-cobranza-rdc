"use client";

import type { Cliente } from "@/lib/clientes";
import type { EventoFiscal } from "@/lib/portal/fechas-fiscales";
import { descargarIcs } from "@/lib/portal/ics";
import PortalCalendarioFiscal from "@/components/portal/PortalCalendarioFiscal";
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

export default function PortalInicioCalendario({
  cliente,
  eventos,
  hoy,
}: Props) {
  const proxima = eventos
    .filter((e) => e.fecha.getTime() >= hoy.getTime())
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())[0]?.fecha ?? null;

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
          fechaProxima={proxima}
        />
      </div>
      <GroupedButton
        onClick={() =>
          descargarIcs(
            eventos,
            "calendario-fiscal-rdc.ics",
            cliente.razonSocial
          )
        }
        icon={<IconCal />}
        iconClass="bg-[var(--portal-navy)]"
        title="Agregar a mi celular"
        subtitle="Descarga las fechas a tu calendario"
      />
    </GroupedSection>
  );
}
