"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import {
  formatRelativoNotif,
  type Notificacion,
  type TipoNotificacion,
} from "@/lib/notificaciones";

/**
 * Mini-feed de notificaciones recientes para el inicio del portal.
 *
 * Muestra las últimas 3 notificaciones (no leídas primero, luego las más
 * recientes). La campanita del header sigue siendo la fuente completa con
 * historial y búsqueda; este bloque es una pista visual rápida para que
 * el cliente vea movimiento sin abrir el panel.
 *
 * El botón "Ver todas" dispara el mismo CustomEvent que abre la campanita.
 */

const COLOR_POR_TIPO: Partial<Record<TipoNotificacion, { dot: string; bg: string; border: string }>> = {
  admin_previo_publicado: {
    dot: "bg-amber-500",
    bg: "bg-amber-50/60",
    border: "border-amber-100",
  },
  admin_documentos_listos: {
    dot: "bg-blue-500",
    bg: "bg-blue-50/60",
    border: "border-blue-100",
  },
  admin_pago_validado: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50/60",
    border: "border-emerald-100",
  },
  admin_sin_pago: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50/60",
    border: "border-emerald-100",
  },
  vencimiento_sin_pago: {
    dot: "bg-red-500",
    bg: "bg-red-50/60",
    border: "border-red-100",
  },
  cobranza_pago_validado: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50/60",
    border: "border-emerald-100",
  },
  cobranza_factura_disponible: {
    dot: "bg-violet-500",
    bg: "bg-violet-50/60",
    border: "border-violet-100",
  },
  cobranza_comprobante_rechazado: {
    dot: "bg-red-500",
    bg: "bg-red-50/60",
    border: "border-red-100",
  },
  efirma_vence_pronto: {
    dot: "bg-amber-500",
    bg: "bg-amber-50/60",
    border: "border-amber-100",
  },
};

const COLOR_DEFAULT = {
  dot: "bg-slate-400",
  bg: "bg-slate-50/60",
  border: "border-slate-100",
};

function abrirCampanita() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("rdc:abrir-notificaciones"));
}

export default function PortalNotificacionesRecientes({
  clienteId,
  total = 3,
}: {
  clienteId: number;
  total?: number;
}) {
  const { notificacionesCliente, marcarNotificacionLeida } = useClientes();
  // Re-renderizar cuando el contexto actualiza (las del cliente se calculan
  // con useMemo internamente al consumir notificacionesCliente).
  const todas: Notificacion[] = notificacionesCliente(clienteId);
  // El "ahora" se calcula una sola vez en cliente para evitar mismatch SSR.
  const [ahora, setAhora] = useState(0);
  useEffect(() => {
    setAhora(Date.now());
  }, [todas.length]);

  if (todas.length === 0) return null;

  // Priorizamos no leídas; si hay menos que `total`, completamos con leídas
  // recientes para no dejar el bloque vacío.
  const noLeidas = todas.filter((n) => !n.leidaEn).slice(0, total);
  const restantes = total - noLeidas.length;
  const items = [
    ...noLeidas,
    ...(restantes > 0
      ? todas.filter((n) => !!n.leidaEn).slice(0, restantes)
      : []),
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Avisos recientes
        </p>
        <button
          type="button"
          onClick={abrirCampanita}
          className="text-[10px] font-black uppercase tracking-widest text-blue-700 hover:text-blue-800"
        >
          Ver todos
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((n) => {
          const color = COLOR_POR_TIPO[n.tipo] ?? COLOR_DEFAULT;
          const contenido = (
            <div
              className={`flex items-start gap-3 px-4 py-3 rounded-2xl border ${color.bg} ${color.border} ${
                n.leidaEn ? "opacity-70" : ""
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${color.dot}`}
                aria-hidden
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-800 truncate">
                    {n.titulo}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 shrink-0">
                    {ahora ? formatRelativoNotif(n.createdAt, ahora) : ""}
                  </p>
                </div>
                {n.detalle && (
                  <p className="text-[12px] font-bold text-slate-500 mt-0.5 leading-snug line-clamp-2">
                    {n.detalle}
                  </p>
                )}
              </div>
            </div>
          );

          const handleClick = () => {
            if (!n.leidaEn) marcarNotificacionLeida(n.id);
          };

          if (n.href) {
            return (
              <li key={n.id}>
                <Link
                  href={n.href}
                  onClick={handleClick}
                  className="block hover:opacity-95 transition-opacity"
                >
                  {contenido}
                </Link>
              </li>
            );
          }
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={handleClick}
                className="w-full text-left hover:opacity-95 transition-opacity"
              >
                {contenido}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
