"use client";

import { useMemo, useState } from "react";
import { type Cliente, type Periodo, periodoLabel } from "@/lib/clientes";
import {
  type RegistroCumplimiento,
  cierreContableCapturado,
  formatMontoImpuesto,
  formatFechaLimiteImpuestoCorta,
  getTotalImpuestos,
  getFechaLimitePrincipal,
} from "@/lib/cumplimiento";
import { useClientes } from "@/context/ClientesContext";
import { usePortalAuth } from "@/context/PortalAuthContext";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";
import { usePortalContadorAsignado } from "@/components/portal/usePortalContadorAsignado";
import { mensajeWhatsAppPortal, waLinkPortal } from "@/lib/portal/whatsapp";

type Props = {
  cliente: Cliente;
  periodo: Periodo;
  registro: RegistroCumplimiento;
  /** Ya se registró que el cliente vio el resumen (paso completado). */
  visto?: boolean;
  /** Solo el enlace de duda, sin repetir las cifras. */
  soloDuda?: boolean;
};

export default function PrevioValidacionCategorias({
  cliente,
  periodo,
  registro,
  visto = false,
  soloDuda = false,
}: Props) {
  const { marcarDudaPrevioCliente, agregarNotificacion, confirmarPreviewCliente } =
    useClientes();
  const { cliente: sesion } = usePortalAuth();
  const { perfil } = usePortalPerfil();
  const { contador } = usePortalContadorAsignado();
  const [avisoDuda, setAvisoDuda] = useState(false);
  const [marcandoVisto, setMarcandoVisto] = useState(false);

  const pausadoPorDuda = !!registro.clienteDudaPrevioEn;
  const labelPeriodo = periodoLabel(periodo);
  const cierreOk = cierreContableCapturado(registro);
  const ingresos = cierreOk ? registro.cierreContable?.ingresos ?? 0 : null;
  const gastos = cierreOk ? registro.cierreContable?.gastos ?? 0 : null;
  const aPagar = getTotalImpuestos(registro);
  const fechaPago =
    getFechaLimitePrincipal(registro) || registro.fechaLimite?.trim() || "";

  const nombreCliente =
    perfil?.perfil.nombre?.trim() ||
    sesion?.razonSocial?.split(/[ ,]/)[0] ||
    cliente.razonSocial.split(/[ ,]/)[0] ||
    undefined;

  const urlDudaWhatsApp = useMemo(() => {
    const msg = mensajeWhatsAppPortal("duda_impuestos", {
      nombre: nombreCliente,
      periodo: labelPeriodo,
    });
    return waLinkPortal(contador?.telefono, msg);
  }, [nombreCliente, labelPeriodo, contador?.telefono]);

  const avisarDuda = () => {
    marcarDudaPrevioCliente(cliente.id, periodo);
    if (!avisoDuda) {
      agregarNotificacion({
        tipo: "cliente_duda_previo",
        destinatario: "admin",
        clienteId: cliente.id,
        periodo,
        titulo: `❓ ${cliente.razonSocial} tiene duda del importe · ${labelPeriodo}`,
        detalle:
          "Declaración en pausa. El cliente te escribe por WhatsApp. Márcalo para continuar si quieres saltar la espera.",
        href: "/cumplimiento",
      });
      setAvisoDuda(true);
    }
  };

  const marcarVisto = () => {
    if (visto || marcandoVisto) return;
    setMarcandoVisto(true);
    confirmarPreviewCliente(cliente.id, periodo);
    setMarcandoVisto(false);
  };

  const duda = (
    <a
      href={urlDudaWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      onClick={avisarDuda}
      className={`inline-flex items-center justify-center w-full py-2.5 rounded-xl border text-[12px] font-semibold ${
        pausadoPorDuda || avisoDuda
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {pausadoPorDuda || avisoDuda
        ? "Duda enviada · WhatsApp"
        : "¿Duda del importe? Escríbenos"}
    </a>
  );

  if (soloDuda) {
    return duda;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold text-slate-500 leading-snug">
          Cifras de {labelPeriodo}
        </p>
        {visto ? (
          <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide">
            Visto
          </span>
        ) : null}
      </div>

      <ul className="space-y-2.5">
        <FilaResumen
          label="Ingresos"
          valor={ingresos == null ? "—" : formatMontoImpuesto(ingresos)}
        />
        <FilaResumen
          label="Gastos"
          valor={gastos == null ? "—" : formatMontoImpuesto(gastos)}
        />
        <FilaResumen
          label="A pagar"
          valor={formatMontoImpuesto(aPagar)}
          destacado
        />
        <FilaResumen
          label="Fecha de pago"
          valor={
            fechaPago ? formatFechaLimiteImpuestoCorta(fechaPago) : "Por confirmar"
          }
        />
      </ul>

      {!visto ? (
        <button
          type="button"
          disabled={marcandoVisto}
          onClick={marcarVisto}
          className="w-full py-3 rounded-xl bg-[var(--portal-navy)] text-white text-[12px] font-bold hover:opacity-90 disabled:opacity-50"
        >
          Marcar como visto
        </button>
      ) : null}

      {duda}
    </div>
  );
}

function FilaResumen({
  label,
  valor,
  destacado = false,
}: {
  label: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <li className="flex items-baseline justify-between gap-3">
      <span
        className={`text-[13px] font-semibold ${
          destacado ? "text-slate-800" : "text-slate-500"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-[15px] font-semibold tabular-nums ${
          destacado ? "text-slate-900" : "text-slate-800"
        }`}
      >
        {valor}
      </span>
    </li>
  );
}
