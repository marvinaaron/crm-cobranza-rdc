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
  type FlujoCumplimiento,
} from "@/lib/cumplimiento";
import { fechaLimitePago, getFechaLimiteDate } from "@/lib/correo";
import { useClientes } from "@/context/ClientesContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalAvisoEfirmaBanner from "@/components/portal/PortalAvisoEfirmaBanner";
import PortalSection from "@/components/portal/PortalSection";
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

  const proximosVencimientos = useMemo<
    Array<{ titulo: string; fecha: string; tono: "ok" | "warn" | "bad" }>
  >(() => {
    const items: Array<{ titulo: string; fecha: string; tono: "ok" | "warn" | "bad"; orden: number }> = [];

    if (!pagadoMes) {
      const tono: "ok" | "warn" | "bad" =
        diasAlVencimiento < 0
          ? "bad"
          : diasAlVencimiento <= 5
            ? "warn"
            : "ok";
      const detalle =
        diasAlVencimiento < 0
          ? `Vencido el ${fmtDiaMes(fechaLimiteDate)}`
          : diasAlVencimiento === 0
            ? `Hoy (${fmtDiaMes(fechaLimiteDate)})`
            : `${fmtDiaMes(fechaLimiteDate)} (en ${diasAlVencimiento} día${diasAlVencimiento === 1 ? "" : "s"})`;
      items.push({
        titulo: `Honorarios ${MESES_NOM[periodoHoy.mes].toLowerCase()}`,
        fecha: detalle,
        tono,
        orden: fechaLimiteDate.getTime(),
      });
    }

    // Fecha límite SAT para personas físicas: día 17 del mes siguiente al fiscal.
    if (!sinPagoImpuestos && flujo !== "completado") {
      const diaLimiteSat = 17;
      const mesEntrega = (periodoFiscal.mes + 1) % 12;
      const anioEntrega =
        periodoFiscal.mes === 11 ? periodoFiscal.anio + 1 : periodoFiscal.anio;
      const fechaSat = new Date(anioEntrega, mesEntrega, diaLimiteSat);
      const diasSat = diasEntre(hoy, fechaSat);
      if (diasSat >= -7) {
        const tono: "ok" | "warn" | "bad" =
          diasSat < 0 ? "bad" : diasSat <= 5 ? "warn" : "ok";
        const detalle =
          diasSat < 0
            ? `Vencido el ${fmtDiaMes(fechaSat)}`
            : diasSat === 0
              ? `Hoy (${fmtDiaMes(fechaSat)})`
              : `${fmtDiaMes(fechaSat)} (en ${diasSat} día${diasSat === 1 ? "" : "s"})`;
        items.push({
          titulo: `Declaración ${MESES_NOM[periodoFiscal.mes].toLowerCase()} (SAT)`,
          fecha: detalle,
          tono,
          orden: fechaSat.getTime(),
        });
      }
    }

    return items
      .sort((a, b) => a.orden - b.orden)
      .map(({ titulo, fecha, tono }) => ({ titulo, fecha, tono }));
  }, [
    pagadoMes,
    diasAlVencimiento,
    fechaLimiteDate,
    periodoHoy.mes,
    sinPagoImpuestos,
    flujo,
    periodoFiscal,
    hoy,
  ]);

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

  return (
    <div className={portalPage}>
      <PortalPageHeader
        eyebrow="Inicio"
        title={`Hola, ${nombreSaludo}`}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CardCumplimiento
          periodo={periodoFiscal}
          flujo={flujo}
          flujoInfo={flujoInfo}
          sinPagoImpuestos={sinPagoImpuestos}
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

      {proximosVencimientos.length > 0 && (
        <PortalSection title="Próximos vencimientos">
          <ul className="space-y-2.5">
            {proximosVencimientos.map((v) => (
              <li
                key={v.titulo}
                className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl border border-slate-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PuntoTono tono={v.tono} />
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
            ))}
          </ul>
        </PortalSection>
      )}
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
}: {
  periodo: Periodo;
  flujo: FlujoCumplimiento;
  flujoInfo: FlujoLabel;
  sinPagoImpuestos: boolean;
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

function PuntoTono({ tono }: { tono: "ok" | "warn" | "bad" }) {
  const cls =
    tono === "ok"
      ? "bg-emerald-500"
      : tono === "warn"
        ? "bg-amber-500"
        : "bg-red-500";
  return <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cls}`} />;
}
