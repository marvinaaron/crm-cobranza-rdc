"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MESES_NOM,
  type Cliente,
  type Periodo,
  CONCEPTOS_SERVICIO_ADICIONAL,
  esIngresoGeneralCliente,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { useNotify, useConfirm } from "@/components/ConfirmProvider";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
}

/**
 * Un movimiento del libro de ingresos diversos del año. Puede venir de la
 * bolsa general (sin cliente) o ser un servicio adicional cargado a un
 * cliente real (que también vive en la cuenta de ese cliente).
 */
type Movimiento = {
  pagoId: string | null;
  origen: "general" | "cliente";
  clienteId: number;
  clienteNombre: string;
  mes: number;
  concepto: string;
  nota?: string;
  monto: number;
};

/**
 * Centro de Ingresos Diversos.
 *
 * Reemplaza el split-view normal cuando se abre la bolsa "Ingresos diversos".
 * Es el lugar único para registrar TODO ingreso suelto del despacho:
 *  - General (sin cliente fijo): se guarda en la propia bolsa.
 *  - A un cliente: se guarda como "servicio adicional" del cliente (aparece
 *    en su panel) y además se lista aquí.
 *
 * El formulario se queda abierto al registrar para capturar varios
 * movimientos seguidos.
 */
export default function CentroIngresosDiversos({
  cliente,
  periodoVisible,
}: {
  cliente: Cliente;
  periodoVisible: Periodo;
}) {
  const {
    listaClientes,
    aniosDisponibles,
    registrarIngresoDiverso,
    eliminarIngresoDiverso,
    registrarServicioAdicional,
    eliminarServicioAdicional,
  } = useClientes();
  const notify = useNotify();
  const confirm = useConfirm();

  const anioStr = String(periodoVisible.anio);

  const [destino, setDestino] = useState<"general" | "cliente">("general");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [concepto, setConcepto] = useState<string>(
    CONCEPTOS_SERVICIO_ADICIONAL[0]
  );
  const [conceptoLibre, setConceptoLibre] = useState("");
  const [mes, setMes] = useState(periodoVisible.mes);
  const [anioForm, setAnioForm] = useState(periodoVisible.anio);
  const [monto, setMonto] = useState("");
  const [nota, setNota] = useState("");
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  // Al cambiar el periodo visible (desde el sidebar) sincronizamos el form,
  // pero NO lo reseteamos al registrar (registrar actualiza `cliente`, no el
  // periodo), para poder cargar varios movimientos seguidos.
  useEffect(() => {
    setMes(periodoVisible.mes);
    setAnioForm(periodoVisible.anio);
  }, [periodoVisible]);

  const clientesOpciones = useMemo(
    () =>
      listaClientes
        .filter((c) => c.activo && !esIngresoGeneralCliente(c))
        .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial)),
    [listaClientes]
  );

  const movimientos = useMemo<Movimiento[]>(() => {
    const out: Movimiento[] = [];
    cliente.pagosRealizados
      .filter((p) => p.anio === anioStr)
      .forEach((p) =>
        out.push({
          pagoId: p.id ?? null,
          origen: "general",
          clienteId: cliente.id,
          clienteNombre: "General · sin cliente",
          mes: p.mes,
          concepto: p.concepto ?? "Ingreso diverso",
          nota: p.nota,
          monto: p.monto,
        })
      );
    listaClientes.forEach((c) => {
      if (esIngresoGeneralCliente(c)) return;
      c.pagosRealizados
        .filter((p) => p.tipo === "adicional" && p.anio === anioStr)
        .forEach((p) =>
          out.push({
            pagoId: p.id ?? null,
            origen: "cliente",
            clienteId: c.id,
            clienteNombre: c.razonSocial,
            mes: p.mes,
            concepto: p.concepto ?? "Servicio adicional",
            nota: p.nota,
            monto: p.monto,
          })
        );
    });
    return out.sort((a, b) => b.mes - a.mes);
  }, [cliente, listaClientes, anioStr]);

  const total = movimientos.reduce((a, m) => a + m.monto, 0);
  const totalGeneral = movimientos
    .filter((m) => m.origen === "general")
    .reduce((a, m) => a + m.monto, 0);
  const totalClientes = total - totalGeneral;

  const handleRegistrar = async () => {
    const montoNum = Number(monto);
    const conceptoFinal = concepto === "Otro" ? conceptoLibre.trim() : concepto;
    if (!montoNum || montoNum <= 0) {
      await notify({
        titulo: "Monto inválido",
        mensaje: "Captura un monto válido para el ingreso.",
        tono: "warning",
      });
      return;
    }
    if (!conceptoFinal) {
      await notify({
        titulo: "Falta el concepto",
        mensaje: "Describe el ingreso que vas a registrar.",
        tono: "warning",
      });
      return;
    }
    if (destino === "cliente" && clienteId === "") {
      await notify({
        titulo: "Falta el cliente",
        mensaje: "Elige a qué cliente se le carga este ingreso.",
        tono: "warning",
      });
      return;
    }

    const periodo: Periodo = { mes, anio: anioForm };
    if (destino === "cliente") {
      registrarServicioAdicional(
        Number(clienteId),
        periodo,
        montoNum,
        conceptoFinal,
        nota.trim() || undefined
      );
    } else {
      registrarIngresoDiverso(
        periodo,
        montoNum,
        conceptoFinal,
        nota.trim() || undefined
      );
    }

    const destLabel =
      destino === "cliente"
        ? clientesOpciones.find((c) => c.id === Number(clienteId))
            ?.razonSocial ?? "Cliente"
        : "General";
    setConfirmMsg(
      `✓ ${fmt(montoNum)} · ${conceptoFinal} · ${destLabel} · ${MESES_NOM[mes]} ${anioForm}`
    );
    setMonto("");
    setNota("");
  };

  const handleEliminar = async (m: Movimiento) => {
    if (!m.pagoId) {
      await notify({
        titulo: "No se puede eliminar",
        mensaje:
          "Este movimiento es antiguo y no tiene identificador individual.",
        tono: "warning",
      });
      return;
    }
    const ok = await confirm({
      titulo: "Eliminar movimiento",
      mensaje: `¿Eliminar "${m.concepto}" (${fmt(m.monto)})? Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    if (m.origen === "cliente") eliminarServicioAdicional(m.clienteId, m.pagoId);
    else eliminarIngresoDiverso(m.pagoId);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
      {/* LIBRO DE MOVIMIENTOS */}
      <section className="order-2 lg:order-1 lg:flex-1 lg:basis-1/2 lg:min-h-0 lg:overflow-y-auto p-4 sm:p-6 lg:p-7 bg-slate-50/40">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Movimientos · {periodoVisible.anio}
          </p>
          <p className="text-sm font-black text-violet-700 tabular-nums">
            {fmt(total)}
          </p>
        </div>

        {/* Desglose general vs clientes */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-2xl bg-white border border-slate-100 px-3 py-2.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              General
            </p>
            <p className="text-base font-black text-slate-800 tabular-nums">
              {fmt(totalGeneral)}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 px-3 py-2.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Cargado a clientes
            </p>
            <p className="text-base font-black text-violet-700 tabular-nums">
              {fmt(totalClientes)}
            </p>
          </div>
        </div>

        {movimientos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center">
            <p className="text-sm font-black text-slate-400">
              Sin ingresos diversos en {periodoVisible.anio}
            </p>
            <p className="text-[11px] font-medium text-slate-400 mt-1">
              Registra el primero con el formulario de la derecha.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {movimientos.map((m, i) => (
              <div
                key={m.pagoId ?? `${m.origen}-${m.clienteId}-${m.mes}-${i}`}
                className="flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-100"
              >
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-800 truncate">
                      {m.concepto}
                    </p>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        m.origen === "cliente"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {m.origen === "cliente" ? "Cliente" : "General"}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">
                    {MESES_NOM[m.mes]}
                    {m.origen === "cliente" ? ` · ${m.clienteNombre}` : ""}
                    {m.nota ? ` · ${m.nota}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-base font-black text-slate-800 tabular-nums">
                    {fmt(m.monto)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleEliminar(m)}
                    aria-label="Eliminar movimiento"
                    title="Eliminar"
                    className="grid place-items-center h-8 w-8 rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FORMULARIO DE REGISTRO */}
      <aside className="order-1 lg:order-2 lg:flex-1 lg:basis-1/2 lg:border-l border-slate-100 lg:min-h-0 lg:overflow-y-auto bg-white">
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <p className="text-[10px] font-black text-violet-700 uppercase tracking-widest">
              Registrar ingreso
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
              Dinero suelto sin cliente fijo, o un cargo extra a un cliente.
            </p>
          </div>

          {/* Destino */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setDestino("general")}
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                destino === "general"
                  ? "bg-white text-slate-700 shadow-sm"
                  : "text-slate-400"
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setDestino("cliente")}
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                destino === "cliente"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-400"
              }`}
            >
              A un cliente
            </button>
          </div>

          {destino === "cliente" && (
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Cliente
              </label>
              <select
                value={clienteId}
                onChange={(e) =>
                  setClienteId(e.target.value ? Number(e.target.value) : "")
                }
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-bold text-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option value="">Seleccionar…</option>
                {clientesOpciones.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razonSocial}
                  </option>
                ))}
              </select>
              <p className="text-[9px] font-bold text-violet-500/80 mt-1">
                Se carga como servicio adicional y aparece en el panel del
                cliente.
              </p>
            </div>
          )}

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Concepto
            </label>
            <select
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-bold text-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              {CONCEPTOS_SERVICIO_ADICIONAL.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {concepto === "Otro" && (
            <input
              type="text"
              value={conceptoLibre}
              onChange={(e) => setConceptoLibre(e.target.value)}
              placeholder="Describe el ingreso…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold text-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Mes
              </label>
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="mt-1 w-full px-2 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-bold text-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {MESES_NOM.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Año
              </label>
              <select
                value={anioForm}
                onChange={(e) => setAnioForm(Number(e.target.value))}
                className="mt-1 w-full px-2 py-2.5 rounded-xl border border-slate-200 bg-white outline-none text-sm font-bold text-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {aniosDisponibles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Monto
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0"
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-lg font-black tabular-nums text-slate-800 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Nota (opcional)
            </label>
            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej. Asesoría puntual, proyecto único…"
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {confirmMsg && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-[10px] font-black text-emerald-800">
                {confirmMsg}
              </p>
              <p className="text-[9px] text-emerald-700 font-medium mt-0.5">
                Cambia los datos y registra el siguiente.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleRegistrar}
            className="w-full py-3 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 shadow-md shadow-violet-600/25"
          >
            Registrar ingreso
          </button>
        </div>
      </aside>
    </div>
  );
}
