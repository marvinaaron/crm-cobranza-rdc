"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ModalClientePro from "@/components/publico/ModalClientePro";
import { useScrollLock } from "@/hooks/useScrollLock";

type Props = {
  className?: string;
  /** `icono` = avatar junto a la lupa (móvil). `boton` = “Acceso” (escritorio). */
  variante?: "boton" | "icono";
  onAbrir?: () => void;
};

function IconoUsuario() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/** Rayo amarillo suelto, sin recuadro. */
function RayoPortal({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden>
      <path
        d="M13.15 2.05 3.55 13.45c-.32.38-.04.95.47.95H12l-1.28 7.15c-.08.42.46.68.75.36l9.6-11.4c.32-.38.04-.95-.47-.95H12.05l1.48-7.1c.09-.43-.47-.7-.78-.41Z"
        fill="#F5C518"
        stroke="#4C1D95"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AccesoMenu({
  className = "",
  variante = "boton",
  onAbrir,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [modalPro, setModalPro] = useState(false);
  const [esPro, setEsPro] = useState(false);
  const [montado, setMontado] = useState(false);
  const [esMovil, setEsMovil] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useScrollLock(abierto && esMovil);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setEsMovil(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    fetch("/api/herramientas/pro/estado")
      .then((r) => r.json())
      .then((d: { esPro?: boolean }) => setEsPro(Boolean(d.esPro)))
      .catch(() => {});
  }, [modalPro]);

  useEffect(() => {
    if (!abierto) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement | null;
        if (target?.closest("[data-acceso-panel]")) return;
        setAbierto(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [abierto]);


  const onClientePro = () => {
    setAbierto(false);
    if (esPro) {
      window.location.href = "/herramientas";
      return;
    }
    setModalPro(true);
  };

  const panel = (
    <div
      data-acceso-panel
      className={
        esMovil
          ? "rdc-acceso-panel fixed left-3 right-3 top-[max(5.25rem,env(safe-area-inset-top))] z-[320] rounded-[1.75rem] bg-white border border-slate-200/80 shadow-[0_28px_70px_-18px_rgba(15,29,46,0.45)] p-3"
          : "rdc-acceso-panel absolute right-0 top-full mt-2 w-[23.5rem] rounded-[1.75rem] bg-white border border-slate-200/80 shadow-[0_28px_70px_-18px_rgba(15,29,46,0.45)] p-3 z-[200]"
      }
    >
      <p className="px-2 pt-1 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        Iniciar sesión
      </p>

      <Link
        href="/portal/login"
        onClick={() => setAbierto(false)}
        className="group relative block overflow-hidden rounded-2xl bg-marca-navy p-5 text-white shadow-lg shadow-marca-navy/30 transition-transform hover:scale-[1.01] active:scale-[0.99]"
      >
        <span
          className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-marca-acento/30 blur-2xl"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-amber-300/20 blur-2xl"
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <img
            src="/apple-touch-icon-v2.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-[13px] shadow-md shadow-black/25"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-300">
              Clientes RDC
            </p>
            <p className="text-[1.2rem] font-black leading-tight tracking-tight">
              Portal del Cliente
            </p>
          </div>
          <RayoPortal className="h-9 w-9" />
        </div>
        <p className="relative mt-3 text-sm leading-relaxed text-white/75">
          Entra con tu correo y contraseña para honorarios, CFDI y
          cumplimiento.
        </p>
        <span className="relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-bold text-marca-navy shadow-sm">
          Entrar al portal
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      </Link>

      <button
        type="button"
        onClick={onClientePro}
        className="mt-2 w-full rounded-2xl border border-marca-acento/20 bg-gradient-to-br from-marca-acento/[0.08] to-white px-4 py-3.5 text-left transition-colors hover:border-marca-acento/40 hover:bg-marca-acento/[0.12]"
      >
        <span className="flex items-start justify-between gap-3">
          <span>
            <span className="block text-sm font-bold text-marca-navy">
              Cliente Pro
            </span>
            <span className="mt-0.5 block text-xs text-slate-500 leading-relaxed">
              Herramientas fiscales ilimitadas
            </span>
          </span>
          {esPro ? (
            <span className="shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Activo
            </span>
          ) : (
            <span className="shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wide text-marca-acento bg-marca-acento/10 px-2 py-0.5 rounded-full">
              Herramientas
            </span>
          )}
        </span>
      </button>
    </div>
  );

  return (
    <>
      <div className={`relative ${className}`} ref={ref}>
        <button
          type="button"
          onClick={() => {
            setAbierto((v) => {
              const next = !v;
              if (next) onAbrir?.();
              return next;
            });
          }}
          className={
            variante === "icono"
              ? "inline-flex items-center justify-center h-9 w-9 rounded-full text-slate-500 hover:text-marca-navy hover:bg-marca-navy/5 transition-colors"
              : "inline-flex w-full lg:w-auto items-center justify-center lg:justify-start gap-1.5 px-3.5 py-2.5 lg:py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap"
          }
          aria-expanded={abierto}
          aria-haspopup="true"
          aria-label={variante === "icono" ? "Acceso al portal" : undefined}
        >
          {variante === "icono" ? (
            <IconoUsuario />
          ) : (
            <>
              <IconoUsuario />
              Acceso
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`text-slate-400 transition-transform ${abierto ? "rotate-180" : ""}`}
                aria-hidden
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </>
          )}
        </button>

        {abierto && !esMovil ? panel : null}
      </div>

      {montado && abierto && esMovil
        ? createPortal(
            <>
              <button
                type="button"
                className="rdc-spotlight-backdrop fixed inset-0 z-[310] bg-marca-navy/40 backdrop-blur-sm"
                aria-label="Cerrar acceso"
                onClick={() => setAbierto(false)}
              />
              {panel}
            </>,
            document.body
          )
        : null}

      <ModalClientePro abierto={modalPro} onCerrar={() => setModalPro(false)} />
    </>
  );
}
