"use client";

import { useState } from "react";
import Link from "next/link";
import { FAQ_PUBLICAS } from "@/lib/faq-publicas";

/**
 * Acordeón de preguntas frecuentes para la página pública.
 * El contenido vive en `src/lib/faq-publicas.ts` para que también pueda
 * leerlo el Server Component que genera el JSON-LD del schema FAQPage.
 */

function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform shrink-0 ${abierto ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function PreguntasFrecuentesContenido() {
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy">
            Preguntas frecuentes
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Las dudas que nos hacen antes de empezar
          </h1>
          <p className="mt-3 text-slate-600">
            Si la tuya no aparece aquí, escríbenos por WhatsApp o agenda una llamada.
            Sin compromiso.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_PUBLICAS.map((faq, idx) => {
            const abiertoEsta = abierta === idx;
            return (
              <div
                key={faq.pregunta}
                className={`rounded-2xl ring-1 transition-all ${
                  abiertoEsta
                    ? "bg-indigo-50/50 ring-indigo-200 shadow-sm"
                    : "bg-white ring-slate-200 hover:ring-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setAbierta(abiertoEsta ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={abiertoEsta}
                >
                  <span className="text-[15px] font-black text-slate-900">
                    {faq.pregunta}
                  </span>
                  <span
                    className={`${
                      abiertoEsta ? "text-marca-navy" : "text-slate-500"
                    }`}
                  >
                    <Chevron abierto={abiertoEsta} />
                  </span>
                </button>
                {abiertoEsta ? (
                  <div className="px-5 pb-5 -mt-1 text-sm text-slate-700 leading-relaxed">
                    {faq.respuesta}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-gradient-to-br from-slate-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black">
            ¿No resolvimos tu duda?
          </h2>
          <p className="mt-3 text-slate-300 max-w-xl mx-auto">
            Mándanos un mensaje y un asesor te contesta en horas hábiles. Si
            prefieres llamada, te damos un espacio cómodo en la agenda.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              Hablar con un asesor
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
