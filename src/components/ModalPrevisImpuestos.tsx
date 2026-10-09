"use client";

import { useEffect, useState } from "react";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes, type LineaPreviewInput } from "@/context/ClientesContext";
import { useConfirm, useNotify } from "@/components/ConfirmProvider";
import {
  formatMontoImpuesto,
  previewPublicado,
  clienteConfirmoPreview,
  asegurarBloques,
  getTotalImpuestos,
} from "@/lib/cumplimiento";
import { CONCEPTOS_FEDERALES } from "@/lib/cumplimiento-categorias";
import {
  abrirCorreoImpuestosCalculados,
  enviarCorreoImpuestosCalculadosResend,
} from "@/lib/correo-cumplimiento";
import { isValidEmail } from "@/lib/email";
import { categoriasHabilitadasCliente } from "@/lib/config-cumplimiento-cliente";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  onClose: () => void;
};

type ConceptoFederalInput = {
  etiqueta: string;
  monto: number;
};

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

function conceptoVacio(): ConceptoFederalInput {
  return { etiqueta: CONCEPTOS_FEDERALES[0], monto: 0 };
}

/** Etiqueta válida para el selector (incluye valores históricos fuera del catálogo). */
function opcionesEtiqueta(actual: string): string[] {
  const base = [...CONCEPTOS_FEDERALES];
  const limpio = actual.trim();
  if (limpio && !base.includes(limpio as (typeof CONCEPTOS_FEDERALES)[number])) {
    return [limpio, ...base];
  }
  return base;
}

export default function ModalPrevisImpuestos({ cliente, periodo, onClose }: Props) {
  const {
    getCumplimientoPeriodo,
    publicarPreviewImpuestos,
    marcarPreviewNotificado,
    eliminarPreviewImpuestos,
    guardarEnNubeAhora,
  } = useClientes();
  const confirm = useConfirm();
  const notify = useNotify();

  const registro = getCumplimientoPeriodo(cliente.id, periodo);
  const reg = registro ? asegurarBloques(registro) : null;

  const [conceptosFederales, setConceptosFederales] = useState<ConceptoFederalInput[]>([
    conceptoVacio(),
  ]);
  const [fechaFederales, setFechaFederales] = useState("");
  const [imssActivo, setImssActivo] = useState(false);
  const [imssMonto, setImssMonto] = useState("");
  const [imssFecha, setImssFecha] = useState("");
  const [estatalesActivo, setEstatalesActivo] = useState(false);
  const [estatalesMonto, setEstatalesMonto] = useState("");
  const [estatalesFecha, setEstatalesFecha] = useState("");
  const cats = categoriasHabilitadasCliente(cliente);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!reg) return;
    if (reg.federales.lineasCaptura.length) {
      const conceptos: ConceptoFederalInput[] = [];
      let fecha = "";
      for (const l of reg.federales.lineasCaptura) {
        if (!fecha && l.fechaLimite) fecha = l.fechaLimite;
        if (l.conceptos && l.conceptos.length > 0) {
          for (const c of l.conceptos) {
            conceptos.push({ etiqueta: c.etiqueta, monto: c.monto });
          }
        } else {
          conceptos.push({ etiqueta: l.etiqueta, monto: l.monto });
        }
      }
      setConceptosFederales(conceptos.length ? conceptos : [conceptoVacio()]);
      setFechaFederales(fecha);
    }
    setImssActivo(reg.imss.activo);
    setImssMonto(reg.imss.monto ? String(reg.imss.monto) : "");
    setImssFecha(reg.imss.fechaLimite ?? "");
    setEstatalesActivo(reg.estatales.activo);
    setEstatalesMonto(reg.estatales.monto ? String(reg.estatales.monto) : "");
    setEstatalesFecha(reg.estatales.fechaLimite ?? "");
  }, [registro?.id, registro?.previewPublicadoEn]);

  const parseMonto = (s: string): number | null => {
    const n = Number(String(s).replace(/,/g, "").trim());
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  };

  const totalFederales = conceptosFederales.reduce(
    (s, c) => s + (Number(c.monto) || 0),
    0
  );

  const guardar = async (modoNotificar: false | "resend" | "gmail") => {
    setError(null);
    setOk(false);
    setGuardando(true);
    const federales: LineaPreviewInput[] = [];
    try {
    if (cats.includes("federales")) {
      if (!fechaFederales.trim()) {
        setError("Indique la fecha límite de la línea de captura SAT.");
        return;
      }
      for (const c of conceptosFederales) {
        const monto = parseMonto(String(c.monto));
        if (monto === null) {
          setError("Revise los montos de impuestos federales.");
          return;
        }
        if (monto <= 0) {
          setError("Cada concepto federal debe tener un monto mayor a cero.");
          return;
        }
        federales.push({
          etiqueta: c.etiqueta.trim() || CONCEPTOS_FEDERALES[0],
          monto,
          fechaLimite: fechaFederales.trim(),
        });
      }
      if (!federales.length) {
        setError("Agregue al menos un concepto federal (ISR, IVA, etc.).");
        return;
      }
    }

    let imss = { activo: false, monto: 0, fechaLimite: "" };
    if (cats.includes("imss") && imssActivo) {
      const m = parseMonto(imssMonto);
      if (m === null || !imssFecha.trim()) {
        setError("Complete monto y fecha límite de IMSS.");
        return;
      }
      imss = { activo: true, monto: m, fechaLimite: imssFecha.trim() };
    }

    let estatales = { activo: false, monto: 0, fechaLimite: "" };
    if (cats.includes("estatales") && estatalesActivo) {
      const m = parseMonto(estatalesMonto);
      if (m === null || !estatalesFecha.trim()) {
        setError("Complete monto y fecha límite de impuestos estatales.");
        return;
      }
      estatales = { activo: true, monto: m, fechaLimite: estatalesFecha.trim() };
    }

    if (
      !federales.length &&
      !imss.activo &&
      !estatales.activo
    ) {
      setError("Active al menos una categoría con monto y fecha.");
      return;
    }

    const actualizado = publicarPreviewImpuestos(cliente.id, periodo, {
      federales,
      imss,
      estatales,
    });

    if (!previewPublicado(actualizado)) {
      setError(
        "No se pudo publicar el previo. Verifique montos mayores a cero y fechas límite."
      );
      return;
    }

    await guardarEnNubeAhora();

    let avisoCorreo: string | null = null;

    if (modoNotificar) {
      if (!cliente.email?.trim() || !isValidEmail(cliente.email)) {
        avisoCorreo = "Previo guardado, pero el cliente no tiene correo válido.";
      } else if (modoNotificar === "resend") {
        const res = await enviarCorreoImpuestosCalculadosResend(
          cliente,
          periodo,
          actualizado
        );
        if (res.ok) {
          marcarPreviewNotificado(cliente.id, periodo);
        } else {
          avisoCorreo = `Previo guardado, pero no se pudo enviar el correo: ${res.error ?? "error desconocido"}.`;
        }
      } else {
        const mailOk = await abrirCorreoImpuestosCalculados(
          cliente,
          periodo,
          actualizado
        );
        if (mailOk) {
          marcarPreviewNotificado(cliente.id, periodo);
        } else {
          avisoCorreo = "Previo guardado, pero no se pudo abrir Gmail.";
        }
      }
    }

    if (avisoCorreo) {
      setError(avisoCorreo);
    }

    setOk(true);
    void notify({
      titulo: avisoCorreo ? "Previo guardado" : "Previo publicado",
      mensaje: avisoCorreo
        ? avisoCorreo
        : `Impuestos de ${periodoLabel(periodo)} guardados para ${cliente.razonSocial}.`,
      tono: avisoCorreo ? "warning" : "info",
    });
    setTimeout(() => {
      setOk(false);
      onClose();
    }, avisoCorreo ? 3500 : 1500);
    } catch (e) {
      const detalle = e instanceof Error ? e.message : "";
      setError(
        detalle
          ? `No se pudo guardar en la nube: ${detalle}`
          : "No se pudo guardar el previo. Intente de nuevo."
      );
    } finally {
      setGuardando(false);
    }
  };

  const yaPublicado = previewPublicado(registro);
  const yaValidado = clienteConfirmoPreview(registro);
  const totalPreview =
    totalFederales +
    (imssActivo ? Number(imssMonto) || 0 : 0) +
    (estatalesActivo ? Number(estatalesMonto) || 0 : 0);

  const onEliminarPrevio = async () => {
    const ok = await confirm({
      titulo: "Eliminar previo",
      mensaje:
        "Se borrará toda la información del previo y los documentos asociados a este periodo. Esta acción no se puede deshacer.",
      textoConfirmar: "Eliminar previo",
      tono: "danger",
    });
    if (!ok) return;
    eliminarPreviewImpuestos(cliente.id, periodo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white w-full max-w-2xl rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-50 flex justify-between items-start gap-3 shrink-0">
          <div>
            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">
              Paso 1 · Previo por categoría
            </p>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {periodoLabel(periodo)}
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1">{cliente.razonSocial}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-300 hover:text-red-500">
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            En SAT agrega los conceptos a pagar (ISR, IVA…) con una sola fecha de
            vencimiento: todo suma a una línea de captura.
          </p>

          {yaValidado && (
            <p className="text-[11px] font-bold text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
              El cliente ya validó este previo. Si guardas cambios de montos, tendrá que
              validar de nuevo. Los PDFs y comprobantes se conservan.
            </p>
          )}

          {cats.includes("federales") && (
          <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-700">
                SAT · Impuestos federales
              </p>
              <p className="text-[10px] font-black text-blue-800 tabular-nums">
                Total {formatMontoImpuesto(totalFederales)}
              </p>
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-blue-600/80 mb-1.5">
                Fecha límite · línea de captura
              </label>
              <input
                type="date"
                value={fechaFederales}
                onChange={(e) => setFechaFederales(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-blue-100 text-xs font-bold bg-white"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-600/80">
                Conceptos a pagar
              </p>
              {conceptosFederales.map((c, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <select
                    value={c.etiqueta}
                    onChange={(e) => {
                      const next = [...conceptosFederales];
                      next[i] = { ...next[i], etiqueta: e.target.value };
                      setConceptosFederales(next);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-blue-100 text-xs font-bold bg-white"
                  >
                    {opcionesEtiqueta(c.etiqueta).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={0}
                    placeholder="Monto"
                    value={c.monto || ""}
                    onChange={(e) => {
                      const next = [...conceptosFederales];
                      next[i] = { ...next[i], monto: Number(e.target.value) };
                      setConceptosFederales(next);
                    }}
                    className="w-full sm:w-32 px-3 py-2 rounded-xl border border-blue-100 text-xs font-bold tabular-nums"
                  />
                  {conceptosFederales.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setConceptosFederales(
                          conceptosFederales.filter((_, j) => j !== i)
                        )
                      }
                      className="text-[9px] font-black uppercase text-red-500 shrink-0 px-1"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setConceptosFederales([...conceptosFederales, conceptoVacio()])
              }
              className="text-[9px] font-black uppercase tracking-widest text-blue-600"
            >
              + Agregar concepto (ISR, IVA…)
            </button>
          </section>
          )}

          {cats.includes("imss") && (
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={imssActivo}
                onChange={(e) => setImssActivo(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600"
              />
              <span className="text-xs font-bold text-emerald-800">IMSS (EMA, EBA, SIPARE)</span>
            </label>
            {imssActivo && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Monto IMSS"
                  value={imssMonto}
                  onChange={(e) => setImssMonto(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-emerald-100 text-xs font-bold"
                />
                <input
                  type="date"
                  value={imssFecha}
                  onChange={(e) => setImssFecha(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-emerald-100 text-xs font-bold"
                />
              </div>
            )}
          </section>
          )}

          {cats.includes("estatales") && (
          <section className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={estatalesActivo}
                onChange={(e) => setEstatalesActivo(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-violet-600"
              />
              <span className="text-xs font-bold text-violet-800">Impuestos estatales</span>
            </label>
            {estatalesActivo && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Monto estatal"
                  value={estatalesMonto}
                  onChange={(e) => setEstatalesMonto(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-violet-100 text-xs font-bold"
                />
                <input
                  type="date"
                  value={estatalesFecha}
                  onChange={(e) => setEstatalesFecha(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-violet-100 text-xs font-bold"
                />
              </div>
            )}
          </section>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
              Resumen del previo
            </p>
            {conceptosFederales.some((c) => Number(c.monto) > 0) && (
              <div className="space-y-1">
                {conceptosFederales
                  .filter((c) => Number(c.monto) > 0)
                  .map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs font-bold text-slate-700"
                    >
                      <span>{c.etiqueta}</span>
                      <span className="tabular-nums">
                        {formatMontoImpuesto(Number(c.monto) || 0)}
                      </span>
                    </div>
                  ))}
                {conceptosFederales.filter((c) => Number(c.monto) > 0).length > 1 && (
                  <div className="flex items-center justify-between text-[10px] font-black text-blue-700 pt-1 border-t border-slate-200/80">
                    <span>SAT (línea de captura)</span>
                    <span className="tabular-nums">
                      {formatMontoImpuesto(totalFederales)}
                    </span>
                  </div>
                )}
              </div>
            )}
            {imssActivo && Number(imssMonto) > 0 && (
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>IMSS</span>
                <span className="tabular-nums">
                  {formatMontoImpuesto(Number(imssMonto) || 0)}
                </span>
              </div>
            )}
            {estatalesActivo && Number(estatalesMonto) > 0 && (
              <div className="flex items-center justify-between text-xs font-bold text-violet-800">
                <span>Impuestos estatales</span>
                <span className="tabular-nums">
                  {formatMontoImpuesto(Number(estatalesMonto) || 0)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                Total a pagar
              </span>
              <span className="text-lg font-black text-slate-900 tabular-nums">
                {formatMontoImpuesto(totalPreview)}
              </span>
            </div>
            {registro && yaPublicado && (
              <p className="text-[10px] font-bold text-slate-400 text-center pt-1">
                Publicado: {formatMontoImpuesto(getTotalImpuestos(registro))}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void guardar("resend")}
              disabled={guardando}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Publicar y enviar ahora"}
            </button>
            <button
              type="button"
              onClick={() => void guardar("gmail")}
              disabled={guardando}
              className="w-full py-3 rounded-2xl border border-blue-200 text-[10px] font-black uppercase tracking-widest text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Publicar y abrir Gmail"}
            </button>
            <button
              type="button"
              onClick={() => void guardar(false)}
              disabled={guardando}
              className="w-full py-3 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Solo publicar en portal"}
            </button>
            {yaPublicado && (
              <button
                type="button"
                onClick={onEliminarPrevio}
                className="w-full py-2.5 text-[9px] font-black uppercase text-red-500"
              >
                Eliminar previo
              </button>
            )}
          </div>

          {error && <p className="text-[11px] font-bold text-red-600 text-center">{error}</p>}
          {ok && (
            <p className="text-[11px] font-bold text-emerald-600 text-center">
              Previo publicado correctamente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
