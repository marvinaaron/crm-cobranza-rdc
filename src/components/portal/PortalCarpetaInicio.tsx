"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Cliente } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";
import { ModalPagoSheet } from "@/components/portal/metodo-pago-ui";
import {
  haySipareEnCarpeta,
  recolectarCarpetaDocumentos,
  type ArchivoCarpeta,
  type CarpetaId,
} from "@/lib/portal/carpeta-documentos";

type Props = { cliente: Cliente };

const CARPETAS: { id: CarpetaId; label: string }[] = [
  { id: "honorarios", label: "Honorarios" },
  { id: "declaraciones", label: "Declaraciones" },
  { id: "lineas", label: "Líneas de captura" },
  { id: "fiscales", label: "Documentos Fiscales" },
  { id: "imss", label: "IMSS" },
];

type ResumenFiscales = {
  efirma?: {
    tiene: boolean;
    titular?: string;
    vigenciaFin?: string;
    vigenciaFinLabel?: string;
    diasRestantes?: number;
    estado?: string;
    tieneCer?: boolean;
    tieneKey?: boolean;
  };
  sello?: { tiene: boolean };
  documentos?: {
    constancia?: { nombreArchivo: string; subidoEn: string } | null;
    opinion?: { nombreArchivo: string; subidoEn: string } | null;
  };
};

function fmtFecha(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function abrirArchivo(doc: ArchivoCarpeta) {
  if (doc.href?.startsWith("/") && !doc.href.startsWith("//") && !doc.descargaHref) {
    return;
  }
  if (doc.href && (doc.href.startsWith("http") || doc.href.startsWith("data:"))) {
    window.open(doc.href, "_blank", "noopener,noreferrer");
    return;
  }
  if (doc.dataUrl) abrirPdfEnNuevaPestana(doc.dataUrl);
}

function sePuedeBajar(doc: ArchivoCarpeta): boolean {
  if (doc.sePuedeDescargar === false) return false;
  return Boolean(doc.descargaHref || doc.dataUrl || (doc.href && !doc.href.startsWith("/portal")));
}

function dispararDescarga(doc: ArchivoCarpeta) {
  if (doc.descargaHref) {
    const a = document.createElement("a");
    a.href = doc.descargaHref;
    a.download = doc.nombreArchivo || "documento";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  if (doc.dataUrl) {
    descargarArchivo(doc.dataUrl, doc.nombreArchivo);
    return;
  }
  if (doc.href && (doc.href.startsWith("http") || doc.href.startsWith("data:"))) {
    descargarArchivo(doc.href, doc.nombreArchivo);
  }
}

function archivosFiscalesDe(resumen: ResumenFiscales | null): ArchivoCarpeta[] {
  if (!resumen) return [];
  const out: ArchivoCarpeta[] = [];
  const csf = resumen.documentos?.constancia;
  if (csf) {
    out.push({
      id: "fiscal-csf",
      carpeta: "fiscales",
      titulo: "Constancia de situación fiscal",
      fechaIso: csf.subidoEn,
      nombreArchivo: csf.nombreArchivo,
      descargaHref: "/api/portal/sat/documento?tipo=constancia",
      subtitulo: `PDF · ${fmtFecha(csf.subidoEn)}`,
    });
  }
  const opinion = resumen.documentos?.opinion;
  if (opinion) {
    out.push({
      id: "fiscal-opinion",
      carpeta: "fiscales",
      titulo: "Opinión de cumplimiento",
      fechaIso: opinion.subidoEn,
      nombreArchivo: opinion.nombreArchivo,
      descargaHref: "/api/portal/sat/documento?tipo=opinion",
      subtitulo: `PDF · ${fmtFecha(opinion.subidoEn)}`,
    });
  }
  if (resumen.efirma?.tiene) {
    const vig = resumen.efirma.vigenciaFinLabel;
    const estado = resumen.efirma.estado;
    const pie =
      estado === "vencida"
        ? vig
          ? `Venció ${vig}`
          : "Vencida"
        : vig
          ? `Vigente hasta ${vig}`
          : "Registrada";
    out.push({
      id: "fiscal-efirma",
      carpeta: "fiscales",
      titulo: "e.firma (FIEL)",
      fechaIso: resumen.efirma.vigenciaFin ?? "",
      nombreArchivo: "efirma.cer",
      descargaHref: resumen.efirma.tieneCer
        ? "/api/portal/documentos-fiscales/archivo?tipo=cer"
        : undefined,
      sePuedeDescargar: Boolean(resumen.efirma.tieneCer),
      subtitulo: pie,
    });
    if (resumen.efirma.tieneKey) {
      out.push({
        id: "fiscal-efirma-key",
        carpeta: "fiscales",
        titulo: "Llave e.firma (.key)",
        fechaIso: resumen.efirma.vigenciaFin ?? "",
        nombreArchivo: "efirma.key",
        descargaHref: "/api/portal/documentos-fiscales/archivo?tipo=key",
        subtitulo: pie,
      });
    }
  }
  if (resumen.sello?.tiene) {
    out.push({
      id: "fiscal-csd",
      carpeta: "fiscales",
      titulo: "Sello digital (CSD)",
      fechaIso: "",
      nombreArchivo: "CSD",
      sePuedeDescargar: false,
      subtitulo: "Registrado por tu contador",
    });
  }
  return out;
}

/** Carpeta rellena estilo Archivos de iPhone (no círculo de Ajustes). */
function IosFolderIcon({ vacia }: { vacia: boolean }) {
  const cuerpo = vacia ? "#C7C7CC" : "#007AFF";
  const pestaña = vacia ? "#D1D1D6" : "#64D2FF";
  return (
    <svg
      width="64"
      height="52"
      viewBox="0 0 64 52"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 16.5c0-2.5 2-4.5 4.5-4.5h10.2c.8 0 1.6.3 2.2.8L28 16h23.5c2.5 0 4.5 2 4.5 4.5V41c0 2.5-2 4.5-4.5 4.5h-39C9.5 45.5 8 44 8 41.5V16.5Z"
        fill={cuerpo}
      />
      <path
        d="M8 14c0-2.2 1.8-4 4-4h11.4c.7 0 1.4.3 1.9.7L29 14H12c-2.2 0-4 1.8-4 4v-4Z"
        fill={pestaña}
      />
    </svg>
  );
}

function IosDocIcon() {
  return (
    <svg width="28" height="34" viewBox="0 0 28 34" fill="none" aria-hidden>
      <path
        d="M6 1.5h10.2L26 11.3V30a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 4 30V4A2.5 2.5 0 0 1 6.5 1.5H6Z"
        fill="#E8F1FF"
      />
      <path d="M16.2 1.5V9a2 2 0 0 0 2 2h7.6L16.2 1.5Z" fill="#007AFF" />
      <path
        d="M8 18h12M8 23h9"
        stroke="#007AFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PortalCarpetaInicio({ cliente }: Props) {
  const { cumplimiento, facturas } = useClientes();
  const [abierta, setAbierta] = useState<CarpetaId | null>(null);
  const [fiscales, setFiscales] = useState<ArchivoCarpeta[]>([]);

  useEffect(() => {
    let vivo = true;
    void fetch("/api/portal/documentos-fiscales", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: ResumenFiscales) => {
        if (vivo) setFiscales(archivosFiscalesDe(data));
      })
      .catch(() => {
        if (vivo) setFiscales([]);
      });
    return () => {
      vivo = false;
    };
  }, [cliente.id]);

  const archivos = useMemo(
    () => [
      ...recolectarCarpetaDocumentos(cliente, cumplimiento, facturas),
      ...fiscales,
    ],
    [cliente, cumplimiento, facturas, fiscales]
  );
  const mostrarImss = haySipareEnCarpeta(archivos);

  const carpetasVisibles = CARPETAS.filter(
    (c) => c.id !== "imss" || mostrarImss
  );

  const delFolder = abierta
    ? archivos.filter((a) => a.carpeta === abierta)
    : [];
  const tituloFolder =
    CARPETAS.find((c) => c.id === abierta)?.label ?? "Carpeta";

  return (
    <>
      <section>
        <p className="px-4 mb-2 text-[13px] font-semibold text-slate-500">
          Carpeta
        </p>
        <div className="bg-white dark:bg-slate-900 rounded-2xl px-2 py-4">
          <div className="grid grid-cols-2 gap-y-5 gap-x-2">
            {carpetasVisibles.map((c) => {
              const n = archivos.filter((a) => a.carpeta === c.id).length;
              const vacia = n === 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAbierta(c.id)}
                  className="flex flex-col items-center gap-1.5 px-2 py-1 rounded-xl active:bg-slate-50 dark:active:bg-white/5"
                >
                  <IosFolderIcon vacia={vacia} />
                  <span className="text-[13px] font-semibold text-slate-900 dark:text-white text-center leading-tight">
                    {c.label}
                  </span>
                  <span className="text-[12px] text-slate-400 leading-none">
                    {vacia ? "Vacía" : n === 1 ? "1" : String(n)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {abierta ? (
        <HojaCarpeta
          titulo={tituloFolder}
          archivos={delFolder}
          irSat={abierta === "fiscales"}
          onClose={() => setAbierta(null)}
        />
      ) : null}
    </>
  );
}

function IconoDescarga() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function HojaCarpeta({
  titulo,
  archivos,
  irSat,
  onClose,
}: {
  titulo: string;
  archivos: ArchivoCarpeta[];
  irSat?: boolean;
  onClose: () => void;
}) {
  return (
    <ModalPagoSheet titulo={titulo} onClose={onClose}>
      {archivos.length === 0 ? (
        <p className="px-2 py-10 text-center text-[15px] text-slate-500">
          {irSat
            ? "Tu contador aún no carga e.firma ni sellos digitales."
            : "Esta carpeta está vacía."}
        </p>
      ) : (
        <ul className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-200/70">
          {archivos.map((doc) => {
            const baja = sePuedeBajar(doc);
            const seAbre = Boolean(doc.dataUrl || (doc.href && (doc.href.startsWith("http") || doc.href.startsWith("data:"))));
            return (
              <li key={doc.id} className="flex items-center gap-1 pr-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (seAbre) abrirArchivo(doc);
                  }}
                  disabled={!seAbre}
                  className="flex min-w-0 flex-1 items-center gap-3 px-3.5 py-2.5 text-left active:bg-slate-50 disabled:active:bg-transparent"
                >
                  <IosDocIcon />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-normal text-slate-900 dark:text-white truncate">
                      {doc.titulo}
                    </span>
                    <span className="block text-[13px] text-slate-500 mt-0.5">
                      {doc.subtitulo ??
                        (fmtFecha(doc.fechaIso)
                          ? `PDF · ${fmtFecha(doc.fechaIso)}`
                          : "PDF")}
                    </span>
                  </span>
                </button>
                {baja ? (
                  <button
                    type="button"
                    onClick={() => dispararDescarga(doc)}
                    className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-[var(--portal-navy)] hover:bg-slate-50 active:scale-95"
                    aria-label={`Descargar ${doc.titulo}`}
                    title="Descargar"
                  >
                    <IconoDescarga />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {irSat ? (
        <Link
          href="/portal/sat"
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-[var(--portal-navy)] px-4 py-3 text-[15px] font-semibold text-white active:scale-[0.99]"
        >
          IR a SAT
        </Link>
      ) : null}
    </ModalPagoSheet>
  );
}
