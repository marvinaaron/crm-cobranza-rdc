"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useClientes } from "@/context/ClientesContext";
import type { RegistroEfirma } from "@/lib/efirma/types";
import {
  diasHastaVencimiento,
  formatFechaCertificado,
} from "@/lib/efirma/vigencia";
import {
  calcularKpisDashboard,
  calcularResumenAnual,
  calcularAgingCartera,
  listarPrincipalesMorosos,
  listarTopDeudores,
  listarPagosSinFactura,
  etiquetaPeriodoDashboard,
  esPeriodoActual,
  construirResumenExcel,
} from "@/lib/dashboard-metrics";
import * as XLSX from "xlsx";
import {
  periodoLabel,
  esIngresoGeneralCliente,
  fechaNacimientoDeRFC,
  formatearFechaNacimientoCorta,
  MESES_NOM,
} from "@/lib/clientes";
import GraficoIngresosAnual from "@/components/dashboard/GraficoIngresosAnual";
import GraficoNuevosClientes from "@/components/dashboard/GraficoNuevosClientes";
import GraficoAgingCartera from "@/components/dashboard/GraficoAgingCartera";
import CalendarioFiscalAdmin from "@/components/dashboard/CalendarioFiscalAdmin";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
}

// ── Tarjetas KPI: tipo + componente "vidrio tintado" ─────────────────
// Lenguaje visual alineado con los banners de la web pública:
//  · Fondo casi blanco con gradiente sutil del tinte (`from-white via-tint-50 to-tint-100/40`)
//  · Borde 1px del color al 60% (no marco grueso)
//  · Sombra "tintada": el halo respira el color, sin ser brillante
//  · Ícono pequeño en chip blanco con halo del tinte
//  · Dot indicador discreto, sin shadow agresiva
//  · Padding compacto (p-4 lg:p-5) y valor en text-2xl (no 3xl)
type TintKpi =
  | "emerald"
  | "sky"
  | "amber"
  | "slate"
  | "rose"
  | "indigo";

type TarjetaKpi = {
  label: string;
  value: string;
  sub: string;
  tint: TintKpi;
  icon: ReactNode;
  href: string | null;
};

// Paleta por tinte: todo deriva de aquí, sin clases dinámicas dentro del JSX
// (Tailwind no escanea strings interpolados arbitrarios, este map garantiza
// que las clases existan al build time).
const TINT_STYLES: Record<
  TintKpi,
  {
    bg: string;
    border: string;
    value: string;
    dot: string;
    iconChip: string;
    iconColor: string;
    shadow: string;
    hoverShadow: string;
    ringBg: string;
  }
> = {
  emerald: {
    bg: "bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/40",
    border: "border-emerald-100",
    value: "text-emerald-600",
    dot: "bg-emerald-500",
    iconChip: "bg-white ring-1 ring-emerald-100",
    iconColor: "text-emerald-600",
    shadow: "shadow-[0_4px_18px_-10px_rgba(16,185,129,0.35)]",
    hoverShadow: "hover:shadow-[0_10px_28px_-12px_rgba(16,185,129,0.45)]",
    ringBg: "before:bg-emerald-400/10",
  },
  sky: {
    bg: "bg-gradient-to-br from-white via-sky-50/70 to-sky-100/40",
    border: "border-sky-100",
    value: "text-sky-600",
    dot: "bg-sky-500",
    iconChip: "bg-white ring-1 ring-sky-100",
    iconColor: "text-sky-600",
    shadow: "shadow-[0_4px_18px_-10px_rgba(14,165,233,0.35)]",
    hoverShadow: "hover:shadow-[0_10px_28px_-12px_rgba(14,165,233,0.45)]",
    ringBg: "before:bg-sky-400/10",
  },
  amber: {
    bg: "bg-gradient-to-br from-white via-amber-50/70 to-orange-100/40",
    border: "border-amber-100",
    value: "text-amber-600",
    dot: "bg-amber-500",
    iconChip: "bg-white ring-1 ring-amber-100",
    iconColor: "text-amber-600",
    shadow: "shadow-[0_4px_18px_-10px_rgba(245,158,11,0.35)]",
    hoverShadow: "hover:shadow-[0_10px_28px_-12px_rgba(245,158,11,0.45)]",
    ringBg: "before:bg-amber-400/10",
  },
  slate: {
    bg: "bg-gradient-to-br from-white via-slate-50 to-slate-100/40",
    border: "border-slate-200",
    value: "text-slate-800",
    dot: "bg-slate-400",
    iconChip: "bg-white ring-1 ring-slate-200",
    iconColor: "text-slate-600",
    shadow: "shadow-[0_4px_18px_-10px_rgba(100,116,139,0.25)]",
    hoverShadow: "hover:shadow-[0_10px_28px_-12px_rgba(100,116,139,0.35)]",
    ringBg: "before:bg-slate-300/10",
  },
  rose: {
    bg: "bg-gradient-to-br from-white via-rose-50/70 to-red-100/40",
    border: "border-rose-100",
    value: "text-rose-600",
    dot: "bg-rose-500",
    iconChip: "bg-white ring-1 ring-rose-100",
    iconColor: "text-rose-600",
    shadow: "shadow-[0_4px_18px_-10px_rgba(244,63,94,0.35)]",
    hoverShadow: "hover:shadow-[0_10px_28px_-12px_rgba(244,63,94,0.45)]",
    ringBg: "before:bg-rose-400/10",
  },
  indigo: {
    bg: "bg-gradient-to-br from-white via-indigo-50/70 to-blue-100/40",
    border: "border-indigo-100",
    value: "text-indigo-600",
    dot: "bg-indigo-500",
    iconChip: "bg-white ring-1 ring-indigo-100",
    iconColor: "text-indigo-600",
    shadow: "shadow-[0_4px_18px_-10px_rgba(99,102,241,0.35)]",
    hoverShadow: "hover:shadow-[0_10px_28px_-12px_rgba(99,102,241,0.45)]",
    ringBg: "before:bg-indigo-400/10",
  },
};

// Iconos SVG inline (24x24) — minimal, alineados con heroicons outline.
const ICONOS = {
  cobrado: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  reloj: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  alerta: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  diana: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  calendario: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  billete: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  ),
  triangulo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  personas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

function TarjetaKpiCard({ card }: { card: TarjetaKpi }) {
  const t = TINT_STYLES[card.tint];

  const inner = (
    <div
      className={`relative h-full p-3 lg:p-3.5 rounded-xl border ${t.border} ${t.bg} ${t.shadow} transition-all duration-300 ${
        card.href ? `${t.hoverShadow} hover:-translate-y-0.5 cursor-pointer` : ""
      }`}
    >
      {/* Header: icono + dot/flecha */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.iconChip} ${t.iconColor} shadow-sm`}
        >
          {card.icon}
        </div>
        <div className="flex items-center gap-1.5">
          {card.href && (
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
              Ver →
            </span>
          )}
          <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
        </div>
      </div>

      {/* Cuerpo */}
      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">
        {card.label}
      </p>
      <p
        className={`text-xl lg:text-[1.35rem] font-black tabular-nums leading-none ${t.value}`}
      >
        {card.value}
      </p>
      <p className="text-[9px] font-bold text-slate-500 mt-1.5 leading-tight">
        {card.sub}
      </p>
    </div>
  );

  if (card.href) {
    return (
      <Link href={card.href} className="group block h-full">
        {inner}
      </Link>
    );
  }
  return <div className="h-full">{inner}</div>;
}

// ── Hook para colapsar/expandir secciones del dashboard ──────────────
// Persiste la preferencia en localStorage para que cada usuario conserve
// su layout entre sesiones. El estado por defecto es "expandido".
function useColapsoSeccion(id: string) {
  const storageKey = `dashboard-colapso-${id}`;
  const [colapsada, setColapsada] = useState(false);
  const [hidratada, setHidratada] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const valor = window.localStorage.getItem(storageKey);
      if (valor === "1") setColapsada(true);
    } catch {
      // ignoramos errores de acceso a localStorage (modo privado, etc.)
    }
    setHidratada(true);
  }, [storageKey]);

  const toggle = () => {
    setColapsada((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        // mismo motivo
      }
      return next;
    });
  };

  return { colapsada, toggle, hidratada };
}

// Encabezado uniforme para una sección colapsable.
function SeccionHeader({
  eyebrow,
  colapsada,
  onToggle,
  resumen,
}: {
  eyebrow: string;
  colapsada: boolean;
  onToggle: () => void;
  resumen?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-2 pl-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
        {eyebrow}
        {colapsada && resumen && (
          <span className="ml-2 normal-case tracking-normal text-slate-400 font-bold">
            · {resumen}
          </span>
        )}
      </p>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500 transition-colors"
      >
        {colapsada ? "Mostrar" : "Ocultar"}
        <svg
          width="10"
          height="10"
          viewBox="0 0 20 20"
          fill="none"
          className={`transition-transform duration-200 ${
            colapsada ? "" : "rotate-180"
          }`}
        >
          <path
            d="M5 7l5 5 5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const {
    listaClientes,
    periodo,
    periodoHoy,
    comprobantesNuevos,
    irAPeriodoActual,
    facturas,
  } = useClientes();

  const kpis = useMemo(
    () => calcularKpisDashboard(listaClientes, periodo, periodoHoy, facturas),
    [listaClientes, periodo, periodoHoy, facturas]
  );

  const mesesAnio = useMemo(
    () => calcularResumenAnual(listaClientes, periodo.anio, periodoHoy),
    [listaClientes, periodo.anio, periodoHoy]
  );

  // Serie del año anterior para la comparativa de la gráfica.
  // Forzamos una referencia "ficticia" en diciembre del año anterior
  // para que `calcularResumenAnual` devuelva los 12 meses completos.
  const mesesAnioAnterior = useMemo(
    () =>
      calcularResumenAnual(listaClientes, periodo.anio - 1, {
        mes: 11,
        anio: periodo.anio - 1,
      }),
    [listaClientes, periodo.anio]
  );

  const morosos = useMemo(
    () => listarPrincipalesMorosos(listaClientes, periodo),
    [listaClientes, periodo]
  );

  const topDeudores = useMemo(
    () => listarTopDeudores(listaClientes, periodo, 5),
    [listaClientes, periodo]
  );

  const aging = useMemo(
    () => calcularAgingCartera(listaClientes, periodo),
    [listaClientes, periodo]
  );

  const pagosSinFactura = useMemo(
    () => listarPagosSinFactura(listaClientes, periodo, facturas),
    [listaClientes, periodo, facturas]
  );

  /**
   * Clientes activos cuyo cumpleaños cae en el mes actual.
   * - Ordenados: hoy primero, luego próximos por día ascendente, luego ya pasados.
   * - `diasParaCumple` es positivo si aún falta; 0 si es hoy; negativo si ya pasó.
   */
  const cumplesDelMes = useMemo(() => {
    const hoy = new Date();
    const mesHoy = hoy.getMonth();
    const diaHoy = hoy.getDate();
    const items = listaClientes
      .filter((c) => c.activo && !esIngresoGeneralCliente(c))
      .map((c) => {
        const fecha = fechaNacimientoDeRFC(c.rfc, c.esPersonaMoral);
        if (!fecha || fecha.mes !== mesHoy) return null;
        return { cliente: c, fecha, diasParaCumple: fecha.dia - diaHoy };
      })
      .filter(
        (x): x is { cliente: typeof listaClientes[number]; fecha: { mes: number; dia: number; anio: number }; diasParaCumple: number } => x !== null
      );
    items.sort((a, b) => {
      const ka = a.diasParaCumple < 0 ? 9999 - a.diasParaCumple : a.diasParaCumple;
      const kb = b.diasParaCumple < 0 ? 9999 - b.diasParaCumple : b.diasParaCumple;
      return ka - kb;
    });
    return items;
  }, [listaClientes]);

  const mesActualNombre = useMemo(() => {
    return MESES_NOM[new Date().getMonth()];
  }, []);

  // E.firmas próximas a vencer (0–90 días).
  const [registrosEfirma, setRegistrosEfirma] = useState<RegistroEfirma[]>([]);
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/efirmas", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { registros?: RegistroEfirma[] };
        if (!cancel) setRegistrosEfirma(data.registros ?? []);
      } catch {
        // silencioso: el dashboard sigue funcionando sin la sección
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const efirmasProximas = useMemo(() => {
    return registrosEfirma
      .map((reg) => {
        const dias = diasHastaVencimiento(reg.vigenciaFin);
        const cliente = listaClientes.find((c) => c.id === reg.clienteId);
        return { reg, dias, cliente };
      })
      .filter(
        (x): x is { reg: RegistroEfirma; dias: number; cliente: typeof listaClientes[number] } =>
          !!x.cliente && x.dias >= 0 && x.dias <= 90
      )
      .sort((a, b) => a.dias - b.dias);
  }, [registrosEfirma, listaClientes]);

  const esActual = esPeriodoActual(periodo, periodoHoy);
  const totalEstados =
    kpis.clientesCorrientes + kpis.clientesPendientes + kpis.clientesAtrasados;

  // Estados de colapso por sección — persistidos en localStorage.
  const seccionMes = useColapsoSeccion("kpis-mes");
  const seccionAnio = useColapsoSeccion("kpis-anio");
  const seccionAnalisis = useColapsoSeccion("analisis-grafico");
  const seccionAtencion = useColapsoSeccion("atencion-prioritaria");
  const seccionCalendario = useColapsoSeccion("calendario-fiscal");

  const descargarResumenExcel = () => {
    const { resumen, detalle } = construirResumenExcel(
      listaClientes,
      periodo,
      kpis
    );
    const wb = XLSX.utils.book_new();
    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    const wsDetalle = XLSX.utils.json_to_sheet(detalle);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
    XLSX.utils.book_append_sheet(wb, wsDetalle, "Detalle por cliente");
    XLSX.writeFile(
      wb,
      `resumen-cobranza-${periodo.anio}-${String(periodo.mes + 1).padStart(2, "0")}.xlsx`
    );
  };

  // Tarjetas del MES en curso: foco operativo de hoy.
  // Cada tarjeta clicable manda a /cobranza con un filtro ya aplicado
  // (los filtros ya existen como query params en cobranza/page.tsx).
  const tarjetasMes: TarjetaKpi[] = [
    {
      label: `Cobrado en ${periodoLabel(periodo).split(" ")[0]}`,
      value: fmt(kpis.cobradoMes),
      sub: `${kpis.tasaCobranzaMes}% del esperado del mes`,
      tint: "emerald",
      icon: ICONOS.cobrado,
      href: "/cobranza?filtro=cobrado_mes",
    },
    {
      label: "Pendientes del mes",
      value: fmt(kpis.porCobrarMes),
      sub:
        kpis.vencidoMesMonto > 0
          ? `${kpis.clientesVencidosMes} cliente${kpis.clientesVencidosMes === 1 ? "" : "s"} ya pasó su día · ${fmt(kpis.vencidoMesMonto)}`
          : kpis.porCobrarMes > 0
            ? `${kpis.clientesPorVencerMes + kpis.clientesVencidosMes} cliente${kpis.clientesPorVencerMes + kpis.clientesVencidosMes === 1 ? "" : "s"} sin pagar`
            : "Todos pagados este mes",
      tint: "sky",
      icon: ICONOS.reloj,
      href: "/cobranza?filtro=por_cobrar_mes",
    },
    {
      label: "Vencidos hoy",
      value: fmt(kpis.vencidoMesMonto),
      sub:
        kpis.vencidoMesMonto > 0
          ? "Ya pasó su día de pago acordado"
          : "Todos al corriente del calendario",
      tint: kpis.vencidoMesMonto > 0 ? "amber" : "emerald",
      icon: ICONOS.alerta,
      href: "/cobranza?filtro=por_cobrar_mes",
    },
    {
      label: "Esperado del mes",
      value: fmt(kpis.compromisoMes),
      sub: `${kpis.clientesActivos} cliente${kpis.clientesActivos === 1 ? "" : "s"} activos`,
      tint: "slate",
      icon: ICONOS.diana,
      href: null,
    },
  ];

  // Tarjetas ANUALES + ATRASO: lectura estratégica.
  const tarjetasAnio: TarjetaKpi[] = [
    {
      label: `Esperado ${periodo.anio}`,
      value: fmt(kpis.compromisoAnual),
      sub: "Compromiso acumulado del año",
      tint: "slate",
      icon: ICONOS.calendario,
      href: null,
    },
    {
      label: `Cobrado ${periodo.anio}`,
      value: fmt(kpis.cobradoAnual),
      sub: `${kpis.tasaCobranzaAnual}% del esperado anual`,
      tint: "emerald",
      icon: ICONOS.billete,
      href: null,
    },
    {
      label: "Atrasado (meses anteriores)",
      value: fmt(kpis.atrasadoMonto),
      sub:
        kpis.atrasadoMonto > 0 ? "Deuda vieja sin cobrar" : "Sin deuda vieja",
      tint: kpis.atrasadoMonto > 0 ? "rose" : "emerald",
      icon: ICONOS.triangulo,
      href: "/cobranza?filtro=clientes_atrasados",
    },
    {
      label: "Clientes atrasados",
      value: String(kpis.clientesAtrasados),
      sub: `de ${kpis.clientesActivos} activos en operación`,
      tint: kpis.clientesAtrasados > 0 ? "rose" : "emerald",
      icon: ICONOS.personas,
      href: "/cobranza?filtro=clientes_atrasados",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">
            Panel ejecutivo
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-800">
            Dashboard
          </h1>
          <p className="text-slate-400 font-bold mt-2 text-sm">
            <span className="font-black text-blue-600">
              {etiquetaPeriodoDashboard(periodo)}
            </span>
            {!esActual && (
              <span className="ml-2 text-amber-600">· periodo histórico</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!esActual && (
            <button
              type="button"
              onClick={irAPeriodoActual}
              className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800"
            >
              Ir a mes actual
            </button>
          )}
          <button
            type="button"
            onClick={descargarResumenExcel}
            className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Exportar Excel
          </button>
          <Link
            href="/cobranza"
            className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100"
          >
            Ir a cobranza
            {comprobantesNuevos > 0 && (
              <span className="ml-1.5 inline-flex min-w-[18px] h-[18px] px-1 rounded-full bg-white text-emerald-700 text-[8px] items-center justify-center">
                {comprobantesNuevos}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Bloque KPIs: dos filas claramente segmentadas. */}
      <div className="space-y-4">
        <div>
          <SeccionHeader
            eyebrow={`En curso · ${periodoLabel(periodo).split(" ")[0]}`}
            colapsada={seccionMes.colapsada}
            onToggle={seccionMes.toggle}
            resumen={`Cobrado ${fmt(kpis.cobradoMes)} · Pendiente ${fmt(kpis.porCobrarMes)}`}
          />
          {!seccionMes.colapsada && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {tarjetasMes.map((card) => (
                <TarjetaKpiCard key={card.label} card={card} />
              ))}
            </div>
          )}
        </div>

        <div>
          <SeccionHeader
            eyebrow={`Año ${periodo.anio} · Cartera`}
            colapsada={seccionAnio.colapsada}
            onToggle={seccionAnio.toggle}
            resumen={`Esperado ${fmt(kpis.compromisoAnual)} · Atrasado ${fmt(kpis.atrasadoMonto)}`}
          />
          {!seccionAnio.colapsada && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {tarjetasAnio.map((card) => (
                <TarjetaKpiCard key={card.label} card={card} />
              ))}
            </div>
          )}
        </div>

        {/* Extras del mes en barra angosta. */}
        <div className="p-4 rounded-2xl border shadow-sm bg-white border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
            Extras del mes
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-baseline gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-violet-600">
                Servicios adicionales
              </span>
              <span className="text-base font-black text-violet-700 tabular-nums">
                {fmt(kpis.adicionalesMes)}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                Extra por cobrar
              </span>
              <span className="text-base font-black text-amber-700 tabular-nums">
                {fmt(kpis.extraPorCobrar)}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-600">
                Descuentos aplicados
              </span>
              <span className="text-base font-black text-rose-700 tabular-nums">
                {fmt(kpis.descuentosMes)}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-violet-600">
                Facturado del mes
              </span>
              <span className="text-base font-black text-violet-700 tabular-nums">
                {fmt(kpis.facturadoMes)}
              </span>
            </div>
            {kpis.pendienteFacturarMes > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                  Falta facturar
                </span>
                <span className="text-base font-black text-amber-700 tabular-nums">
                  {fmt(kpis.pendienteFacturarMes)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <SeccionHeader
          eyebrow="Análisis gráfico"
          colapsada={seccionAnalisis.colapsada}
          onToggle={seccionAnalisis.toggle}
          resumen="Ingresos · aging · estatus"
        />
        {!seccionAnalisis.colapsada && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 min-w-0 flex flex-col h-full">
          <GraficoIngresosAnual
            mesesActual={mesesAnio}
            mesesAnterior={mesesAnioAnterior}
            anio={periodo.anio}
          />
        </div>

        <div className="flex flex-col gap-6 min-w-0 h-full">
          <GraficoAgingCartera aging={aging} />

          <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm p-7">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
              Cartera por estatus
            </p>
            {totalEstados === 0 ? (
              <p className="text-sm font-bold text-slate-400">Sin clientes activos.</p>
            ) : (
              <div className="space-y-3">
                {[
                  {
                    label: "Al corriente",
                    n: kpis.clientesCorrientes,
                    pct: Math.round((kpis.clientesCorrientes / totalEstados) * 100),
                    bar: "bg-emerald-500",
                    text: "text-emerald-700",
                  },
                  {
                    label: "Pendiente",
                    n: kpis.clientesPendientes,
                    pct: Math.round((kpis.clientesPendientes / totalEstados) * 100),
                    bar: "bg-amber-400",
                    text: "text-amber-700",
                  },
                  {
                    label: "Atrasado",
                    n: kpis.clientesAtrasados,
                    pct: Math.round((kpis.clientesAtrasados / totalEstados) * 100),
                    bar: "bg-red-500",
                    text: "text-red-700",
                  },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                      <span className={row.text}>{row.label}</span>
                      <span className="text-slate-500">
                        {row.n} · {row.pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.bar}`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
        )}
      </div>

      <div>
        <SeccionHeader
          eyebrow="Atención prioritaria"
          colapsada={seccionAtencion.colapsada}
          onToggle={seccionAtencion.toggle}
          resumen={`${morosos.length} cliente${morosos.length === 1 ? "" : "s"} con saldo`}
        />
        {!seccionAtencion.colapsada && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <GraficoNuevosClientes clientes={listaClientes} anio={periodo.anio} />

        <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col min-h-[320px]">
          <div className="px-5 py-5 lg:px-8 lg:py-6 border-b border-slate-50 flex flex-wrap justify-between items-center gap-3 shrink-0">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Atención prioritaria
              </p>
              <h2 className="text-base lg:text-lg font-black text-slate-800 uppercase tracking-tight">
                Mayores saldos pendientes
              </h2>
            </div>
            <Link
              href="/cobranza"
              className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 shrink-0"
            >
              Ver todos →
            </Link>
          </div>
          {morosos.length === 0 ? (
            <p className="px-5 py-12 text-center text-slate-400 font-bold text-sm flex-1 flex items-center justify-center">
              No hay saldos pendientes en este periodo.
            </p>
          ) : (
            <>
              {/* Móvil: lista compacta */}
              <ul className="lg:hidden divide-y divide-slate-50 flex-1 overflow-auto min-h-0">
                {morosos.map(({ cliente, pendiente, estado }) => (
                  <li
                    key={cliente.id}
                    className="px-5 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {cliente.razonSocial}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            estado === "ATRASADO"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {estado}
                        </span>
                        <p className="text-[9px] font-mono text-slate-300 uppercase tracking-widest truncate">
                          {cliente.rfc}
                        </p>
                      </div>
                    </div>
                    <p className="font-black text-red-600 tabular-nums text-base shrink-0">
                      {fmt(pendiente)}
                    </p>
                  </li>
                ))}
              </ul>
              {/* Desktop: tabla */}
              <div className="hidden lg:block flex-1 overflow-auto min-h-0">
                <table className="w-full text-left">
                  <thead className="bg-[#FBFBFF] text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-4 py-4 text-center">Estatus</th>
                      <th className="px-6 py-4 text-right">Pendiente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {morosos.map(({ cliente, pendiente, estado }) => (
                      <tr key={cliente.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{cliente.razonSocial}</p>
                          <p className="text-[10px] font-mono text-slate-300 uppercase">{cliente.rfc}</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              estado === "ATRASADO"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-red-600 tabular-nums text-lg">
                          {fmt(pendiente)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
        )}
      </div>

      <div>
        <SeccionHeader
          eyebrow="Calendario fiscal del despacho"
          colapsada={seccionCalendario.colapsada}
          onToggle={seccionCalendario.toggle}
          resumen="Vencimientos · calendario iOS · workflow de cierre"
        />
        {!seccionCalendario.colapsada && (
          <CalendarioFiscalAdmin clientes={listaClientes} periodo={periodo} />
        )}
      </div>

      {pagosSinFactura.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-violet-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-violet-50 flex flex-wrap justify-between items-center gap-3">
            <div>
              <p className="text-[9px] font-black text-violet-500 uppercase tracking-widest">
                Control de facturación
              </p>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                Pagos recibidos sin factura · {periodoLabel(periodo)}
              </h2>
              <p className="text-[11px] font-bold text-slate-400 mt-1">
                {pagosSinFactura.length} cliente{pagosSinFactura.length === 1 ? "" : "s"} ·
                {" "}Falta facturar {fmt(kpis.pendienteFacturarMes)}
              </p>
            </div>
            <Link
              href="/cobranza"
              className="text-[9px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800"
            >
              Emitir facturas →
            </Link>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-left">
              <thead className="bg-violet-50/40 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                <tr>
                  <th className="px-8 py-3">Cliente</th>
                  <th className="px-6 py-3 text-right">Pago recibido</th>
                  <th className="px-8 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50">
                {pagosSinFactura.map(({ cliente, monto }) => (
                  <tr key={cliente.id} className="hover:bg-violet-50/30">
                    <td className="px-8 py-3.5">
                      <p className="font-bold text-slate-800 text-sm">{cliente.razonSocial}</p>
                      <p className="text-[10px] font-mono text-slate-300 uppercase">{cliente.rfc}</p>
                    </td>
                    <td className="px-6 py-3.5 text-right font-black text-violet-700 tabular-nums">
                      {fmt(monto)}
                    </td>
                    <td className="px-8 py-3.5 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-violet-100 text-violet-700">
                        Sin factura
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(cumplesDelMes.length > 0 || efirmasProximas.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Cumpleaños del mes */}
          <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 lg:px-6 lg:py-5 border-b border-slate-50 flex justify-between items-center gap-3 shrink-0">
              <div className="min-w-0">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                  Recordatorio
                </p>
                <h2 className="text-base lg:text-lg font-black text-slate-800 uppercase tracking-tight">
                  🎂 Cumpleaños de {mesActualNombre}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  {cumplesDelMes.length} cliente{cumplesDelMes.length === 1 ? "" : "s"} este mes
                </p>
              </div>
            </div>
            {cumplesDelMes.length === 0 ? (
              <p className="px-5 py-10 text-center text-slate-300 font-bold text-xs flex-1 flex items-center justify-center">
                Nadie cumple años este mes.
              </p>
            ) : (
              <ul className="divide-y divide-slate-50 max-h-[360px] overflow-y-auto">
                {cumplesDelMes.map(({ cliente, fecha, diasParaCumple }) => {
                  const esHoy = diasParaCumple === 0;
                  const yaPaso = diasParaCumple < 0;
                  const totalDiasMes = new Date(
                    fecha.anio,
                    fecha.mes + 1,
                    0
                  ).getDate();
                  const pct = esHoy || yaPaso
                    ? 100
                    : Math.max(8, Math.round((1 - diasParaCumple / totalDiasMes) * 100));
                  const colorBarra = esHoy
                    ? "bg-gradient-to-r from-indigo-600 via-pink-500 to-amber-400"
                    : yaPaso
                      ? "bg-slate-200"
                      : "bg-indigo-600";
                  const etiquetaDias = esHoy
                    ? "🎉 HOY"
                    : yaPaso
                      ? "Ya pasó"
                      : `Faltan ${diasParaCumple} día${diasParaCumple === 1 ? "" : "s"}`;
                  const colorEtiqueta = esHoy
                    ? "text-indigo-700 animate-pulse"
                    : yaPaso
                      ? "text-slate-300"
                      : "text-indigo-600";
                  return (
                    <li key={cliente.id} className="px-5 lg:px-6 py-3">
                      <Link
                        href={`/clientes#cliente=${cliente.id}`}
                        className="block group"
                      >
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <div className="min-w-0 flex-1">
                            <p className={`text-[13px] font-bold truncate transition-colors ${yaPaso ? "text-slate-400" : "text-slate-800 group-hover:text-indigo-700"}`}>
                              {cliente.razonSocial}
                            </p>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300 mt-0.5">
                              {formatearFechaNacimientoCorta(fecha)}
                            </p>
                          </div>
                          <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest tabular-nums ${colorEtiqueta}`}>
                            {etiquetaDias}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${colorBarra}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* E.firmas próximas a vencer (3 meses) */}
          <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 lg:px-6 lg:py-5 border-b border-slate-50 flex justify-between items-center gap-3 shrink-0">
              <div className="min-w-0">
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                  Próximos vencimientos
                </p>
                <h2 className="text-base lg:text-lg font-black text-slate-800 uppercase tracking-tight">
                  🔑 E.firmas (3 meses)
                </h2>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  {efirmasProximas.length} por vencer
                </p>
              </div>
              <Link
                href="/efirmas"
                className="text-[9px] font-black uppercase tracking-widest text-amber-700 hover:text-amber-900 shrink-0"
              >
                Ver todas →
              </Link>
            </div>
            {efirmasProximas.length === 0 ? (
              <p className="px-5 py-10 text-center text-slate-300 font-bold text-xs flex-1 flex items-center justify-center">
                Sin vencimientos en los próximos 90 días.
              </p>
            ) : (
              <ul className="divide-y divide-slate-50 max-h-[360px] overflow-y-auto">
                {efirmasProximas.map(({ reg, dias, cliente }) => {
                  const esUrgente = dias <= 7;
                  const esAlerta = dias <= 30;
                  const pct = Math.max(8, Math.round((1 - dias / 90) * 100));
                  const colorBarra = esUrgente
                    ? "bg-red-500"
                    : esAlerta
                      ? "bg-orange-500"
                      : "bg-amber-400";
                  const etiquetaDias =
                    dias === 0
                      ? "🔥 HOY"
                      : dias === 1
                        ? "Mañana"
                        : `Faltan ${dias} día${dias === 1 ? "" : "s"}`;
                  const colorEtiqueta = esUrgente
                    ? "text-red-600"
                    : esAlerta
                      ? "text-orange-600"
                      : "text-amber-700";
                  return (
                    <li key={reg.id} className="px-5 lg:px-6 py-3">
                      <Link
                        href={`/efirmas#cliente=${cliente.id}`}
                        className="block group"
                      >
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-bold text-slate-800 group-hover:text-amber-700 transition-colors truncate">
                              {cliente.razonSocial}
                            </p>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300 mt-0.5">
                              Vence {formatFechaCertificado(reg.vigenciaFin)}
                            </p>
                          </div>
                          <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest tabular-nums ${colorEtiqueta}`}>
                            {etiquetaDias}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${colorBarra}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-400 font-medium text-center pb-4">
        Las facturas PDF se conservan solo del año en curso ({periodoHoy.anio}). Use el selector
        de periodo en el menú lateral para revisar otros años de cobranza.
      </p>
    </div>
  );
}
