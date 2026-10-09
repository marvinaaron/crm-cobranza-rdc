"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Mock interactivo y animado para el blog: muestra cómo se ve el portal del
 * cliente cuando su opinión de cumplimiento (32-D) es POSITIVA y PÚBLICA.
 *
 * Es 100% decorativo (no consulta nada real). Reproduce el flujo en bucle:
 *   consultando el servicio público del SAT → resultado "Positiva".
 * El usuario también puede volver a dispararlo con el botón "Verificar".
 *
 * Self-contained: las animaciones viven en un <style> con clases prefijadas
 * (mocp-) para no chocar con el resto del sitio.
 */

type Fase = "verificando" | "positiva";

export default function MockOpinionCumplimiento({
  titulo,
  pie,
}: {
  titulo?: string;
  pie?: string;
}) {
  const [fase, setFase] = useState<Fase>("verificando");
  const [run, setRun] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const limpiar = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    limpiar();
    setFase("verificando");
    timers.current.push(setTimeout(() => setFase("positiva"), 1700));
    // Auto-loop para que se sienta "vivo" mientras se lee el artículo.
    timers.current.push(setTimeout(() => setRun((r) => r + 1), 6200));
    return limpiar;
  }, [run, limpiar]);

  const esPositiva = fase === "positiva";

  return (
    <figure className="my-8">
      <style>{ESTILOS}</style>

      {titulo && (
        <figcaption className="mb-3 text-center text-[11px] font-black uppercase tracking-widest text-emerald-600">
          {titulo}
        </figcaption>
      )}

      <div className="relative mx-auto flex max-w-md justify-center">
        {/* Resplandor de fondo */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 -z-10 mx-auto h-full w-3/4 rounded-full blur-3xl transition-colors duration-700 ${
            esPositiva ? "bg-emerald-300/40" : "bg-slate-300/30"
          }`}
        />

        {/* Teléfono */}
        <div className="mocp-float w-[270px] rounded-[2.4rem] bg-slate-900 p-2.5 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.45)] ring-1 ring-slate-800">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-50">
            {/* Notch */}
            <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" />

            {/* Status bar */}
            <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[9px] font-bold text-slate-500">
              <span>9:41</span>
              <span className="tracking-widest">Portal del cliente</span>
            </div>

            {/* Cuerpo del portal */}
            <div className="px-3.5 pb-4 pt-2">
              <p className="px-1 text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600">
                SAT
              </p>
              <h4 className="px-1 text-[13px] font-black leading-tight text-slate-800">
                Opinión de cumplimiento (32-D)
              </h4>

              {/* Tarjeta de estatus */}
              <div
                className={`mt-2 rounded-2xl border bg-white p-3.5 transition-all duration-500 ${
                  esPositiva
                    ? "border-emerald-200 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.5)]"
                    : "border-slate-200"
                }`}
              >
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                  Estatus ante el SAT
                </p>

                {/* Estado: verificando */}
                {!esPositiva && (
                  <div className="mt-2 flex items-center gap-2.5">
                    <span className="mocp-spin inline-block h-4 w-4 rounded-full border-2 border-slate-200 border-t-slate-500" />
                    <span className="text-[11px] font-semibold text-slate-500">
                      Consultando servicio público del SAT…
                    </span>
                  </div>
                )}

                {/* Estado: positiva */}
                {esPositiva && (
                  <div className="mocp-pop mt-2">
                    <div className="flex items-center gap-2.5">
                      <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                        <span className="mocp-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/70" />
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mocp-check relative"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                      <span className="text-[15px] font-black text-emerald-600">
                        Positiva
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
                      Cumplimiento favorable ante el SAT.
                    </p>
                    <p className="mt-1 text-[9px] text-slate-400">
                      Última consulta: hoy · en tiempo real
                    </p>
                  </div>
                )}
              </div>

              {/* Documento PDF */}
              <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-slate-700">
                    Opinión_32D.pdf
                  </p>
                  <p className="text-[8px] text-slate-400">Descargable</p>
                </div>
              </div>

              {/* Badge pública */}
              <div
                className={`mt-2.5 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[9px] font-black uppercase tracking-widest transition-colors duration-500 ${
                  esPositiva
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <span aria-hidden="true">🌐</span>
                Pública · verificable en línea
              </div>
            </div>

            {/* Bottom nav */}
            <div className="flex items-center justify-around border-t border-slate-100 bg-white px-4 py-2.5 text-slate-300">
              {["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"].map(
                (d, i) => (
                  <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={i === 0 ? "text-emerald-500" : ""}
                  >
                    <path d={d} />
                  </svg>
                )
              )}
            </div>

            {/* Confeti al confirmar */}
            {esPositiva && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                {CONFETI.map((c, i) => (
                  <span
                    key={i}
                    className="mocp-confeti absolute block h-1.5 w-1.5 rounded-[1px]"
                    style={{
                      left: c.left,
                      top: "44%",
                      background: c.color,
                      animationDelay: `${c.delay}s`,
                      transform: `rotate(${c.rot}deg)`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control para volver a disparar la animación */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="inline-flex items-center gap-2 rounded-full bg-marca-navy px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Verificar de nuevo
        </button>
      </div>

      <figcaption className="mt-3 text-center text-xs text-slate-400">
        {pie ?? "Demostración del portal de RDC. El estatus se consulta directo al SAT."}
      </figcaption>
    </figure>
  );
}

const CONFETI = [
  { left: "20%", color: "#10b981", rot: -20, delay: 0 },
  { left: "35%", color: "#34d399", rot: 15, delay: 0.05 },
  { left: "50%", color: "#fbbf24", rot: 40, delay: 0.1 },
  { left: "65%", color: "#34d399", rot: -10, delay: 0.04 },
  { left: "80%", color: "#10b981", rot: 25, delay: 0.12 },
];

const ESTILOS = `
@keyframes mocp-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
.mocp-float { animation: mocp-float 4s ease-in-out infinite; }
@keyframes mocp-spin { to { transform: rotate(360deg) } }
.mocp-spin { animation: mocp-spin 0.7s linear infinite; }
@keyframes mocp-pop { 0% { opacity: 0; transform: translateY(6px) scale(0.96) } 100% { opacity: 1; transform: translateY(0) scale(1) } }
.mocp-pop { animation: mocp-pop 0.4s cubic-bezier(0.22,1,0.36,1); }
@keyframes mocp-check { from { stroke-dasharray: 0 40 } to { stroke-dasharray: 40 0 } }
.mocp-check path { stroke-dasharray: 40; animation: mocp-check 0.5s 0.15s ease-out both; }
@keyframes mocp-ping { 75%,100% { transform: scale(1.9); opacity: 0 } }
.mocp-ping { animation: mocp-ping 1.1s cubic-bezier(0,0,0.2,1) 0.3s; }
@keyframes mocp-confeti { 0% { opacity: 0; transform: translateY(0) scale(0.6) } 15% { opacity: 1 } 100% { opacity: 0; transform: translateY(-46px) scale(1) } }
.mocp-confeti { animation: mocp-confeti 0.9s ease-out 0.2s both; }
@media (prefers-reduced-motion: reduce) {
  .mocp-float, .mocp-spin, .mocp-pop, .mocp-check path, .mocp-ping, .mocp-confeti { animation: none !important; }
}
`;
