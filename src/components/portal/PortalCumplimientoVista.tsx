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
  categoriaTieneAlgunDocumento,
  pagoValidadoCategoria,
  todosPagosValidados,
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
import ComprobantePagoCategoria from "@/components/portal/ComprobantePagoCategoria";
import BarraCategoriaPago from "@/components/BarraCategoriaPago";
import FlujoCumplimientoTimeline from "@/components/FlujoCumplimientoTimeline";
import HistorialImpuestosPanel from "@/components/portal/HistorialImpuestosPanel";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import PrevioValidacionCategorias from "@/components/portal/PrevioValidacionCategorias";
import { portalPage } from "@/components/portal/portal-ui";
import {
  categoriasConPagoEnPreview,
} from "@/lib/config-cumplimiento-cliente";
import {
  periodoRepseDesdePeriodoMensual,
  periodoRepseLabel,
  REPSE_META,
} from "@/lib/repse";

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
  const { getCumplimientoPeriodo, getRegistroRepseCliente, datosListos } =
    useClientes();
  const { periodoVista, esPeriodoVigente, irAPeriodoFiscalVigente } = usePeriodoFiscal();
  const registroRaw = getCumplimientoPeriodo(cliente.id, periodoVista);
  const registro = registroRaw ? asegurarBloques(registroRaw) : undefined;
  const catsCliente = useMemo(() => categoriasHabilitadasCliente(cliente), [cliente]);

  const hayPreview = previewPublicado(registroRaw);
  const validado = clienteConfirmoPreview(registroRaw);
  const docsListos = documentosFiscalesCompletos(registroRaw, catsCliente);
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
        subtitle={
          <>
            Hacienda · SAT ·{" "}
            <span className="font-black text-blue-600">{periodoLabel(periodoVista)}</span>
            {!esPeriodoVigente && " · periodo anterior"}
          </>
        }
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

      <FlujoCumplimientoTimeline cliente={cliente} periodo={periodoVista} />

      {vencido && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-[10px] font-bold text-red-800 leading-snug">
            El plazo de pago venció. Su contador publicará la nueva línea de captura en la sección
            de pago extemporáneo.
          </p>
        </div>
      )}

      {validado && todosPagosValidados(registro, catsCliente) && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-4 shadow-md shadow-emerald-200 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
              Estás al corriente
            </p>
            <p className="text-sm font-black leading-snug">
              Sus impuestos del periodo están pagados y confirmados por su despacho.
            </p>
          </div>
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
        <PortalSection
          title="Resumen del periodo"
          collapsible
          headerExtra={
            <span className="text-sm font-black text-slate-700 tabular-nums">
              {formatMontoImpuesto(totalEnPreview)}
            </span>
          }
        >
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
        </PortalSection>
      )}

      {hayPreview && !validado && registro && catsEnPreview.length > 0 && (
        <PortalSection
          title="Previo de impuestos · validación requerida"
          collapsible
        >
          <PrevioValidacionCategorias
            cliente={cliente}
            periodo={periodoVista}
            registro={registro}
          />
        </PortalSection>
      )}

      {catsExt.length > 0 && registro && (
        <PortalSection title="Pago extemporáneo" collapsible>
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
            <PortalSection title="Impuestos del periodo · documentos" collapsible>
              <div className={`grid gap-4 ${gridCols}`}>
              {fedVis && (
                <section className="rounded-[1.75rem] border border-blue-100 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
                  <CategoriaCardHeader
                    label={CATEGORIA_META.federales.label}
                    color="blue"
                    monto={getSubtotalCategoria(registro, "federales")}
                    fechaLimite={registro.federales.lineasCaptura[0]?.fechaLimite ?? registro.fechaLimite}
                    pagado={pagoValidadoCategoria(registro, "federales")}
                  />
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
                  {categoriaTieneAlgunDocumento(registro, "federales") && (
                    <ComprobantePagoCategoria
                      clienteId={cliente.id}
                      periodo={periodoVista}
                      categoria="federales"
                      variante="blue"
                    />
                  )}
                </section>
              )}

              {imssVis && (
                <section className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
                  <CategoriaCardHeader
                    label={CATEGORIA_META.imss.label}
                    color="emerald"
                    monto={getSubtotalCategoria(registro, "imss")}
                    fechaLimite={registro.imss.fechaLimite}
                    pagado={pagoValidadoCategoria(registro, "imss")}
                  />
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
                  {categoriaTieneAlgunDocumento(registro, "imss") && (
                    <ComprobantePagoCategoria
                      clienteId={cliente.id}
                      periodo={periodoVista}
                      categoria="imss"
                      variante="emerald"
                    />
                  )}
                </section>
              )}

              {estVis && (
                <section className="rounded-[1.75rem] border border-violet-100 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
                  <CategoriaCardHeader
                    label={CATEGORIA_META.estatales.label}
                    color="violet"
                    monto={getSubtotalCategoria(registro, "estatales")}
                    fechaLimite={registro.estatales.fechaLimite}
                    pagado={pagoValidadoCategoria(registro, "estatales")}
                  />
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
                  {categoriaTieneAlgunDocumento(registro, "estatales") && (
                    <ComprobantePagoCategoria
                      clienteId={cliente.id}
                      periodo={periodoVista}
                      categoria="estatales"
                      variante="violet"
                    />
                  )}
                </section>
              )}
              </div>
            </PortalSection>

          </div>
        );
      })()}

      {cliente.configRepse?.habilitado && (() => {
        const pRepse = periodoRepseDesdePeriodoMensual(periodoVista);
        const regRepse = getRegistroRepseCliente(cliente.id, pRepse);
        const tieneAlguno = regRepse?.sisub || regRepse?.icsoe;
        if (!tieneAlguno) return null;
        return (
          <PortalSection
            title={`REPSE · ${periodoRepseLabel(pRepse)}`}
            collapsible
          >
            <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
              Declaraciones informativas cuatrimestrales (sin pago).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {regRepse?.sisub && (
                <ItemDocumentoPortal
                  documento={{
                    id: regRepse.sisub.id,
                    nombreArchivo: regRepse.sisub.nombreArchivo,
                    tipoMime: regRepse.sisub.tipoMime,
                    dataUrl: regRepse.sisub.dataUrl,
                    subidoEn: regRepse.sisub.subidoEn,
                  }}
                  label={`${REPSE_META.sisub.label} (${REPSE_META.sisub.autoridad})`}
                  variante="slate"
                />
              )}
              {regRepse?.icsoe && (
                <ItemDocumentoPortal
                  documento={{
                    id: regRepse.icsoe.id,
                    nombreArchivo: regRepse.icsoe.nombreArchivo,
                    tipoMime: regRepse.icsoe.tipoMime,
                    dataUrl: regRepse.icsoe.dataUrl,
                    subidoEn: regRepse.icsoe.subidoEn,
                  }}
                  label={`${REPSE_META.icsoe.label} (${REPSE_META.icsoe.autoridad})`}
                  variante="slate"
                />
              )}
            </div>
          </PortalSection>
        );
      })()}

      <HistorialImpuestosPanel cliente={cliente} />
    </div>
  );
}

type ColorCat = "blue" | "emerald" | "violet";

const COLOR_LABEL_CAT: Record<ColorCat, string> = {
  blue: "text-blue-600",
  emerald: "text-emerald-700",
  violet: "text-violet-700",
};

function CategoriaCardHeader({
  label,
  color,
  monto,
  fechaLimite,
  pagado,
}: {
  label: string;
  color: ColorCat;
  monto: number;
  fechaLimite: string;
  pagado: boolean;
}) {
  return (
    <header className="mb-4">
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[9px] font-black uppercase tracking-widest ${COLOR_LABEL_CAT[color]}`}>
          {label}
        </p>
        {pagado && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Pagado
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 tabular-nums leading-none mt-1">
        {formatMontoImpuesto(monto)}
      </p>
      {pagado ? (
        <p className="text-[10px] font-bold text-emerald-700 mt-1">
          Al corriente con este impuesto
        </p>
      ) : (
        <p className="text-[10px] font-bold text-slate-500 mt-1">
          Vence {formatFechaLimiteImpuestoCorta(fechaLimite)}
        </p>
      )}
    </header>
  );
}
