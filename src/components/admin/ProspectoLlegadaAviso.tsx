"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Fiscalino from "@/components/Fiscalino";
import type { SiteLead } from "@/lib/site-leads-db";
import { partirMensajeLead } from "@/lib/lead-mensaje";
import { waLinkTelefono } from "@/lib/telefono";

const SEEN_KEY = "rdc-prospectos-aviso-desde";
const DISMISS_KEY = "rdc-prospectos-aviso-vistos";

function leerDesde(): string {
  if (typeof window === "undefined") return new Date().toISOString();
  const prev = sessionStorage.getItem(SEEN_KEY);
  if (prev) return prev;
  const now = new Date().toISOString();
  sessionStorage.setItem(SEEN_KEY, now);
  return now;
}

function leerVistos(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(DISMISS_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function guardarVistos(ids: Set<string>) {
  sessionStorage.setItem(DISMISS_KEY, JSON.stringify([...ids].slice(-40)));
}

/**
 * Overlay con Fiscalino cuando entra un prospecto nuevo y el admin
 * ya tiene la consola abierta. Sube desde abajo (tipo notificación)
 * con confeti a pantalla completa ~2 s.
 */
type ConfettiPiece = {
  id: number;
  color: string;
  w: number;
  h: number;
  shape: "rect" | "circle";
  delay: number;
  duration: number;
  bx: number;
  by: number;
  rot: number;
};

const PALETA_CONFETI = [
  "#b026ff",
  "#4b00ff",
  "#ec4899",
  "#f59e0b",
  "#22d3ee",
  "#10b981",
  "#3b82f6",
];

function generarConfettiBurst(n = 88): ConfettiPiece[] {
  const items: ConfettiPiece[] = [];
  for (let i = 0; i < n; i++) {
    const angulo = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.6;
    const fuerza = 80 + Math.random() * 280;
    const w = 6 + Math.random() * 8;
    items.push({
      id: i,
      color: PALETA_CONFETI[i % PALETA_CONFETI.length],
      w,
      h: Math.random() > 0.4 ? 8 + Math.random() * 12 : w,
      shape: Math.random() > 0.55 ? "circle" : "rect",
      delay: Math.random() * 0.12,
      duration: 1.65 + Math.random() * 0.4,
      bx: Math.cos(angulo) * fuerza,
      by: Math.sin(angulo) * fuerza * 0.55 - 40 - Math.random() * 80,
      rot: 280 + Math.random() * 720 * (Math.random() > 0.5 ? 1 : -1),
    });
  }
  return items;
}

export default function ProspectoLlegadaAviso() {
  const [lead, setLead] = useState<SiteLead | null>(null);
  const [pendientes, setPendientes] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const desdeRef = useRef(leerDesde());
  const vistosRef = useRef(leerVistos());

  const revisar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/site-leads");
      const data = await res.json();
      if (!res.ok || !Array.isArray(data?.leads)) return;
      const desde = new Date(desdeRef.current).getTime();
      const nuevos = (data.leads as SiteLead[]).filter((l) => {
        if (vistosRef.current.has(l.id)) return false;
        return new Date(l.created_at).getTime() > desde;
      });
      if (nuevos.length === 0) return;
      setPendientes(nuevos.length);
      setLead((actual) => actual ?? nuevos[0]);
    } catch {
      // silencio: el poll no debe romper la consola
    }
  }, []);

  useEffect(() => {
    void revisar();
    const id = window.setInterval(() => void revisar(), 12_000);
    return () => window.clearInterval(id);
  }, [revisar]);

  useEffect(() => {
    if (!lead) {
      setConfetti([]);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setConfetti([]);
      return;
    }
    setConfetti(generarConfettiBurst());
    const id = window.setTimeout(() => setConfetti([]), 2200);
    return () => window.clearTimeout(id);
  }, [lead?.id]);

  function cerrar() {
    if (lead) {
      vistosRef.current.add(lead.id);
      guardarVistos(vistosRef.current);
    }
    setLead(null);
    setPendientes(0);
    desdeRef.current = new Date().toISOString();
    sessionStorage.setItem(SEEN_KEY, desdeRef.current);
    window.dispatchEvent(new CustomEvent("rdc:prospectos-actualizar"));
  }

  async function marcarWhatsApp() {
    if (!lead) return;
    const wa = waLinkTelefono(lead.telefono);
    void fetch(`/api/admin/site-leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evento: { tipo: "whatsapp" } }),
    });
    if (wa) window.open(wa, "_blank", "noopener,noreferrer");
    cerrar();
  }

  if (!lead) return null;

  const partido = partirMensajeLead(lead.mensaje);
  const texto = partido.libre || lead.mensaje || "Acaba de pedir cotización.";
  const extra = pendientes > 1 ? ` y ${pendientes - 1} más` : "";

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="aviso-prospecto-titulo"
    >
      {confetti.length > 0 && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[131] overflow-hidden"
        >
          {confetti.map((p) => (
            <span
              key={p.id}
              style={
                {
                  position: "absolute",
                  left: "50%",
                  top: "62%",
                  width: `${p.w}px`,
                  height: `${p.h}px`,
                  marginLeft: `-${p.w / 2}px`,
                  background: p.color,
                  borderRadius: p.shape === "circle" ? "999px" : "2px",
                  animation: `rdc-prospecto-confetti ${p.duration}s cubic-bezier(0.15, 0.7, 0.2, 1) ${p.delay}s both`,
                  "--rdc-bx": `${p.bx}px`,
                  "--rdc-by": `${p.by}px`,
                  "--rdc-rot": `${p.rot}deg`,
                  willChange: "transform, opacity",
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
      <button
        type="button"
        aria-label="Cerrar aviso"
        className="absolute inset-0 bg-slate-900/45 animate-prospecto-dim"
        onClick={cerrar}
      />
      <div className="relative z-[132] w-full max-w-md rounded-t-[1.75rem] sm:rounded-3xl bg-white dark:bg-slate-900 ring-1 ring-violet-200 dark:ring-violet-500/30 overflow-hidden shadow-[0_-18px_60px_rgba(15,23,42,0.28)] animate-prospecto-sheet">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 pt-5 pb-4 text-white text-center">
          <Fiscalino mood="celebrating" size={112} className="mx-auto" />
          <p
            id="aviso-prospecto-titulo"
            className="mt-2 text-xl font-black tracking-tight"
          >
            ¡Nuevo prospecto!
          </p>
          <p className="text-sm text-indigo-100 font-semibold">
            {lead.nombre}
            {extra}
          </p>
        </div>
        <div className="p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">
            En sus palabras
          </p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
            {texto}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {lead.telefono && (
              <button
                type="button"
                onClick={() => void marcarWhatsApp()}
                className="h-10 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
              >
                Abrir WhatsApp
              </button>
            )}
            <Link
              href="/prospectos"
              onClick={cerrar}
              className="h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold inline-flex items-center justify-center"
            >
              Ver en Prospectos
            </Link>
            <button
              type="button"
              onClick={cerrar}
              className="h-9 text-xs font-semibold text-slate-500"
            >
              Después
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
