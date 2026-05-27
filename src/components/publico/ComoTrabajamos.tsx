"use client";

import { useState } from "react";

const PASOS_CUMPLIMIENTO = [
  {
    numero: 1,
    titulo: "Por trabajar",
    descripcion:
      "Recibimos tus documentos, CFDIs e información del mes. Confirmamos qué obligaciones aplican (SAT, IMSS, estatales).",
    color: "bg-slate-200 text-slate-700",
  },
  {
    numero: 2,
    titulo: "Iniciando",
    descripcion:
      "Iniciamos la contabilidad: clasificación de ingresos y deducciones, cálculo preliminar de impuestos.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    numero: 3,
    titulo: "Preliminar",
    descripcion:
      "Publicamos en tu portal un previo de impuestos para que lo revises y valides antes de presentar.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    numero: 4,
    titulo: "Aceptación",
    descripcion:
      "Una vez aceptado el previo, generamos las declaraciones definitivas y los documentos que las soportan.",
    color: "bg-violet-100 text-violet-700",
  },
  {
    numero: 5,
    titulo: "Declaraciones",
    descripcion:
      "Publicamos en tu portal los acuses, líneas de captura y todos los PDFs listos para pagar.",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    numero: 6,
    titulo: "Pago",
    descripcion:
      "Subes tu comprobante de pago al portal. Validamos que coincida con la línea de captura emitida.",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    numero: 7,
    titulo: "Completado",
    descripcion:
      "Cerramos el periodo. Queda todo archivado y accesible en tu portal para futuras consultas.",
    color: "bg-emerald-600 text-white",
  },
];

const PASOS_COBRANZA = [
  {
    numero: 1,
    titulo: "Compromiso mensual",
    descripcion: "Acordamos contigo el día de pago y el monto de honorarios.",
  },
  {
    numero: 2,
    titulo: "Recordatorio",
    descripcion: "Te avisamos amablemente al inicio del mes y antes del vencimiento.",
  },
  {
    numero: 3,
    titulo: "Pago en línea",
    descripcion: "Pagas desde el portal con Stripe o por transferencia bancaria.",
  },
  {
    numero: 4,
    titulo: "Comprobante",
    descripcion: "Si pagas por transferencia, subes tu comprobante y lo validamos.",
  },
  {
    numero: 5,
    titulo: "Factura",
    descripcion: "Te enviamos la factura digital lista en tu portal.",
  },
];

export default function ComoTrabajamos() {
  const [pasoActivo, setPasoActivo] = useState(1);

  const paso = PASOS_CUMPLIMIENTO.find((p) => p.numero === pasoActivo) ?? PASOS_CUMPLIMIENTO[0];

  return (
    <section id="proceso" className="py-10 sm:py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy">
            Cómo trabajamos
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Un proceso claro,{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
              mes con mes
            </span>
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            En RDC seguimos un flujo estandarizado para que sepas en qué etapa está tu
            contabilidad en cualquier momento. Sin sorpresas, sin retrasos.
          </p>
        </div>

        {/* TIMELINE INTERACTIVO DE 7 PASOS */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50/40 ring-1 ring-slate-200 p-6 sm:p-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Cumplimiento fiscal · 7 pasos
            </p>
            <p className="hidden sm:block text-[11px] font-semibold text-slate-400">
              Mes vencido
            </p>
          </div>

          {/* Pasos clickables (versión desktop: linea horizontal) */}
          <div className="hidden md:block">
            <div className="relative mt-6">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" aria-hidden />
              <div
                className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all"
                style={{ width: `${((pasoActivo - 1) / (PASOS_CUMPLIMIENTO.length - 1)) * 100}%` }}
                aria-hidden
              />
              <div className="relative grid grid-cols-7 gap-2">
                {PASOS_CUMPLIMIENTO.map((p) => {
                  const activo = p.numero === pasoActivo;
                  const completado = p.numero < pasoActivo;
                  return (
                    <button
                      key={p.numero}
                      type="button"
                      onClick={() => setPasoActivo(p.numero)}
                      className="group flex flex-col items-center text-center"
                    >
                      <span
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ring-4 transition-all ${
                          activo
                            ? "bg-slate-900 text-white ring-indigo-100 scale-110"
                            : completado
                              ? "bg-emerald-600 text-white ring-emerald-100"
                              : "bg-white text-slate-500 ring-slate-50 group-hover:bg-slate-100"
                        }`}
                      >
                        {completado ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          p.numero
                        )}
                      </span>
                      <span
                        className={`mt-3 text-xs font-bold leading-tight ${
                          activo ? "text-slate-900" : "text-slate-500"
                        }`}
                      >
                        {p.titulo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              <div className="lg:col-span-2 bg-white rounded-2xl ring-1 ring-slate-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${paso.color}`}>
                    Paso {paso.numero}
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{paso.titulo}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{paso.descripcion}</p>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPasoActivo(Math.max(1, pasoActivo - 1))}
                    disabled={pasoActivo === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasoActivo(Math.min(7, pasoActivo + 1))}
                    disabled={pasoActivo === 7}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-30"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  ¿Qué ves en tu portal?
                </p>
                <ul className="space-y-2.5 text-sm">
                  {[
                    "Estado del mes en vivo",
                    "Previo de impuestos antes de pagar",
                    "Acuses y líneas de captura",
                    "Subida de comprobante",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Versión mobile: vertical, todos los pasos visibles */}
          <div className="md:hidden mt-6 space-y-3">
            {PASOS_CUMPLIMIENTO.map((p) => (
              <div
                key={p.numero}
                className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 flex gap-4"
              >
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${p.color}`}>
                  {p.numero}
                </span>
                <div>
                  <p className="text-sm font-black text-slate-900">{p.titulo}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COBRANZA · 5 pasos en cards */}
        <div className="mt-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                Cobranza · 5 pasos
              </p>
              <h3 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Honorarios sin fricción
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PASOS_COBRANZA.map((p, idx) => (
              <div
                key={p.numero}
                className="relative bg-white rounded-2xl ring-1 ring-slate-200 p-5 hover:ring-emerald-500 hover:shadow-lg transition-all"
              >
                <span className="absolute -top-3 -left-3 w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                  {p.numero}
                </span>
                {idx < PASOS_COBRANZA.length - 1 ? (
                  <span className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-emerald-500 z-10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                ) : null}
                <p className="mt-3 text-sm font-black text-slate-900">{p.titulo}</p>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{p.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
