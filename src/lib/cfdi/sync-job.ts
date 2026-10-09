import {
  contrasenaFielPorRfc,
  leerFilasContrasenas,
} from "@/lib/accesos/contrasenas-db";
import { leerCrmEstadoCompleto } from "@/lib/supabase/crm-estado-db";
import { normalizarRfc } from "@/lib/cfdi/parser";
import { ingestarCfdiXml } from "@/lib/cfdi/ingesta";
import { actualizarEstatusCfdiDesdeMetadata } from "@/lib/cfdi/db";
import {
  descargarCfdiPeriodoSat,
  descargarMetadataPeriodoSat,
} from "@/lib/cfdi/sat-descarga";
import { periodoSemanaAnteriorCdmx } from "@/lib/cfdi/fechas-sync";
import {
  guardarRegistroSyncCliente,
  marcarUltimaCorridaSync,
  type RegistroSyncCliente,
} from "@/lib/cfdi/sync-estado";
import {
  CFDI_SYNC_LOTE_CLIENTES,
  CFDI_SYNC_REINTENTOS,
} from "@/lib/cfdi/sync-config";
import { descargarArchivosEfirma, listarEfirmas } from "@/lib/efirma/db";
import { estadoVigenciaEfirma } from "@/lib/efirma/vigencia";
import type { RegistroEfirma } from "@/lib/efirma/types";

export type ResultadoSyncCliente = RegistroSyncCliente;

export type ResultadoLoteSync = {
  offset: number;
  procesados: number;
  resultados: ResultadoSyncCliente[];
  pendientes: number;
  total: number;
};

function rfcCliente(
  efirma: RegistroEfirma,
  porId: Map<number, string>
): string | null {
  const delCrm = porId.get(efirma.clienteId);
  if (delCrm) return delCrm;
  const delCer = efirma.rfcCertificado?.trim();
  return delCer ? normalizarRfc(delCer) : null;
}

async function sincronizarUnCliente(params: {
  efirma: RegistroEfirma;
  rfc: string;
  contrasenaFiel: string;
}): Promise<ResultadoSyncCliente> {
  const periodo = periodoSemanaAnteriorCdmx();
  const base: ResultadoSyncCliente = {
    clienteId: params.efirma.clienteId,
    ultimaSyncAt: null,
    periodoInicio: periodo.inicioIso,
    periodoFin: periodo.finIso,
    estado: "omitido",
    mensaje: "",
    ingresados: 0,
    errores: 0,
  };

  if (estadoVigenciaEfirma(params.efirma.vigenciaFin) === "vencida") {
    return {
      ...base,
      mensaje: "e.firma vencida — omitido.",
    };
  }

  const archivos = await descargarArchivosEfirma(params.efirma.clienteId);
  if (!archivos) {
    return {
      ...base,
      mensaje: "Falta .cer o .key en storage — omitido.",
    };
  }

  try {
    const syncParams = {
      cer: archivos.cer,
      key: archivos.key,
      contrasena: params.contrasenaFiel,
      periodo,
      reintentos: CFDI_SYNC_REINTENTOS,
    };

    const xmls = await descargarCfdiPeriodoSat(syncParams);

    let ingresados = 0;
    let errores = 0;

    for (const item of xmls) {
      const res = await ingestarCfdiXml({
        clienteId: params.efirma.clienteId,
        rfcCliente: params.rfc,
        xml: item.xml,
        nombreArchivo: item.nombre.endsWith(".xml")
          ? item.nombre
          : `${item.nombre}.xml`,
      });
      if (res.ok) ingresados++;
      else errores++;
    }

    let metaMsg = "";
    try {
      const metadata = await descargarMetadataPeriodoSat(syncParams);
      const { actualizados, cancelados } = await actualizarEstatusCfdiDesdeMetadata(
        params.efirma.clienteId,
        metadata
      );
      metaMsg =
        actualizados > 0
          ? ` Metadata: ${actualizados} estatus (${cancelados} cancelados).`
          : metadata.length === 0
            ? ""
            : " Metadata sin coincidencias en BD.";
    } catch (eMeta) {
      metaMsg = ` Metadata no aplicada: ${
        eMeta instanceof Error ? eMeta.message : "error"
      }.`;
    }

    const registro: ResultadoSyncCliente = {
      ...base,
      ultimaSyncAt: new Date().toISOString(),
      estado: errores > 0 && ingresados === 0 ? "error" : "ok",
      mensaje:
        xmls.length === 0
          ? `Sin CFDI nuevos en la semana anterior.${metaMsg}`
          : `${ingresados} XML ingestados${errores ? `, ${errores} con error` : ""}.${metaMsg}`,
      ingresados,
      errores,
    };
    await guardarRegistroSyncCliente(registro);
    return registro;
  } catch (e) {
    const registro: ResultadoSyncCliente = {
      ...base,
      estado: "error",
      mensaje: e instanceof Error ? e.message : "Error al sincronizar con el SAT.",
    };
    await guardarRegistroSyncCliente(registro);
    return registro;
  }
}

/** Procesa un lote de clientes con e.firma (para cron semanal). */
export async function ejecutarLoteSyncCfdi(
  offset = 0
): Promise<ResultadoLoteSync> {
  const [efirmas, filasContrasenas, crm] = await Promise.all([
    listarEfirmas(),
    leerFilasContrasenas(),
    leerCrmEstadoCompleto(),
  ]);

  const porId = new Map<number, string>();
  for (const c of crm.clientes) {
    const rfc = normalizarRfc(c.rfc ?? "");
    if (rfc) porId.set(c.id, rfc);
  }

  const elegibles = efirmas.filter((e) => e.tieneKey);
  const total = elegibles.length;
  const lote = elegibles.slice(offset, offset + CFDI_SYNC_LOTE_CLIENTES);
  const resultados: ResultadoSyncCliente[] = [];

  for (const efirma of lote) {
    const rfc = rfcCliente(efirma, porId);
    if (!rfc) {
      const registro: ResultadoSyncCliente = {
        clienteId: efirma.clienteId,
        ultimaSyncAt: null,
        periodoInicio: null,
        periodoFin: null,
        estado: "omitido",
        mensaje: "RFC no encontrado en catálogo — omitido.",
        ingresados: 0,
        errores: 0,
      };
      await guardarRegistroSyncCliente(registro);
      resultados.push(registro);
      continue;
    }

    const contrasena = contrasenaFielPorRfc(filasContrasenas, rfc);
    if (!contrasena) {
      const registro: ResultadoSyncCliente = {
        clienteId: efirma.clienteId,
        ultimaSyncAt: null,
        periodoInicio: null,
        periodoFin: null,
        estado: "omitido",
        mensaje: "Sin contraseña FIEL en Accesos — omitido.",
        ingresados: 0,
        errores: 0,
      };
      await guardarRegistroSyncCliente(registro);
      resultados.push(registro);
      continue;
    }

    resultados.push(
      await sincronizarUnCliente({ efirma, rfc, contrasenaFiel: contrasena })
    );
  }

  const siguienteOffset = offset + lote.length;
  const pendientes = Math.max(0, total - siguienteOffset);

  if (pendientes === 0) {
    await marcarUltimaCorridaSync();
  }

  return {
    offset,
    procesados: lote.length,
    resultados,
    pendientes,
    total,
  };
}

export function urlContinuacionSyncCfdi(offset: number): string {
  const base =
    process.env.NEXT_PUBLIC_DESPACHO_SITIO?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!base) {
    throw new Error("No hay URL base para continuar el lote de sync CFDI.");
  }
  const url = new URL("/api/cron/cfdi-sync", base);
  url.searchParams.set("offset", String(offset));
  return url.toString();
}
