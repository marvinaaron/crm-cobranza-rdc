"use client";

import { useMemo, useState } from "react";
import type { Cliente, Periodo } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import {
  getCorreoIndividualCliente,
  siguientePasoCorreo,
  type TipoCorreoCobranza,
} from "@/lib/correo";
import {
  SEMAFORO_CLASE,
  SEMAFORO_LABEL,
  kpisCobroManual,
  resumirAnillosCobroManual,
  type FilaCobroManual,
  type SemaforoCobro,
} from "@/lib/cobro-manual";
import type {
  AgingBucketKey,
  AgingCartera,
  MesResumenAnual,
} from "@/lib/dashboard-metrics";
import { montosAgingCliente } from "@/lib/dashboard-metrics";
import {
  AnillosCobroCard,
  BARRAS_AGING,
  CobranzaPorCliente,
  GraficoCarteraVencida,
  GraficoCobranzaAnio,
} from "@/components/admin/CobroManualGraficas";
import type { MarcaRecordatorio } from "@/lib/recordatorios";
import BotonCorreoCliente from "@/components/admin/BotonCorreoCliente";
import EncabezadoOrdenable from "@/components/admin/EncabezadoOrdenable";
import MenuFiltroIcono from "@/components/admin/MenuFiltroIcono";
import {
  alternarOrdenTabla,
  compararCeldasTabla,
  type OrdenTablaDir,
} from "@/lib/tabla-orden";

type Fila = FilaCobroManual & {
  correo: ReturnType<typeof getCorreoIndividualCliente>;
  ultima?: MarcaRecordatorio;
  enviadoEn?: string;
};

type FiltroKpi = "todos" | "por_cobrar" | "vigente" | "vencido";
type SortKey = "cliente" | "importe" | "fecha" | "estatus";

function fmt(n: number): string {
  return `$${n.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`;
}

function valorOrden(f: Fila, key: SortKey): string | number {
  switch (key) {
    case "cliente":
      return f.cliente.razonSocial;
    case "importe":
      return f.monto;
    case "fecha":
      return f.fechaLabel;
    case "estatus":
      return f.semaforo;
  }
}

export default function CobroManualLista({
  filas,
  periodo,
  mesesAnio,
  aging,
  notify,
  onContactado,
  marcarManual,
  desmarcar,
}: {
  filas: Fila[];
  periodo: Periodo;
  mesesAnio: MesResumenAnual[];
  aging: AgingCartera;
  notify: (opts: {
    titulo: string;
    mensaje?: string;
    tono?: "info" | "warning" | "danger";
  }) => void;
  onContactado: (
    c: Cliente,
    tipo: TipoCorreoCobranza
  ) => (via: "enviado" | "copiado" | "borrador") => void;
  marcarManual: (c: Cliente, tipo: TipoCorreoCobranza) => void;
  desmarcar: (c: Cliente) => void;
}) {
  const { listaClientes, facturas } = useClientes();
  const [filtroKpi, setFiltroKpi] = useState<FiltroKpi>("todos");
  const [filtroAging, setFiltroAging] = useState<AgingBucketKey | null>(null);
  const [filtroAnillo, setFiltroAnillo] = useState<string | null>(null);
  const [soloSinContactar, setSoloSinContactar] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | "natural">("natural");
  const [sortDir, setSortDir] = useState<OrdenTablaDir>("asc");
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());

  const kpis = useMemo(() => kpisCobroManual(filas), [filas]);
  const anillos = useMemo(
    () => resumirAnillosCobroManual(listaClientes, periodo, facturas),
    [listaClientes, periodo, facturas]
  );

  const limpiarFiltrosVista = () => {
    setFiltroKpi("todos");
    setFiltroAging(null);
    setFiltroAnillo(null);
  };

  const visibles = useMemo(() => {
    let lista = filas;
    if (filtroAging) {
      lista = lista.filter(
        (f) => montosAgingCliente(f.cliente, periodo)[filtroAging] > 0
      );
    } else if (filtroAnillo === "cobrado" || filtroAnillo === "pagaron") {
      lista = lista.filter((f) => f.saldoMes <= 0);
    } else if (filtroAnillo === "factura") {
      lista = lista.filter(
        (f) => !facturas.some(
          (fac) =>
            fac.clienteId === f.cliente.id &&
            fac.mes === periodo.mes &&
            fac.anio === periodo.anio
        )
      );
    } else if (filtroAnillo === "al-dia") {
      lista = lista.filter((f) => f.atrasado <= 0);
    } else if (filtroKpi === "vencido") {
      lista = lista.filter((f) => f.atrasado > 0);
    } else if (filtroKpi === "vigente") {
      lista = lista.filter((f) => f.saldoMes > 0);
    } else if (filtroKpi === "por_cobrar") {
      lista = lista.filter((f) => f.monto > 0);
    }
    if (soloSinContactar) lista = lista.filter((f) => !f.ultima);
    if (sortKey === "natural") return lista;
    return [...lista].sort((a, b) =>
      compararCeldasTabla(valorOrden(a, sortKey), valorOrden(b, sortKey), sortDir)
    );
  }, [
    filas,
    filtroKpi,
    filtroAging,
    filtroAnillo,
    soloSinContactar,
    sortKey,
    sortDir,
    periodo,
    facturas,
  ]);

  const toggleSort = (key: SortKey) => {
    setSortKey((prev) => {
      setSortDir((dir) =>
        alternarOrdenTabla(
          prev === "natural" ? key : prev,
          key,
          dir,
          key === "importe" ? "desc" : "asc"
        )
      );
      return key;
    });
  };

  const tarjetas: Array<{
    key: FiltroKpi;
    label: string;
    value: string;
    detalle: string;
    color: string;
  }> = [
    {
      key: "por_cobrar",
      label: "Por cobrar",
      value: fmt(kpis.porCobrar),
      detalle: `${filas.length} cliente${filas.length === 1 ? "" : "s"}`,
      color: "text-slate-900",
    },
    {
      key: "vigente",
      label: "Vigente",
      value: fmt(kpis.vigente),
      detalle:
        kpis.venceHoy > 0
          ? `${fmt(kpis.venceHoy)} de este mes vence hoy`
          : "Saldo de este mes, aunque deban atrás",
      color: "text-slate-900",
    },
    {
      key: "vencido",
      label: "Vencido",
      value: fmt(kpis.vencido),
      detalle: "Meses anteriores y extras",
      color: "text-slate-900",
    },
    {
      key: "vencido",
      label: "% vencido",
      value: `${kpis.pctVencido}%`,
      detalle: "Sobre el por cobrar",
      color: "text-slate-900",
    },
  ];

  const tipoDe = (f: Fila): TipoCorreoCobranza =>
    siguientePasoCorreo(f.ultima) ?? f.ultima?.tipo ?? "recordatorio";

  const marcarSel = () => {
    for (const f of visibles) {
      if (seleccionados.has(f.cliente.id) && !f.ultima) {
        marcarManual(f.cliente, tipoDe(f));
      }
    }
    setSeleccionados(new Set());
  };

  const todosVisiblesMarcados =
    visibles.length > 0 && visibles.every((f) => seleccionados.has(f.cliente.id));

  return (
    <>
      <div className="rounded-[1.25rem] bg-white overflow-hidden mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-[auto_auto_auto]">
          {tarjetas.map((card, i) => {
            const activaKpi =
              (card.label === "% vencido" && filtroKpi === "vencido") ||
              (card.label !== "% vencido" && filtroKpi === card.key);
            return (
              <button
                key={`${card.label}-${i}`}
                type="button"
                onClick={() => {
                  setFiltroAging(null);
                  setFiltroAnillo(null);
                  setFiltroKpi((prev) => (prev === card.key ? "todos" : card.key));
                }}
                className={`min-w-0 grid grid-rows-subgrid row-span-3 px-3 py-4 sm:px-5 text-left transition-colors ${
                  activaKpi ? "bg-slate-50" : "active:bg-slate-50/80"
                }`}
              >
                <p className="text-[11px] font-semibold text-slate-500 truncate">
                  {card.label}
                  {activaKpi ? (
                    <span className="ml-1 text-slate-400">· filtro</span>
                  ) : null}
                </p>
                <p
                  className={`mt-1.5 text-[22px] sm:text-[26px] font-bold tabular-nums leading-none tracking-tight whitespace-nowrap ${card.color}`}
                >
                  {card.value}
                </p>
                <p className="mt-1.5 text-[11px] text-slate-400 leading-snug truncate min-h-[1.25rem]">
                  {card.detalle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-6">
        <div className="lg:col-span-4 min-w-0">
          <GraficoCobranzaAnio meses={mesesAnio} anio={periodo.anio} />
        </div>
        <div className="lg:col-span-4 min-w-0">
          <GraficoCarteraVencida
            aging={aging}
            seleccionado={filtroAging}
            onSeleccionar={(key) => {
              setFiltroKpi("todos");
              setFiltroAnillo(null);
              setFiltroAging(key);
            }}
          />
        </div>
        <div className="lg:col-span-4 min-w-0">
          <AnillosCobroCard
            anillos={anillos}
            filtro={filtroAnillo}
            onFiltro={(id) => {
              setFiltroKpi("todos");
              setFiltroAging(null);
              setFiltroAnillo(id);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-start">
        <div className="lg:col-span-3 min-w-0">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <p className="text-[13px] font-semibold text-slate-500 mr-auto">
          Por cobrar del periodo
          {filtroAging ? (
            <span className="ml-1.5 font-medium text-slate-400">
              · {BARRAS_AGING.find((b) => b.key === filtroAging)?.label}
              <button
                type="button"
                onClick={limpiarFiltrosVista}
                className="ml-1 text-slate-500 hover:text-slate-800"
              >
                ×
              </button>
            </span>
          ) : filtroAnillo ? (
            <span className="ml-1.5 font-medium text-slate-400">
              · {filtroAnillo === "al-dia" ? "Al día" : filtroAnillo}
              <button
                type="button"
                onClick={limpiarFiltrosVista}
                className="ml-1 text-slate-500 hover:text-slate-800"
              >
                ×
              </button>
            </span>
          ) : null}
        </p>
        {seleccionados.size > 0 ? (
          <button
            type="button"
            onClick={marcarSel}
            className="h-9 px-3 rounded-full bg-emerald-600 text-white text-[13px] font-semibold hover:bg-emerald-700"
          >
            Marcar {seleccionados.size}
          </button>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <MenuFiltroIcono
            grupos={[
              {
                titulo: "Seguimiento",
                modo: "single",
                valorPorDefecto: "todos",
                opciones: [
                  { id: "todos", label: "Todos con saldo" },
                  { id: "sin_contactar", label: "Sin contactar" },
                ],
                seleccion: [soloSinContactar ? "sin_contactar" : "todos"],
                onChange: (ids) =>
                  setSoloSinContactar(ids[0] === "sin_contactar"),
              },
            ]}
          />
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="rounded-[1.25rem] bg-white py-16 text-center">
          <p className="text-[15px] font-semibold text-slate-900">
            {filas.length === 0 ? "Nada por cobrar en este periodo" : "Sin resultados"}
          </p>
          <p className="mt-1 text-[13px] text-slate-400">
            {filas.length === 0
              ? "Cuando un cliente deba, aparece aquí para cobrarlo a mano."
              : "Prueba otro recuadro o quita el filtro."}
          </p>
        </div>
      ) : (
        <div className="rounded-[1.25rem] bg-white overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  <th className="pl-5 pr-2 py-2 w-10">
                    <input
                      type="checkbox"
                      aria-label="Seleccionar todos"
                      className="h-4 w-4 rounded border-slate-300 accent-violet-600"
                      checked={todosVisiblesMarcados}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeleccionados(new Set(visibles.map((f) => f.cliente.id)));
                        } else setSeleccionados(new Set());
                      }}
                    />
                  </th>
                  <th className="py-2 pr-3">
                    <EncabezadoOrdenable
                      label="Cliente"
                      activo={sortKey === "cliente"}
                      dir={sortDir}
                      onClick={() => toggleSort("cliente")}
                    />
                  </th>
                  <th className="py-2 pr-3 text-right">
                    <EncabezadoOrdenable
                      label="Importe"
                      activo={sortKey === "importe"}
                      dir={sortDir}
                      onClick={() => toggleSort("importe")}
                      align="right"
                    />
                  </th>
                  <th className="py-2 pr-3">
                    <EncabezadoOrdenable
                      label="Fecha"
                      activo={sortKey === "fecha"}
                      dir={sortDir}
                      onClick={() => toggleSort("fecha")}
                    />
                  </th>
                  <th className="py-2 pr-3">
                    <EncabezadoOrdenable
                      label="Estatus"
                      activo={sortKey === "estatus"}
                      dir={sortDir}
                      onClick={() => toggleSort("estatus")}
                    />
                  </th>
                  <th className="py-2 pr-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibles.map((f) => {
                  const tipo = tipoDe(f);
                  return (
                    <tr key={f.cliente.id} className="hover:bg-slate-50/80">
                      <td className="pl-5 pr-2 py-2">
                        <input
                          type="checkbox"
                          aria-label={f.cliente.razonSocial}
                          className="h-4 w-4 rounded border-slate-300 accent-violet-600"
                          checked={seleccionados.has(f.cliente.id)}
                          onChange={() => {
                            setSeleccionados((prev) => {
                              const next = new Set(prev);
                              if (next.has(f.cliente.id)) next.delete(f.cliente.id);
                              else next.add(f.cliente.id);
                              return next;
                            });
                          }}
                        />
                      </td>
                      <td className="py-2 pr-3 min-w-0">
                        <p
                          className="font-semibold text-[15px] text-slate-900 truncate"
                          title={
                            f.correo.habilitado
                              ? `Sugerido: ${f.correo.labelCorto}`
                              : f.correo.motivo
                          }
                        >
                          {f.cliente.razonSocial}
                        </p>
                      </td>
                      <td className="py-2 pr-3 text-right font-bold tabular-nums text-slate-900 whitespace-nowrap">
                        {fmt(f.monto)}
                      </td>
                      <td className="py-2 pr-3 text-[13px] text-slate-500 tabular-nums whitespace-nowrap">
                        {f.fechaLabel}
                      </td>
                      <td className="py-2 pr-3">
                        <BadgeSemaforo semaforo={f.semaforo} />
                      </td>
                      <td className="py-2 pr-5">
                        <div className="flex items-center justify-end gap-1">
                          {f.ultima ? (
                            <button
                              type="button"
                              onClick={() => desmarcar(f.cliente)}
                              className="h-8 px-2.5 rounded-full bg-slate-100 text-[12px] font-semibold text-slate-600 hover:bg-slate-200"
                            >
                              Desmarcar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => marcarManual(f.cliente, tipo)}
                              className="h-8 px-2.5 rounded-full bg-emerald-50 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              Marcar
                            </button>
                          )}
                          <BotonCorreoCliente
                            cliente={f.cliente}
                            periodo={periodo}
                            tipo={tipo}
                            habilitado={f.correo.habilitado}
                            motivo={
                              f.correo.habilitado ? undefined : f.correo.motivo
                            }
                            titulo={
                              f.correo.habilitado ? f.correo.titulo : undefined
                            }
                            descripcion={
                              f.correo.habilitado
                                ? f.correo.descripcion
                                : undefined
                            }
                            notify={notify}
                            enviadoEn={f.enviadoEn}
                            ultima={f.ultima}
                            pagado={f.semaforo === "al_corriente"}
                            conEtiqueta
                            onContactado={
                              f.correo.habilitado
                                ? (via, tipoMail) =>
                                    onContactado(
                                      f.cliente,
                                      tipoMail ?? tipo
                                    )(via)
                                : undefined
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="lg:hidden divide-y divide-slate-100">
            {visibles.map((f) => {
              const tipo = tipoDe(f);
              return (
                <li key={f.cliente.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-slate-900 truncate">
                        {f.cliente.razonSocial}
                      </p>
                      <p className="mt-0.5 text-[12px] text-slate-400">
                        {f.fechaLabel}
                      </p>
                    </div>
                    <p className="text-[17px] font-bold tabular-nums text-slate-900 shrink-0">
                      {fmt(f.monto)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <BadgeSemaforo semaforo={f.semaforo} />
                    <div className="flex items-center gap-1">
                      {f.ultima ? (
                        <button
                          type="button"
                          onClick={() => desmarcar(f.cliente)}
                          className="h-8 px-2.5 rounded-full bg-slate-100 text-[12px] font-semibold text-slate-600"
                        >
                          Desmarcar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => marcarManual(f.cliente, tipo)}
                          className="h-8 px-2.5 rounded-full bg-emerald-50 text-[12px] font-semibold text-emerald-700"
                        >
                          Marcar
                        </button>
                      )}
                      <BotonCorreoCliente
                        cliente={f.cliente}
                        periodo={periodo}
                        tipo={tipo}
                        habilitado={f.correo.habilitado}
                        motivo={
                          f.correo.habilitado ? undefined : f.correo.motivo
                        }
                        titulo={
                          f.correo.habilitado ? f.correo.titulo : undefined
                        }
                        descripcion={
                          f.correo.habilitado ? f.correo.descripcion : undefined
                        }
                        notify={notify}
                        enviadoEn={f.enviadoEn}
                        ultima={f.ultima}
                        pagado={f.semaforo === "al_corriente"}
                        conEtiqueta
                        onContactado={
                          f.correo.habilitado
                            ? (via, tipoMail) =>
                                onContactado(f.cliente, tipoMail ?? tipo)(via)
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
        </div>
        <div className="lg:col-span-2 min-w-0">
          <CobranzaPorCliente filas={filas} />
        </div>
      </div>
    </>
  );
}

function BadgeSemaforo({ semaforo }: { semaforo: SemaforoCobro }) {
  return (
    <span
      className={`inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold ${SEMAFORO_CLASE[semaforo]}`}
    >
      {SEMAFORO_LABEL[semaforo]}
    </span>
  );
}
