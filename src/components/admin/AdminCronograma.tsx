"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useClientes } from "@/context/ClientesContext";
import { esIngresoGeneralCliente } from "@/lib/clientes";
import {
  barraDesbordePendienteEnMes,
  barraPendienteEnMes,
  construirFilasCronograma,
  marcasEjeMes,
  pctDia,
  pctFechaEnMes,
  pctHoyEnMes,
  diasEnMes,
} from "@/lib/cronograma-despacho";
import { formatFechaCorta } from "@/lib/pendientes";

type Props = {
  mes: number;
  anio: number;
};

function claveFila(clienteId: number | null): string {
  return clienteId == null ? "despacho" : String(clienteId);
}

const COLOR = {
  sat: "#7c3aed",
  imss: "#059669",
  repse: "#ea580c",
  todo: "#7c3aed",
  vencido: "#dc2626",
};

const COLS = "minmax(12rem, 16rem) minmax(0, 1fr)";

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

function Barra({
  left,
  width,
  color,
  zIndex,
  title,
}: {
  left: number;
  width: number;
  color: string;
  zIndex: number;
  title?: string;
}) {
  return (
    <span
      className="absolute"
      style={{
        left: `${left}%`,
        width: `${width}%`,
        top: 6,
        height: 16,
        borderRadius: 8,
        background: color,
        zIndex,
      }}
      title={title}
    />
  );
}

function Tick({
  pct,
  color,
  title,
}: {
  pct: number;
  color: string;
  title: string;
}) {
  return (
    <span
      className="absolute top-0.5 bottom-0.5 z-[15] w-0.5 rounded-full"
      style={{ left: `${pct}%`, background: color }}
      title={title}
    />
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

function MarcasFiscales({
  marcas,
  total,
}: {
  marcas: { sat: Date | null; imss: Date | null; repse: Date | null };
  total: number;
}) {
  return (
    <>
      {marcas.repse && (
        <Tick
          pct={pctDia(marcas.repse.getDate(), total)}
          color={COLOR.repse}
          title={`REPSE ${marcas.repse.getDate()}`}
        />
      )}
      {marcas.imss && (
        <Tick
          pct={pctDia(marcas.imss.getDate(), total)}
          color={COLOR.imss}
          title={`SIPARE ${marcas.imss.getDate()}`}
        />
      )}
      {marcas.sat && (
        <Tick
          pct={pctDia(marcas.sat.getDate(), total)}
          color={COLOR.sat}
          title={`SAT ${marcas.sat.getDate()}`}
        />
      )}
    </>
  );
}

export default function AdminCronograma({ mes, anio }: Props) {
  const { listaClientes, pendientes, actualizarPendiente } = useClientes();
  const [abiertos, setAbiertos] = useState<Set<string> | null>(null);

  const clientes = useMemo(
    () => listaClientes.filter((c) => c.activo && !esIngresoGeneralCliente(c)),
    [listaClientes]
  );

  const filas = useMemo(
    () => construirFilasCronograma({ clientes, pendientes, mes, anio }),
    [clientes, pendientes, mes, anio]
  );

  const total = diasEnMes(mes, anio);
  const eje = useMemo(() => marcasEjeMes(mes, anio), [mes, anio]);
  const hoyPct = pctHoyEnMes(mes, anio);
  const primerId = filas[0] ? claveFila(filas[0].clienteId) : null;

  function estaAbierto(id: string): boolean {
    if (abiertos == null) return id === primerId;
    return abiertos.has(id);
  }

  function toggle(id: string) {
    setAbiertos((prev) => {
      const base =
        prev ?? (primerId ? new Set([primerId]) : new Set<string>());
      const next = new Set(base);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="px-5 lg:px-7 py-5 space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-3 w-0.5 rounded-full" style={{ background: COLOR.sat }} />
          SAT
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-3 w-0.5 rounded-full" style={{ background: COLOR.imss }} />
          SIPARE
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-3 w-0.5 rounded-full" style={{ background: COLOR.repse }} />
          REPSE
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-3.5 w-5 rounded-full" style={{ background: COLOR.todo }} />
          To-do
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-3.5 w-5 rounded-full" style={{ background: COLOR.vencido }} />
          Fuera de plazo
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-3.5 w-0 border-l-2 border-dashed border-slate-900" />
          Hoy
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block w-0.5 h-3.5 rounded-full bg-white ring-1 ring-slate-900" />
          Tu deadline
        </span>
        <Link
          href="/pendientes"
          className="ml-auto text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800"
        >
          Ver tablero
        </Link>
      </div>

      <div
        className="grid items-end gap-x-3 text-[9px] font-bold text-slate-400"
        style={{ gridTemplateColumns: COLS }}
      >
        <span />
        <div className="relative h-4">
          {eje.map((d) => (
            <span
              key={d}
              className="absolute -translate-x-1/2 tabular-nums"
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
            No hay to-dos en este mes.
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
            const open = estaAbierto(id);
            const n = fila.todos.length;
            return (
              <li key={id} className="py-2.5">
                <div
                  className="grid items-center gap-x-3"
                  style={{ gridTemplateColumns: COLS }}
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
                    <span className="min-w-0 flex items-baseline gap-2">
                      <span className="truncate text-[13px] font-black text-slate-800">
                        {fila.nombre}
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-slate-400">
                        {n} pendiente{n === 1 ? "" : "s"}
                      </span>
                    </span>
                  </button>

                  <PistaGantt>
                    {fila.barraResumen && (
                      <Barra
                        left={fila.barraResumen.left}
                        width={fila.barraResumen.width}
                        color={COLOR.todo}
                        zIndex={1}
                        title="Trabajo del mes"
                      />
                    )}
                    {fila.barraVencida && (
                      <Barra
                        left={fila.barraVencida.left}
                        width={fila.barraVencida.width}
                        color={COLOR.vencido}
                        zIndex={2}
                        title="Fuera de plazo"
                      />
                    )}
                    <MarcasFiscales marcas={fila.marcas} total={total} />
                    {fila.deadlineInternoPct != null && (
                      <LineaDeadline pct={fila.deadlineInternoPct} />
                    )}
                    {hoyPct != null && <LineaHoy pct={hoyPct} />}
                  </PistaGantt>
                </div>

                {open && (
                  <div className="mt-2 space-y-1">
                    <p className="pl-6 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      To do
                    </p>
                    {fila.todos.map((p) => {
                      const barra = barraPendienteEnMes(p, mes, anio);
                      const desborde = barraDesbordePendienteEnMes(p, mes, anio);
                      const blanco = pctFechaEnMes(p.deadlineInterno, mes, anio);
                      return (
                        <div
                          key={p.id}
                          className="grid items-center gap-x-3 py-1"
                          style={{ gridTemplateColumns: COLS }}
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
                              <span className="block truncate text-[10px] font-medium text-slate-400">
                                {fila.nombre} · {formatFechaCorta(p.inicio)}–
                                {formatFechaCorta(p.fin)}
                              </span>
                            </span>
                          </label>
                          <PistaGantt>
                            {barra && (
                              <Barra
                                left={barra.left}
                                width={barra.width}
                                color={COLOR.todo}
                                zIndex={1}
                              />
                            )}
                            {desborde && (
                              <Barra
                                left={desborde.left}
                                width={desborde.width}
                                color={COLOR.vencido}
                                zIndex={2}
                                title="Fuera de plazo"
                              />
                            )}
                            <MarcasFiscales marcas={fila.marcas} total={total} />
                            {blanco != null && <LineaDeadline pct={blanco} />}
                            {hoyPct != null && <LineaHoy pct={hoyPct} />}
                          </PistaGantt>
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[11px] font-medium text-slate-400">
        La fila es el cliente. La flecha abre las tareas.
      </p>
    </div>
  );
}
