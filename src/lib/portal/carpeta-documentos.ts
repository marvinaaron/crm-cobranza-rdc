import { MESES_NOM, type Cliente } from "@/lib/clientes";
import {
  documentoPdfDisponible,
  type DocumentoHacienda,
  type RegistroCumplimiento,
} from "@/lib/cumplimiento";
import { facturaPdfDisponible, type FacturaPago } from "@/lib/facturas";

export type CarpetaId =
  | "honorarios"
  | "declaraciones"
  | "lineas"
  | "imss"
  | "fiscales";

export type ArchivoCarpeta = {
  id: string;
  carpeta: CarpetaId;
  titulo: string;
  fechaIso: string;
  nombreArchivo: string;
  href?: string;
  dataUrl?: string;
  /** Texto bajo el título (si no hay, se arma con PDF + fecha). */
  subtitulo?: string;
  /** URL de descarga (API o archivo). Si no hay, se usa href/dataUrl. */
  descargaHref?: string;
  sePuedeDescargar?: boolean;
};

function periodoCorto(mes: number, anio: number | string): string {
  return `${MESES_NOM[mes] ?? ""} ${anio}`.trim();
}

function archivoDeDoc(
  carpeta: CarpetaId,
  doc: DocumentoHacienda | undefined,
  titulo: string,
  id: string
): ArchivoCarpeta | null {
  if (!documentoPdfDisponible(doc) || !doc) return null;
  const url = doc.dataUrl?.trim() ?? "";
  return {
    id,
    carpeta,
    titulo,
    fechaIso: doc.subidoEn,
    nombreArchivo: doc.nombreArchivo,
    href: url.startsWith("http") ? url : undefined,
    dataUrl: url.startsWith("http") ? undefined : url || undefined,
  };
}

export function recolectarCarpetaDocumentos(
  cliente: Cliente,
  cumplimiento: RegistroCumplimiento[],
  facturas: FacturaPago[]
): ArchivoCarpeta[] {
  const out: ArchivoCarpeta[] = [];

  for (const f of facturas) {
    if (f.clienteId !== cliente.id || !facturaPdfDisponible(f)) continue;
    const url = f.dataUrl?.trim() ?? "";
    out.push({
      id: `fac-${f.id}`,
      carpeta: "honorarios",
      titulo: `Factura · ${periodoCorto(f.mes, f.anio)}`,
      fechaIso: f.subidoEn,
      nombreArchivo: f.nombreArchivo,
      href: url.startsWith("http") ? url : undefined,
      dataUrl: url.startsWith("http") ? undefined : url || undefined,
    });
  }

  for (const reg of cumplimiento) {
    if (reg.clienteId !== cliente.id) continue;
    const periodo = periodoCorto(reg.mes, reg.anio);

    const decl = archivoDeDoc(
      "declaraciones",
      reg.federales?.declaracion,
      `Acuse · ${periodo}`,
      `decl-${reg.id}`
    );
    if (decl) out.push(decl);

    for (const l of reg.federales?.lineasCaptura ?? []) {
      const linea = archivoDeDoc(
        "lineas",
        l.documento,
        `${l.etiqueta || "Línea de captura"} · ${periodo}`,
        `linea-${reg.id}-${l.id}`
      );
      if (linea) out.push(linea);
    }

    const sipare = archivoDeDoc(
      "imss",
      reg.imss?.sipare,
      `SIPARE · ${periodo}`,
      `sipare-${reg.id}`
    );
    if (sipare) out.push(sipare);
  }

  return out.sort((a, b) => (a.fechaIso < b.fechaIso ? 1 : -1));
}

export function haySipareEnCarpeta(archivos: ArchivoCarpeta[]): boolean {
  return archivos.some((a) => a.carpeta === "imss");
}
