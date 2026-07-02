"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CAMPOS_EDITABLES_CONTRASENAS,
  mapaClientesPorRfc,
  resolverFilaContrasenas,
  type FilaContrasenas,
} from "@/lib/accesos/contrasenas";
import { useClientes } from "@/context/ClientesContext";

type Props = {
  fila: FilaContrasenas;
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (fila: FilaContrasenas) => Promise<void>;
};

export default function ModalEditarContrasenaAcceso({
  fila,
  abierto,
  onCerrar,
  onGuardar,
}: Props) {
  const { listaClientes } = useClientes();
  const [draft, setDraft] = useState<FilaContrasenas>(fila);
  const [homologar, setHomologar] = useState(fila.homologarConCrm !== false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    setDraft(fila);
    setHomologar(fila.homologarConCrm !== false);
    setError(null);
  }, [abierto, fila]);

  const porRfc = useMemo(() => mapaClientesPorRfc(listaClientes), [listaClientes]);
  const preview = useMemo(
    () =>
      resolverFilaContrasenas(
        { ...draft, homologarConCrm: homologar },
        porRfc
      ),
    [draft, homologar, porRfc]
  );

  const setCampo = useCallback(
    (key: keyof FilaContrasenas, valor: string) => {
      setDraft((prev) => ({ ...prev, [key]: valor }));
    },
    []
  );

  const guardar = useCallback(async () => {
    setGuardando(true);
    setError(null);
    try {
      const payload: FilaContrasenas = {
        ...draft,
        rfc: draft.rfc.trim().toUpperCase(),
        homologarConCrm: homologar,
      };
      if (homologar && preview.vinculadoCrm) {
        const match = porRfc.get(payload.rfc.trim().toUpperCase());
        if (match) {
          payload.cliente = match.razonSocial;
          payload.regimen = preview.regimenDisplay;
        }
      }
      await onGuardar(payload);
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }, [draft, homologar, onGuardar, onCerrar, porRfc, preview.regimenDisplay, preview.vinculadoCrm]);

  if (!abierto) return null;

  const identidad = CAMPOS_EDITABLES_CONTRASENAS.filter((c) => c.grupo === "identidad");
  const credenciales = CAMPOS_EDITABLES_CONTRASENAS.filter((c) => c.grupo === "credenciales");
  const bloqueadoPorCrm = homologar && preview.vinculadoCrm;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-labelledby="editar-contrasena-titulo"
    >
      <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-white">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-violet-600">
              Accesos · Contraseñas
            </p>
            <h2 id="editar-contrasena-titulo" className="text-lg font-black text-slate-800">
              Editar registro
            </h2>
            {preview.vinculadoCrm && homologar && (
              <p className="text-[11px] font-bold text-emerald-700 mt-1">
                Vinculado al catálogo · {preview.clienteDisplay}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-6">
          <label className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100 cursor-pointer">
            <input
              type="checkbox"
              checked={homologar}
              onChange={(e) => setHomologar(e.target.checked)}
              className="mt-0.5 rounded border-violet-300 text-violet-600 focus:ring-violet-200"
            />
            <span className="text-xs font-bold text-slate-700 leading-relaxed">
              Usar nombre y régimen del catálogo de clientes cuando el RFC coincida
            </span>
          </label>

          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Identidad
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {identidad.map((campo) => {
                const disabled =
                  bloqueadoPorCrm && (campo.key === "cliente" || campo.key === "regimen");
                const valor =
                  campo.key === "cliente"
                    ? bloqueadoPorCrm
                      ? preview.clienteDisplay
                      : draft.cliente
                    : campo.key === "regimen"
                      ? bloqueadoPorCrm
                        ? preview.regimenDisplay
                        : draft.regimen
                      : String(draft[campo.key] ?? "");

                return (
                  <label key={campo.key} className="block sm:col-span-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {campo.label}
                    </span>
                    <input
                      type="text"
                      value={valor}
                      disabled={disabled}
                      onChange={(e) => setCampo(campo.key, e.target.value)}
                      className={`mt-1 w-full h-10 px-3 rounded-xl border text-sm font-bold outline-none focus:ring-2 focus:ring-violet-100 ${
                        disabled
                          ? "border-emerald-100 bg-emerald-50/50 text-emerald-900 cursor-not-allowed"
                          : "border-slate-200 text-slate-800"
                      }`}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Credenciales
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {credenciales.map((campo) => (
                <label key={campo.key} className="block">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {campo.label}
                  </span>
                  <input
                    type="text"
                    value={String(draft[campo.key] ?? "")}
                    onChange={(e) => setCampo(campo.key, e.target.value)}
                    className="mt-1 w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-violet-100 font-mono"
                    autoComplete="off"
                  />
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 flex gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/90">
          <button
            type="button"
            onClick={onCerrar}
            className="flex-1 h-11 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={guardando}
            onClick={() => void guardar()}
            className="flex-1 h-11 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
