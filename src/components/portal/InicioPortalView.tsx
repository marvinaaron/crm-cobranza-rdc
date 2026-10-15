"use client";

import { useMemo } from "react";
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
import { fechaLimitePago, getFechaLimiteDate } from "@/lib/correo";
import { useClientes } from "@/context/ClientesContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import { useMarcarPrevioVistoAlVerBanner } from "@/hooks/useMarcarPrevioVistoAlVerBanner";
import PortalInicioPendiente from "@/components/portal/PortalInicioPendiente";
import PortalInicioSatFila from "@/components/portal/PortalInicioSatFila";
import {
  GroupedRow,
  GroupedSection,
  IconCal,
  IconCheck,
  IconDoc,
  IconFolder,
  IconPeso,
} from "@/components/portal/PortalGroupedList";
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
import { proximosVencimientosDesde } from "@/lib/portal/agenda-fiscal";
import { FLUJO_NUMERO } from "@/lib/cobranza-workflow";
import { portalInicioPage, fmtMxn } from "@/components/portal/portal-ui";

type Props = { cliente: Cliente };

type FlujoLabel = {
  etiqueta: string;
  descripcion: string;
  tono: "ok" | "warn" | "bad" | "neutral";
};

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

  const flujoInfo = FLUJO_LABELS[flujo];

  const pagadoMes = estaPagado(cliente, periodoHoy);
  const saldoMes = getSaldoMes(cliente, periodoHoy);
  const compromisoMes = getCompromisoMes(cliente, periodoHoy);
  const pendienteHonorarios = getTotalPendiente(cliente, periodoHoy);
  const totalExtraPorCobrar = getTotalExtraPorCobrar(cliente);
  const deudaNeta = getDeudaNetaHonorarios(cliente, periodoHoy);
  const estado = calcularEstado(cliente, periodoHoy);
  const fechaLimiteDate = getFechaLimiteDate(cliente, periodoHoy);
  const diasAlVencimiento = diasEntre(hoy, fechaLimiteDate);
  const honorariosVencidos = !pagadoMes && diasAlVencimiento < 0;

  const mesesImpagos = useMemo(
    () => contarMesesImpagos(cliente, periodoHoy),
    [cliente, periodoHoy]
  );
  const honorariosUrgente = honorariosVencidos || mesesImpagos >= 2;
  const impuestosVencidos = useMemo(
    () => categoriasVencidasSinPago(registroFiscal).length > 0,
    [registroFiscal]
  );

  const accionesInicio = useMemo<AccionPortal[]>(() => {
    const out: AccionPortal[] = [];
    if (deudaNeta > 0) {
      const soloExtra = pendienteHonorarios <= 0 && totalExtraPorCobrar > 0;
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
        ctaSecundario: soloExtra ? undefined : "Ya pagué · subir foto",
        hrefSecundario: soloExtra ? undefined : "/portal/honorarios#comprobante",
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
      out.push(impuestosSinCerrar);
    }

    const mesesAnteriores = avisoMesesAnterioresPendientesInicio({
      lista: cumplimiento,
      clienteId: cliente.id,
      periodoFiscal,
      categorias: categoriasHabilitadasCliente(cliente),
    });
    if (mesesAnteriores) {
      out.push(mesesAnteriores);
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
  const alDiaInicio = accionesInicio.length === 0;

  const pendientesInicio = useMemo(
    () => ordenarPendientesInicio(accionesInicio),
    [accionesInicio]
  );
  const pendientePrincipal = pendientesInicio[0] ?? null;
  const pendientesRestantes = pendientesInicio.slice(1);

  const eventosFiscales = useMemo<EventoFiscal[]>(
    () => eventosFiscalesParaCliente(cliente, periodoFiscal, 6),
    [cliente, periodoFiscal]
  );

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

  const eventoHonorarios = useMemo<EventoFiscal | null>(() => {
    if (pagadoMes) return null;
    return {
      tipo: "honorarios",
      etiqueta: `Honorarios ${MESES_NOM[periodoHoy.mes].toLowerCase()}`,
      fecha: fechaLimiteDate,
      periodo: periodoHoy,
    };
  }, [pagadoMes, fechaLimiteDate, periodoHoy]);

  const eventosCalendario = useMemo<EventoFiscal[]>(() => {
    const out = [...eventosFiscalesVisibles];
    if (eventoHonorarios) out.push(eventoHonorarios);
    return out.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }, [eventosFiscalesVisibles, eventoHonorarios]);

  const proximoVencimiento = useMemo(
    () => proximosVencimientosDesde(eventosCalendario, hoy)[0] ?? null,
    [eventosCalendario, hoy]
  );

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
  const ultimaDeclaracion = flujoAnterior === "completado";

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

  const saludoHora = useMemo(() => {
    const h = hoy.getHours();
    if (h >= 5 && h < 12) return "Buenos días";
    if (h >= 12 && h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, [hoy]);

  const paso = FLUJO_NUMERO[flujo];
  const cumplimientoIcon =
    flujoInfo.tono === "ok"
      ? "bg-emerald-500"
      : flujoInfo.tono === "warn"
        ? "bg-amber-500"
        : flujoInfo.tono === "bad"
          ? "bg-red-500"
          : "bg-[var(--portal-navy)]";

  const honorariosAtrasado =
    (!pagadoMes && diasAlVencimiento < 0) || estado === "ATRASADO";
  const honorariosIcon = honorariosAtrasado
    ? "bg-red-500"
    : !pagadoMes
      ? "bg-amber-500"
      : "bg-emerald-500";
  const honorariosSub = pagadoMes
    ? `${periodoLabel(periodoHoy)} · cubierto`
    : honorariosAtrasado
      ? `Atrasado · ${fmtMxn(deudaNeta || saldoMes || compromisoMes)}`
      : `Por pagar · ${fmtMxn(deudaNeta || saldoMes || compromisoMes)}`;

  const saldoFavorVisible =
    saldoFavor &&
    (saldoFavor.total > 0 || saldoFavor.lineas.some((l) => l.monto > 0));

  return (
    <div className={portalInicioPage}>
      <header className="px-1">
        <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          {saludoHora}, {nombreSaludo}
        </h1>
        <p className="mt-1 text-[15px] text-slate-500">{fmtDiaMes(hoy)}</p>
      </header>

      {alDiaInicio ? (
        <GroupedSection>
          <GroupedRow
            href="/portal/cumplimiento"
            icon={<IconCheck />}
            iconClass="bg-emerald-500"
            title="Estás al día"
            subtitle="Impuestos y honorarios al corriente"
          />
        </GroupedSection>
      ) : pendientePrincipal ? (
        <PortalInicioPendiente accion={pendientePrincipal} />
      ) : null}

      {pendientesRestantes.length > 0 ? (
        <GroupedSection label="También">
          {pendientesRestantes.map((a) => (
            <GroupedRow
              key={a.clave}
              href={a.href}
              icon={<IconDoc />}
              iconClass={a.urgente ? "bg-red-500" : "bg-amber-500"}
              title={a.titulo}
              subtitle={a.etiqueta}
              trailing={
                a.monto != null && a.monto > 0 ? fmtMxn(a.monto) : undefined
              }
            />
          ))}
        </GroupedSection>
      ) : null}

      <GroupedSection label="Tu mes">
        <GroupedRow
          href="/portal/cumplimiento"
          icon={<IconDoc />}
          iconClass={cumplimientoIcon}
          title="Cumplimiento"
          subtitle={
            sinPagoImpuestos
              ? `Sin pago · ${periodoLabel(periodoFiscal)}`
              : `${flujoInfo.etiqueta} · ${periodoLabel(periodoFiscal)}`
          }
          trailing={`${paso}/7`}
        />
        <GroupedRow
          href="/portal/honorarios"
          icon={<IconPeso />}
          iconClass={honorariosIcon}
          title="Honorarios"
          subtitle={honorariosSub}
        />
        <PortalInicioSatFila />
      </GroupedSection>

      <GroupedSection label="Más">
        {proximoVencimiento ? (
          <GroupedRow
            href={proximoVencimiento.href}
            icon={<IconCal />}
            iconClass={
              proximoVencimiento.tono === "bad"
                ? "bg-red-500"
                : proximoVencimiento.tono === "warn"
                  ? "bg-amber-500"
                  : "bg-[var(--portal-navy)]"
            }
            title="Agenda"
            subtitle={`${proximoVencimiento.titulo} · ${proximoVencimiento.fechaLabel}`}
          />
        ) : (
          <GroupedRow
            href="/portal/cumplimiento"
            icon={<IconCal />}
            iconClass="bg-[var(--portal-navy)]"
            title="Agenda"
            subtitle="Sin vencimientos próximos"
          />
        )}
        <GroupedRow
          href="/portal/sat"
          icon={<IconFolder />}
          iconClass="bg-slate-400"
          title="Documentos"
          subtitle="Constancia, acuses y facturas"
        />
        {saldoFavorVisible ? (
          <GroupedRow
            href="/portal/cumplimiento"
            icon={<IconPeso />}
            iconClass="bg-emerald-500"
            title="Saldo a favor"
            subtitle={periodoLabel(periodoFiscal)}
            trailing={fmtMxn(saldoFavor!.total)}
          />
        ) : null}
        {ultimaDeclaracion ? (
          <GroupedRow
            href="/portal/cumplimiento"
            icon={<IconCheck />}
            iconClass="bg-emerald-500"
            title="Última declaración"
            subtitle={`${periodoLabel(periodoAnterior)} quedó cumplida`}
          />
        ) : null}
      </GroupedSection>
    </div>
  );
}
