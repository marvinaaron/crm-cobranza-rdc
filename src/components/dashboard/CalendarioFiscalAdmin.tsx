"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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
import { Download } from "lucide-react";
import {
  generarTareasMes,
  type CategoriaTarea,
  type TareaCierre,
} from "@/lib/agenda-cierre";
import {
  fechaContabilidadEnMes,
  iconoCarpetaCliente,
  normalizarDiaContabilidad,
} from "@/lib/admin/dia-contabilidad";
import BotonesCalendarioContabilidad from "@/components/admin/BotonesCalendarioContabilidad";

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

type FiltroTipo = "todos" | TipoEventoFiscal;

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

const ICONO_TIPO: Record<TipoEventoFiscal, string> = {
  sat: "🏛️",
  imss: "🩺",
  estatal: "📍",
  repse: "🛠️",
  honorarios: "💼",
  contabilidad: "📒",
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
const DIAS_SEMANA_CORTO = ["L", "M", "M", "J", "V", "S", "D"];

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
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [vista, setVista] = useState<"agenda" | "cronograma">("agenda");
  // Día enfocado en el mini-calendario: se resalta, abre el resumen
  // bajo la grilla y la agenda hace scroll ahí. Ya no filtra.
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null);

  // Tab activo SOLO en móvil. En lg+ se ignora y se ven los 3 bloques
  // simultáneos. Default = "calendario" porque es la vista más útil
  // para llegar rápido a un día puntual desde el celular.
  type TabMovil = "lista" | "calendario" | "workflow";
  const [tabMovil, setTabMovil] = useState<TabMovil>("calendario");

  // Días en los que el usuario "expandió" los cobros (cuando hay
  // muchos honorarios, los colapsamos en un mega-card resumen para
  // no saturar la vista; este set guarda los días donde se expandió).
  const [cobrosExpandidos, setCobrosExpandidos] = useState<Set<string>>(
    () => new Set()
  );
  const toggleCobrosDelDia = (clave: string) => {
    setCobrosExpandidos((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(clave)) nuevo.delete(clave);
      else nuevo.add(clave);
      return nuevo;
    });
  };

  // Umbral a partir del cual colapsamos los cobros de un día en
  // un único item resumen. Por debajo se muestran individualmente.
  const UMBRAL_AGRUPAR_COBROS = 4;

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
      if (filtroTipo !== "todos" && e.tipo !== filtroTipo) continue;
      pushTipo(e.fecha, e.tipo);
    }
    for (const t of tareasTodos) {
      if (filtroTipo !== "todos") continue;
      pushTipo(t.fechaDeadline, "cierre");
    }
    return map;
  }, [eventosTodos, tareasTodos, filtroTipo]);

  // Compat: mapa día → eventos de clientes (export .ics, etc.).
  const eventosPorDia = useMemo(() => {
    const map = new Map<string, EventoConCliente[]>();
    for (const e of eventosTodos) {
      const k = claveFecha(e.fecha);
      const ya = map.get(k);
      if (ya) ya.push(e);
      else map.set(k, [e]);
    }
    return map;
  }, [eventosTodos]);

  // Lista del mes activo (respeta filtro de tipo). El día enfocado
  // del mini-calendario NO recorta la lista: sólo hace scroll.
  const eventosVisibles = useMemo<EventoConCliente[]>(() => {
    return eventosTodos.filter((e) => {
      if (filtroTipo !== "todos" && e.tipo !== filtroTipo) return false;
      return (
        e.fecha.getMonth() === mesActivo.mes &&
        e.fecha.getFullYear() === mesActivo.anio
      );
    });
  }, [eventosTodos, filtroTipo, mesActivo]);

  // Tareas de cierre visibles: sólo con filtro "Todos" (no son SAT/IMSS).
  const tareasVisibles = useMemo<TareaCierre[]>(() => {
    if (filtroTipo !== "todos") return [];
    return tareasTodos.filter((t) => {
      return (
        t.fechaDeadline.getMonth() === mesActivo.mes &&
        t.fechaDeadline.getFullYear() === mesActivo.anio
      );
    });
  }, [tareasTodos, filtroTipo, mesActivo]);

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

  const totalVisibles = eventosVisibles.length + tareasVisibles.length;
  const totalEnMes = useMemo(
    () =>
      eventosTodos.filter(
        (e) =>
          e.fecha.getMonth() === mesActivo.mes &&
          e.fecha.getFullYear() === mesActivo.anio
      ).length + tareasEnMes,
    [eventosTodos, mesActivo, tareasEnMes]
  );

  // Descarga consolidada (.ics) de TODOS los eventos visibles.
  const descargarTodos = () => {
    if (eventosVisibles.length === 0) return;
    const evs: EventoFiscal[] = eventosVisibles.map((e) => ({
      tipo: e.tipo,
      etiqueta: `${e.etiqueta} · ${e.cliente.razonSocial}`,
      fecha: e.fecha,
      periodo: e.periodo,
    }));
    const sufijo = `${mesActivo.nombre.toLowerCase()}-${mesActivo.anio}`;
    descargarIcs(
      evs,
      `calendario-fiscal-rdc-${sufijo}.ics`,
      "Despacho RDC"
    );
  };

  const descargarCliente = (cliente: Cliente) => {
    const suyos: EventoFiscal[] = eventosTodos
      .filter(
        (e) =>
          e.cliente.id === cliente.id && e.fecha.getTime() >= hoy.getTime()
      )
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      .map((e) => ({
        tipo: e.tipo,
        etiqueta: e.etiqueta,
        fecha: e.fecha,
        periodo: e.periodo,
      }));
    if (suyos.length === 0) return;
    descargarIcs(
      suyos,
      `calendario-fiscal-${cliente.rfc.toLowerCase()}.ics`,
      cliente.razonSocial
    );
  };

  const descargarEvento = (e: EventoConCliente) => {
    descargarIcs(
      [
        {
          tipo: e.tipo,
          etiqueta: `${e.etiqueta} · ${e.cliente.razonSocial}`,
          fecha: e.fecha,
          periodo: e.periodo,
        },
      ],
      `evento-${e.tipo}-${claveFecha(e.fecha)}.ics`,
      e.cliente.razonSocial
    );
  };

  // ── Navegación del mini-calendario ────────────────────────────
  const irMesAnterior = () => {
    setDiaSeleccionado(null);
    if (calMes === 0) {
      setCalMes(11);
      setCalAnio((y) => y - 1);
    } else {
      setCalMes((m) => m - 1);
    }
  };
  const irMesSiguiente = () => {
    setDiaSeleccionado(null);
    if (calMes === 11) {
      setCalMes(0);
      setCalAnio((y) => y + 1);
    } else {
      setCalMes((m) => m + 1);
    }
  };
  const irHoy = () => {
    setCalMes(hoy.getMonth());
    setCalAnio(hoy.getFullYear());
    setDiaSeleccionado(hoy);
    setTabMovil("lista");
  };

  const enfocarDia = (d: Date | null) => {
    setDiaSeleccionado(d);
    if (d) {
      setCalMes(d.getMonth());
      setCalAnio(d.getFullYear());
    }
  };

  // Click en un chip de mes: limpia la selección de día y sincroniza
  // el mini-calendario (y el workflow) al mes elegido.
  const seleccionarMes = (idx: MesOffset) => {
    setDiaSeleccionado(null);
    const m = mesesDisponibles[idx];
    setCalMes(m.mes);
    setCalAnio(m.anio);
  };

  const detalleDiaSeleccionado = useMemo(() => {
    if (!diaSeleccionado) return null;
    const k = claveFecha(diaSeleccionado);
    const eventos = eventosTodos.filter((e) => {
      if (claveFecha(e.fecha) !== k) return false;
      if (filtroTipo !== "todos" && e.tipo !== filtroTipo) return false;
      return true;
    });
    const tareas =
      filtroTipo === "todos"
        ? tareasTodos.filter((t) => claveFecha(t.fechaDeadline) === k)
        : [];
    return { fecha: diaSeleccionado, eventos, tareas };
  }, [diaSeleccionado, eventosTodos, tareasTodos, filtroTipo]);

  // ── Autoscroll de la lista ───────────────────────────────────
  //   1. Día enfocado en el mini-cal → scroll a ese día (el mes
  //      sigue visible completo).
  //   2. Mes futuro → arriba (día 1).
  //   3. Mes actual sin foco → línea de hoy.
  const listaRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = listaRef.current;
    if (!root) return;

    const scrollAItem = (el: HTMLElement) => {
      const top =
        el.getBoundingClientRect().top -
        root.getBoundingClientRect().top +
        root.scrollTop -
        8;
      root.scrollTop = Math.max(0, top);
    };

    const intentar = () => {
      if (diaSeleccionado) {
        const key = claveFecha(diaSeleccionado);
        const exact = root.querySelector<HTMLElement>(
          `li[data-fecha="${key}"]`
        );
        if (exact) {
          scrollAItem(exact);
          return true;
        }
        const items = root.querySelectorAll<HTMLLIElement>("li[data-fecha]");
        for (const li of Array.from(items)) {
          if ((li.dataset.fecha ?? "") >= key) {
            scrollAItem(li);
            return true;
          }
        }
        return false;
      }

      const esMesActual =
        mesActivo.mes === hoy.getMonth() &&
        mesActivo.anio === hoy.getFullYear();

      if (!esMesActual) {
        root.scrollTop = 0;
        return true;
      }

      const hoyKey = claveFecha(hoy);
      const lineaHoy = root.querySelector<HTMLElement>("li[data-hoy-linea]");
      if (lineaHoy) {
        scrollAItem(lineaHoy);
        return true;
      }
      const items = root.querySelectorAll<HTMLLIElement>("li[data-fecha]");
      for (const li of Array.from(items)) {
        const f = li.dataset.fecha ?? "";
        if (f >= hoyKey) {
          scrollAItem(li);
          return true;
        }
      }
      return false;
    };

    const id = window.requestAnimationFrame(() => {
      if (intentar()) return;
      window.requestAnimationFrame(() => {
        intentar();
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [agrupadoPorDia, mesActivo, hoy, diaSeleccionado, tabMovil]);

  // ── Construcción de la grilla del mini-calendario ─────────────
  // Devuelve un array de 6 filas × 7 columnas (siempre 42 celdas)
  // empezando en lunes para que sea estable visualmente.
  const grillaCalendario = useMemo(() => {
    const primerDia = new Date(calAnio, calMes, 1);
    // getDay() devuelve 0=Dom..6=Sab; convertimos a 0=Lun..6=Dom.
    const offsetLunes = (primerDia.getDay() + 6) % 7;
    const inicio = new Date(calAnio, calMes, 1 - offsetLunes);
    const celdas: Date[] = [];
    for (let i = 0; i < 42; i += 1) {
      celdas.push(
        new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i)
      );
    }
    return celdas;
  }, [calMes, calAnio]);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="px-5 lg:px-7 py-5 lg:py-6 border-b border-slate-50">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-1">
              Agenda fiscal del despacho
            </p>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Calendario fiscal
            </h2>
            <p className="text-[11px] font-bold text-slate-400 mt-1">
              {vista === "cronograma"
                ? `Cronograma por cliente · ${mesActivo.nombre} ${mesActivo.anio}`
                : `${totalEnMes} vencimiento${totalEnMes === 1 ? "" : "s"} en ${mesActivo.nombre} ${mesActivo.anio}${
                    diaSeleccionado ? ` · ${formatearFecha(diaSeleccionado)}` : ""
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-full bg-slate-100 p-1"
              role="group"
              aria-label="Vista de la agenda"
            >
              {(
                [
                  ["agenda", "Agenda"],
                  ["cronograma", "Cronograma"],
                ] as const
              ).map(([id, label]) => {
                const activo = vista === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => setVista(id)}
                    className={`px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                      activo
                        ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <BotonesCalendarioContabilidad />
            <button
              type="button"
              onClick={descargarTodos}
              disabled={totalVisibles === 0}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-slate-200 transition-colors"
              aria-label="Bajar todos los vencimientos"
              title="Descarga TODOS los vencimientos visibles del mes activo (respeta filtro de tipo). Genera un .ics que iPhone, Google Calendar y Outlook abren nativamente."
            >
              <Download size={15} strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>

        {/* Filtros + indicador de día seleccionado */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {/* Tres meses calendario (actual + 2). El activo se pinta
              en gradient violeta para coincidir con la marca. */}
          <div className="inline-flex rounded-full bg-slate-100 p-1">
            {mesesDisponibles.map((m) => {
              const activo = m.mes === calMes && m.anio === calAnio;
              return (
                <button
                  key={m.offset}
                  type="button"
                  onClick={() => seleccionarMes(m.offset)}
                  className={`px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    activo
                      ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-md shadow-violet-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  title={`Ver vencimientos de ${m.nombre} ${m.anio}`}
                >
                  {m.nombre}
                  {m.offset === 0 && (
                    <span
                      className={`ml-1 text-[7px] ${activo ? "text-white/70" : "text-slate-400"}`}
                    >
                      · Hoy
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {diaSeleccionado && !mismaFecha(diaSeleccionado, hoy) && (
            <button
              type="button"
              onClick={irHoy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
              title="Volver al día de hoy en la agenda"
            >
              Ir a hoy
            </button>
          )}

          {vista === "agenda" && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFiltroTipo("todos")}
              className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
                filtroTipo === "todos"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              Todos · {totalEnMes}
            </button>
            {tareasEnMes > 0 && (
              <button
                type="button"
                onClick={() => setFiltroTipo("todos")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
                  filtroTipo === "todos"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
                title="Incluido en Todos: actividades de cierre del despacho"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${DOT_CIERRE}`} />
                Cierre · {tareasEnMes}
              </button>
            )}
            {(["sat", "imss", "estatal", "repse", "honorarios", "contabilidad"] as const).map((t) => {
              const cnt = conteoPorTipo[t];
              if (cnt === 0) return null;
              const color = COLORES_EVENTO[t];
              const activo = filtroTipo === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFiltroTipo(activo ? "todos" : t)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
                    activo
                      ? `${color.fondoBadge} ${color.textoBadge} ${color.borde} shadow-sm ring-2 ring-offset-1 ring-slate-200`
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                  {ETIQUETA_TIPO_CORTA[t]} · {cnt}
                </button>
              );
            })}
          </div>
          )}

        </div>
      </div>

      {vista === "cronograma" ? (
        <AdminCronograma mes={calMes} anio={calAnio} />
      ) : (
        <>
      {/* SELECTOR DE TABS (solo móvil): condensa la sección a UNA caja
          del tamaño del workflow. En lg+ se oculta y vuelven las 3
          columnas simultáneas. */}
      <div className="lg:hidden px-5 pt-3 pb-1 border-b border-slate-50">
        <div className="inline-flex rounded-full bg-slate-100 p-1 w-full">
          {(
            [
              { id: "calendario" as const, label: "📅 Calendario" },
              { id: "lista" as const, label: "📋 Agenda" },
              { id: "workflow" as const, label: "✓ Workflow" },
            ]
          ).map((tab) => {
            const activo = tabMovil === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTabMovil(tab.id)}
                className={`flex-1 px-2 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  activo
                    ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-md shadow-violet-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CUERPO:
           - mobile: solo el tab activo (caja ~520px con scroll interno).
           - lg: 2 cols arriba (lista | mini-cal) cada una a 640px de alto,
                 timeline ocupando ancho completo abajo con su propia altura.
           - xl: 3 cols en 1 sola fila, todas a 640px → sin huecos blancos. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1.2fr_0.95fr_0.95fr] lg:divide-x divide-slate-50">
        {/* ─── COLUMNA IZQUIERDA: lista ─────────────────────────
             Mask gradient en bordes superior/inferior: al hacer
             scroll el contenido se desvanece en lugar de cortarse
             seco (mismo gesto de iOS). Sólo es visual, no afecta
             interacción. */}
        <div
          ref={listaRef}
          className={`relative min-w-0 h-[520px] overflow-y-auto lg:h-[640px] ${
            tabMovil === "lista" ? "block" : "hidden"
          } lg:block`}
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0, black 24px, black calc(100% - 24px), transparent 100%)",
          }}
        >
          {agrupadoPorDia.length === 0 ? (
            <div className="px-5 py-10">
              {!diaSeleccionado &&
                mesActivo.mes === hoy.getMonth() &&
                mesActivo.anio === hoy.getFullYear() && (
                  <ul className="mb-6">
                    <LineaHoy fechaKey={claveFecha(hoy)} />
                  </ul>
                )}
              <div className="py-8 text-center">
                <p className="text-3xl mb-2">🌴</p>
                <p className="text-sm font-bold text-slate-400">
                  Sin vencimientos fiscales en {mesActivo.nombre}{" "}
                  {mesActivo.anio} con este filtro.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {agrupadoPorDia.map((grupo, idx) => {
                const dias = diasHasta(grupo.fecha);
                const esHoy = dias === 0;
                const esManana = dias === 1;
                const esPasado = dias < 0;
                const fiscalesEnDia = grupo.eventos.filter(
                  (e) => e.tipo !== "honorarios" && e.tipo !== "contabilidad"
                ).length;
                const trabajosEnDia = grupo.eventos.filter(
                  (e) => e.tipo === "contabilidad"
                ).length;
                const relevanteEnDia =
                  fiscalesEnDia + grupo.tareas.length + trabajosEnDia;
                const enMesActual =
                  mesActivo.mes === hoy.getMonth() &&
                  mesActivo.anio === hoy.getFullYear();
                const prev = idx > 0 ? agrupadoPorDia[idx - 1] : null;
                const lineaAntes =
                  enMesActual &&
                  !esHoy &&
                  grupo.fecha.getTime() > hoy.getTime() &&
                  (prev == null || prev.fecha.getTime() < hoy.getTime());
                const esDiaFoco =
                  !!diaSeleccionado && mismaFecha(grupo.fecha, diaSeleccionado);
                return (
                  <Fragment key={claveFecha(grupo.fecha)}>
                    {lineaAntes && <LineaHoy fechaKey={claveFecha(hoy)} />}
                    {esHoy && enMesActual && (
                      <LineaHoy fechaKey={claveFecha(hoy)} />
                    )}
                    <li
                      data-fecha={claveFecha(grupo.fecha)}
                      data-relevante={String(relevanteEnDia)}
                      className={`px-5 lg:px-6 py-4 ${
                        esHoy
                          ? "bg-violet-50/40 border-l-2 border-l-[#7c3aed]"
                          : esDiaFoco
                            ? "bg-indigo-50/40 border-l-2 border-l-indigo-400"
                            : ""
                      }`}
                    >
                    <div className="flex items-start gap-3">
                      {/* Columna fecha — la pila SÁB / 12 / SEP es tipografía.
                           Fondo navy sólo en Hoy; el resto va claro para
                           que no se vea una columna de sellos negros. */}
                      <div className="shrink-0 text-center w-14 relative">
                        <div
                          className={`rounded-[1.2rem] px-1.5 py-2 ${
                            esHoy
                              ? "bg-[#0f1d2e] text-white ring-2 ring-[#7c3aed] shadow-md shadow-violet-200"
                              : esDiaFoco
                                ? "bg-indigo-50 text-[#0f1d2e] ring-2 ring-indigo-400"
                                : esPasado
                                  ? "text-slate-400"
                                  : "bg-slate-50 text-[#0f1d2e]"
                          }`}
                        >
                          <p
                            className={`text-[8px] font-black uppercase tracking-widest leading-tight ${
                              esHoy ? "text-white/70" : "text-slate-400"
                            }`}
                          >
                            {grupo.fecha.toLocaleDateString("es-MX", {
                              weekday: "short",
                            })}
                          </p>
                          <p className="text-xl font-black tabular-nums leading-none mt-0.5">
                            {grupo.fecha.getDate()}
                          </p>
                          <p
                            className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${
                              esHoy ? "text-white/70" : "text-slate-400"
                            }`}
                          >
                            {grupo.fecha.toLocaleDateString("es-MX", {
                              month: "short",
                            })}
                          </p>
                        </div>
                        {esHoy && (
                          <span
                            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#7c3aed] rounded-full ring-2 ring-white animate-ping"
                            aria-hidden="true"
                          />
                        )}
                        <p
                          className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${
                            esHoy
                              ? "text-[#7c3aed]"
                              : esManana
                                ? "text-[#0f1d2e]"
                                : esPasado
                                  ? "text-slate-300"
                                  : "text-slate-400"
                          }`}
                        >
                          {esHoy
                            ? "Hoy"
                            : esManana
                              ? "Mañana"
                              : esPasado
                                ? `${Math.abs(dias)}d`
                                : `en ${dias}d`}
                        </p>
                      </div>

                      {/* Columna eventos — 3 sub-secciones:
                            1. Cierre del despacho (agenda interna)
                            2. Vencimientos fiscales de clientes
                            3. Cobros de honorarios */}
                      {(() => {
                        const cierre = grupo.tareas;
                        const trabajos = grupo.eventos.filter(
                          (e) => e.tipo === "contabilidad"
                        );
                        const fiscales = grupo.eventos.filter(
                          (e) =>
                            e.tipo !== "honorarios" && e.tipo !== "contabilidad"
                        );
                        const cobros = grupo.eventos.filter(
                          (e) => e.tipo === "honorarios"
                        );
                        const seccionesActivas = [
                          cierre.length > 0,
                          trabajos.length > 0,
                          fiscales.length > 0,
                          cobros.length > 0,
                        ].filter(Boolean).length;
                        const mostrarSubheader = seccionesActivas > 1;
                        return (
                          <div className="flex-1 min-w-0">
                            {/* Mini header con fecha + contadores resumidos */}
                            <div className="flex items-baseline justify-between gap-2 mb-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {formatearFecha(grupo.fecha)}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 tabular-nums text-right">
                                {cierre.length > 0 && (
                                  <span className="text-emerald-600">
                                    {cierre.length} cierre
                                    {cierre.length === 1 ? "" : "s"}
                                  </span>
                                )}
                                {cierre.length > 0 && trabajos.length > 0 && (
                                  <span className="text-slate-300"> · </span>
                                )}
                                {trabajos.length > 0 && (
                                  <span className="text-cyan-700">
                                    {trabajos.length} contabilidad
                                    {trabajos.length === 1 ? "" : "es"}
                                  </span>
                                )}
                                {(cierre.length > 0 || trabajos.length > 0) &&
                                  fiscales.length > 0 && (
                                  <span className="text-slate-300"> · </span>
                                )}
                                {fiscales.length > 0 && (
                                  <span>
                                    {fiscales.length} vencimiento
                                    {fiscales.length === 1 ? "" : "s"}
                                  </span>
                                )}
                                {(cierre.length > 0 ||
                                  trabajos.length > 0 ||
                                  fiscales.length > 0) &&
                                  cobros.length > 0 && (
                                    <span className="text-slate-300"> · </span>
                                  )}
                                {cobros.length > 0 && (
                                  <span className="text-rose-500">
                                    {cobros.length} cobro
                                    {cobros.length === 1 ? "" : "s"}
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Sub-sección 0: cierre del despacho */}
                            {cierre.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {mostrarSubheader && (
                                  <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 pl-1 inline-flex items-center gap-1">
                                    <span aria-hidden="true">✓</span>
                                    Cierre del despacho
                                  </p>
                                )}
                                {cierre.map((t) => renderItemTareaCierre(t))}
                              </div>
                            )}

                            {/* Sub-sección 0b: días de trabajo de contabilidad */}
                            {trabajos.length > 0 && (
                              <div className={`space-y-2 ${cierre.length > 0 ? "mb-3" : "mb-3"}`}>
                                {mostrarSubheader && (
                                  <p className="text-[8px] font-black uppercase tracking-widest text-cyan-700 pl-1">
                                    Contabilidad a trabajar
                                  </p>
                                )}
                                {trabajos.map((e, idx) =>
                                  renderItemEvento(
                                    e,
                                    idx,
                                    descargarEvento,
                                    descargarCliente
                                  )
                                )}
                              </div>
                            )}

                            {/* Sub-sección 1: vencimientos fiscales */}
                            {fiscales.length > 0 && (
                              <div className={`space-y-2 ${cierre.length > 0 || trabajos.length > 0 ? "" : ""}`}>
                                {mostrarSubheader && (
                                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 pl-1">
                                    Vencimientos fiscales
                                  </p>
                                )}
                                {fiscales.map((e, idx) =>
                                  renderItemEvento(
                                    e,
                                    idx,
                                    descargarEvento,
                                    descargarCliente
                                  )
                                )}
                              </div>
                            )}

                            {/* Sub-sección 2: cobros de honorarios.
                                · Si hay >= UMBRAL y NO está expandido,
                                  mostramos un único mega-card resumen
                                  (evita que los cobros saturen la vista
                                  y tapen los vencimientos fiscales).
                                · Si hay < UMBRAL o el usuario lo expandió,
                                  mostramos cada cobro individual. */}
                            {cobros.length > 0 && (() => {
                              const claveDia = claveFecha(grupo.fecha);
                              const debeAgrupar =
                                cobros.length >= UMBRAL_AGRUPAR_COBROS &&
                                !cobrosExpandidos.has(claveDia);
                              const total = cobros.reduce(
                                (acc, e) => acc + (e.cliente.honorarios || 0),
                                0
                              );

                              const haySeccionesArriba =
                                cierre.length > 0 ||
                                trabajos.length > 0 ||
                                fiscales.length > 0;

                              if (debeAgrupar) {
                                return (
                                  <div
                                    className={`${haySeccionesArriba ? "mt-3" : ""}`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleCobrosDelDia(claveDia)
                                      }
                                      className="w-full group flex items-center gap-3 p-3 rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-colors text-left"
                                      title="Ver el detalle de los cobros del día"
                                    >
                                      <span
                                        className="text-xl shrink-0"
                                        aria-hidden="true"
                                      >
                                        💼
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-rose-500 mb-0.5">
                                          Cobros del día
                                        </p>
                                        <p className="text-[13px] font-black text-slate-900 leading-tight">
                                          {cobros.length} cobros ·{" "}
                                          {formatearMonto(total)}
                                        </p>
                                        <p className="text-[10px] font-bold text-rose-600 mt-0.5">
                                          {cobros
                                            .slice(0, 3)
                                            .map((c) =>
                                              c.cliente.razonSocial.split(
                                                " "
                                              )[0]
                                            )
                                            .join(", ")}
                                          {cobros.length > 3 &&
                                            ` y ${cobros.length - 3} más`}
                                        </p>
                                      </div>
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white text-rose-600 text-[8px] font-black uppercase tracking-widest border border-rose-200 shrink-0 group-hover:bg-rose-50">
                                        Ver detalle
                                        <svg
                                          width="9"
                                          height="9"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                      </span>
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  className={`space-y-2 ${haySeccionesArriba ? "mt-3" : ""}`}
                                >
                                  {mostrarSubheader && (
                                    <div className="flex items-baseline justify-between gap-2 pl-1">
                                      <p className="text-[8px] font-black uppercase tracking-widest text-rose-500 inline-flex items-center gap-1">
                                        <span aria-hidden="true">💼</span>
                                        Cobros del día · {cobros.length} ·{" "}
                                        {formatearMonto(total)}
                                      </p>
                                      {cobros.length >=
                                        UMBRAL_AGRUPAR_COBROS && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleCobrosDelDia(claveDia)
                                          }
                                          className="text-[8px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700"
                                        >
                                          Colapsar
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  {cobros.map((e, idx) =>
                                    renderItemEvento(
                                      e,
                                      idx,
                                      descargarEvento,
                                      descargarCliente
                                    )
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })()}
                    </div>
                  </li>
                  </Fragment>
                );
              })}
              {mesActivo.mes === hoy.getMonth() &&
                mesActivo.anio === hoy.getFullYear() &&
                (agrupadoPorDia.length === 0 ||
                  agrupadoPorDia[agrupadoPorDia.length - 1].fecha.getTime() <
                    hoy.getTime()) && (
                  <LineaHoy fechaKey={claveFecha(hoy)} />
                )}
            </ul>
          )}
        </div>

        {/* ─── COLUMNA DERECHA: mini-calendario iOS ──────────── */}
        {/* En desktop ocupa la columna del medio con scroll interno;
            en móvil se muestra dentro del tab "calendario" con altura
            fija (~520px) y scroll interno, para no estirar la página. */}
        <div
          className={`h-[520px] overflow-y-auto lg:h-[640px] px-5 lg:px-6 py-5 lg:border-t-0 bg-gradient-to-br from-white via-slate-50/40 to-indigo-50/20 ${
            tabMovil === "calendario" ? "block" : "hidden"
          } lg:block`}
        >
          <MiniCalendarioIOS
            mes={calMes}
            anio={calAnio}
            grilla={grillaCalendario}
            marcadoresPorDia={marcadoresPorDia}
            hoy={hoy}
            diaSeleccionado={diaSeleccionado}
            detalleDia={detalleDiaSeleccionado}
            onSeleccionarDia={enfocarDia}
            onMesAnterior={irMesAnterior}
            onMesSiguiente={irMesSiguiente}
            onIrHoy={irHoy}
            onVerEnAgenda={() => setTabMovil("lista")}
          />
        </div>

        {/* ─── COLUMNA DERECHA: timeline del cierre ──────────── */}
        {/* En lg ocupa el ancho completo de la fila (debajo);
            en xl entra como tercera columna lateral con misma altura
            que las otras dos para evitar huecos en blanco.
            En móvil va dentro del tab "workflow" con altura fija
            (~520px) para que la lista interna del timeline tenga su
            propio scroll y no estire la página. */}
        <div
          className={`h-[520px] lg:col-span-2 xl:col-span-1 lg:h-[640px] overflow-hidden lg:border-slate-50 px-5 lg:px-6 py-5 bg-gradient-to-br from-white via-emerald-50/20 to-slate-50/40 ${
            tabMovil === "workflow" ? "block" : "hidden"
          } lg:block`}
        >
          <TimelineCierreDespacho
            mesActual={hoy.getMonth()}
            anioActual={hoy.getFullYear()}
            mesSincronizado={calMes}
            anioSincronizado={calAnio}
            onCambiarMes={(mes, anio) => {
              setCalMes(mes);
              setCalAnio(anio);
              setDiaSeleccionado(null);
            }}
          />
        </div>
      </div>

      {/* FOOTER explicativo */}
      <div className="px-5 lg:px-7 py-3 bg-slate-50/60 border-t border-slate-100">
        <p className="text-[9px] font-bold text-slate-400 text-center">
          📲 Agenda iPhone (suscripción) actualiza el día si lo mueves · el .ics
          de vencimientos es una foto y puede duplicar si se baja otra vez
        </p>
      </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MINI-CALENDARIO ESTILO iOS                                                  */
/* -------------------------------------------------------------------------- */

function LineaHoy({ fechaKey }: { fechaKey: string }) {
  return (
    <li
      data-fecha={fechaKey}
      data-relevante="1"
      data-hoy-linea="1"
      className="px-5 lg:px-6 py-2 list-none"
      aria-label="Hoy"
    >
      <div className="flex items-center gap-3">
        <div className="w-14 shrink-0" />
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-transparent via-[#0f1d2e] to-[#7c3aed]" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#7c3aed] shrink-0">
            Hoy
          </span>
          <span className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-[#7c3aed] via-[#0f1d2e] to-transparent" />
        </div>
      </div>
    </li>
  );
}

/** Tarjeta de una tarea de cierre del despacho (agenda interna). */
function renderItemTareaCierre(t: TareaCierre) {
  const cat = ESTILO_CATEGORIA_CIERRE[t.categoria];
  return (
    <div
      key={`cierre-${t.id}-${t.mes}-${t.anio}`}
      className={`flex items-center gap-2.5 p-2 rounded-xl border ${cat.border} ${cat.bg} ring-1 ring-emerald-100/80`}
    >
      <span className="text-base shrink-0" aria-hidden="true">
        ✓
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/80 ${cat.text}`}
          >
            {cat.label}
          </span>
          <span className="inline-block px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800">
            Cierre
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-800 leading-tight">
          {t.titulo}
        </p>
        <p className="text-[10px] font-medium text-slate-500 leading-snug mt-0.5 line-clamp-2">
          {t.descripcion}
        </p>
      </div>
    </div>
  );
}

/**
 * Render de un item individual de evento (vencimiento fiscal o cobro).
 * Extraído del JSX inline para que las sub-secciones del día
 * puedan reutilizarlo sin duplicación.
 */
function renderItemEvento(
  e: EventoConCliente,
  idx: number,
  descargarEvento: (e: EventoConCliente) => void,
  descargarCliente: (c: Cliente) => void
) {
  const color = COLORES_EVENTO[e.tipo];
  return (
    <div
      key={`${e.cliente.id}-${e.tipo}-${idx}`}
      className={`group flex items-center gap-2 px-2 py-1 rounded-lg border ${color.borde} ${color.fondoBadge} hover:shadow-sm transition-shadow${
        e.tipo === "contabilidad" ? " border-l-[3px] border-l-cyan-500" : ""
      }`}
    >
      <span className="text-sm shrink-0 leading-none" aria-hidden="true">
        {e.tipo === "contabilidad"
          ? iconoCarpetaCliente(e.cliente)
          : ICONO_TIPO[e.tipo]}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[11px] font-bold text-slate-800 truncate">
          <span
            className={`mr-1.5 inline-block px-1.5 py-0 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/70 align-middle ${color.textoBadge}`}
          >
            {ETIQUETA_TIPO_CORTA[e.tipo]}
          </span>
          <Link
            href={hrefExpediente(e)}
            className="hover:underline hover:text-indigo-700"
            title={
              e.tipo === "honorarios"
                ? `Abrir cobranza de ${e.cliente.razonSocial}`
                : `Abrir cumplimiento de ${e.cliente.razonSocial}`
            }
          >
            {e.cliente.razonSocial}
          </Link>
        </p>
        <p className="text-[10px] font-medium text-slate-500 truncate">
          {e.etiqueta}
        </p>
      </div>
      <div className="flex flex-row items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => descargarEvento(e)}
          className="w-5 h-5 inline-flex items-center justify-center rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          title={
            e.tipo === "honorarios"
              ? `Descargar este cobro (${e.etiqueta}) al calendario`
              : e.tipo === "contabilidad"
                ? `Descargar este día de trabajo (${e.etiqueta}) al calendario`
                : `Descargar este vencimiento (${e.etiqueta}) al calendario`
          }
          aria-label={
            e.tipo === "honorarios"
              ? "Descargar este cobro"
              : e.tipo === "contabilidad"
                ? "Descargar este día de trabajo"
                : "Descargar este vencimiento"
          }
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => descargarCliente(e.cliente)}
          className="w-5 h-5 inline-flex items-center justify-center rounded-md bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 transition-colors"
          title={`Descargar todos los próximos eventos de ${e.cliente.razonSocial} (no solo este mes)`}
          aria-label={`Descargar todos los eventos de ${e.cliente.razonSocial}`}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="17" y1="11" x2="23" y2="11" />
          </svg>
        </button>
      </div>
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

const UMBRAL_PEEK_COBROS = 4;

function FilaPeek({
  dot,
  etiqueta,
  titulo,
  extra,
}: {
  dot: string;
  etiqueta: string;
  titulo: string;
  extra?: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0 py-0.5">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 shrink-0">
        {etiqueta}
      </span>
      <p className="text-[11px] font-bold text-slate-700 truncate min-w-0">
        {titulo}
        {extra ? (
          <span className="ml-1 font-medium text-slate-400">{extra}</span>
        ) : null}
      </p>
    </div>
  );
}

function PanelActividadDia({
  detalle,
  onVerEnAgenda,
}: {
  detalle: {
    fecha: Date;
    eventos: EventoConCliente[];
    tareas: TareaCierre[];
  };
  onVerEnAgenda: () => void;
}) {
  const cobros = detalle.eventos.filter((e) => e.tipo === "honorarios");
  const otros = detalle.eventos.filter((e) => e.tipo !== "honorarios");
  const total = detalle.eventos.length + detalle.tareas.length;
  const agruparCobros = cobros.length >= UMBRAL_PEEK_COBROS;
  const totalCobros = cobros.reduce(
    (s, e) => s + (e.cliente.honorarios ?? 0),
    0
  );

  return (
    <div className="flex-1 min-h-0 mt-3 pt-3 border-t border-slate-100 flex flex-col">
      <div className="flex items-baseline justify-between gap-2 mb-2 shrink-0">
        <p className="text-[11px] font-black text-slate-800 capitalize leading-tight">
          {detalle.fecha.toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
        </p>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 tabular-nums shrink-0">
          {total === 0
            ? "Libre"
            : `${total} ${total === 1 ? "actividad" : "actividades"}`}
        </span>
      </div>
      {total === 0 ? (
        <p className="text-[11px] font-bold text-slate-400">
          Sin vencimientos ni cierre este día.
        </p>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-0.5">
          {detalle.tareas.map((t) => {
            const cat = ESTILO_CATEGORIA_CIERRE[t.categoria];
            return (
              <FilaPeek
                key={`cierre-${t.id}-${t.mes}-${t.anio}`}
                dot={cat.dot}
                etiqueta="Cierre"
                titulo={t.titulo}
              />
            );
          })}
          {otros.map((e, idx) => (
            <FilaPeek
              key={`${e.cliente.id}-${e.tipo}-${idx}`}
              dot={COLORES_EVENTO[e.tipo].dot}
              etiqueta={ETIQUETA_TIPO_CORTA[e.tipo]}
              titulo={e.cliente.razonSocial}
            />
          ))}
          {agruparCobros ? (
            <FilaPeek
              dot={COLORES_EVENTO.honorarios.dot}
              etiqueta="Cobros"
              titulo={`${cobros.length} clientes`}
              extra={formatearMonto(totalCobros)}
            />
          ) : (
            cobros.map((e, idx) => (
              <FilaPeek
                key={`${e.cliente.id}-hon-${idx}`}
                dot={COLORES_EVENTO.honorarios.dot}
                etiqueta="Cobro"
                titulo={e.cliente.razonSocial}
              />
            ))
          )}
        </div>
      )}
      <button
        type="button"
        onClick={onVerEnAgenda}
        className="lg:hidden mt-2 shrink-0 text-[9px] font-black uppercase tracking-widest text-indigo-700 hover:text-indigo-900"
      >
        Ver en la agenda
      </button>
    </div>
  );
}

function MiniCalendarioIOS({
  mes,
  anio,
  grilla,
  marcadoresPorDia,
  hoy,
  diaSeleccionado,
  detalleDia,
  onSeleccionarDia,
  onMesAnterior,
  onMesSiguiente,
  onIrHoy,
  onVerEnAgenda,
}: {
  mes: number;
  anio: number;
  grilla: Date[];
  marcadoresPorDia: Map<string, MarcadorDia>;
  hoy: Date;
  diaSeleccionado: Date | null;
  detalleDia: {
    fecha: Date;
    eventos: EventoConCliente[];
    tareas: TareaCierre[];
  } | null;
  onSeleccionarDia: (d: Date | null) => void;
  onMesAnterior: () => void;
  onMesSiguiente: () => void;
  onIrHoy: () => void;
  onVerEnAgenda: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Header del calendario: mes/año + navegación */}
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-700">
            Vista mensual
          </p>
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            {NOMBRES_MES_CORTO[mes]} {anio}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onIrHoy}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={onMesAnterior}
            aria-label="Mes anterior"
            className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onMesSiguiente}
            aria-label="Mes siguiente"
            className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA_CORTO.map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-1 shrink-0">
        {grilla.map((dia, i) => {
          const esMesActual = dia.getMonth() === mes;
          const esHoy = mismaFecha(dia, hoy);
          const esSeleccionado =
            !!diaSeleccionado && mismaFecha(dia, diaSeleccionado);
          const marcador = marcadoresPorDia.get(claveFecha(dia));
          const tieneEventos = (marcador?.total ?? 0) > 0;
          const tiposUnicos = (marcador?.tipos ?? []).slice(0, 2);
          const mostrarConteo = (marcador?.total ?? 0) >= 4;

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
              onClick={() => {
                if (esSeleccionado) {
                  onSeleccionarDia(null);
                } else {
                  onSeleccionarDia(dia);
                }
              }}
              className={`group relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl transition-all ${
                esSeleccionado
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : esHoy
                    ? "bg-[#0f1d2e] text-white shadow-md shadow-slate-300 ring-2 ring-[#7c3aed]"
                    : tieneEventos
                      ? esMesActual
                        ? "bg-white hover:bg-indigo-50 ring-1 ring-slate-100 hover:ring-indigo-200"
                        : "bg-slate-50/60 hover:bg-indigo-50/50"
                      : esMesActual
                        ? "hover:bg-slate-50"
                        : ""
              }`}
            >
              <span
                className={`text-[11px] font-black tabular-nums leading-none ${
                  esSeleccionado || esHoy
                    ? "text-white"
                    : esMesActual
                      ? "text-slate-800"
                      : "text-slate-300"
                }`}
              >
                {dia.getDate()}
              </span>
              {tieneEventos && (
                <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center gap-0.5">
                  {mostrarConteo ? (
                    <span
                      className={`text-[8px] font-black tabular-nums leading-none ${
                        esSeleccionado || esHoy
                          ? "text-white/90"
                          : "text-slate-500"
                      }`}
                    >
                      {marcador?.total}
                    </span>
                  ) : (
                    tiposUnicos.map((t) => {
                      const dotClass =
                        COLOR_DOT_MARCADOR[t] ?? "bg-slate-400";
                      return (
                        <span
                          key={t}
                          className={`w-1 h-1 rounded-full ${
                            esSeleccionado || esHoy
                              ? "bg-white/90"
                              : dotClass
                          }`}
                        />
                      );
                    })
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {detalleDia ? (
        <PanelActividadDia
          detalle={detalleDia}
          onVerEnAgenda={onVerEnAgenda}
        />
      ) : (
        <>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Tipos de evento
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <span className={`w-1.5 h-1.5 rounded-full ${DOT_CIERRE}`} />
                Cierre
              </span>
              {(
                [
                  "sat",
                  "imss",
                  "estatal",
                  "repse",
                  "honorarios",
                  "contabilidad",
                ] as const
              ).map((t) => {
                const color = COLORES_EVENTO[t];
                return (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                    {ETIQUETA_TIPO_CORTA[t]}
                  </span>
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-[9px] font-bold text-slate-400 text-center">
            Click un día para ver qué hay · el número aparece cuando el día
            está cargado
          </p>
        </>
      )}
    </div>
  );
}
