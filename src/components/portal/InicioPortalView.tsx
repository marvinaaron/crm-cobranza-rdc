"use client";

import { useMemo } from "react";
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
  type AnilloPlazo,
} from "@/components/portal/PortalPlazosAnillos";
import PortalInicioHonorarios from "@/components/portal/PortalInicioHonorarios";
import PortalCarpetaInicio from "@/components/portal/PortalCarpetaInicio";
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
  fechaLimiteSAT,
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
  const hoy = useMemo(() => new Date(), []);
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

  const accionesSat = useMemo<AccionPortal[]>(() => {
    const out: AccionPortal[] = [];
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
    cumplimiento,
    periodoFiscal,
    hoy,
    cats,
  ]);

  const pendientePrincipal =
    ordenarPendientesInicio(accionesSat)[0] ?? null;

  const vencimientoSat = useMemo(
    () => fechaLimiteSAT(cliente.rfc, periodoFiscal),
    [cliente.rfc, periodoFiscal]
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

  return (
    <div className={portalInicioPage}>
      <header className="px-1">
        <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          {saludoHora}, {nombreSaludo}
        </h1>
        <p className="mt-1 text-[15px] text-slate-500">{fmtDiaMes(hoy)}</p>
      </header>

      {pendientePrincipal ? (
        <PortalInicioPendiente accion={pendientePrincipal} />
      ) : null}

      <PortalPlazosAnillos anillos={anillos} hoy={hoy} />

      {portalMuestraHonorarios(cliente) ? (
        <PortalInicioHonorarios deuda={deudaNeta} pagadoMes={pagadoMes} />
      ) : null}

      {portalMuestraSituacionFiscal(cliente) ? (
        <PortalCarpetaInicio cliente={cliente} />
      ) : null}
    </div>
  );
}
