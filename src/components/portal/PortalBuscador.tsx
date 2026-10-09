"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

type Comando = {
  id: string;
  titulo: string;
  subtitulo?: string;
  href: string;
  externo?: boolean;
};

const COMANDOS: Comando[] = [
  { id: "inicio", titulo: "Inicio", subtitulo: "Resumen de tu cuenta", href: "/portal/inicio" },
  { id: "declaraciones", titulo: "Declaraciones", subtitulo: "Previo, PDFs y pagos del mes", href: "/portal/cumplimiento" },
  { id: "sat", titulo: "Situación fiscal", subtitulo: "Opinión 32-D, CSF y SAT", href: "/portal/sat" },
  { id: "honorarios", titulo: "Honorarios", subtitulo: "Saldo, pagos y comprobantes", href: "/portal/honorarios" },
  { id: "solicitudes", titulo: "Solicitudes", subtitulo: "Trámites y encargos al despacho", href: "/portal/encargos" },
  { id: "perfil", titulo: "Perfil", subtitulo: "Datos y contraseña", href: "/portal/perfil" },
  {
    id: "whatsapp",
    titulo: "WhatsApp con tu contador",
    subtitulo: "Mensaje directo al despacho",
    href: CONTACTO_PUBLICO.whatsapp.url,
    externo: true,
  },
];

type Props = {
  /** `icono` = solo lupa; `barra` = campo con hint ⌘K (escritorio). */
  variante?: "icono" | "barra";
};

export default function PortalBuscador({ variante = "icono" }: Props) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState("");
  const [seleccionado, setSeleccionado] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMANDOS;
    return COMANDOS.filter(
      (c) =>
        c.titulo.toLowerCase().includes(q) ||
        c.subtitulo?.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAbierto(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    setQuery("");
    setSeleccionado(0);
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(t);
    };
  }, [abierto]);

  useEffect(() => {
    setSeleccionado(0);
  }, [query]);

  function ejecutar(c: Comando) {
    setAbierto(false);
    if (c.externo) {
      window.open(c.href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(c.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setAbierto(false);
      return;
    }
    if (filtrados.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSeleccionado((i) => (i + 1) % filtrados.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSeleccionado((i) => (i - 1 + filtrados.length) % filtrados.length);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const c = filtrados[seleccionado];
      if (c) ejecutar(c);
    }
  }

  const triggerClass =
    variante === "barra"
      ? "hidden sm:flex items-center gap-2 h-9 min-w-[12rem] px-3 rounded-lg bg-white ring-1 ring-slate-200 text-sm text-slate-400 hover:ring-slate-300 transition-colors"
      : "flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-[var(--portal-navy)] ring-1 ring-transparent hover:ring-slate-200 transition-colors";

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={triggerClass}
        aria-label="Buscar en el portal"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        {variante === "barra" ? (
          <>
            <span className="flex-1 text-left">Buscar…</span>
            <kbd className="hidden md:inline text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </kbd>
          </>
        ) : null}
      </button>

      {abierto ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh] sm:pt-[15vh]">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]"
            aria-label="Cerrar búsqueda"
            onClick={() => setAbierto(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 border-b border-slate-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0" aria-hidden>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Buscar sección del portal…"
                className="flex-1 h-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
              />
              <kbd className="text-[10px] text-slate-400 hidden sm:inline">Esc</kbd>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {filtrados.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-slate-500">Sin resultados</li>
              ) : (
                filtrados.map((c, i) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => ejecutar(c)}
                      onMouseEnter={() => setSeleccionado(i)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                        i === seleccionado
                          ? "bg-[var(--portal-navy-soft)] ring-1 ring-[var(--portal-navy-border)]"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <p className={`text-sm ${i === seleccionado ? "font-bold text-[var(--portal-navy)]" : "font-medium text-slate-900"}`}>
                        {c.titulo}
                      </p>
                      {c.subtitulo ? (
                        <p className="text-xs text-slate-500 mt-0.5">{c.subtitulo}</p>
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
