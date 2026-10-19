"use client";

import { useClientes } from "@/context/ClientesContext";
import { useConfirm, useNotify } from "@/components/ConfirmProvider";
import {
  type Cliente,
  type Periodo,
  periodoLabel,
} from "@/lib/clientes";
import {
  type CategoriaId,
  CATEGORIA_META,
  asegurarBloques,
  esSinPagoImpuestos,
  getComprobantePagoCategoria,
  pagoMarcadoManualCategoria,
  pagoValidadoCategoria,
  previewPublicado,
} from "@/lib/cumplimiento";
import { categoriasConPagoEnPreview } from "@/lib/config-cumplimiento-cliente";
import { abrirPdfEnNuevaPestana, descargarArchivo } from "@/lib/pdf-blob";

const CATS: CategoriaId[] = ["federales", "imss", "estatales"];

function etiquetaRegistrar(cat: CategoriaId): string {
  if (cat === "federales") return "Registrar pago de impuestos";
  if (cat === "imss") return "Registrar pago de IMSS";
  return "Registrar pago estatal";
}

function IconoOjo({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconoBajar({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconoValidar({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconoPago({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function botonAccion(oscuro: boolean, acento?: "validar" | "bajar") {
  if (acento === "validar") {
    return oscuro
      ? "inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500 text-white text-[10px] font-semibold"
      : "inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-700 text-white text-[10px] font-semibold";
  }
  if (acento === "bajar") {
    return oscuro
      ? "inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white text-[#1a164d] text-[10px] font-semibold"
      : "inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-700 text-white text-[10px] font-semibold";
  }
  return oscuro
    ? "inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/15 text-white text-[10px] font-semibold hover:bg-white/25"
    : "inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-violet-200 text-violet-800 text-[10px] font-semibold";
}

export default function ConfirmarPagoImpuestos({
  cliente,
  periodo,
}: {
  cliente: Cliente;
  periodo: Periodo;
}) {
  const {
    getCumplimientoPeriodo,
    marcarPagoManualCategoria,
    validarPagoCategoria,
    revertirValidacionPagoCategoria,
  } = useClientes();
  const confirm = useConfirm();
  const notify = useNotify();

  const reg = getCumplimientoPeriodo(cliente.id, periodo);
  if (!reg) return null;

  const puedeRegistrar =
    previewPublicado(reg) && !esSinPagoImpuestos(reg);
  const catsPago = puedeRegistrar
    ? categoriasConPagoEnPreview(cliente, asegurarBloques(reg))
    : [];

  const filas = CATS.filter(
    (cat) =>
      catsPago.includes(cat) || !!getComprobantePagoCategoria(reg, cat)
  );
  const legado =
    !!reg.comprobantePago &&
    !CATS.some((cat) => getComprobantePagoCategoria(reg, cat));

  if (!filas.length && !legado) return null;

  return (
    <div className="mb-3 space-y-2">
      {filas.map((cat) => {
        const doc = getComprobantePagoCategoria(reg, cat);
        const validado = pagoValidadoCategoria(reg, cat);
        const manual = pagoMarcadoManualCategoria(reg, cat);
        const label = CATEGORIA_META[cat].label;
        const oscuro = !validado && !!doc;

        return (
          <div
            key={cat}
            className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#1a164d]/15"
          >
            <div className="flex flex-col gap-2 p-3 bg-[#1a164d]/[0.04] border-r border-[#1a164d]/10">
              <p className="text-[11px] font-semibold text-[#1a164d]">
                Registrar pago de impuestos
              </p>
              <p className="text-[10px] text-slate-500 leading-snug">
                {manual
                  ? `${label} quedó registrado a mano.`
                  : `Si ${label} ya se pagó y no se refleja, confírmalo aquí.`}
              </p>
              {validado ? (
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-violet-800">
                    {label} · pagado
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await confirm({
                        titulo: "Revertir pago",
                        mensaje:
                          "El periodo volverá a aparecer como pendiente de pago.",
                        textoConfirmar: "Revertir",
                        tono: "warning",
                      });
                      if (!ok) return;
                      await revertirValidacionPagoCategoria(
                        cliente.id,
                        periodo,
                        cat
                      );
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Revertir
                  </button>
                </div>
              ) : catsPago.includes(cat) ? (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await confirm({
                      titulo: etiquetaRegistrar(cat),
                      mensaje: `¿Confirmas que ${cliente.razonSocial} ya pagó ${label} de ${periodoLabel(periodo)}? Se cerrará el periodo aunque no haya comprobante en el portal.`,
                      textoConfirmar: "Sí, registrar pago",
                      tono: "warning",
                    });
                    if (!ok) return;
                    await marcarPagoManualCategoria(
                      cliente.id,
                      periodo,
                      cat
                    );
                    notify({
                      titulo: "Pago registrado",
                      mensaje: `${label} de ${periodoLabel(periodo)} quedó como pagado.`,
                      tono: "info",
                    });
                  }}
                  className="mt-auto inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-xl bg-[#1a164d] text-white text-[11px] font-semibold hover:bg-[#2a2460] text-center leading-tight"
                >
                  <IconoPago />
                  {etiquetaRegistrar(cat)}
                </button>
              ) : (
                <p className="mt-auto text-[11px] text-slate-400 leading-snug">
                  Publica el previo para registrar el pago.
                </p>
              )}
            </div>

            <div
              className={`flex flex-col gap-1.5 p-3 ${
                oscuro
                  ? "bg-[#1a164d] text-white"
                  : validado
                    ? "bg-violet-50"
                    : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <p
                  className={`text-[11px] font-semibold leading-tight ${
                    oscuro
                      ? "text-white"
                      : validado
                        ? "text-violet-800"
                        : "text-[#1a164d]"
                  }`}
                >
                  Comprobante de pago
                </p>
                {validado ? (
                  <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-700 text-white">
                    Ok
                  </span>
                ) : null}
              </div>
              {doc ? (
                <>
                  <p
                    className={`text-[10px] truncate ${
                      oscuro ? "text-white/70" : "text-slate-500"
                    }`}
                    title={doc.nombreArchivo}
                  >
                    {label} · {doc.nombreArchivo}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    <button
                      type="button"
                      onClick={() => abrirPdfEnNuevaPestana(doc.dataUrl)}
                      className={botonAccion(oscuro)}
                    >
                      <IconoOjo />
                      Ver
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        descargarArchivo(doc.dataUrl, doc.nombreArchivo)
                      }
                      className={botonAccion(oscuro, "bajar")}
                    >
                      <IconoBajar />
                      Bajar
                    </button>
                    {validado ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await confirm({
                            titulo: "Revertir validación",
                            mensaje:
                              "El cliente verá nuevamente la opción de reemplazar el comprobante.",
                            textoConfirmar: "Revertir",
                            tono: "warning",
                          });
                          if (ok) {
                            await revertirValidacionPagoCategoria(
                              cliente.id,
                              periodo,
                              cat
                            );
                          }
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${
                          oscuro ? "text-white/70" : "text-slate-500"
                        }`}
                      >
                        Revertir
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          void validarPagoCategoria(
                            cliente.id,
                            periodo,
                            cat
                          );
                        }}
                        className={botonAccion(oscuro, "validar")}
                      >
                        <IconoValidar />
                        Validar
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p
                  className={`mt-auto text-[11px] leading-snug ${
                    validado ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {validado
                    ? "Registrado sin comprobante del cliente."
                    : "Aún no hay comprobante."}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {legado && reg.comprobantePago ? (
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#1a164d]/15">
          <div className="p-3 bg-[#1a164d]/[0.04] border-r border-[#1a164d]/10">
            <p className="text-[11px] font-semibold text-[#1a164d]">
              Registrar pago de impuestos
            </p>
            <p className="mt-1 text-[10px] text-slate-500 leading-snug">
              Comprobante legado. Revísalo a la derecha.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 p-3 bg-white">
            <p className="text-[11px] font-semibold text-[#1a164d]">
              Comprobante de pago
            </p>
            <p
              className="text-[10px] text-slate-500 truncate"
              title={reg.comprobantePago.nombreArchivo}
            >
              {reg.comprobantePago.nombreArchivo}
            </p>
            <div className="flex flex-wrap gap-1 mt-auto">
              <button
                type="button"
                onClick={() =>
                  abrirPdfEnNuevaPestana(reg.comprobantePago!.dataUrl)
                }
                className={botonAccion(false)}
              >
                <IconoOjo />
                Ver
              </button>
              <button
                type="button"
                onClick={() =>
                  descargarArchivo(
                    reg.comprobantePago!.dataUrl,
                    reg.comprobantePago!.nombreArchivo
                  )
                }
                className={botonAccion(false, "bajar")}
              >
                <IconoBajar />
                Bajar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
