"use client";

import { useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import { MESES_NOM, type Cliente } from "@/lib/clientes";
import type { RegistroCumplimiento, DocumentoHacienda } from "@/lib/cumplimiento";
import type { FacturaPago } from "@/lib/facturas";
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";
import PortalSection from "@/components/portal/PortalSection";
import Fiscalino from "@/components/Fiscalino";
import { usePortalEsMovil } from "@/hooks/usePortalEsMovil";

type Origen = "sat" | "cumplimiento" | "honorarios";

type Documento = {
  id: string;
  titulo: string;
  origen: Origen;
  fechaIso: string;
  /** Si está en Supabase Storage, URL directa para descargar (SAT). */
  href?: string;
  /** Si está como data URL (cumplimiento / honorarios), base64. */
  dataUrl?: string;
  nombreArchivo: string;
};

const ETIQUETA_ORIGEN: Record<Origen, { label: string; chip: string; dot: string }> = {
  sat: {
    label: "SAT",
    chip: "bg-[var(--portal-navy-soft)] text-[var(--portal-navy)]",
    dot: "bg-[var(--portal-navy-soft)]0",
  },
  cumplimiento: {
    label: "Cumplimiento",
    chip: "bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  honorarios: {
    label: "Honorarios",
    chip: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

const FILTROS: { id: "todos" | Origen; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "sat", label: "SAT" },
  { id: "cumplimiento", label: "Cumplimiento" },
  { id: "honorarios", label: "Honorarios" },
];

const LIMITE = 6;

function periodoLabelCorto(mes: number, anio: number | string): string {
  return `${MESES_NOM[mes] ?? ""} ${anio}`.trim();
}

function pushDocCumplimiento(
  list: Documento[],
  doc: DocumentoHacienda | undefined,
  prefijo: string,
  reg: RegistroCumplimiento,
  sufijoId: string
) {
  if (!doc?.nombreArchivo) return;
  const url = doc.dataUrl?.trim() ?? "";
  if (!url && !doc.storagePath) return;
  list.push({
    id: `cump-${reg.id}-${sufijoId}-${doc.id ?? doc.nombreArchivo}`,
    titulo: `${prefijo} — ${periodoLabelCorto(reg.mes, reg.anio)}`,
    origen: "cumplimiento",
    fechaIso: doc.subidoEn || reg.actualizadoEn,
    href: url.startsWith("http") ? url : undefined,
    dataUrl: url.startsWith("http") ? undefined : url || undefined,
    nombreArchivo: doc.nombreArchivo,
  });
}

function recolectarDocumentos(
  cliente: Cliente,
  cumplimiento: RegistroCumplimiento[],
  facturas: FacturaPago[]
): Documento[] {
  const out: Documento[] = [];

  const docsSat = cliente.satPortal?.documentos;
  if (docsSat?.constancia) {
    out.push({
      id: "sat-csf",
      titulo: "Constancia de situación fiscal",
      origen: "sat",
      fechaIso: docsSat.constancia.subidoEn,
      href: "/api/portal/sat/documento?tipo=constancia",
      nombreArchivo: docsSat.constancia.nombreArchivo,
    });
  }
  if (docsSat?.opinionPdf) {
    out.push({
      id: "sat-opinion",
      titulo: "Opinión de cumplimiento (32-D)",
      origen: "sat",
      fechaIso: docsSat.opinionPdf.subidoEn,
      href: "/api/portal/sat/documento?tipo=opinion",
      nombreArchivo: docsSat.opinionPdf.nombreArchivo,
    });
  }

  for (const reg of cumplimiento) {
    if (reg.clienteId !== cliente.id) continue;

    pushDocCumplimiento(out, reg.federales?.declaracion, "Acuse declaración SAT", reg, "fed");
    for (const l of reg.federales?.lineasCaptura ?? []) {
      pushDocCumplimiento(
        out,
        l.documento,
        l.etiqueta || "Línea de captura SAT",
        reg,
        `linea-${l.id}`
      );
    }

    reg.imss?.ema?.forEach((d, i) =>
      pushDocCumplimiento(out, d, `EMA · IMSS`, reg, `ema${i}`)
    );
    reg.imss?.eba?.forEach((d, i) =>
      pushDocCumplimiento(out, d, `EBA · IMSS`, reg, `eba${i}`)
    );
    pushDocCumplimiento(out, reg.imss?.sipare, "SIPARE · IMSS", reg, "sipare");

    reg.estatales?.nominas?.forEach((d, i) =>
      pushDocCumplimiento(out, d, "Nómina estatal", reg, `nom${i}`)
    );

    if (reg.comprobantePagoCategorias) {
      const labels: Record<string, string> = {
        federales: "Comprobante pago · SAT",
        imss: "Comprobante pago · IMSS",
        estatales: "Comprobante pago · estatales",
      };
      for (const [cat, doc] of Object.entries(reg.comprobantePagoCategorias)) {
        pushDocCumplimiento(
          out,
          doc,
          labels[cat] ?? `Comprobante pago · ${cat}`,
          reg,
          `pago-${cat}`
        );
      }
    }

    reg.otros?.forEach((d, i) =>
      pushDocCumplimiento(out, d, "Otro documento fiscal", reg, `otro${i}`)
    );
  }

  for (const f of facturas) {
    if (f.clienteId !== cliente.id) continue;
    if (!f.nombreArchivo) continue;
    const url = f.dataUrl?.trim() ?? "";
    if (!url && !f.storagePath) continue;
    out.push({
      id: `factura-${f.id}`,
      titulo: `Factura honorarios — ${periodoLabelCorto(f.mes, f.anio)}`,
      origen: "honorarios",
      fechaIso: f.subidoEn,
      href: url.startsWith("http") ? url : undefined,
      dataUrl: url.startsWith("http") ? undefined : url || undefined,
      nombreArchivo: f.nombreArchivo,
    });
  }

  return out.sort((a, b) => (a.fechaIso < b.fechaIso ? 1 : -1));
}

function fmtFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PdfIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

type Props = {
  cliente: Cliente;
};

/**
 * Sección "Tus documentos" para el inicio del portal del cliente.
 * Agrupa CSF/opinión 32-D (SAT), declaraciones y comprobantes (Cumplimiento)
 * y facturas (Honorarios). Pensado como resumen rápido; cada sección sigue
 * mostrando el detalle completo.
 */
export default function PortalDocumentosRecientes({ cliente }: Props) {
  const { cumplimiento, facturas } = useClientes();
  const esMovil = usePortalEsMovil();
  const [filtro, setFiltro] = useState<"todos" | Origen>("todos");

  const documentos = useMemo(
    () => recolectarDocumentos(cliente, cumplimiento, facturas),
    [cliente, cumplimiento, facturas]
  );

  const filtrados = useMemo(() => {
    const base = filtro === "todos" ? documentos : documentos.filter((d) => d.origen === filtro);
    return base.slice(0, LIMITE);
  }, [documentos, filtro]);

  if (documentos.length === 0) {
    return (
      <PortalSection
        title="Tus documentos"
        collapsible={esMovil}
        defaultOpen={!esMovil}
      >
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <Fiscalino mood="sleeping" size={104} />
          <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-sm">
            Tu contador publicará aquí tus declaraciones, acuses y comprobantes
            conforme avance el periodo.
          </p>
        </div>
      </PortalSection>
    );
  }

  const conteoPorOrigen = documentos.reduce(
    (acc, d) => {
      acc[d.origen] = (acc[d.origen] ?? 0) + 1;
      return acc;
    },
    {} as Record<Origen, number>
  );

  return (
    <PortalSection
      title="Tus documentos"
      collapsible={esMovil}
      defaultOpen={!esMovil}
      headerExtra={
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {documentos.length} total
        </span>
      }
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTROS.map((f) => {
          const activo = filtro === f.id;
          const count =
            f.id === "todos"
              ? documentos.length
              : (conteoPorOrigen[f.id as Origen] ?? 0);
          if (f.id !== "todos" && count === 0) return null;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                activo
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="space-y-2">
        {filtrados.map((doc) => {
          const meta = ETIQUETA_ORIGEN[doc.origen];
          return (
            <li
              key={doc.id}
              className="flex items-center gap-3 py-3 px-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                <PdfIcon />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-800 truncate leading-tight">
                  {doc.titulo}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.chip}`}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {fmtFecha(doc.fechaIso)}
                  </span>
                </div>
              </div>
              {doc.href ? (
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--portal-navy)] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[var(--portal-navy-hover)]"
                  title="Descargar"
                >
                  <DownloadIcon />
                  PDF
                </a>
              ) : doc.dataUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!doc.dataUrl) return;
                    abrirPdfEnNuevaPestana(doc.dataUrl);
                  }}
                  onContextMenu={(e) => {
                    if (!doc.dataUrl) return;
                    e.preventDefault();
                    descargarArchivo(doc.dataUrl, doc.nombreArchivo);
                  }}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--portal-navy)] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[var(--portal-navy-hover)]"
                  title="Abrir (clic derecho para descargar)"
                >
                  <DownloadIcon />
                  PDF
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      {documentos.length > filtrados.length && (
        <p className="text-[10px] font-bold text-slate-400 mt-3 text-center">
          Mostrando {filtrados.length} de {documentos.length}. Encuentra el resto en
          la sección correspondiente.
        </p>
      )}
    </PortalSection>
  );
}
