"use client";

import type { Cliente, Periodo } from "@/lib/clientes";
import type {
  FlujoCumplimiento,
  RegistroCumplimiento,
  CategoriaId,
} from "@/lib/cumplimiento";
import {
  CATEGORIA_META,
  FLUJO_CUMPLIMIENTO_LABELS,
  asegurarBloques,
  categoriaConPagoEnRegistro,
  documentoAdminCargado,
  esSinPagoImpuestos,
  getFechaLimiteCategoria,
  getFlujoCumplimiento,
  getSubtotalCategoria,
  pagoValidadoCategoria,
  previewPublicado,
  clienteConfirmoPreview,
  formatFechaLimiteImpuestoCorta,
  formatMontoImpuesto,
} from "@/lib/cumplimiento";
import {
  categoriaAplicaCliente,
  categoriasConPagoEnPreview,
} from "@/lib/config-cumplimiento-cliente";
import { useClientes } from "@/context/ClientesContext";
import {
  periodoRepseDesdePeriodoMensual,
  periodoRepseLabel,
} from "@/lib/repse";

type Tone = "slate" | "sky" | "amber" | "teal" | "violet" | "indigo" | "emerald" | "neutral";

const TONE_CHIP: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  slate: "bg-slate-200 text-slate-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-800",
  teal: "bg-teal-100 text-teal-700",
  violet: "bg-violet-100 text-violet-700",
  indigo: "bg-indigo-100 text-indigo-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

const FLUJO_LABEL = FLUJO_CUMPLIMIENTO_LABELS;
const FLUJO_TONE: Record<FlujoCumplimiento, Tone> = {
  por_trabajar: "slate",
  iniciando_contabilidad: "sky",
  preliminar: "amber",
  aceptacion: "teal",
  declaraciones: "violet",
  pago: "indigo",
  completado: "emerald",
};

const CAT_TONE: Record<CategoriaId, string> = {
  federales: "bg-blue-50 text-blue-700 border-blue-200",
  imss: "bg-green-50 text-green-700 border-green-200",
  estatales: "bg-amber-50 text-amber-700 border-amber-200",
};

/** Orden del flujo para derivar el número de paso (1–7) en la barra de progreso. */
const FLUJO_ORDEN: FlujoCumplimiento[] = [
  "por_trabajar",
  "iniciando_contabilidad",
  "preliminar",
  "aceptacion",
  "declaraciones",
  "pago",
  "completado",
];

function StatusPunto({
  estado,
}: {
  estado: "ok" | "pendiente" | "vencido" | "off";
}) {
  const cls =
    estado === "ok"
      ? "bg-emerald-500"
      : estado === "pendiente"
      ? "bg-amber-400"
      : estado === "vencido"
      ? "bg-rose-500"
      : "bg-slate-200";
  return <span className={`inline-block h-2 w-2 rounded-full ${cls}`} aria-hidden />;
}

function MiniChipCategoria({
  cat,
  reg,
  cli,
  ahora,
}: {
  cat: CategoriaId;
  reg: RegistroCumplimiento | undefined;
  cli: Cliente;
  ahora: Date;
}) {
  const aplica =
    cat === "imss"
      ? categoriaAplicaCliente(cli, "imss") &&
        !!reg &&
        asegurarBloques(reg).imss.activo
      : cat === "estatales"
      ? categoriaAplicaCliente(cli, "estatales") &&
        !!reg &&
        asegurarBloques(reg).estatales.activo
      : categoriaAplicaCliente(cli, "federales");

  if (!aplica || !reg) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${CAT_TONE[cat]} opacity-50`}
      >
        <StatusPunto estado="off" />
        {CATEGORIA_META[cat].label}
      </span>
    );
  }

  const tienePago = categoriaConPagoEnRegistro(reg, cat);
  const validado = tienePago && pagoValidadoCategoria(reg, cat);
  const limite = getFechaLimiteCategoria(reg, cat);
  const vencido =
    !validado && tienePago && !!limite && new Date(limite) < ahora;

  let estado: "ok" | "pendiente" | "vencido" | "off" = "pendiente";
  if (validado) estado = "ok";
  else if (vencido) estado = "vencido";
  else if (!tienePago) estado = "off";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${CAT_TONE[cat]}`}
    >
      <StatusPunto estado={estado} />
      {CATEGORIA_META[cat].label}
    </span>
  );
}

export type CumplimientoCardProps = {
  cliente: Cliente;
  reg: RegistroCumplimiento | undefined;
  periodo: Periodo;
  onSelect: (cli: Cliente) => void;
};

export default function CumplimientoCardMovil({
  cliente,
  reg,
  periodo,
  onSelect,
}: CumplimientoCardProps) {
  const { getRegistroRepseCliente } = useClientes();
  const ahora = new Date();
  const repseOn = cliente.configRepse?.habilitado === true;
  const pRepse = periodoRepseDesdePeriodoMensual(periodo);
  const regRepse = repseOn
    ? getRegistroRepseCliente(cliente.id, pRepse)
    : undefined;
  const repseCompleto = !!regRepse?.sisub && !!regRepse?.icsoe;
  const repseParcial = !!regRepse?.sisub || !!regRepse?.icsoe;
  const flujo: FlujoCumplimiento = getFlujoCumplimiento(reg) ?? "por_trabajar";
  const bucketLabel = FLUJO_LABEL[flujo];
  const bucketTone = FLUJO_TONE[flujo];

  const sinPago = esSinPagoImpuestos(reg);
  const catsPago = reg
    ? categoriasConPagoEnPreview(cliente, asegurarBloques(reg))
    : [];
  const total = catsPago.reduce(
    (s, c) => s + getSubtotalCategoria(reg!, c),
    0
  );

  // Fecha límite más próxima entre las categorías con pago.
  let fechaLimiteMasProxima: string | null = null;
  for (const cat of catsPago) {
    const f = getFechaLimiteCategoria(reg!, cat);
    if (!f) continue;
    if (!fechaLimiteMasProxima || f < fechaLimiteMasProxima) {
      fechaLimiteMasProxima = f;
    }
  }
  const vencido =
    !!fechaLimiteMasProxima && new Date(fechaLimiteMasProxima) < ahora && !sinPago;

  const previoPublicado = previewPublicado(reg);
  const previoValidado = previoPublicado && clienteConfirmoPreview(reg);

  const pasoNum = FLUJO_ORDEN.indexOf(flujo) + 1;
  const progresoPct = Math.round((pasoNum / FLUJO_ORDEN.length) * 100);

  return (
    <button
      type="button"
      onClick={() => onSelect(cliente)}
      className="relative overflow-hidden w-full text-left rounded-2xl bg-white ring-1 ring-slate-200 hover:ring-slate-900 transition-all shadow-sm p-4 pb-5 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight truncate">
            {cliente.razonSocial}
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
            {cliente.rfc}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${TONE_CHIP[bucketTone]}`}
        >
          {bucketLabel}
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Total a pagar
          </p>
          <p
            className={`text-xl font-black tabular-nums leading-none mt-0.5 ${
              sinPago
                ? "text-slate-400"
                : vencido
                ? "text-rose-600"
                : "text-slate-900"
            }`}
          >
            {sinPago
              ? "Sin impuestos"
              : catsPago.length > 0
              ? formatMontoImpuesto(total)
              : "—"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {vencido ? "Venció" : "Fecha límite"}
          </p>
          <p
            className={`text-[11px] font-bold tabular-nums mt-0.5 ${
              vencido ? "text-rose-600" : "text-slate-700"
            }`}
          >
            {fechaLimiteMasProxima
              ? formatFechaLimiteImpuestoCorta(fechaLimiteMasProxima)
              : "—"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <MiniChipCategoria cat="federales" reg={reg} cli={cliente} ahora={ahora} />
          <MiniChipCategoria cat="imss" reg={reg} cli={cliente} ahora={ahora} />
          <MiniChipCategoria cat="estatales" reg={reg} cli={cliente} ahora={ahora} />
          {repseOn && (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border ${
                repseCompleto
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : repseParcial
                  ? "bg-violet-50/60 text-violet-700 border-violet-200"
                  : "bg-slate-50 text-slate-400 border-slate-100"
              }`}
            >
              <StatusPunto
                estado={
                  repseCompleto ? "ok" : repseParcial ? "pendiente" : "off"
                }
              />
              REPSE {periodoRepseLabel(pRepse)}
            </span>
          )}
        </div>
        <span
          className={`inline-flex px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${
            previoValidado
              ? "bg-emerald-100 text-emerald-700"
              : previoPublicado
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {previoValidado ? "Previo OK" : previoPublicado ? "Esp. previo" : "Previo pendiente"}
        </span>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-1 bg-slate-100"
        aria-hidden
      >
        <div
          className="h-full bg-indigo-500 transition-[width] duration-500"
          style={{ width: `${progresoPct}%` }}
        />
      </div>
    </button>
  );
}
