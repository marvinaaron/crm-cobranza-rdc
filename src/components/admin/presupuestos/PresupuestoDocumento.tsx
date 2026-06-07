"use client";

import Image from "next/image";
import {
  type Presupuesto,
  DATOS_PRESUPUESTO,
  calcularTotales,
  fechaVencimiento,
  fmtMoneda,
  fmtFechaLarga,
} from "@/lib/presupuestos";

/**
 * Documento imprimible del presupuesto, con identidad RDC. Se usa tanto en la
 * vista previa (wizard / detalle) como para "Descargar PDF" (vía impresión del
 * navegador). El contenedor lleva id `presupuesto-imprimible` para que el CSS
 * de impresión muestre solo este bloque.
 */
export default function PresupuestoDocumento({
  presupuesto,
}: {
  presupuesto: Presupuesto;
}) {
  const totales = calcularTotales(presupuesto.conceptos, presupuesto.ivaTasa);
  const ivaPct = Math.round(presupuesto.ivaTasa * 100);
  const venc = fechaVencimiento(presupuesto);

  return (
    <div
      id="presupuesto-imprimible"
      className="documento-presupuesto bg-white text-slate-800 mx-auto w-full max-w-[820px] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(15,23,42,0.12)] print:shadow-none print:rounded-none"
      style={{
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* HEADER navy con logo */}
      <div className="bg-[#0F172A] px-8 py-7 flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <Image
            src="/logos/rdc-white.png"
            alt="RDC Contadores"
            width={132}
            height={44}
            className="h-11 w-auto object-contain"
          />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold tracking-[0.35em] text-violet-300 uppercase">
            Presupuesto
          </p>
          <p className="text-white font-black text-lg leading-tight mt-0.5">
            {presupuesto.folio}
          </p>
          <p className="text-slate-300 text-[11px] mt-1">
            Fecha: {fmtFechaLarga(presupuesto.fecha)}
          </p>
        </div>
      </div>

      <div className="p-8 space-y-7">
        {/* CLIENTE */}
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase mb-1">
              Cliente
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight">
              {presupuesto.cliente.razonSocial || "—"}
            </p>
            {presupuesto.cliente.giro && (
              <p className="text-sm text-slate-500">{presupuesto.cliente.giro}</p>
            )}
            <div className="text-[12px] text-slate-500 mt-1 space-y-0.5">
              {presupuesto.cliente.rfc && <p>RFC: {presupuesto.cliente.rfc}</p>}
              {presupuesto.cliente.email && <p>{presupuesto.cliente.email}</p>}
              {presupuesto.cliente.telefono && (
                <p>{presupuesto.cliente.telefono}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold tracking-[0.2em] text-violet-500 uppercase">
                Honorario mensual
              </p>
              <p className="text-2xl font-black text-violet-700 leading-none mt-1">
                {fmtMoneda(totales.total)}
              </p>
              <p className="text-[10px] text-violet-400 mt-1">IVA incluido</p>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Vigencia: {fmtFechaLarga(venc)}
            </p>
          </div>
        </div>

        {/* TABLA DE SERVICIOS */}
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-bold">Servicio</th>
                <th className="px-4 py-3 font-bold text-right w-24">Precio</th>
                <th className="px-4 py-3 font-bold text-right w-24">IVA</th>
                <th className="px-4 py-3 font-bold text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {presupuesto.conceptos.map((c) => {
                const iva = Math.round((Number(c.precio) || 0) * presupuesto.ivaTasa);
                return (
                  <tr
                    key={c.id}
                    className="border-t border-slate-100 align-top break-inside-avoid"
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800 text-[13px] uppercase tracking-tight">
                        {c.servicio}
                      </p>
                      {c.descripcion && (
                        <p className="text-[12px] text-slate-500 leading-snug mt-0.5">
                          {c.descripcion}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-[13px] text-slate-600 tabular-nums">
                      {fmtMoneda(Number(c.precio) || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-[13px] text-slate-400 tabular-nums">
                      {fmtMoneda(iva)}
                    </td>
                    <td className="px-4 py-3 text-right text-[13px] font-bold text-slate-800 tabular-nums">
                      {fmtMoneda((Number(c.precio) || 0) + iva)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TOTALES */}
        <div className="flex justify-end">
          <div className="w-full max-w-[280px] space-y-1.5">
            <div className="flex justify-between text-[13px] text-slate-500">
              <span>Subtotal</span>
              <span className="tabular-nums">{fmtMoneda(totales.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-slate-500">
              <span>Impuestos (IVA {ivaPct}%)</span>
              <span className="tabular-nums">{fmtMoneda(totales.iva)}</span>
            </div>
            <div className="flex justify-between items-center bg-[#0F172A] text-white rounded-xl px-4 py-3 mt-1">
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Total mensual
              </span>
              <span className="text-lg font-black tabular-nums">
                {fmtMoneda(totales.total)}
              </span>
            </div>
          </div>
        </div>

        {/* NOTAS */}
        {presupuesto.notas && (
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">
              Notas
            </p>
            <p className="text-[12px] text-amber-800 whitespace-pre-wrap leading-snug">
              {presupuesto.notas}
            </p>
          </div>
        )}

        {/* CONDICIONES + OBLIGATORIEDAD */}
        <div className="grid sm:grid-cols-2 gap-4 text-[11px] text-slate-500 leading-snug">
          <div>
            <p className="font-bold uppercase tracking-widest text-slate-400 mb-1">
              Condiciones de pago
            </p>
            <p>{DATOS_PRESUPUESTO.condiciones}</p>
          </div>
          <div>
            <p className="font-bold uppercase tracking-widest text-slate-400 mb-1">
              Importante
            </p>
            <p>{DATOS_PRESUPUESTO.obligatoriedad}</p>
          </div>
        </div>

        {/* DATOS BANCARIOS + CONTACTO */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-100 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Datos bancarios
            </p>
            <p className="text-[13px] font-bold text-slate-800">
              {DATOS_PRESUPUESTO.banco}
            </p>
            <p className="text-[12px] text-slate-500">
              CLABE: {DATOS_PRESUPUESTO.clabe}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Persona de contacto
            </p>
            <p className="text-[13px] font-bold text-slate-800">
              {DATOS_PRESUPUESTO.contactoNombre}
            </p>
            <p className="text-[12px] text-slate-500">
              {DATOS_PRESUPUESTO.contactoTel} · {DATOS_PRESUPUESTO.contactoEmail}
            </p>
          </div>
        </div>

        {/* CIERRE + FIRMA */}
        <div className="border-t border-slate-100 pt-5">
          <p className="text-[12px] text-slate-500 leading-snug italic">
            {DATOS_PRESUPUESTO.cierre}
          </p>
          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="w-48 border-b-2 border-slate-300 mb-1" />
              <p className="text-[11px] font-bold text-slate-700">
                {DATOS_PRESUPUESTO.contactoCargo}
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                {DATOS_PRESUPUESTO.despacho} · {DATOS_PRESUPUESTO.despachoLinea2}
              </p>
            </div>
            <p className="text-[10px] text-slate-300">{DATOS_PRESUPUESTO.instagram}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Lanza la impresión del documento (Guardar como PDF en el diálogo). */
export function imprimirPresupuesto() {
  if (typeof document === "undefined") return;
  document.body.classList.add("print-presupuesto");
  const limpiar = () => {
    document.body.classList.remove("print-presupuesto");
    window.removeEventListener("afterprint", limpiar);
  };
  window.addEventListener("afterprint", limpiar);
  window.print();
  // Respaldo por si afterprint no dispara (algunos navegadores).
  setTimeout(limpiar, 1500);
}
