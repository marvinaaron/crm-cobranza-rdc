"use client";

import { CFDI_SYNC_RESUMEN, cfdiSyncAutomaticaActiva } from "@/lib/cfdi/sync-config";

export default function CfdiSyncInfoPanel() {
  const activa = cfdiSyncAutomaticaActiva();

  return (
    <section className="rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 sm:px-5 sm:py-4">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-700">
        Sincronización automática SAT ·{" "}
        {activa ? "Activa (lunes)" : "Programada julio 2026"}
      </p>
      <p className="text-xs text-sky-900/90 mt-1 leading-relaxed">
        {activa
          ? "Cada lunes se descargan los CFDI de la semana anterior para clientes con e.firma. Si alguien lo necesita antes, usa Carga XML."
          : "A partir de julio 2026 el SAT se consultará cada lunes (clientes con e.firma). Mientras tanto, carga manual."}
      </p>
      <ul className="mt-3 space-y-2">
        {CFDI_SYNC_RESUMEN.map((item) => (
          <li key={item.modo} className="text-[11px] text-sky-950/85">
            <span className="font-black">{item.frecuenciaHumana}</span>
            {" — "}
            <span className="font-medium">{item.descripcion}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
