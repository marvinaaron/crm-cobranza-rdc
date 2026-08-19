"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Fase = "revisando" | "vigente";

/**
 * Mock del certificado de e.firma: pasa de “revisando vigencia” a
 * “vigente” para ilustrar el requisito operativo de la regularización.
 */
export default function MockEfirmaVigente({
  titulo,
  pie,
}: {
  titulo?: string;
  pie?: string;
}) {
  const [fase, setFase] = useState<Fase>("revisando");
  const [run, setRun] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const limpiar = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    limpiar();
    setFase("revisando");
    timers.current.push(setTimeout(() => setFase("vigente"), 1400));
    timers.current.push(setTimeout(() => setRun((r) => r + 1), 7000));
    return limpiar;
  }, [run, limpiar]);

  const vigente = fase === "vigente";

  return (
    <figure className="my-8">
      <style>{`
        @keyframes moef-spin { to { transform: rotate(360deg); } }
        .moef-spin { animation: moef-spin 0.8s linear infinite; }
        @keyframes moef-pop {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        .moef-pop { animation: moef-pop 0.35s ease-out both; }
      `}</style>
      {titulo && (
        <figcaption className="mb-3 text-center text-[11px] font-black uppercase tracking-widest text-amber-700">
          {titulo}
        </figcaption>
      )}
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
          SAT · Certificado de e.firma
        </p>
        <h4 className="mt-1 text-[15px] font-black text-slate-800">
          Firma electrónica (FIEL)
        </h4>
        <div
          className={`mt-3 rounded-xl border px-3.5 py-3 transition-colors ${
            vigente
              ? "border-emerald-200 bg-emerald-50/80"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          {!vigente ? (
            <div className="flex items-center gap-2.5">
              <span className="moef-spin inline-block h-4 w-4 rounded-full border-2 border-slate-200 border-t-amber-600" />
              <span className="text-[12px] font-semibold text-slate-500">
                Revisando vigencia del certificado…
              </span>
            </div>
          ) : (
            <div className="moef-pop">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                Vigente
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                Lista para firmar trámites
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                Vence el 14 mar 2028 · 4 años de vigencia
              </p>
            </div>
          )}
        </div>
        <ul className="mt-3 space-y-1.5">
          {[
            "Declaraciones complementarias",
            "Compensación de saldos a favor",
            "Regularización de ejercicios anteriores",
          ].map((item) => (
            <li
              key={item}
              className={`flex items-center gap-2 text-[12px] font-semibold ${
                vigente ? "text-slate-700" : "text-slate-400"
              }`}
            >
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                  vigente
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {vigente ? "✓" : "·"}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      {pie && (
        <p className="mt-2 text-center text-xs text-slate-400">{pie}</p>
      )}
    </figure>
  );
}
