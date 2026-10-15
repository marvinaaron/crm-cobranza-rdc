"use client";

import { useEffect, useState } from "react";
import { opinionUi } from "@/lib/sat/opinion-ui";
import type { OpinionPublicaEstado } from "@/lib/sat/types";
import { GroupedRow, IconSat } from "@/components/portal/PortalGroupedList";

type OpinionPayload = {
  estado: OpinionPublicaEstado;
};

type EstadoEfirma = {
  tieneEfirma: boolean;
  diasRestantes?: number;
  enVentanaAlerta?: boolean;
};

export default function PortalInicioSatFila() {
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState<OpinionPublicaEstado | undefined>();
  const [efirma, setEfirma] = useState<EstadoEfirma | null>(null);

  useEffect(() => {
    let vivo = true;
    void fetch("/api/portal/opinion-cumplimiento")
      .then((r) => r.json())
      .then((data: { opinion?: OpinionPayload }) => {
        if (vivo && data.opinion?.estado) setEstado(data.opinion.estado);
      })
      .catch(() => {})
      .finally(() => {
        if (vivo) setCargando(false);
      });
    void fetch("/api/portal/efirma-estado")
      .then((r) => r.json())
      .then((data: EstadoEfirma) => {
        if (vivo) setEfirma(data);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  const ui = opinionUi(estado);
  const efirmaAlerta = Boolean(efirma?.tieneEfirma && efirma.enVentanaAlerta);
  const dias = efirma?.diasRestantes ?? 0;

  const iconClass =
    ui.tono === "ok"
      ? "bg-emerald-500"
      : ui.tono === "bad"
        ? "bg-red-500"
        : ui.tono === "warn"
          ? "bg-amber-500"
          : "bg-slate-400";

  const subtitle = cargando
    ? "Consultando 32-D…"
    : efirmaAlerta
      ? `${ui.etiqueta} · e.firma en ${dias} día${dias === 1 ? "" : "s"}`
      : ui.etiqueta;

  return (
    <GroupedRow
      href="/portal/sat"
      icon={<IconSat />}
      iconClass={iconClass}
      title="SAT"
      subtitle={subtitle}
    />
  );
}
