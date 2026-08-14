"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  getPeriodoHoy,
  getPeriodoFiscalVigente,
  periodoLabel,
  getCompromisoMes,
  getSaldoMes,
  estaPagado,
  getTotalPendiente,
  getTotalExtraPorCobrar,
  getDeudaNetaHonorarios,
  contarMesesImpagos,
  calcularEstado,
} from "@/lib/clientes";
import { categoriasVencidasSinPago } from "@/lib/cumplimiento-categorias";
import {
  getCumplimientoPeriodo,
  getFlujoCumplimiento,
  esSinPagoImpuestos,
  getSaldoFavorPeriodo,
  FLUJO_CUMPLIMIENTO_LABELS,
  formatFechaLimiteImpuesto,
  previewPublicado,
  clienteConfirmoPreview,
  type FlujoCumplimiento,
} from "@/lib/cumplimiento";
import { regimenPorClave } from "@/lib/regimenes-fiscales";
import { fechaLimitePago, getFechaLimiteDate } from "@/lib/correo";
import { useClientes } from "@/context/ClientesContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import { useMarcarPrevioVistoAlVerBanner } from "@/hooks/useMarcarPrevioVistoAlVerBanner";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSituacionSatStrip from "@/components/portal/PortalSituacionSatStrip";
import PortalSection from "@/components/portal/PortalSection";
import PortalStepperInicio from "@/components/portal/PortalStepperInicio";
import Fiscalino from "@/components/Fiscalino";
import PortalAccionesRapidas from "@/components/portal/PortalAccionesRapidas";
import PortalAgendaFiscal from "@/components/portal/PortalAgendaFiscal";
import PortalDocumentosRecientes from "@/components/portal/PortalDocumentosRecientes";
import PortalSiguientePaso from "@/components/portal/PortalSiguientePaso";
import {
  ordenarPendientesInicio,
  type AccionPortal,
} from "@/lib/portal/siguiente-paso";
import {
  avisoMesesAnterioresPendientesInicio,
  bannerImpuestosPendientesInicio,
} from "@/lib/portal/pendientes-impuestos-inicio";
import { categoriasHabilitadasCliente } from "@/lib/config-cumplimiento-cliente";
import {
  eventosFiscalesParaCliente,
  type EventoFiscal,
} from "@/lib/portal/fechas-fiscales";
import { portalPage, fmtMxn } from "@/components/portal/portal-ui";

type Props = { cliente: Cliente };

type FlujoLabel = { etiqueta: string; descripcion: string; tono: "ok" | "warn" | "bad" | "neutral" };

const FLUJO_LABELS: Record<FlujoCumplimiento, FlujoLabel> = {
  por_trabajar: {
    etiqueta: FLUJO_CUMPLIMIENTO_LABELS.por_trabajar,
    descripcion: "Tu contador está preparando los documentos de este periodo.",
    tono: "neutral",
  },
  iniciando_contabilidad: {
    etiqueta: FLUJO_CUMPLIMIENTO_LABELS.iniciando_contabilidad,
    descripcion: "Estamos preparando tu contabilidad del periodo.",
    tono: "neutral",
  },
  preliminar: {
    etiqueta: FLUJO_CUMPLIMIENTO_LABELS.preliminar,
    descripcion: "Tu preliminar está listo. Al verlo en Inicio queda registrado.",
    tono: "warn",
  },
  aceptacion: {
    etiqueta: FLUJO_CUMPLIMIENTO_LABELS.aceptacion,
    descripcion: "Ya revisaste el preliminar. Estamos preparando tus declaraciones.",
    tono: "neutral",
  },
  declaraciones: {
    etiqueta: FLUJO_CUMPLIMIENTO_LABELS.declaraciones,
    descripcion: "Tus declaraciones están listas. Falta cargar el comprobante de pago.",
    tono: "warn",
  },
  pago: {
    etiqueta: FLUJO_CUMPLIMIENTO_LABELS.pago,
    descripcion: "Tu pago de impuestos fue recibido. Estamos validándolo.",
    tono: "neutral",
  },
  completado: {
    etiqueta: FLUJO_CUMPLIMIENTO_LABELS.completado,
    descripcion: "Tu periodo fiscal está completo.",
    tono: "ok",
  },
};

function diasEntre(de: Date, hasta: Date): number {
  const a = new Date(de.getFullYear(), de.getMonth(), de.getDate());
  const b = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtDiaMes(d: Date): string {
  return `${d.getDate()} de ${MESES_NOM[d.getMonth()].toLowerCase()}`;
}

export default function InicioPortalView({ cliente }: Props) {
  const { cumplimiento } = useClientes();
  const { perfil } = usePortalPerfil();
  const hoy = useMemo(() => new Date(), []);
  const periodoHoy: Periodo = useMemo(() => getPeriodoHoy(), []);
  const periodoFiscal: Periodo = useMemo(
    () => getPeriodoFiscalVigente(hoy),
    [hoy]
  );

  const registroFiscal = useMemo(
    () => getCumplimientoPeriodo(cumplimiento, cliente.id, periodoFiscal),
    [cumplimiento, cliente.id, periodoFiscal]
  );
  const flujo = useMemo(
    () => getFlujoCumplimiento(registroFiscal),
    [registroFiscal]
  );
  const sinPagoImpuestos = esSinPagoImpuestos(registroFiscal);

  // Ver el banner/card de preliminar en Inicio marca el paso automáticamente.
  useMarcarPrevioVistoAlVerBanner(
    cliente.id,
    periodoFiscal,
    registroFiscal,
    flujo === "preliminar" ||
      (previewPublicado(registroFiscal) &&
        !clienteConfirmoPreview(registroFiscal) &&
        !sinPagoImpuestos)
  );
  const saldoFavor = useMemo(
    () => getSaldoFavorPeriodo(registroFiscal),
    [registroFiscal]
  );
  const regimen = useMemo(
    () => regimenPorClave(cliente.regimenFiscalClave),
    [cliente.regimenFiscalClave]
  );

  const flujoInfo = FLUJO_LABELS[flujo];

  const pagadoMes = estaPagado(cliente, periodoHoy);
  const saldoMes = getSaldoMes(cliente, periodoHoy);
  const compromisoMes = getCompromisoMes(cliente, periodoHoy);
  const pendienteHonorarios = getTotalPendiente(cliente, periodoHoy);
  const totalExtraPorCobrar = getTotalExtraPorCobrar(cliente);
  const deudaNeta = getDeudaNetaHonorarios(cliente, periodoHoy);
  const estado = calcularEstado(cliente, periodoHoy);
  const fechaLimite = fechaLimitePago(cliente, periodoHoy);
  const fechaLimiteDate = getFechaLimiteDate(cliente, periodoHoy);
  const diasAlVencimiento = diasEntre(hoy, fechaLimiteDate);
  const honorariosVencidos = !pagadoMes && diasAlVencimiento < 0;

  // Umbral de urgencia (anti-drama): el rojo se reserva para deuda real.
  // Solo es "urgente" si los honorarios están vencidos o hay 2+ meses sin
  // cubrir; un saldo del mes en curso dentro de su ventana es tono suave.
  const mesesImpagos = useMemo(
    () => contarMesesImpagos(cliente, periodoHoy),
    [cliente, periodoHoy]
  );
  const honorariosUrgente = honorariosVencidos || mesesImpagos >= 2;
  const impuestosVencidos = useMemo(
    () => categoriasVencidasSinPago(registroFiscal).length > 0,
    [registroFiscal]
  );

  // Acciones accionables del inicio (consolidan el antiguo banner + la
  // tarjeta de "Pendientes contigo" en una sola tira amigable con CTA).
  const accionesInicio = useMemo<AccionInicio[]>(() => {
    const out: AccionInicio[] = [];
    if (deudaNeta > 0) {
      const soloExtra =
        pendienteHonorarios <= 0 && totalExtraPorCobrar > 0;
      const titulo = soloExtra
        ? "Tienes trabajo adicional por pagar"
        : totalExtraPorCobrar > 0
          ? "Tienes saldo pendiente con nosotros"
          : "Tienes un honorario pendiente";
      const desglose =
        pendienteHonorarios > 0 && totalExtraPorCobrar > 0
          ? `${fmtMxn(pendienteHonorarios)} honorarios + ${fmtMxn(totalExtraPorCobrar)} adicional`
          : totalExtraPorCobrar > 0
            ? `${fmtMxn(totalExtraPorCobrar)} trabajo adicional`
            : undefined;
      const hrefPago =
        pendienteHonorarios > 0 && !pagadoMes
          ? "/portal/honorarios#pago"
          : totalExtraPorCobrar > 0
            ? "/portal/honorarios#trabajo-adicional"
            : "/portal/honorarios#pago";

      out.push({
        clave: "honorarios",
        etiqueta: "Honorarios",
        titulo,
        monto: deudaNeta,
        desglose,
        detalle: honorariosUrgente
          ? mesesImpagos >= 2
            ? `Llevas ${mesesImpagos} meses sin cubrir. Regularízalo aquí.`
            : `El pago de ${periodoLabel(periodoHoy)} ya venció. Puedes cubrirlo aquí en segundos.`
          : soloExtra
            ? "Págalo con transferencia o tarjeta desde Honorarios."
            : "Págalo directo desde tu portal.",
        cta: "Pagar ahora",
        href: hrefPago,
        icono: "peso",
        urgente: honorariosUrgente,
      });
    }
    if (flujo === "preliminar" && !sinPagoImpuestos) {
      out.push({
        clave: "preliminar",
        etiqueta: "Impuestos SAT",
        titulo: "Tu preliminar de impuestos está listo",
        detalle:
          "Revisa tus importes. Puedes pedir tu línea de captura o escribirle a tu contador si tienes duda del monto.",
        cta: "Ver importes",
        href: "/portal/cumplimiento",
        icono: "doc",
        urgente: false,
      });
    }
    if (flujo === "declaraciones" && !sinPagoImpuestos) {
      const montoSat = registroFiscal?.montoImpuesto ?? 0;
      const fechaLimSat = registroFiscal?.fechaLimite?.trim();
      out.push({
        clave: "declaraciones",
        etiqueta: "Impuestos SAT",
        titulo: impuestosVencidos
          ? "Falta tu comprobante de impuestos"
          : "Sube tu comprobante de pago de impuestos",
        monto: montoSat > 0 ? montoSat : undefined,
        desglose: fechaLimSat
          ? `SAT · ${formatFechaLimiteImpuesto(fechaLimSat)}`
          : undefined,
        detalle: impuestosVencidos
          ? "El plazo del SAT ya pasó. Sube tu comprobante o escríbenos — te ayudamos a ponerte al corriente."
          : "Tus declaraciones están listas. Falta subir el comprobante del pago ante el SAT.",
        cta: "Confirmar mi pago",
        href: "/portal/cumplimiento",
        icono: "upload",
        urgente: impuestosVencidos,
      });
    }

    const impuestosSinCerrar = bannerImpuestosPendientesInicio({
      registro: registroFiscal,
      flujo,
      periodoFiscal,
      rfc: cliente.rfc,
      hoy,
    });
    if (impuestosSinCerrar) {
      out.push({
        ...impuestosSinCerrar,
        icono: "doc",
      });
    }

    const mesesAnteriores = avisoMesesAnterioresPendientesInicio({
      lista: cumplimiento,
      clienteId: cliente.id,
      periodoFiscal,
      categorias: categoriasHabilitadasCliente(cliente),
    });
    if (mesesAnteriores) {
      out.push({
        ...mesesAnteriores,
        icono: "doc",
      });
    }

    return out;
  }, [
    deudaNeta,
    pendienteHonorarios,
    totalExtraPorCobrar,
    pagadoMes,
    honorariosUrgente,
    mesesImpagos,
    periodoHoy,
    flujo,
    sinPagoImpuestos,
    impuestosVencidos,
    registroFiscal,
    cliente.rfc,
    cliente.id,
    cliente,
    cumplimiento,
    periodoFiscal,
    hoy,
  ]);
  const tieneAlertaHonorarios = accionesInicio.some((a) => a.clave === "honorarios");
  const alDiaInicio = accionesInicio.length === 0;

  const pendientesInicio = useMemo(
    () => ordenarPendientesInicio(accionesInicio as AccionPortal[]),
    [accionesInicio]
  );

  // Eventos fiscales del cliente (SAT, IMSS, estatal, REPSE) para los
  // próximos meses, calculados con las reglas oficiales: sexto dígito del
  // RFC para SAT, recorrido al lunes si cae en fin de semana, y siguiente
  // día hábil para impuesto estatal (12) cuando cae en inhábil.
  const eventosFiscales = useMemo<EventoFiscal[]>(
    () => eventosFiscalesParaCliente(cliente, periodoFiscal, 6),
    [cliente, periodoFiscal]
  );

  // Si el periodo fiscal ya está completado, eliminamos el evento SAT del
  // periodo actual para no recordarle algo que ya cumplió.
  const eventosFiscalesVisibles = useMemo<EventoFiscal[]>(() => {
    if (flujo !== "completado") return eventosFiscales;
    return eventosFiscales.filter(
      (e) =>
        !(
          e.tipo === "sat" &&
          e.periodo.mes === periodoFiscal.mes &&
          e.periodo.anio === periodoFiscal.anio
        )
    );
  }, [eventosFiscales, flujo, periodoFiscal]);

  // Evento de honorarios del mes actual (si no está pagado).
  const eventoHonorarios = useMemo<EventoFiscal | null>(() => {
    if (pagadoMes) return null;
    return {
      tipo: "honorarios",
      etiqueta: `Honorarios ${MESES_NOM[periodoHoy.mes].toLowerCase()}`,
      fecha: fechaLimiteDate,
      periodo: periodoHoy,
    };
  }, [pagadoMes, fechaLimiteDate, periodoHoy]);

  // Eventos para mostrar en el calendario (con honorarios + fiscales).
  const eventosCalendario = useMemo<EventoFiscal[]>(() => {
    const out = [...eventosFiscalesVisibles];
    if (eventoHonorarios) out.push(eventoHonorarios);
    return out.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }, [eventosFiscalesVisibles, eventoHonorarios]);

  // Periodo fiscal anterior (para "última declaración presentada").
  // Si ese periodo está en estado "completado", mostramos un cierre positivo.
  const periodoAnterior: Periodo = useMemo(() => {
    if (periodoFiscal.mes === 0) {
      return { mes: 11, anio: periodoFiscal.anio - 1 };
    }
    return { mes: periodoFiscal.mes - 1, anio: periodoFiscal.anio };
  }, [periodoFiscal]);
  const registroAnterior = useMemo(
    () => getCumplimientoPeriodo(cumplimiento, cliente.id, periodoAnterior),
    [cumplimiento, cliente.id, periodoAnterior]
  );
  const flujoAnterior = useMemo(
    () => getFlujoCumplimiento(registroAnterior),
    [registroAnterior]
  );
  const ultimaDeclaracion = useMemo<{
    periodo: Periodo;
    fecha?: string;
  } | null>(() => {
    if (flujoAnterior !== "completado") return null;
    // El campo más confiable de "cuándo se cerró" es actualizadoEn.
    const f = registroAnterior?.actualizadoEn;
    return { periodo: periodoAnterior, fecha: f };
  }, [flujoAnterior, registroAnterior, periodoAnterior]);

  // Saludo: prioriza el nombre personal que el cliente puso en su perfil.
  // Si no lo capturó, usa el primer nombre/palabra de la razón social.
  // Si no hay razón social tampoco, usa la parte del correo antes del @.
  const nombrePersonal = perfil?.perfil.nombre?.trim();
  const nombreEnRazonSocial = cliente.razonSocial?.trim()
    ? cliente.razonSocial.split(/[ ,]/)[0] || cliente.razonSocial
    : "";
  const nombreDesdeCorreo = cliente.email?.includes("@")
    ? cliente.email.split("@")[0]
    : "";
  const nombreSaludo =
    (nombrePersonal && nombrePersonal.split(/[ ,]/)[0]) ||
    nombrePersonal ||
    nombreEnRazonSocial ||
    nombreDesdeCorreo ||
    "bienvenido";

  // Saludo cordial según la hora local del cliente.
  // 5–11: Buenos días, 12–18: Buenas tardes, 19–4: Buenas noches.
  const saludoHora = useMemo(() => {
    const h = hoy.getHours();
    if (h >= 5 && h < 12) return "Buenos días";
    if (h >= 12 && h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, [hoy]);

  return (
    <div className={portalPage}>
      <PortalPageHeader
        eyebrow="Inicio"
        title={`${saludoHora}, ${nombreSaludo}`}
        subtitle={
          <span>
            Resumen rápido al{" "}
            <strong className="text-[var(--portal-purple)]">{fmtDiaMes(hoy)}</strong>
          </span>
        }
      />

      {alDiaInicio ? (
        <ResumenAlDia />
      ) : (
        <PortalSiguientePaso acciones={pendientesInicio} />
      )}

      {/* Avance del cierre del periodo: stepper compacto reutilizado. */}
      <PortalStepperInicio cliente={cliente} periodo={periodoFiscal} />

      {/* Hub de accesos directos: lo más usado, arriba y a un tap. */}
      <PortalAccionesRapidas
        ocultarPagarHonorarios={tieneAlertaHonorarios}
        priorizarHonorarios={deudaNeta > 0 && !tieneAlertaHonorarios}
        montoPendiente={deudaNeta > 0 ? fmtMxn(deudaNeta) : undefined}
        flujo={flujo}
        sinPagoImpuestos={sinPagoImpuestos}
      />

      <PortalSituacionSatStrip />

      <div
        className={`grid grid-cols-1 gap-5 ${
          tieneAlertaHonorarios ? "" : "lg:grid-cols-2"
        }`}
      >
        <CardCumplimiento
          periodo={periodoFiscal}
          flujo={flujo}
          flujoInfo={flujoInfo}
          sinPagoImpuestos={sinPagoImpuestos}
          regimenLabel={regimen?.label}
        />

        {!tieneAlertaHonorarios && (
          <CardHonorarios
            periodo={periodoHoy}
            pagado={pagadoMes}
            saldoMes={saldoMes}
            compromisoMes={compromisoMes}
            pendienteTotal={pendienteHonorarios}
            fechaLimite={fechaLimite}
            diasAlVencimiento={diasAlVencimiento}
            estado={estado}
          />
        )}
      </div>

      {saldoFavor && (
        <CardSaldoFavor
          lineas={saldoFavor.lineas}
          total={saldoFavor.total}
          periodo={periodoFiscal}
        />
      )}

      {ultimaDeclaracion && (
        <CardUltimaDeclaracion
          periodo={ultimaDeclaracion.periodo}
          fecha={ultimaDeclaracion.fecha}
        />
      )}

      <PortalAgendaFiscal
        eventos={eventosCalendario}
        hoy={hoy}
        nombreCliente={nombrePersonal || cliente.razonSocial}
      />

      {/* Documentos recientes (consultivo; colapsable en móvil). */}
      <PortalDocumentosRecientes cliente={cliente} />
    </div>
  );
}

type AccionInicio = {
  clave: string;
  etiqueta?: string;
  titulo: string;
  monto?: number;
  desglose?: string;
  detalle: string;
  cta: string;
  href: string;
  icono: "peso" | "doc" | "upload";
  urgente: boolean;
};

/**
 * Mensaje positivo cuando el cliente no tiene pendientes en el inicio.
 */
function ResumenAlDia() {
  return (
    <div className="flex items-center gap-4 rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-5 py-4 sm:px-6 sm:py-5">
      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
          Estás al día
        </p>
        <p className="text-sm font-bold text-emerald-600 leading-snug mt-0.5">
          Vas al corriente con impuestos y honorarios.
          ¡Gracias por confiar en nosotros!
        </p>
      </div>
      <Fiscalino mood="confident" size={72} className="shrink-0 -my-2" />
    </div>
  );
}

// ResumenInicio multi-tarjeta reemplazado por PortalSiguientePaso (un CTA dominante).

function CardCumplimiento({
  periodo,
  flujo,
  flujoInfo,
  sinPagoImpuestos,
  regimenLabel,
}: {
  periodo: Periodo;
  flujo: FlujoCumplimiento;
  flujoInfo: FlujoLabel;
  sinPagoImpuestos: boolean;
  regimenLabel?: string;
}) {
  const acento =
    flujoInfo.tono === "ok"
      ? "text-emerald-600"
      : flujoInfo.tono === "warn"
        ? "text-amber-600"
        : flujoInfo.tono === "bad"
          ? "text-red-600"
          : "text-slate-500";

  const fondoBadge =
    flujoInfo.tono === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : flujoInfo.tono === "warn"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : flujoInfo.tono === "bad"
          ? "bg-red-50 text-red-700 border-red-100"
          : "bg-slate-50 text-slate-600 border-slate-100";

  return (
    <div className="rdc-card bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-sm p-6 sm:p-7 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Cumplimiento Hacienda
          </p>
          <p className="text-sm font-bold text-slate-700 mt-1">
            Periodo: <span className="text-[var(--portal-purple)]">{periodoLabel(periodo)}</span>
          </p>
          {regimenLabel && (
            <p className="text-[10px] font-bold text-slate-400 mt-1 truncate">
              Régimen: <span className="text-slate-600">{regimenLabel}</span>
            </p>
          )}
        </div>
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${fondoBadge}`}
        >
          {sinPagoImpuestos ? "Sin pago" : flujoInfo.etiqueta}
        </span>
      </div>

      <p className={`text-[15px] font-bold leading-snug mb-5 ${acento}`}>
        {sinPagoImpuestos
          ? "No aplica pago de impuestos en este periodo."
          : flujoInfo.descripcion}
      </p>

      <div className="mt-auto">
        <Link
          href="/portal/cumplimiento"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--portal-navy)] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[var(--portal-navy-hover)]"
        >
          Ver más
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}

function CardHonorarios({
  periodo,
  pagado,
  saldoMes,
  compromisoMes,
  pendienteTotal,
  fechaLimite,
  diasAlVencimiento,
  estado,
}: {
  periodo: Periodo;
  pagado: boolean;
  saldoMes: number;
  compromisoMes: number;
  pendienteTotal: number;
  fechaLimite: string;
  diasAlVencimiento: number;
  estado: string;
}) {
  const adeudoTotal = pendienteTotal > 0;
  // Urgente (rojo) solo si está vencido o el cliente quedó "ATRASADO"
  // (2+ meses / mes anterior impago). Un saldo del mes en curso es suave.
  const urgente = (!pagado && diasAlVencimiento < 0) || estado === "ATRASADO";
  const fondoBadge = urgente
    ? "bg-red-50 text-red-700 border-red-100"
    : !pagado
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-emerald-50 text-emerald-700 border-emerald-100";
  const etiqueta = urgente
    ? "Atrasado"
    : !pagado
      ? "Por pagar"
      : "Al corriente";

  const montoPrincipal = adeudoTotal
    ? pendienteTotal
    : !pagado
      ? saldoMes || compromisoMes
      : 0;
  const labelPrincipal = adeudoTotal
    ? "Saldo por pagar"
    : !pagado
      ? "Saldo del mes"
      : "Sin adeudo";
  // El monto solo se pinta en rojo cuando es urgente; si no, en navy
  // para no dramatizar montos chicos o del mes en curso.
  const colorMonto = urgente ? "text-red-600" : "text-slate-800";

  const detalleVencimiento = pagado
    ? `${periodoLabel(periodo)} · cubierto`
    : diasAlVencimiento < 0
      ? `Vencido (${fechaLimite})`
      : diasAlVencimiento === 0
        ? `Vence hoy (${fechaLimite})`
        : `Vence: ${fechaLimite}`;

  return (
    <div className="rdc-card bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-sm p-6 sm:p-7 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Honorarios del despacho
          </p>
          <p className="text-sm font-bold text-slate-700 mt-1">
            Periodo: <span className="text-[var(--portal-purple)]">{periodoLabel(periodo)}</span>
          </p>
        </div>
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${fondoBadge}`}
        >
          {etiqueta}
        </span>
      </div>

      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {labelPrincipal}
      </p>
      <p className={`text-3xl font-black tabular-nums ${colorMonto}`}>
        {fmtMxn(montoPrincipal)}
      </p>
      <p
        className={`text-[12px] font-bold mt-2 ${
          diasAlVencimiento < 0 && !pagado ? "text-red-600" : "text-slate-500"
        }`}
      >
        {detalleVencimiento}
      </p>

      <div className="mt-5">
        <Link
          href="/portal/honorarios"
          className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl text-white text-[11px] font-black uppercase tracking-widest ${
            !pagado
              ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25"
              : "bg-[var(--portal-navy)] hover:bg-[var(--portal-navy-hover)]"
          }`}
        >
          {!pagado ? "Pagar y ver historial" : "Ver historial"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}

/**
 * Tarjeta de "Saldo a favor" del periodo. Aparece cuando el admin activó
 * el bloque de saldo a favor (ISR y/o IVA) para un periodo "sin pago".
 *
 * Es un mensaje positivo: el cliente no debe nada al SAT este periodo y
 * además puede tener saldo a su favor compensable en periodos siguientes.
 */
function CardSaldoFavor({
  lineas,
  total,
  periodo,
}: {
  lineas: { etiqueta: string; monto: number }[];
  total: number;
  periodo: Periodo;
}) {
  if (total <= 0 && lineas.every((l) => l.monto === 0)) {
    // Tanto ISR como IVA en cero pero el admin lo dejó activo: mensaje neutral.
    return (
      <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-5 py-4 sm:px-6 sm:py-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
            Declaración en ceros · {periodoLabel(periodo)}
          </p>
          <p className="text-sm font-bold text-emerald-700 leading-snug mt-0.5">
            No causaste impuestos este periodo. Tu despacho subirá la
            declaración como evidencia ante el SAT.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 2v20" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
            Saldo a favor · {periodoLabel(periodo)}
          </p>
          <p className="text-[12px] font-bold text-emerald-700 mt-0.5">
            Este periodo cierra a tu favor.
          </p>
        </div>
      </div>

      <div
        className={`grid gap-3 ${
          lineas.length > 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2"
        }`}
      >
        {lineas.map((l, i) => (
          <div
            key={`${l.etiqueta}-${i}`}
            className="bg-white rounded-2xl border border-emerald-100 p-4"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
              {l.etiqueta} a favor
            </p>
            <p className="text-xl font-black text-emerald-700 tabular-nums mt-1">
              {l.monto.toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
              })}
            </p>
          </div>
        ))}
        {total > 0 && (
          <div
            className={`bg-emerald-700 rounded-2xl p-4 text-white flex items-center justify-between ${
              lineas.length > 2 ? "sm:col-span-2" : "col-span-2"
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
              Total a favor
            </p>
            <p className="text-2xl font-black tabular-nums">
              {total.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
            </p>
          </div>
        )}
      </div>

      <p className="text-[11px] font-bold text-emerald-700/80 mt-4 leading-relaxed">
        Este saldo puede compensarse contra periodos futuros o solicitarse en
        devolución. Coordínalo con tu contador asignado.
      </p>
    </div>
  );
}

/**
 * Tarjeta de "Última declaración presentada". Aparece solo cuando el
 * periodo fiscal anterior está en flujo "completado", como cierre
 * positivo del estatus reciente del cliente con Hacienda.
 */
function CardUltimaDeclaracion({
  periodo,
  fecha,
}: {
  periodo: Periodo;
  fecha?: string;
}) {
  const fechaCorta = useMemo(() => {
    if (!fecha) return null;
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return null;
    return fmtDiaMes(d);
  }, [fecha]);

  return (
    <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-5 py-4 sm:px-6 sm:py-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
          Última declaración presentada
        </p>
        <p className="text-sm font-bold text-emerald-700 leading-snug mt-0.5">
          <span className="text-emerald-900">{periodoLabel(periodo)}</span>{" "}
          quedó cumplida ante el SAT
          {fechaCorta ? ` el ${fechaCorta}` : ""}.
        </p>
      </div>
    </div>
  );
}

