"use client";

import { useMemo, useState } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { useClientes } from "@/context/ClientesContext";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import {
  TIPOS_ENCARGO,
  TIPO_ENCARGO_META,
  ESTADO_ENCARGO_META,
  progresoEncargo,
  formatRelativoEncargo,
  type TipoEncargo,
} from "@/lib/encargos";

export default function PortalEncargosPage() {
  const { cliente } = usePortalAuth();
  const { getEncargosCliente, crearEncargo } = useClientes();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoEncargo>("documento");
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  const lista = useMemo(
    () => (cliente ? getEncargosCliente(cliente.id) : []),
    [cliente, getEncargosCliente]
  );

  const waUrl = CONTACTO_PUBLICO.whatsapp.buildUrl(
    "Hola, soy cliente del portal de RDC Contadores y tengo un encargo o duda: "
  );

  function resetModal() {
    setTitulo("");
    setNota("");
    setTipo("documento");
    setOk(false);
  }

  function handlePedir(e: React.FormEvent) {
    e.preventDefault();
    if (!cliente || !titulo.trim()) return;
    setEnviando(true);
    crearEncargo({
      clienteId: cliente.id,
      titulo: titulo.trim(),
      tipo,
      nota: nota.trim() || undefined,
      creadoPor: "cliente",
    });
    setEnviando(false);
    setOk(true);
    setTimeout(() => {
      setModalAbierto(false);
      resetModal();
    }, 1200);
  }

  function descargar(dataUrl: string, nombre: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = nombre;
    a.click();
  }

  if (!cliente) {
    return (
      <div className="py-12 text-center text-slate-400 font-bold text-sm">
        Cargando…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <PortalPageHeader
        eyebrow="Mi cuenta"
        title="Mis encargos"
        subtitle="Lo que le pediste a tu contador — facturas, documentos y trámites."
      />

      {lista.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-slate-600 font-semibold text-sm">
            Aún no tienes encargos registrados.
          </p>
          <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
            Puedes pedirnos algo desde aquí o escribirnos por WhatsApp como siempre.
            Lo registramos y ves el avance en esta pantalla.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {lista.map((enc) => {
            const prog = progresoEncargo(enc.estado);
            const meta = ESTADO_ENCARGO_META[enc.estado];
            return (
              <article
                key={enc.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${TIPO_ENCARGO_META[enc.tipo].chip}`}
                  >
                    {TIPO_ENCARGO_META[enc.tipo].label}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${meta.chip}`}
                  >
                    {meta.label}
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-800">{enc.titulo}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {meta.detalleCliente}
                </p>

                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <span>
                      {prog.paso} de {prog.total} pasos
                    </span>
                    <span>{prog.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                      style={{ width: `${prog.pct}%` }}
                    />
                  </div>
                </div>

                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                  {formatRelativoEncargo(enc.creadoEn)}
                </p>

                {enc.estado === "listo" && enc.archivo && (
                  <button
                    type="button"
                    onClick={() =>
                      descargar(enc.archivo!.dataUrl, enc.archivo!.nombreArchivo)
                    }
                    className="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition"
                  >
                    Descargar
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      <div className="flex flex-col items-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            resetModal();
            setModalAbierto(true);
          }}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-dashed border-blue-200 text-blue-700 text-sm font-black hover:bg-blue-50 transition"
        >
          + Pedir algo a mi contador
        </button>
        <p className="text-xs text-slate-400 text-center max-w-md leading-relaxed">
          También puedes escribirnos por{" "}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 font-bold hover:underline"
          >
            WhatsApp
          </a>{" "}
          o redes — lo registramos aquí para que veas el estatus.
        </p>
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {ok ? (
              <div className="text-center py-6">
                <p className="text-lg font-black text-emerald-600">
                  ¡Listo! Recibimos tu solicitud
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Te avisaremos cuando avance.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePedir} className="space-y-4">
                <h3 className="text-lg font-black text-slate-800">
                  Pedir algo a mi contador
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cuéntanos en pocas palabras qué necesitas. No tiene que ser
                  perfecto — tu contador lo revisa personalmente.
                </p>

                <label className="block space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    ¿Qué necesitas?
                  </span>
                  <input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej. Factura del mes, carta de no adeudo…"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                  />
                </label>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Tipo
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TIPOS_ENCARGO.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipo(t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          tipo === t
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {TIPO_ENCARGO_META[t].label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Detalle (opcional)
                  </span>
                  <textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    rows={3}
                    placeholder="Cualquier contexto que ayude…"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm resize-none"
                  />
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando || !titulo.trim()}
                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-black disabled:opacity-50"
                  >
                    Enviar solicitud
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
