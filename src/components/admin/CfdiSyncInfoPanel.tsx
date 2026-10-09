"use client";

import { CFDI_SYNC_RESUMEN } from "@/lib/cfdi/sync-config";

/** Aviso: carga manual + metadata de cancelados (sin sync automática SAT). */
export default function CfdiSyncInfoPanel() {
  return (
    <section className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 sm:px-5 sm:py-4">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-800">
        Carga manual · Sync automática desactivada
      </p>
      <p className="text-xs text-amber-950/90 mt-1 leading-relaxed">
        El SAT limita las solicitudes de Descarga Masiva de por vida por e.firma. Por eso ya
        no bajamos CFDI en automático. Sube carpetas o XML desde el portal del SAT, e incluye
        el archivo de <strong>metadata</strong> para marcar cancelados.
      </p>
      <ul className="mt-3 space-y-2">
        {CFDI_SYNC_RESUMEN.map((item) => (
          <li key={item.modo} className="text-[11px] text-amber-950/85">
            <span className="font-black">{item.frecuenciaHumana}</span>
            {" — "}
            <span className="font-medium">{item.descripcion}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
