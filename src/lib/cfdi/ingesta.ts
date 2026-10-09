import { clasificarTipoCfdi, parsearCfdiXml, rfcParticipaEnCfdi } from "./parser";
import { clasificarCategoriaVisor } from "./categorias-visor";
import { insertarOActualizarCfdi } from "./db";
import { subirXmlCfdi } from "./storage";
import type { CfdiRegistro } from "./types";

export type ResultadoIngestaCfdi =
  | { ok: true; registro: CfdiRegistro; duplicado: boolean }
  | { ok: false; error: string };

/**
 * Parsea un XML, lo guarda en storage y registra metadata en Postgres.
 * Usado por ingesta admin y (fase B) descarga masiva SAT.
 */
export async function ingestarCfdiXml(params: {
  clienteId: number;
  rfcCliente: string;
  xml: string | Buffer;
  nombreArchivo?: string;
  /** Si viene de metadata SAT, tiene prioridad sobre el XML. */
  estatusOverride?: "vigente" | "cancelado";
}): Promise<ResultadoIngestaCfdi> {
  try {
    const buffer = Buffer.isBuffer(params.xml)
      ? params.xml
      : Buffer.from(params.xml, "utf8");
    const parseado = parsearCfdiXml(buffer.toString("utf8"));

    if (
      !rfcParticipaEnCfdi(
        params.rfcCliente,
        parseado.rfcEmisor,
        parseado.rfcReceptor
      )
    ) {
      return {
        ok: false,
        error: `El RFC del XML no corresponde al cliente (${params.rfcCliente.trim().toUpperCase()}). Emisor: ${parseado.rfcEmisor}, Receptor: ${parseado.rfcReceptor}.`,
      };
    }

    const tipo = clasificarTipoCfdi(
      params.rfcCliente,
      parseado.rfcEmisor,
      parseado.rfcReceptor
    );
    const categoriaVisor = clasificarCategoriaVisor({
      tipo,
      tipoComprobante: parseado.tipoComprobante,
      conceptoResumen: parseado.conceptoResumen,
      metadata: parseado.metadata,
    });

    const { path, tamanoBytes } = await subirXmlCfdi({
      clienteId: params.clienteId,
      uuid: parseado.uuid,
      buffer,
      nombreArchivo: params.nombreArchivo,
    });

    const registro = await insertarOActualizarCfdi({
      clienteId: params.clienteId,
      uuidSat: parseado.uuid,
      tipo,
      tipoComprobante: parseado.tipoComprobante,
      rfcEmisor: parseado.rfcEmisor,
      nombreEmisor: parseado.nombreEmisor,
      rfcReceptor: parseado.rfcReceptor,
      nombreReceptor: parseado.nombreReceptor,
      fecha: parseado.fecha,
      mes: parseado.mes,
      anio: parseado.anio,
      subtotal: parseado.subtotal,
      total: parseado.total,
      moneda: parseado.moneda,
      conceptoResumen: parseado.conceptoResumen,
      estatus: params.estatusOverride ?? parseado.estatus,
      categoriaVisor,
      xmlPath: path,
      nombreArchivo: params.nombreArchivo ?? `${parseado.uuid}.xml`,
      tamanoBytes,
      metadata: parseado.metadata,
    });

    return { ok: true, registro, duplicado: false };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Error al ingestar CFDI.",
    };
  }
}
