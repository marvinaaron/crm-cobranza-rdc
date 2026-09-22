"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useClientes } from "@/context/ClientesContext";
import { esIngresoGeneralCliente } from "@/lib/clientes";
import {
  barraPendienteEnMes,
  construirFilasCronograma,
  marcasEjeMes,
  pctFechaEnMes,
  pctHoyEnMes,
  type TipoBarraFiscal,
} from "@/lib/cronograma-despacho";
import { formatFechaCorta, pendienteAtrasado } from "@/lib/pendientes";

type Props = {
  mes: number;
  anio: number;
};

function claveFila(clienteId: number | null): string {
  return clienteId == null ? "despacho" : String(clienteId);
}

function resumenMarcas(fila: {
  marcas: { sat: Date | null; imss: Date | null; repse: Date | null };
}): string {
  const bits: string[] = [];
  if (fila.marcas.sat) bits.push(`SAT ${fila.marcas.sat.getDate()}`);
  if (fila.marcas.imss) bits.push(`SIPARE ${fila.marcas.imss.getDate()}`);
  if (fila.marcas.repse) bits.push(`REPSE ${fila.marcas.repse.getDate()}`);
  return bits.join(" · ");
}

const COLOR_BARRA: Record<TipoBarraFiscal | "todo" | "todo_atrasado" | "cierre", string> = {
  sat: "#7c3aed",
  imss: "#059669",
  repse: "#ea580c",
  /** Paso 1 de 7: aún no arranca el cierre. Distinto del violeta SAT. */
  cierre: "#c4b5fd",
  /** Al corriente: mismo azul/aqua de ingresos en la gráfica de CFDI. */
  todo: "#06b6d4",
  /** Ya pasó su fecha: rojo de alerta. */
  todo_atrasado: "#dc2626",
};

const TITULO_BARRA: Record<TipoBarraFiscal, string> = {
  sat: "SAT",
  imss: "SIPARE",
  repse: "REPSE",
};

function BarraGantt({
  left,
  width,
  tono,
  zIndex,
  title,
  alto,
}: {
  left: number;
  width: number;
  tono: TipoBarraFiscal | "todo" | "todo_atrasado" | "cierre";
  zIndex: number;
  title?: string;
  /** Más alta = halo detrás de SAT/IMSS/REPSE. */
  alto?: "halo" | "barra";
}) {
  const halo = alto === "halo";
  return (
    <span
      className="absolute"
      style={{
        left: `${left}%`,
        width: `${width}%`,
        top: halo ? 3 : 6,
        height: halo ? 22 : 16,
        borderRadius: 8,
        background: COLOR_BARRA[tono],
        zIndex,
      }}
      title={title}
    />
  );
}

function PistaGantt({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative"
      style={{
        height: 28,
        borderRadius: 8,
        background: "color-mix(in srgb, CanvasText 10%, Canvas)",
      }}
    >
      {children}
    </div>
  );
}

function LineaHoy({ pct }: { pct: number }) {
  return (
    <span
      className="absolute top-0.5 bottom-0.5 z-30"
      style={{
        left: `${pct}%`,
        borderLeft: "2px dashed light-dark(#0f1d2e, #e8eef6)",
      }}
      title="Hoy"
    />
  );
}

function LineaDeadline({ pct }: { pct: number }) {
  return (
    <span
      className="absolute top-0.5 bottom-0.5 z-20 w-0.5 rounded-full bg-white ring-1 ring-slate-900"
      style={{ left: `${pct}%` }}
      title="Tu deadline"
    />
  );
}

export default function AdminCronograma({ mes, anio }: Props) {
  const { listaClientes, pendientes, actualizarPendiente, getCumplimientoPeriodo } =
    useClientes();
  const [abiertos, setAbiertos] = useState<Set<string>>(() => new Set());

  const clientes = useMemo(
    () => listaClientes.filter((c) => c.activo && !esIngresoGeneralCliente(c)),
    [listaClientes]
  );

  const filas = useMemo(
    () =>
      construirFilasCronograma({
        clientes,
        pendientes,
        mes,
        anio,
        getRegistro: getCumplimientoPeriodo,
      }),
    [clientes, pendientes, mes, anio, getCumplimientoPeriodo]
  );

  const eje = useMemo(() => marcasEjeMes(mes, anio), [mes, anio]);
  const hoyPct = pctHoyEnMes(mes, anio);

  function toggle(id: string) {
    setAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="px-5 lg:px-7 py-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <i
              className="inline-block h-3.5 w-5 rounded-full"
              style={{ background: COLOR_BARRA.sat }}
              aria-hidden
            />
            SAT
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i
              className="inline-block h-3.5 w-5 rounded-full"
              style={{ background: COLOR_BARRA.imss }}
              aria-hidden
            />
            SIPARE
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i
              className="inline-block h-3.5 w-5 rounded-full"
              style={{ background: COLOR_BARRA.repse }}
              aria-hidden
            />
            REPSE
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i
              className="inline-block h-3.5 w-5 rounded-full"
              style={{ background: COLOR_BARRA.cierre }}
              aria-hidden
            />
            Cierre no iniciado
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i
              className="inline-block h-3.5 w-5 rounded-full"
              style={{ background: COLOR_BARRA.todo }}
              aria-hidden
            />
            To-do
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i
              className="inline-block h-3.5 w-5 rounded-full"
              style={{ background: COLOR_BARRA.todo_atrasado }}
              aria-hidden
            />
            Vencido
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i
              className="inline-block h-3.5 w-0 border-l-2 border-dashed border-slate-900"
              aria-hidden
            />
            Hoy
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block w-0.5 h-3.5 rounded-full bg-white ring-1 ring-slate-900" aria-hidden />
            Tu deadline
          </span>
        </div>
        <Link
          href="/pendientes"
          className="text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800"
        >
          Ver tablero
        </Link>
      </div>

      <div
        className="grid items-end gap-x-3 text-[9px] font-black uppercase tracking-widest text-slate-400"
        style={{ gridTemplateColumns: "minmax(11rem, 15rem) minmax(0, 1fr)" }}
      >
        <span>Cliente</span>
        <div className="relative h-4">
          {eje.map((d) => (
            <span
              key={d}
              className="absolute -translate-x-1/2"
              style={{ left: `${pctDia(d, total)}%` }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {filas.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-bold text-slate-400">
            No hay plazos ni to-dos en este mes.
          </p>
          <Link
            href="/pendientes"
            className="inline-block mt-3 text-[11px] font-black uppercase tracking-widest text-violet-600"
          >
            Agregar en Pendientes
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {filas.map((fila) => {
            const id = claveFila(fila.clienteId);
            const open = abiertos.has(id);
            const resumen = resumenMarcas(fila);
            return (
              <li key={id} className="py-2">
                <div
                  className="grid items-center gap-x-3"
                  style={{
                    gridTemplateColumns: "minmax(11rem, 15rem) minmax(0, 1fr)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    aria-expanded={open}
                    className="flex items-center gap-1.5 min-w-0 text-left"
                  >
                    <ChevronDown
                      size={14}
                      className={`shrink-0 text-slate-400 transition-transform ${
                        open ? "rotate-0" : "-rotate-90"
                      }`}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-black text-slate-800">
                        {fila.nombre}
                      </span>
                      <span className="block truncate text-[10px] font-bold text-slate-400">
                        {fila.barraCierreNoIniciado
                          ? [resumen, "Cierre no iniciado"].filter(Boolean).join(" · ")
                          : resumen ||
                            (fila.todos.length
                              ? `${fila.todos.length} to-do${fila.todos.length === 1 ? "" : "s"}`
                              : "Sin plazo este mes")}
                      </span>
                    </span>
                  </button>

                  <PistaGantt>
                    {fila.barraCierreNoIniciado && (
                      <BarraGantt
                        left={fila.barraCierreNoIniciado.left}
                        width={fila.barraCierreNoIniciado.width}
                        tono="cierre"
                        zIndex={0}
                        alto="halo"
                        title="Cierre no iniciado"
                      />
                    )}
                    {fila.barrasFiscales.map((barra, i) => (
                      <BarraGantt
                        key={barra.tipo}
                        left={barra.left}
                        width={barra.width}
                        tono={barra.tipo}
                        zIndex={i + 1}
                        title={TITULO_BARRA[barra.tipo]}
                      />
                    ))}
                    {fila.deadlineInternoPct != null && (
                      <LineaDeadline pct={fila.deadlineInternoPct} />
                    )}
                    {hoyPct != null && <LineaHoy pct={hoyPct} />}
                  </PistaGantt>
                </div>

                {open && (
                  <div className="mt-1.5 space-y-1">
                    {fila.todos.length === 0 ? (
                      <p className="pl-6 text-[11px] font-bold text-slate-400">
                        Sin to-dos.{" "}
                        <Link href="/pendientes" className="text-violet-600">
                          Agregar en Pendientes
                        </Link>
                      </p>
                    ) : (
                      fila.todos.map((p) => {
                        const barra = barraPendienteEnMes(p, mes, anio);
                        const blanco = pctFechaEnMes(p.deadlineInterno, mes, anio);
                        return (
                          <div
                            key={p.id}
                            className="grid items-center gap-x-3 py-1"
                            style={{
                              gridTemplateColumns:
                                "minmax(11rem, 15rem) minmax(0, 1fr)",
                            }}
                          >
                            <label className="flex items-start gap-2 min-w-0 pl-6 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-violet-600"
                                checked={false}
                                onChange={() =>
                                  actualizarPendiente(p.id, { estado: "hecho" })
                                }
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-[12px] font-bold text-slate-800">
                                  {p.titulo}
                                </span>
                                <span className="block truncate text-[10px] font-bold text-slate-400">
                                  {fila.nombre} · {formatFechaCorta(p.inicio)}–
                                  {formatFechaCorta(p.fin)}
                                </span>
                              </span>
                            </label>
                            <PistaGantt>
                              {barra && (
                                <BarraGantt
                                  left={barra.left}
                                  width={barra.width}
                                  tono={
                                    pendienteAtrasado(p) ? "todo_atrasado" : "todo"
                                  }
                                  zIndex={1}
                                />
                              )}
                              {blanco != null && <LineaDeadline pct={blanco} />}
                              {hoyPct != null && <LineaHoy pct={hoyPct} />}
                            </PistaGantt>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
