"use client";

import { useCallback, useState, type ReactNode } from "react";
import Logo from "@/components/publico/Logo";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import ProcesoPortalMockup from "@/components/publico/ProcesoPortalMockup";

const RAIL_COLORS = ["#94a3b8", "#38bdf8", "#fbbf24", "#c084fc", "#818cf8", "#2dd4bf", "#4ade80"];

const DRAFTEA_LIME = "#10b981";
const DRAFTEA_YELLOW = "#059669";
const DRAFTEA_PURPLE = "#8B5CF6";
const DRAFTEA_BLUE = "#4338CA";

const PASOS_CUMPLIMIENTO = [
  {
    numero: 1,
    titulo: "Por trabajar",
    descripcion:
      "Preparamos todo para iniciar: descargamos tus CFDIs y reunimos la documentación bancaria del mes.",
    tuParte: [
      "Si te pedimos algo extra (estado de cuenta, nómina, etc.), compártelo por el canal acordado",
      "Revisa tu correo o WhatsApp por si necesitamos algún dato",
      "En el portal verás el estatus «Por trabajar» — aún no hay acción urgente de tu parte",
    ],
    nosotros: [
      "Descargamos del SAT todos tus CFDIs de ingresos y de gastos del periodo",
      "Confirmamos que tenemos la documentación bancaria para conciliar banco vs. CFDIs",
      "Dejamos listo el expediente del mes para arrancar la contabilidad",
    ],
    porQue: "Sin CFDIs y bancos alineados no podemos conciliar ni calcular impuestos con certeza.",
    accent: "from-slate-400 to-slate-500",
    portalHint: "Estatus del mes: Por trabajar",
  },
  {
    numero: 2,
    titulo: "Iniciando",
    descripcion:
      "Hacemos tu contabilidad en CONTPAQi — el sistema que usan la mayoría de despachos en México.",
    tuParte: [
      "No necesitas hacer nada por ahora — estamos trabajando tu mes",
      "Si te contactamos, es porque falta algún documento: respóndenos pronto",
      "Puedes ver en el portal que el estatus cambió a «Iniciando»",
    ],
    nosotros: [
      "Registramos movimientos en CONTPAQi (contabilidad electrónica certificada)",
      "Clasificamos ingresos, gastos y deducciones según tu régimen",
      "Conciliamos bancos con CFDIs y detectamos faltantes antes del previo",
      "Te contactamos si hace falta documentación del mes",
    ],
    porQue:
      "CONTPAQi nos permite llevar tu contabilidad con el estándar que el SAT reconoce y auditar tu información con orden.",
    accent: "from-blue-400 to-cyan-400",
    portalHint: "Estatus: Iniciando · contabilidad en curso",
  },
  {
    numero: 3,
    titulo: "Preliminar",
    descripcion:
      "La contabilidad ya está cerrada. Te mostramos cuánto pagarías al SAT — sin pagar nada aún.",
    tuParte: [
      "Entra al portal y revisa el previo de impuestos (ISR, IVA, etc.)",
      "Entiende que el monto viene de tus ingresos y gastos reales del mes — no es un número al azar",
      "Si tienes dudas, este es el momento: podemos agendar una asesoría y revisar el trabajo contigo",
      "No pagas nada en este paso — solo es un borrador para tu validación",
    ],
    nosotros: [
      "Publicamos el importe preliminar a pagar al SAT",
      "Explicamos de dónde salen los números según el cierre del mes",
      "Atendemos dudas y ajustes antes de declarar",
      "No presentamos al SAT hasta que revises (y luego aceptes) el previo",
    ],
    porQue:
      "Queremos que entiendas tu impuesto antes de pagarlo. Aquí ocurre la «magia»: aclaramos contigo el porqué de cada peso.",
    accent: "from-amber-400 to-orange-400",
    portalHint: "Previo de impuestos · sin pago todavía",
  },
  {
    numero: 4,
    titulo: "Aceptación",
    descripcion: "Tú confirmas el previo. Con tu visto bueno, presentamos tu declaración de impuestos al SAT.",
    tuParte: [
      "Lee el previo una última vez en el portal",
      "Si estás de acuerdo, da clic en «Aceptar»",
      "Si algo no cuadra, escríbenos antes de aceptar",
    ],
    nosotros: [
      "Con tu aceptación, enviamos y presentamos tu declaración de impuestos ante el SAT",
      "Generamos la documentación oficial que respalda la declaración",
      "Guardamos registro de tu autorización",
    ],
    porQue: "Tu aceptación es el permiso formal para declarar con los montos que ya revisaste.",
    accent: "from-violet-400 to-purple-400",
    portalHint: "Confirma el previo para declarar",
  },
  {
    numero: 5,
    titulo: "Declaraciones",
    descripcion:
      "¡Tu línea de captura ya está lista! Descarga acuse y línea desde el portal.",
    tuParte: [
      "Descarga el acuse de la declaración y la línea de captura desde tu portal",
      "Paga tus impuestos en tu banco, app bancaria o portal del SAT — no dentro del portal de RDC",
      "Guarda tus PDFs; siempre quedan en tu historial",
      "Importante: en el portal de RDC no se pagan impuestos al SAT, solo se descargan documentos",
    ],
    nosotros: [
      "Subimos acuse de declaración y línea de captura a tu portal",
      "Te avisamos cuando todo esté listo para que pagues en el banco",
      "Dejamos claro el monto y la fecha límite de pago al SAT",
    ],
    porQue:
      "Necesitas los documentos oficiales para pagar en el banco. El portal de RDC es para consultar y descargar, no para pagar impuestos federales.",
    accent: "from-indigo-400 to-blue-400",
    portalHint: "Acuse + línea de captura listos",
  },
  {
    numero: 6,
    titulo: "Pago",
    descripcion: "Pagas tus impuestos en el banco y nos compartes el comprobante de pago del SAT.",
    tuParte: [
      "Realiza el pago de impuestos con la línea de captura (banco o portal del SAT)",
      "Sube a tu portal de RDC el comprobante o acuse de pago del SAT",
      "Espera nuestra validación de que el pago coincida con la declaración",
    ],
    nosotros: [
      "Verificamos monto, fecha y referencia del comprobante",
      "Te avisamos si algo no cuadra",
      "Marcamos el pago como validado en tu expediente del mes",
    ],
    porQue: "El SAT exige comprobar el pago y nosotros lo validamos para cerrar correctamente el periodo.",
    accent: "from-emerald-400 to-teal-400",
    portalHint: "Sube tu comprobante de pago SAT",
  },
  {
    numero: 7,
    titulo: "Completado",
    descripcion: "Cerramos el mes. Todo queda archivado en tu portal.",
    tuParte: [
      "¡Listo! No tienes pendientes de este periodo",
      "Consulta acuses, declaraciones y comprobantes cuando quieras en el portal",
      "Cuando inicie el siguiente mes, te avisamos para el nuevo ciclo",
    ],
    nosotros: [
      "Cerramos el mes en nuestros sistemas",
      "Archivamos declaraciones, líneas, pagos y comprobantes",
      "Dejamos tu historial ordenado y consultable",
    ],
    porQue: "Un mes bien cerrado te respalda ante el SAT, bancos o revisiones futuras.",
    accent: "from-emerald-400 to-green-300",
    portalHint: "Mes cerrado · historial completo",
  },
];

type PasoData = (typeof PASOS_CUMPLIMIENTO)[number];

const TEXTO_ACENTO = "text-violet-600";
const GRADIENTE_ACENTO =
  "bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent";

const NOTIF_DEMO = [
  {
    titulo: "Previo de impuestos publicado",
    cuerpo: "Revisa tu ISR e IVA de mayo antes de declarar.",
    tiempo: "Hace 2 h",
    dot: "bg-amber-500",
    bg: "bg-amber-50/80",
    border: "border-amber-100",
    nueva: true,
  },
  {
    titulo: "Declaraciones listas",
    cuerpo: "Descarga acuse y línea de captura en Cumplimiento.",
    tiempo: "Ayer",
    dot: "bg-blue-500",
    bg: "bg-blue-50/80",
    border: "border-blue-100",
    nueva: false,
  },
  {
    titulo: "Mes completado",
    cuerpo: "Abril 2026 cerrado. Todo archivado en tu historial.",
    tiempo: "Hace 3 d",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50/80",
    border: "border-emerald-100",
    nueva: false,
  },
] as const;

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function HeroAppPortal() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-indigo-300/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <RevealOnScroll>
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-violet-700">
            <span className="rdc-pulse-dot h-1.5 w-1.5 rounded-full bg-violet-500" />
            Exclusivo RDC · App de clientes
          </p>
          <h1 className="mt-5 text-[2.35rem] font-black leading-[0.95] tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-[3.5rem]">
            Tus impuestos,{" "}
            <span className={GRADIENTE_ACENTO}>en tiempo real</span> en tu bolsillo
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            No somos un despacho que solo te manda PDFs por correo. Tienes una app donde recibes
            notificaciones al instante: cuando publicamos tu previo, cuando tus declaraciones están
            listas, cuando validamos tu pago y cuando cerramos tu mes.
          </p>
          <ul className="mt-8 space-y-3">
            {["Avisos push y en portal — sin perseguir a tu contador", "Stepper de 7 pasos: siempre sabes en qué etapa va tu mes", "Documentos, acuses y comprobantes en un solo lugar"].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-600 sm:text-base">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </RevealOnScroll>
        <RevealOnScroll delay={120}>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-violet-600/15 via-transparent to-indigo-600/10 blur-xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/30 ring-1 ring-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Portal RDC · Notificaciones</p>
                  <p className="text-sm font-black text-slate-900">Actividad reciente</p>
                </div>
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" /><path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-black text-white">2</span>
                </span>
              </div>
              <div className="space-y-2.5 bg-white p-4 sm:p-5">
                {NOTIF_DEMO.map((n) => (
                  <div key={n.titulo} className={`rounded-2xl border p-3.5 ${n.bg} ${n.border} ${n.nueva ? "ring-2 ring-violet-400/30" : ""}`}>
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.dot}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900">{n.titulo}</p>
                          <span className="shrink-0 text-[10px] font-semibold text-slate-400">{n.tiempo}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] leading-snug text-slate-600">{n.cuerpo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Así te avisamos en cada paso del flujo ↓</p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ─── Shared UI ─── */

function GradientBorderCard({ gradient, glow, children }: { gradient: string; glow?: string; children: ReactNode }) {
  return (
    <div className="h-full rounded-2xl p-[1.5px]" style={{ background: gradient, boxShadow: glow || undefined }}>
      <div className="flex h-full flex-col rounded-[14px] bg-white p-4 sm:p-5">{children}</div>
    </div>
  );
}

function UserAvatarIcon() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 bg-emerald-50 ring-emerald-200" aria-hidden>
      <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M5 20c0-3.5 3.134-6 7-6s7 2.5 7 6" />
      </svg>
    </div>
  );
}

function RdcAvatarMark() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 ring-1 ring-violet-200" aria-hidden>
      <Logo mark="r" variante="violet" alto={22} className="opacity-90" />
    </div>
  );
}

/* ─── Step card content (each card in the coverflow) ─── */

function StepCardContent({ paso, stepIndex }: { paso: PasoData; stepIndex: number }) {
  const clienteBorder = `linear-gradient(to bottom, ${DRAFTEA_LIME}, ${DRAFTEA_YELLOW})`;
  const rdcBorder = `linear-gradient(to bottom, ${DRAFTEA_BLUE}, ${DRAFTEA_PURPLE})`;

  return (
    <div
      className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-xl p-5 sm:p-6 lg:p-7"
      style={{ borderTop: `3px solid ${RAIL_COLORS[stepIndex]}` }}
    >
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_280px] lg:gap-5">
        {/* Left: title + description + dual cards + por qué */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${paso.accent} text-lg font-black text-white shadow-lg sm:h-14 sm:w-14 sm:text-xl`}
              style={{ boxShadow: `0 6px 20px ${RAIL_COLORS[stepIndex]}40` }}
            >
              {paso.numero}
            </div>
            <div className="min-w-0">
              <h3 className={`bg-gradient-to-br ${paso.accent} bg-clip-text text-2xl font-black leading-[0.95] tracking-[-0.04em] text-transparent sm:text-3xl lg:text-4xl`}>
                {paso.titulo}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 sm:text-base">
                {paso.descripcion}
              </p>
            </div>
          </div>

          {/* Dual cards */}
          <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
            <GradientBorderCard
              gradient={clienteBorder}
              glow={`0 0 24px ${DRAFTEA_LIME}22, 0 0 40px ${DRAFTEA_YELLOW}14`}
            >
              <div className="flex items-center gap-2.5 border-b border-emerald-100 pb-2.5">
                <UserAvatarIcon />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Lo que tú haces</p>
              </div>
              <ol className="mt-3 space-y-2">
                {paso.tuParte.map((accion, n) => (
                  <li key={accion} className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-black text-emerald-700 ring-1 bg-emerald-50 ring-emerald-200">{n + 1}</span>
                    <span className="pt-0.5 text-[13px] leading-relaxed text-slate-700">{accion}</span>
                  </li>
                ))}
              </ol>
            </GradientBorderCard>

            <GradientBorderCard
              gradient={rdcBorder}
              glow={`0 0 24px ${DRAFTEA_PURPLE}28`}
            >
              <div className="flex items-center gap-2.5 border-b border-violet-100 pb-2.5">
                <RdcAvatarMark />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Lo que hace RDC</p>
              </div>
              <ul className="mt-3 space-y-2">
                {paso.nosotros.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: RAIL_COLORS[stepIndex] }} />
                    {item}
                  </li>
                ))}
              </ul>
            </GradientBorderCard>
          </div>

          {/* ¿Por qué? */}
          <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
            <p className="text-[13px] leading-relaxed text-slate-500">
              <span className="font-bold text-slate-700">¿Por qué? </span>
              {paso.porQue}
            </p>
          </div>
        </div>

        {/* Right: mockup */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="mb-2.5 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-900">
            Así lo ves en tu portal
          </p>
          <ProcesoPortalMockup paso={paso.numero} />
          <p className="mt-2.5 text-center text-[11px] font-semibold text-slate-500">{paso.portalHint}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─── */

const CARD_WIDTH_PCT = 82;
const GAP_PCT = 2;

export default function ComoTrabajamos() {
  const [active, setActive] = useState(0);
  const paso = PASOS_CUMPLIMIENTO[active];

  const goPrev = useCallback(() => setActive((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setActive((i) => Math.min(PASOS_CUMPLIMIENTO.length - 1, i + 1)), []);

  const trackOffset = -(active * (CARD_WIDTH_PCT + GAP_PCT)) + (100 - CARD_WIDTH_PCT) / 2;

  return (
    <>
      <div className="relative border-b border-slate-100 bg-white text-slate-900">
        <HeroAppPortal />
      </div>

      <div className="relative bg-white text-slate-900">
        <section id="proceso" className="relative py-10 sm:py-14 lg:py-16">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <RevealOnScroll className="mb-8 sm:mb-10 text-center">
              <p className={`text-[11px] font-bold uppercase tracking-[0.4em] ${TEXTO_ACENTO}`}>
                Flujo de cumplimiento
              </p>
              <h2 className="mt-4 text-[2.25rem] font-black leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                7 pasos que puedes <span className={GRADIENTE_ACENTO}>seguir en tu portal</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-slate-500 sm:text-lg">
                Navega paso a paso para entender cómo funciona nuestro proceso de cumplimiento mensual.
              </p>
            </RevealOnScroll>

            {/* Carousel */}
            <div className="relative">
              {/* Arrows */}
              <button
                type="button"
                onClick={goPrev}
                disabled={active === 0}
                aria-label="Paso anterior"
                className="absolute left-1 top-1/2 z-30 hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-lg ring-1 ring-slate-200 backdrop-blur-md transition hover:text-violet-600 disabled:opacity-0 disabled:pointer-events-none"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={active === PASOS_CUMPLIMIENTO.length - 1}
                aria-label="Siguiente paso"
                className="absolute right-1 top-1/2 z-30 hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-lg ring-1 ring-slate-200 backdrop-blur-md transition hover:text-violet-600 disabled:opacity-0 disabled:pointer-events-none"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>

              {/* Sliding track */}
              <div className="overflow-hidden">
                <div
                  className="flex items-start transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(${trackOffset}%)`,
                    gap: `${GAP_PCT}%`,
                  }}
                >
                  {PASOS_CUMPLIMIENTO.map((p, i) => {
                    const isActive = i === active;
                    return (
                      <div
                        key={p.numero}
                        className="shrink-0 transition-all duration-500"
                        style={{
                          width: `${CARD_WIDTH_PCT}%`,
                          opacity: isActive ? 1 : 0.45,
                          transform: isActive ? "scale(1)" : "scale(0.95)",
                          filter: isActive ? "none" : "blur(1px)",
                        }}
                        onClick={() => !isActive && setActive(i)}
                        role={isActive ? undefined : "button"}
                        tabIndex={isActive ? undefined : 0}
                        aria-label={isActive ? undefined : `Ver paso ${p.numero}: ${p.titulo}`}
                      >
                        <StepCardContent paso={p} stepIndex={i} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile arrows */}
            <div className="flex items-center justify-center gap-4 mt-5 sm:hidden">
              <button type="button" onClick={goPrev} disabled={active === 0} aria-label="Paso anterior" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-md ring-1 ring-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <span className="text-sm font-bold text-slate-400">{active + 1} / {PASOS_CUMPLIMIENTO.length}</span>
              <button type="button" onClick={goNext} disabled={active === PASOS_CUMPLIMIENTO.length - 1} aria-label="Siguiente paso" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-md ring-1 ring-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>

            {/* Progress bar 1-7 */}
            <div className="mt-8">
              <div className="mx-auto max-w-2xl rounded-2xl bg-white/90 backdrop-blur-md ring-1 ring-slate-200 shadow-sm px-4 py-3 sm:px-6">
                <div className="flex items-center gap-1">
                  {PASOS_CUMPLIMIENTO.map((p, i) => {
                    const activo = i === active;
                    const completado = i < active;
                    return (
                      <div key={p.numero} className="flex items-center flex-1">
                        <button
                          type="button"
                          onClick={() => setActive(i)}
                          aria-label={`Paso ${p.numero}: ${p.titulo}`}
                          aria-current={activo ? "step" : undefined}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition-all duration-300 sm:h-9 sm:w-9 ${
                            activo ? "text-white shadow-md scale-110" : completado ? "text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                          style={
                            activo
                              ? { background: `linear-gradient(135deg, ${RAIL_COLORS[i]}, ${RAIL_COLORS[Math.min(i + 1, 6)]})`, boxShadow: `0 2px 10px ${RAIL_COLORS[i]}55` }
                              : completado ? { background: RAIL_COLORS[i] } : undefined
                          }
                        >
                          {completado ? <CheckIcon size={12} /> : p.numero}
                        </button>
                        {i < PASOS_CUMPLIMIENTO.length - 1 && (
                          <div className="flex-1 h-0.5 mx-0.5 rounded-full overflow-hidden bg-slate-100">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: completado ? "100%" : "0%",
                                background: completado ? `linear-gradient(to right, ${RAIL_COLORS[i]}, ${RAIL_COLORS[i + 1]})` : undefined,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-center text-[11px] font-bold text-slate-500 truncate">{paso.titulo}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
