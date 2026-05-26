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
  calcularEstado,
} from "@/lib/clientes";
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
import PortalSection from "@/components/portal/PortalSection";
import PortalContadorAsignadoCard from "@/components/portal/PortalContadorAsignadoCard";
import PortalAccionesRapidas from "@/components/portal/PortalAccionesRapidas";
import PortalCalendarioFiscal from "@/components/portal/PortalCalendarioFiscal";
import PortalNotificacionesRecientes from "@/components/portal/PortalNotificacionesRecientes";
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

  const cumplimientoOk = flujo === "completado";
  const honorariosOk = pagadoMes && pendienteTotal === 0;

  const estadoGeneral = useMemo<{
    titulo: string;
    detalle: string;
    tono: "ok" | "warn" | "bad";
  }>(() => {
    if (pendienteTotal > 0 || honorariosVencidos || flujo === "preliminar" || flujo === "declaraciones") {
      const motivos: string[] = [];
      if (pendienteTotal > 0) motivos.push("adeudo de honorarios");
      if (flujo === "preliminar") motivos.push("preliminar por validar");
      if (flujo === "declaraciones") motivos.push("pago de impuestos pendiente");
      return {
        titulo: "Tienes temas pendientes",
        detalle:
          motivos.length > 0
            ? `Atiende: ${motivos.join(", ")}.`
            : "Revisa los detalles más abajo.",
        tono: pendienteTotal > 0 ? "bad" : "warn",
      };
    }
    if (cumplimientoOk && honorariosOk) {
      return {
        titulo: "Estás al día",
        detalle: "Cumplimiento fiscal y honorarios al corriente. ¡Excelente!",
        tono: "ok",
      };
    }
    return {
      titulo: "Todo en orden",
      detalle: "No tienes acciones urgentes pendientes.",
      tono: "ok",
    };
  }, [pendienteTotal, honorariosVencidos, flujo, cumplimientoOk, honorariosOk]);

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

      <BannerEstadoGeneral
        titulo={estadoGeneral.titulo}
        detalle={estadoGeneral.detalle}
        tono={estadoGeneral.tono}
      />

      <PortalAvisoEfirmaBanner />

      <PortalAccionesRapidas />

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

      <CardTareasPendientes
        flujo={flujo}
        sinPagoImpuestos={sinPagoImpuestos}
        honorariosVencidos={honorariosVencidos}
        pendienteTotal={pendienteTotal}
        efirmaAviso={false}
      />

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
    </div>
  );
}

function BannerEstadoGeneral({
  titulo,
  detalle,
  tono,
}: {
  titulo: string;
  detalle: string;
  tono: "ok" | "warn" | "bad";
}) {
  const styles =
    tono === "ok"
      ? {
          bg: "bg-emerald-50 border-emerald-100",
          icon: "bg-emerald-500",
          title: "text-emerald-700",
          text: "text-emerald-600",
        }
      : tono === "warn"
        ? {
            bg: "bg-amber-50 border-amber-100",
            icon: "bg-amber-500",
            title: "text-amber-700",
            text: "text-amber-600",
          }
        : {
            bg: "bg-red-50 border-red-100",
            icon: "bg-red-500",
            title: "text-red-700",
            text: "text-red-600",
          };

  return (
    <div
      className={`flex items-center gap-4 rounded-[1.5rem] border px-5 py-4 sm:px-6 sm:py-5 ${styles.bg}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${styles.icon}`}
      >
        {tono === "ok" ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : tono === "warn" ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4" /><path d="M12 17h.01" /><path d="m10.29 3.86-8.4 14.55a2 2 0 0 0 1.73 3h16.76a2 2 0 0 0 1.73-3l-8.4-14.55a2 2 0 0 0-3.46 0z" /></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        )}
      </div>
      <div className="min-w-0">
        <p className={`text-[11px] font-black uppercase tracking-widest ${styles.title}`}>
          {titulo}
        </p>
        <p className={`text-sm font-bold ${styles.text} leading-snug mt-0.5`}>
          {detalle}
        </p>
      </div>
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
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-7 flex flex-col">
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
  const acento = adeudoTotal
    ? "text-red-600"
    : !pagado
      ? "text-amber-600"
      : "text-emerald-600";
  const fondoBadge = adeudoTotal
    ? "bg-red-50 text-red-700 border-red-100"
    : !pagado
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-emerald-50 text-emerald-700 border-emerald-100";
  const etiqueta = adeudoTotal
    ? "Con adeudo"
    : !pagado
      ? "Pendiente del mes"
      : "Al corriente";

  const montoPrincipal = adeudoTotal
    ? pendienteTotal
    : !pagado
      ? saldoMes || compromisoMes
      : 0;
  const labelPrincipal = adeudoTotal
    ? "Adeudo total"
    : !pagado
      ? "Saldo del mes"
      : "Sin adeudo";

  const detalleVencimiento = pagado
    ? `${periodoLabel(periodo)} · cubierto`
    : diasAlVencimiento < 0
      ? `Vencido (${fechaLimite})`
      : diasAlVencimiento === 0
        ? `Vence hoy (${fechaLimite})`
        : `Vence: ${fechaLimite}`;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-7 flex flex-col">
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
      <p className={`text-3xl font-black tabular-nums ${acento}`}>
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

/**
 * Tarjeta "Pendientes contigo" que enumera las acciones que el cliente
 * debe atender, derivadas del flujo de cumplimiento y del estado de
 * honorarios. Si no hay nada pendiente, no se renderiza.
 */
function CardTareasPendientes({
  flujo,
  sinPagoImpuestos,
  honorariosVencidos,
  pendienteTotal,
  efirmaAviso,
}: {
  flujo: FlujoCumplimiento;
  sinPagoImpuestos: boolean;
  honorariosVencidos: boolean;
  pendienteTotal: number;
  efirmaAviso: boolean;
}) {
  type Tarea = {
    titulo: string;
    detalle: string;
    href: string;
    tono: "warn" | "bad";
  };
  const tareas: Tarea[] = [];

  if (pendienteTotal > 0) {
    tareas.push({
      titulo: "Pagar honorarios pendientes",
      detalle: `Tienes un adeudo con el despacho. ${
        honorariosVencidos ? "Está vencido." : ""
      }`,
      href: "/portal/honorarios",
      tono: honorariosVencidos ? "bad" : "warn",
    });
  }
  if (flujo === "preliminar" && !sinPagoImpuestos) {
    tareas.push({
      titulo: "Validar el preliminar fiscal",
      detalle: "Tu despacho subió el preliminar de impuestos del periodo.",
      href: "/portal/cumplimiento",
      tono: "warn",
    });
  }
  if (flujo === "declaraciones" && !sinPagoImpuestos) {
    tareas.push({
      titulo: "Subir comprobante de pago de impuestos",
      detalle: "Las declaraciones están listas, falta cargar el pago.",
      href: "/portal/cumplimiento",
      tono: "warn",
    });
  }
  if (efirmaAviso) {
    tareas.push({
      titulo: "Renovar tu e.firma (FIEL)",
      detalle: "Tu certificado vence pronto. Coordínalo con tu contador.",
      href: "/portal/perfil",
      tono: "warn",
    });
  }

  if (tareas.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 sm:p-6">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
        Pendientes contigo
      </p>
      <ul className="space-y-2.5">
        {tareas.map((t, i) => (
          <li key={`${t.titulo}-${i}`}>
            <Link
              href={t.href}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition-colors ${
                t.tono === "bad"
                  ? "border-red-200 bg-red-50/60 hover:bg-red-50"
                  : "border-amber-200 bg-amber-50/60 hover:bg-amber-50"
              }`}
            >
              <div className="min-w-0">
                <p className={`text-sm font-black truncate ${
                  t.tono === "bad" ? "text-red-700" : "text-amber-700"
                }`}>
                  {t.titulo}
                </p>
                <p className={`text-[11px] font-bold leading-snug mt-0.5 ${
                  t.tono === "bad" ? "text-red-600" : "text-amber-600"
                }`}>
                  {t.detalle}
                </p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${
                t.tono === "bad" ? "text-red-500" : "text-amber-500"
              }`} aria-hidden>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
