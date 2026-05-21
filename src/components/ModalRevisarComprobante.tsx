"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type Cliente,
  type Periodo,
  periodoLabel,
  esMismoPeriodo,
  listarMesesCobrables,
  periodoKey,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { useConfirm } from "@/components/ConfirmProvider";
import { formatFechaComprobante } from "@/lib/comprobantes";
import { abrirCorreoEvento } from "@/lib/correo-eventos";
import VisorPdfInline from "@/components/VisorPdfInline";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  onClose: () => void;
  /** Si el contenedor necesita reaccionar a un pago aplicado (refrescar). */
  onAplicado?: (cliente: Cliente) => void;
  /** Abre el modal para subir factura PDF (post-validación). */
  onAbrirSubirFactura?: () => void;
};

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

function formatCurrencyInput(value: string) {
  const numericValue = value.toString().replace(/\D/g, "");
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseMontoInput(value: string): number {
  return Number(value.replace(/,/g, "")) || 0;
}

type LineaPago = {
  /** id temporal para keys */
  uid: string;
  mes: number;
  anio: number;
  montoStr: string;
};

function uidLinea(): string {
  return `ln-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ModalRevisarComprobante({
  cliente,
  periodo,
  onClose,
  onAplicado,
  onAbrirSubirFactura,
}: Props) {
  const {
    getComprobantePeriodo,
    validarComprobantePago,
    revertirValidacionComprobante,
    eliminarComprobantePagoHonorarios,
    registrarPago,
    getFacturaPeriodo,
    periodoHoy,
    listaClientes,
  } = useClientes();
  const confirm = useConfirm();

  const clienteActual = listaClientes.find((c) => c.id === cliente.id) ?? cliente;
  const comprobante = getComprobantePeriodo(cliente.id, periodo);
  const factura = getFacturaPeriodo(cliente.id, periodo);

  const limite =
    periodoKey(periodo) > periodoKey(periodoHoy) ? periodoHoy : periodo;
  const mesesCobrables = useMemo(
    () => listarMesesCobrables(clienteActual, limite),
    [clienteActual, limite]
  );
  // Solo meses con saldo vivo (pendiente o parcial). Los pagados completos no se pueden seleccionar.
  const mesesAplicables = useMemo(
    () => mesesCobrables.filter((m) => m.saldo > 0),
    [mesesCobrables]
  );

  const infoMesComprobante = mesesAplicables.find((m) =>
    esMismoPeriodo(m.periodo, periodo)
  );
  const mesInicial =
    infoMesComprobante ??
    mesesAplicables[mesesAplicables.length - 1] ??
    null;

  // Pre-llenamos una fila por cada mes que el cliente DECLARÓ al subir el
  // comprobante (intersectado con los meses que aún tienen saldo vivo).
  // Si el cliente no declaró nada útil, caemos al mes del periodo principal.
  const periodosDeclarados = comprobante?.periodos ?? [];
  const periodosUtilesDeclarados = periodosDeclarados.filter((p) =>
    mesesAplicables.some((m) => esMismoPeriodo(m.periodo, p))
  );
  const [lineas, setLineas] = useState<LineaPago[]>(() => {
    if (mesesAplicables.length === 0) return [];
    if (periodosUtilesDeclarados.length > 0) {
      return periodosUtilesDeclarados.map((p) => ({
        uid: uidLinea(),
        mes: p.mes,
        anio: p.anio,
        montoStr: "",
      }));
    }
    if (!mesInicial) return [];
    return [
      {
        uid: uidLinea(),
        mes: mesInicial.periodo.mes,
        anio: mesInicial.periodo.anio,
        montoStr: "",
      },
    ];
  });
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!okMsg) return;
    const t = setTimeout(() => setOkMsg(null), 4000);
    return () => clearTimeout(t);
  }, [okMsg]);

  if (!comprobante) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
        <div className="relative bg-white w-full max-w-md rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden p-8 text-center">
          <p className="text-sm font-bold text-slate-500">
            No hay comprobante para este periodo.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 px-4 py-2 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const esImagen = comprobante.tipoMime?.startsWith("image/");
  const esPdf = comprobante.tipoMime === "application/pdf";
  const yaValidado = comprobante.estado === "aceptado";

  /** Texto multilinea con los pagos del cliente vinculados a este comprobante. */
  const pagosVinculadosResumen = (): string => {
    const ligados = clienteActual.pagosRealizados.filter(
      (p) => p.comprobanteId === comprobante.id
    );
    if (ligados.length === 0) return "";
    return ligados
      .map((p) => {
        const lbl = periodoLabel({ mes: p.mes, anio: Number(p.anio) });
        return `  · ${lbl}: $${p.monto.toLocaleString()}`;
      })
      .join("\n");
  };

  const totalDistribuido = lineas.reduce(
    (s, l) => s + parseMontoInput(l.montoStr),
    0
  );

  const actualizarLinea = (uid: string, patch: Partial<LineaPago>) => {
    setLineas((prev) => prev.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));
  };

  const agregarLinea = () => {
    // Solo se ofrecen meses con saldo vivo y que no estén ya en otra fila.
    const yaUsados = new Set(lineas.map((l) => `${l.anio}-${l.mes}`));
    const disponible = mesesAplicables.find(
      (m) => !yaUsados.has(`${m.periodo.anio}-${m.periodo.mes}`)
    );
    if (!disponible) return;
    setLineas((prev) => [
      ...prev,
      {
        uid: uidLinea(),
        mes: disponible.periodo.mes,
        anio: disponible.periodo.anio,
        montoStr: "",
      },
    ]);
  };

  // Para evitar que el selector quede en un mes ya pagado por otra fila, sólo
  // ofrecemos los meses aplicables + el que la fila tiene ahora seleccionado.
  const opcionesParaLinea = (linea: LineaPago) => {
    const claveActual = `${linea.anio}-${linea.mes}`;
    const yaUsados = new Set(
      lineas.filter((l) => l.uid !== linea.uid).map((l) => `${l.anio}-${l.mes}`)
    );
    return mesesAplicables.filter((m) => {
      const k = `${m.periodo.anio}-${m.periodo.mes}`;
      return k === claveActual || !yaUsados.has(k);
    });
  };

  const noHayMesesAplicables = mesesAplicables.length === 0;
  const todosLosMesesUsados =
    lineas.length >= mesesAplicables.length && mesesAplicables.length > 0;

  const eliminarLinea = (uid: string) => {
    setLineas((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.uid !== uid)));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const lineasValidas = lineas.filter((l) => parseMontoInput(l.montoStr) > 0);

    // Caso especial: no hay saldos pendientes, solo validamos el comprobante.
    if (noHayMesesAplicables) {
      validarComprobantePago(comprobante.id);
      setOkMsg(
        "Comprobante validado. Este cliente no tenía saldos pendientes por aplicar."
      );
      return;
    }

    if (lineasValidas.length === 0) {
      setError("Captura al menos un monto para aplicar.");
      return;
    }

    // Detectar pares mes+año duplicados → sumarlos sería ambiguo
    const claves = new Set<string>();
    for (const l of lineasValidas) {
      const k = `${l.anio}-${l.mes}`;
      if (claves.has(k)) {
        setError("Tienes dos filas para el mismo mes. Combínalas en una sola.");
        return;
      }
      claves.add(k);
    }

    let actualizado: Cliente | null = null;
    const distribucion = lineasValidas.map((l) => ({
      periodo: { mes: l.mes, anio: l.anio },
      monto: parseMontoInput(l.montoStr),
    }));
    for (const l of lineasValidas) {
      const monto = parseMontoInput(l.montoStr);
      const res = registrarPago(
        cliente.id,
        { mes: l.mes, anio: l.anio },
        monto,
        undefined,
        { omitirCorreo: true, comprobanteId: comprobante.id }
      );
      if (res) actualizado = res;
    }

    validarComprobantePago(comprobante.id);

    if (actualizado && onAplicado) onAplicado(actualizado);

    const totalAplicado = distribucion.reduce((s, d) => s + d.monto, 0);

    // Un solo correo con el monto exacto que el admin registró y el desglose por mes.
    if (actualizado) {
      const periodoCorreo = distribucion[0]?.periodo ?? periodo;
      setTimeout(
        () =>
          abrirCorreoEvento(actualizado!, periodoCorreo, "pago_confirmado", {
            montoPagado: totalAplicado,
            distribucion,
          }),
        300
      );
    }

    setOkMsg(
      `Comprobante validado y pago de $${totalAplicado.toLocaleString()} aplicado en ${distribucion.length} mes${distribucion.length === 1 ? "" : "es"}.`
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white w-full max-w-2xl max-h-[92vh] rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-start gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">
              Validar comprobante · {periodoLabel(periodo)}
            </p>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-snug truncate">
              {clienteActual.razonSocial}
            </h2>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              {clienteActual.rfc}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-red-500 shrink-0"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {/* Columna 1: comprobante */}
            <div className="space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                1. Comprobante recibido
              </p>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-bold text-slate-700 truncate">
                  {comprobante.nombreArchivo}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {formatFechaComprobante(comprobante.subidoEn)}
                </p>
                {comprobante.periodos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">
                      Cliente declara:
                    </span>
                    {comprobante.periodos.map((p) => (
                      <span
                        key={`${p.anio}-${p.mes}`}
                        className="text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full"
                      >
                        {periodoLabel(p)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  <a
                    href={comprobante.dataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-100"
                  >
                    Abrir
                  </a>
                  <a
                    href={comprobante.dataUrl}
                    download={comprobante.nombreArchivo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-slate-700"
                  >
                    <DownloadIcon />
                    Descargar
                  </a>
                </div>
              </div>

              {esImagen ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={comprobante.dataUrl}
                    alt={comprobante.nombreArchivo}
                    className="w-full max-h-[420px] object-contain bg-white"
                  />
                </div>
              ) : esPdf ? (
                <VisorPdfInline
                  dataUrl={comprobante.dataUrl}
                  titulo={comprobante.nombreArchivo}
                  altura="h-[380px]"
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
                  <p className="text-[11px] font-bold text-slate-500">
                    Vista previa no disponible. Use Abrir / Descargar.
                  </p>
                </div>
              )}
            </div>

            {/* Columna 2: aplicar pago */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  2. Aplicar pago
                </p>
                {!yaValidado && (
                  <button
                    type="button"
                    onClick={agregarLinea}
                    disabled={todosLosMesesUsados || noHayMesesAplicables}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100"
                    title={
                      todosLosMesesUsados
                        ? "Ya distribuiste el pago a todos los meses pendientes"
                        : "Dividir el pago entre varios meses"
                    }
                  >
                    <PlusIcon />
                    Otro mes
                  </button>
                )}
              </div>

              {yaValidado ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckIcon />
                    <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">
                      Comprobante validado
                    </p>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 leading-snug">
                    {factura
                      ? "La factura está cargada y disponible para el cliente."
                      : "Suba la factura PDF cuando esté lista para notificar al cliente."}
                  </p>
                </div>
              ) : noHayMesesAplicables ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckIcon />
                    <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">
                      Sin saldos pendientes
                    </p>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 leading-snug">
                    Este cliente no tiene meses por cobrar. Puede validar el
                    comprobante sin aplicar un pago, o eliminarlo si fue cargado
                    por error.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {lineas.map((linea) => {
                      const infoMes = mesesCobrables.find(
                        (m) => m.periodo.mes === linea.mes && m.periodo.anio === linea.anio
                      );
                      const opciones = opcionesParaLinea(linea);
                      return (
                        <div
                          key={linea.uid}
                          className="rounded-xl border border-slate-100 bg-white p-3 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <select
                              value={`${linea.anio}-${linea.mes}`}
                              onChange={(e) => {
                                const [a, m] = e.target.value.split("-").map(Number);
                                actualizarLinea(linea.uid, { mes: m, anio: a });
                              }}
                              className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-black text-slate-700 uppercase tracking-tight outline-none focus:ring-2 focus:ring-emerald-100"
                            >
                              {opciones.map((m) => (
                                <option
                                  key={`${m.periodo.anio}-${m.periodo.mes}`}
                                  value={`${m.periodo.anio}-${m.periodo.mes}`}
                                >
                                  {m.label}
                                  {m.parcial
                                    ? ` · saldo $${m.saldo.toLocaleString()}`
                                    : ` · $${m.compromiso.toLocaleString()}`}
                                </option>
                              ))}
                            </select>
                            {lineas.length > 1 && (
                              <button
                                type="button"
                                onClick={() => eliminarLinea(linea.uid)}
                                className="p-2 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500"
                                title="Quitar esta fila"
                              >
                                <TrashIcon />
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg font-black pointer-events-none">
                              $
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder={
                                infoMes
                                  ? `Captura el monto del comprobante (saldo ${infoMes.saldo.toLocaleString()})`
                                  : "Captura el monto del comprobante"
                              }
                              value={linea.montoStr}
                              onChange={(e) =>
                                actualizarLinea(linea.uid, {
                                  montoStr: formatCurrencyInput(e.target.value),
                                })
                              }
                              className="w-full bg-slate-50 rounded-lg pl-7 pr-3 py-2 font-black text-slate-700 text-lg outline-none focus:ring-2 focus:ring-emerald-100 placeholder:text-[10px] placeholder:font-bold placeholder:text-slate-400"
                            />
                          </div>
                          {infoMes && (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold text-slate-400">
                              <span>
                                Compromiso ${infoMes.compromiso.toLocaleString()}
                              </span>
                              {infoMes.pagado > 0 && (
                                <span className="text-emerald-600">
                                  Pagado ${infoMes.pagado.toLocaleString()}
                                </span>
                              )}
                              {infoMes.saldo > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    actualizarLinea(linea.uid, {
                                      montoStr: infoMes.saldo.toLocaleString(),
                                    })
                                  }
                                  className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                  title="Usar el saldo total del mes como monto"
                                >
                                  Usar saldo ${infoMes.saldo.toLocaleString()}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                      Total a aplicar
                    </p>
                    <p className="text-base font-black tabular-nums">
                      ${totalDistribuido.toLocaleString()}
                    </p>
                  </div>

                  {error && (
                    <p className="text-[11px] font-bold text-red-600">{error}</p>
                  )}
                </>
              )}

              {!yaValidado && okMsg && (
                <p className="text-[11px] font-bold text-emerald-700">{okMsg}</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-50 px-6 py-4 flex flex-col gap-2 bg-white sticky bottom-0">
            {!yaValidado ? (
              <button
                type="submit"
                disabled={!noHayMesesAplicables && totalDistribuido <= 0}
                className="w-full py-3 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-md shadow-emerald-100 flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
              >
                <CheckIcon />
                {noHayMesesAplicables
                  ? "Validar comprobante"
                  : "Validar y aplicar pago"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAbrirSubirFactura?.();
                }}
                className="w-full py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
              >
                {factura ? "Ver / actualizar factura" : "Subir factura PDF"}
              </button>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {yaValidado && (
                <button
                  type="button"
                  onClick={async () => {
                    const resumen = pagosVinculadosResumen();
                    const detalle = resumen
                      ? `\n\nSe quitarán también los pagos aplicados desde este comprobante:\n${resumen}`
                      : "";
                    const ok = await confirm({
                      titulo: "Quitar validación",
                      mensaje: `El comprobante volverá a quedar pendiente.${detalle}\n\nEl cliente NO recibe notificación.`,
                      textoConfirmar: "Quitar validación",
                      tono: "warning",
                    });
                    if (!ok) return;
                    revertirValidacionComprobante(comprobante.id);
                    setOkMsg(
                      "Validación retirada. El comprobante queda pendiente y los pagos vinculados fueron revertidos."
                    );
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-800 underline-offset-4 hover:underline"
                >
                  Quitar validación
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  const resumen = pagosVinculadosResumen();
                  const detalle = resumen
                    ? `\n\nSe revertirán también los pagos aplicados desde este comprobante:\n${resumen}`
                    : "";
                  const ok = await confirm({
                    titulo: "Eliminar comprobante",
                    mensaje: `El archivo se borrará y el cliente recibirá una notificación para que envíe uno nuevo.${detalle}`,
                    textoConfirmar: "Eliminar",
                    tono: "danger",
                  });
                  if (!ok) return;
                  eliminarComprobantePagoHonorarios(comprobante.id);
                  onClose();
                }}
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 underline-offset-4 hover:underline ml-auto"
              >
                Eliminar comprobante
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-slate-300 hover:text-slate-500 py-2 font-bold text-[10px] uppercase tracking-widest"
            >
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
