"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useClientes } from "@/context/ClientesContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  type Notificacion,
  EVENTO_DETALLE_NOTIFICACION,
  etiquetaCtaNotificacion,
  formatRelativoNotif,
  hrefDestinoNotificacion,
} from "@/lib/notificaciones";
import { periodoLabel } from "@/lib/clientes";
import { COLORES_TIPO, ETIQUETA_TIPO } from "@/lib/notificaciones-ui";

export default function NotificacionDetalleHost() {
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [detalle, setDetalle] = useState<Notificacion | null>(null);

  useEffect(() => {
    const onDetalle = (e: Event) => {
      const n = (e as CustomEvent<Notificacion>).detail;
      if (n?.id) setDetalle(n);
    };
    window.addEventListener(EVENTO_DETALLE_NOTIFICACION, onDetalle);
    return () =>
      window.removeEventListener(EVENTO_DETALLE_NOTIFICACION, onDetalle);
  }, []);

  if (!montado || !detalle) return null;

  return createPortal(
    <DetalleSheet notificacion={detalle} onCerrar={() => setDetalle(null)} />,
    document.body
  );
}

function DetalleSheet({
  notificacion: n,
  onCerrar,
}: {
  notificacion: Notificacion;
  onCerrar: () => void;
}) {
  const router = useRouter();
  const { listaClientes } = useClientes();
  const [animado, setAnimado] = useState(false);
  useScrollLock(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimado(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAnimado(false);
        setTimeout(onCerrar, 220);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCerrar]);

  const cerrar = () => {
    setAnimado(false);
    setTimeout(onCerrar, 220);
  };

  const cliente = listaClientes.find((c) => c.id === n.clienteId);
  const href = hrefDestinoNotificacion(n);
  const cta = etiquetaCtaNotificacion(n);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-8"
      style={{
        backgroundColor: animado ? "rgba(15, 23, 42, 0.45)" : "rgba(15, 23, 42, 0)",
        backdropFilter: animado ? "blur(4px)" : "blur(0px)",
        WebkitBackdropFilter: animado ? "blur(4px)" : "blur(0px)",
        transition: "background-color 220ms ease, backdrop-filter 220ms ease",
      }}
      onClick={cerrar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md max-h-[80vh] bg-white dark:bg-slate-900 rdc-sheet-up sm:rounded-2xl shadow-[0_-20px_60px_rgba(15,23,42,0.18)] sm:shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col"
        style={{
          transform: animado ? "translateY(0)" : "translateY(24px)",
          opacity: animado ? 1 : 0,
          transition: "transform 260ms cubic-bezier(0.32, 0.72, 0, 1), opacity 220ms ease",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-detalle-titulo"
      >
        <div className="pt-2 pb-1 flex justify-center sm:hidden">
          <span className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/20" />
        </div>

        <button
          type="button"
          onClick={cerrar}
          className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 active:bg-red-100 active:text-red-600 z-10 flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="px-5 pt-4 pb-5 pr-14 overflow-y-auto">
          <span
            className={`inline-flex text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${COLORES_TIPO[n.tipo]}`}
          >
            {ETIQUETA_TIPO[n.tipo]}
          </span>
          <h2
            id="notif-detalle-titulo"
            className="mt-3 text-[17px] font-bold text-slate-900 dark:text-white leading-snug"
          >
            {n.titulo}
          </h2>
          {n.detalle ? (
            <p className="mt-2 text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {n.detalle}
            </p>
          ) : null}
          <dl className="mt-4 space-y-1.5 text-[13px]">
            {cliente ? (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400 font-semibold">Cliente</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-100 text-right truncate">
                  {cliente.razonSocial}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400 font-semibold">Periodo</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">
                {periodoLabel(n.periodo)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400 font-semibold">Cuándo</dt>
              <dd className="font-semibold text-slate-800 dark:text-slate-100">
                {formatRelativoNotif(n.createdAt)}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() => {
              router.push(href, { scroll: false });
              cerrar();
            }}
            className="mt-5 w-full inline-flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 text-white text-[15px] font-semibold py-3 transition-colors"
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
