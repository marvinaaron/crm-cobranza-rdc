"use client";

import { useState } from "react";
import Link from "next/link";

const SECCIONES = [
  { id: "inicio", label: "Inicio" },
  { id: "cumplimiento", label: "Cumplimiento" },
  { id: "honorarios", label: "Honorarios" },
] as const;

type SeccionId = (typeof SECCIONES)[number]["id"];

function MockupInicio() {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Mi portal
          </p>
          <p className="text-lg font-black text-slate-900">Hola, María</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
          Todo al día
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
            <p className="text-xs font-bold text-slate-600">Cumplimiento Hacienda</p>
          </div>
          <p className="text-sm font-black text-emerald-700">Mes presentado</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Periodo abril 2026</p>
        </div>
        <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <p className="text-xs font-bold text-slate-600">Honorarios</p>
          </div>
          <p className="text-sm font-black text-emerald-700">Pagado</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Mayo 2026</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl ring-1 ring-amber-200 bg-amber-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1">
          Próximo vencimiento
        </p>
        <p className="text-sm font-bold text-slate-900">Pago de ISR/IVA · 17 de junio</p>
        <p className="text-[11px] text-slate-600 mt-0.5">Periodo mayo 2026</p>
      </div>
    </div>
  );
}

function MockupCumplimiento() {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Cumplimiento fiscal · Abril 2026
          </p>
          <p className="text-lg font-black text-slate-900">Tu cumplimiento del mes</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {[
          { etiqueta: "SAT · ISR e IVA", estado: "Presentado", color: "bg-emerald-100 text-emerald-700" },
          { etiqueta: "IMSS · SIPARE", estado: "Pagado", color: "bg-emerald-100 text-emerald-700" },
          { etiqueta: "Estatal · Nómina", estado: "Presentado", color: "bg-emerald-100 text-emerald-700" },
          { etiqueta: "DIOT", estado: "Presentado", color: "bg-emerald-100 text-emerald-700" },
        ].map((r) => (
          <div key={r.etiqueta} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <span className="text-sm font-semibold text-slate-800">{r.etiqueta}</span>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${r.color}`}>
              {r.estado}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {["Acuse", "Línea", "Comprobante"].map((t) => (
          <div key={t} className="rounded-lg bg-slate-100 p-3 text-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-[10px] font-bold text-slate-600 mt-1">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupHonorarios() {
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Mis honorarios
      </p>
      <p className="text-lg font-black text-slate-900 mt-0.5">Mayo 2026</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
            Saldo del mes
          </p>
          <p className="text-2xl font-black tabular-nums mt-1">$2,500.00</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">
            Estado
          </p>
          <p className="text-2xl font-black mt-1">Pagado</p>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {[
          { mes: "Mayo 2026", monto: "$2,500.00", estado: "Pagado" },
          { mes: "Abril 2026", monto: "$2,500.00", estado: "Pagado" },
          { mes: "Marzo 2026", monto: "$2,500.00", estado: "Pagado" },
        ].map((r) => (
          <div key={r.mes} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-sm">
            <span className="font-semibold text-slate-800">{r.mes}</span>
            <div className="flex items-center gap-3">
              <span className="tabular-nums font-bold text-slate-900">{r.monto}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-widest">
                {r.estado}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
      >
        Pagar con tarjeta
      </button>
    </div>
  );
}

const TEXTOS: Record<SeccionId, { titulo: string; descripcion: string; puntos: string[] }> = {
  inicio: {
    titulo: "Tu estado, de un vistazo",
    descripcion:
      "Al iniciar sesión ves de inmediato si estás al día con el SAT y con el despacho, además de los próximos vencimientos.",
    puntos: [
      "Resumen del mes en una sola pantalla",
      "Semáforo de cumplimiento y honorarios",
      "Próximos pagos al SAT y al despacho",
    ],
  },
  cumplimiento: {
    titulo: "Cada obligación, su evidencia",
    descripcion:
      "Para cada periodo encuentras tus declaraciones, líneas de captura, acuses y comprobantes de pago organizados por bloque.",
    puntos: [
      "SAT, IMSS y obligaciones estatales separados",
      "Validas el previo antes de que paguemos",
      "Subes tu comprobante y nosotros lo revisamos",
    ],
  },
  honorarios: {
    titulo: "Pago en línea, factura digital",
    descripcion:
      "Paga tus honorarios con tarjeta desde el portal o por transferencia. La factura llega directo a tu correo y al portal.",
    puntos: [
      "Pago con Stripe en cualquier momento",
      "Historial completo de meses anteriores",
      "Factura PDF lista para descargar",
    ],
  },
};

const TONO_PORTAL = {
  navy: {
    section: "bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950",
    kicker: "text-indigo-300",
    glow: "from-indigo-500/30 to-emerald-500/20",
    check: "bg-emerald-500 text-white",
  },
  petroleo: {
    section: "bg-gradient-to-br from-[#0F3A42] via-[#0B2A30] to-[#082428]",
    kicker: "text-[#E3B23C]",
    glow: "from-[#E3B23C]/25 to-[#5BA8B0]/20",
    check: "bg-[#E3B23C] text-[#0F3A42]",
  },
  resico: {
    section: "bg-gradient-to-br from-marca-navy via-marca-navy-deep to-[#071018]",
    kicker: "text-marca-naranja",
    glow: "from-marca-naranja/30 to-marca-navy-soft/40",
    check: "bg-marca-naranja text-marca-navy",
  },
  bosque: {
    section: "bg-gradient-to-br from-[#16351A] via-[#0E2412] to-[#0A1A0D]",
    kicker: "text-[#D2F25A]",
    glow: "from-[#D2F25A]/30 to-[#6BB83A]/20",
    check: "bg-[#D2F25A] text-[#16351A]",
  },
  barro: {
    section: "bg-gradient-to-br from-[#3C1A16] via-[#271210] to-[#1A0C0A]",
    kicker: "text-[#E8895A]",
    glow: "from-[#E8895A]/30 to-[#B04A28]/20",
    check: "bg-[#E8895A] text-[#3C1A16]",
  },
  pizarra: {
    section: "bg-gradient-to-br from-[#1C2533] via-[#121820] to-[#0C1016]",
    kicker: "text-[#9EC9E0]",
    glow: "from-[#9EC9E0]/30 to-[#3A6A88]/20",
    check: "bg-[#9EC9E0] text-[#1C2533]",
  },
  cafe: {
    section: "bg-gradient-to-br from-[#2A221C] via-[#1C1712] to-[#120F0C]",
    kicker: "text-[#E8A060]",
    glow: "from-[#E8A060]/30 to-[#A06030]/20",
    check: "bg-[#E8A060] text-[#2A221C]",
  },
  indigo: {
    section: "bg-gradient-to-br from-[#161B45] via-[#0E1230] to-[#080A1C]",
    kicker: "text-[#9AA8FF]",
    glow: "from-[#9AA8FF]/30 to-[#3A48B0]/20",
    check: "bg-[#9AA8FF] text-[#161B45]",
  },
  teal: {
    section: "bg-gradient-to-br from-[#0D2744] via-[#0A1C30] to-[#061018]",
    kicker: "text-[#4ECDC4]",
    glow: "from-[#4ECDC4]/30 to-[#1A7A78]/20",
    check: "bg-[#4ECDC4] text-[#0D2744]",
  },
  sello: {
    section: "bg-gradient-to-br from-[#1C140C] via-[#120D08] to-[#0A0704]",
    kicker: "text-[#E8C36A]",
    glow: "from-[#E8C36A]/30 to-[#9A7020]/20",
    check: "bg-[#E8C36A] text-[#1C140C]",
  },
  esmeralda: {
    section: "bg-gradient-to-br from-[#10241C] via-[#0A1812] to-[#06110C]",
    kicker: "text-[#C6FF2E]",
    glow: "from-[#C6FF2E]/30 to-[#1AA31A]/20",
    check: "bg-[#C6FF2E] text-[#10241C]",
  },
  vino: {
    section: "bg-gradient-to-br from-[#2C0A12] via-[#180608] to-[#100407]",
    kicker: "text-[#FF2E3A]",
    glow: "from-[#FF2E3A]/30 to-[#C41622]/20",
    check: "bg-[#FF2E3A] text-[#2C0A12]",
  },
} as const;

export default function PortalPreview({
  fullBleed = false,
  compact = false,
  tono = "navy",
}: {
  fullBleed?: boolean;
  compact?: boolean;
  tono?: keyof typeof TONO_PORTAL;
}) {
  const [seccion, setSeccion] = useState<SeccionId>("inicio");
  const texto = TEXTOS[seccion];
  const piel = TONO_PORTAL[tono];

  return (
    <section
      id="portal-cliente"
      className={`${compact ? "py-10 sm:py-12" : "py-16 sm:py-24"} ${piel.section} text-white ${
        fullBleed ? "w-full" : ""
      }`}
    >
      <div
        className={
          fullBleed
            ? "mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-10 xl:px-14"
            : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.3em] ${piel.kicker}`}>
              Portal del cliente
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
              Tu despacho en el bolsillo
            </h2>
            <p className="mt-4 text-slate-300 leading-relaxed max-w-xl">
              Construimos un portal exclusivo para nuestros clientes. Ahí ves tu cumplimiento
              fiscal, tus honorarios y todos tus documentos. Sin cadenas de WhatsApp, sin
              correos perdidos.
            </p>

            <div className="mt-8 inline-flex bg-white/10 rounded-2xl p-1 ring-1 ring-white/10">
              {SECCIONES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSeccion(s.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    seccion === s.id
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-7">
              <h3 className="text-xl font-black">{texto.titulo}</h3>
              <p className="mt-2 text-slate-300 leading-relaxed">{texto.descripcion}</p>
              <ul className="mt-5 space-y-2.5">
                {texto.puntos.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm text-slate-200">
                    <span className={`w-5 h-5 rounded-full ${piel.check} flex items-center justify-center shrink-0 mt-0.5`}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/portal/login"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm"
              >
                Entrar al portal
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#contacto"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white text-sm font-bold ring-1 ring-white/20 hover:bg-white/20 transition-colors"
              >
                Soy nuevo, quiero acceso
              </a>
            </div>
          </div>

          <div className="relative">
            <div
              className={`absolute -inset-6 bg-gradient-to-br ${piel.glow} rounded-3xl blur-2xl -z-10`}
              aria-hidden
            />
            <div className="relative">
              {seccion === "inicio" ? <MockupInicio /> : null}
              {seccion === "cumplimiento" ? <MockupCumplimiento /> : null}
              {seccion === "honorarios" ? <MockupHonorarios /> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
