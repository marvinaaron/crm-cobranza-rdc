"use client";

import { useEffect, useState } from "react";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes, type LineaPreviewInput } from "@/context/ClientesContext";
import {
  formatMontoImpuesto,
  previewPublicado,
  clienteConfirmoPreview,
  asegurarBloques,
  getTotalImpuestos,
} from "@/lib/cumplimiento";
import { abrirCorreoImpuestosCalculados } from "@/lib/correo-cumplimiento";
import { isValidEmail } from "@/lib/email";
import { categoriasHabilitadasCliente } from "@/lib/config-cumplimiento-cliente";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  onClose: () => void;
};

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

function lineaVacia(): LineaPreviewInput {
  return { etiqueta: "Impuestos federales", monto: 0, fechaLimite: "" };
}

export default function ModalPrevisImpuestos({ cliente, periodo, onClose }: Props) {
  const {
    getCumplimientoPeriodo,
    publicarPreviewImpuestos,
    marcarPreviewNotificado,
    eliminarPreviewImpuestos,
  } = useClientes();

  const registro = getCumplimientoPeriodo(cliente.id, periodo);
  const reg = registro ? asegurarBloques(registro) : null;

  const [lineasFederales, setLineasFederales] = useState<LineaPreviewInput[]>([lineaVacia()]);
  const [imssActivo, setImssActivo] = useState(false);
  const [imssMonto, setImssMonto] = useState("");
  const [imssFecha, setImssFecha] = useState("");
  const [estatalesActivo, setEstatalesActivo] = useState(false);
  const [estatalesMonto, setEstatalesMonto] = useState("");
  const [estatalesFecha, setEstatalesFecha] = useState("");
  const cats = categoriasHabilitadasCliente(cliente);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!reg) return;
    if (reg.federales.lineasCaptura.length) {
      setLineasFederales(
        reg.federales.lineasCaptura.map((l) => ({
          etiqueta: l.etiqueta,
          monto: l.monto,
          fechaLimite: l.fechaLimite,
        }))
      );
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

  const guardar = (notificar: boolean) => {
    setError(null);
    const federales: LineaPreviewInput[] = [];
    if (cats.includes("federales")) {
      for (const l of lineasFederales) {
        const monto = parseMonto(String(l.monto));
        if (monto === null) {
          setError("Revise los montos de impuestos federales.");
          return;
        }
        if (!l.fechaLimite.trim()) {
          setError("Indique la fecha límite de cada línea federal.");
          return;
        }
        federales.push({
          etiqueta: l.etiqueta.trim() || "Impuestos federales",
          monto,
          fechaLimite: l.fechaLimite.trim(),
        });
      }
      if (!federales.length) {
        setError("Agregue al menos una línea de captura federal.");
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

    if (notificar) {
      if (!cliente.email?.trim() || !isValidEmail(cliente.email)) {
        setError("Publicado, pero el cliente no tiene correo válido.");
        setOk(true);
        return;
      }
      const mailOk = abrirCorreoImpuestosCalculados(cliente, periodo, actualizado);
      if (mailOk) marcarPreviewNotificado(cliente.id, periodo);
    }

    setOk(true);
    setTimeout(() => {
      setOk(false);
      if (!notificar) onClose();
    }, 2000);
  };

  const yaPublicado = previewPublicado(registro);
  const yaValidado = clienteConfirmoPreview(registro);
  const totalPreview =
    lineasFederales.reduce((s, l) => s + (Number(l.monto) || 0), 0) +
    (imssActivo ? Number(imssMonto) || 0 : 0) +
    (estatalesActivo ? Number(estatalesMonto) || 0 : 0);

  const onEliminarPrevio = () => {
    if (
      !window.confirm(
        "¿Eliminar el previo? Se borrará toda la información y documentos de este periodo."
      )
    ) {
      return;
    }
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
            Configure montos y fechas por categoría. El cliente verá subtotales y barras de plazo
            en su portal.
          </p>

          {yaValidado && (
            <p className="text-[11px] font-bold text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
              Si republica el previo, el cliente deberá validar de nuevo y se quitarán los PDFs
              cargados.
            </p>
          )}

          {cats.includes("federales") && (
          <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-700">
              Impuestos federales
            </p>
            {lineasFederales.map((l, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                <input
                  type="text"
                  placeholder="Concepto"
                  value={l.etiqueta}
                  onChange={(e) => {
                    const next = [...lineasFederales];
                    next[i] = { ...next[i], etiqueta: e.target.value };
                    setLineasFederales(next);
                  }}
                  className="px-3 py-2 rounded-xl border border-blue-100 text-xs font-bold sm:col-span-3"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Monto"
                  value={l.monto || ""}
                  onChange={(e) => {
                    const next = [...lineasFederales];
                    next[i] = { ...next[i], monto: Number(e.target.value) };
                    setLineasFederales(next);
                  }}
                  className="px-3 py-2 rounded-xl border border-blue-100 text-xs font-bold"
                />
                <input
                  type="date"
                  value={l.fechaLimite}
                  onChange={(e) => {
                    const next = [...lineasFederales];
                    next[i] = { ...next[i], fechaLimite: e.target.value };
                    setLineasFederales(next);
                  }}
                  className="px-3 py-2 rounded-xl border border-blue-100 text-xs font-bold"
                />
                {lineasFederales.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setLineasFederales(lineasFederales.filter((_, j) => j !== i))
                    }
                    className="text-[9px] font-black uppercase text-red-500 sm:col-span-3 text-left"
                  >
                    Quitar línea
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setLineasFederales([...lineasFederales, lineaVacia()])}
              className="text-[9px] font-black uppercase tracking-widest text-blue-600"
            >
              + Agregar línea de captura
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

          <p className="text-sm font-black text-slate-800 text-center">
            Total estimado: {formatMontoImpuesto(totalPreview)}
            {registro && yaPublicado && (
              <span className="block text-[10px] font-bold text-slate-400 mt-1">
                Publicado: {formatMontoImpuesto(getTotalImpuestos(registro))}
              </span>
            )}
          </p>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => guardar(true)}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700"
            >
              Publicar y notificar por correo
            </button>
            <button
              type="button"
              onClick={() => guardar(false)}
              className="w-full py-3 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600"
            >
              Solo publicar en portal
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
