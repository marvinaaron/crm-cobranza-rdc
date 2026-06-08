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

/** Color de etiquetas de sección. Navy para contrastar sobre el fondo blanco. */
const NAVY = "#0F172A";

/** Logo BBVA en gris (wordmark) para los datos bancarios. */
function LogoBBVA() {
  return (
    <svg
      width="74"
      height="20"
      viewBox="0 0 148 40"
      role="img"
      aria-label="BBVA"
      className="inline-block"
    >
      <text
        x="0"
        y="31"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="36"
        fontWeight="800"
        letterSpacing="1"
        fill="#9CA3AF"
      >
        BBVA
      </text>
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={NAVY} aria-hidden>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.82 2.42a8.19 8.19 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.24-.01-.37.11-.49.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.34-.77-1.83-.2-.48-.4-.42-.56-.42z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={NAVY}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

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

  const COLS = "minmax(96px,1.1fr) 2.1fr 78px 92px 96px";

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
          <p className="text-[28px] sm:text-[32px] font-black tracking-tight text-white leading-none">
            PRESUPUESTO
          </p>
          <p className="text-[12px] font-semibold text-slate-300 mt-1.5 tracking-wide">
            N° {presupuesto.folio}
          </p>
        </div>
      </div>

      <div className="p-8 sm:p-10 space-y-7">
        {/* CLIENTE + recuadro de honorario navy */}
        <div className="flex flex-wrap justify-between gap-4 items-start">
          <div className="min-w-0">
            <p className={LABEL} style={{ color: NAVY }}>
              Cliente
            </p>
            <p className="text-2xl sm:text-[34px] font-black text-slate-900 leading-[1.05] tracking-tight uppercase mt-1">
              {presupuesto.cliente.razonSocial || "—"}
            </p>
            {presupuesto.cliente.giro && (
              <p className="text-[13px] uppercase tracking-wide text-slate-400 mt-0.5">
                {presupuesto.cliente.giro}
              </p>
            )}
            <div className="text-[13px] text-slate-600 mt-3 space-y-0.5">
              <p>
                <span className="font-bold text-slate-800">Fecha:</span>{" "}
                {fmtFechaPunto(presupuesto.fecha)}
              </p>
              <p>
                <span className="font-bold text-slate-800">Vencimiento:</span>{" "}
                {fmtFechaPunto(venc)}
              </p>
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
          </div>
        </div>

        {/* CONTACTO + BANCO */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className={LABEL} style={{ color: NAVY }}>
              Persona de contacto
            </p>
            <p className="text-[14px] font-bold text-slate-800 mt-1.5">
              {DATOS_PRESUPUESTO.contactoCargo}
            </p>
            <p className="text-[13px] text-slate-500 flex items-center gap-2 mt-1">
              <IconWhatsApp /> {DATOS_PRESUPUESTO.contactoTel}
            </p>
            <p className="text-[13px] text-slate-500 flex items-center gap-2 mt-0.5">
              <IconMail /> {DATOS_PRESUPUESTO.contactoEmail}
            </p>
          </div>
          <div className="sm:text-right">
            <p className={LABEL} style={{ color: NAVY }}>
              Datos bancarios para pagos
            </p>
            <p className="text-[14px] font-bold text-slate-800 mt-1.5">
              {DATOS_PRESUPUESTO.contactoNombre}
            </p>
            <p className="text-[13px] text-slate-500 mt-1">
              CLABE: {DATOS_PRESUPUESTO.clabe}
            </p>
            <div className="mt-1.5 sm:flex sm:justify-end">
              <LogoBBVA />
            </div>
          </div>
        </div>

        {/* TABLA DE SERVICIOS */}
        <div>
          {/* Encabezado navy redondeado */}
          <div
            className="grid items-center rounded-xl px-5 py-3 text-white text-[10px] font-bold uppercase tracking-wider"
            style={{ gridTemplateColumns: COLS, background: NAVY }}
          >
            <span>Servicio</span>
            <span>Descripción</span>
            <span className="text-right">Precio</span>
            <span className="text-right">Impuestos</span>
            <span className="text-right">Total</span>
          </div>

          {/* Filas alternadas blanco / gris redondeado */}
          <div className="mt-1.5 space-y-1">
            {presupuesto.conceptos.map((c, i) => {
              const precio = Number(c.precio) || 0;
              const iva = Math.round(precio * presupuesto.ivaTasa);
              const par = i % 2 === 1;
              return (
                <div
                  key={c.id}
                  className={`grid items-center px-5 py-3 break-inside-avoid ${
                    par ? "bg-slate-100 rounded-2xl" : "bg-white"
                  }`}
                  style={{ gridTemplateColumns: COLS }}
                >
                  <span className="text-[12px] font-bold text-slate-800 uppercase tracking-tight pr-2 leading-tight">
                    {c.servicio}
                  </span>
                  <span className="text-[12px] text-slate-500 leading-snug pr-3">
                    {c.descripcion}
                  </span>
                  <span className="text-[13px] text-slate-600 text-right tabular-nums">
                    {fmtMoneda(precio)}
                  </span>
                  <span className="text-[13px] text-slate-500 text-right tabular-nums">
                    {fmtMoneda(iva)}
                  </span>
                  <span className="text-[13px] font-bold text-slate-800 text-right tabular-nums">
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
            <div className="flex justify-between items-center bg-slate-100 rounded-2xl px-5 py-3">
              <span className="text-[13px] font-bold text-slate-700">
                Subtotal
              </span>
              <span className="text-[14px] font-bold text-slate-800 tabular-nums">
                {fmtMoneda(totales.subtotal)}
              </span>
            </div>

            {descPct > 0 && (
              <div className="flex justify-between items-center px-5 py-2.5 mt-1">
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

            <div className="flex justify-between items-center px-5 py-2.5 border-b border-slate-200">
              <span className="text-[13px] text-slate-500">Impuestos</span>
              <span className="text-[12px] text-slate-400 tabular-nums">
                {ivaPct}%
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
                Total
              </span>
              <span className="text-xl font-black tabular-nums">
                {fmtMoneda(totales.total)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 text-right mt-1.5 uppercase tracking-widest">
              Honorario mensual · IVA incluido
            </p>
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

        {/* DETALLES + CONDICIONES */}
        <div className="grid sm:grid-cols-2 gap-5 text-[11px] text-slate-500 leading-relaxed pt-1">
          <div>
            <p className={LABEL} style={{ color: NAVY }}>
              Detalles
            </p>
            <p className="mt-1.5">{DATOS_PRESUPUESTO.obligatoriedad}</p>
          </div>
          <div>
            <p className={LABEL} style={{ color: NAVY }}>
              Condiciones de pago
            </p>
            <p className="mt-1.5">{DATOS_PRESUPUESTO.condiciones}</p>
          </div>
        </div>

        {/* CIERRE */}
        <div className="border-t border-slate-100 pt-5 flex items-end justify-between gap-4">
          <p className="text-[12px] text-slate-500 leading-snug italic max-w-md">
            {DATOS_PRESUPUESTO.cierre}
          </p>
          <p className="text-[10px] text-slate-300 shrink-0">
            {DATOS_PRESUPUESTO.instagram}
          </p>
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
