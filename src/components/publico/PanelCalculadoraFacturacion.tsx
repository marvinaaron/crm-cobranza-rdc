"use client";

import { Calculator } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import PillDeslizable from "@/components/publico/PillDeslizable";
import ModalPaywallFacturacion from "@/components/publico/ModalPaywallFacturacion";
import CtaConversionHerramienta from "@/components/ui/cta-conversion-herramienta";
import { fmtMxn } from "@/lib/fiscal/facturacion-neto";
import {
  OPERACIONES_META,
  type RegimenEmisor,
  type TipoEmisor,
  type TipoOperacion,
  type TipoReceptor,
} from "@/lib/fiscal/facturacion-tablas";
import type { EstadoUsoFacturacion } from "@/lib/herramientas/facturacion-uso";

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

type GrupoOperacion =
  | "honorarios"
  | "venta_bienes"
  | "comisionista"
  | "autotransporte"
  | "agapes"
  | "arrendamiento";

type TipoArrendamiento = "domestico" | "amueblado" | "comercial";

function parseMonto(valor: string): number {
  const limpio = valor.replace(/[^0-9.]/g, "");
  const partes = limpio.split(".");
  const normalizado =
    partes.length > 2 ? `${partes[0]}.${partes.slice(1).join("")}` : limpio;
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : NaN;
}

function operacionDesdeGrupo(
  grupo: GrupoOperacion,
  arrendamiento: TipoArrendamiento
): TipoOperacion {
  if (grupo === "arrendamiento") {
    if (arrendamiento === "amueblado") return "arrendamiento_amueblado";
    if (arrendamiento === "comercial") return "arrendamiento_comercial";
    return "arrendamiento_domestico";
  }
  return grupo;
}

const GRUPOS_OPERACION: GrupoOperacion[] = [
  "honorarios",
  "venta_bienes",
  "comisionista",
  "arrendamiento",
  "autotransporte",
  "agapes",
];

const ETIQUETAS_GRUPO: Record<GrupoOperacion, string> = {
  honorarios: "Honorarios",
  venta_bienes: "Venta",
  comisionista: "Comisiones",
  arrendamiento: "Arrendamiento",
  autotransporte: "Autotransporte",
  agapes: "AGAPES",
};

function FilaResultado({
  etiqueta,
  valor,
  destacado,
  vacio,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
  vacio?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0 ${
        destacado ? "pt-4" : ""
      }`}
    >
      <span
        className={`text-sm ${destacado ? "font-bold text-slate-900" : "text-slate-600"}`}
      >
        {etiqueta}
      </span>
      <span
        className={`tabular-nums text-right ${
          vacio
            ? "text-slate-300 font-semibold"
            : destacado
              ? "text-lg font-bold text-marca-navy"
              : "text-sm font-semibold text-slate-900"
        }`}
      >
        {valor}
      </span>
    </div>
  );
}

export default function PanelCalculadoraFacturacion() {
  const [emisor, setEmisor] = useState<TipoEmisor>("pf");
  const [regimen, setRegimen] = useState<RegimenEmisor>("resico");
  const [receptor, setReceptor] = useState<TipoReceptor>("pm");
  const [grupoOperacion, setGrupoOperacion] = useState<GrupoOperacion>("honorarios");
  const [tipoArrendamiento, setTipoArrendamiento] =
    useState<TipoArrendamiento>("domestico");
  const operacion = useMemo(
    () => operacionDesdeGrupo(grupoOperacion, tipoArrendamiento),
    [grupoOperacion, tipoArrendamiento]
  );

  const [netoTexto, setNetoTexto] = useState("");
  const [ivaFrontera, setIvaFrontera] = useState(false);
  const [agapesExento, setAgapesExento] = useState(false);

  const [uso, setUso] = useState<EstadoUsoFacturacion | null>(null);
  const [resultado, setResultado] = useState<ResultadoApi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [paywallAbierto, setPaywallAbierto] = useState(false);

  const cargarUso = useCallback(async () => {
    try {
      const res = await fetch("/api/herramientas/facturacion/uso");
      if (res.ok) setUso((await res.json()) as EstadoUsoFacturacion);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    void cargarUso();
  }, [cargarUso]);

  useEffect(() => {
    setResultado(null);
    setError(null);
  }, [emisor, regimen, receptor, operacion, netoTexto, ivaFrontera, agapesExento]);

  useEffect(() => {
    if (grupoOperacion === "agapes" && emisor === "pf" && regimen === "pfae") {
      setRegimen("resico");
    }
  }, [grupoOperacion, emisor, regimen]);

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

  const restantesLabel =
    uso && Number.isFinite(uso.restantes) && !uso.esPro
      ? `${uso.restantes} consulta${uso.restantes === 1 ? "" : "s"} gratis`
      : uso?.esPro
        ? "Pro ilimitado"
        : "3 consultas gratis";

  const fmt = (n: number | undefined, aplica = true) =>
    aplica && n !== undefined ? fmtMxn(n) : "$ ---";

  return (
    <div className="space-y-8">
      {/* Uso freemium — discreto */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{restantesLabel}</span>
        {uso && !uso.puedeCalcular && (
          <button
            type="button"
            onClick={() => setPaywallAbierto(true)}
            className="font-semibold text-amber-700 hover:text-amber-900"
          >
            Desbloquear Pro
          </button>
        )}
      </div>

      {/* Emisor | Receptor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Emisor
          </p>
          <PillDeslizable
            label="¿Quién factura?"
            opciones={[
              { value: "pf", label: "Persona física" },
              { value: "pm", label: "Persona moral" },
            ]}
            value={emisor}
            onChange={setEmisor}
          />
          {emisor === "pf" && (
            <PillDeslizable
              label="Régimen fiscal"
              opciones={[
                { value: "resico", label: "RESICO" },
                {
                  value: "pfae",
                  label: "PFAE",
                  disabled: grupoOperacion === "agapes",
                },
              ]}
              value={regimen}
              onChange={setRegimen}
            />
          )}
        </div>

        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Receptor
          </p>
          <PillDeslizable
            label="¿Quién recibe la factura?"
            hint={
              receptor === "pm"
                ? "Persona moral: aplican retenciones de ISR e IVA."
                : "Persona física: sin retenciones en estos escenarios."
            }
            opciones={[
              { value: "pm", label: "Persona moral" },
              { value: "pf", label: "Persona física" },
            ]}
            value={receptor}
            onChange={setReceptor}
          />
        </div>
      </div>

      {/* Operación */}
      <div className="space-y-4">
        <PillDeslizable
          label="Tipo de operación"
          scrollable
          opciones={GRUPOS_OPERACION.map((g) => ({
            value: g,
            label: ETIQUETAS_GRUPO[g],
          }))}
          value={grupoOperacion}
          onChange={setGrupoOperacion}
        />
        {grupoOperacion === "arrendamiento" && (
          <PillDeslizable
            label="Tipo de arrendamiento"
            opciones={[
              { value: "domestico", label: "Casa doméstica" },
              { value: "amueblado", label: "Casa amueblada" },
              { value: "comercial", label: "Local comercial" },
            ]}
            value={tipoArrendamiento}
            onChange={setTipoArrendamiento}
          />
        )}
        <p className="text-[11px] text-slate-400">
          {OPERACIONES_META[operacion].label} · tasas conforme a LISR y LIVA 2026
        </p>
      </div>

      {/* Neto */}
      <div>
        <label
          htmlFor="neto-facturacion"
          className="block text-sm font-semibold text-slate-800 mb-2"
        >
          Neto que quieres recibir
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Monto que quieres recibir en tu cuenta después de retenciones.
        </p>
        <div className="flex items-stretch gap-0 rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-marca-navy/20 focus-within:border-marca-navy/40 transition-shadow">
          <div className="flex items-center pl-4 pr-2 text-slate-400 font-bold text-lg select-none">
            $
          </div>
          <input
            id="neto-facturacion"
            type="text"
            inputMode="decimal"
            value={netoTexto}
            onChange={(e) => setNetoTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void calcular();
            }}
            placeholder="10,000.00"
            className="flex-1 min-w-0 py-4 pr-2 text-2xl font-semibold tabular-nums text-slate-900 placeholder:text-slate-300 outline-none bg-transparent"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="flex items-center px-4 border-l border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
            MXN
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {[5000, 10000, 25000, 50000].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setNetoTexto(m.toLocaleString("es-MX"))}
              className="px-3 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 transition"
            >
              {fmtMxn(m)}
            </button>
          ))}
        </div>
      </div>

      {/* Avanzado */}
      <details className="group">
        <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-800 list-none flex items-center gap-1 [&::-webkit-details-marker]:hidden">
          <span className="group-open:rotate-90 transition-transform text-slate-400">
            ›
          </span>
          Opciones avanzadas
        </summary>
        <div className="mt-3 pl-4 space-y-2 border-l-2 border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
            <input
              type="checkbox"
              checked={ivaFrontera}
              onChange={(e) => setIvaFrontera(e.target.checked)}
              className="rounded border-slate-300 text-marca-navy focus:ring-marca-navy"
            />
            IVA 8% zona frontera
          </label>
          {grupoOperacion === "agapes" && (
            <label className="flex items-start gap-2 cursor-pointer text-sm text-slate-700">
              <input
                type="checkbox"
                checked={agapesExento}
                onChange={(e) => setAgapesExento(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-marca-navy focus:ring-marca-navy"
              />
              <span>AGAPES exento (Regla 3.13.26 RMF 2026)</span>
            </label>
          )}
        </div>
      </details>

      <button
        type="button"
        onClick={() => void calcular()}
        disabled={!formularioCompleto || cargando}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-marca-navy text-white text-sm font-bold hover:bg-marca-navy-soft disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
      >
        <Calculator size={18} strokeWidth={2.25} aria-hidden />
        {cargando ? "Calculando…" : "Calcular factura"}
      </button>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Resultado — estilo Konta */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900">Desglose del CFDI</h3>
          {resultado && (
            <button
              type="button"
              onClick={() => void copiar()}
              className="text-xs font-semibold text-marca-navy hover:underline"
            >
              {copiado ? "Copiado" : "Copiar"}
            </button>
          )}
        </div>

        <div className="mt-2">
          <FilaResultado
            etiqueta="Subtotal"
            valor={fmt(resultado?.subtotal)}
            vacio={!resultado}
          />
          <FilaResultado
            etiqueta="IVA"
            valor={
              resultado
                ? resultado.iva > 0
                  ? fmt(resultado.iva)
                  : "No aplica"
                : "$ ---"
            }
            vacio={!resultado}
          />
          <FilaResultado
            etiqueta="Ret. IVA"
            valor={
              resultado
                ? resultado.retIva > 0
                  ? fmt(resultado.retIva)
                  : "No aplica"
                : "$ ---"
            }
            vacio={!resultado}
          />
          <FilaResultado
            etiqueta="Ret. ISR"
            valor={
              resultado
                ? resultado.retIsr > 0
                  ? fmt(resultado.retIsr)
                  : "No aplica"
                : "$ ---"
            }
            vacio={!resultado}
          />
          <FilaResultado
            etiqueta="Total CFDI"
            valor={fmt(resultado?.totalCfdi)}
            vacio={!resultado}
          />
          <FilaResultado
            etiqueta="Neto que recibes"
            valor={fmt(resultado?.netoVerificado)}
            destacado
            vacio={!resultado}
          />
        </div>

        {resultado && Math.abs(resultado.diferencialRedondeo) > 0.01 && (
          <p className="text-[11px] text-amber-700 mt-3">
            Diferencia por redondeo:{" "}
            {resultado.diferencialRedondeo >= 0 ? "+" : ""}
            {resultado.diferencialRedondeo.toFixed(2)} MXN
          </p>
        )}
      </div>

      {resultado && (resultado.fundamentos.length > 0 || resultado.advertencias.length > 0) && (
        <div className="space-y-4 text-xs text-slate-500 leading-relaxed">
          {resultado.fundamentos.map((f, i) => (
            <p key={i}>
              <span className="font-semibold text-slate-700">
                {f.ley} {f.articulo}
              </span>
              {f.nota ? ` — ${f.nota}` : ""}
            </p>
          ))}
          {resultado.advertencias.map((a, i) => (
            <p key={i} className="text-amber-800/90">
              {a}
            </p>
          ))}
        </div>
      )}

      <CtaConversionHerramienta
        titulo="¿Quieres que facturemos y declaremos por ti?"
        subtitulo="Portal de cliente, declaraciones y asesoría en Guadalajara. Cotización sin compromiso."
      />

      <ModalPaywallFacturacion
        abierto={paywallAbierto}
        onCerrar={() => setPaywallAbierto(false)}
        uso={uso}
      />
    </div>
  );
}
