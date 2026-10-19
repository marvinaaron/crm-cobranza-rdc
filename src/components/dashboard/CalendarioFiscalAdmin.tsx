"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { esIngresoGeneralCliente, type Cliente, type Periodo } from "@/lib/clientes";
import {
  eventosFiscalesParaCliente,
  COLORES_EVENTO,
  type EventoFiscal,
  type TipoEventoFiscal,
} from "@/lib/portal/fechas-fiscales";
import { descargarIcs } from "@/lib/portal/ics";
import TimelineCierreDespacho from "@/components/dashboard/TimelineCierreDespacho";
import AdminCronograma from "@/components/admin/AdminCronograma";
import {
  generarTareasMes,
  type CategoriaTarea,
  type TareaCierre,
} from "@/lib/agenda-cierre";
import {
  fechaContabilidadEnMes,
  iconoCarpetaCliente,
  nombreCortoCliente,
  normalizarDiaContabilidad,
} from "@/lib/admin/dia-contabilidad";
import BotonesCalendarioContabilidad from "@/components/admin/BotonesCalendarioContabilidad";
import PillDeslizable from "@/components/ui/PillDeslizable";

/**
 * Calendario fiscal agregado del despacho.
 *
 * Layout en dos columnas (en desktop):
 *   ├─ Izquierda: agenda en lista (agrupada por día)
 *   └─ Derecha:   mini-calendario tipo iOS (mes en grid 7×N)
 *
 * Comportamiento:
 *   - Click en un día del mini-calendario resalta, muestra el resumen
 *     de ese día bajo la grilla y hace scroll a ese día en la agenda
 *     (el mes se sigue viendo completo; no se filtra).
 *   - Lista, mini-cal y workflow comparten el mismo mes visible.
 *   - Click en el nombre del cliente abre cumplimiento (cobranza si es
 *     honorarios).
 *   - Flechas del mini-calendario permiten navegar meses adelante;
 *     los eventos para meses fuera del rango se calculan al vuelo
 *     desde el periodo base extendiendo `mesesAdelante` lo necesario.
 *
 * Reutiliza `eventosFiscalesParaCliente` y `descargarIcs` que ya
 * usa el portal del cliente, así que la lógica de fechas (SAT por
 * 6º dígito de RFC, festivos federales, IMSS día 17, etc.) es idéntica.
 */

type Props = {
  clientes: Cliente[];
  /** Mes/año actual del CRM; el calendario empieza en este periodo. */
  periodo: Periodo;
};

type EventoConCliente = EventoFiscal & {
  cliente: Cliente;
};

type GrupoDia = {
  fecha: Date;
  eventos: EventoConCliente[];
  tareas: TareaCierre[];
};

type FiltroKey = TipoEventoFiscal | "cierre";

const FILTROS_AGENDA: { id: FiltroKey; label: string }[] = [
  { id: "sat", label: "SAT" },
  { id: "imss", label: "IMSS" },
  { id: "estatal", label: "Estatal" },
  { id: "repse", label: "REPSE" },
  { id: "honorarios", label: "Honorarios" },
  { id: "contabilidad", label: "Contabilidad" },
  { id: "cierre", label: "Cierre" },
];

const FILTROS_TODOS = new Set<FiltroKey>(FILTROS_AGENDA.map((f) => f.id));

const TITULO_GRUPO: Record<TipoEventoFiscal, string> = {
  sat: "SAT",
  imss: "IMSS",
  estatal: "Estatal",
  repse: "REPSE",
  honorarios: "Honorarios",
  contabilidad: "Contabilidad",
};

const ORDEN_TIPO: TipoEventoFiscal[] = [
  "sat",
  "imss",
  "estatal",
  "repse",
  "contabilidad",
  "honorarios",
];

/** Estilos de badge para tareas de cierre (misma paleta que la timeline). */
const ESTILO_CATEGORIA_CIERRE: Record<
  CategoriaTarea,
  { dot: string; text: string; bg: string; border: string; label: string }
> = {
  documentos: {
    dot: "bg-slate-500",
    text: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: "Documentos",
  },
  contabilidad: {
    dot: "bg-cyan-500",
    text: "text-cyan-800",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    label: "Contabilidad",
  },
  nominas: {
    dot: "bg-fuchsia-500",
    text: "text-fuchsia-700",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-100",
    label: "Nóminas",
  },
  sat: {
    dot: "bg-blue-500",
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
    label: "SAT",
  },
  imss: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "IMSS",
  },
};

const DOT_CIERRE = "bg-emerald-500";

/**
 * En lugar de "ventana de N días" rolling, ahora el filtro temporal
 * son los 3 meses calendario empezando por el actual. Esto permite
 * pensar en "los vencimientos de mayo" sin tener que calcular días.
 */
type MesOffset = 0 | 1 | 2;

const ETIQUETA_TIPO_CORTA: Record<TipoEventoFiscal, string> = {
  sat: "SAT",
  imss: "IMSS",
  estatal: "Estatal",
  repse: "REPSE",
  honorarios: "Honorarios",
  contabilidad: "Contabilidad",
};

const NOMBRES_MES_CORTO = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// El calendario tipo iOS arranca en LUNES (en es-MX es la convención
// común). El array sigue ese orden.
const DIAS_SEMANA_CORTO = ["D", "L", "M", "M", "J", "V", "S"];

function formatearFecha(d: Date): string {
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function diasHasta(d: Date): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000);
}

function claveFecha(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hrefExpediente(e: EventoConCliente): string {
  if (e.tipo === "honorarios") return `/cobranza?cliente=${e.cliente.id}`;
  return `/cumplimiento?cliente=${e.cliente.id}`;
}

function formatearMonto(n: number): string {
  return `$${n.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`;
}

function mismaFecha(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Diferencia en meses entre dos periodos (b - a). Útil para saber
 * cuántos meses adelante hay que calcular eventos cuando el usuario
 * navega el mini-calendario hacia un mes futuro.
 */
function diferenciaMeses(a: Periodo, b: Periodo): number {
  return (b.anio - a.anio) * 12 + (b.mes - a.mes);
}

type MarcadorDia = { tipos: string[]; total: number };

export default function CalendarioFiscalAdmin({ clientes, periodo }: Props) {
  const [filtros, setFiltros] = useState<Set<FiltroKey>>(
    () => new Set(FILTROS_TODOS)
  );
  const [vista, setVista] = useState<"agenda" | "cronograma">("agenda");
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(null);

  const toggleFiltro = (id: FiltroKey) => {
    setFiltros((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Mini-calendario: mes/año visible. Arranca en el mes actual del navegador.
  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [calMes, setCalMes] = useState(() => hoy.getMonth());
  const [calAnio, setCalAnio] = useState(() => hoy.getFullYear());

  /**
   * Los 3 meses calendario seleccionables (actual, +1, +2).
   * Se recalcula sólo si cambia el día (irrelevante en una sesión).
   */
  const mesesDisponibles = useMemo(() => {
    return ([0, 1, 2] as MesOffset[]).map((offset) => {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() + offset, 1);
      return {
        offset,
        mes: d.getMonth(),
        anio: d.getFullYear(),
        nombre: NOMBRES_MES_CORTO[d.getMonth()],
      };
    });
  }, [hoy]);

  const mesActivo = useMemo(
    () => ({
      mes: calMes,
      anio: calAnio,
      nombre: NOMBRES_MES_CORTO[calMes],
    }),
    [calMes, calAnio]
  );

  // Horizonte compartido: eventos de clientes + tareas de cierre del
  // despacho usan el mismo rango de meses. Se estira atrás/adelante
  // cuando el mini-cal navega fuera de los 3 chips.
  const horizonteCalendario = useMemo(() => {
    const mesesDesdeHoy =
      (calAnio - hoy.getFullYear()) * 12 + (calMes - hoy.getMonth());
    const mesesAtras = Math.min(12, Math.max(2, -mesesDesdeHoy + 1));
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - mesesAtras, 1);
    const periodoInicial: Periodo = {
      mes: inicio.getMonth(),
      anio: inicio.getFullYear(),
    };
    const mesesNavegadosAdelante = Math.max(0, mesesDesdeHoy + 2);
    const mesesAdelante = Math.max(6, mesesAtras + mesesNavegadosAdelante + 2);
    return { periodoInicial, mesesAdelante };
  }, [hoy, calMes, calAnio]);

  // Genera TODOS los eventos del despacho:
  //   1. Vencimientos fiscales (SAT, IMSS, etc.) — vía `eventosFiscalesParaCliente`
  //   2. Fechas límite de pago de honorarios — derivadas de `cliente.fechaPago`
  //   3. Días de trabajo de contabilidad — `cliente.diaContabilidad`
  //
  // IMPORTANTE: `fechaLimiteSAT(rfc, periodo)` retorna la fecha en que
  // se PRESENTA la declaración del periodo, que normalmente cae en el
  // mes siguiente al periodo. Por eso arrancamos 2 meses ANTES del mes
  // calendario actual.
  const eventosTodos = useMemo<EventoConCliente[]>(() => {
    const { periodoInicial, mesesAdelante } = horizonteCalendario;

    const out: EventoConCliente[] = [];
    for (const c of clientes) {
      if (!c.activo) continue;

      // (1) Vencimientos fiscales.
      const evs = eventosFiscalesParaCliente(
        c,
        periodoInicial,
        mesesAdelante
      );
      for (const e of evs) out.push({ ...e, cliente: c });

      // (2) Fechas límite de pago de honorarios. `cliente.fechaPago`
      //     es un string del día del mes (ej. "01", "15"). Si está
      //     vacío o inválido, omitimos al cliente.
      const diaPago = parseInt(c.fechaPago ?? "", 10);
      if (Number.isFinite(diaPago) && diaPago >= 1 && diaPago <= 31 && !c.esIngresoGeneral) {
        for (let off = 0; off < mesesAdelante; off += 1) {
          const base = new Date(
            periodoInicial.anio,
            periodoInicial.mes + off,
            1
          );
          const finMes = new Date(
            base.getFullYear(),
            base.getMonth() + 1,
            0
          ).getDate();
          const diaAjustado = Math.min(diaPago, finMes);
          const fecha = new Date(
            base.getFullYear(),
            base.getMonth(),
            diaAjustado
          );
          out.push({
            tipo: "honorarios",
            etiqueta: `Pago honorarios · ${formatearMonto(c.honorarios)}`,
            fecha,
            periodo: { mes: fecha.getMonth(), anio: fecha.getFullYear() },
            cliente: c,
          });
        }
      }

      // (3) Día del mes para trabajar su contabilidad.
      const diaConta = normalizarDiaContabilidad(c.diaContabilidad);
      if (diaConta != null && !esIngresoGeneralCliente(c)) {
        for (let off = 0; off < mesesAdelante; off += 1) {
          const base = new Date(
            periodoInicial.anio,
            periodoInicial.mes + off,
            1
          );
          const fecha = fechaContabilidadEnMes(
            diaConta,
            base.getFullYear(),
            base.getMonth()
          );
          const icono = iconoCarpetaCliente(c);
          out.push({
            tipo: "contabilidad",
            etiqueta: `${icono} Contabilidad`,
            fecha,
            periodo: { mes: fecha.getMonth(), anio: fecha.getFullYear() },
            cliente: c,
            descripcion: `Día asignado para trabajar la contabilidad de ${c.razonSocial}.`,
          });
        }
      }
    }
    return out.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }, [clientes, horizonteCalendario]);

  // Tareas internas de cierre del despacho (las mismas que la sección 3).
  // Sin esto, al elegir un día en el mini-cal (ej. 3 jun) la lista
  // quedaba vacía aunque la timeline mostrara "CSF y Opinión…".
  const tareasTodos = useMemo<TareaCierre[]>(() => {
    const { periodoInicial, mesesAdelante } = horizonteCalendario;
    const out: TareaCierre[] = [];
    for (let off = 0; off < mesesAdelante; off += 1) {
      const base = new Date(
        periodoInicial.anio,
        periodoInicial.mes + off,
        1
      );
      out.push(...generarTareasMes(base.getMonth(), base.getFullYear()));
    }
    return out.sort(
      (a, b) => a.fechaDeadline.getTime() - b.fechaDeadline.getTime()
    );
  }, [horizonteCalendario]);

  // Marcadores por día para el mini-calendario (tipos + conteo).
  // Respetan el filtro de tipo para que el mapa coincida con la lista.
  const marcadoresPorDia = useMemo(() => {
    const map = new Map<string, MarcadorDia>();
    const pushTipo = (fecha: Date, tipo: string) => {
      const k = claveFecha(fecha);
      const ya = map.get(k) ?? { tipos: [], total: 0 };
      ya.total += 1;
      if (!ya.tipos.includes(tipo)) ya.tipos.push(tipo);
      map.set(k, ya);
    };
    for (const e of eventosTodos) {
      if (!filtros.has(e.tipo)) continue;
      pushTipo(e.fecha, e.tipo);
    }
    for (const t of tareasTodos) {
      if (!filtros.has("cierre")) continue;
      pushTipo(t.fechaDeadline, "cierre");
    }
    return map;
  }, [eventosTodos, tareasTodos, filtros]);

  // Lista del mes activo (respeta filtro de tipo). El día enfocado
  // del mini-calendario NO recorta la lista: sólo hace scroll.
  const eventosVisibles = useMemo<EventoConCliente[]>(() => {
    return eventosTodos.filter((e) => {
      if (!filtros.has(e.tipo)) return false;
      return (
        e.fecha.getMonth() === mesActivo.mes &&
        e.fecha.getFullYear() === mesActivo.anio
      );
    });
  }, [eventosTodos, filtros, mesActivo]);

  // Tareas de cierre visibles: sólo con filtro "Todos" (no son SAT/IMSS).
  const tareasVisibles = useMemo<TareaCierre[]>(() => {
    if (!filtros.has("cierre")) return [];
    return tareasTodos.filter((t) => {
      return (
        t.fechaDeadline.getMonth() === mesActivo.mes &&
        t.fechaDeadline.getFullYear() === mesActivo.anio
      );
    });
  }, [tareasTodos, filtros, mesActivo]);

  // Agrupado por día: eventos de clientes + tareas de cierre.
  const agrupadoPorDia = useMemo<GrupoDia[]>(() => {
    const mapa = new Map<string, GrupoDia>();
    const ensure = (fecha: Date): GrupoDia => {
      const k = claveFecha(fecha);
      const ya = mapa.get(k);
      if (ya) return ya;
      const g: GrupoDia = { fecha, eventos: [], tareas: [] };
      mapa.set(k, g);
      return g;
    };
    for (const e of eventosVisibles) {
      ensure(e.fecha).eventos.push(e);
    }
    for (const t of tareasVisibles) {
      ensure(t.fechaDeadline).tareas.push(t);
    }
    return Array.from(mapa.values()).sort(
      (a, b) => a.fecha.getTime() - b.fecha.getTime()
    );
  }, [eventosVisibles, tareasVisibles]);

  // Conteo total por tipo dentro del mes activo (ignora filtro de tipo
  // y día seleccionado: refleja qué hay disponible en ese mes para
  // filtrar).
  const conteoPorTipo = useMemo(() => {
    const totales: Record<TipoEventoFiscal, number> = {
      sat: 0,
      imss: 0,
      estatal: 0,
      repse: 0,
      honorarios: 0,
      contabilidad: 0,
    };
    for (const e of eventosTodos) {
      if (
        e.fecha.getMonth() !== mesActivo.mes ||
        e.fecha.getFullYear() !== mesActivo.anio
      )
        continue;
      totales[e.tipo] += 1;
    }
    return totales;
  }, [eventosTodos, mesActivo]);

  const tareasEnMes = useMemo(
    () =>
      tareasTodos.filter(
        (t) =>
          t.fechaDeadline.getMonth() === mesActivo.mes &&
          t.fechaDeadline.getFullYear() === mesActivo.anio
      ).length,
    [tareasTodos, mesActivo]
  );

  const totalEnMes = useMemo(
    () =>
      eventosTodos.filter(
        (e) =>
          e.fecha.getMonth() === mesActivo.mes &&
          e.fecha.getFullYear() === mesActivo.anio
      ).length + tareasEnMes,
    [eventosTodos, mesActivo, tareasEnMes]
  );

  /** Un evento por tipo+día (clientes en la descripción). Agenda del mes, no fichas sueltas. */
  const descargarTodos = () => {
    const grupos = new Map<string, EventoConCliente[]>();
    for (const e of eventosVisibles) {
      const k = `${e.tipo}-${claveFecha(e.fecha)}`;
      const ya = grupos.get(k);
      if (ya) ya.push(e);
      else grupos.set(k, [e]);
    }
    const evs: EventoFiscal[] = [];
    for (const lista of grupos.values()) {
      const first = lista[0];
      if (!first) continue;
      const nombres = lista
        .map((x) => nombreCortoCliente(x.cliente.razonSocial))
        .join(", ");
      evs.push({
        tipo: first.tipo,
        etiqueta:
          lista.length === 1
            ? `${ETIQUETA_TIPO_CORTA[first.tipo]} · ${nombreCortoCliente(first.cliente.razonSocial)}`
            : `${ETIQUETA_TIPO_CORTA[first.tipo]} · ${lista.length} clientes`,
        fecha: first.fecha,
        periodo: first.periodo,
        descripcion: nombres,
      });
    }
    for (const t of tareasVisibles) {
      evs.push({
        tipo: "sat",
        etiqueta: t.titulo,
        fecha: t.fechaDeadline,
        periodo: { mes: t.mes, anio: t.anio },
        descripcion: t.descripcion,
      });
    }
    if (evs.length === 0) return;
    const sufijo = `${mesActivo.nombre.toLowerCase()}-${mesActivo.anio}`;
    descargarIcs(evs, `agenda-rdc-${sufijo}.ics`, "Despacho RDC");
  };

  // ── Navegación del mini-calendario ────────────────────────────
  const fijarMes = (mes: number, anio: number) => {
    setCalMes(mes);
    setCalAnio(anio);
    const esMesHoy = mes === hoy.getMonth() && anio === hoy.getFullYear();
    setDiaSeleccionado(esMesHoy ? hoy : new Date(anio, mes, 1));
  };
  const irMesAnterior = () => {
    if (calMes === 0) fijarMes(11, calAnio - 1);
    else fijarMes(calMes - 1, calAnio);
  };
  const irMesSiguiente = () => {
    if (calMes === 11) fijarMes(0, calAnio + 1);
    else fijarMes(calMes + 1, calAnio);
  };
  const irHoy = () => {
    setCalMes(hoy.getMonth());
    setCalAnio(hoy.getFullYear());
    setDiaSeleccionado(hoy);
  };

  const enfocarDia = (d: Date) => {
    setDiaSeleccionado(d);
    setCalMes(d.getMonth());
    setCalAnio(d.getFullYear());
  };

  const seleccionarMes = (idx: MesOffset) => {
    const m = mesesDisponibles[idx];
    if (!m) return;
    fijarMes(m.mes, m.anio);
  };

  const diasMostrados = useMemo<GrupoDia[]>(() => {
    const g = agrupadoPorDia.find((x) => mismaFecha(x.fecha, diaSeleccionado));
    return [g ?? { fecha: diaSeleccionado, eventos: [], tareas: [] }];
  }, [agrupadoPorDia, diaSeleccionado]);

  // ── Construcción de la grilla del mini-calendario ─────────────
  // Semana domingo → sábado.
  const grillaCalendario = useMemo(() => {
    const primerDia = new Date(calAnio, calMes, 1);
    const offsetDomingo = primerDia.getDay();
    const diasEnMes = new Date(calAnio, calMes + 1, 0).getDate();
    const celdas = Math.ceil((offsetDomingo + diasEnMes) / 7) * 7;
    const inicio = new Date(calAnio, calMes, 1 - offsetDomingo);
    return Array.from(
      { length: celdas },
      (_, i) =>
        new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i)
    );
  }, [calMes, calAnio]);

  return (
    <div className="space-y-3">
    <div className="rounded-[1.25rem] bg-white ring-1 ring-black/[0.04]">
      {/* HEADER */}
      <div className="px-4 sm:px-5 py-4 border-b border-slate-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-500">
              Calendario
            </p>
            <h2 className="text-[20px] font-bold text-slate-900 tracking-tight leading-tight">
              Agenda del despacho
            </h2>
            <p className="text-[13px] text-slate-400 mt-0.5">
              {vista === "cronograma"
                ? `Vencimientos SAT, SIPARE y REPSE · ${mesActivo.nombre}`
                : `${totalEnMes} vencimiento${totalEnMes === 1 ? "" : "s"} en ${mesActivo.nombre}`}
            </p>
          </div>
          <div className="flex flex-nowrap items-center gap-1.5 self-start sm:self-auto">
            <PillDeslizable
              acento="claro"
              size="sm"
              compact
              value={vista}
              onChange={setVista}
              opciones={[
                { value: "agenda", label: "Agenda" },
                { value: "cronograma", label: "Cronograma" },
              ]}
            />
            {vista === "agenda" ? (
              <MenuFiltroAgenda
                filtros={filtros}
                onToggle={toggleFiltro}
                conteoPorTipo={conteoPorTipo}
                tareasEnMes={tareasEnMes}
              />
            ) : null}
            <BotonesCalendarioContabilidad
              compacto
              onDescargarIcs={descargarTodos}
            />
          </div>
        </div>

      </div>

      {vista === "cronograma" ? (
        <AdminCronograma mes={calMes} anio={calAnio} />
      ) : (
        <>
      <div className="flex flex-col lg:flex-row lg:items-start gap-5 px-4 pt-4 pb-2">
      <div className="w-full max-w-[20rem] mx-auto lg:mx-0 shrink-0">
        <MiniCalendarioIOS
          mes={calMes}
          anio={calAnio}
          nombreMes={mesActivo.nombre}
          grilla={grillaCalendario}
          marcadoresPorDia={marcadoresPorDia}
          hoy={hoy}
          diaSeleccionado={diaSeleccionado}
          onSeleccionarDia={enfocarDia}
          onMesAnterior={irMesAnterior}
          onMesSiguiente={irMesSiguiente}
          onIrHoy={irHoy}
        />
        <div className="mt-3">
          <PillDeslizable
            acento="claro"
            size="sm"
            compact
            value={`${calMes}-${calAnio}`}
            onChange={(v) => {
              const m = mesesDisponibles.find(
                (x) => `${x.mes}-${x.anio}` === v
              );
              if (m) seleccionarMes(m.offset);
            }}
            opciones={mesesDisponibles.map((m) => ({
              value: `${m.mes}-${m.anio}`,
              label: m.nombre.slice(0, 3).toUpperCase(),
            }))}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0 lg:border-l lg:border-slate-100 lg:pl-5 max-h-[28rem] overflow-y-auto">
          {diasMostrados[0]?.eventos.length === 0 &&
          diasMostrados[0]?.tareas.length === 0 ? (
            <div className="px-1 py-8">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-indigo-600">
                {formatearFecha(diaSeleccionado)}
              </p>
              <p className="mt-2 text-[15px] text-slate-400">
                Nada este día. Toca otro en el mes.
              </p>
            </div>
          ) : (
            <div>
              {diasMostrados.map((grupo) => {
                const dias = diasHasta(grupo.fecha);
                const esHoy = dias === 0;
                return (
                  <div key={claveFecha(grupo.fecha)}>
                    <div className="flex items-baseline justify-between gap-3 px-1 pb-3">
                      <p className="text-[13px] font-semibold uppercase tracking-wide text-indigo-600">
                        {esHoy ? "Hoy" : formatearFecha(grupo.fecha)}
                        {esHoy ? (
                          <span className="ml-2 font-medium text-slate-400 normal-case tracking-normal">
                            {grupo.fecha.toLocaleDateString("es-MX", {
                              weekday: "long",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[12px] text-slate-400 tabular-nums">
                        {grupo.tareas.length +
                          new Set(grupo.eventos.map((e) => e.tipo)).size}{" "}
                        {grupo.tareas.length +
                          new Set(grupo.eventos.map((e) => e.tipo)).size ===
                        1
                          ? "actividad"
                          : "actividades"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {grupo.tareas.map((t) => renderItemTareaCierre(t))}
                      {ORDEN_TIPO.map((tipo) => {
                        const lista = grupo.eventos.filter((e) => e.tipo === tipo);
                        if (lista.length === 0) return null;
                        const clave = `${claveFecha(grupo.fecha)}-${tipo}`;
                        return (
                          <CardGrupoEvento
                            key={clave}
                            tipo={tipo}
                            eventos={lista}
                            abierto={grupoAbierto === clave}
                            onToggle={() =>
                              setGrupoAbierto((v) => (v === clave ? null : clave))
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
    {vista === "agenda" ? (
      <TimelineCierreDespacho
        compacto
        mesActual={hoy.getMonth()}
        anioActual={hoy.getFullYear()}
        mesSincronizado={calMes}
        anioSincronizado={calAnio}
        onCambiarMes={(mes, anio) => {
          fijarMes(mes, anio);
        }}
      />
    ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MINI-CALENDARIO ESTILO iOS                                                  */
/* -------------------------------------------------------------------------- */

/** Tarjeta de una tarea de cierre del despacho (agenda interna). */
function renderItemTareaCierre(t: TareaCierre) {
  const cat = ESTILO_CATEGORIA_CIERRE[t.categoria];
  return (
    <div
      key={`cierre-${t.id}-${t.mes}-${t.anio}`}
      className={`rounded-2xl border ${cat.border} ${cat.bg} px-3.5 py-3`}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${cat.text}`}>
        {cat.label} · Cierre
      </p>
      <p className="mt-0.5 text-[15px] font-semibold text-slate-900 leading-snug">
        {t.titulo}
      </p>
      <p className="mt-0.5 text-[13px] text-slate-500 leading-snug line-clamp-2">
        {t.descripcion}
      </p>
    </div>
  );
}

const AVATAR_COLORES = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-orange-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-teal-500",
];

function inicialesCliente(razon: string): string {
  const partes = razon.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0] ?? ""}${partes[1][0] ?? ""}`.toUpperCase();
}

function colorAvatar(id: string | number): string {
  const n = typeof id === "number" ? id : [...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORES[Math.abs(n) % AVATAR_COLORES.length] ?? "bg-slate-400";
}

function AvatarStack({ clientes }: { clientes: Cliente[] }) {
  const visibles = clientes.slice(0, 3);
  const extra = clientes.length - visibles.length;
  return (
    <div className="flex items-center">
      {visibles.map((c, i) => (
        <span
          key={c.id}
          title={c.razonSocial}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white ${colorAvatar(c.id)} ${
            i > 0 ? "-ml-1.5" : ""
          }`}
        >
          {inicialesCliente(c.razonSocial)}
        </span>
      ))}
      {extra > 0 ? (
        <span className="-ml-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white ring-2 ring-white">
          +{extra}
        </span>
      ) : null}
    </div>
  );
}

function CardGrupoEvento({
  tipo,
  eventos,
  abierto,
  onToggle,
}: {
  tipo: TipoEventoFiscal;
  eventos: EventoConCliente[];
  abierto: boolean;
  onToggle: () => void;
}) {
  const color = COLORES_EVENTO[tipo];
  const unico = eventos.length === 1 ? eventos[0] : null;
  const titulo = TITULO_GRUPO[tipo];
  const sub = unico
    ? nombreCortoCliente(unico.cliente.razonSocial)
    : `${eventos.length} clientes`;

  return (
    <div className={`rounded-2xl border ${color.borde} ${color.fondoBadge} px-3.5 py-3`}>
      {unico ? (
        <Link href={hrefExpediente(unico)} className="block min-w-0">
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${color.textoBadge}`}>
            {titulo}
          </p>
          <p className="mt-0.5 text-[15px] font-semibold text-slate-900 truncate">
            {sub}
          </p>
          <p className="mt-0.5 text-[13px] text-slate-500 truncate">{unico.etiqueta}</p>
        </Link>
      ) : (
        <button type="button" onClick={onToggle} className="w-full text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-[11px] font-semibold uppercase tracking-wide ${color.textoBadge}`}>
                {titulo}
              </p>
              <p className="mt-0.5 text-[15px] font-semibold text-slate-900">
                {sub}
              </p>
            </div>
            <AvatarStack clientes={eventos.map((e) => e.cliente)} />
          </div>
        </button>
      )}
      {abierto && !unico ? (
        <ul className="mt-2 space-y-1 border-t border-black/5 pt-2">
          {eventos.map((e) => (
            <li key={e.cliente.id}>
              <Link
                href={hrefExpediente(e)}
                className="flex items-center gap-2 py-1 text-[13px] text-slate-700 hover:text-indigo-700"
              >
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${colorAvatar(e.cliente.id)}`}
                >
                  {inicialesCliente(e.cliente.razonSocial)}
                </span>
                <span className="truncate">{nombreCortoCliente(e.cliente.razonSocial)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MenuFiltroAgenda({
  filtros,
  onToggle,
  conteoPorTipo,
  tareasEnMes,
}: {
  filtros: Set<FiltroKey>;
  onToggle: (id: FiltroKey) => void;
  conteoPorTipo: Record<TipoEventoFiscal, number>;
  tareasEnMes: number;
}) {
  const [abierto, setAbierto] = useState(false);
  const todosOn = FILTROS_AGENDA.every((f) => filtros.has(f.id));
  const activos = FILTROS_AGENDA.filter((f) => filtros.has(f.id));

  return (
    <div className="relative flex items-center gap-1.5 min-w-0">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label="Filtrar agenda"
        title="Filtrar"
        className="relative h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="10" y1="17" x2="14" y2="17" />
        </svg>
        {!todosOn ? (
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-600" />
        ) : null}
      </button>
      {!todosOn && activos.length > 0 ? (
        <p className="min-w-0 max-w-[7rem] sm:max-w-[12rem] truncate text-[12px] font-semibold text-slate-500">
          {activos.map((f) => f.label).join(" · ")}
        </p>
      ) : null}
      {abierto ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setAbierto(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
            {FILTROS_AGENDA.map((f) => {
              const on = filtros.has(f.id);
              const cnt =
                f.id === "cierre" ? tareasEnMes : conteoPorTipo[f.id];
              const dot =
                f.id === "cierre" ? DOT_CIERRE : COLORES_EVENTO[f.id].dot;
              if (cnt === 0) return null;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onToggle(f.id)}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left hover:bg-slate-50"
                >
                  <span
                    className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                      on
                        ? "bg-indigo-600 text-white"
                        : "border-[1.5px] border-slate-300 bg-white"
                    }`}
                    aria-hidden
                  >
                    {on ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : null}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  <span className="flex-1 text-[13px] font-medium text-slate-800">
                    {f.label}
                  </span>
                  <span className="text-[12px] tabular-nums text-slate-400">{cnt}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

const COLOR_DOT_MARCADOR: Record<string, string> = {
  sat: COLORES_EVENTO.sat.dot,
  imss: COLORES_EVENTO.imss.dot,
  estatal: COLORES_EVENTO.estatal.dot,
  repse: COLORES_EVENTO.repse.dot,
  honorarios: COLORES_EVENTO.honorarios.dot,
  contabilidad: COLORES_EVENTO.contabilidad.dot,
  cierre: DOT_CIERRE,
};

function MiniCalendarioIOS({
  mes,
  anio,
  nombreMes,
  grilla,
  marcadoresPorDia,
  hoy,
  diaSeleccionado,
  onSeleccionarDia,
  onMesAnterior,
  onMesSiguiente,
  onIrHoy,
}: {
  mes: number;
  anio: number;
  nombreMes: string;
  grilla: Date[];
  marcadoresPorDia: Map<string, MarcadorDia>;
  hoy: Date;
  diaSeleccionado: Date;
  onSeleccionarDia: (d: Date) => void;
  onMesAnterior: () => void;
  onMesSiguiente: () => void;
  onIrHoy: () => void;
}) {
  const esMesHoy = mes === hoy.getMonth() && anio === hoy.getFullYear();
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[17px] font-bold text-slate-900 tracking-tight">
          {nombreMes}{" "}
          <span className="font-semibold text-slate-400">{anio}</span>
        </p>
        <div className="flex items-center gap-0.5">
          {!esMesHoy ? (
            <button
              type="button"
              onClick={onIrHoy}
              className="px-2 py-1 text-[13px] font-semibold text-indigo-600"
            >
              Hoy
            </button>
          ) : null}
          <button
            type="button"
            onClick={onMesAnterior}
            aria-label="Mes anterior"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMesSiguiente}
            aria-label="Mes siguiente"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-0.5">
        {DIAS_SEMANA_CORTO.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="text-center text-[11px] font-semibold text-slate-400"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {grilla.map((dia, i) => {
          const esMesActual = dia.getMonth() === mes;
          const esHoy = mismaFecha(dia, hoy);
          const esSeleccionado =
            !!diaSeleccionado && mismaFecha(dia, diaSeleccionado);
          const marcador = marcadoresPorDia.get(claveFecha(dia));
          const tieneEventos = (marcador?.total ?? 0) > 0;
          const tiposUnicos = (marcador?.tipos ?? []).slice(0, 3);

          return (
            <button
              key={i}
              type="button"
              aria-pressed={esSeleccionado}
              title={
                tieneEventos
                  ? `${marcador?.total} ${marcador?.total === 1 ? "actividad" : "actividades"}`
                  : "Día libre"
              }
              onClick={() => onSeleccionarDia(dia)}
              className="relative h-10 flex flex-col items-center justify-center"
            >
              <span
                className={`w-7 h-7 inline-flex items-center justify-center rounded-full text-[13px] tabular-nums leading-none ${
                  esSeleccionado
                    ? "bg-indigo-600 text-white font-semibold"
                    : esHoy
                      ? "text-indigo-600 font-bold"
                      : esMesActual
                        ? "text-slate-800 font-medium"
                        : "text-slate-300 font-medium"
                }`}
              >
                {dia.getDate()}
              </span>
              {tieneEventos ? (
                <span className="absolute bottom-0.5 flex items-center justify-center gap-0.5">
                  {tiposUnicos.map((t) => (
                    <span
                      key={t}
                      className={`w-1 h-1 rounded-full ${
                        esSeleccionado
                          ? "bg-indigo-600"
                          : (COLOR_DOT_MARCADOR[t] ?? "bg-slate-400")
                      }`}
                    />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
