import type { PeriodoSyncCfdi } from "./fechas-sync";
import type { EstatusCfdi } from "./types";

export type XmlDescargadoSat = {
  nombre: string;
  xml: Buffer;
};

export type EstatusMetadataSat = {
  uuid: string;
  estatus: EstatusCfdi;
  fechaCancelacion?: string;
};

type TipoDescargaSat = "emitidos" | "recibidos";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cargarSat() {
  return import("@nodecfdi/sat-ws-descarga-masiva");
}

export async function crearServicioSat(params: {
  cer: Buffer;
  key: Buffer;
  contrasena: string;
}) {
  const sat = await cargarSat();
  const fiel = sat.Fiel.create(
    params.cer.toString("binary"),
    params.key.toString("binary"),
    params.contrasena
  );
  if (!fiel.isValid()) {
    throw new Error("La e.firma no es válida (vencida, CSD o contraseña incorrecta).");
  }
  const webClient = new sat.HttpsWebClient();
  const requestBuilder = new sat.FielRequestBuilder(fiel);
  return new sat.Service(requestBuilder, webClient);
}

async function esperarPaquetes(
  service: Awaited<ReturnType<typeof crearServicioSat>>,
  requestId: string,
  maxIntentos: number,
  esperaMs: number
): Promise<string[]> {
  for (let i = 0; i < maxIntentos; i++) {
    const verify = await service.verify(requestId);
    if (!verify.getStatus().isAccepted()) {
      throw new Error(
        verify.getStatus().getMessage() || "El SAT rechazó la verificación."
      );
    }
    const statusRequest = verify.getStatusRequest();
    if (statusRequest.isTypeOf("Finished")) {
      return [...verify.getPackageIds()];
    }
    if (
      statusRequest.isTypeOf("Expired") ||
      statusRequest.isTypeOf("Failure") ||
      statusRequest.isTypeOf("Rejected")
    ) {
      throw new Error("La solicitud al SAT expiró o fue rechazada.");
    }
    await sleep(esperaMs);
  }
  throw new Error("Tiempo de espera agotado: el SAT no terminó la solicitud.");
}

async function descargarXmlsPaquete(
  service: Awaited<ReturnType<typeof crearServicioSat>>,
  packageId: string
): Promise<XmlDescargadoSat[]> {
  const sat = await cargarSat();
  const download = await service.download(packageId);
  if (!download.getStatus().isAccepted()) {
    return [];
  }
  const zipBuf = Buffer.from(download.getPackageContent(), "base64");
  const reader = await sat.CfdiPackageReader.createFromContents(
    zipBuf.toString("latin1")
  );
  const xmls: XmlDescargadoSat[] = [];
  for await (const map of reader.cfdis()) {
    for (const [nombre, contenido] of map) {
      xmls.push({
        nombre,
        xml: Buffer.from(contenido, "utf8"),
      });
    }
  }
  return xmls;
}

function estatusDesdeMetadataRaw(raw: string | undefined): EstatusCfdi {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "0" || v === "cancelado" || v === "cancelled") return "cancelado";
  return "vigente";
}

async function descargarMetadataPaquete(
  service: Awaited<ReturnType<typeof crearServicioSat>>,
  packageId: string
): Promise<EstatusMetadataSat[]> {
  const sat = await cargarSat();
  const download = await service.download(packageId);
  if (!download.getStatus().isAccepted()) {
    return [];
  }
  const zipBuf = Buffer.from(download.getPackageContent(), "base64");
  const reader = await sat.MetadataPackageReader.createFromContents(
    zipBuf.toString("latin1")
  );
  const items: EstatusMetadataSat[] = [];
  for await (const item of reader.metadata()) {
    const data = item.all();
    const uuid = (data.uuid ?? item.get("uuid") ?? "").trim().toUpperCase();
    if (!uuid) continue;
    const fechaCancelacion = (
      data.fechaCancelacion ??
      item.get("fechaCancelacion") ??
      ""
    ).trim();
    items.push({
      uuid,
      estatus: estatusDesdeMetadataRaw(data.estatus ?? item.get("estatus")),
      fechaCancelacion: fechaCancelacion || undefined,
    });
  }
  return items;
}

async function solicitarPaquetes(
  service: Awaited<ReturnType<typeof crearServicioSat>>,
  periodo: PeriodoSyncCfdi,
  tipo: TipoDescargaSat,
  requestKind: "xml" | "metadata",
  reintentos: number
): Promise<string[]> {
  const sat = await cargarSat();
  let ultimoError = "Error desconocido al consultar el SAT.";

  for (let intento = 0; intento <= reintentos; intento++) {
    try {
      const downloadType =
        tipo === "emitidos"
          ? new sat.DownloadType("issued")
          : new sat.DownloadType("received");

      const request = sat.QueryParameters.create(
        sat.DateTimePeriod.createFromValues(periodo.inicio, periodo.fin)
      )
        .withDownloadType(downloadType)
        .withRequestType(new sat.RequestType(requestKind));

      const query = await service.query(request);
      if (!query.getStatus().isAccepted()) {
        throw new Error(
          query.getStatus().getMessage() || "El SAT no aceptó la solicitud."
        );
      }

      return await esperarPaquetes(service, query.getRequestId(), 24, 5000);
    } catch (e) {
      ultimoError = e instanceof Error ? e.message : ultimoError;
      if (intento < reintentos) await sleep(3000);
    }
  }

  throw new Error(ultimoError);
}

async function solicitarXmls(
  service: Awaited<ReturnType<typeof crearServicioSat>>,
  periodo: PeriodoSyncCfdi,
  tipo: TipoDescargaSat,
  reintentos: number
): Promise<XmlDescargadoSat[]> {
  const paquetes = await solicitarPaquetes(
    service,
    periodo,
    tipo,
    "xml",
    reintentos
  );
  const xmls: XmlDescargadoSat[] = [];
  for (const packageId of paquetes) {
    xmls.push(...(await descargarXmlsPaquete(service, packageId)));
  }
  return xmls;
}

async function solicitarMetadata(
  service: Awaited<ReturnType<typeof crearServicioSat>>,
  periodo: PeriodoSyncCfdi,
  tipo: TipoDescargaSat,
  reintentos: number
): Promise<EstatusMetadataSat[]> {
  const paquetes = await solicitarPaquetes(
    service,
    periodo,
    tipo,
    "metadata",
    reintentos
  );
  const items: EstatusMetadataSat[] = [];
  for (const packageId of paquetes) {
    items.push(...(await descargarMetadataPaquete(service, packageId)));
  }
  return items;
}

/** Descarga XML emitidos y recibidos del periodo indicado. */
export async function descargarCfdiPeriodoSat(params: {
  cer: Buffer;
  key: Buffer;
  contrasena: string;
  periodo: PeriodoSyncCfdi;
  reintentos?: number;
}): Promise<XmlDescargadoSat[]> {
  const service = await crearServicioSat(params);
  const reintentos = params.reintentos ?? 2;
  const emitidos = await solicitarXmls(
    service,
    params.periodo,
    "emitidos",
    reintentos
  );
  const recibidos = await solicitarXmls(
    service,
    params.periodo,
    "recibidos",
    reintentos
  );
  return [...emitidos, ...recibidos];
}

/**
 * Descarga metadata SAT del periodo (incluye estatus vigente/cancelado por UUID).
 * El XML no trae cancelación; esta es la fuente oficial.
 */
export async function descargarMetadataPeriodoSat(params: {
  cer: Buffer;
  key: Buffer;
  contrasena: string;
  periodo: PeriodoSyncCfdi;
  reintentos?: number;
}): Promise<EstatusMetadataSat[]> {
  const service = await crearServicioSat(params);
  const reintentos = params.reintentos ?? 2;
  const emitidos = await solicitarMetadata(
    service,
    params.periodo,
    "emitidos",
    reintentos
  );
  const recibidos = await solicitarMetadata(
    service,
    params.periodo,
    "recibidos",
    reintentos
  );
  const porUuid = new Map<string, EstatusMetadataSat>();
  for (const item of [...emitidos, ...recibidos]) {
    porUuid.set(item.uuid, item);
  }
  return [...porUuid.values()];
}
