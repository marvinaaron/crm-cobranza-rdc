"use client";

import { useCallback, useEffect, useState } from "react";
import PillGrupo from "@/components/publico/PillGrupo";
import ModalPaywallFacturacion from "@/components/publico/ModalPaywallFacturacion";
import { fmtMxn } from "@/lib/fiscal/facturacion-neto";
import {
  OPERACIONES_META,
  type RegimenEmisor,
  type TipoEmisor,
  type TipoOperacion,
  type TipoReceptor,
} from "@/lib/fiscal/facturacion-tablas";
import type { EstadoUsoFacturacion } from "@/lib/herramientas/facturacion-uso";

const INPUT_BASE =
  "w-full h-14 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-2xl font-black tabular-nums tracking-tight text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

type ResultadoApi = {
  subtotal: number;
  iva: number;
  retIva: number;
  retIsr: number;
  totalCfdi: number;
  netoVerificado: number;
  diferencialRedondeo: number;
  lineas: Array<{ concepto: string; monto: number; aplica: boolean; texto?: string }>;
  fundamentos: Array<{ ley: string; articulo: string; nota?: string }>;
  advertencias: string[];
  textoCopiar: string;
};

function parseMonto(valor: string): number {
  const limpio = valor.replace(/[^0-9.]/g, "");
  const partes = limpio.split(".");
  const normalizado =
    partes.length > 2 ? `${partes[0]}.${partes.slice(1).join("")}` : limpio;
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : NaN;
}

const OPERACIONES_PILLS: TipoOperacion[] = [
  "honorarios",
  "venta_bienes",
  "arrendamiento_domestico",
  "arrendamiento_amueblado",
  "arrendamiento_comercial",
  "comisionista",
  "autotransporte",
  "agapes",
];

export default function PanelCalculadoraFacturacion() {
  const [emisor, setEmisor] = useState<TipoEmisor>("pf");
  const [regimen, setRegimen] = useState<RegimenEmisor>("resico");
  const [receptor, setReceptor] = useState<TipoReceptor>("pm");
  const [operacion, setOperacion] = useState<TipoOperacion>("honorarios");
  const [netoTexto, setNetoTexto] = useState("");
  const [ivaFrontera, setIvaFrontera] = useState(false);
  const [agapesExento, setAgapesExento] = useState(false);
  const [avanzadoAbierto, setAvanzadoAbierto] = useState(false);

  const [uso, setUso] = useState<EstadoUsoFacturacion | null>(null);
  const [resultado, setResultado] = useState<ResultadoApi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [paywallAbierto, setPaywallAbierto] = useState(false);

  const cargarUso = useCallback(async () => {
    try {
      const res = await fetch("/api/herramientas/facturacion/uso");
      if (res.ok) {
        const data = (await res.json()) as EstadoUsoFacturacion;
        setUso(data);
      }
    } catch {
      // Sin bloquear la UI si falla el contador.
    }
  }, []);

  useEffect(() => {
    void cargarUso();
  }, [cargarUso]);

  useEffect(() => {
    setResultado(null);
    setError(null);
  }, [emisor, regimen, receptor, operacion, netoTexto, ivaFrontera, agapesExento]);

  const netoNum = parseMonto(netoTexto);
  const formularioCompleto = Number.isFinite(netoNum) && netoNum > 0;

  const calcular = async () => {
    if (!formularioCompleto) return;
    setCargando(true);
    setError(null);
    setResultado(null);

    try {
      const res = await fetch("/api/herramientas/facturacion/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emisor,
          regimen: emisor === "pf" ? regimen : undefined,
          receptor,
          operacion,
          netoDeseado: netoNum,
          ivaFrontera,
          agapesExento,
        }),
      });

      const data = await res.json();

      if (res.status === 402) {
        setUso(data.uso ?? uso);
        setPaywallAbierto(true);
        setError(data.error ?? "Límite de consultas alcanzado.");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "No se pudo calcular.");
        return;
      }

      setResultado(data.resultado as ResultadoApi);
      if (data.uso) setUso(data.uso);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const copiar = async () => {
    if (!resultado?.textoCopiar) return;
    try {
      await navigator.clipboard.writeText(resultado.textoCopiar);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // silencioso
    }
  };

  const limpiar = () => {
    setNetoTexto("");
    setResultado(null);
    setError(null);
  };

  const restantesLabel =
    uso && Number.isFinite(uso.restantes) && !uso.esPro
      ? `${uso.restantes} consulta${uso.restantes === 1 ? "" : "s"} gratis`
      : uso?.esPro
        ? "Pro ilimitado"
        : "3 consultas gratis";

  return (
    <div className="space-y-6">
      {/* Barra de uso freemium */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-4 py-2.5">
        <p className="text-[11px] font-bold text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {restantesLabel}
          </span>
        </p>
        {uso && !uso.puedeCalcular && (
          <button
            type="button"
            onClick={() => setPaywallAbierto(true)}
            className="text-[11px] font-black text-violet-600 hover:text-violet-800 uppercase tracking-wider"
          >
            Desbloquear Pro →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6">
        {/* Entradas */}
        <div className="space-y-5">
          <PillGrupo
            label="Emisor"
            value={emisor}
            onChange={setEmisor}
            colorActivo="indigo"
            opciones={[
              { value: "pf", label: "Persona física" },
              { value: "pm", label: "Persona moral" },
            ]}
          />

          {emisor === "pf" && (
            <PillGrupo
              label="Régimen emisor"
              value={regimen}
              onChange={setRegimen}
              colorActivo="violet"
              opciones={[
                { value: "resico", label: "RESICO" },
                { value: "pfae", label: "PFAE" },
              ]}
            />
          )}

          <PillGrupo
            label="Receptor"
            hint={
              receptor === "pm"
                ? "Persona moral: aplica retenciones de ISR e IVA según operación."
                : "Persona física: sin retenciones en estos escenarios."
            }
            value={receptor}
            onChange={setReceptor}
            colorActivo="emerald"
            opciones={[
              { value: "pm", label: "Persona moral" },
              { value: "pf", label: "Persona física" },
            ]}
          />

          <PillGrupo
            label="Tipo de operación"
            value={operacion}
            onChange={setOperacion}
            colorActivo="indigo"
            opciones={OPERACIONES_PILLS.map((op) => ({
              value: op,
              label: OPERACIONES_META[op].label,
            }))}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Neto que quieres recibir
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400"
                aria-hidden="true"
              >
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={netoTexto}
                onChange={(e) => setNetoTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void calcular();
                }}
                placeholder="10,000"
                className={`${INPUT_BASE} placeholder:font-bold placeholder:text-slate-300`}
                autoComplete="off"
                spellCheck={false}
                aria-label="Neto deseado en pesos"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Monto que quieres recibir en tu cuenta después de retenciones.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[5000, 10000, 25000, 50000].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setNetoTexto(m.toLocaleString("es-MX"))}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition"
                >
                  {fmtMxn(m)}
                </button>
              ))}
            </div>
          </div>

          {/* Avanzado */}
          <details
            open={avanzadoAbierto}
            onToggle={(e) => setAvanzadoAbierto((e.target as HTMLDetailsElement).open)}
            className="rounded-xl ring-1 ring-slate-200 overflow-hidden"
          >
            <summary className="px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-xs font-bold text-slate-600 hover:bg-slate-50">
              Opciones avanzadas
            </summary>
            <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ivaFrontera}
                  onChange={(e) => setIvaFrontera(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-bold text-slate-700">
                  IVA 8% zona frontera
                </span>
              </label>
              {operacion === "agapes" && (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agapesExento}
                    onChange={(e) => setAgapesExento(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-700 leading-relaxed">
                    AGAPES exento (Regla 3.13.26 RMF 2026 + Art. 113-E)
                  </span>
                </label>
              )}
            </div>
          </details>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void calcular()}
              disabled={!formularioCompleto || cargando}
              className="flex-1 min-w-[140px] h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-black shadow-lg shadow-indigo-200/50 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
            >
              {cargando ? "Calculando…" : "Calcular factura"}
            </button>
            <button
              type="button"
              onClick={limpiar}
              className="h-12 px-4 rounded-xl ring-1 ring-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Limpiar
            </button>
          </div>

          {error && (
            <p className="text-sm font-bold text-rose-600 bg-rose-50 ring-1 ring-rose-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Resultado */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-6 flex flex-col min-h-[320px]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
            Desglose CFDI
          </p>

          {!resultado ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <line x1="8" y1="10" x2="16" y2="10" />
                  <line x1="8" y1="14" x2="12" y2="14" />
                </svg>
              </div>
              <p className="text-sm font-bold text-white/70">
                Captura el neto y presiona calcular
              </p>
              <p className="text-xs text-white/40 mt-1 max-w-[220px]">
                Obtendrás subtotal, IVA, retenciones y total del CFDI.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-2 flex-1">
                {resultado.lineas.map((l) => (
                  <div
                    key={l.concepto}
                    className={`flex justify-between items-baseline gap-2 ${
                      l.concepto === "Neto que recibes"
                        ? "pt-3 mt-2 border-t border-white/20"
                        : ""
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        l.concepto === "Neto que recibes" || l.concepto === "Total CFDI"
                          ? "font-black"
                          : "font-bold text-white/70"
                      }`}
                    >
                      {l.concepto}
                    </span>
                    <span
                      className={`tabular-nums ${
                        l.concepto === "Neto que recibes"
                          ? "text-2xl font-black text-emerald-400"
                          : l.concepto === "Total CFDI"
                            ? "text-lg font-black"
                            : "text-sm font-bold"
                      }`}
                    >
                      {l.aplica ? fmtMxn(l.monto) : l.texto ?? "—"}
                    </span>
                  </div>
                ))}
              </div>

              {Math.abs(resultado.diferencialRedondeo) > 0.01 && (
                <p className="text-[10px] text-amber-300/90 mt-2">
                  Diferencia por redondeo: {resultado.diferencialRedondeo >= 0 ? "+" : ""}
                  {resultado.diferencialRedondeo.toFixed(2)} MXN
                </p>
              )}

              <button
                type="button"
                onClick={() => void copiar()}
                className="mt-4 w-full py-2.5 rounded-xl bg-white/10 ring-1 ring-white/20 text-sm font-bold hover:bg-white/15 transition"
              >
                {copiado ? "¡Copiado!" : "Copiar desglose"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fundamentos y advertencias */}
      {resultado && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resultado.fundamentos.length > 0 && (
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Fundamento legal
              </p>
              <ul className="space-y-2">
                {resultado.fundamentos.map((f, i) => (
                  <li key={i} className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-black text-slate-800">
                      {f.ley} {f.articulo}
                    </span>
                    {f.nota ? ` — ${f.nota}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {resultado.advertencias.length > 0 && (
            <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4">
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3">
                Notas
              </p>
              <ul className="space-y-2">
                {resultado.advertencias.map((a, i) => (
                  <li key={i} className="text-xs text-amber-900 leading-relaxed">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <ModalPaywallFacturacion
        abierto={paywallAbierto}
        onCerrar={() => setPaywallAbierto(false)}
        uso={uso}
      />
    </div>
  );
}
