"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { usePeriodoFiscal } from "@/hooks/usePeriodoPortal";
import { useMarcarPrevioVistoAlVerBanner } from "@/hooks/useMarcarPrevioVistoAlVerBanner";
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
  getFlujoCumplimiento,
} from "@/lib/cumplimiento";
import {
  categoriasHabilitadasCliente,
  categoriaVisibleParaCliente,
  categoriaPreviewValidadaPorCliente,
} from "@/lib/config-cumplimiento-cliente";
import { modoPortalCliente } from "@/lib/config-portal-cliente";
import AccionesDocumentoPdf from "@/components/AccionesDocumentoPdf";
import ItemDocumentoPortal from "@/components/portal/ItemDocumentoPortal";
import ComprobantePagoCategoria from "@/components/portal/ComprobantePagoCategoria";
import BarraCategoriaPago from "@/components/BarraCategoriaPago";
import FlujoCumplimientoTimeline from "@/components/FlujoCumplimientoTimeline";
import HistorialImpuestosPanel from "@/components/portal/HistorialImpuestosPanel";
import BotonExportarCumplimientoAnual from "@/components/portal/BotonExportarCumplimientoAnual";
import { PortalInfoBoton } from "@/components/portal/PortalGloboInfo";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import PrevioValidacionCategorias from "@/components/portal/PrevioValidacionCategorias";
import PortalCumplimientoBanner, {
  getAccionCumplimientoPortal,
  PortalCtaFijaCumplimiento,
} from "@/components/portal/PortalCumplimientoBanner";
import DeclaracionesTimelineMeses from "@/components/portal/DeclaracionesTimelineMeses";
import PortalCierreIngresosGastos from "@/components/portal/PortalCierreIngresosGastos";
import LineaCapturaSatCopiar from "@/components/portal/LineaCapturaSatCopiar";
import PillPaginas from "@/components/portal/PillPaginas";
import { usePortalEsMovil } from "@/hooks/usePortalEsMovil";
import { portalPage } from "@/components/portal/portal-ui";
import {
  categoriasConPagoEnPreview,
} from "@/lib/config-cumplimiento-cliente";
import { categoriasVencidasSinPago, lineaExtemporaneaVigente } from "@/lib/cumplimiento-categorias";
import { fechaLimiteSATConOverride, isoFechaLocal } from "@/lib/portal/fechas-fiscales";
import {
  claseUrgenciaLimiteCaptura,
  diasHastaLimite,
  limiteVencido,
} from "@/lib/cumplimiento-fechas";
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
  const lineas = bloque?.lineas ?? [];
  const linea = lineas[lineas.length - 1];
  if (!linea) return null;
  const plazo = plazoCategoria(registro, categoria, bloque?.publicadoEn);
  const meta = CATEGORIA_META[categoria];
  if (!plazo) return null;

  const { dias, vencido, progreso } = plazo;
  let mensaje = vencido ? "Vencido" : dias === 0 ? "Hoy" : `${dias}d`;
  const original = getSubtotalCategoria(registro, categoria);
  const recargo =
    original > 0
      ? Math.round((linea.monto - original) * 100) / 100
      : null;

  return (
    <div className={`rounded-xl border px-4 py-3 ${meta.border} bg-red-50/80`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <p className="text-[8px] font-black uppercase text-red-600">
          Pago extemporáneo
        </p>
        {recargo != null && recargo > 0 && (
          <p className="text-[8px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
            Incluye recargo +{formatMontoImpuesto(recargo)}
          </p>
        )}
      </div>
      {lineas.length > 0 && (
        <ul className="mb-2 space-y-0.5">
          {original > 0 && (
            <li className="text-[10px] font-bold text-slate-500">
              Original {formatMontoImpuesto(original)}
            </li>
          )}
          {lineas.map((l, i) => (
            <li key={l.id} className="text-[10px] font-bold text-slate-600">
              Ext. {i + 1}
              {i === lineas.length - 1 ? " · vigente" : ""}
              {" · "}
              {formatMontoImpuesto(l.monto)}
              {l.fechaLimiteAnterior
                ? ` · venció ${formatFechaLimiteImpuestoCorta(l.fechaLimiteAnterior)}`
                : ""}
              {l.fechaLimite
                ? ` · vence ${formatFechaLimiteImpuestoCorta(l.fechaLimite)}`
                : ""}
            </li>
          ))}
        </ul>
      )}
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
  const {
    getCumplimientoPeriodo,
    getRegistroRepseCliente,
    datosListos,
  } = useClientes();
  const { periodoVista, esPeriodoVigente, irAPeriodoFiscalVigente } = usePeriodoFiscal();
  const registroRaw = getCumplimientoPeriodo(cliente.id, periodoVista);
  const registro = registroRaw ? asegurarBloques(registroRaw) : undefined;
  const catsCliente = useMemo(() => categoriasHabilitadasCliente(cliente), [cliente]);

  const hayPreview = previewPublicado(registroRaw);
  const validado = clienteConfirmoPreview(registroRaw);
  const docsListos = documentosFiscalesCompletos(registroRaw, catsCliente);
  const vencido = periodoVencidoSinPago(registroRaw);

  // Ver el banner/previo en Declaraciones marca el paso (también aplica en Inicio).
  useMarcarPrevioVistoAlVerBanner(
    cliente.id,
    periodoVista,
    registroRaw,
    hayPreview && !validado
  );

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

  const flujo = useMemo(
    () => getFlujoCumplimiento(registroRaw),
    [registroRaw]
  );
  const plazoSatVencido = useMemo(() => {
    if (todosPagosValidados(registro, catsCliente)) return false;
    if (flujo === "completado" || flujo === "pago") return false;
    const d = fechaLimiteSATConOverride(
      cliente.rfc,
      periodoVista,
      registroRaw?.fechaLimiteDeclaracion
    );
    return limiteVencido(isoFechaLocal(d));
  }, [registro, catsCliente, flujo, cliente.rfc, periodoVista, registroRaw]);
  const accionPortal = useMemo(() => {
    if (
      registro &&
      validado &&
      todosPagosValidados(registro, catsCliente)
    ) {
      return null;
    }
    const base = getAccionCumplimientoPortal(
      flujo,
      periodoVista,
      registroRaw,
      catsExt.length > 0,
      plazoSatVencido
    );
    if (!base?.cta || !base.anchor) return null;
    const urgente =
      base.tono === "warn" &&
      (plazoSatVencido ||
        (flujo === "declaraciones" &&
          categoriasVencidasSinPago(registroRaw ?? undefined).length > 0));
    return { ...base, urgente };
  }, [
    validado,
    registro,
    catsCliente,
    flujo,
    periodoVista,
    registroRaw,
    catsExt.length,
    plazoSatVencido,
  ]);

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

  useEffect(() => {
    let timer: number | undefined;
    const irAHash = () => {
      if (window.location.hash !== "#comprobante") return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document
          .getElementById("comprobante")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    };
    irAHash();
    window.addEventListener("hashchange", irAHash);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", irAHash);
    };
  }, []);

  if (!datosListos) {
    return (
      <div className={portalPage}>
        <PortalPageHeader title="Declaraciones" subtitle="Cargando…" />
        <PortalSection>
          <p className="text-sm font-bold text-slate-400 text-center py-8">Cargando…</p>
        </PortalSection>
      </div>
    );
  }

  if (catsCliente.length === 0) {
    const esAnual = modoPortalCliente(cliente) === "asalariado_anual";
    return (
      <div className={portalPage}>
        <PortalPageHeader
          title={esAnual ? "Declaración anual" : "Declaraciones"}
          subtitle={esAnual ? "Sueldos y salarios" : "Sin categorías activas"}
        />
        <PortalSection>
          {esAnual ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm font-bold text-slate-700">
                Tu portal está enfocado en el Visor fiscal de CFDI.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                En cumplimiento mensual no aplica; aquí verás tu declaración anual cuando el
                despacho la publique. Mientras tanto, consulta ingresos y gastos en el Visor fiscal.
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-500 text-center py-4">
              Tu expediente no tiene categorías de impuestos configuradas. Contacta a tu contador.
            </p>
          )}
        </PortalSection>
        {esAnual ? null : <HistorialImpuestosPanel cliente={cliente} />}
      </div>
    );
  }

  return (
    <div className={portalPage}>
      <PortalPageHeader
        title="Declaraciones"
        subtitle={
          esPeriodoVigente
            ? periodoLabel(periodoVista)
            : `${periodoLabel(periodoVista)} · periodo anterior`
        }
        actions={
          <div className="flex items-center gap-1.5">
            <PortalInfoBoton
              title="Cumplimiento anual"
              size={15}
              className="h-10 w-8"
            >
              El año {periodoVista.anio} es el periodo de tus declaraciones. Cada
              mes muestra si ya quedó presentado y pagado. El icono de descarga
              arma un PDF de {periodoVista.anio}: cumplimiento anual o impuestos
              pagados.
            </PortalInfoBoton>
            <BotonExportarCumplimientoAnual cliente={cliente} />
            {!esPeriodoVigente ? (
              <button
                type="button"
                onClick={irAPeriodoFiscalVigente}
                className="px-4 py-2 rounded-xl text-[15px] font-semibold bg-[var(--portal-navy)] text-white hover:bg-[var(--portal-navy-hover)]"
              >
                Ir al mes actual
              </button>
            ) : null}
          </div>
        }
      />

      {(plazoSatVencido || vencido) && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-[13px] font-semibold text-red-800 leading-snug">
            {vencido
              ? "El plazo de pago ya pasó. Si ya cubriste, sube tu comprobante; si no, tu contador publicará la línea extemporánea."
              : "El plazo de declaración ya pasó. Tu despacho está al tanto. Si ya pagaste, súbenos el comprobante."}
          </p>
        </div>
      )}

      <DeclaracionesTimelineMeses cliente={cliente} plazoSatVencido={plazoSatVencido} />

      <PortalCumplimientoBanner
        periodo={periodoVista}
        registro={registroRaw}
        catsCliente={catsCliente}
        hayExtemporaneo={catsExt.length > 0}
        clienteId={cliente.id}
        plazoSatVencido={plazoSatVencido}
      />

      <FlujoCumplimientoTimeline cliente={cliente} periodo={periodoVista} />

      <div id="comprobante" className="scroll-mt-24">
        <PortalSection title="Subir comprobante de pago">
          <p className="text-[13px] text-slate-500 leading-snug mb-4">
            Cuando pagues al SAT, IMSS o tu estado, sube aquí el acuse (foto o PDF).
            No hace falta esperar a que publiquemos la declaración.
          </p>
          <div className="space-y-4">
            {catsCliente.map((cat) => (
              <ComprobantePagoCategoria
                key={cat}
                clienteId={cliente.id}
                periodo={periodoVista}
                categoria={cat}
                variante={
                  cat === "imss" ? "emerald" : cat === "estatales" ? "violet" : "blue"
                }
              />
            ))}
          </div>
        </PortalSection>
      </div>

      <PortalCierreIngresosGastos cliente={cliente} />

      {validado && todosPagosValidados(registro, catsCliente) && (
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4">
          <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-semibold text-slate-900 leading-tight">
              Estás al corriente
            </p>
            <p className="text-[13px] text-slate-500 leading-snug mt-0.5">
              Tus impuestos del periodo están pagados y confirmados por tu contador.
            </p>
          </div>
        </div>
      )}

      {!hayPreview && catsExt.length === 0 && (
        <PortalSection>
          <p className="text-sm font-bold text-slate-500 text-center py-4 leading-relaxed">
            Tu contador aún no ha publicado el previo de impuestos para {periodoLabel(periodoVista)}.
          </p>
        </PortalSection>
      )}

      {hayPreview && registro && catsEnPreview.length > 0 && !validado && (
        <div id="previo-validacion" className="scroll-mt-24">
          <PortalSection title="Previo de impuestos" collapsible>
            <PrevioValidacionCategorias
              cliente={cliente}
              periodo={periodoVista}
              registro={registro}
              visto={false}
            />
          </PortalSection>
        </div>
      )}

      {hayPreview && registro && catsEnPreview.length > 0 && validado && (
        <div id="previo-validacion" className="scroll-mt-24">
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
              {debeMostrarAlertaLimite(registroRaw) && (
                <div className="rounded-xl bg-[var(--portal-navy-soft)] border border-[var(--portal-navy-border)] px-4 py-2.5">
                  <p className="text-[10px] font-bold text-[var(--portal-navy)] leading-snug">
                    <span className="font-black uppercase tracking-widest text-[var(--portal-navy)]">
                      Recordatorio ·{" "}
                    </span>
                    Fecha límite en {DIAS_RECORDATORIO} días o menos.
                  </p>
                </div>
              )}
              {catsValidadas.map((cat) => (
                <BarraCategoriaPago key={cat} registro={registro} categoria={cat} />
              ))}
              <PrevioValidacionCategorias
                cliente={cliente}
                periodo={periodoVista}
                registro={registro}
                visto
                soloDuda
              />
            </div>
          </PortalSection>
        </div>
      )}

      {catsExt.length > 0 && registro && (
        <div id="pago-extemporaneo" className="scroll-mt-24">
          <PortalSection title="Pago extemporáneo" collapsible>
          <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
            Nueva declaración y línea de captura tras vencer el plazo. No requiere validar importes;
            realiza el pago y sube tu comprobante cuando corresponda.
          </p>
          <div className="space-y-4">
            {catsExt.map((cat) => {
              const linea = lineaExtemporaneaVigente(registro, cat);
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
        </div>
      )}

      {(validado ||
        docsListos ||
        categoriaTieneAlgunDocumento(registro, "federales") ||
        categoriaTieneAlgunDocumento(registro, "imss") ||
        categoriaTieneAlgunDocumento(registro, "estatales")) &&
        registro && (
        <ImpuestosPeriodoDocumentos
          cliente={cliente}
          registro={registro}
          periodo={periodoVista}
        />
      )}

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

      {accionPortal?.cta && accionPortal.anchor && (
        <PortalCtaFijaCumplimiento
          cta={accionPortal.cta}
          anchor={accionPortal.anchor}
          tono={accionPortal.tono}
          urgente={accionPortal.urgente}
        />
      )}
    </div>
  );
}

const CAT_PILL_LABEL: Record<CategoriaId, string> = {
  federales: "Federal",
  imss: "IMSS",
  estatales: "Estatal",
};

function ImpuestosPeriodoDocumentos({
  cliente,
  registro,
  periodo,
}: {
  cliente: Cliente;
  registro: ReturnType<typeof asegurarBloques>;
  periodo: Periodo;
}) {
  const esMovil = usePortalEsMovil();
  const fedVis = categoriaVisibleParaCliente(cliente, registro, "federales");
  const imssVis = categoriaVisibleParaCliente(cliente, registro, "imss");
  const estVis = categoriaVisibleParaCliente(cliente, registro, "estatales");

  const visibles = useMemo(() => {
    const out: CategoriaId[] = [];
    if (fedVis) out.push("federales");
    if (imssVis) out.push("imss");
    if (estVis) out.push("estatales");
    return out;
  }, [fedVis, imssVis, estVis]);

  const [catActiva, setCatActiva] = useState<CategoriaId>(() => visibles[0] ?? "federales");

  useEffect(() => {
    if (!visibles.includes(catActiva) && visibles[0]) {
      setCatActiva(visibles[0]);
    }
  }, [visibles, catActiva]);

  const nVisibles = visibles.length;
  const gridCols =
    nVisibles === 1
      ? "grid-cols-1"
      : nVisibles === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  const seccionFederales = (
            <section className="rounded-[1.75rem] border border-[var(--portal-navy-border)] bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
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
                  registro.federales.lineasCaptura.map((l) => {
                    const desglose =
                      l.conceptos && l.conceptos.length > 0
                        ? l.conceptos
                            .map(
                              (c) =>
                                `${c.etiqueta} ${formatMontoImpuesto(c.monto)}`
                            )
                            .join(" · ")
                        : null;
                    return (
                      <div key={l.id} className="space-y-1.5">
                        {desglose && (
                          <p className="text-[10px] font-bold text-slate-500 px-0.5 leading-snug">
                            {desglose}
                          </p>
                        )}
                        {l.referencia ? (
                          <LineaCapturaSatCopiar
                            referencia={l.referencia}
                            montoLabel={
                              l.monto > 0
                                ? `${formatMontoImpuesto(l.monto)} · vence ${formatFechaLimiteImpuestoCorta(l.fechaLimite)}`
                                : undefined
                            }
                          />
                        ) : null}
                        <ItemDocumentoPortal
                          documento={l.documento}
                          label="Línea de captura"
                          hint={`${formatMontoImpuesto(l.monto)} · vence ${formatFechaLimiteImpuestoCorta(l.fechaLimite)}`}
                          pendiente="Línea de captura pendiente"
                          variante="blue"
                        />
                      </div>
                    );
                  })
                )}
              </div>
              {categoriaTieneAlgunDocumento(registro, "federales") && (
                <ComprobantePagoCategoria
                  clienteId={cliente.id}
                  periodo={periodo}
                  categoria="federales"
                  variante="blue"
                />
              )}
            </section>
  );

  const seccionImss = (
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
                  periodo={periodo}
                  categoria="imss"
                  variante="emerald"
                />
              )}
            </section>
  );

  const seccionEstatales = (
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
                  periodo={periodo}
                  categoria="estatales"
                  variante="violet"
                />
              )}
            </section>
  );

  const paneles = {
    ...(fedVis ? { federales: seccionFederales } : {}),
    ...(imssVis ? { imss: seccionImss } : {}),
    ...(estVis ? { estatales: seccionEstatales } : {}),
  } as Record<CategoriaId, ReactNode>;

  return (
    <div id="documentos-periodo" className="scroll-mt-24 space-y-6">
      <PortalSection title="Impuestos del periodo · documentos" collapsible>
        {esMovil && nVisibles > 1 ? (
          <PillPaginas
            acento="portal"
            scrollable
            value={catActiva}
            onChange={setCatActiva}
            opciones={visibles.map((cat) => ({
              value: cat,
              label: CAT_PILL_LABEL[cat],
            }))}
            paneles={paneles}
          />
        ) : (
          <div className={`grid gap-4 ${gridCols}`}>
            {fedVis ? seccionFederales : null}
            {imssVis ? seccionImss : null}
            {estVis ? seccionEstatales : null}
          </div>
        )}
      </PortalSection>
    </div>
  );
}

type ColorCat = "blue" | "emerald" | "violet";

const COLOR_LABEL_CAT: Record<ColorCat, string> = {
  blue: "text-[var(--portal-navy)]",
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
        <p
          className={`text-[10px] font-bold mt-1 ${claseUrgenciaLimiteCaptura(
            fechaLimite ? diasHastaLimite(fechaLimite) : null
          )}`}
        >
          Vence {formatFechaLimiteImpuestoCorta(fechaLimite)}
        </p>
      )}
    </header>
  );
}
