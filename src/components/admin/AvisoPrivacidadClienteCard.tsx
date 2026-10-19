"use client";

import { useEffect, useRef, useState } from "react";
import type { Cliente } from "@/lib/clientes";
import type { AvisoPrivacidadCliente } from "@/lib/aviso-privacidad";
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
  onActualizado?: (aviso: AvisoPrivacidadCliente) => void;
};

const ShieldIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/**
 * Icono junto a Editar / Portal: mini menú con el estado del aviso LFPDPPP.
 * Si ya se envió, el control queda gris e inactivo (solo consulta).
 */
export default function AvisoPrivacidadMenu({ cliente, onActualizado }: Props) {
  const { actualizarCliente } = useClientes();
  const notify = useNotify();
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const aviso = cliente.avisoPrivacidad;
  const estado = etiquetaEstadoAvisoPrivacidad(aviso);
  const enviado = Boolean(aviso?.enviadoEn);
  const sinCorreo = !cliente.email?.trim();

  useEffect(() => {
    if (!abierto) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [abierto]);

  const enviar = async () => {
    if (enviado || sinCorreo) return;
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
        onActualizado?.(data.avisoPrivacidad);
      }
      void notify({
        titulo: "Aviso enviado",
        mensaje: `Correo formal enviado a ${data.to}.`,
        tono: "info",
      });
      setAbierto(false);
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
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        title={
          enviado
            ? `Aviso de privacidad · ${estado.label}`
            : "Aviso de privacidad · sin enviar"
        }
        aria-label="Aviso de privacidad"
        aria-expanded={abierto}
        className={`h-9 w-9 inline-flex items-center justify-center rounded-full ${
          enviado
            ? "bg-slate-100 text-slate-400"
            : "bg-slate-100 text-slate-800 hover:bg-slate-200"
        }`}
      >
        <ShieldIcon />
      </button>

      {abierto ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-[17.5rem] rounded-[1.1rem] bg-white p-3 shadow-lg ring-1 ring-black/[0.06]">
          <p className="text-[11px] font-semibold text-slate-400">
            Aviso de privacidad
          </p>
          <p className="mt-0.5 text-[13px] font-semibold text-slate-900">
            {estado.label}
          </p>
          {aviso?.enviadoEn ? (
            <p className="mt-2 text-[12px] text-slate-500">
              Enviado {formatearCorta(aviso.enviadoEn)}
            </p>
          ) : null}
          {aviso?.aceptadoEn ? (
            <p className="text-[12px] text-slate-500">
              Aceptado {formatearCorta(aviso.aceptadoEn)}
            </p>
          ) : null}

          {enviado ? (
            <p className="mt-2 text-[12px] text-slate-400">Ya está enviado.</p>
          ) : sinCorreo ? (
            <p className="mt-2 text-[12px] text-amber-700">
              Agrega el correo del cliente para poder enviarlo.
            </p>
          ) : (
            <button
              type="button"
              disabled={enviando}
              onClick={() => void enviar()}
              className="mt-2.5 w-full h-9 rounded-full bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {enviando ? "Enviando…" : "Enviar aviso"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
