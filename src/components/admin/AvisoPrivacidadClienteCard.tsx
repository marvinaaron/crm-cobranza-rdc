"use client";

import { useState } from "react";
import type { Cliente } from "@/lib/clientes";
import { etiquetaEstadoAvisoPrivacidad } from "@/lib/aviso-privacidad";
import { useClientes } from "@/context/ClientesContext";
import { useNotify } from "@/components/ConfirmProvider";

function formatearCorta(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type Props = {
  cliente: Cliente;
};

/**
 * Bloque en el detalle del cliente: estado del aviso + enviar correo formal.
 */
export default function AvisoPrivacidadClienteCard({ cliente }: Props) {
  const { actualizarCliente } = useClientes();
  const notify = useNotify();
  const [enviando, setEnviando] = useState(false);
  const aviso = cliente.avisoPrivacidad;
  const estado = etiquetaEstadoAvisoPrivacidad(aviso);

  const tonoChip =
    estado.tono === "ok"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : estado.tono === "pendiente"
        ? "bg-amber-50 text-amber-800 ring-amber-200"
        : "bg-slate-100 text-slate-600 ring-slate-200";

  const enviar = async () => {
    if (!cliente.email?.trim()) {
      void notify({
        titulo: "Sin correo",
        mensaje: "Registra un correo en el cliente antes de enviar el aviso.",
        tono: "warning",
      });
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/admin/clientes/aviso-privacidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId: cliente.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        void notify({
          titulo: "No se envió",
          mensaje: data.error ?? "Error al enviar el aviso de privacidad.",
          tono: "danger",
        });
        return;
      }
      if (data.avisoPrivacidad) {
        actualizarCliente({
          ...cliente,
          avisoPrivacidad: data.avisoPrivacidad,
        });
      }
      void notify({
        titulo: "Aviso enviado",
        mensaje: `Correo formal enviado a ${data.to}. El cliente acepta en su liga privada; aquí verás el estatus.`,
        tono: "info",
      });
    } catch {
      void notify({
        titulo: "Error de red",
        mensaje: "No se pudo enviar el aviso. Intenta de nuevo.",
        tono: "danger",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Aviso de privacidad
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            Aceptación formal (LFPDPPP)
          </p>
          <span
            className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ${tonoChip}`}
          >
            {estado.label}
          </span>
        </div>
        <button
          type="button"
          disabled={enviando || !cliente.email?.trim()}
          onClick={() => void enviar()}
          className="shrink-0 h-9 px-3 rounded-xl bg-marca-navy text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50"
          title={
            cliente.email?.trim()
              ? "Enviar aviso por correo con liga privada"
              : "Sin correo registrado"
          }
        >
          {enviando
            ? "Enviando…"
            : aviso?.enviadoEn
              ? "Reenviar"
              : "Enviar por correo"}
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <div>
          <dt className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">
            Enviado
          </dt>
          <dd className="text-slate-700 font-medium">
            {formatearCorta(aviso?.enviadoEn)}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">
            Aceptado
          </dt>
          <dd className="text-slate-700 font-medium">
            {formatearCorta(aviso?.aceptadoEn)}
          </dd>
        </div>
      </dl>

      {!cliente.email?.trim() ? (
        <p className="mt-2 text-[10px] text-amber-700">
          Agrega el correo del cliente para poder enviar el aviso.
        </p>
      ) : (
        <p className="mt-2 text-[10px] text-slate-500 leading-relaxed">
          El cliente recibe un correo formal con una liga privada. Al aceptar,
          la fecha queda guardada en este expediente.
        </p>
      )}
    </div>
  );
}
