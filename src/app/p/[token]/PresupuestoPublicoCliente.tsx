"use client";

import { useEffect, useMemo, useState } from "react";
import Fiscalino from "@/components/Fiscalino";
import PresupuestoDocumento from "@/components/admin/presupuestos/PresupuestoDocumento";
import {
  type Presupuesto,
  type MotivoObjecion,
  DATOS_PRESUPUESTO,
  OBJECION_META,
  montoMensualPresupuesto,
  fmtMoneda,
} from "@/lib/presupuestos";

type Vista =
  | "documento"
  | "objeciones"
  | "contrapropuesta"
  | "celebracion"
  | "gracias";

/** Contrapropuesta por objeción: resaltar valor + flexibilidad, sin descuentos. */
const CONTRA: Record<
  MotivoObjecion,
  { titulo: string; cuerpo: string }
> = {
  caro: {
    titulo: "Entendemos, hablemos de valor",
    cuerpo:
      "Más que un gasto, es tener tu contabilidad al día, evitar multas del SAT y dormir tranquilo. Si el momento es complicado, podemos acomodar la forma de pago. Cuéntanos tu situación y lo resolvemos juntos.",
  },
  pensarlo: {
    titulo: "Tómate tu tiempo",
    cuerpo:
      "Es una decisión importante y queremos que la tomes con confianza. Si te quedó alguna duda sobre lo que incluye, con gusto te la aclaramos por WhatsApp en un minuto.",
  },
  tengo_contador: {
    titulo: "Te damos algo distinto",
    cuerpo:
      "Además de tu contabilidad, tienes un portal 24/7 con el avance de tus declaraciones en tiempo real, recordatorios y acompañamiento cercano. Te invitamos a una llamada para que compares sin compromiso.",
  },
  no_entiendo: {
    titulo: "Te lo explicamos claro",
    cuerpo:
      "Nada de tecnicismos: te decimos exactamente qué hacemos cada mes por ti y por qué es obligatorio ante el SAT. Escríbenos y te lo explicamos con manzanas.",
  },
  mucho: {
    titulo: "Lo ajustamos a tu medida",
    cuerpo:
      "Podemos adaptar la propuesta a lo que realmente necesitas hoy e ir creciendo después. Cuéntanos tu caso y armamos un plan a tu medida.",
  },
};

function waLink(): string {
  const digits = DATOS_PRESUPUESTO.contactoTel.replace(/\D/g, "");
  const numero = digits.length === 10 ? `52${digits}` : digits;
  const texto = encodeURIComponent(
    "Hola, vi mi propuesta de RDC Contadores y tengo una duda."
  );
  return `https://wa.me/${numero}?text=${texto}`;
}

function Confetti() {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const piezas = useMemo(() => {
    const colores = ["#7c3aed", "#a855f7", "#22c55e", "#f59e0b", "#0ea5e9", "#ec4899"];
    return Array.from({ length: 48 }).map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 2.2 + Math.random() * 1.6,
      color: colores[i % colores.length],
      rot: Math.random() * 360,
    }));
  }, []);
  if (!montado) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {piezas.map((p, i) => (
        <span
          key={i}
          className="pp-confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            transform: `rotate(${p.rot}deg)`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function PresupuestoPublicoCliente({
  presupuesto,
  token,
}: {
  presupuesto: Presupuesto;
  token: string;
}) {
  const yaAceptado = presupuesto.estado === "aceptado";
  const [vista, setVista] = useState<Vista>(
    yaAceptado ? "celebracion" : "documento"
  );
  const [confetti, setConfetti] = useState(yaAceptado);
  const [motivo, setMotivo] = useState<MotivoObjecion | null>(null);
  const [comentario, setComentario] = useState("");
  const [cargando, setCargando] = useState<null | "aceptar" | "rechazar">(null);

  const total = montoMensualPresupuesto(presupuesto);

  async function enviar(
    accion: "aceptar" | "rechazar",
    extra?: { motivo?: MotivoObjecion; comentario?: string }
  ): Promise<boolean> {
    setCargando(accion);
    try {
      const res = await fetch(`/api/p/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion, ...extra }),
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      setCargando(null);
    }
  }

  async function aceptar() {
    const ok = await enviar("aceptar");
    if (ok) {
      setConfetti(true);
      setVista("celebracion");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function elegirObjecion(m: MotivoObjecion) {
    setMotivo(m);
    // Registramos la objeción de inmediato (queda como rechazado) y mostramos
    // la contrapropuesta. Si luego acepta, el estado se actualiza a aceptado.
    await enviar("rechazar", { motivo: m, comentario: comentario.trim() || undefined });
    setVista("contrapropuesta");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Celebración ----------
  if (vista === "celebracion") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1e1b4b] to-[#0F172A] text-white flex flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden">
        {confetti && <Confetti />}
        <div className="pp-pop relative z-10">
          <div className="mx-auto w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
            <svg
              className="pp-check"
              width="52"
              height="52"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        </div>
        <Fiscalino mood="celebrating" size={150} className="mt-6 pp-rise" />
        <h1 className="text-3xl font-black mt-4 pp-rise" style={{ animationDelay: "0.1s" }}>
          {yaAceptado ? "¡Propuesta aceptada!" : "¡Bienvenido a RDC!"}
        </h1>
        <p
          className="text-slate-300 mt-2 max-w-sm pp-rise"
          style={{ animationDelay: "0.2s" }}
        >
          Gracias por confiar en nosotros. En breve te contactamos para los
          siguientes pasos y darte de alta en tu portal.
        </p>
        <div
          className="mt-6 bg-white/10 border border-white/15 rounded-2xl px-6 py-4 pp-rise"
          style={{ animationDelay: "0.3s" }}
        >
          <p className="text-[10px] uppercase tracking-widest text-violet-300 font-bold">
            Tu honorario mensual
          </p>
          <p className="text-3xl font-black mt-1">{fmtMoneda(total)}</p>
          <p className="text-[11px] text-slate-400">IVA incluido</p>
        </div>
        <a
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm px-7 py-3.5 rounded-full transition active:scale-95 pp-rise"
          style={{ animationDelay: "0.4s" }}
        >
          Escribir por WhatsApp
        </a>
        <p className="text-[11px] text-slate-500 mt-6">
          {DATOS_PRESUPUESTO.despacho} · {DATOS_PRESUPUESTO.contactoTel}
        </p>
      </main>
    );
  }

  // ---------- Contrapropuesta (tras objeción) ----------
  if (vista === "contrapropuesta" && motivo) {
    const c = CONTRA[motivo];
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 pp-pop">
          <Fiscalino mood="confident" size={120} className="mx-auto" />
          <h1 className="text-2xl font-black text-slate-800 mt-3">{c.titulo}</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">{c.cuerpo}</p>

          <div className="mt-7 space-y-2.5">
            <button
              onClick={aceptar}
              disabled={cargando !== null}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 rounded-full transition active:scale-95 disabled:opacity-60"
            >
              {cargando === "aceptar" ? "Un momento…" : "Sí, quiero avanzar"}
            </button>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full border border-slate-200 hover:border-violet-300 text-slate-700 font-bold text-sm py-3.5 rounded-full transition"
            >
              Tengo una duda · WhatsApp
            </a>
            <button
              onClick={() => setVista("gracias")}
              className="w-full text-slate-400 hover:text-slate-600 font-semibold text-[13px] py-2 transition"
            >
              Por ahora no, gracias
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ---------- Gracias (rechazo final) ----------
  if (vista === "gracias") {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-sm pp-pop">
          <Fiscalino mood="happy" size={130} className="mx-auto" />
          <h1 className="text-2xl font-black text-slate-800 mt-3">
            ¡Gracias por tu tiempo!
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Quedamos a tus órdenes cuando lo necesites. La puerta de RDC siempre
            está abierta para ti.
          </p>
          <button
            onClick={() => setVista("documento")}
            className="mt-6 text-violet-700 font-bold text-sm hover:underline"
          >
            Ver la propuesta de nuevo
          </button>
        </div>
      </main>
    );
  }

  // ---------- Objeciones ----------
  if (vista === "objeciones") {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 pp-pop">
          <h1 className="text-xl font-black text-slate-800 text-center">
            ¿Qué te detiene?
          </h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            Cuéntanos para poder ayudarte mejor. Sin compromiso.
          </p>
          <div className="mt-5 space-y-2">
            {(Object.keys(OBJECION_META) as MotivoObjecion[]).map((m) => (
              <button
                key={m}
                onClick={() => elegirObjecion(m)}
                disabled={cargando !== null}
                className="w-full flex items-center gap-3 text-left border border-slate-200 hover:border-violet-300 hover:bg-violet-50 rounded-2xl px-4 py-3 transition disabled:opacity-60"
              >
                <span className="text-xl">{OBJECION_META[m].emoji}</span>
                <span className="font-bold text-slate-700 text-sm">
                  {OBJECION_META[m].label}
                </span>
              </button>
            ))}
          </div>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={2}
            placeholder="¿Algo más que quieras decirnos? (opcional)"
            className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 resize-none"
          />
          <button
            onClick={() => setVista("documento")}
            className="mt-3 w-full text-slate-400 hover:text-slate-600 font-semibold text-[13px] py-2 transition"
          >
            ← Volver a la propuesta
          </button>
        </div>
      </main>
    );
  }

  // ---------- Documento + barra de acción ----------
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="px-4 py-6 sm:py-10 pb-36">
        <div className="max-w-[820px] mx-auto mb-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-violet-600">
            Propuesta para ti
          </p>
          <h1 className="text-xl font-black text-slate-800 mt-1">
            {presupuesto.cliente.razonSocial}
          </h1>
        </div>
        <PresupuestoDocumento presupuesto={presupuesto} />
      </div>

      {/* Barra de acción fija */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-[820px] mx-auto flex items-center gap-3">
          <div className="hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Honorario mensual
            </p>
            <p className="text-lg font-black text-violet-700 leading-none">
              {fmtMoneda(total)}
              <span className="text-[10px] text-slate-400 font-semibold ml-1">
                IVA incl.
              </span>
            </p>
          </div>
          <button
            onClick={() => setVista("objeciones")}
            disabled={cargando !== null}
            className="flex-1 sm:flex-none border border-slate-200 hover:border-slate-300 text-slate-600 font-bold text-sm py-3.5 px-5 rounded-full transition disabled:opacity-60"
          >
            Tengo una duda
          </button>
          <button
            onClick={aceptar}
            disabled={cargando !== null}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 px-6 rounded-full transition active:scale-95 shadow-lg shadow-emerald-200 disabled:opacity-60"
          >
            {cargando === "aceptar" ? "Un momento…" : "Aceptar propuesta"}
          </button>
        </div>
      </div>
    </main>
  );
}
