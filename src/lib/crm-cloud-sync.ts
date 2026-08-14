import type { Cliente } from "@/lib/clientes";
import {
  ID_INGRESOS_DIVERSOS,
  asegurarClienteIngresosDiversos,
} from "@/lib/clientes";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { ComprobantePago } from "@/lib/comprobantes";
import type { FacturaPago } from "@/lib/facturas";
import type { RegistroCumplimiento } from "@/lib/cumplimiento";
import {
  aligerarPdfsRegistro,
  mapearPdfsEnRegistro,
  mapearPdfsEnRegistroAsync,
} from "@/lib/cumplimiento-categorias";
import {
  esDataUrlEmpotrado,
  subirDataUrlAStorage,
} from "@/lib/pdf-crm-cliente";
import type { PagoImpuestoHistorial } from "@/lib/historial-impuestos";
import type { Notificacion } from "@/lib/notificaciones";
import type { RegistroRepse } from "@/lib/repse";
import type { Encargo } from "@/lib/encargos";
import type { MarcaRecordatorio, ScriptCorreo } from "@/lib/recordatorios";
import type {
  Presupuesto,
  ServicioCatalogo,
  PrecioRegimen,
} from "@/lib/presupuestos";

export type CrmCloudPayload = {
  clientes: Cliente[];
  comprobantes: ComprobantePago[];
  facturas: FacturaPago[];
  cumplimiento: RegistroCumplimiento[];
  historialImpuestos: PagoImpuestoHistorial[];
  notificaciones: Notificacion[];
  repse: RegistroRepse[];
  encargos: Encargo[];
  recordatorioLog: MarcaRecordatorio[];
  scriptsCorreo: ScriptCorreo[];
  presupuestos: Presupuesto[];
  catalogoServicios: ServicioCatalogo[];
  preciosRegimen: PrecioRegimen[];
};

export function esRutaPortal(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/portal");
}

export function paginaEnSegundoPlano(): boolean {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

/** Safari/iOS aborta el fetch al ir a segundo plano; el mensaje suele ser "Fetch is aborted". */
export function esAbortoFetch(e: unknown): boolean {
  if (typeof DOMException !== "undefined" && e instanceof DOMException) {
    if (e.name === "AbortError" || e.name === "TimeoutError") return true;
  }
  if (e instanceof Error) {
    if (e.name === "AbortError" || e.name === "TimeoutError") return true;
    const m = e.message.toLowerCase();
    if (m.includes("aborted") || m.includes("abort")) return true;
  }
  return false;
}

export async function cargarCrmDesdeNube(opts?: {
  timeoutMs?: number;
}): Promise<CrmCloudPayload> {
  const portal = esRutaPortal();
  const url = portal ? "/api/portal/datos" : "/api/admin/crm-estado";
  const timeoutMs = opts?.timeoutMs ?? 90_000;
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "No se pudieron cargar los datos del CRM.");
  }

  if (portal) {
    const cliente = data.cliente as Cliente | null;
    return {
      clientes: cliente ? asegurarClienteIngresosDiversos([cliente]) : [],
      comprobantes: data.comprobantes ?? [],
      facturas: data.facturas ?? [],
      cumplimiento: data.cumplimiento ?? [],
      historialImpuestos: data.historialImpuestos ?? [],
      notificaciones: data.notificaciones ?? [],
      repse: data.repse ?? [],
      encargos: data.encargos ?? [],
      recordatorioLog: [],
      scriptsCorreo: [],
      presupuestos: [],
      catalogoServicios: [],
      preciosRegimen: [],
    };
  }

  return {
    clientes: asegurarClienteIngresosDiversos(data.clientes ?? []),
    comprobantes: data.comprobantes ?? [],
    facturas: data.facturas ?? [],
    cumplimiento: data.cumplimiento ?? [],
    historialImpuestos: data.historialImpuestos ?? [],
    notificaciones: data.notificaciones ?? [],
    repse: data.repse ?? [],
    encargos: data.encargos ?? [],
    recordatorioLog: data.recordatorioLog ?? [],
    scriptsCorreo: data.scriptsCorreo ?? [],
    presupuestos: data.presupuestos ?? [],
    catalogoServicios: data.catalogoServicios ?? [],
    preciosRegimen: data.preciosRegimen ?? [],
  };
}

async function extraerDocSiHaceFalta(
  doc: { dataUrl: string; nombreArchivo: string; tipoMime: string; storagePath?: string },
  destino: "cumplimiento" | "comprobantes-honorarios" | "facturas"
) {
  if (doc.storagePath || !esDataUrlEmpotrado(doc.dataUrl)) return doc;
  const path = await subirDataUrlAStorage({
    dataUrl: doc.dataUrl,
    nombreArchivo: doc.nombreArchivo,
    tipoMime: doc.tipoMime,
    destino,
  });
  return { ...doc, storagePath: path };
}

/** Sube dataURLs embebidos a Storage y deja storagePath (el dataUrl se queda para la UI). */
export async function extraerPdfsAStorage(
  payload: CrmCloudPayload,
  solo?: {
    cumplimiento?: Set<string>;
    comprobantes?: Set<string>;
    facturas?: Set<string>;
  }
): Promise<CrmCloudPayload> {
  const cumplimiento = await Promise.all(
    payload.cumplimiento.map((r) => {
      if (solo?.cumplimiento && !solo.cumplimiento.has(r.id)) return r;
      return mapearPdfsEnRegistroAsync(r, (d) =>
        extraerDocSiHaceFalta(d, "cumplimiento")
      );
    })
  );
  const comprobantes = await Promise.all(
    payload.comprobantes.map((c) => {
      if (solo?.comprobantes && !solo.comprobantes.has(c.id)) return c;
      return extraerDocSiHaceFalta(c, "comprobantes-honorarios");
    })
  );
  const facturas = await Promise.all(
    payload.facturas.map((f) => {
      if (solo?.facturas && !solo.facturas.has(f.id)) return f;
      return extraerDocSiHaceFalta(f, "facturas");
    })
  );
  return { ...payload, cumplimiento, comprobantes, facturas };
}

function mapaStoragePathsCumplimiento(
  lista: RegistroCumplimiento[]
): Map<string, string> {
  const paths = new Map<string, string>();
  for (const r of lista) {
    mapearPdfsEnRegistro(r, (d) => {
      if (d.id && d.storagePath) paths.set(d.id, d.storagePath);
      return d;
    });
  }
  return paths;
}

/** Aplica storagePath extraídos sobre el estado actual (no pisa otros cambios). */
export function fusionarStoragePathsEnPayload(
  actual: CrmCloudPayload,
  extraido: CrmCloudPayload
): CrmCloudPayload {
  const pathsCum = mapaStoragePathsCumplimiento(extraido.cumplimiento);
  const pathsComp = new Map(
    extraido.comprobantes
      .filter((c) => c.storagePath)
      .map((c) => [c.id, c.storagePath!])
  );
  const pathsFac = new Map(
    extraido.facturas
      .filter((f) => f.storagePath)
      .map((f) => [f.id, f.storagePath!])
  );
  return {
    ...actual,
    cumplimiento: actual.cumplimiento.map((r) =>
      mapearPdfsEnRegistro(r, (d) =>
        d.id && pathsCum.has(d.id)
          ? { ...d, storagePath: pathsCum.get(d.id) }
          : d
      )
    ),
    comprobantes: actual.comprobantes.map((c) =>
      pathsComp.has(c.id) ? { ...c, storagePath: pathsComp.get(c.id) } : c
    ),
    facturas: actual.facturas.map((f) =>
      pathsFac.has(f.id) ? { ...f, storagePath: pathsFac.get(f.id) } : f
    ),
  };
}

function aligerarPayload(payload: CrmCloudPayload): CrmCloudPayload {
  return {
    ...payload,
    cumplimiento: payload.cumplimiento.map(aligerarPdfsRegistro),
    comprobantes: payload.comprobantes.map((c) =>
      c.storagePath ? { ...c, dataUrl: "" } : c
    ),
    facturas: payload.facturas.map((f) =>
      f.storagePath ? { ...f, dataUrl: "" } : f
    ),
  };
}

function clienteIdDeMeta(meta: Record<string, unknown> | undefined): number | null {
  const raw = meta?.clienteId;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "" && !Number.isNaN(Number(raw))) {
    return Number(raw);
  }
  return null;
}

/** Secciones pesadas que soportan guardado granular por item (merge por id). */
export type ClaveGranular = "cumplimiento" | "comprobantes" | "facturas";

/** Diff por item de las secciones pesadas: solo lo que cambió viaja al server. */
export type GranularNube = {
  upserts: Partial<Record<ClaveGranular, { id: string }[]>>;
  eliminar: Partial<Record<ClaveGranular, string[]>>;
};

/**
 * Guarda el estado en la nube.
 *
 * `soloClaves` (solo admin): si se pasa, envía ÚNICAMENTE esas secciones en el
 * cuerpo. El servidor conserva el resto intactas (merge por clave). Esto evita
 * re-subir megabytes de imágenes de comprobantes en cada cambio menor, que era
 * la causa de lentitud y "Load failed" en datos móviles.
 *
 * `granular` (solo admin): para cumplimiento/comprobantes/facturas manda solo
 * los items que cambiaron (upserts + ids eliminados) en vez de la sección
 * completa. Sin esto, una sección con PDFs embebidos supera el límite de
 * 4.5 MB por request de Vercel y el guardado falla siempre.
 */
export async function guardarCrmEnNube(
  payload: CrmCloudPayload,
  soloClaves?: (keyof CrmCloudPayload)[],
  granular?: GranularNube
): Promise<void> {
  const portal = esRutaPortal();
  payload = aligerarPayload(payload);
  if (granular?.upserts.cumplimiento) {
    granular = {
      ...granular,
      upserts: {
        ...granular.upserts,
        cumplimiento: granular.upserts.cumplimiento.map((x) =>
          aligerarPdfsRegistro(x as RegistroCumplimiento)
        ),
      },
    };
  }
  if (granular?.upserts.comprobantes) {
    granular = {
      ...granular,
      upserts: {
        ...granular.upserts,
        comprobantes: granular.upserts.comprobantes.map((c) =>
          "storagePath" in c && c.storagePath
            ? { ...c, dataUrl: "" }
            : c
        ),
      },
    };
  }
  if (granular?.upserts.facturas) {
    granular = {
      ...granular,
      upserts: {
        ...granular.upserts,
        facturas: granular.upserts.facturas.map((f) =>
          "storagePath" in f && f.storagePath ? { ...f, dataUrl: "" } : f
        ),
      },
    };
  }
  let body: unknown;

  if (portal) {
    const { data } = await getSupabaseBrowser().auth.getSession();
    if (!data.session) return;
    const clienteId = clienteIdDeMeta(
      data.session.user.app_metadata as Record<string, unknown>
    );
    if (clienteId == null) return;
    const cliente = payload.clientes.find(
      (c) => c.id === clienteId && c.id !== ID_INGRESOS_DIVERSOS
    );
    body = {
      cliente,
      comprobantes: payload.comprobantes.filter((c) => c.clienteId === clienteId),
      facturas: payload.facturas.filter((f) => f.clienteId === clienteId),
      cumplimiento: payload.cumplimiento.filter((r) => r.clienteId === clienteId),
      historialImpuestos: payload.historialImpuestos.filter(
        (h) => h.clienteId === clienteId
      ),
      notificaciones: payload.notificaciones.filter(
        (n) => n.clienteId === clienteId
      ),
      repse: payload.repse.filter((r) => r.clienteId === clienteId),
      encargos: payload.encargos.filter((e) => e.clienteId === clienteId),
    };
  } else if (soloClaves && soloClaves.length > 0) {
    // Guardado incremental: solo las secciones que cambiaron.
    const parcial: Record<string, unknown> = {};
    for (const clave of soloClaves) {
      // Si esta sección viaja granular (por item), no mandar el array completo.
      const esGranular =
        granular &&
        (granular.upserts[clave as ClaveGranular] !== undefined ||
          granular.eliminar[clave as ClaveGranular] !== undefined);
      if (esGranular) continue;
      parcial[clave] = payload[clave];
    }
    if (granular) {
      parcial.upserts = granular.upserts;
      parcial.eliminar = granular.eliminar;
    }
    body = parcial;
  } else {
    body = payload;
  }

  const url = portal ? "/api/portal/datos" : "/api/admin/crm-estado";

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  });
  let data: { error?: string } = {};
  try {
    data = await res.json();
  } catch {
    if (res.status === 413) {
      throw new Error(
        "El archivo es demasiado grande para el servidor. Intenta de nuevo."
      );
    }
    throw new Error("No se pudieron guardar los datos.");
  }
  if (!res.ok) {
    throw new Error(data.error ?? "No se pudieron guardar los datos.");
  }
}
