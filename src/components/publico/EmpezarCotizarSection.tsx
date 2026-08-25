"use client";

import { useCallback, useState } from "react";
import Fiscalino, { type FiscalinoMood } from "@/components/Fiscalino";
import ChecklistAutocalificacion, {
  type ChecklistEstado,
} from "@/components/publico/ChecklistAutocalificacion";
import EmpezarForm from "@/components/publico/EmpezarForm";
import type { TonoUrgencia } from "@/lib/autocalificacion-urgencia";

function moodDesdeTono(tono: TonoUrgencia): FiscalinoMood {
  if (tono === "urgente") return "desperate";
  if (tono === "calido") return "worried";
  return "happy";
}

/**
 * Layout cotizar a dos columnas (casi full-bleed):
 * izquierda = formulario · derecha = Fiscalino (invite) → flip → cuestionario.
 * El checklist es opcional; el CTA de color del form envía el lead.
 */
export default function EmpezarCotizarSection() {
  const [tono, setTono] = useState<TonoUrgencia>("neutro");
  const [items, setItems] = useState<string[]>([]);
  const [testAbierto, setTestAbierto] = useState(false);

  const onChecklist = useCallback((estado: ChecklistEstado) => {
    setTono(estado.tono);
    setItems(estado.items);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 xl:gap-8 items-start min-h-[calc(100dvh-11rem)]">
      {/* Izquierda — datos */}
      <div className="lg:sticky lg:top-20 self-start w-full max-w-xl mx-auto lg:mx-0 lg:max-w-none">
        <EmpezarForm tono={tono} checklistItems={items} embebido />
      </div>

      {/* Derecha — Fiscalino / test con flip */}
      <div className="w-full max-w-xl mx-auto lg:mx-0 lg:max-w-none [perspective:1400px]">
        <div
          className={`empezar-flip-card relative w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] ${
            testAbierto ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Cara A — invite */}
          <div
            className={`${
              testAbierto ? "absolute inset-0" : "relative"
            } [backface-visibility:hidden]`}
          >
            <button
              type="button"
              onClick={() => setTestAbierto(true)}
              className="group relative w-full min-h-[min(420px,70dvh)] lg:min-h-[min(520px,calc(100dvh-12rem))] rounded-3xl bg-white ring-1 ring-violet-100 shadow-lg shadow-violet-100/50 overflow-hidden text-left transition-all hover:ring-violet-300 hover:shadow-xl hover:shadow-violet-200/60 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label="Iniciar test de autocalificación con Fiscalino"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-16 -bottom-20 h-56 w-56 rounded-full bg-violet-200/50 blur-3xl group-hover:bg-violet-300/40 transition-colors"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-indigo-100/60 blur-3xl"
              />

              <div className="relative flex flex-col items-center justify-center gap-5 px-6 py-10 sm:py-12 h-full">
                {/* Globo de diálogo */}
                <div className="relative max-w-[17rem] sm:max-w-xs">
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white px-4 py-3.5 shadow-lg shadow-violet-300/50 ring-1 ring-white/20 animate-[fiscalino-enter_0.5s_ease-out]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-100/90 mb-1">
                      Fiscalino pregunta
                    </p>
                    <p className="text-base sm:text-lg font-black leading-snug">
                      ¿Te late un test rapidito?
                    </p>
                    <p className="mt-1.5 text-xs text-indigo-100/90 leading-snug">
                      30 segundos. Sin compromiso. Solo marca lo que te suene.
                    </p>
                  </div>
                  {/* Pico del globo */}
                  <span
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45 bg-violet-600"
                  />
                </div>

                <div className="mt-2 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2">
                  <Fiscalino mood="happy" size={168} />
                </div>

                <span className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-md group-hover:bg-violet-700 transition-colors">
                  ¡Sí, vamos!
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>

                <p className="text-[11px] text-slate-400 font-medium">
                  Opcional — puedes cotizar sin hacer el test
                </p>
              </div>
            </button>
          </div>

          {/* Cara B — cuestionario */}
          <div
            className={`${
              testAbierto ? "relative" : "absolute inset-0"
            } [backface-visibility:hidden] [transform:rotateY(180deg)]`}
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Fiscalino mood={moodDesdeTono(tono)} size={40} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                      Test con Fiscalino
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Marca lo que te suene — es opcional
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTestAbierto(false)}
                  className="shrink-0 h-8 px-3 rounded-lg bg-white ring-1 ring-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                >
                  Volver
                </button>
              </div>
              <ChecklistAutocalificacion ocultarCta onChange={onChecklist} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
