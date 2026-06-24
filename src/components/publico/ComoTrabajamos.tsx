"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Logo from "@/components/publico/Logo";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import ProcesoPortalMockup from "@/components/publico/ProcesoPortalMockup";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Colores del rail — un color sólido por paso; el degradado va solo entre vecinos. */
const RAIL_COLORS = ["#94a3b8", "#38bdf8", "#fbbf24", "#c084fc", "#818cf8", "#2dd4bf", "#4ade80"];

/** Paleta Draftea para recuadros del proceso. */
const DRAFTEA_LIME = "#A3FF12";
const DRAFTEA_YELLOW = "#FACC15";
const DRAFTEA_PURPLE = "#8B5CF6";
const DRAFTEA_BLUE = "#4338CA";

/** Espacio interno para scroll tu → RDC dentro de cada paso. */
const PASO_SCROLL_PAD = "pb-[32vh] sm:pb-[28vh]";

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
    glow: "shadow-slate-500/30",
    badge: "bg-white/10 text-slate-200 ring-white/15",
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
    glow: "shadow-blue-500/40",
    badge: "bg-blue-500/15 text-blue-200 ring-blue-400/25",
    portalHint: "Estatus: Iniciando · contabilidad en curso",
  },
  {
    numero: 3,
    titulo: "Preliminar",
    descripcion:
      "La contabilidad ya está cerrada: clasificación y conciliaciones listas. Te mostramos cuánto pagarías al SAT — sin pagar nada aún.",
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
    glow: "shadow-amber-500/40",
    badge: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
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
    glow: "shadow-violet-500/40",
    badge: "bg-violet-500/15 text-violet-200 ring-violet-400/25",
    portalHint: "Confirma el previo para declarar",
  },
  {
    numero: 5,
    titulo: "Declaraciones",
    descripcion:
      "¡Tu línea de captura ya está lista! Descarga acuse y línea desde el portal — el pago al SAT se hace en tu banco, no en nuestro portal.",
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
    glow: "shadow-indigo-500/40",
    badge: "bg-indigo-500/15 text-indigo-200 ring-indigo-400/25",
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
    glow: "shadow-emerald-500/40",
    badge: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
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
    glow: "shadow-emerald-400/50",
    badge: "bg-emerald-500/20 text-emerald-100 ring-emerald-400/30",
    portalHint: "Mes cerrado · historial completo",
  },
];

type PasoData = (typeof PASOS_CUMPLIMIENTO)[number];

function railGradient(fromIdx: number, toIdx: number): CSSProperties {
  return {
    background: `linear-gradient(to bottom, ${RAIL_COLORS[fromIdx]}, ${RAIL_COLORS[toIdx]})`,
  };
}

function segmentRailGradient(): string {
  const parts: string[] = [];
  for (let i = 0; i < RAIL_COLORS.length - 1; i++) {
    const startPct = (i / (RAIL_COLORS.length - 1)) * 100;
    const endPct = ((i + 1) / (RAIL_COLORS.length - 1)) * 100;
    parts.push(`${RAIL_COLORS[i]} ${startPct}%`, `${RAIL_COLORS[i + 1]} ${endPct}%`);
  }
  return `linear-gradient(to bottom, ${parts.join(", ")})`;
}

type CardFocusState = {
  tuTranslateX: number;
  rdcTranslateX: number;
  mockupTranslateY: number;
};

/** Solo z-index por paso — sin mover el bloque entero. */
type StepVisual = {
  zIndex: number;
};

type SubFase = "tu" | "rdc" | "handoff";

const DEFAULT_CARD_FOCUS: CardFocusState = {
  tuTranslateX: 0,
  rdcTranslateX: 0,
  mockupTranslateY: 0,
};

const IDLE_CARD_FOCUS: CardFocusState = {
  tuTranslateX: 0,
  rdcTranslateX: 0,
  mockupTranslateY: 0,
};

const DEFAULT_STEP_VISUAL: StepVisual = { zIndex: 4 };

function offLeft(vw: number) {
  return -(vw * 1.08);
}

function offRight(vw: number) {
  return vw * 1.08;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function getStepScrollProgress(el: HTMLElement) {
  const vh = window.innerHeight;
  const rect = el.getBoundingClientRect();
  const anchor = vh * 0.38;
  const scrolled = anchor - rect.top;
  const range = Math.max(rect.height - vh * 0.35, vh * 0.45);
  return Math.max(0, Math.min(1, scrolled / range));
}

function computeStepZIndex(rect: DOMRect, vh: number, isActive: boolean): number {
  if (isActive) return 14;
  const anchor = vh * 0.38;
  const dist = Math.abs(rect.top + 72 - anchor);
  return dist < vh * 0.5 ? 8 : 4;
}

/** Entrada una sola vez (latched): tu izq., RDC der., mockup arriba → luego fijos en 0. */
function computeCardFocus(
  latched: number,
  vw: number,
  vh: number,
  reduced: boolean
): CardFocusState {
  if (reduced) {
    return { tuTranslateX: 0, rdcTranslateX: 0, mockupTranslateY: 0 };
  }

  const TU_END = 0.32;
  const RDC_START = 0.32;
  const RDC_END = 0.68;
  const MOCK_END = 0.28;
  const left = offLeft(vw);
  const right = offRight(vw);
  const top = -(vh * 0.45);

  const tuDone = latched >= TU_END;
  const rdcDone = latched >= RDC_END;
  const mockDone = latched >= MOCK_END;

  const tuTranslateX = tuDone
    ? 0
    : lerp(left, 0, smoothstep(latched / TU_END));

  const rdcTranslateX = rdcDone
    ? 0
    : latched < RDC_START
      ? right
      : lerp(right, 0, smoothstep((latched - RDC_START) / (RDC_END - RDC_START)));

  const mockupTranslateY = mockDone
    ? 0
    : lerp(top, 0, smoothstep(latched / MOCK_END));

  return { tuTranslateX, rdcTranslateX, mockupTranslateY };
}

function focusForStep(
  isActive: boolean,
  latched: number,
  vw: number,
  vh: number,
  reduced: boolean
): CardFocusState {
  if (reduced) return IDLE_CARD_FOCUS;
  if (!isActive && latched >= 0.2) return IDLE_CARD_FOCUS;
  if (!isActive) return IDLE_CARD_FOCUS;
  return computeCardFocus(latched, vw, vh, reduced);
}

function progressToSubFase(progress: number): SubFase {
  if (progress < 0.32) return "tu";
  if (progress < 0.68) return "rdc";
  return "handoff";
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Morado vibrante de marca — evita lilas/pasteles. */
const TEXTO_ACENTO = "text-violet-400";
const GRADIENTE_ACENTO =
  "bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent";

function ScrollDownHint() {
  return (
    <div className="pointer-events-none flex flex-col items-center -space-y-2" aria-hidden>
      <svg
        className="h-4 w-4 animate-[procesoHintBounce_1.8s_ease-in-out_infinite] text-[#A3FF12]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <svg
        className="h-4 w-4 animate-[procesoHintBounce_1.8s_ease-in-out_0.25s_infinite] text-[#A3FF12]/55"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

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

function HeroAppPortal() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <RevealOnScroll>
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-violet-300">
            <span className="rdc-pulse-dot h-1.5 w-1.5 rounded-full bg-violet-400" />
            Exclusivo RDC · App de clientes
          </p>
          <h1 className="mt-5 text-[2.35rem] font-black leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-[3.5rem]">
            Tus impuestos,{" "}
            <span className={GRADIENTE_ACENTO}>en tiempo real</span> en tu bolsillo
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            No somos un despacho que solo te manda PDFs por correo. Tienes una app donde recibes
            notificaciones al instante: cuando publicamos tu previo, cuando tus declaraciones están
            listas, cuando validamos tu pago y cuando cerramos tu mes.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Avisos push y en portal — sin perseguir a tu contador",
              "Stepper de 7 pasos: siempre sabes en qué etapa va tu mes",
              "Documentos, acuses y comprobantes en un solo lugar",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-300 sm:text-base">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                  ✓
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Portal RDC · Notificaciones
                  </p>
                  <p className="text-sm font-black text-slate-900">Actividad reciente</p>
                </div>
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-black text-white">
                    2
                  </span>
                </span>
              </div>
              <div className="space-y-2.5 bg-white p-4 sm:p-5">
                {NOTIF_DEMO.map((n) => (
                  <div
                    key={n.titulo}
                    className={`rounded-2xl border p-3.5 ${n.bg} ${n.border} ${n.nueva ? "ring-2 ring-violet-400/30" : ""}`}
                  >
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
                  Así te avisamos en cada paso del flujo ↓
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function MockupPanel({ paso }: { paso: number }) {
  const pasoData = PASOS_CUMPLIMIENTO[paso - 1];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3 ring-1 ring-white/10 sm:p-4">
      <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-white">
        Así lo ves en tu portal
      </p>
      <ProcesoPortalMockup paso={paso} />
      <p className="mt-3 text-center text-xs font-semibold text-white/65">{pasoData.portalHint}</p>
    </div>
  );
}

/** Borde degradado (p. ej. verde arriba → amarillo abajo) con fondo oscuro interior. */
function GradientBorderCard({
  gradient,
  inactiveGradient,
  glow,
  activo,
  children,
}: {
  gradient: string;
  inactiveGradient?: string;
  glow?: string;
  activo: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="h-full rounded-2xl p-[1.5px]"
      style={{
        background: activo ? gradient : (inactiveGradient ?? gradient),
        boxShadow: activo && glow ? glow : undefined,
      }}
    >
      <div className="flex h-full flex-col rounded-[14px] bg-black/92 p-4 sm:p-5">{children}</div>
    </div>
  );
}

function UserAvatarIcon() {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1"
      style={{
        backgroundColor: `${DRAFTEA_LIME}18`,
        borderColor: `${DRAFTEA_LIME}55`,
        boxShadow: `0 0 18px ${DRAFTEA_LIME}33`,
      }}
      aria-hidden
    >
      <svg
        className="h-5 w-5"
        style={{ color: DRAFTEA_YELLOW }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20c0-3.5 3.134-6 7-6s7 2.5 7 6" />
      </svg>
    </div>
  );
}

function RdcAvatarMark() {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1"
      style={{
        background: `linear-gradient(135deg, ${DRAFTEA_BLUE}55, ${DRAFTEA_PURPLE}44)`,
        borderColor: `${DRAFTEA_PURPLE}66`,
        boxShadow: `0 0 18px ${DRAFTEA_PURPLE}40`,
      }}
      aria-hidden
    >
      <Logo mark="r" variante="white" alto={26} className="opacity-95" />
    </div>
  );
}

function DualActionCards({
  paso,
  stepIndex,
  focus,
  subFase,
  mostrarSubFase,
}: {
  paso: PasoData;
  stepIndex: number;
  focus: CardFocusState;
  subFase: SubFase;
  mostrarSubFase: boolean;
}) {
  const tuActive = subFase === "tu";
  const rdcActive = subFase === "rdc" || subFase === "handoff";

  const clienteBorder = `linear-gradient(to bottom, ${DRAFTEA_LIME}, ${DRAFTEA_YELLOW})`;
  const clienteBorderMuted = `linear-gradient(to bottom, ${DRAFTEA_LIME}44, ${DRAFTEA_YELLOW}33)`;
  const rdcBorder = `linear-gradient(to bottom, ${DRAFTEA_BLUE}, ${DRAFTEA_PURPLE})`;
  const rdcBorderMuted = `linear-gradient(to bottom, ${DRAFTEA_BLUE}44, ${DRAFTEA_PURPLE}33)`;

  return (
    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 overflow-hidden">
      <div
        className="relative will-change-transform"
        style={{
          transform: `translate3d(${focus.tuTranslateX}px, 0, 0)`,
          zIndex: tuActive ? 2 : 1,
        }}
      >
        <GradientBorderCard
          gradient={clienteBorder}
          inactiveGradient={clienteBorderMuted}
          glow={`0 0 32px ${DRAFTEA_LIME}28, 0 0 48px ${DRAFTEA_YELLOW}18`}
          activo={tuActive}
        >
          <div
            className="flex items-center gap-3 border-b pb-3"
            style={{ borderColor: `${DRAFTEA_LIME}28` }}
          >
            <UserAvatarIcon />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Lo que tú haces</p>
          </div>
          <ol className="mt-4 space-y-3">
            {paso.tuParte.map((accion, n) => (
              <li key={accion} className="flex items-start gap-2.5">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white ring-1"
                  style={{
                    background: `linear-gradient(to bottom, ${DRAFTEA_LIME}33, ${DRAFTEA_YELLOW}22)`,
                    borderColor: `${DRAFTEA_YELLOW}44`,
                  }}
                >
                  {n + 1}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-white sm:text-base">{accion}</span>
              </li>
            ))}
          </ol>
        </GradientBorderCard>
      </div>

      <div
        className="relative will-change-transform"
        style={{
          transform: `translate3d(${focus.rdcTranslateX}px, 0, 0)`,
          zIndex: rdcActive ? 2 : 1,
        }}
      >
        <GradientBorderCard
          gradient={rdcBorder}
          inactiveGradient={rdcBorderMuted}
          glow={`0 0 32px ${DRAFTEA_PURPLE}35`}
          activo={rdcActive}
        >
          <div
            className="flex items-center gap-3 border-b pb-3"
            style={{ borderColor: `${DRAFTEA_PURPLE}30` }}
          >
            <RdcAvatarMark />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Lo que hace RDC</p>
          </div>
          <ul className="mt-4 space-y-2.5">
            {paso.nosotros.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-white sm:text-base">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: RAIL_COLORS[stepIndex] }}
                />
                {item}
              </li>
            ))}
          </ul>
        </GradientBorderCard>
      </div>

      {mostrarSubFase && (
        <p className="col-span-full mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35 min-[480px]:col-span-2">
          {subFase === "tu" && "1 · Tu parte"}
          {subFase === "rdc" && "2 · Nuestro trabajo"}
          {subFase === "handoff" && "3 · Siguiente paso"}
        </p>
      )}
    </div>
  );
}

function PasoCardsYMockup({
  paso,
  stepIndex,
  focus,
  subFase,
  activo,
}: {
  paso: PasoData;
  stepIndex: number;
  focus: CardFocusState;
  subFase: SubFase;
  activo: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-5 overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:gap-6 xl:gap-8">
      <DualActionCards
        paso={paso}
        stepIndex={stepIndex}
        focus={focus}
        subFase={subFase}
        mostrarSubFase={activo}
      />
      <div
        className="will-change-transform"
        style={{ transform: `translate3d(0, ${focus.mockupTranslateY}px, 0)` }}
      >
        <MockupPanel paso={paso.numero} />
      </div>
    </div>
  );
}

const RAIL_LEFT = "left-[1.75rem] sm:left-[2.25rem]";
const NODE_SIZE = "h-14 w-14 sm:h-16 sm:w-16";

export default function ComoTrabajamos() {
  const [pasoActivo, setPasoActivo] = useState(1);
  const [railStartPx, setRailStartPx] = useState(0);
  const [railFillPx, setRailFillPx] = useState(0);
  const [railHeightPx, setRailHeightPx] = useState(0);
  const [stepFocuses, setStepFocuses] = useState<CardFocusState[]>(() =>
    PASOS_CUMPLIMIENTO.map(() => IDLE_CARD_FOCUS)
  );
  const [subFase, setSubFase] = useState<SubFase>("tu");
  const [stepVisuals, setStepVisuals] = useState<StepVisual[]>(() =>
    PASOS_CUMPLIMIENTO.map((_, i) => (i === 0 ? { zIndex: 14 } : DEFAULT_STEP_VISUAL))
  );
  const latchedProgressRef = useRef<number[]>(PASOS_CUMPLIMIENTO.map(() => 0));
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const pasoActivoRef = useRef(1);

  const measureRail = useCallback(() => {
    const timeline = timelineRef.current;
    const nodes = nodeRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (!timeline || !nodes.length) return;

    const timelineRect = timeline.getBoundingClientRect();
    const nodeCenters = nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return rect.top - timelineRect.top + rect.height / 2;
    });

    const firstCenter = nodeCenters[0];
    const lastCenter = nodeCenters[nodeCenters.length - 1];
    const timelineDocTop = timelineRect.top + window.scrollY;
    const anchorY = window.scrollY + window.innerHeight * 0.36;

    let fillEnd = firstCenter;

    for (let i = 1; i < nodes.length; i++) {
      const prevDocY = timelineDocTop + nodeCenters[i - 1];
      const currDocY = timelineDocTop + nodeCenters[i];

      if (anchorY >= currDocY) {
        fillEnd = nodeCenters[i];
      } else if (anchorY > prevDocY) {
        const t = (anchorY - prevDocY) / (currDocY - prevDocY);
        fillEnd = nodeCenters[i - 1] + t * (nodeCenters[i] - nodeCenters[i - 1]);
        break;
      } else {
        break;
      }
    }

    setRailStartPx(firstCenter);
    setRailFillPx(Math.max(0, fillEnd - firstCenter));
    setRailHeightPx(Math.max(0, lastCenter - firstCenter));
  }, []);

  useEffect(() => {
    const els = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!els.length) return;

    let ticking = false;

    const updateActive = () => {
      ticking = false;
      measureRail();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const anchor = vh * 0.38;
      let bestIdx = 0;
      let bestDist = Infinity;

      els.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < vh * 0.12 || rect.top > vh * 0.9) return;
        const dist = Math.abs(rect.top + 40 - anchor);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });

      const visuals = els.map((el, i) => ({
        zIndex: computeStepZIndex(el.getBoundingClientRect(), vh, i === bestIdx),
      }));
      setStepVisuals(visuals);

      const activeEl = els[bestIdx];
      const progress = activeEl ? getStepScrollProgress(activeEl) : 0;
      if (activeEl) {
        latchedProgressRef.current[bestIdx] = Math.max(
          latchedProgressRef.current[bestIdx],
          progress
        );
      }

      const focuses = els.map((_, i) => {
        const latched = latchedProgressRef.current[i] ?? 0;
        return focusForStep(i === bestIdx, latched, vw, vh, reduced);
      });
      setStepFocuses(focuses);
      setSubFase(progressToSubFase(progress));

      if (pasoActivoRef.current !== bestIdx + 1) {
        pasoActivoRef.current = bestIdx + 1;
        setPasoActivo(bestIdx + 1);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActive);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    measureRail();
    updateActive();
    requestAnimationFrame(() => {
      measureRail();
      updateActive();
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measureRail, reduced]);

  useEffect(() => {
    measureRail();
  }, [pasoActivo, measureRail]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    const ro = new ResizeObserver(() => measureRail());
    ro.observe(timeline);
    return () => ro.disconnect();
  }, [measureRail]);

  const scrollToStep = useCallback(
    (num: number) => {
      stepRefs.current[num - 1]?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    },
    [reduced]
  );

  const pasoColor = RAIL_COLORS[pasoActivo - 1];
  const pasoColorNext = RAIL_COLORS[Math.min(pasoActivo, 6)];

  return (
    <div className="relative bg-black text-white">

      <HeroAppPortal />

      <section id="proceso" className="relative py-8 sm:py-12">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <RevealOnScroll className="mb-8 sm:mb-10">
            <p className={`text-[11px] font-bold uppercase tracking-[0.4em] ${TEXTO_ACENTO}`}>
              Flujo de cumplimiento
            </p>
            <h2 className="mt-4 max-w-4xl text-[2.75rem] font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
              7 pasos que puedes <span className={GRADIENTE_ACENTO}>seguir en tu portal</span>
            </h2>
            <p className="mt-6 max-w-xl text-base text-slate-400 sm:text-lg">
              Desplázate por cada paso: tu card entra desde la izquierda, la de RDC desde la
              derecha y el mockup desde arriba — y se quedan fijos para que los leas con calma.
            </p>
          </RevealOnScroll>

          <div className="max-w-7xl">
            <div ref={timelineRef} className="relative">
              <div
                className={`pointer-events-none absolute ${RAIL_LEFT} w-5 rounded-full bg-white/[0.07] ring-1 ring-inset ring-white/10 sm:w-6`}
                style={{ top: railStartPx, height: railHeightPx || undefined }}
                aria-hidden
              />
              <div
                className={`pointer-events-none absolute ${RAIL_LEFT} w-5 overflow-hidden rounded-full sm:w-6`}
                style={{
                  top: railStartPx,
                  height: railFillPx,
                  background: segmentRailGradient(),
                  backgroundSize: railHeightPx > 0 ? `100% ${railHeightPx}px` : undefined,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "top",
                  boxShadow: "inset 0 0 12px rgba(255,255,255,0.15), 0 0 16px rgba(124,58,237,0.35)",
                  transition: reduced ? "none" : "height 180ms linear",
                }}
                aria-hidden
              />

              {PASOS_CUMPLIMIENTO.map((p, i) => {
                const activo = p.numero === pasoActivo;
                const completado = p.numero < pasoActivo;
                const visual = stepVisuals[i] ?? DEFAULT_STEP_VISUAL;
                const focus = stepFocuses[i] ?? IDLE_CARD_FOCUS;
                const fase = activo ? subFase : "tu";

                return (
                  <div
                    key={p.numero}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                    }}
                    data-parallax-root
                    className={`relative flex scroll-mt-24 gap-5 sm:gap-8 ${PASO_SCROLL_PAD} ${
                      i < PASOS_CUMPLIMIENTO.length - 1 ? "mb-2" : ""
                    }`}
                    style={{ zIndex: visual.zIndex }}
                  >
                    <div
                      className="relative w-[4.5rem] shrink-0 sm:w-20"
                      style={{ zIndex: visual.zIndex + 1 }}
                    >
                      {activo && i < PASOS_CUMPLIMIENTO.length - 1 && (
                        <div className="absolute left-1/2 top-full z-0 -translate-x-1/2 pt-2">
                          <ScrollDownHint />
                        </div>
                      )}
                      <button
                        ref={(el) => {
                          nodeRefs.current[i] = el;
                        }}
                        type="button"
                        onClick={() => scrollToStep(p.numero)}
                        aria-current={activo ? "step" : undefined}
                        aria-label={`Paso ${p.numero}: ${p.titulo}`}
                        className={`relative z-10 flex ${NODE_SIZE} items-center justify-center rounded-2xl text-lg font-black ring-1 transition-all duration-500 ease-out sm:rounded-[1.25rem] sm:text-xl ${
                          activo
                            ? `bg-gradient-to-br ${p.accent} text-white shadow-2xl ${p.glow} ring-white/30`
                            : completado
                              ? "text-white ring-white/20"
                              : "bg-black text-slate-500 ring-white/10 hover:text-slate-300"
                        }`}
                        style={
                          completado && !activo
                            ? railGradient(i, Math.min(i + 1, 6))
                            : !activo && !completado
                              ? { background: "#000000" }
                              : undefined
                        }
                      >
                        {completado && !activo ? <CheckIcon /> : p.numero}
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col pt-1">
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ring-1 ${p.badge}`}
                      >
                        Paso {p.numero}
                      </span>
                      <h3
                        className={`mt-4 font-black tracking-[-0.04em] ${
                          activo
                            ? `bg-gradient-to-br ${p.accent} bg-clip-text text-transparent text-4xl leading-[0.95] sm:text-5xl lg:text-[3.25rem] xl:text-6xl`
                            : "text-2xl leading-tight text-slate-500 sm:text-3xl"
                        }`}
                      >
                        {p.titulo}
                      </h3>
                      <p
                        className={`mt-4 max-w-2xl leading-relaxed ${
                          activo ? "text-base text-slate-200 sm:text-lg" : "text-base text-slate-500"
                        }`}
                      >
                        {p.descripcion}
                      </p>

                      <div className="mt-6">
                        <PasoCardsYMockup
                          paso={p}
                          stepIndex={i}
                          focus={focus}
                          subFase={fase}
                          activo={activo}
                        />
                      </div>

                      <div className="mt-8 max-w-3xl">
                        <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                          <span className="font-bold text-slate-400">¿Por qué? </span>
                          {p.porQue}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2.5 lg:mt-12">
            {PASOS_CUMPLIMIENTO.map((p, i) => (
              <button
                key={p.numero}
                type="button"
                onClick={() => scrollToStep(p.numero)}
                aria-label={`Ir al paso ${p.numero}`}
                className="rounded-full transition-all duration-500 ease-out"
                style={
                  p.numero === pasoActivo
                    ? {
                        width: 40,
                        height: 12,
                        background: `linear-gradient(to right, ${pasoColor}, ${pasoColorNext})`,
                        boxShadow: `0 4px 14px ${pasoColor}55`,
                      }
                    : p.numero < pasoActivo
                      ? { width: 12, height: 12, backgroundColor: RAIL_COLORS[i] }
                      : { width: 12, height: 12, backgroundColor: "rgba(255,255,255,0.15)" }
                }
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
