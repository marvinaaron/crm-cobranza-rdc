"use client";

import { useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import { esIngresoGeneralCliente } from "@/lib/clientes";
import {
  type Presupuesto,
  type ConceptoPresupuesto,
  type EstadoPresupuesto,
  type RegimenClave,
  catalogoEfectivo,
  calcularTotales,
  siguienteFolio,
  nuevoIdConcepto,
  fmtMoneda,
  REGIMENES_PRESUPUESTO,
  precioDeRegimen,
  nombreRegimen,
  IVA_TASA_DEFAULT,
  VIGENCIA_DIAS_DEFAULT,
} from "@/lib/presupuestos";
import { useScrollLock } from "@/hooks/useScrollLock";
import PresupuestoDocumento, {
  imprimirPresupuesto,
} from "./PresupuestoDocumento";

type ModoCliente = "existente" | "nuevo";

type Draft = {
  modoCliente: ModoCliente;
  clienteId?: number;
  razonSocial: string;
  rfc: string;
  email: string;
  telefono: string;
  giro: string;
  conceptos: ConceptoPresupuesto[];
  notas: string;
  fecha: string;
  vigenciaDias: number;
  ivaTasa: number;
  descuentoPct: number;
  descuentoMotivo: string;
};

function hoyISOInput(): string {
  return new Date().toISOString().slice(0, 10);
}

function draftDesde(p: Presupuesto | null): Draft {
  if (!p) {
    return {
      modoCliente: "nuevo",
      razonSocial: "",
      rfc: "",
      email: "",
      telefono: "",
      giro: "",
      conceptos: [],
      notas: "",
      fecha: hoyISOInput(),
      vigenciaDias: VIGENCIA_DIAS_DEFAULT,
      ivaTasa: IVA_TASA_DEFAULT,
      descuentoPct: 0,
      descuentoMotivo: "",
    };
  }
  return {
    modoCliente: p.cliente.clienteId ? "existente" : "nuevo",
    clienteId: p.cliente.clienteId,
    razonSocial: p.cliente.razonSocial,
    rfc: p.cliente.rfc ?? "",
    email: p.cliente.email ?? "",
    telefono: p.cliente.telefono ?? "",
    giro: p.cliente.giro ?? "",
    conceptos: p.conceptos.map((c) => ({ ...c })),
    notas: p.notas ?? "",
    fecha: p.fecha.slice(0, 10),
    vigenciaDias: p.vigenciaDias,
    ivaTasa: p.ivaTasa,
    descuentoPct: p.descuentoPct ?? 0,
    descuentoMotivo: p.descuentoMotivo ?? "",
  };
}

const PASOS = ["Cliente", "Conceptos", "Vista previa"] as const;

export default function PresupuestoWizard({
  abierto,
  onClose,
  presupuestoExistente,
  onSaved,
}: {
  abierto: boolean;
  onClose: () => void;
  presupuestoExistente?: Presupuesto | null;
  onSaved?: (p: Presupuesto) => void;
}) {
  const {
    listaClientes,
    catalogoServicios,
    presupuestos,
    preciosRegimen,
    agregarPresupuesto,
    actualizarPresupuesto,
  } = useClientes();

  const [draft, setDraft] = useState<Draft>(() =>
    draftDesde(presupuestoExistente ?? null)
  );
  const [paso, setPaso] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [servicioSel, setServicioSel] = useState("");

  useScrollLock(abierto);

  const catalogo = useMemo(
    () => catalogoEfectivo(catalogoServicios).filter((s) => s.activo),
    [catalogoServicios]
  );

  const clientesElegibles = useMemo(
    () =>
      listaClientes
        .filter((c) => c.activo && !esIngresoGeneralCliente(c))
        .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial)),
    [listaClientes]
  );

  const folio = presupuestoExistente?.folio ?? siguienteFolio(presupuestos);
  const totales = calcularTotales(
    draft.conceptos,
    draft.ivaTasa,
    draft.descuentoPct
  );

  const previewPresupuesto: Presupuesto = useMemo(
    () => ({
      id: presupuestoExistente?.id ?? "preview",
      folio,
      fecha: new Date(draft.fecha + "T12:00:00").toISOString(),
      vigenciaDias: draft.vigenciaDias,
      cliente: {
        clienteId: draft.modoCliente === "existente" ? draft.clienteId : undefined,
        razonSocial: draft.razonSocial,
        rfc: draft.rfc || undefined,
        email: draft.email || undefined,
        telefono: draft.telefono || undefined,
        giro: draft.giro || undefined,
      },
      conceptos: draft.conceptos,
      ivaTasa: draft.ivaTasa,
      descuentoPct: draft.descuentoPct || undefined,
      descuentoMotivo: draft.descuentoMotivo || undefined,
      notas: draft.notas || undefined,
      estado: presupuestoExistente?.estado ?? "borrador",
      creadoEn: presupuestoExistente?.creadoEn ?? new Date().toISOString(),
    }),
    [draft, folio, presupuestoExistente]
  );

  if (!abierto) return null;

  const set = (cambios: Partial<Draft>) =>
    setDraft((d) => ({ ...d, ...cambios }));

  const elegirClienteExistente = (id: number) => {
    const c = listaClientes.find((cl) => cl.id === id);
    if (!c) return;
    set({
      clienteId: id,
      razonSocial: c.razonSocial,
      rfc: c.rfc ?? "",
      email: c.email ?? "",
    });
  };

  const agregarConceptoDeCatalogo = (idServicio: string) => {
    const s = catalogo.find((x) => x.id === idServicio);
    if (!s) return;
    set({
      conceptos: [
        ...draft.conceptos,
        {
          id: nuevoIdConcepto(),
          servicio: s.servicio,
          descripcion: s.descripcion,
          precio: s.precioSugerido,
        },
      ],
    });
    setServicioSel("");
  };

  const agregarHonorarioRegimen = (clave: RegimenClave) => {
    const precio = precioDeRegimen(preciosRegimen, clave);
    set({
      conceptos: [
        ...draft.conceptos,
        {
          id: nuevoIdConcepto(),
          servicio: `Honorarios — ${nombreRegimen(clave)}`,
          descripcion:
            "Honorarios mensuales por la contabilidad y el cumplimiento fiscal de tu régimen.",
          precio,
        },
      ],
    });
  };

  const agregarConceptoLibre = () => {
    set({
      conceptos: [
        ...draft.conceptos,
        { id: nuevoIdConcepto(), servicio: "", descripcion: "", precio: 0 },
      ],
    });
  };

  const editarConcepto = (
    id: string,
    cambios: Partial<ConceptoPresupuesto>
  ) => {
    set({
      conceptos: draft.conceptos.map((c) =>
        c.id === id ? { ...c, ...cambios } : c
      ),
    });
  };

  const quitarConcepto = (id: string) => {
    set({ conceptos: draft.conceptos.filter((c) => c.id !== id) });
  };

  const validarPaso0 = (): boolean => {
    if (!draft.razonSocial.trim()) {
      setErrorMsg("Escribe el nombre o razón social del cliente.");
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const validarPaso1 = (): boolean => {
    if (draft.conceptos.length === 0) {
      setErrorMsg("Agrega al menos un servicio.");
      return false;
    }
    if (draft.conceptos.some((c) => !c.servicio.trim())) {
      setErrorMsg("Cada concepto necesita un nombre de servicio.");
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const avanzar = () => {
    if (paso === 0 && !validarPaso0()) return;
    if (paso === 1 && !validarPaso1()) return;
    setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  };

  const guardar = (estado: EstadoPresupuesto) => {
    if (!validarPaso0() || !validarPaso1()) {
      setPaso(draft.conceptos.length === 0 ? 1 : 0);
      return;
    }
    const payload = {
      fecha: new Date(draft.fecha + "T12:00:00").toISOString(),
      vigenciaDias: draft.vigenciaDias,
      cliente: {
        clienteId:
          draft.modoCliente === "existente" ? draft.clienteId : undefined,
        razonSocial: draft.razonSocial.trim(),
        rfc: draft.rfc.trim() || undefined,
        email: draft.email.trim() || undefined,
        telefono: draft.telefono.trim() || undefined,
        giro: draft.giro.trim() || undefined,
      },
      conceptos: draft.conceptos.map((c) => ({
        ...c,
        servicio: c.servicio.trim(),
        descripcion: c.descripcion.trim(),
        precio: Number(c.precio) || 0,
      })),
      ivaTasa: draft.ivaTasa,
      descuentoPct: draft.descuentoPct > 0 ? draft.descuentoPct : undefined,
      descuentoMotivo:
        draft.descuentoPct > 0 ? draft.descuentoMotivo.trim() || undefined : undefined,
      notas: draft.notas.trim() || undefined,
      estado,
    };
    const guardado = presupuestoExistente
      ? actualizarPresupuesto(presupuestoExistente.id, payload)
      : agregarPresupuesto(payload);
    if (guardado) onSaved?.(guardado);
    onClose();
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-500/20 transition";
  const labelCls =
    "text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block";

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center p-0 sm:p-6 no-print">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-3xl bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] overflow-hidden border border-slate-100 dark:border-white/10">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">
                {presupuestoExistente ? "Editar presupuesto" : "Nuevo presupuesto"}
              </p>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                {folio}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-500 transition"
              aria-label="Cerrar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
          {/* Stepper */}
          <div className="flex items-center gap-2 mt-4">
            {PASOS.map((nombre, i) => (
              <div key={nombre} className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => i < paso && setPaso(i)}
                  className={`flex items-center gap-2 ${i <= paso ? "" : "opacity-50"}`}
                >
                  <span
                    className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-black ${
                      i < paso
                        ? "bg-emerald-500 text-white"
                        : i === paso
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 dark:bg-white/10 text-slate-400"
                    }`}
                  >
                    {i < paso ? "✓" : i + 1}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 hidden sm:inline">
                    {nombre}
                  </span>
                </button>
                {i < PASOS.length - 1 && (
                  <div className="flex-1 h-0.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 transition-all"
                      style={{ width: i < paso ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {paso === 0 && (
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit">
                {(["existente", "nuevo"] as ModoCliente[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => set({ modoCliente: m })}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition ${
                      draft.modoCliente === m
                        ? "bg-white dark:bg-slate-800 text-violet-600 shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    {m === "existente" ? "Cliente existente" : "Cliente nuevo"}
                  </button>
                ))}
              </div>

              {draft.modoCliente === "existente" ? (
                <div>
                  <label className={labelCls}>Selecciona un cliente</label>
                  <select
                    className={inputCls}
                    value={draft.clienteId ?? ""}
                    onChange={(e) =>
                      elegirClienteExistente(Number(e.target.value))
                    }
                  >
                    <option value="">— Elige un cliente —</option>
                    {clientesElegibles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razonSocial}
                      </option>
                    ))}
                  </select>
                  {draft.clienteId && (
                    <p className="text-[11px] text-emerald-600 mt-2">
                      Se autollenaron los datos de {draft.razonSocial}.
                    </p>
                  )}
                </div>
              ) : null}

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Nombre / Razón social *</label>
                  <input
                    className={inputCls}
                    value={draft.razonSocial}
                    onChange={(e) => set({ razonSocial: e.target.value })}
                    placeholder="Ej. Sociedades Culin"
                  />
                </div>
                <div>
                  <label className={labelCls}>Giro / Sector</label>
                  <input
                    className={inputCls}
                    value={draft.giro}
                    onChange={(e) => set({ giro: e.target.value })}
                    placeholder="Ej. Hoteles"
                  />
                </div>
                <div>
                  <label className={labelCls}>RFC</label>
                  <input
                    className={inputCls}
                    value={draft.rfc}
                    onChange={(e) => set({ rfc: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Correo</label>
                  <input
                    className={inputCls}
                    value={draft.email}
                    onChange={(e) => set({ email: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input
                    className={inputCls}
                    value={draft.telefono}
                    onChange={(e) => set({ telefono: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Fecha</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={draft.fecha}
                    onChange={(e) => set({ fecha: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Vigencia (días)</label>
                  <input
                    type="number"
                    min={1}
                    className={inputCls}
                    value={draft.vigenciaDias}
                    onChange={(e) =>
                      set({ vigenciaDias: Number(e.target.value) || VIGENCIA_DIAS_DEFAULT })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {paso === 1 && (
            <div className="space-y-4">
              {/* Honorario base por régimen (1 clic) */}
              <div>
                <label className={labelCls}>Honorario base por régimen</label>
                <div className="flex flex-wrap gap-2">
                  {REGIMENES_PRESUPUESTO.map((r) => {
                    const precio = precioDeRegimen(preciosRegimen, r.clave);
                    return (
                      <button
                        key={r.clave}
                        type="button"
                        onClick={() => agregarHonorarioRegimen(r.clave)}
                        className="px-3 py-2 rounded-xl border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-[11px] font-bold transition hover:bg-violet-100 active:scale-95 text-left"
                      >
                        {r.nombre}
                        <span className="block text-[10px] font-black tabular-nums">
                          {precio > 0 ? fmtMoneda(precio) : "Sin precio"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Configura estos precios en la pestaña “Catálogo de servicios”.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1 min-w-[200px]">
                  <label className={labelCls}>Agregar del catálogo</label>
                  <select
                    className={inputCls}
                    value={servicioSel}
                    onChange={(e) => {
                      setServicioSel(e.target.value);
                      if (e.target.value) agregarConceptoDeCatalogo(e.target.value);
                    }}
                  >
                    <option value="">— Elige un servicio —</option>
                    {catalogo.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.servicio}
                        {s.precioSugerido ? ` · ${fmtMoneda(s.precioSugerido)}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={agregarConceptoLibre}
                  className="px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/15 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:border-violet-400 hover:text-violet-600 transition"
                >
                  + Concepto libre
                </button>
              </div>

              {draft.conceptos.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  Agrega servicios desde el catálogo o uno libre.
                </div>
              ) : (
                <div className="space-y-3">
                  {draft.conceptos.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-slate-100 dark:border-white/10 p-3.5 bg-slate-50/60 dark:bg-white/5"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <input
                            className={inputCls}
                            value={c.servicio}
                            onChange={(e) =>
                              editarConcepto(c.id, { servicio: e.target.value })
                            }
                            placeholder="Servicio"
                          />
                          <textarea
                            className={`${inputCls} resize-none`}
                            rows={2}
                            value={c.descripcion}
                            onChange={(e) =>
                              editarConcepto(c.id, { descripcion: e.target.value })
                            }
                            placeholder="Descripción"
                          />
                        </div>
                        <div className="w-28 shrink-0">
                          <label className={labelCls}>Precio mensual</label>
                          <input
                            type="number"
                            min={0}
                            className={inputCls}
                            value={c.precio}
                            onChange={(e) =>
                              editarConcepto(c.id, {
                                precio: Number(e.target.value) || 0,
                              })
                            }
                          />
                          <button
                            type="button"
                            onClick={() => quitarConcepto(c.id)}
                            className="mt-2 w-full text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Descuento */}
              <div className="rounded-2xl border border-slate-100 dark:border-white/10 p-3.5 bg-slate-50/60 dark:bg-white/5">
                <div className="flex items-end gap-3">
                  <div className="w-28 shrink-0">
                    <label className={labelCls}>Descuento %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={inputCls}
                      value={draft.descuentoPct || ""}
                      onChange={(e) =>
                        set({
                          descuentoPct: Math.min(
                            Math.max(Number(e.target.value) || 0, 0),
                            100
                          ),
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className={labelCls}>Motivo del descuento</label>
                    <input
                      className={inputCls}
                      value={draft.descuentoMotivo}
                      onChange={(e) => set({ descuentoMotivo: e.target.value })}
                      placeholder="Ej. Bienvenida 2 clientes nuevos"
                      disabled={draft.descuentoPct <= 0}
                    />
                  </div>
                </div>
                {draft.descuentoPct > 0 && (
                  <p className="text-[11px] text-emerald-600 mt-2">
                    Se descontarán {fmtMoneda(totales.descuento)} del subtotal y
                    el IVA se recalcula sobre el monto ya descontado.
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Notas (opcional)</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  value={draft.notas}
                  onChange={(e) => set({ notas: e.target.value })}
                  placeholder="Ej. Contabilidad 2024: $290 x 12 meses."
                />
              </div>

              {/* Totales en vivo */}
              <div className="flex justify-end">
                <div className="w-full sm:max-w-[260px] space-y-1 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{fmtMoneda(totales.subtotal)}</span>
                  </div>
                  {draft.descuentoPct > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Descuento {draft.descuentoPct}%</span>
                      <span className="tabular-nums">
                        −{fmtMoneda(totales.descuento)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>IVA {Math.round(draft.ivaTasa * 100)}%</span>
                    <span className="tabular-nums">{fmtMoneda(totales.iva)}</span>
                  </div>
                  <div className="flex justify-between font-black text-violet-700 dark:text-violet-300 text-base">
                    <span>Total mensual</span>
                    <span className="tabular-nums">{fmtMoneda(totales.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {paso === 2 && (
            <div className="bg-slate-100 dark:bg-black/30 -mx-6 -my-5 px-4 py-6 sm:px-6">
              <PresupuestoDocumento presupuesto={previewPresupuesto} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
          {errorMsg ? (
            <p className="text-[12px] text-rose-500 font-medium">{errorMsg}</p>
          ) : (
            <button
              type="button"
              onClick={() => (paso === 0 ? onClose() : setPaso((p) => p - 1))}
              className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition"
            >
              {paso === 0 ? "Cancelar" : "← Atrás"}
            </button>
          )}

          <div className="flex items-center gap-2">
            {paso < 2 ? (
              <button
                type="button"
                onClick={avanzar}
                className="px-6 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-black uppercase tracking-widest transition active:scale-95"
              >
                Continuar →
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={imprimirPresupuesto}
                  className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-200 text-[11px] font-bold uppercase tracking-widest hover:border-violet-300 transition"
                >
                  Descargar PDF
                </button>
                <button
                  type="button"
                  onClick={() => guardar("borrador")}
                  className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-200 text-[11px] font-bold uppercase tracking-widest hover:border-violet-300 transition"
                >
                  Guardar borrador
                </button>
                <button
                  type="button"
                  onClick={() => guardar("enviado")}
                  className="px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-black uppercase tracking-widest transition active:scale-95"
                >
                  Guardar y marcar enviado
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
