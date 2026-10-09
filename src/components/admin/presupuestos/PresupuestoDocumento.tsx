"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import qrcode from "qrcode-generator";
import {
  type Presupuesto,
  DATOS_PRESUPUESTO,
  calcularTotales,
  fechaVencimiento,
  fmtMoneda,
  fmtFechaPunto,
} from "@/lib/presupuestos";
import { SITE_URL } from "@/lib/seo/site";

/** Navy de marca para el encabezado, recuadro de honorario y total. */
const NAVY = "#0F172A";
/** Gris neutro para las etiquetas de sección (CLIENTE, SERVICIO, etc.). */
const GRIS_LABEL = "#94A3B8";

const LABEL = "text-[10px] font-bold uppercase tracking-[0.22em]";

/** Beneficios incluidos en todo plan RDC (refuerzan el valor del honorario). */
const VALOR_INCLUIDO = [
  "Portal del cliente 24/7",
  "Licencia CONTPAQi incluida",
  "Cumplimiento puntual, cero multas",
];

/**
 * QR moderno (puntos navy + esquinas redondeadas + badge con la R de RDC al
 * centro) que apunta SIEMPRE al sitio oficial. Es FIJO: no cambia por
 * presupuesto, así nunca puede abrir la propuesta de otro cliente ni romperse
 * si se regenera un token. Se dibuja como SVG en línea (síncrono, sin estado)
 * y usa nivel de corrección H para escanear bien aun con el logo encima.
 */
function QrSitioOficial({ size = 78 }: { size?: number }) {
  const qr = qrcode(0, "H");
  qr.addData(SITE_URL);
  qr.make();
  const count = qr.getModuleCount();

  // Las tres esquinas (ojos) las dibujamos aparte con bordes redondeados.
  const enOjo = (r: number, c: number) =>
    (r < 7 && c < 7) ||
    (r < 7 && c >= count - 7) ||
    (r >= count - 7 && c < 7);

  // Zona central reservada para el badge con la R (la cubre el logo encima).
  const centro = (count - 1) / 2;
  const radio = Math.round(count * 0.15);
  const enCentro = (r: number, c: number) =>
    Math.abs(r - centro) <= radio && Math.abs(c - centro) <= radio;

  const puntos: ReactNode[] = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (!qr.isDark(r, c) || enOjo(r, c) || enCentro(r, c)) continue;
      puntos.push(
        <circle key={`${r}-${c}`} cx={c + 0.5} cy={r + 0.5} r={0.42} fill={NAVY} />
      );
    }
  }

  const ojo = (fr: number, fc: number, key: string) => (
    <g key={key}>
      <rect
        x={fc + 0.5}
        y={fr + 0.5}
        width={6}
        height={6}
        rx={2}
        ry={2}
        fill="none"
        stroke={NAVY}
        strokeWidth={1}
      />
      <rect x={fc + 2} y={fr + 2} width={3} height={3} rx={1} ry={1} fill={NAVY} />
    </g>
  );

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${count} ${count}`}
        width={size}
        height={size}
        shapeRendering="geometricPrecision"
      >
        <rect x={0} y={0} width={count} height={count} fill="#ffffff" />
        {ojo(0, 0, "tl")}
        {ojo(0, count - 7, "tr")}
        {ojo(count - 7, 0, "bl")}
        {puntos}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex items-center justify-center rounded-[6px]"
          style={{ width: "30%", height: "30%", background: NAVY }}
        >
          <Image
            src="/logos/r-white.png"
            alt="RDC"
            width={40}
            height={40}
            className="h-[62%] w-[62%] object-contain"
          />
        </div>
      </div>
    </div>
  );
}

/** Check redondo navy para la lista de valor incluido. */
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="11" fill={NAVY} />
      <path
        d="M7 12.5l3.2 3.2L17 9"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
          <p className="text-[26px] sm:text-[32px] font-black tracking-tight text-white leading-none">
            PRESUPUESTO
          </p>
          <p className="text-[11px] font-semibold text-slate-300 mt-2 tracking-wide tabular-nums">
            N° {presupuesto.folio}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
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
          <div className="flex flex-col items-end shrink-0">
            <div
              className="rounded-xl px-4 py-2.5 border-2 text-right"
              style={{ borderColor: NAVY }}
            >
              <p
                className="text-[9px] font-bold uppercase tracking-[0.16em]"
                style={{ color: NAVY }}
              >
                Honorario mensual
              </p>
              <p
                className="text-2xl font-black leading-none mt-0.5 tabular-nums"
                style={{ color: NAVY }}
              >
                {fmtMoneda(totales.total)}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">IVA incluido</p>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5">
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: GRIS_LABEL }}
              >
                Válido hasta
              </span>
              <span
                className="text-[10px] font-bold tabular-nums"
                style={{ color: NAVY }}
              >
                {fmtFechaPunto(venc)}
              </span>
            </div>
          </div>
        </div>

        {/* PERSONA DE CONTACTO + DATOS BANCARIOS (arriba, para dar impacto).
            Siempre 2 columnas: el documento se dibuja a ancho fijo (800px) y se
            escala, así que el breakpoint sm: del viewport no aplica en móvil. */}
        <div className="grid grid-cols-2 gap-4 border-y border-slate-200 py-4">
          <div>
            <p className={LABEL} style={{ color: GRIS_LABEL }}>
              Persona de contacto
            </p>
            <p className="text-[14px] font-bold text-slate-800 mt-1.5">
              {DATOS_PRESUPUESTO.contactoNombre}
            </p>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {DATOS_PRESUPUESTO.contactoTel}
            </p>
            <p className="text-[13px] text-slate-500">
              {DATOS_PRESUPUESTO.contactoEmail}
            </p>
          </div>
          <div className="text-right">
            <p className={LABEL} style={{ color: GRIS_LABEL }}>
              Datos bancarios para pagos
            </p>
            <p className="text-[14px] font-bold text-slate-800 mt-1.5">
              {DATOS_PRESUPUESTO.banco}
            </p>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {DATOS_PRESUPUESTO.contactoNombre}
            </p>
            <p className="text-[13px] text-slate-500">
              CLABE: {DATOS_PRESUPUESTO.clabe}
            </p>
          </div>
        </div>

        {/* TABLA DE SERVICIOS */}
        <div>
          {/* Encabezado: barra navy redondeada con texto blanco */}
          <div
            className="grid items-center rounded-xl px-5 py-3 text-white text-[10px] font-bold uppercase tracking-wider"
            style={{ gridTemplateColumns: COLS, background: NAVY }}
          >
            <span>Servicio</span>
            <span className="text-right">Precio</span>
            <span className="text-right">IVA</span>
            <span className="text-right">Total</span>
          </div>

          {/* Filas alternadas blanco / gris. Color en línea para que el modo
              oscuro del admin nunca las pinte de navy. */}
          <div className="mt-1.5 space-y-1">
            {presupuesto.conceptos.map((c, i) => {
              const precio = Number(c.precio) || 0;
              const iva = Math.round(precio * presupuesto.ivaTasa);
              const par = i % 2 === 1;
              return (
                <div
                  key={c.id}
                  className="grid px-5 py-3 break-inside-avoid rounded-2xl"
                  style={{
                    gridTemplateColumns: COLS,
                    background: par ? "#F1F5F9" : "#FFFFFF",
                  }}
                >
                  <div className="pr-4 min-w-0">
                    <p
                      className="text-[12px] font-bold uppercase tracking-tight leading-tight"
                      style={{ color: "#1E293B" }}
                    >
                      {c.servicio}
                    </p>
                    {c.descripcion && (
                      <p
                        className="text-[12px] leading-snug mt-0.5"
                        style={{ color: "#64748B" }}
                      >
                        {c.descripcion}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-[13px] text-right tabular-nums self-start"
                    style={{ color: "#475569" }}
                  >
                    {fmtMoneda(precio)}
                  </span>
                  <span
                    className="text-[13px] text-right tabular-nums self-start"
                    style={{ color: "#94A3B8" }}
                  >
                    {fmtMoneda(iva)}
                  </span>
                  <span
                    className="text-[13px] font-bold text-right tabular-nums self-start"
                    style={{ color: "#1E293B" }}
                  >
                    {fmtMoneda(precio + iva)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* VALOR INCLUIDO + TOTALES */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
          <div className="space-y-2 pt-1">
            <p className={LABEL} style={{ color: GRIS_LABEL }}>
              Tu plan incluye
            </p>
            {VALOR_INCLUIDO.map((v) => (
              <div key={v} className="flex items-center gap-2">
                <IconCheck />
                <span className="text-[12px] font-semibold text-slate-700">
                  {v}
                </span>
              </div>
            ))}
          </div>
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

        {/* CIERRE + FIRMA */}
        <div className="pt-1">
          <p className="text-[12px] text-slate-500 leading-snug italic">
            {DATOS_PRESUPUESTO.cierre}
          </p>
          <div className="flex items-end justify-between gap-4 mt-6">
            <div>
              <p className="text-[14px] font-black text-slate-800">
                {DATOS_PRESUPUESTO.contactoCargo}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">
                {DATOS_PRESUPUESTO.despacho}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {presupuesto.estado === "aceptado" && (
                <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-500 px-3 py-1.5 -rotate-3">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <div className="leading-tight">
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                      Aceptado digitalmente
                    </p>
                    <p className="text-[9px] text-emerald-500 tabular-nums">
                      {fmtFechaPunto(presupuesto.aceptadoEn ?? new Date())}
                    </p>
                  </div>
                </div>
              )}
              <QrSitioOficial size={52} />
              <p
                className="text-[11px] font-semibold"
                style={{ color: NAVY }}
              >
                {DATOS_PRESUPUESTO.instagram}
              </p>
            </div>
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
