"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type Cliente,
  type Periodo,
  clienteActivoEnPeriodo,
  esMismoPeriodo,
  esPeriodoFuturo,
  periodoKey,
  periodoLabel,
} from "@/lib/clientes";
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
  categoriasConPagoEnPreview,
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
import PortalMesesDeclaracionesNav from "@/components/portal/PortalMesesDeclaracionesNav";
import BotonExportarCumplimientoAnual from "@/components/portal/BotonExportarCumplimientoAnual";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import PrevioValidacionCategorias from "@/components/portal/PrevioValidacionCategorias";
import {
  getAccionCumplimientoPortal,
  PortalCtaFijaCumplimiento,
} from "@/components/portal/PortalCumplimientoBanner";
import PortalCierreIngresosGastos from "@/components/portal/PortalCierreIngresosGastos";
import LineaCapturaSatCopiar from "@/components/portal/LineaCapturaSatCopiar";
import VelocimetroVencimiento from "@/components/portal/VelocimetroVencimiento";
import { portalCard, portalPage } from "@/components/portal/portal-ui";
import { descargarIcs } from "@/lib/portal/ics";
import {
  hrefDeclaraciones,
  periodoCorrido,
  periodoDesdeSearchParams,
} from "@/lib/portal/href-declaraciones";
import { impuestosListosPorPagar } from "@/lib/portal/pendientes-impuestos-inicio";
import { categoriasVencidasSinPago, lineaExtemporaneaVigente } from "@/lib/cumplimiento-categorias";
import { fechaLimiteSATConOverride, isoFechaLocal } from "@/lib/portal/fechas-fiscales";
import {
  limiteVencido,
  parseFechaLimite,
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
    cumplimiento,
    irAPeriodo,
  } = useClientes();
  const {
    periodoVista,
    periodoFiscalVigente,
    esPeriodoVigente,
  } = usePeriodoFiscal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const impuestosListos = useMemo(
    () =>
      impuestosListosPorPagar({
        lista: cumplimiento,
        clienteId: cliente.id,
        periodoFiscal: periodoFiscalVigente,
      }),
    [cumplimiento, cliente.id, periodoFiscalVigente]
  );
  const mesUrlPrev = useRef<string | null>(null);
  const slideDirRef = useRef<"next" | "prev">("next");
  const periodoKeyPrev = useRef<number | null>(null);
  const skipSlideInicial = useRef(true);

  useEffect(() => {
    const fromUrl = periodoDesdeSearchParams(searchParams);
    const destino =
      fromUrl ?? impuestosListos?.periodo ?? periodoFiscalVigente;
    irAPeriodo(destino);
    const clave = fromUrl ? `${fromUrl.anio}-${fromUrl.mes}` : null;
    if (
      fromUrl &&
      mesUrlPrev.current &&
      mesUrlPrev.current !== clave &&
      window.location.hash === "#documentos-periodo"
    ) {
      window.setTimeout(() => {
        document
          .getElementById("documentos-periodo")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
    mesUrlPrev.current = clave;
    if (
      !fromUrl &&
      impuestosListos &&
      !esMismoPeriodo(impuestosListos.periodo, periodoFiscalVigente)
    ) {
      router.replace(hrefDeclaraciones(impuestosListos.periodo), {
        scroll: false,
      });
    }
  }, [
    searchParams,
    impuestosListos?.periodo.mes,
    impuestosListos?.periodo.anio,
    periodoFiscalVigente,
    irAPeriodo,
    router,
  ]);
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
      const hash = window.location.hash.replace(/^#/, "");
      if (hash !== "comprobante" && hash !== "documentos-periodo") return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document
          .getElementById(hash)
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

  const mesPrev = periodoCorrido(periodoVista, -1);
  const mesNext = periodoCorrido(periodoVista, 1);
  const puedePrev = clienteActivoEnPeriodo(cliente, mesPrev);
  const puedeNext = !esPeriodoFuturo(mesNext, periodoFiscalVigente);
  const claveVista = periodoKey(periodoVista);
  if (periodoKeyPrev.current != null && periodoKeyPrev.current !== claveVista) {
    skipSlideInicial.current = false;
    slideDirRef.current = claveVista > periodoKeyPrev.current ? "next" : "prev";
  }
  periodoKeyPrev.current = claveVista;

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8 w-full pt-2 sm:pt-3">
      <PortalPageHeader
        title={periodoLabel(periodoVista)}
        titleLeading={
          <FlechaMes
            direccion="prev"
            disabled={!puedePrev}
            href={hrefDeclaraciones(mesPrev, null)}
          />
        }
        titleTrailing={
          <FlechaMes
            direccion="next"
            disabled={!puedeNext}
            href={hrefDeclaraciones(mesNext, null)}
          />
        }
        actions={<BotonExportarCumplimientoAnual cliente={cliente} />}
      />

      <div className="overflow-x-hidden">
        <div
          key={claveVista}
          className={`space-y-4 ${
            skipSlideInicial.current
              ? ""
              : slideDirRef.current === "next"
                ? "rdc-mes-slide-next"
                : "rdc-mes-slide-prev"
          }`}
        >
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-3.5">
          <FlujoCumplimientoTimeline
            cliente={cliente}
            periodo={periodoVista}
            variante="compacto"
            esquemaVerdeGris
            explicarAlTocar
          />
        </div>
        <PortalMesesDeclaracionesNav
          cliente={cliente}
          periodoVista={periodoVista}
          periodoFiscal={periodoFiscalVigente}
        />
        {!esPeriodoVigente ? (
          <div className="px-1 flex items-center justify-between gap-3">
            <p className="text-[13px] text-slate-500">
              Estás viendo un mes anterior.
            </p>
            <Link
              href={hrefDeclaraciones(periodoFiscalVigente, null)}
              className="shrink-0 text-[13px] font-semibold text-[var(--portal-navy)]"
            >
              Ir a {periodoLabel(periodoFiscalVigente)}
            </Link>
          </div>
        ) : null}
      </div>

      {(plazoSatVencido || vencido) && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-[13px] font-semibold text-red-800 leading-snug">
            {vencido
              ? "El plazo de pago ya pasó. Si ya cubriste, sube tu comprobante; si no, tu contador publicará la línea extemporánea."
              : "El plazo de declaración ya pasó. Tu despacho está al tanto. Si ya pagaste, súbenos el comprobante."}
          </p>
        </div>
      )}

      {registro &&
      (docsListos ||
        categoriaTieneAlgunDocumento(registro, "federales") ||
        categoriaTieneAlgunDocumento(registro, "imss") ||
        categoriaTieneAlgunDocumento(registro, "estatales") ||
        registro.federales.lineasCaptura.some((l) => !!l.referencia)) ? (
        <ImpuestosPeriodoDocumentos
          cliente={cliente}
          registro={registro}
          periodo={periodoVista}
        />
      ) : !hayPreview && catsExt.length === 0 ? (
        <section className={portalCard}>
          <p className="text-[15px] text-slate-500 leading-relaxed">
            Tu contador está en ello. Te avisamos cuando tu declaración y línea
            de captura estén listas.
          </p>
        </section>
      ) : null}

      {hayPreview && registro ? (
        <div id="previo-validacion" className="scroll-mt-24">
          <PortalSection
            title="Resumen del mes"
            collapsible
            headerExtra={
              <span className="text-sm font-semibold text-slate-700 tabular-nums">
                {formatMontoImpuesto(totalEnPreview)}
              </span>
            }
          >
            <div className="space-y-3">
              {validado && debeMostrarAlertaLimite(registroRaw) && (
                <div className="rounded-xl bg-[var(--portal-navy-soft)] border border-[var(--portal-navy-border)] px-4 py-2.5">
                  <p className="text-[13px] font-semibold text-[var(--portal-navy)] leading-snug">
                    Fecha límite en {DIAS_RECORDATORIO} días o menos.
                  </p>
                </div>
              )}
              <PrevioValidacionCategorias
                cliente={cliente}
                periodo={periodoVista}
                registro={registro}
                visto={validado}
              />
              {validado
                ? catsValidadas.map((cat) => (
                    <BarraCategoriaPago
                      key={cat}
                      registro={registro}
                      categoria={cat}
                    />
                  ))
                : null}
            </div>
          </PortalSection>
        </div>
      ) : null}

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

      <PortalCierreIngresosGastos cliente={cliente} />

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
      </div>

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

function FlechaMes({
  direccion,
  disabled,
  href,
}: {
  direccion: "prev" | "next";
  disabled: boolean;
  href: string;
}) {
  const label = direccion === "prev" ? "Mes anterior" : "Mes siguiente";
  const clase =
    `inline-flex h-10 w-6 shrink-0 items-center justify-center rounded-full text-[var(--portal-navy)] ${
      direccion === "prev" ? "-ml-1" : "-mr-0.5"
    }`;
  const svg = (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direccion === "prev" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
  if (disabled) {
    return (
      <span className={`${clase} opacity-25`} aria-hidden>
        {svg}
      </span>
    );
  }
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={label}
      className={`${clase} hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200`}
    >
      {svg}
    </Link>
  );
}

function ImpuestosPeriodoDocumentos({
  cliente,
  registro,
  periodo,
}: {
  cliente: Cliente;
  registro: ReturnType<typeof asegurarBloques>;
  periodo: Periodo;
}) {
  const fedVis = categoriaVisibleParaCliente(cliente, registro, "federales");
  const imssVis = categoriaVisibleParaCliente(cliente, registro, "imss");
  const estVis = categoriaVisibleParaCliente(cliente, registro, "estatales");

  const lineaFed = registro.federales.lineasCaptura[0];
  const hayFed =
    fedVis &&
    (!!registro.federales.declaracion ||
      registro.federales.lineasCaptura.some(
        (l) => !!l.documento || !!l.referencia
      ));
  const fechaVence =
    lineaFed?.fechaLimite || registro.fechaLimite || "";
  const montoFed =
    (lineaFed?.monto && lineaFed.monto > 0
      ? lineaFed.monto
      : getSubtotalCategoria(registro, "federales")) || 0;
  const pagadoFed = pagoValidadoCategoria(registro, "federales");

  const catsPago: { cat: CategoriaId; variante: "blue" | "emerald" | "violet" }[] =
    [];
  if (hayFed) {
    catsPago.push({ cat: "federales", variante: "blue" });
  }
  if (imssVis && categoriaTieneAlgunDocumento(registro, "imss")) {
    catsPago.push({ cat: "imss", variante: "emerald" });
  }
  if (estVis && categoriaTieneAlgunDocumento(registro, "estatales")) {
    catsPago.push({ cat: "estatales", variante: "violet" });
  }

  const agregarAlCalendario = () => {
    const fecha = parseFechaLimite(fechaVence);
    if (!fecha) return;
    descargarIcs(
      [
        {
          tipo: "sat",
          etiqueta: `Impuestos · ${periodoLabel(periodo)}`,
          fecha,
          periodo,
          descripcion:
            montoFed > 0
              ? `Pagar ${formatMontoImpuesto(montoFed)} de impuestos de ${periodoLabel(periodo)}.`
              : `Fecha límite de impuestos de ${periodoLabel(periodo)}.`,
        },
      ],
      `impuestos-${periodo.anio}-${String(periodo.mes + 1).padStart(2, "0")}.ics`,
      cliente.razonSocial
    );
  };

  return (
    <div id="documentos-periodo" className="scroll-mt-24">
      <PortalSection title="Documentos del periodo">
        <div className="space-y-5">
          {hayFed ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold tracking-wide text-slate-500">
                    IMPUESTOS
                  </p>
                  <p className="mt-0.5 text-[28px] font-bold text-slate-900 tabular-nums leading-none">
                    {formatMontoImpuesto(montoFed)}
                  </p>
                  {pagadoFed ? (
                    <p className="mt-1 text-[13px] font-semibold text-emerald-700">
                      Pagado
                    </p>
                  ) : null}
                </div>
                {fechaVence ? (
                  <VelocimetroVencimiento
                    fechaIso={fechaVence}
                    pagado={pagadoFed}
                    onAgregarCalendario={
                      pagadoFed ? undefined : agregarAlCalendario
                    }
                  />
                ) : null}
              </div>

              {registro.federales.lineasCaptura.map((l) => {
                const desglose =
                  l.conceptos && l.conceptos.length > 0
                    ? l.conceptos
                        .map(
                          (c) => `${c.etiqueta} ${formatMontoImpuesto(c.monto)}`
                        )
                        .join(" · ")
                    : null;
                return (
                  <div key={l.id} className="space-y-2">
                    {desglose ? (
                      <p className="text-[13px] text-slate-500 leading-snug">
                        {desglose}
                      </p>
                    ) : null}
                    {l.referencia ? (
                      <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] px-3 py-3 sm:px-4">
                        <p className="text-[13px] text-slate-500">
                          Línea de captura
                        </p>
                        <div className="mt-1.5">
                          <LineaCapturaSatCopiar
                            referencia={l.referencia}
                            compacta
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}

              <div className="space-y-2.5">
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
                      label="Línea de captura"
                      pendiente="Línea de captura pendiente"
                      variante="blue"
                    />
                  ))
                )}
                <ItemDocumentoPortal
                  documento={registro.federales.declaracion}
                  label="Declaración"
                  pendiente="Declaración pendiente"
                  variante="blue"
                />
              </div>
            </>
          ) : null}

          {imssVis && categoriaTieneAlgunDocumento(registro, "imss") ? (
            <div className="space-y-2.5 pt-1">
              <p className="text-[13px] font-semibold tracking-wide text-slate-500">
                IMSS
              </p>
              <ItemDocumentoPortal
                documento={registro.imss.sipare}
                label="SIPARE · Línea de captura"
                pendiente="SIPARE pendiente"
                variante="emerald"
              />
              {registro.imss.ema.map((doc, i) => (
                <ItemDocumentoPortal
                  key={doc.id}
                  documento={doc}
                  label={
                    registro.imss.ema.length > 1 ? `EMA · PDF ${i + 1}` : "EMA"
                  }
                  hint="Emisión Mensual Anticipada"
                  variante="emerald"
                />
              ))}
              {registro.imss.eba.map((doc, i) => (
                <ItemDocumentoPortal
                  key={doc.id}
                  documento={doc}
                  label={
                    registro.imss.eba.length > 1 ? `EBA · PDF ${i + 1}` : "EBA"
                  }
                  hint="Emisión Bimestral Anticipada"
                  variante="emerald"
                />
              ))}
            </div>
          ) : null}

          {estVis && categoriaTieneAlgunDocumento(registro, "estatales") ? (
            <div className="space-y-2.5 pt-1">
              <p className="text-[13px] font-semibold tracking-wide text-slate-500">
                Estatal
              </p>
              {registro.estatales.nominas.map((doc, i) => (
                <ItemDocumentoPortal
                  key={doc.id}
                  documento={doc}
                  label={
                    registro.estatales.nominas.length > 1
                      ? `Nómina · archivo ${i + 1}`
                      : "Nómina"
                  }
                  variante="violet"
                />
              ))}
              {registro.estatales.lineasCaptura.map((l) => (
                <ItemDocumentoPortal
                  key={l.id}
                  documento={l.documento}
                  label={l.etiqueta || "Línea de captura"}
                  hint={`${formatMontoImpuesto(l.monto)} · vence ${formatFechaLimiteImpuestoCorta(l.fechaLimite)}`}
                  pendiente="Línea de captura pendiente"
                  variante="violet"
                />
              ))}
            </div>
          ) : null}

          {catsPago.length > 0 ? (
            <div id="comprobante" className="scroll-mt-24 space-y-4 pt-4 border-t border-slate-100">
              {catsPago.map((item, i) => (
                <ComprobantePagoCategoria
                  key={item.cat}
                  clienteId={cliente.id}
                  periodo={periodo}
                  categoria={item.cat}
                  variante={item.variante}
                  titulo={i === 0 ? "¿Ya pagaste?" : undefined}
                  detalle={
                    i === 0
                      ? "Sube el acuse (foto o PDF)."
                      : undefined
                  }
                  ocultarCategoria={catsPago.length === 1 || i === 0}
                />
              ))}
            </div>
          ) : null}
        </div>
      </PortalSection>
    </div>
  );
}
