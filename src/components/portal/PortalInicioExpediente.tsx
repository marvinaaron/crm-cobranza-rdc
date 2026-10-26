"use client";

import { useEffect, useState } from "react";
import {
  GroupedRow,
  GroupedSection,
  IconDoc,
} from "@/components/portal/PortalGroupedList";

type DocMeta = { nombreArchivo: string; subidoEn: string } | null;

type ResumenSat = {
  documentos?: {
    constancia?: DocMeta;
    opinion?: DocMeta;
  };
};

function fmtCorta(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PortalInicioExpediente() {
  const [resumen, setResumen] = useState<ResumenSat | null>(null);

  useEffect(() => {
    let vivo = true;
    void fetch("/api/portal/sat/resumen")
      .then((r) => r.json())
      .then((data: ResumenSat) => {
        if (vivo) setResumen(data);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  const constancia = resumen?.documentos?.constancia ?? null;
  const opinion = resumen?.documentos?.opinion ?? null;

  return (
    <GroupedSection label="Expediente">
      <GroupedRow
        href="/portal/sat"
        icon={<IconDoc />}
        iconClass={constancia ? "bg-[var(--portal-navy)]" : "bg-slate-300"}
        title="Constancia de situación fiscal"
        subtitle={
          constancia
            ? `Subida ${fmtCorta(constancia.subidoEn)}`
            : "La publica tu contador"
        }
      />
      <GroupedRow
        href="/portal/sat"
        icon={<IconDoc />}
        iconClass={opinion ? "bg-[var(--portal-navy)]" : "bg-slate-300"}
        title="Opinión de cumplimiento"
        subtitle={
          opinion
            ? `Subida ${fmtCorta(opinion.subidoEn)}`
            : "La publica tu contador"
        }
      />
    </GroupedSection>
  );
}
