"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type Cliente,
  type Periodo,
  MESES_NOM,
  getPeriodoHoy,
  getPeriodoFiscalVigente,
  estaPagado,
  getDeudaNetaHonorarios,
} from "@/lib/clientes";
import { categoriasVencidasSinPago } from "@/lib/cumplimiento-categorias";
import {
  getCumplimientoPeriodo,
  getFlujoCumplimiento,
  esSinPagoImpuestos,
  formatFechaLimiteImpuesto,
  previewPublicado,
  clienteConfirmoPreview,
  documentosFiscalesCompletos,
  todosPagosValidados,
  todosComprobantesPagoCargados,
  algunDocumentoFiscalSubido,
} from "@/lib/cumplimiento";
import { getFechaLimiteDate } from "@/lib/correo";
import { useClientes } from "@/context/ClientesContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import { useMarcarPrevioVistoAlVerBanner } from "@/hooks/useMarcarPrevioVistoAlVerBanner";
import PortalInicioPendiente from "@/components/portal/PortalInicioPendiente";
import PortalPlazosAnillos, {
  tonoEfirma,
  type AnilloPlazo,
} from "@/components/portal/PortalPlazosAnillos";
import PortalInicioHonorarios from "@/components/portal/PortalInicioHonorarios";
import PortalCarpetaInicio from "@/components/portal/PortalCarpetaInicio";
import PortalInicioCalendario from "@/components/portal/PortalInicioCalendario";
import { usePortalContadorAsignado } from "@/components/portal/usePortalContadorAsignado";
import { waLinkPortal } from "@/lib/portal/whatsapp";
import {
  firmaAvisoInicio,
  guardarAvisoInicioOculto,
  leerAvisosInicioOcultos,
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
  fechaLimiteSATConOverride,
  fechaPresentacionDeclaracion,
} from "@/lib/portal/fechas-fiscales";
import {
  portalMuestraHonorarios,
  portalMuestraSituacionFiscal,
} from "@/lib/config-portal-cliente";
import { portalInicioPage } from "@/components/portal/portal-ui";

type Props = { cliente: Cliente };

function fmtDiaMes(d: Date): string {
  return `${d.getDate()} de ${MESES_NOM[d.getMonth()].toLowerCase()}`;
}

export default function InicioPortalView({ cliente }: Props) {
  const { cumplimiento } = useClientes();
  const { perfil } = usePortalPerfil();
  const { contador } = usePortalContadorAsignado();
  const hoy = useMemo(() => new Date(), []);
  const [anilloEfirma, setAnilloEfirma] = useState<AnilloPlazo | null>(null);
  const periodoHoy: Periodo = useMemo(() => getPeriodoHoy(), []);
  const periodoFiscal: Periodo = useMemo(
    () => getPeriodoFiscalVigente(hoy),
    [hoy]
  );
  const cats = useMemo(
    () => categoriasHabilitadasCliente(cliente),
    [cliente]
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

  const pagadoMes = estaPagado(cliente, periodoHoy);
  const deudaNeta = getDeudaNetaHonorarios(cliente, periodoHoy);
  const fechaLimiteDate = getFechaLimiteDate(cliente, periodoHoy);
  const impuestosVencidos = useMemo(
    () => categoriasVencidasSinPago(registroFiscal).length > 0,
    [registroFiscal]
  );

  const accionesAviso = useMemo<AccionPortal[]>(() => {
    const out: AccionPortal[] = [];
    if (portalMuestraHonorarios(cliente) && deudaNeta > 0) {
      const vencido =
        !pagadoMes &&
        new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) >
          new Date(
            fechaLimiteDate.getFullYear(),
            fechaLimiteDate.getMonth(),
            fechaLimiteDate.getDate()
          );
      out.push({
        clave: "honorarios",
        etiqueta: "Honorarios",
        titulo: vencido
          ? "Tu pago a RDC está atrasado"
          : "Tienes saldo pendiente con nosotros",
        monto: deudaNeta,
        detalle: vencido
          ? "El plazo de este mes ya pasó. Puedes pagarlo aquí en segundos."
          : "Págalo con transferencia o tarjeta desde Honorarios.",
        cta: "Pagar ahora",
        href: "/portal/honorarios#pago",
        ctaSecundario: "Ya pagué · Subir foto",
        hrefSecundario: "/portal/honorarios#comprobante",
        urgente: vencido,
      });
    }
    if (flujo === "preliminar" && !sinPagoImpuestos) {
      out.push({
        clave: "preliminar",
        etiqueta: "Impuestos SAT",
        titulo: "Resumen de tu mes",
        detalle:
          "Ya puedes ver ingresos, gastos y cuánto sale a pagar. Te avisamos cuando la declaración y la línea de captura estén listas.",
        cta: "Ver resumen",
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
    if (impuestosSinCerrar) out.push(impuestosSinCerrar);

    const mesesAnteriores = avisoMesesAnterioresPendientesInicio({
      lista: cumplimiento,
      clienteId: cliente.id,
      periodoFiscal,
      categorias: cats,
    });
    if (mesesAnteriores) out.push(mesesAnteriores);

    return out;
  }, [
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
    cats,
    deudaNeta,
    pagadoMes,
    fechaLimiteDate,
  ]);

  const avisosOrdenados = useMemo(
    () => ordenarPendientesInicio(accionesAviso),
    [accionesAviso]
  );
  const [firmasOcultas, setFirmasOcultas] = useState<string[]>([]);

  useEffect(() => {
    setFirmasOcultas(leerAvisosInicioOcultos(cliente.id));
  }, [cliente.id]);

  const avisosVisibles = useMemo(
    () =>
      avisosOrdenados.filter(
        (a) => !firmasOcultas.includes(firmaAvisoInicio(a))
      ),
    [avisosOrdenados, firmasOcultas]
  );

  const cerrarAviso = (firma: string) => {
    setFirmasOcultas(guardarAvisoInicioOculto(cliente.id, firma));
  };

  const vencimientoSat = useMemo(
    () =>
      fechaLimiteSATConOverride(
        cliente.rfc,
        periodoFiscal,
        registroFiscal?.fechaLimiteDeclaracion
      ),
    [cliente.rfc, periodoFiscal, registroFiscal?.fechaLimiteDeclaracion]
  );
  const fechaPresentacion = useMemo(
    () => fechaPresentacionDeclaracion(cliente.rfc, periodoFiscal),
    [cliente.rfc, periodoFiscal]
  );

  const declaracionHecha =
    algunDocumentoFiscalSubido(registroFiscal, cats) ||
    documentosFiscalesCompletos(registroFiscal, cats) ||
    flujo === "declaraciones" ||
    flujo === "pago" ||
    flujo === "completado";
  const pagoSatHecho =
    sinPagoImpuestos ||
    todosPagosValidados(registroFiscal, cats) ||
    todosComprobantesPagoCargados(registroFiscal, cats) ||
    flujo === "pago" ||
    flujo === "completado";

  const anillos = useMemo<AnilloPlazo[]>(() => {
    const plazos: AnilloPlazo[] = [];
    if (portalMuestraHonorarios(cliente)) {
      plazos.push({
        id: "honorarios",
        label: "Honorarios",
        fecha: fechaLimiteDate,
        hecho: pagadoMes,
        href: "/portal/honorarios",
      });
    }
    plazos.push({
      id: "declaracion",
      label: "Declaración",
      fecha: fechaPresentacion,
      hecho: false,
      href: "/portal/cumplimiento",
      tonoFijo: pagoSatHecho
        ? "gris"
        : !declaracionHecha
          ? "rojo"
          : undefined,
    });
    plazos.push({
      id: "pago-sat",
      label: "Pago SAT",
      fecha: vencimientoSat,
      hecho: pagoSatHecho,
      href: "/portal/cumplimiento",
    });
    return plazos;
  }, [
    cliente,
    fechaLimiteDate,
    pagadoMes,
    fechaPresentacion,
    pagoSatHecho,
    declaracionHecha,
    vencimientoSat,
  ]);

  useEffect(() => {
    let vivo = true;
    void fetch("/api/portal/efirma-estado")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { tieneEfirma?: boolean; diasRestantes?: number; vigenciaFin?: string } | null) => {
        if (!vivo || !data?.tieneEfirma) return;
        const dias = Number(data.diasRestantes);
        if (!Number.isFinite(dias) || dias > 30 || dias < -7) return;
        const fin = data.vigenciaFin ? new Date(data.vigenciaFin) : null;
        if (!fin || Number.isNaN(fin.getTime())) return;
        setAnilloEfirma({
          id: "efirma",
          label: "e.firma",
          fecha: fin,
          hecho: false,
          href: waLinkPortal(
            contador?.telefono,
            "Mi e.firma vence pronto, me ayudas a renovarla?"
          ),
          externo: true,
          ventana: 30,
          tonoFijo: tonoEfirma(dias),
          pie:
            dias < 0
              ? "Vencida"
              : dias === 0
                ? "Hoy"
                : `${dias} día${dias === 1 ? "" : "s"}`,
        });
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [contador?.telefono]);

  const anillosVisibles = useMemo(
    () => (anilloEfirma ? [...anillos, anilloEfirma] : anillos),
    [anillos, anilloEfirma]
  );

  const eventosCalendario = useMemo(() => {
    const ev = eventosFiscalesParaCliente(cliente, periodoFiscal, 6);
    if (portalMuestraHonorarios(cliente) && fechaLimiteDate) {
      ev.push({
        tipo: "honorarios",
        etiqueta: `Honorarios — ${MESES_NOM[periodoHoy.mes].toLowerCase()}`,
        fecha: fechaLimiteDate,
        periodo: periodoHoy,
      });
    }
    return ev;
  }, [cliente, periodoFiscal, periodoHoy, fechaLimiteDate]);

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
    if (h >= 5 && h < 12) return { texto: "Buenos días", emoji: "☀️" };
    if (h >= 12 && h < 19) return { texto: "Buenas tardes", emoji: "🌤️" };
    return { texto: "Buenas noches", emoji: "💤" };
  }, [hoy]);

  return (
    <div className={portalInicioPage}>
      <header className="px-1">
        <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          {saludoHora.texto}, {nombreSaludo} {saludoHora.emoji}
        </h1>
        <p className="mt-1 text-[15px] text-slate-500 inline-flex items-center gap-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
          </svg>
          {fmtDiaMes(hoy)}
        </p>
      </header>

      {avisosVisibles.length > 0 ? (
        <PortalInicioPendiente
          acciones={avisosVisibles}
          onCerrar={cerrarAviso}
        />
      ) : null}

      <PortalPlazosAnillos anillos={anillosVisibles} hoy={hoy} />

      {portalMuestraHonorarios(cliente) ? (
        <PortalInicioHonorarios deuda={deudaNeta} pagadoMes={pagadoMes} />
      ) : null}

      {portalMuestraSituacionFiscal(cliente) ? (
        <PortalCarpetaInicio cliente={cliente} />
      ) : null}

      <PortalInicioCalendario
        cliente={cliente}
        eventos={eventosCalendario}
        hoy={hoy}
      />
    </div>
  );
}
