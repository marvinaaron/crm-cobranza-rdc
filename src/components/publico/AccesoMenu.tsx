"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ModalClientePro from "@/components/publico/ModalClientePro";

type Props = {
  className?: string;
};

export default function AccesoMenu({ className = "" }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [modalPro, setModalPro] = useState(false);
  const [esPro, setEsPro] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/herramientas/pro/estado")
      .then((r) => r.json())
      .then((d: { esPro?: boolean }) => setEsPro(Boolean(d.esPro)))
      .catch(() => {});
  }, [modalPro]);

  useEffect(() => {
    if (!abierto) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [abierto]);

  const onClientePro = () => {
    setAbierto(false);
    if (esPro) {
      window.location.href = "/herramientas";
      return;
    }
    setModalPro(true);
  };

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

        {abierto ? (
          <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 rounded-xl bg-white border border-slate-200 shadow-xl shadow-slate-900/10 py-2 z-[200]">
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
        ) : null}
      </div>

      <ModalClientePro abierto={modalPro} onCerrar={() => setModalPro(false)} />
    </>
  );
}
