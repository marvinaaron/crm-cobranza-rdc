"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ModalClientePro from "@/components/publico/ModalClientePro";

type Props = {
  className?: string;
};

export default function AccesoMenu({ className = "" }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [modalPro, setModalPro] = useState(false);
  const [esPro, setEsPro] = useState(false);
  const [montado, setMontado] = useState(false);
  const [esMovil, setEsMovil] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!abierto || !esMovil) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [abierto, esMovil]);

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
          ? "fixed left-4 right-4 top-[max(5.5rem,env(safe-area-inset-top))] z-[320] rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/20 py-2"
          : "absolute right-0 top-full mt-1.5 w-72 sm:w-80 rounded-xl bg-white border border-slate-200 shadow-xl shadow-slate-900/10 py-2 z-[200]"
      }
    >
      <Link
        href="/portal/login"
        onClick={() => setAbierto(false)}
        className="block px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <span className="block text-sm font-semibold text-slate-900">
          Portal del Cliente
        </span>
        <span className="mt-0.5 block text-xs text-slate-500 leading-relaxed">
          Entra a tu portal con correo y contraseña
        </span>
      </Link>
      <div className="mx-3 border-t border-slate-100" />
      <button
        type="button"
        onClick={onClientePro}
        className="w-full text-left px-4 py-3 hover:bg-violet-50 transition-colors flex items-start justify-between gap-3"
      >
        <span>
          <span className="block text-sm font-semibold text-violet-800">
            Cliente Pro
          </span>
          <span className="mt-0.5 block text-xs text-violet-600/90 leading-relaxed">
            Herramientas fiscales ilimitadas
          </span>
        </span>
        {esPro ? (
          <span className="shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Activo
          </span>
        ) : (
          <span className="shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full">
            Herramientas
          </span>
        )}
      </button>
    </div>
  );

  return (
    <>
      <div className={`relative ${className}`} ref={ref}>
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="inline-flex w-full lg:w-auto items-center justify-center lg:justify-start gap-1 px-4 py-2.5 lg:py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap"
          aria-expanded={abierto}
          aria-haspopup="true"
        >
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
        </button>

        {abierto && !esMovil ? panel : null}
      </div>

      {montado && abierto && esMovil
        ? createPortal(
            <>
              <button
                type="button"
                className="fixed inset-0 z-[310] bg-slate-950/45 backdrop-blur-[1px]"
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
