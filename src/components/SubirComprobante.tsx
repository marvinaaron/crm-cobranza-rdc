"use client";

import { useMemo, useRef, useState } from "react";
import {
  type Periodo,
  periodoLabel,
  periodoKey,
  esMismoPeriodo,
  listarMesesCobrables,
  getSaldoMes,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  comprobanteCubrePeriodo,
  formatFechaComprobante,
} from "@/lib/comprobantes";
import {
  ACCEPT_COMPROBANTE,
  prepararArchivoComprobante,
} from "@/lib/archivos";
import { abrirCorreoEvento } from "@/lib/correo-eventos";
import { isValidEmail } from "@/lib/email";
import { portalCard, portalCardTitle } from "@/components/portal/portal-ui";
import PortalConfirmacionExito from "@/components/portal/PortalConfirmacionExito";
import VisorArchivoModal, {
  MiniaturaArchivo,
} from "@/components/VisorArchivo";
import AnimacionCargaArchivo, {
  useFaseCargaArchivo,
} from "@/components/AnimacionCargaArchivo";

type Props = {
  clienteId: number;
  periodo: Periodo;
  className?: string;
  /** Pone el id #comprobante (usar una sola vez en la página). */
  esAncla?: boolean;
};

const CamaraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export default function SubirComprobante({
  clienteId,
  periodo,
  className = "",
  esAncla = false,
}: Props) {
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
  const [arrastrando, setArrastrando] = useState(false);
  const [mesesEnviados, setMesesEnviados] = useState<string | null>(null);
  const [visor, setVisor] = useState<{
    dataUrl: string;
    nombreArchivo: string;
    tipoMime?: string;
  } | null>(null);

  const comprobantesCliente = getComprobantesCliente(clienteId);

  const mesesPendientes = useMemo(() => {
    if (!cliente) return [] as Periodo[];
    const limite =
      periodoKey(periodo) > periodoKey(periodoHoy) ? periodoHoy : periodo;
    return listarMesesCobrables(cliente, limite)
      .filter((m) => getSaldoMes(cliente, m.periodo) > 0)
      .map((m) => m.periodo);
  }, [cliente, periodo, periodoHoy]);

  const periodosDestino = useMemo(() => {
    if (mesesPendientes.length === 0) return [periodo];
    const tieneActual = mesesPendientes.some((p) => esMismoPeriodo(p, periodo));
    if (!tieneActual) return mesesPendientes;
    return mesesPendientes;
  }, [mesesPendientes, periodo]);

  const etiquetaMeses = periodosDestino.map((p) => periodoLabel(p)).join(", ");

  const enviarArchivo = async (file: File | undefined) => {
    if (!file || ocupado) return;
    setError(null);
    setOk(false);
    setMesesEnviados(null);
    setSubiendo(true);
    try {
      const preparado = await prepararArchivoComprobante(file);
      if (!preparado.ok) {
        setError(preparado.error);
        setSubiendo(false);
        return;
      }
      const destinos = periodosDestino.length > 0 ? periodosDestino : [periodo];
      subirComprobante(clienteId, destinos, {
        nombreArchivo: preparado.nombreArchivo,
        tipoMime: preparado.tipoMime,
        dataUrl: preparado.dataUrl,
      });
      const primerPeriodo = destinos[0];
      let enviado = false;
      if (cliente?.email && isValidEmail(cliente.email)) {
        enviado = abrirCorreoEvento(cliente, primerPeriodo, "comprobante_recibido");
      }
      setCorreoEnviado(enviado);
      setMesesEnviados(destinos.map((p) => periodoLabel(p)).join(", "));
      setOk(true);
      setVisor({
        dataUrl: preparado.dataUrl,
        nombreArchivo: preparado.nombreArchivo,
        tipoMime: preparado.tipoMime,
      });
      setTimeout(() => {
        setOk(false);
        setCorreoEnviado(false);
        setMesesEnviados(null);
      }, 6000);
    } catch {
      setError("No se pudo cargar el archivo. Inténtalo de nuevo.");
    } finally {
      setSubiendo(false);
    }
  };

  const onSeleccionarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    void enviarArchivo(file);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (ocupado) return;
    setArrastrando(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (ocupado) return;
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
    if (ocupado) return;
    void enviarArchivo(e.dataTransfer.files?.[0]);
  };

  const onEliminarComprobante = async (cmpId: string, nombre: string) => {
    const okEliminar = await confirm({
      titulo: "Eliminar comprobante",
      mensaje: `Vas a eliminar "${nombre}". Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!okEliminar) return;
    eliminarComprobantePagoHonorarios(cmpId, {
      notificarCliente: false,
      revertirPagosVinculados: true,
    });
  };

  return (
    <div
      id={esAncla ? "comprobante" : undefined}
      className={`${portalCard} ${esAncla ? "scroll-mt-24" : ""} ${className}`}
    >
      <p className={`${portalCardTitle} mb-1`}>¿Ya pagaste?</p>
      <p className="text-sm font-bold text-slate-600 mb-4 leading-relaxed">
        Toma una foto del comprobante o elige el PDF. Se envía al instante
        {etiquetaMeses ? (
          <>
            {" "}
            para <span className="text-slate-800">{etiquetaMeses}</span>
          </>
        ) : null}
        . Tu contador lo valida.
      </p>

      {comprobantesCliente.length > 0 && (
        <div className="space-y-2 mb-4">
          {comprobantesCliente.map((cmp) => {
            const cubreActual = comprobanteCubrePeriodo(cmp, periodo);
            const aceptado = cmp.estado === "aceptado";
            return (
              <div
                key={cmp.id}
                className={`relative rounded-2xl px-3 py-3 border ${
                  aceptado
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-indigo-50 border-indigo-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setVisor({
                      dataUrl: cmp.dataUrl,
                      nombreArchivo: cmp.nombreArchivo,
                      tipoMime: cmp.tipoMime,
                    })
                  }
                  className="flex items-start gap-3 w-full text-left pr-8"
                >
                  <MiniaturaArchivo
                    dataUrl={cmp.dataUrl}
                    nombreArchivo={cmp.nombreArchivo}
                    tipoMime={cmp.tipoMime}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
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
                    <p className="text-xs font-bold text-slate-700 truncate">
                      {cmp.nombreArchivo}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Enviado {formatFechaComprobante(cmp.subidoEn)} · toca para ver
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
                  </div>
                </button>
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
        accept={ACCEPT_COMPROBANTE}
        className="hidden"
        onChange={onSeleccionarArchivo}
      />

      <div
        role="button"
        tabIndex={ocupado ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => !ocupado && inputRef.current?.click()}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`w-full rounded-[1.35rem] cursor-pointer select-none transition-all ${
          ocupado
            ? "bg-indigo-50 border border-indigo-100"
            : arrastrando
              ? "bg-slate-800 text-white scale-[1.01]"
              : "bg-[var(--portal-navy)] text-white shadow-md shadow-slate-900/15 hover:bg-[var(--portal-navy-hover)]"
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 text-center">
          {ocupado ? (
            <>
              <AnimacionCargaArchivo
                progreso={progreso}
                listo={fase === "listo"}
              />
              <p
                className={`text-[11px] font-black uppercase tracking-widest ${
                  fase === "listo" ? "text-emerald-700" : "text-indigo-700"
                }`}
              >
                {fase === "listo" ? "Listo" : "Enviando…"}
              </p>
            </>
          ) : (
            <>
              <span className={`inline-flex ${arrastrando ? "text-white" : "text-white/90"}`}>
                <CamaraIcon />
              </span>
              <p className="text-[12px] font-black uppercase tracking-widest">
                {arrastrando
                  ? "Suelta aquí tu comprobante"
                  : comprobantesCliente.length > 0
                    ? "Subir otra foto o PDF"
                    : "Tomar foto o elegir archivo"}
              </p>
              <p
                className={`text-[11px] font-bold ${
                  arrastrando ? "text-white/80" : "text-white/70"
                }`}
              >
                Foto, captura o PDF · se envía al instante
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-[11px] font-bold text-red-600">{error}</p>
      )}
      {ok && (
        <PortalConfirmacionExito
          className="mt-3"
          titulo="Comprobante recibido"
          detalle={
            correoEnviado
              ? `Quedó registrado${mesesEnviados ? ` para ${mesesEnviados}` : ""}. Tu contador lo revisa y te avisamos. También puedes enviar el correo que se abrió.`
              : `Quedó registrado${mesesEnviados ? ` para ${mesesEnviados}` : ""}. Tu contador lo revisa y te avisamos cuando quede validado.`
          }
        />
      )}
      {visor && (
        <VisorArchivoModal
          dataUrl={visor.dataUrl}
          nombreArchivo={visor.nombreArchivo}
          tipoMime={visor.tipoMime}
          titulo="Así quedó tu comprobante"
          onClose={() => setVisor(null)}
        />
      )}
    </div>
  );
}
