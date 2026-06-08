"use client";

import Image from "next/image";
import {
  type Presupuesto,
  DATOS_PRESUPUESTO,
  calcularTotales,
  fechaVencimiento,
  fmtMoneda,
  fmtFechaPunto,
} from "@/lib/presupuestos";

/** Navy de marca para el encabezado, recuadro de honorario y total. */
const NAVY = "#0F172A";
/** Gris neutro para las etiquetas de sección (CLIENTE, SERVICIO, etc.). */
const GRIS_LABEL = "#94A3B8";

const LABEL = "text-[10px] font-bold uppercase tracking-[0.22em]";

/**
 * Documento imprimible del presupuesto, con identidad RDC (navy + dorado).
 * Se usa en la vista previa (wizard / detalle), en la liga pública y para
 * "Descargar PDF" (impresión del navegador). El contenedor lleva id
 * `presupuesto-imprimible` para que el CSS de impresión muestre solo este bloque.
 */
export default function PresupuestoDocumento({
  presupuesto,
}: {
  presupuesto: Presupuesto;
}) {
  const totales = calcularTotales(
    presupuesto.conceptos,
    presupuesto.ivaTasa,
    presupuesto.descuentoPct
  );
  const ivaPct = Math.round(presupuesto.ivaTasa * 100);
  const descPct = presupuesto.descuentoPct ?? 0;
  const venc = fechaVencimiento(presupuesto);

  const COLS = "1fr 84px 78px 90px";

  return (
    <div
      id="presupuesto-imprimible"
      className="documento-presupuesto text-slate-800 mx-auto w-full max-w-[820px] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(15,23,42,0.12)] print:shadow-none print:rounded-none"
      style={{
        background: "#ffffff",
        colorScheme: "light",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* HEADER: banda navy de lado a lado con logo + folio */}
      <div
        className="px-8 sm:px-10 py-7 flex items-start justify-between gap-6"
        style={{ background: NAVY }}
      >
        <Image
          src="/logos/rdc-white.png"
          alt="RDC Contadores"
          width={132}
          height={44}
          className="h-11 w-auto object-contain"
        />
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-300">
            Presupuesto
          </p>
          <p className="text-xl font-black text-white leading-none mt-1 tabular-nums">
            {presupuesto.folio}
          </p>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Fecha: {fmtFechaPunto(presupuesto.fecha)}
          </p>
        </div>
      </div>

      <div className="p-8 sm:p-10 space-y-7">
        {/* CLIENTE + recuadro de honorario */}
        <div className="flex flex-wrap justify-between gap-4 items-start">
          <div className="min-w-0">
            <p className={LABEL} style={{ color: GRIS_LABEL }}>
              Cliente
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight tracking-tight mt-1">
              {presupuesto.cliente.razonSocial || "—"}
            </p>
            {presupuesto.cliente.giro && (
              <p className="text-[13px] text-slate-500 mt-0.5">
                {presupuesto.cliente.giro}
              </p>
            )}
            <div className="text-[12px] text-slate-500 mt-2 space-y-0.5">
              {presupuesto.cliente.rfc && (
                <p>RFC: {presupuesto.cliente.rfc}</p>
              )}
              {presupuesto.cliente.email && <p>{presupuesto.cliente.email}</p>}
              {presupuesto.cliente.telefono && (
                <p>{presupuesto.cliente.telefono}</p>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div
              className="inline-block rounded-2xl px-5 py-3.5 border-2"
              style={{ borderColor: NAVY }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: NAVY }}
              >
                Honorario mensual
              </p>
              <p
                className="text-3xl font-black leading-none mt-1 tabular-nums"
                style={{ color: NAVY }}
              >
                {fmtMoneda(totales.total)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">IVA incluido</p>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Vigencia: {fmtFechaPunto(venc)}
            </p>
          </div>
        </div>

        {/* TABLA DE SERVICIOS */}
        <div>
          {/* Encabezado: texto gris con borde inferior */}
          <div
            className="grid items-center px-5 pb-2 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider"
            style={{ gridTemplateColumns: COLS, color: GRIS_LABEL }}
          >
            <span>Servicio</span>
            <span className="text-right">Precio</span>
            <span className="text-right">IVA</span>
            <span className="text-right">Total</span>
          </div>

          {/* Filas alternadas gris / blanco redondeadas */}
          <div className="mt-1.5 space-y-1">
            {presupuesto.conceptos.map((c, i) => {
              const precio = Number(c.precio) || 0;
              const iva = Math.round(precio * presupuesto.ivaTasa);
              const par = i % 2 === 1;
              return (
                <div
                  key={c.id}
                  className={`grid px-5 py-3 break-inside-avoid rounded-2xl ${
                    par ? "bg-slate-100" : "bg-white"
                  }`}
                  style={{ gridTemplateColumns: COLS }}
                >
                  <div className="pr-4 min-w-0">
                    <p className="text-[12px] font-bold text-slate-800 uppercase tracking-tight leading-tight">
                      {c.servicio}
                    </p>
                    {c.descripcion && (
                      <p className="text-[12px] text-slate-500 leading-snug mt-0.5">
                        {c.descripcion}
                      </p>
                    )}
                  </div>
                  <span className="text-[13px] text-slate-600 text-right tabular-nums self-start">
                    {fmtMoneda(precio)}
                  </span>
                  <span className="text-[13px] text-slate-400 text-right tabular-nums self-start">
                    {fmtMoneda(iva)}
                  </span>
                  <span className="text-[13px] font-bold text-slate-800 text-right tabular-nums self-start">
                    {fmtMoneda(precio + iva)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOTALES */}
        <div className="flex justify-end">
          <div className="w-full max-w-[340px]">
            <div className="flex justify-between items-center px-5 py-2">
              <span className="text-[13px] text-slate-500">Subtotal</span>
              <span className="text-[14px] font-bold text-slate-800 tabular-nums">
                {fmtMoneda(totales.subtotal)}
              </span>
            </div>

            {descPct > 0 && (
              <div className="flex justify-between items-center px-5 py-1.5">
                <span className="text-[13px] font-semibold text-emerald-600">
                  Descuento {descPct}%
                  {presupuesto.descuentoMotivo
                    ? ` · ${presupuesto.descuentoMotivo}`
                    : ""}
                </span>
                <span className="text-[13px] font-semibold text-emerald-600 tabular-nums">
                  −{fmtMoneda(totales.descuento)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center px-5 py-2">
              <span className="text-[13px] text-slate-500">
                Impuestos (IVA {ivaPct}%)
              </span>
              <span className="text-[14px] text-slate-700 tabular-nums">
                {fmtMoneda(totales.iva)}
              </span>
            </div>

            <div
              className="flex justify-between items-center rounded-2xl px-5 py-3.5 mt-2 text-white"
              style={{ background: NAVY }}
            >
              <span className="text-[13px] font-black uppercase tracking-widest">
                Total mensual
              </span>
              <span className="text-xl font-black tabular-nums">
                {fmtMoneda(totales.total)}
              </span>
            </div>
          </div>
        </div>

        {/* NOTAS */}
        {presupuesto.notas && (
          <div className="rounded-2xl bg-amber-50 border border-amber-100 px-5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">
              Notas
            </p>
            <p className="text-[12px] text-amber-800 whitespace-pre-wrap leading-snug">
              {presupuesto.notas}
            </p>
          </div>
        )}

        {/* CONDICIONES + IMPORTANTE */}
        <div className="grid sm:grid-cols-2 gap-5 text-[11px] text-slate-500 leading-relaxed pt-1">
          <div>
            <p className={LABEL} style={{ color: GRIS_LABEL }}>
              Condiciones de pago
            </p>
            <p className="mt-1.5">{DATOS_PRESUPUESTO.condiciones}</p>
          </div>
          <div>
            <p className={LABEL} style={{ color: GRIS_LABEL }}>
              Importante
            </p>
            <p className="mt-1.5">{DATOS_PRESUPUESTO.obligatoriedad}</p>
          </div>
        </div>

        {/* DATOS BANCARIOS + PERSONA DE CONTACTO (recuadros) */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 px-5 py-4">
            <p className={LABEL} style={{ color: GRIS_LABEL }}>
              Datos bancarios
            </p>
            <p className="text-[14px] font-bold text-slate-800 mt-1.5">
              {DATOS_PRESUPUESTO.banco}
            </p>
            <p className="text-[13px] text-slate-500 mt-0.5">
              CLABE: {DATOS_PRESUPUESTO.clabe}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 px-5 py-4">
            <p className={LABEL} style={{ color: GRIS_LABEL }}>
              Persona de contacto
            </p>
            <p className="text-[14px] font-bold text-slate-800 mt-1.5">
              {DATOS_PRESUPUESTO.contactoNombre}
            </p>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {DATOS_PRESUPUESTO.contactoTel} · {DATOS_PRESUPUESTO.contactoEmail}
            </p>
          </div>
        </div>

        {/* CIERRE + FIRMA */}
        <div className="pt-1">
          <p className="text-[12px] text-slate-500 leading-snug italic">
            {DATOS_PRESUPUESTO.cierre}
          </p>
          <div className="flex items-end justify-between gap-4 mt-6">
            <div>
              <div className="w-44 border-t border-slate-300 pt-1.5">
                <p className="text-[12px] font-bold text-slate-700">
                  {DATOS_PRESUPUESTO.contactoCargo}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                  {DATOS_PRESUPUESTO.despacho} · {DATOS_PRESUPUESTO.despachoLinea2}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-300 shrink-0">
              {DATOS_PRESUPUESTO.instagram}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Nombre de archivo seguro: "PRESUPUESTO RDC - <folio>". Nunca expone la URL. */
function nombreArchivoPdf(folio?: string): string {
  const limpio = (folio ?? "").replace(/[\\/:*?"<>|]/g, "").trim();
  return `PRESUPUESTO RDC - ${limpio || "presupuesto"}`;
}

/**
 * Respaldo: imprime el documento con el navegador, pero fija el título para que
 * el nombre sugerido sea "PRESUPUESTO RDC - <folio>" y NUNCA la URL del admin.
 */
function imprimirComoRespaldo(folio?: string) {
  if (typeof document === "undefined") return;
  const tituloOriginal = document.title;
  document.title = nombreArchivoPdf(folio);
  document.body.classList.add("print-presupuesto");
  const limpiar = () => {
    document.body.classList.remove("print-presupuesto");
    document.title = tituloOriginal;
    window.removeEventListener("afterprint", limpiar);
  };
  window.addEventListener("afterprint", limpiar);
  window.print();
  setTimeout(limpiar, 1500);
}

/**
 * Descarga el presupuesto como PDF directamente (sin diálogo de impresión).
 * El archivo se guarda como "PRESUPUESTO RDC - <folio>.pdf".
 * Si falla la generación, cae al diálogo de impresión con título seguro.
 */
export async function descargarPresupuestoPDF(folio?: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById("presupuesto-imprimible");
  if (!el) {
    imprimirComoRespaldo(folio);
    return;
  }

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas-pro"),
      import("jspdf"),
    ]);

    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });

    const img = canvas.toDataURL("image/png");

    // Una sola hoja a la medida exacta del documento: sin cortes ni bandas.
    const w = el.offsetWidth || canvas.width;
    const h = el.offsetHeight || canvas.height;
    const pdf = new jsPDF({
      unit: "px",
      format: [w, h],
      orientation: h >= w ? "portrait" : "landscape",
    });
    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save(`${nombreArchivoPdf(folio)}.pdf`);
  } catch {
    // Si algo falla (navegador viejo, color no soportado, etc.), usamos impresión.
    imprimirComoRespaldo(folio);
  }
}
