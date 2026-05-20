"use client";

import { useEffect, useMemo } from "react";
import { type Cliente, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { usePeriodoFiscal } from "@/hooks/usePeriodoPortal";
import {
  type CategoriaId,
  CATEGORIA_META,
  asegurarBloques,
  formatFechaLimiteImpuesto,
  formatFechaLimiteImpuestoCorta,
  formatMontoImpuesto,
  previewPublicado,
  clienteConfirmoPreview,
  documentosFiscalesCompletos,
  clientePuedeSubirComprobante,
  debeMostrarAlertaLimite,
  getSubtotalCategoria,
  categoriaTieneExtemporaneo,
  periodoVencidoSinPago,
  plazoCategoria,
  DIAS_RECORDATORIO,
} from "@/lib/cumplimiento";
import {
  categoriasHabilitadasCliente,
  categoriaVisibleParaCliente,
  categoriaPreviewValidadaPorCliente,
} from "@/lib/config-cumplimiento-cliente";
import AccionesDocumentoPdf from "@/components/AccionesDocumentoPdf";
import ItemDocumentoPortal from "@/components/portal/ItemDocumentoPortal";
import BarraCategoriaPago from "@/components/BarraCategoriaPago";
import SubirComprobanteImpuestos from "@/components/portal/SubirComprobanteImpuestos";
import HistorialImpuestosPanel from "@/components/portal/HistorialImpuestosPanel";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import PrevioValidacionCategorias from "@/components/portal/PrevioValidacionCategorias";
import { portalPage } from "@/components/portal/portal-ui";
import {
  categoriasConPagoEnPreview,
} from "@/lib/config-cumplimiento-cliente";

type Props = { cliente: Cliente };

function BarraExtemporaneo({
  registro,
  categoria,
}: {
  registro: ReturnType<typeof asegurarBloques>;
  categoria: CategoriaId;
}) {
  const bloque = registro.extemporaneo?.[categoria];
  const linea = bloque?.lineas[0];
  if (!linea) return null;
  const plazo = plazoCategoria(registro, categoria, bloque.publicadoEn);
  const meta = CATEGORIA_META[categoria];
  if (!plazo) return null;

  const { dias, vencido, progreso } = plazo;
  let mensaje = vencido ? "Vencido" : dias === 0 ? "Hoy" : `${dias}d`;

  return (
    <div className={`rounded-xl border px-4 py-3 ${meta.border} bg-red-50/80`}>
      <p className="text-[8px] font-black uppercase text-red-600 mb-1">Pago extemporáneo</p>
      <div className="flex flex-wrap items-center gap-3">
        <p className={`text-lg font-black tabular-nums ${meta.accent}`}>
          {formatMontoImpuesto(linea.monto)}
        </p>
        <div className="flex-1 min-w-[120px]">
          <div className="flex justify-between text-[9px] font-black uppercase mb-1">
            <span className={meta.accent}>Plazo</span>
            <span className={vencido ? "text-red-600" : meta.accent}>{mensaje}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white overflow-hidden">
            <div
              className={`h-full rounded-full ${vencido ? "bg-red-500" : meta.bar}`}
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-500">
          {formatFechaLimiteImpuestoCorta(linea.fechaLimite)}
        </p>
      </div>
    </div>
  );
}

export default function PortalCumplimientoVista({ cliente }: Props) {
  const { getCumplimientoPeriodo, datosListos } = useClientes();
  const { periodoVista, esPeriodoVigente, irAPeriodoFiscalVigente } = usePeriodoFiscal();
  const registroRaw = getCumplimientoPeriodo(cliente.id, periodoVista);
  const registro = registroRaw ? asegurarBloques(registroRaw) : undefined;
  const catsCliente = useMemo(() => categoriasHabilitadasCliente(cliente), [cliente]);

  const hayPreview = previewPublicado(registroRaw);
  const validado = clienteConfirmoPreview(registroRaw);
  const docsListos = documentosFiscalesCompletos(registroRaw, catsCliente);
  const puedeComprobante = clientePuedeSubirComprobante(registroRaw, catsCliente);
  const vencido = periodoVencidoSinPago(registroRaw);

  const catsEnPreview = useMemo(
    () => (registro ? categoriasConPagoEnPreview(cliente, registro) : []),
    [cliente, registro]
  );
  const catsValidadas = useMemo(
    () =>
      catsEnPreview.filter((cat) =>
        categoriaPreviewValidadaPorCliente(registroRaw, cat)
      ),
    [catsEnPreview, registroRaw]
  );
  const totalEnPreview = useMemo(
    () =>
      registro
        ? catsEnPreview.reduce((s, cat) => s + getSubtotalCategoria(registro, cat), 0)
        : 0,
    [registro, catsEnPreview]
  );
  const catsExt = catsCliente.filter(
    (cat) =>
      registro &&
      categoriaTieneExtemporaneo(registro, cat) &&
      categoriaVisibleParaCliente(cliente, registro, cat)
  );

  useEffect(() => {
    if (!registro || !validado || !debeMostrarAlertaLimite(registroRaw)) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const mostrar = () => {
      new Notification("Recordatorio · impuestos", {
        body: `Fecha límite próxima · ${formatFechaLimiteImpuesto(registro.fechaLimite)}`,
      });
    };
    if (Notification.permission === "granted") mostrar();
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((p) => {
        if (p === "granted") mostrar();
      });
    }
  }, [registro, registroRaw, validado]);

  if (!datosListos) {
    return (
      <div className={portalPage}>
        <PortalPageHeader eyebrow="Mi cuenta" title="Cumplimiento" subtitle="Cargando…" />
        <PortalSection>
          <p className="text-sm font-bold text-slate-400 text-center py-8">Cargando…</p>
        </PortalSection>
      </div>
    );
  }

  if (catsCliente.length === 0) {
    return (
      <div className={portalPage}>
        <PortalPageHeader eyebrow="Mi cuenta" title="Cumplimiento" subtitle="Sin categorías activas" />
        <PortalSection>
          <p className="text-sm font-bold text-slate-500 text-center py-4">
            Su expediente no tiene categorías de impuestos configuradas. Contacte a su contador.
          </p>
        </PortalSection>
        <HistorialImpuestosPanel cliente={cliente} />
      </div>
    );
  }

  return (
    <div className={portalPage}>
      <PortalPageHeader
        eyebrow="Mi cuenta"
        title="Cumplimiento"
        subtitle={`Hacienda · SAT · ${periodoLabel(periodoVista)}${!esPeriodoVigente ? " · periodo anterior" : ""}`}
        actions={
          !esPeriodoVigente ? (
            <button
              type="button"
              onClick={irAPeriodoFiscalVigente}
              className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800"
            >
              Periodo vigente
            </button>
          ) : undefined
        }
      />

      {vencido && !registro?.comprobantePago && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-[10px] font-bold text-red-800 leading-snug">
            El plazo de pago venció. Su contador publicará la nueva línea de captura en la sección
            de pago extemporáneo.
          </p>
        </div>
      )}

      {!hayPreview && catsExt.length === 0 && (
        <PortalSection>
          <p className="text-sm font-bold text-slate-500 text-center py-4 leading-relaxed">
            Su contador aún no ha publicado el previo de impuestos para {periodoLabel(periodoVista)}.
          </p>
        </PortalSection>
      )}

      {hayPreview && registro && catsEnPreview.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Total a pagar
            </p>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums leading-none tracking-tight">
              {formatMontoImpuesto(totalEnPreview)}
            </p>
          </div>
          {validado && debeMostrarAlertaLimite(registroRaw) && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-2.5">
              <p className="text-[10px] font-bold text-indigo-800 leading-snug">
                <span className="font-black uppercase tracking-widest text-indigo-600">
                  Recordatorio ·{" "}
                </span>
                Fecha límite en {DIAS_RECORDATORIO} días o menos.
              </p>
            </div>
          )}
          {catsValidadas.map((cat) => (
            <BarraCategoriaPago key={cat} registro={registro} categoria={cat} />
          ))}
        </div>
      )}

      {hayPreview && !validado && registro && catsEnPreview.length > 0 && (
        <PortalSection title="Previo de impuestos · validación requerida">
          <PrevioValidacionCategorias
            cliente={cliente}
            periodo={periodoVista}
            registro={registro}
          />
        </PortalSection>
      )}

      {catsExt.length > 0 && registro && (
        <PortalSection title="Pago extemporáneo">
          <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
            Nueva declaración y línea de captura tras vencer el plazo. No requiere validar importes;
            realice el pago y suba su comprobante cuando corresponda.
          </p>
          <div className="space-y-4">
            {catsExt.map((cat) => {
              const linea = registro.extemporaneo?.[cat]?.lineas[0];
              return (
                <div key={cat} className="space-y-3">
                  <BarraExtemporaneo registro={registro} categoria={cat} />
                  {linea?.documento && (
                    <AccionesDocumentoPdf documento={linea.documento} alturaVisor="h-48" />
                  )}
                </div>
              );
            })}
          </div>
        </PortalSection>
      )}

      {validado && registro && (() => {
        const fedVis = categoriaVisibleParaCliente(cliente, registro, "federales");
        const imssVis = categoriaVisibleParaCliente(cliente, registro, "imss");
        const estVis = categoriaVisibleParaCliente(cliente, registro, "estatales");
        const nVisibles = [fedVis, imssVis, estVis].filter(Boolean).length;
        const gridCols =
          nVisibles === 1
            ? "grid-cols-1"
            : nVisibles === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

        return (
          <div className="space-y-6">
            <div className={`grid gap-4 ${gridCols}`}>
              {fedVis && (
                <section className="rounded-[1.75rem] border border-blue-100 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
                  <header className="mb-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1">
                      {CATEGORIA_META.federales.label}
                    </p>
                    <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">
                      {formatMontoImpuesto(getSubtotalCategoria(registro, "federales"))}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">
                      Vence {formatFechaLimiteImpuestoCorta(registro.federales.lineasCaptura[0]?.fechaLimite ?? registro.fechaLimite)}
                    </p>
                  </header>
                  <div className="space-y-2.5 flex-1">
                    <ItemDocumentoPortal
                      documento={registro.federales.declaracion}
                      label="Declaración"
                      pendiente="Declaración pendiente"
                      variante="blue"
                    />
                    {registro.federales.lineasCaptura.length === 0 ? (
                      <ItemDocumentoPortal
                        label="Línea de captura"
                        pendiente="Línea de captura pendiente"
                        variante="blue"
                      />
                    ) : (
                      registro.federales.lineasCaptura.map((l) => (
                        <ItemDocumentoPortal
                          key={l.id}
                          documento={l.documento}
                          label={l.etiqueta}
                          hint={`${formatMontoImpuesto(l.monto)} · vence ${formatFechaLimiteImpuestoCorta(l.fechaLimite)}`}
                          pendiente="Línea de captura pendiente"
                          variante="blue"
                        />
                      ))
                    )}
                  </div>
                </section>
              )}

              {imssVis && (
                <section className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
                  <header className="mb-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700 mb-1">
                      {CATEGORIA_META.imss.label}
                    </p>
                    <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">
                      {formatMontoImpuesto(getSubtotalCategoria(registro, "imss"))}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">
                      Vence {formatFechaLimiteImpuestoCorta(registro.imss.fechaLimite)}
                    </p>
                  </header>
                  <div className="space-y-2.5 flex-1">
                    <ItemDocumentoPortal
                      documento={registro.imss.sipare}
                      label="SIPARE · Línea de captura"
                      pendiente="SIPARE pendiente"
                      variante="emerald"
                    />
                    {registro.imss.ema.length === 0 ? (
                      <ItemDocumentoPortal
                        label="EMA"
                        hint="Emisión Mensual Anticipada"
                        variante="emerald"
                      />
                    ) : (
                      registro.imss.ema.map((doc, i) => (
                        <ItemDocumentoPortal
                          key={doc.id}
                          documento={doc}
                          label={registro.imss.ema.length > 1 ? `EMA · PDF ${i + 1}` : "EMA"}
                          hint="Emisión Mensual Anticipada"
                          variante="emerald"
                        />
                      ))
                    )}
                    {registro.imss.eba.length === 0 ? (
                      <ItemDocumentoPortal
                        label="EBA"
                        hint="Emisión Bimestral Anticipada"
                        variante="emerald"
                      />
                    ) : (
                      registro.imss.eba.map((doc, i) => (
                        <ItemDocumentoPortal
                          key={doc.id}
                          documento={doc}
                          label={registro.imss.eba.length > 1 ? `EBA · PDF ${i + 1}` : "EBA"}
                          hint="Emisión Bimestral Anticipada"
                          variante="emerald"
                        />
                      ))
                    )}
                  </div>
                </section>
              )}

              {estVis && (
                <section className="rounded-[1.75rem] border border-violet-100 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
                  <header className="mb-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-violet-700 mb-1">
                      {CATEGORIA_META.estatales.label}
                    </p>
                    <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">
                      {formatMontoImpuesto(getSubtotalCategoria(registro, "estatales"))}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">
                      Vence {formatFechaLimiteImpuestoCorta(registro.estatales.fechaLimite)}
                    </p>
                  </header>
                  <div className="space-y-2.5 flex-1">
                    {registro.estatales.nominas.length === 0 ? (
                      <ItemDocumentoPortal
                        label="Nómina"
                        pendiente="Nómina pendiente"
                        variante="violet"
                      />
                    ) : (
                      registro.estatales.nominas.map((doc, i) => (
                        <ItemDocumentoPortal
                          key={doc.id}
                          documento={doc}
                          label={registro.estatales.nominas.length > 1 ? `Nómina · archivo ${i + 1}` : "Nómina"}
                          variante="violet"
                        />
                      ))
                    )}
                    {registro.estatales.lineasCaptura.length === 0 ? (
                      <ItemDocumentoPortal
                        label="Línea de captura"
                        pendiente="Línea de captura pendiente"
                        variante="violet"
                      />
                    ) : (
                      registro.estatales.lineasCaptura.map((l) => (
                        <ItemDocumentoPortal
                          key={l.id}
                          documento={l.documento}
                          label={l.etiqueta || "Línea de captura"}
                          hint={`${formatMontoImpuesto(l.monto)} · vence ${formatFechaLimiteImpuestoCorta(l.fechaLimite)}`}
                          pendiente="Línea de captura pendiente"
                          variante="violet"
                        />
                      ))
                    )}
                  </div>
                </section>
              )}
            </div>

            {registro.otros.length > 0 && (
              <PortalSection title="Otros documentos">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {registro.otros.map((doc) => (
                    <ItemDocumentoPortal
                      key={doc.id}
                      documento={doc}
                      label={doc.nombreArchivo}
                      variante="slate"
                    />
                  ))}
                </div>
              </PortalSection>
            )}
          </div>
        );
      })()}

      {puedeComprobante && (
        <SubirComprobanteImpuestos clienteId={cliente.id} periodo={periodoVista} />
      )}

      {validado && docsListos && !puedeComprobante && registro?.comprobantePago && (
        <PortalSection title="Comprobante de pago">
          <AccionesDocumentoPdf documento={registro.comprobantePago} alturaVisor="h-56" />
        </PortalSection>
      )}

      <HistorialImpuestosPanel cliente={cliente} />
    </div>
  );
}
