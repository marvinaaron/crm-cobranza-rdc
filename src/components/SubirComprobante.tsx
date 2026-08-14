"use client";

import { useMemo, useRef, useState } from "react";
import {
  type Periodo,
  periodoLabel,
  periodoKey,
  esMismoPeriodo,
  listarMesesCobrables,
  getCompromisoMes,
  getSaldoMes,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  MAX_COMPROBANTE_BYTES,
  comprobanteCubrePeriodo,
  formatFechaComprobante,
} from "@/lib/comprobantes";
import { abrirCorreoEvento } from "@/lib/correo-eventos";
import { isValidEmail } from "@/lib/email";
import { portalCard, portalCardTitle } from "@/components/portal/portal-ui";
import PortalConfirmacionExito from "@/components/portal/PortalConfirmacionExito";
import AnimacionCargaArchivo, {
  useFaseCargaArchivo,
} from "@/components/AnimacionCargaArchivo";

type Props = {
  clienteId: number;
  periodo: Periodo;
  /** Clases extra para el contenedor exterior (p. ej. `h-full flex flex-col`). */
  className?: string;
};

const TicketIcon = () => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
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

export default function SubirComprobante({ clienteId, periodo, className = "" }: Props) {
  const {
    subirComprobante,
    getComprobantesCliente,
    listaClientes,
    periodoHoy,
    eliminarComprobantePagoHonorarios,
  } = useClientes();
  const confirm = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const cliente = useMemo(
    () => listaClientes.find((c) => c.id === clienteId) ?? null,
    [listaClientes, clienteId]
  );

  const [subiendo, setSubiendo] = useState(false);
  const { fase, progreso, ocupado } = useFaseCargaArchivo(subiendo);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [correoEnviado, setCorreoEnviado] = useState(false);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [archivoElegido, setArchivoElegido] = useState<File | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [periodosSeleccionados, setPeriodosSeleccionados] = useState<Periodo[]>(
    [periodo]
  );

  const comprobantesCliente = getComprobantesCliente(clienteId);

  // Meses con saldo vivo hasta el periodo actual: lo que el cliente puede declarar pagar.
  const mesesSeleccionables = useMemo(() => {
    if (!cliente) return [];
    const limite =
      periodoKey(periodo) > periodoKey(periodoHoy) ? periodoHoy : periodo;
    return listarMesesCobrables(cliente, limite).filter(
      (m) => getSaldoMes(cliente, m.periodo) > 0
    );
  }, [cliente, periodo, periodoHoy]);

  const aceptarArchivo = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setOk(false);

    if (file.size > MAX_COMPROBANTE_BYTES) {
      setError("El archivo no debe superar 3 MB.");
      return;
    }
    const permitidos = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!permitidos.includes(file.type)) {
      setError("Use imagen (JPG, PNG) o PDF.");
      return;
    }

    setArchivoElegido(file);
    // Pre-seleccionamos el periodo actual si está disponible; si no, el primero pendiente.
    const tieneActual = mesesSeleccionables.some((m) =>
      esMismoPeriodo(m.periodo, periodo)
    );
    setPeriodosSeleccionados(
      tieneActual
        ? [periodo]
        : mesesSeleccionables[0]
          ? [mesesSeleccionables[0].periodo]
          : []
    );
    setMostrarSelector(true);
  };

  const onSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    aceptarArchivo(file);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (subiendo) return;
    setArrastrando(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (subiendo) return;
    setArrastrando(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setArrastrando(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(false);
    if (subiendo) return;
    aceptarArchivo(e.dataTransfer.files?.[0]);
  };

  const onEliminarComprobante = async (cmpId: string, nombre: string) => {
    const ok = await confirm({
      titulo: "Eliminar comprobante",
      mensaje: `Vas a eliminar "${nombre}". Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    eliminarComprobantePagoHonorarios(cmpId, {
      notificarCliente: false,
      revertirPagosVinculados: true,
    });
  };

  const togglePeriodo = (p: Periodo) => {
    setPeriodosSeleccionados((prev) => {
      const idx = prev.findIndex((q) => esMismoPeriodo(q, p));
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, p].sort((a, b) => periodoKey(a) - periodoKey(b));
    });
  };

  const cancelarSubida = () => {
    setArchivoElegido(null);
    setMostrarSelector(false);
    setPeriodosSeleccionados([periodo]);
  };

  const confirmarSubida = async () => {
    if (!archivoElegido || periodosSeleccionados.length === 0) return;
    setSubiendo(true);
    setError(null);
    try {
      const dataUrl = await readFileAsDataUrl(archivoElegido);
      subirComprobante(clienteId, periodosSeleccionados, {
        nombreArchivo: archivoElegido.name,
        tipoMime: archivoElegido.type,
        dataUrl,
      });
      const primerPeriodo = periodosSeleccionados[0];
      let enviado = false;
      if (cliente?.email && isValidEmail(cliente.email)) {
        enviado = abrirCorreoEvento(cliente, primerPeriodo, "comprobante_recibido");
      }
      setCorreoEnviado(enviado);
      setOk(true);
      setSubiendo(false);
      await new Promise((r) => setTimeout(r, 1050));
      cancelarSubida();
      setTimeout(() => {
        setOk(false);
        setCorreoEnviado(false);
      }, 5000);
    } catch {
      setError("No se pudo cargar el archivo. Intente de nuevo.");
      setSubiendo(false);
    }
  };

  return (
    <div className={`${portalCard} ${className}`}>
      <p className={`${portalCardTitle} mb-1`}>Comprobantes de pago</p>
      <p className="text-sm font-bold text-slate-600 mb-4">
        Puede subir uno o varios comprobantes y marcar a qué meses corresponde
        cada uno.
      </p>

      {comprobantesCliente.length > 0 && (
        <div className="space-y-2 mb-4">
          {comprobantesCliente.map((cmp) => {
            const cubreActual = comprobanteCubrePeriodo(cmp, periodo);
            const aceptado = cmp.estado === "aceptado";
            return (
              <div
                key={cmp.id}
                className={`relative rounded-2xl px-4 py-3 border ${
                  aceptado
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-indigo-50 border-indigo-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 pr-8">
                  <p
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      aceptado ? "text-emerald-700" : "text-indigo-700"
                    }`}
                  >
                    {aceptado ? "Pago confirmado" : "En validación"}
                  </p>
                  {cubreActual && (
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/60 text-slate-600">
                      Mes actual
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-700 truncate pr-8">
                  {cmp.nombreArchivo}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Enviado {formatFechaComprobante(cmp.subidoEn)}
                </p>
                {cmp.periodos.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cmp.periodos.map((p) => (
                      <span
                        key={`${cmp.id}-${p.anio}-${p.mes}`}
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          aceptado
                            ? "bg-white/70 text-emerald-700"
                            : "bg-white/70 text-indigo-700"
                        }`}
                      >
                        {periodoLabel(p)}
                      </span>
                    ))}
                  </div>
                )}
                {!aceptado && (
                  <button
                    type="button"
                    onClick={() => void onEliminarComprobante(cmp.id, cmp.nombreArchivo)}
                    title="Eliminar comprobante"
                    aria-label={`Eliminar comprobante ${cmp.nombreArchivo}`}
                    className="absolute top-2 right-2 p-1.5 rounded-full text-indigo-400 hover:text-red-600 hover:bg-white/70 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={onSeleccionarArchivo}
      />

      {mostrarSelector && archivoElegido ? (
        <div className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
          {ocupado ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <AnimacionCargaArchivo
                progreso={progreso}
                listo={fase === "listo"}
              />
              <p
                className={`text-[10px] font-black uppercase tracking-widest ${
                  fase === "listo" ? "text-emerald-700" : "text-indigo-700"
                }`}
              >
                {fase === "listo" ? "Listo" : "Cargando archivo…"}
              </p>
            </div>
          ) : null}
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-700 mb-1">
              Archivo seleccionado
            </p>
            <p className="text-xs font-bold text-slate-700 truncate">
              {archivoElegido.name}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">
              ¿A qué mes(es) corresponde este pago?
            </p>
            {mesesSeleccionables.length === 0 ? (
              <p className="text-[11px] font-bold text-slate-500">
                No tiene meses con saldo pendiente. Comuníquese con el despacho.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {mesesSeleccionables.map((m) => {
                  const seleccionado = periodosSeleccionados.some((q) =>
                    esMismoPeriodo(q, m.periodo)
                  );
                  return (
                    <button
                      key={`${m.periodo.anio}-${m.periodo.mes}`}
                      type="button"
                      onClick={() => togglePeriodo(m.periodo)}
                      className={`text-left px-3 py-2 rounded-xl border transition-all ${
                        seleccionado
                          ? "border-indigo-500 bg-white ring-2 ring-indigo-200"
                          : "border-slate-200 bg-white hover:border-indigo-300"
                      }`}
                    >
                      <p
                        className={`text-xs font-black uppercase tracking-tight ${
                          seleccionado ? "text-indigo-700" : "text-slate-700"
                        }`}
                      >
                        {m.label}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                        Saldo $
                        {getSaldoMes(cliente!, m.periodo).toLocaleString()} ·
                        Compromiso $
                        {getCompromisoMes(cliente!, m.periodo).toLocaleString()}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={cancelarSubida}
              className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarSubida}
              disabled={
                ocupado ||
                periodosSeleccionados.length === 0 ||
                mesesSeleccionables.length === 0
              }
              className="flex-1 py-2.5 rounded-xl bg-blue-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 disabled:opacity-60 transition-all"
            >
              {ocupado ? "Enviando…" : "Enviar comprobante"}
            </button>
          </div>

          <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
            El monto exacto lo confirma tu contador al recibir el comprobante.
          </p>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={subiendo ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onClick={() => !subiendo && inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`w-full rounded-2xl border-2 border-dashed cursor-pointer select-none transition-all ${
            subiendo
              ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
              : arrastrando
                ? "border-slate-700 bg-slate-100 scale-[1.01] shadow-inner"
                : "border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 hover:border-slate-400 hover:from-slate-100 hover:to-slate-200"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-1.5 py-5 px-4 text-center">
            <div
              className={`inline-flex rounded-xl p-2 ${
                arrastrando
                  ? "bg-blue-900 text-white"
                  : "bg-white text-blue-900 shadow-sm"
              }`}
            >
              {comprobantesCliente.length > 0 ? <PlusIcon /> : <TicketIcon />}
            </div>
            <p
              className={`text-[11px] font-black uppercase tracking-widest ${
                arrastrando ? "text-slate-800" : "text-slate-700"
              }`}
            >
              {arrastrando
                ? "Suelta aquí tu comprobante"
                : comprobantesCliente.length > 0
                  ? "Agregar otro comprobante"
                  : "Confirmar mi pago"}
            </p>
            <p className="text-[10px] font-bold text-slate-500">
              Arrastra el archivo o haz clic para elegirlo · PDF o imagen · máx. 3 MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-[11px] font-bold text-red-600">{error}</p>
      )}
      {ok && (
        <PortalConfirmacionExito
          className="mt-3"
          titulo="Comprobante recibido"
          detalle={
            correoEnviado
              ? "Tu contador lo revisará y te avisamos por notificación. También puedes enviar el correo de confirmación que se abrió."
              : "Tu contador lo revisará y te avisamos por notificación cuando quede validado."
          }
        />
      )}
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
