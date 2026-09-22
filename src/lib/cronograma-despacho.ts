import {
  type Cliente,
  type Periodo,
  clienteActivoEnPeriodo,
  esIngresoGeneralCliente,
} from "@/lib/clientes";
import { categoriasHabilitadasCliente } from "@/lib/config-cumplimiento-cliente";
import { contabilidadIniciada, type RegistroCumplimiento } from "@/lib/cumplimiento";
import {
  fechaLimiteIMSS,
  fechaLimiteSAT,
  fechaLimiteRepseEnCalendario,
} from "@/lib/portal/fechas-fiscales";
import {
  type Pendiente,
  fechaCompromisoPendiente,
  isoHoy,
  parseIsoFecha,
  pendienteAtrasado,
  pendienteSolapaMes,
} from "@/lib/pendientes";

export function periodoFiscalDeCalendario(
  mesCalendario: number,
  anio: number
): { mes: number; anio: number } {
  if (mesCalendario === 0) return { mes: 11, anio: anio - 1 };
  return { mes: mesCalendario - 1, anio };
}

export function diasEnMes(mes: number, anio: number): number {
  return new Date(anio, mes + 1, 0).getDate();
}

/** Posición 0–100 de un día del mes visible. */
export function pctDia(dia: number, totalDias: number): number {
  return ((Math.min(Math.max(dia, 1), totalDias) - 0.5) / totalDias) * 100;
}

export function pctRango(
  inicio: Date,
  fin: Date,
  mes: number,
  anio: number
): { left: number; width: number } {
  const total = diasEnMes(mes, anio);
  const from = new Date(anio, mes, 1);
  const to = new Date(anio, mes, total);
  const a = inicio.getTime() < from.getTime() ? from : inicio;
  const b = fin.getTime() > to.getTime() ? to : fin;
  const d0 = a.getDate();
  const d1 = b.getDate();
  const left = ((d0 - 1) / total) * 100;
  const width = Math.max(((d1 - d0 + 1) / total) * 100, 2);
  return { left, width };
}

export type MarcasClienteMes = {
  sat: Date | null;
  imss: Date | null;
  repse: Date | null;
};

export type TipoBarraFiscal = "sat" | "imss" | "repse";

export type BarraFiscalMes = {
  tipo: TipoBarraFiscal;
  left: number;
  width: number;
  finMs: number;
};

const ORDEN_EMPATE: Record<TipoBarraFiscal, number> = {
  sat: 0,
  imss: 1,
  repse: 2,
};

/** Día 1 → cada plazo. El que acaba antes se pinta encima. */
export function barrasFiscalesDeMarcas(
  marcas: MarcasClienteMes,
  mes: number,
  anio: number
): BarraFiscalMes[] {
  const inicioMes = new Date(anio, mes, 1);
  const items: BarraFiscalMes[] = [];
  const add = (tipo: TipoBarraFiscal, fin: Date | null) => {
    if (!fin) return;
    items.push({
      tipo,
      ...pctRango(inicioMes, fin, mes, anio),
      finMs: fin.getTime(),
    });
  };
  add("sat", marcas.sat);
  add("imss", marcas.imss);
  add("repse", marcas.repse);
  return items.sort((a, b) => {
    if (b.finMs !== a.finMs) return b.finMs - a.finMs;
    return ORDEN_EMPATE[a.tipo] - ORDEN_EMPATE[b.tipo];
  });
}

export function marcasFiscalesClienteMes(
  cliente: Cliente,
  mesCal: number,
  anio: number
): MarcasClienteMes {
  const periodo = periodoFiscalDeCalendario(mesCal, anio);
  const cats = categoriasHabilitadasCliente(cliente);
  const sat = cats.includes("federales")
    ? fechaLimiteSAT(cliente.rfc, periodo)
    : null;
  const imss = cats.includes("imss") ? fechaLimiteIMSS(periodo) : null;
  const repse = cliente.configRepse?.habilitado
    ? fechaLimiteRepseEnCalendario(anio, mesCal)
    : null;
  const enMes = (d: Date | null) =>
    d && d.getMonth() === mesCal && d.getFullYear() === anio ? d : null;
  return {
    sat: enMes(sat),
    imss: enMes(imss),
    repse: enMes(repse),
  };
}

function inicioDelDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Tramo rojo: el día después del corte → hoy, recortado al mes visible.
 * Así la barra de plazo sigue corriendo cuando ya se venció.
 */
export function barraDesbordeVencidoEnMes(
  corte: Date,
  mes: number,
  anio: number,
  hoy = new Date()
): { left: number; width: number } | null {
  const h = inicioDelDia(hoy);
  const c = inicioDelDia(corte);
  if (h.getTime() <= c.getTime()) return null;
  const inicioRojo = new Date(c.getFullYear(), c.getMonth(), c.getDate() + 1);
  return pctRango(inicioRojo, h, mes, anio);
}

export function primerPlazoVencido(
  marcas: MarcasClienteMes,
  hoy = new Date()
): Date | null {
  const h = inicioDelDia(hoy).getTime();
  const fins = [marcas.sat, marcas.imss, marcas.repse].filter(
    (d): d is Date => d != null && h > inicioDelDia(d).getTime()
  );
  if (fins.length === 0) return null;
  return fins.reduce((a, b) => (a.getTime() <= b.getTime() ? a : b));
}

export function barraDesbordePendienteEnMes(
  p: Pendiente,
  mes: number,
  anio: number,
  hoy = new Date()
): { left: number; width: number } | null {
  if (!pendienteAtrasado(p)) return null;
  const corte = parseIsoFecha(fechaCompromisoPendiente(p));
  if (!corte) return null;
  return barraDesbordeVencidoEnMes(corte, mes, anio, hoy);
}

export function barraResumenTodosEnMes(
  todos: Pendiente[],
  mes: number,
  anio: number
): { left: number; width: number } | null {
  const inicios = todos
    .map((p) => parseIsoFecha(p.inicio))
    .filter((d): d is Date => d != null);
  const fines = todos
    .map((p) => parseIsoFecha(p.fin))
    .filter((d): d is Date => d != null);
  if (inicios.length === 0 || fines.length === 0) return null;
  const a = inicios.reduce((x, y) => (x.getTime() <= y.getTime() ? x : y));
  const b = fines.reduce((x, y) => (x.getTime() >= y.getTime() ? x : y));
  return pctRango(a, b, mes, anio);
}

export function primerCorteVencidoTodos(
  todos: Pendiente[],
  hoy = new Date()
): Date | null {
  const cortes = todos
    .filter((p) => pendienteAtrasado(p, isoHoy(hoy)))
    .map((p) => parseIsoFecha(fechaCompromisoPendiente(p)))
    .filter((d): d is Date => d != null);
  if (cortes.length === 0) return null;
  return cortes.reduce((a, b) => (a.getTime() <= b.getTime() ? a : b));
}

export type FilaCronogramaCliente = {
  clienteId: number | null;
  nombre: string;
  marcas: MarcasClienteMes;
  barrasFiscales: BarraFiscalMes[];
  /** SAT violeta solo con contabilidad iniciada + fecha de trabajo. */
  satEnTrabajo: boolean;
  barraResumen: { left: number; width: number } | null;
  barraVencida: { left: number; width: number } | null;
  deadlineInternoPct: number | null;
  todos: Pendiente[];
};

export function construirFilasCronograma(opts: {
  clientes: Cliente[];
  pendientes: Pendiente[];
  mes: number;
  anio: number;
  getRegistro?: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined;
}): FilaCronogramaCliente[] {
  const { clientes, pendientes, mes, anio, getRegistro } = opts;
  const periodo = periodoFiscalDeCalendario(mes, anio);
  const total = diasEnMes(mes, anio);

  const abiertos = pendientes.filter(
    (p) => p.estado !== "hecho" && pendienteSolapaMes(p, mes, anio)
  );

  const filas: FilaCronogramaCliente[] = [];

  for (const cli of clientes) {
    if (!cli.activo || esIngresoGeneralCliente(cli)) continue;
    if (!clienteActivoEnPeriodo(cli, periodo)) continue;
    const todos = abiertos.filter((p) => p.clienteId === cli.id);
    const marcas = marcasFiscalesClienteMes(cli, mes, anio);
    const barrasFiscales = barrasFiscalesDeMarcas(marcas, mes, anio);
    if (todos.length === 0 && barrasFiscales.length === 0) continue;

    const corteTodo = primerCorteVencidoTodos(todos);
    const corteFiscal = primerPlazoVencido(marcas);
    const corteVencido = corteTodo ?? corteFiscal;
    const interno = primerDeadlineInternoEnMes(todos, mes, anio);
    const conFechaTrabajo = todos.some(
      (p) => !!parseIsoFecha(p.inicio) && !!parseIsoFecha(p.fin)
    );
    const satEnTrabajo =
      contabilidadIniciada(getRegistro?.(cli.id, periodo)) && conFechaTrabajo;

    filas.push({
      clienteId: cli.id,
      nombre: cli.razonSocial,
      marcas,
      barrasFiscales,
      satEnTrabajo,
      barraResumen: barraResumenTodosEnMes(todos, mes, anio),
      barraVencida: corteVencido
        ? barraDesbordeVencidoEnMes(corteVencido, mes, anio)
        : null,
      deadlineInternoPct: interno
        ? pctDia(interno.getDate(), total)
        : null,
      todos,
    });
  }

  const despacho = abiertos.filter((p) => p.clienteId == null);
  if (despacho.length > 0) {
    const interno = primerDeadlineInternoEnMes(despacho, mes, anio);
    const corteVencido = primerCorteVencidoTodos(despacho);
    filas.push({
      clienteId: null,
      nombre: "Despacho",
      marcas: { sat: null, imss: null, repse: null },
      barrasFiscales: [],
      satEnTrabajo: false,
      barraResumen: barraResumenTodosEnMes(despacho, mes, anio),
      barraVencida: corteVencido
        ? barraDesbordeVencidoEnMes(corteVencido, mes, anio)
        : null,
      deadlineInternoPct: interno
        ? pctDia(interno.getDate(), total)
        : null,
      todos: despacho,
    });
  }

  return filas.sort((a, b) => {
    if (b.todos.length !== a.todos.length) return b.todos.length - a.todos.length;
    const da = a.marcas.sat?.getDate() ?? 99;
    const db = b.marcas.sat?.getDate() ?? 99;
    if (da !== db) return da - db;
    return a.nombre.localeCompare(b.nombre, "es");
  });
}

function primerDeadlineInternoEnMes(
  todos: Pendiente[],
  mes: number,
  anio: number
): Date | undefined {
  return todos
    .map((p) => parseIsoFecha(p.deadlineInterno ?? ""))
    .filter(
      (d): d is Date =>
        !!d && d.getMonth() === mes && d.getFullYear() === anio
    )
    .sort((a, b) => a.getTime() - b.getTime())[0];
}

/** Barra de un to-do suelto (inicio–fin), recortada al mes visible. */
export function barraPendienteEnMes(
  p: Pendiente,
  mes: number,
  anio: number
): { left: number; width: number } | null {
  const a = parseIsoFecha(p.inicio);
  const b = parseIsoFecha(p.fin);
  if (!a || !b) return null;
  return pctRango(a, b, mes, anio);
}

export function pctFechaEnMes(
  iso: string | undefined,
  mes: number,
  anio: number
): number | null {
  if (!iso) return null;
  const d = parseIsoFecha(iso);
  if (!d || d.getMonth() !== mes || d.getFullYear() !== anio) return null;
  return pctDia(d.getDate(), diasEnMes(mes, anio));
}

export function pctHoyEnMes(
  mes: number,
  anio: number,
  hoy = new Date()
): number | null {
  if (hoy.getMonth() !== mes || hoy.getFullYear() !== anio) return null;
  return pctDia(hoy.getDate(), diasEnMes(mes, anio));
}

export function marcasEjeMes(
  mes: number,
  anio: number,
  hoy = new Date()
): number[] {
  const total = diasEnMes(mes, anio);
  const base = [1, 5, 10, 15, 17, 20, 25, total];
  if (hoy.getMonth() === mes && hoy.getFullYear() === anio) {
    base.push(hoy.getDate());
  }
  return [...new Set(base.filter((d) => d >= 1 && d <= total))].sort(
    (a, b) => a - b
  );
}

export function marcasGlobalesMes(mes: number, anio: number): {
  imss: Date | null;
  repse: Date | null;
} {
  const periodo = periodoFiscalDeCalendario(mes, anio);
  const imss = fechaLimiteIMSS(periodo);
  const repse = fechaLimiteRepseEnCalendario(anio, mes);
  const enMes = (d: Date | null) =>
    d && d.getMonth() === mes && d.getFullYear() === anio ? d : null;
  return { imss: enMes(imss), repse: enMes(repse) };
}
