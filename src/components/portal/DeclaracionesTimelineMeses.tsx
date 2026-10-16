"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MESES_NOM,
  type Cliente,
  type Periodo,
  esMismoPeriodo,
  periodoLabel,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { usePeriodoFiscal } from "@/hooks/usePeriodoPortal";
import {
  FLUJO_CUMPLIMIENTO_LABELS,
  getFlujoCumplimiento,
  limiteVencido,
  previewPublicado,
  todosPagosValidados,
} from "@/lib/cumplimiento";
import { categoriasHabilitadasCliente } from "@/lib/config-cumplimiento-cliente";

type Props = { cliente: Cliente };

const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function periodoAnterior(p: Periodo): Periodo {
  if (p.mes === 0) return { mes: 11, anio: p.anio - 1 };
  return { mes: p.mes - 1, anio: p.anio };
}

function ultimosPeriodos(desde: Periodo, cantidad: number): Periodo[] {
  const lista: Periodo[] = [];
  let actual = { ...desde };
  for (let i = 0; i < cantidad; i++) {
    lista.unshift(actual);
    actual = periodoAnterior(actual);
  }
  return lista;
}

type Tono = "completado" | "accion" | "proceso" | "vacio";

function tonoFlujo(flujo: ReturnType<typeof getFlujoCumplimiento>, vencido: boolean): Tono {
  if (flujo === "completado") return "completado";
  if (vencido) return "accion";
  if (flujo === "preliminar" || flujo === "pago") return "accion";
  if (flujo === "por_trabajar") return "vacio";
  return "proceso";
}

const ESTILO_TONO: Record<Tono, { borde: string; fondo: string; texto: string; punto: string }> = {
  completado: {
    borde: "border-emerald-200",
    fondo: "bg-emerald-50",
    texto: "text-emerald-800",
    punto: "bg-emerald-500",
  },
  accion: {
    borde: "border-amber-200",
    fondo: "bg-amber-50",
    texto: "text-amber-900",
    punto: "bg-amber-500",
  },
  proceso: {
    borde: "border-slate-200",
    fondo: "bg-white",
    texto: "text-slate-700",
    punto: "bg-[var(--portal-navy)]",
  },
  vacio: {
    borde: "border-slate-100",
    fondo: "bg-slate-50/80",
    texto: "text-slate-400",
    punto: "bg-slate-300",
  },
};

export default function DeclaracionesTimelineMeses({ cliente }: Props) {
  const { getCumplimientoPeriodo } = useClientes();
  const { periodoVista, periodoFiscalVigente } = usePeriodoFiscal();
  const { setPeriodoMes, setPeriodoAnio } = useClientes();
  const cats = useMemo(() => categoriasHabilitadasCliente(cliente), [cliente]);
  const activoRef = useRef<HTMLButtonElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const meses = useMemo(
    () => ultimosPeriodos(periodoFiscalVigente, 6),
    [periodoFiscalVigente]
  );

  const tarjetas = useMemo(() => {
    return meses.map((periodo) => {
      const reg = getCumplimientoPeriodo(cliente.id, periodo);
      const flujo = getFlujoCumplimiento(reg);
      const vencido =
        !!reg?.fechaLimite &&
        !todosPagosValidados(reg, cats) &&
        limiteVencido(reg.fechaLimite) &&
        previewPublicado(reg);
      const tono = tonoFlujo(flujo, vencido);
      return {
        periodo,
        flujo,
        etiqueta: FLUJO_CUMPLIMIENTO_LABELS[flujo],
        tono,
        activo: esMismoPeriodo(periodo, periodoVista),
        esVigente: esMismoPeriodo(periodo, periodoFiscalVigente),
      };
    });
  }, [meses, cliente.id, getCumplimientoPeriodo, cats, periodoVista, periodoFiscalVigente]);

  const vigente = tarjetas.find((t) => t.esVigente);

  function irAPeriodo(p: Periodo) {
    setPeriodoMes(p.mes);
    setPeriodoAnio(p.anio);
  }

  useEffect(() => {
    const el = activoRef.current;
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const left = el.offsetLeft - (scroller.clientWidth - el.offsetWidth) / 2;
    scroller.scrollTo({
      left: Math.max(0, left),
      behavior: "smooth",
    });
  }, [periodoVista]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <button
        type="button"
        onClick={() => irAPeriodo(periodoFiscalVigente)}
        className="w-full text-left rounded-2xl bg-[#1a164d] text-white px-4 py-4 mb-4 hover:bg-[#15123f] transition-colors"
      >
        <p className="text-[13px] font-semibold text-white/70">Mes en curso</p>
        <p className="mt-0.5 text-[26px] sm:text-[28px] font-bold tracking-tight leading-tight">
          {periodoLabel(periodoFiscalVigente)}
        </p>
        {vigente ? (
          <p className="mt-1.5 text-[15px] text-white/85">{vigente.etiqueta}</p>
        ) : null}
        {!esMismoPeriodo(periodoVista, periodoFiscalVigente) ? (
          <p className="mt-2 text-[13px] text-white/70">
            Estás viendo {MESES_NOM[periodoVista.mes]}. Toca para volver a este mes.
          </p>
        ) : null}
      </button>

      <p className="text-[13px] font-semibold text-slate-500 mb-3">Últimos 6 meses</p>

      <div
        ref={scrollerRef}
        className="flex gap-2 overflow-x-auto py-1 px-0.5 snap-x snap-mandatory [scrollbar-gutter:stable]"
      >
        {tarjetas.map((t) => {
          const est = ESTILO_TONO[t.tono];
          return (
            <button
              key={`${t.periodo.anio}-${t.periodo.mes}`}
              ref={t.activo ? activoRef : undefined}
              type="button"
              onClick={() => irAPeriodo(t.periodo)}
              className={`snap-start shrink-0 w-[9.5rem] sm:w-[10.5rem] text-left rounded-xl border-2 p-3 transition-all box-border ${
                est.fondo
              } ${
                t.esVigente
                  ? "border-[#1a164d] shadow-sm"
                  : t.activo
                    ? "border-slate-400 shadow-sm"
                    : `${est.borde} hover:shadow-sm`
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-semibold text-slate-900">
                  {MESES_CORTOS[t.periodo.mes]} {t.periodo.anio}
                </span>
                {t.esVigente ? (
                  <span className="text-[11px] font-semibold text-[#1a164d] shrink-0">
                    Este mes
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${est.punto}`} aria-hidden />
                <span className={`text-[13px] font-semibold leading-snug line-clamp-2 ${est.texto}`}>
                  {t.etiqueta}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[13px] text-slate-500 leading-relaxed">
        Toca un mes para ver declaraciones, previo y documentos de ese periodo.
      </p>
    </section>
  );
}
