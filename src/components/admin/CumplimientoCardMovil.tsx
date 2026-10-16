"use client";

import type { Cliente, Periodo } from "@/lib/clientes";
import type { RegistroCumplimiento, CategoriaId } from "@/lib/cumplimiento";
import {
  CATEGORIA_META,
  asegurarBloques,
  categoriaConPagoEnRegistro,
  categoriaTieneAlgunDocumento,
  diasHastaLimite,
  esSinPagoImpuestos,
  getFechaLimiteCategoria,
  getSubtotalCategoria,
  parseFechaLimite,
  formatMontoImpuesto,
} from "@/lib/cumplimiento";
import { categoriaAplicaCliente, categoriasConPagoEnPreview } from "@/lib/config-cumplimiento-cliente";
import { claseChipRegimen, etiquetaRegimenCorto } from "@/lib/regimenes-fiscales";
import {
  fechaLimiteSAT,
  formatearDiaMesCorto,
} from "@/lib/portal/fechas-fiscales";
import { useClientes } from "@/context/ClientesContext";
import { getWorkflowMesCliente } from "@/lib/cobranza-workflow";
import { periodoRepseSiHayPresentacion } from "@/lib/repse";
import DiaContabilidadCircle from "@/components/admin/DiaContabilidadCircle";
import WorkflowCircleMini from "@/components/admin/WorkflowCircleMini";
import AvatarCliente from "@/components/admin/AvatarCliente";

function claseUrgenciaDias(dias: number | null): string {
  if (dias === null) return "text-slate-400";
  if (dias < 0) return "text-red-600";
  return "text-orange-600";
}

function claseVencDecl(dias: number | null): string {
  if (dias === null) return "text-slate-400";
  if (dias < 0) return "text-red-600";
  if (dias <= 5) return "text-slate-900";
  return "text-slate-500";
}

function LineaObligacion({
  cat,
  reg,
  cli,
}: {
  cat: CategoriaId;
  reg: RegistroCumplimiento | undefined;
  cli: Cliente;
}) {
  if (!categoriaAplicaCliente(cli, cat)) return null;
  const tienePago = !!reg && categoriaConPagoEnRegistro(reg, cat);
  const fecha = tienePago && reg ? getFechaLimiteCategoria(reg, cat) : null;
  const dt = fecha ? parseFechaLimite(fecha) : null;
  const cargado = categoriaTieneAlgunDocumento(reg, cat);
  const tono =
    cat === "federales"
      ? { fill: "bg-blue-600", ring: "border-blue-600" }
      : cat === "imss"
        ? { fill: "bg-[#006847]", ring: "border-[#006847]" }
        : { fill: "bg-[#D98638]", ring: "border-[#D98638]" };
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12px]">
      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
        <span
          title={cargado ? "PDF cargado" : "Sin PDF"}
          className={`h-1.5 w-1.5 rounded-full ${
            cargado ? tono.fill : `border-[1.5px] bg-transparent ${tono.ring}`
          }`}
          aria-hidden
        />
        {CATEGORIA_META[cat].label}
      </span>
      <span className="shrink-0 font-bold tabular-nums text-slate-900">
        {tienePago && reg ? (
          <>
            {formatMontoImpuesto(getSubtotalCategoria(reg, cat))}
            {dt ? (
              <span className={`ml-1.5 ${claseUrgenciaDias(fecha ? diasHastaLimite(fecha) : null)}`}>
                · {formatearDiaMesCorto(dt)}
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </span>
    </div>
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
  const pRepse = periodoRepseSiHayPresentacion(periodo);
  const repseOn = !!pRepse && cliente.configRepse?.habilitado === true;
  const regRepse = repseOn && pRepse
    ? getRegistroRepseCliente(cliente.id, pRepse)
    : undefined;
  const sinPago = esSinPagoImpuestos(reg);
  const catsPago = reg
    ? categoriasConPagoEnPreview(cliente, asegurarBloques(reg))
    : [];
  const total = catsPago.reduce(
    (s, c) => s + getSubtotalCategoria(reg!, c),
    0
  );
  const fedOn = categoriaAplicaCliente(cliente, "federales");
  const vencDecl = fedOn ? fechaLimiteSAT(cliente.rfc, periodo) : null;
  const workflow = getWorkflowMesCliente(cliente, periodo, reg);

  return (
    <button
      type="button"
      onClick={() => onSelect(cliente)}
      className="relative w-full text-left rounded-[1.1rem] bg-white ring-1 ring-black/[0.04] shadow-sm px-3 py-2.5"
    >
      <div className="flex items-start gap-2.5">
        <AvatarCliente cliente={cliente} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-slate-900 leading-tight truncate">
            {cliente.razonSocial}
          </p>
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wide truncate mt-0.5">
            {cliente.rfc}
          </p>
          <p className="mt-0.5 flex items-baseline justify-between gap-2 min-w-0">
            <span
              className={`truncate text-[11px] font-semibold ${claseChipRegimen(cliente.regimenFiscalClave)}`}
            >
              {etiquetaRegimenCorto(cliente.regimenFiscalClave)}
            </span>
            {vencDecl ? (
              <span
                className={`shrink-0 text-[11px] font-semibold tabular-nums ${claseVencDecl(
                  diasHastaLimite(
                    `${vencDecl.getFullYear()}-${String(vencDecl.getMonth() + 1).padStart(2, "0")}-${String(vencDecl.getDate()).padStart(2, "0")}`
                  )
                )}`}
              >
                {formatearDiaMesCorto(vencDecl)}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <DiaContabilidadCircle cliente={cliente} />
          <WorkflowCircleMini resumen={workflow} size="xs" sinPopover />
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <LineaObligacion cat="federales" reg={reg} cli={cliente} />
        <LineaObligacion cat="imss" reg={reg} cli={cliente} />
        <LineaObligacion cat="estatales" reg={reg} cli={cliente} />
        {repseOn ? (
          <div className="flex items-baseline justify-between gap-3 text-[12px]">
            <span className="font-semibold text-slate-500">REPSE</span>
            <span className="shrink-0 font-semibold text-slate-700">
              {regRepse?.sisub ? "SISUB" : "SISUB —"}
              {" · "}
              {regRepse?.icsoe ? "ICSOE" : "ICSOE —"}
            </span>
          </div>
        ) : null}
      </div>

      <p className="mt-2 flex items-baseline justify-between gap-2 text-[12px] tabular-nums">
        <span className="font-semibold text-slate-400">Total</span>
        <span className="font-bold text-slate-900">
          {sinPago ? formatMontoImpuesto(0) : catsPago.length > 0 ? formatMontoImpuesto(total) : "—"}
        </span>
      </p>
    </button>
  );
}
