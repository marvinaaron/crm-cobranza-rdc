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
  contarMesesImpagos,
  calcularEstado,
} from "@/lib/clientes";
import { categoriasVencidasSinPago } from "@/lib/cumplimiento-categorias";
import {
  getCumplimientoPeriodo,
  getFlujoCumplimiento,
  esSinPagoImpuestos,
  getSaldoFavorPeriodo,
  type FlujoCumplimiento,
} from "@/lib/cumplimiento";
import { regimenPorClave } from "@/lib/regimenes-fiscales";
import { fechaLimitePago, getFechaLimiteDate } from "@/lib/correo";
import { useClientes } from "@/context/ClientesContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalAvisoEfirmaBanner from "@/components/portal/PortalAvisoEfirmaBanner";
import PortalOpinionSemaforo from "@/components/portal/PortalOpinionSemaforo";
import PortalSection from "@/components/portal/PortalSection";
import PortalContadorAsignadoCard from "@/components/portal/PortalContadorAsignadoCard";
import PortalStepperInicio from "@/components/portal/PortalStepperInicio";
import PortalAccionesRapidas from "@/components/portal/PortalAccionesRapidas";
import PortalCalendarioFiscal from "@/components/portal/PortalCalendarioFiscal";
import PortalNotificacionesRecientes from "@/components/portal/PortalNotificacionesRecientes";
import PortalDocumentosRecientes from "@/components/portal/PortalDocumentosRecientes";
import {
  eventosFiscalesParaCliente,
  COLORES_EVENTO,
  type EventoFiscal,
  type TipoEventoFiscal,
} from "@/lib/portal/fechas-fiscales";
import { portalPage, fmtMxn } from "@/components/portal/portal-ui";

type Props = { cliente: Cliente };

type FlujoLabel = { etiqueta: string; descripcion: string; tono: "ok" | "warn" | "bad" | "neutral" };

const FLUJO_LABELS: Record<FlujoCumplimiento, FlujoLabel> = {
  por_trabajar: {
    etiqueta: "Por trabajar",
    descripcion: "Tu despacho aún no ha cargado tus documentos del periodo.",
    tono: "neutral",
  },
  iniciando_contabilidad: {
    etiqueta: "En proceso",
    descripcion: "Estamos preparando tu contabilidad del periodo.",
    tono: "neutral",
  },
  preliminar: {
    etiqueta: "Pendiente tu validación",
    descripcion: "Tienes un preliminar publicado esperando tu aprobación.",
    tono: "warn",
  },
  aceptacion: {
    etiqueta: "Validado, generando declaraciones",
    descripcion: "Aceptaste el preliminar. Estamos preparando tus declaraciones.",
    tono: "neutral",
  },
  declaraciones: {
    etiqueta: "Pendiente pago de impuestos",
    descripcion: "Tus declaraciones están listas. Falta cargar el comprobante de pago.",
    tono: "warn",
  },
  pago: {
    etiqueta: "Pago en revisión",
    descripcion: "Tu pago de impuestos fue recibido. Estamos validándolo.",
    tono: "neutral",
  },
  completado: {
    etiqueta: "Cumplido",
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
  const pendienteTotal = getTotalPendiente(cliente, periodoHoy);
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
    if (pendienteTotal > 0) {
      out.push({
        clave: "honorarios",
        titulo: "Tienes un honorario pendiente de pago",
        detalle: honorariosUrgente
          ? mesesImpagos >= 2
            ? `Llevas ${mesesImpagos} meses por cubrir. Si ya pagaste, sube tu comprobante.`
            : `El pago de ${periodoLabel(periodoHoy)} ya venció. Lo puedes regularizar en segundos.`
          : "Puedes pagarlo directamente desde tu portal en segundos.",
        cta: "Pagar ahora",
        href: "/portal/honorarios",
        icono: "peso",
        urgente: honorariosUrgente,
      });
    }
    if (flujo === "preliminar" && !sinPagoImpuestos) {
      out.push({
        clave: "preliminar",
        titulo: "Tu preliminar de impuestos está listo",
        detalle: "Revísalo y apruébalo para que preparemos tus declaraciones.",
        cta: "Revisar",
        href: "/portal/cumplimiento",
        icono: "doc",
        urgente: false,
      });
    }
    if (flujo === "declaraciones" && !sinPagoImpuestos) {
      out.push({
        clave: "declaraciones",
        titulo: "Sube tu comprobante de pago de impuestos",
        detalle: impuestosVencidos
          ? "La fecha límite ya pasó. Súbelo o escríbenos para regularizarte sin bronca."
          : "Tus declaraciones ya están listas, solo falta cargar el pago.",
        cta: "Subir comprobante",
        href: "/portal/cumplimiento",
        icono: "upload",
        urgente: impuestosVencidos,
      });
    }
    return out;
  }, [
    pendienteTotal,
    honorariosUrgente,
    mesesImpagos,
    periodoHoy,
    flujo,
    sinPagoImpuestos,
    impuestosVencidos,
  ]);
  const alDiaInicio = accionesInicio.length === 0;

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

  // Lista resumida "Próximos vencimientos" (máximo 5, ordenados).
  const proximosVencimientos = useMemo<
    Array<{
      titulo: string;
      fecha: string;
      tono: "ok" | "warn" | "bad";
      tipo: TipoEventoFiscal;
    }>
  >(() => {
    const tonoPorDias = (d: number): "ok" | "warn" | "bad" =>
      d < 0 ? "bad" : d <= 5 ? "warn" : "ok";
    const detallePorDias = (d: number, fecha: Date): string => {
      if (d < 0) return `Vencido el ${fmtDiaMes(fecha)}`;
      if (d === 0) return `Hoy (${fmtDiaMes(fecha)})`;
      return `${fmtDiaMes(fecha)} (en ${d} día${d === 1 ? "" : "s"})`;
    };

    return eventosCalendario
      .map((e) => {
        const d = diasEntre(hoy, e.fecha);
        return {
          tipo: e.tipo,
          titulo: e.etiqueta,
          fecha: detallePorDias(d, e.fecha),
          tono: tonoPorDias(d),
          orden: e.fecha.getTime(),
        };
      })
      .filter((e) =>
        // Ítems del pasado lejano no los listamos (ya no son accionables).
        e.tono === "bad" ? hoy.getTime() - e.orden < 30 * 86_400_000 : true
      )
      .sort((a, b) => a.orden - b.orden)
      .slice(0, 5)
      .map(({ titulo, fecha, tono, tipo }) => ({ titulo, fecha, tono, tipo }));
  }, [eventosCalendario, hoy]);

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
            <strong className="text-blue-600">{fmtDiaMes(hoy)}</strong>
          </span>
        }
      />

      <ResumenInicio acciones={accionesInicio} alDia={alDiaInicio} />

      {/* Avance del cierre del periodo: stepper compacto reutilizado. */}
      <PortalStepperInicio cliente={cliente} periodo={periodoFiscal} />

      {/* Hub de accesos directos: lo más usado, arriba y a un tap. */}
      <PortalAccionesRapidas />

      <PortalAvisoEfirmaBanner />

      <PortalOpinionSemaforo />

      <PortalNotificacionesRecientes clienteId={cliente.id} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CardCumplimiento
          periodo={periodoFiscal}
          flujo={flujo}
          flujoInfo={flujoInfo}
          sinPagoImpuestos={sinPagoImpuestos}
          regimenLabel={regimen?.label}
        />

        <CardHonorarios
          periodo={periodoHoy}
          pagado={pagadoMes}
          saldoMes={saldoMes}
          compromisoMes={compromisoMes}
          pendienteTotal={pendienteTotal}
          fechaLimite={fechaLimite}
          diasAlVencimiento={diasAlVencimiento}
          estado={estado}
        />
      </div>

      {saldoFavor && (
        <CardSaldoFavor
          isr={saldoFavor.isr}
          iva={saldoFavor.iva}
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

      <PortalContadorAsignadoCard />

      {/* Calendario fiscal + lista de próximos vencimientos.
          En desktop quedan a 50/50; en móvil apilados (calendario primero). */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <PortalCalendarioFiscal
          eventos={eventosCalendario}
          hoy={hoy}
          nombreCliente={nombrePersonal || cliente.razonSocial}
        />

        {proximosVencimientos.length > 0 && (
          <PortalSection title="Próximos vencimientos">
            <ul className="space-y-2.5">
              {proximosVencimientos.map((v, i) => {
                const c = COLORES_EVENTO[v.tipo];
                return (
                  <li
                    key={`${v.tipo}-${i}`}
                    className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {v.titulo}
                      </p>
                    </div>
                    <p
                      className={`text-[12px] font-bold shrink-0 ${
                        v.tono === "bad"
                          ? "text-red-600"
                          : v.tono === "warn"
                            ? "text-amber-600"
                            : "text-slate-500"
                      }`}
                    >
                      {v.fecha}
                    </p>
                  </li>
                );
              })}
            </ul>
          </PortalSection>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PortalDocumentosRecientes cliente={cliente} />
      </div>
    </div>
  );
}

type AccionInicio = {
  clave: string;
  titulo: string;
  detalle: string;
  cta: string;
  href: string;
  icono: "peso" | "doc" | "upload";
  urgente: boolean;
};

const ICONO_ACCION: Record<AccionInicio["icono"], React.ReactNode> = {
  peso: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
  ),
  doc: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15l2 2 4-4" /></svg>
  ),
  upload: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
  ),
};

/**
 * Resumen accionable del inicio. Si el cliente está al día, muestra un
 * mensaje positivo y tranquilo. Si hay pendientes, los lista como tiras
 * amigables con su CTA. El tono rojo se reserva para lo urgente (vencido o
 * 2+ meses); el resto usa un ámbar suave que invita sin asustar.
 */
function ResumenInicio({
  acciones,
  alDia,
}: {
  acciones: AccionInicio[];
  alDia: boolean;
}) {
  if (alDia) {
    return (
      <div className="flex items-center gap-4 rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-5 py-4 sm:px-6 sm:py-5">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">
            Estás al día
          </p>
          <p className="text-sm font-bold text-emerald-600 leading-snug mt-0.5">
            Tu cumplimiento fiscal y tus honorarios están al corriente.
            ¡Gracias por tu confianza!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {acciones.map((a) => {
        const urg = a.urgente;
        return (
          <div
            key={a.clave}
            className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-[1.5rem] border px-5 py-4 sm:px-6 sm:py-5 ${
              urg
                ? "rdc-glass-alert-red border-red-100 bg-red-50/70"
                : "rdc-glass-alert-orange border-amber-100 bg-amber-50/70"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${
                urg ? "bg-red-500" : "bg-amber-500"
              }`}
            >
              {ICONO_ACCION[a.icono]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-800 leading-snug">
                {a.titulo}
              </p>
              <p
                className={`text-[12px] font-bold leading-snug mt-0.5 ${
                  urg ? "text-red-600" : "text-slate-500"
                }`}
              >
                {a.detalle}
              </p>
            </div>
            <Link
              href={a.href}
              className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-[11px] font-black uppercase tracking-widest transition-colors ${
                urg
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              {a.cta}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

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
            Periodo: <span className="text-blue-600">{periodoLabel(periodo)}</span>
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
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-800"
        >
          Ver detalle
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
            Periodo: <span className="text-blue-600">{periodoLabel(periodo)}</span>
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
              ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100"
              : "bg-blue-900 hover:bg-blue-800"
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
  isr,
  iva,
  total,
  periodo,
}: {
  isr: number;
  iva: number;
  total: number;
  periodo: Periodo;
}) {
  if (total <= 0 && isr === 0 && iva === 0) {
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

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-emerald-100 p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
            ISR a favor
          </p>
          <p className="text-xl font-black text-emerald-700 tabular-nums mt-1">
            {isr.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-100 p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
            IVA a favor
          </p>
          <p className="text-xl font-black text-emerald-700 tabular-nums mt-1">
            {iva.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
          </p>
        </div>
        {total > 0 && (
          <div className="col-span-2 bg-emerald-700 rounded-2xl p-4 text-white flex items-center justify-between">
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

