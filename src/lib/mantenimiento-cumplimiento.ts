import {
  leerCrmEstadoCompleto,
  guardarCrmEstadoCompleto,
} from "@/lib/supabase/crm-estado-db";
import { crearBackup } from "@/lib/supabase/backups";
import {
  aligerarCumplimientoAntiguo,
  aligerarFacturasAntiguo,
  RETENCION_PDF_CUMPLIMIENTO_MESES,
  RETENCION_FACTURAS_HONORARIOS_MESES,
} from "@/lib/mantenimiento";

export type ResultadoRetencionArchivos = {
  cumplimiento: {
    aligerados: number;
    bytesAntes: number;
    bytesDespues: number;
    liberados: number;
    mesesConservar: number;
  };
  facturas: {
    aligeradas: number;
    mesesConservar: number;
  };
};

/** Purga PDFs vencidos de cumplimiento (3m) y facturas de honorarios (12m). */
export async function ejecutarRetencionArchivos(
  opts?: { respaldarAntes?: boolean }
): Promise<ResultadoRetencionArchivos> {
  const estado = await leerCrmEstadoCompleto();
  const bytesAntes = Buffer.byteLength(JSON.stringify(estado.cumplimiento), "utf8");

  const { cumplimiento, aligerados } = aligerarCumplimientoAntiguo(
    estado.cumplimiento,
    RETENCION_PDF_CUMPLIMIENTO_MESES
  );
  const bytesDespues = Buffer.byteLength(JSON.stringify(cumplimiento), "utf8");

  const { facturas, aligeradas } = aligerarFacturasAntiguo(
    estado.facturas,
    RETENCION_FACTURAS_HONORARIOS_MESES
  );

  if (aligerados > 0 || aligeradas > 0) {
    if (opts?.respaldarAntes !== false) {
      await crearBackup("auto");
    }
    estado.cumplimiento = cumplimiento;
    estado.facturas = facturas;
    await guardarCrmEstadoCompleto(estado);
  }

  return {
    cumplimiento: {
      aligerados,
      bytesAntes,
      bytesDespues,
      liberados: Math.max(0, bytesAntes - bytesDespues),
      mesesConservar: RETENCION_PDF_CUMPLIMIENTO_MESES,
    },
    facturas: {
      aligeradas,
      mesesConservar: RETENCION_FACTURAS_HONORARIOS_MESES,
    },
  };
}

/** @deprecated Usa ejecutarRetencionArchivos */
export async function ejecutarRetencionCumplimiento(
  mesesConservar: number = RETENCION_PDF_CUMPLIMIENTO_MESES,
  opts?: { respaldarAntes?: boolean }
) {
  const r = await ejecutarRetencionArchivos(opts);
  return {
    ...r.cumplimiento,
    mesesConservar,
  };
}
