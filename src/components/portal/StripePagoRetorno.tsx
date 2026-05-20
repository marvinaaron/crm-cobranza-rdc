"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useClientes } from "@/context/ClientesContext";
import { usePortalAuth } from "@/context/PortalAuthContext";
import {
  marcarSesionStripeProcesada,
  sesionStripeYaProcesada,
} from "@/lib/stripe-sesiones-procesadas";
import type { Periodo } from "@/lib/clientes";

type PagoVerificado = {
  periodo: Periodo;
  montoHonorarios: number;
};

export default function StripePagoRetorno() {
  const searchParams = useSearchParams();
  const { registrarPago } = useClientes();
  const { cliente } = usePortalAuth();
  const procesadoRef = useRef(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "ok" | "error" | "info";
    texto: string;
  } | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("stripe_session_id");
    const cancelado = searchParams.get("stripe_cancelado");

    if (cancelado) {
      setMensaje({ tipo: "info", texto: "Pago cancelado. Puede intentarlo cuando guste." });
      limpiarUrl();
      return;
    }

    if (!sessionId || !cliente || procesadoRef.current) return;
    if (sesionStripeYaProcesada(sessionId)) {
      setMensaje({ tipo: "ok", texto: "Este pago ya fue registrado en su cuenta." });
      limpiarUrl();
      return;
    }

    procesadoRef.current = true;

    (async () => {
      try {
        const res = await fetch(
          `/api/stripe/verificar?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          clienteId?: number;
          pagos?: PagoVerificado[];
          montoHonorarios?: number;
        };

        if (!res.ok || !data.ok || !data.pagos?.length) {
          setMensaje({
            tipo: "error",
            texto: data.error ?? "No se pudo confirmar el pago.",
          });
          procesadoRef.current = false;
          return;
        }

        if (data.clienteId !== cliente.id) {
          setMensaje({ tipo: "error", texto: "El pago no corresponde a su sesión." });
          procesadoRef.current = false;
          return;
        }

        for (const pago of data.pagos) {
          registrarPago(
            cliente.id,
            pago.periodo,
            pago.montoHonorarios,
            "Pago con tarjeta (Stripe)"
          );
        }

        marcarSesionStripeProcesada(sessionId);

        const total =
          data.montoHonorarios ??
          data.pagos.reduce((s, p) => s + p.montoHonorarios, 0);

        const textoOk =
          data.pagos.length > 1
            ? `Pago recibido por $${total.toLocaleString("es-MX")} (${data.pagos.length} meses). Su cuenta se actualizará en unos segundos.`
            : `Pago recibido por $${total.toLocaleString("es-MX")}. Su estado de cuenta se actualizará en unos segundos.`;

        setMensaje({ tipo: "ok", texto: textoOk });
      } catch {
        setMensaje({ tipo: "error", texto: "Error al verificar el pago." });
        procesadoRef.current = false;
      } finally {
        limpiarUrl();
      }
    })();
  }, [searchParams, cliente, registrarPago]);

  if (!mensaje) return null;

  const estilos =
    mensaje.tipo === "ok"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : mensaje.tipo === "error"
        ? "bg-red-50 border-red-200 text-red-800"
        : "bg-slate-100 border-slate-200 text-slate-700";

  return (
    <div className={`rounded-[2rem] border px-6 py-4 ${estilos}`}>
      <p className="text-sm font-black">{mensaje.texto}</p>
    </div>
  );
}

function limpiarUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("stripe_session_id");
  url.searchParams.delete("stripe_cancelado");
  window.history.replaceState({}, "", url.pathname + url.search);
}
