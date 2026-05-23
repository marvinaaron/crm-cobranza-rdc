"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useClientes } from "@/context/ClientesContext";
import { useEsMovil } from "@/hooks/useEsMovil";
import {
  type Notificacion,
  type DestinatarioNotificacion,
  formatRelativoNotif,
} from "@/lib/notificaciones";

const UMBRAL_CIERRE_PX = 90;

type Props = {
  destinatario: DestinatarioNotificacion;
  /** Si se pasa, el panel sólo muestra notifs de este cliente. */
  clienteId?: number;
  /** Tonalidad del icono. */
  variante?: "light" | "dark";
  /** Tamaño visual de la campana. */
  tamano?: "md" | "sm";
  /** Si es true, abre como ventana modal centrada en lugar de dropdown. */
  comoModal?: boolean;
  /** Título a mostrar arriba del modal cuando comoModal=true. */
  tituloModal?: string;
  /** Si es true, esta instancia escucha el evento global "rdc:abrir-notificaciones". */
  escucharEventoGlobal?: boolean;
};

const BellIcon = ({ active }: { active: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const COLORES_TIPO: Record<Notificacion["tipo"], string> = {
  admin_contabilidad_iniciada: "bg-sky-100 text-sky-700",
  admin_previo_publicado: "bg-indigo-100 text-indigo-700",
  cliente_previo_validado: "bg-amber-100 text-amber-700",
  admin_documentos_listos: "bg-blue-100 text-blue-700",
  cliente_subio_comprobante: "bg-emerald-100 text-emerald-700",
  admin_pago_validado: "bg-emerald-100 text-emerald-700",
  admin_extemporaneo_publicado: "bg-violet-100 text-violet-700",
  admin_sin_pago: "bg-slate-100 text-slate-700",
  vencimiento_sin_pago: "bg-red-100 text-red-700",
  cobranza_cliente_subio_comprobante: "bg-indigo-100 text-indigo-700",
  cobranza_pago_validado: "bg-emerald-100 text-emerald-700",
  cobranza_factura_disponible: "bg-slate-900 text-white",
  cobranza_comprobante_rechazado: "bg-red-100 text-red-700",
  efirma_vence_pronto: "bg-amber-100 text-amber-800",
  admin_efirma_vence_pronto: "bg-amber-100 text-amber-800",
};

const ETIQUETA_TIPO: Record<Notificacion["tipo"], string> = {
  admin_contabilidad_iniciada: "Iniciando",
  admin_previo_publicado: "Previo",
  cliente_previo_validado: "Validación",
  admin_documentos_listos: "Documentos",
  cliente_subio_comprobante: "Comprobante",
  admin_pago_validado: "Pago confirmado",
  admin_extemporaneo_publicado: "Extemporáneo",
  admin_sin_pago: "Sin pago",
  vencimiento_sin_pago: "Vencido",
  cobranza_cliente_subio_comprobante: "Comprobante",
  cobranza_pago_validado: "Pago validado",
  cobranza_factura_disponible: "Factura lista",
  cobranza_comprobante_rechazado: "Reenviar comprobante",
  efirma_vence_pronto: "E.firma",
  admin_efirma_vence_pronto: "E.firma",
};

export default function NotificacionesBell({
  destinatario,
  clienteId,
  variante = "dark",
  tamano = "md",
  comoModal = false,
  tituloModal,
  escucharEventoGlobal = false,
}: Props) {
  const {
    notificacionesAdmin,
    notificacionesAdminNoLeidas,
    notificacionesCliente,
    notificacionesClienteNoLeidas,
    marcarNotificacionLeida,
    marcarNotificacionesLeidas,
  } = useClientes();

  const [abierto, setAbierto] = useState(false);
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [abrirHacia, setAbrirHacia] = useState<"izquierda" | "derecha">(
    "izquierda"
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const esMovil = useEsMovil();
  const usarModal = comoModal || esMovil;

  // Decide hacia qué lado abrir el popup según el espacio disponible:
  // si la campana queda más cerca del borde izquierdo del viewport, abre
  // hacia la derecha; en caso contrario (lo habitual: campana en la
  // esquina superior derecha), abre hacia la izquierda.
  function calcularLado(): "izquierda" | "derecha" {
    if (typeof window === "undefined") return "izquierda";
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return "izquierda";
    const ANCHO_POPUP = 360;
    const espacioDerecha = window.innerWidth - rect.right;
    if (rect.left < ANCHO_POPUP - 40 && espacioDerecha > rect.left) {
      return "derecha";
    }
    return "izquierda";
  }

  const lista =
    destinatario === "admin"
      ? clienteId != null
        ? notificacionesAdmin.filter((n) => n.clienteId === clienteId)
        : notificacionesAdmin
      : clienteId != null
        ? notificacionesCliente(clienteId)
        : [];

  const noLeidas =
    destinatario === "admin"
      ? clienteId != null
        ? notificacionesAdmin.filter(
            (n) => n.clienteId === clienteId && !n.leidaEn
          ).length
        : notificacionesAdminNoLeidas
      : clienteId != null
        ? notificacionesClienteNoLeidas(clienteId)
        : 0;

  useEffect(() => {
    if (!abierto || usarModal) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [abierto, usarModal]);

  useEffect(() => {
    if (!abierto || !usarModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [abierto, usarModal]);

  useEffect(() => {
    if (!escucharEventoGlobal) return;
    const onAbrir = () => {
      setAbrirHacia(calcularLado());
      setAbierto(true);
    };
    window.addEventListener("rdc:abrir-notificaciones", onAbrir);
    return () =>
      window.removeEventListener("rdc:abrir-notificaciones", onAbrir);
  }, [escucharEventoGlobal]);

  const tonoBoton =
    variante === "light"
      ? "text-white/90 hover:text-white hover:bg-white/10"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100";
  const tamañoBoton = tamano === "sm" ? "p-1.5" : "p-2.5";
  const tamañoBadge =
    tamano === "sm"
      ? "min-w-[14px] h-[14px] text-[9px] -top-0 -right-0"
      : "min-w-[18px] h-[18px] text-[10px] -top-0.5 -right-0.5";

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!abierto) setAbrirHacia(calcularLado());
          setAbierto((v) => !v);
        }}
        className={`relative ${tamañoBoton} rounded-full transition-colors ${tonoBoton}`}
        aria-label="Notificaciones"
      >
        <BellIcon active={noLeidas > 0} />
        {noLeidas > 0 && (
          <span
            className={`absolute ${tamañoBadge} rounded-full bg-red-500 text-white font-black flex items-center justify-center px-1 ring-2 ring-white`}
          >
            {noLeidas > 99 ? "99+" : noLeidas}
          </span>
        )}
      </button>

      {abierto && !usarModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute ${
            abrirHacia === "derecha" ? "left-0" : "right-0"
          } mt-2 w-[360px] max-w-[min(92vw,360px)] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-slate-100 z-[60] overflow-hidden flex flex-col`}
        >
          <PanelInterior
            destinatario={destinatario}
            clienteId={clienteId}
            tituloModal={tituloModal}
            noLeidas={noLeidas}
            lista={lista}
            onMarcarLeida={marcarNotificacionLeida}
            onMarcarTodas={() =>
              marcarNotificacionesLeidas(destinatario, clienteId)
            }
            onCerrar={() => setAbierto(false)}
          />
        </div>
      )}

      {montado &&
        abierto &&
        usarModal &&
        createPortal(
          <BottomSheetNotificaciones
            destinatario={destinatario}
            clienteId={clienteId}
            tituloModal={tituloModal}
            noLeidas={noLeidas}
            lista={lista}
            onMarcarLeida={marcarNotificacionLeida}
            onMarcarTodas={() =>
              marcarNotificacionesLeidas(destinatario, clienteId)
            }
            onCerrar={() => setAbierto(false)}
            esMovil={esMovil}
          />,
          document.body
        )}
    </div>
  );
}

function BottomSheetNotificaciones({
  destinatario,
  clienteId,
  tituloModal,
  noLeidas,
  lista,
  onMarcarLeida,
  onMarcarTodas,
  onCerrar,
  esMovil,
}: {
  destinatario: DestinatarioNotificacion;
  clienteId?: number;
  tituloModal?: string;
  noLeidas: number;
  lista: Notificacion[];
  onMarcarLeida: (id: string) => void;
  onMarcarTodas: () => void;
  onCerrar: () => void;
  esMovil: boolean;
}) {
  const [arrastrandoY, setArrastrandoY] = useState(0);
  const [animado, setAnimado] = useState(false);
  const inicioYRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimado(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const cerrarConAnimacion = () => {
    setAnimado(false);
    setTimeout(() => onCerrar(), 220);
  };

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!esMovil) return;
    inicioYRef.current = e.touches[0].clientY;
  };
  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!esMovil || inicioYRef.current == null) return;
    const dy = e.touches[0].clientY - inicioYRef.current;
    if (dy > 0) {
      setArrastrandoY(dy);
    }
  };
  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    if (!esMovil) return;
    if (arrastrandoY > UMBRAL_CIERRE_PX) {
      cerrarConAnimacion();
    } else {
      setArrastrandoY(0);
    }
    inicioYRef.current = null;
  };

  const fondoOpacidad = animado
    ? Math.max(0.1, 0.45 - arrastrandoY / 600)
    : 0;

  const traduccion = animado ? arrastrandoY : 600;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-8"
      style={{
        backgroundColor: `rgba(15, 23, 42, ${fondoOpacidad})`,
        backdropFilter: animado ? "blur(4px)" : "blur(0px)",
        WebkitBackdropFilter: animado ? "blur(4px)" : "blur(0px)",
        transition: "background-color 220ms ease, backdrop-filter 220ms ease",
      }}
      onClick={(e) => {
        e.stopPropagation();
        cerrarConAnimacion();
      }}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md h-[82vh] sm:h-auto sm:max-h-[85vh] bg-white rounded-t-[1.75rem] sm:rounded-2xl shadow-[0_-20px_60px_rgba(15,23,42,0.18)] sm:shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
        style={{
          transform: `translateY(${traduccion}px)`,
          transition:
            inicioYRef.current != null
              ? "none"
              : "transform 260ms cubic-bezier(0.32, 0.72, 0, 1)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div
          className="pt-2 pb-1 flex justify-center sm:hidden touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <span className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            cerrarConAnimacion();
          }}
          className="hidden sm:flex absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 z-10 items-center justify-center"
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

        <div ref={scrollRef} className="flex-1 overflow-hidden flex flex-col">
          <PanelInterior
            destinatario={destinatario}
            clienteId={clienteId}
            tituloModal={tituloModal}
            noLeidas={noLeidas}
            lista={lista}
            onMarcarLeida={onMarcarLeida}
            onMarcarTodas={onMarcarTodas}
            onCerrar={cerrarConAnimacion}
          />
        </div>
      </div>
    </div>
  );
}

function PanelInterior({
  tituloModal,
  noLeidas,
  lista,
  onMarcarLeida,
  onMarcarTodas,
  onCerrar,
}: {
  destinatario: DestinatarioNotificacion;
  clienteId?: number;
  tituloModal?: string;
  noLeidas: number;
  lista: Notificacion[];
  onMarcarLeida: (id: string) => void;
  onMarcarTodas: () => void;
  onCerrar: () => void;
}) {
  return (
    <>
      <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 pr-12">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {tituloModal ?? "Notificaciones"}
          </p>
          <p className="text-xs font-bold text-slate-700">
            {noLeidas > 0 ? `${noLeidas} sin leer` : "Estás al día"}
          </p>
        </div>
        {noLeidas > 0 && (
          <button
            type="button"
            onClick={onMarcarTodas}
            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800"
          >
            Marcar todas
          </button>
        )}
      </header>

      <div className="overflow-y-auto flex-1">
        {lista.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs font-bold text-slate-400">
            Sin notificaciones todavía.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {lista.slice(0, 50).map((n) => {
              const contenido = (
                <div className="flex gap-3 items-start">
                  <span
                    className={`mt-0.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${COLORES_TIPO[n.tipo]}`}
                  >
                    {ETIQUETA_TIPO[n.tipo]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs leading-snug ${n.leidaEn ? "font-bold text-slate-600" : "font-black text-slate-900"}`}
                    >
                      {n.titulo}
                    </p>
                    {n.detalle && (
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {n.detalle}
                      </p>
                    )}
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      {formatRelativoNotif(n.createdAt)}
                    </p>
                  </div>
                  {!n.leidaEn && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  )}
                </div>
              );

              const handleClick = () => {
                if (!n.leidaEn) onMarcarLeida(n.id);
                onCerrar();
              };

              return (
                <li key={n.id}>
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={handleClick}
                      className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      {contenido}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClick}
                      className="block w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      {contenido}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
