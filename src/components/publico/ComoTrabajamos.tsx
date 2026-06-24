"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Logo from "@/components/publico/Logo";
import RevealOnScroll from "@/components/publico/motion/RevealOnScroll";
import ProcesoPortalMockup from "@/components/publico/ProcesoPortalMockup";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Colores del rail — degradado entre paso y paso. */
const RAIL_COLORS = ["#94a3b8", "#38bdf8", "#fbbf24", "#c084fc", "#818cf8", "#2dd4bf", "#4ade80"];

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

type CardFocusState = {
  tuScale: number;
  tuOpacity: number;
  rdcScale: number;
  rdcOpacity: number;
  panelTranslateY: number;
  panelOpacity: number;
};

type SubFase = "tu" | "rdc" | "handoff";

const DEFAULT_CARD_FOCUS: CardFocusState = {
  tuScale: 1.04,
  tuOpacity: 1,
  rdcScale: 0.9,
  rdcOpacity: 0.4,
  panelTranslateY: 0,
  panelOpacity: 1,
};

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
  const range = Math.max(rect.height - vh * 0.32, vh * 0.55);
  return Math.max(0, Math.min(1, scrolled / range));
}

function computeCardFocus(progress: number, reduced: boolean): CardFocusState {
  if (reduced) {
    return {
      tuScale: 1,
      tuOpacity: 1,
      rdcScale: 1,
      rdcOpacity: 1,
      panelTranslateY: 0,
      panelOpacity: 1,
    };
  }

  const TU_END = 0.36;
  const RDC_END = 0.74;

  if (progress < TU_END) {
    const peak = smoothstep(progress / TU_END);
    return {
      tuScale: lerp(0.94, 1.06, peak),
      tuOpacity: lerp(0.5, 1, peak),
      rdcScale: lerp(0.94, 0.86, peak),
      rdcOpacity: lerp(0.45, 0.32, peak),
      panelTranslateY: 0,
      panelOpacity: 1,
    };
  }

  if (progress < RDC_END) {
    const peak = smoothstep((progress - TU_END) / (RDC_END - TU_END));
    return {
      tuScale: lerp(1.06, 0.86, peak),
      tuOpacity: lerp(1, 0.32, peak),
      rdcScale: lerp(0.86, 1.06, peak),
      rdcOpacity: lerp(0.32, 1, peak),
      panelTranslateY: 0,
      panelOpacity: 1,
    };
  }

  const exit = smoothstep((progress - RDC_END) / (1 - RDC_END));
  return {
    tuScale: lerp(0.86, 0.92, exit),
    tuOpacity: lerp(0.32, 0.45, exit),
    rdcScale: lerp(1.06, 0.9, exit),
    rdcOpacity: lerp(1, 0.38, exit),
    panelTranslateY: lerp(0, -36, exit),
    panelOpacity: lerp(1, 0.82, exit),
  };
}

function progressToSubFase(progress: number): SubFase {
  if (progress < 0.36) return "tu";
  if (progress < 0.74) return "rdc";
  return "handoff";
}

function railGradient(fromIdx: number, toIdx: number): CSSProperties {
  return {
    background: `linear-gradient(to bottom, ${RAIL_COLORS[fromIdx]}, ${RAIL_COLORS[toIdx]})`,
  };
}

function fullRailGradient(): string {
  return `linear-gradient(to bottom, ${RAIL_COLORS.join(", ")})`;
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MockupPanel({ paso }: { paso: number }) {
  const pasoData = PASOS_CUMPLIMIENTO[paso - 1];
  const color = RAIL_COLORS[paso - 1];

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-8 rounded-3xl blur-2xl"
        style={{ background: `radial-gradient(ellipse at center, ${color}33, transparent 70%)` }}
        aria-hidden
      />
      <div className="relative rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 ring-1 ring-white/10 backdrop-blur-sm sm:p-5">
        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
          Vista en tu portal
        </p>
        <ProcesoPortalMockup paso={paso} />
        <p className="mt-4 text-center text-xs font-semibold text-slate-400">{pasoData.portalHint}</p>
      </div>
    </div>
  );
}

function UserAvatarIcon() {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-teal-500/15 ring-1 ring-emerald-400/30"
      aria-hidden
    >
      <svg
        className="h-5 w-5 text-emerald-200"
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
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/35 to-violet-600/20 ring-1 ring-indigo-400/35"
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
}: {
  paso: PasoData;
  stepIndex: number;
  focus: CardFocusState;
  subFase: SubFase;
}) {
  const tuActive = focus.tuScale >= focus.rdcScale;
  const rdcActive = focus.rdcScale > focus.tuScale;

  const tuTextClass = tuActive
    ? "text-[0.95rem] leading-relaxed text-slate-100 sm:text-base lg:text-[1.0625rem] lg:leading-[1.65]"
    : "text-sm leading-relaxed text-slate-400 sm:text-[0.95rem]";

  const rdcTextClass = rdcActive
    ? "text-[0.95rem] leading-relaxed text-slate-100 sm:text-base lg:text-[1.0625rem] lg:leading-[1.65]"
    : "text-sm leading-relaxed text-slate-400 sm:text-[0.95rem]";

  return (
    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4">
      <div
        className={`relative origin-center flex h-full min-h-[12rem] flex-col rounded-2xl border p-4 ring-1 will-change-transform sm:min-h-[13rem] sm:p-5 ${
          tuActive
            ? "border-emerald-400/40 bg-emerald-500/[0.12] shadow-xl shadow-emerald-950/30 ring-emerald-400/30"
            : "border-white/8 bg-white/[0.03] ring-white/5"
        }`}
        style={{
          transform: `scale(${focus.tuScale})`,
          opacity: focus.tuOpacity,
          zIndex: tuActive ? 2 : 1,
        }}
      >
        <div className="flex items-center gap-3 border-b border-white/8 pb-3">
          <UserAvatarIcon />
          <p
            className={`text-[10px] font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] ${
              tuActive ? "text-emerald-200" : "text-emerald-400/70"
            }`}
          >
            Lo que tú haces
          </p>
        </div>
        <ol className="mt-4 flex flex-1 flex-col justify-center space-y-3">
          {paso.tuParte.map((accion, n) => (
            <li key={accion} className="flex items-start gap-2.5">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black ring-1 ${
                  tuActive
                    ? "bg-emerald-500/20 text-emerald-200 ring-emerald-400/35"
                    : "bg-emerald-500/10 text-emerald-400/80 ring-emerald-400/20"
                }`}
              >
                {n + 1}
              </span>
              <span className={`pt-0.5 ${tuTextClass}`}>{accion}</span>
            </li>
          ))}
        </ol>
      </div>

      <div
        className={`relative origin-center flex h-full min-h-[12rem] flex-col rounded-2xl border p-4 ring-1 will-change-transform sm:min-h-[13rem] sm:p-5 ${
          rdcActive
            ? "border-indigo-400/35 bg-indigo-500/[0.1] shadow-xl shadow-indigo-950/30 ring-indigo-400/25"
            : "border-white/6 bg-white/[0.02] ring-white/4"
        }`}
        style={{
          transform: `scale(${focus.rdcScale})`,
          opacity: focus.rdcOpacity,
          zIndex: rdcActive ? 2 : 1,
        }}
      >
        <div className="flex items-center gap-3 border-b border-white/8 pb-3">
          <RdcAvatarMark />
          <p
            className={`text-[10px] font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] ${
              rdcActive ? "text-indigo-100" : "text-indigo-300/60"
            }`}
          >
            Lo que hace RDC
          </p>
        </div>
        <ul className="mt-4 flex flex-1 flex-col justify-center space-y-2.5">
          {paso.nosotros.map((item) => (
            <li key={item} className={`flex items-start gap-2.5 ${rdcTextClass}`}>
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: RAIL_COLORS[stepIndex] }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="col-span-full mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600 min-[480px]:col-span-2">
        {subFase === "tu" && "1 · Tu parte"}
        {subFase === "rdc" && "2 · Nuestro trabajo"}
        {subFase === "handoff" && "3 · Siguiente paso"}
      </p>
    </div>
  );
}

function StickyProcesoPanel({
  pasoActivo,
  focus,
  subFase,
}: {
  pasoActivo: number;
  focus: CardFocusState;
  subFase: SubFase;
}) {
  const paso = PASOS_CUMPLIMIENTO[pasoActivo - 1];

  return (
    <div
      className="sticky top-20 space-y-5 will-change-transform xl:top-24"
      style={{
        transform: `translateY(${focus.panelTranslateY}px)`,
        opacity: focus.panelOpacity,
      }}
    >
      <div className="rounded-3xl border border-white/10 bg-[#08080d]/80 p-3 ring-1 ring-white/10 backdrop-blur-md sm:p-4">
        <div className="mb-3 flex items-center justify-center gap-2">
          {(["tu", "rdc", "handoff"] as SubFase[]).map((fase) => (
            <span
              key={fase}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                subFase === fase ? "w-8 bg-indigo-400" : "w-1.5 bg-white/15"
              }`}
              aria-hidden
            />
          ))}
        </div>
        <DualActionCards
          paso={paso}
          stepIndex={pasoActivo - 1}
          focus={focus}
          subFase={subFase}
        />
      </div>
      <MockupPanel paso={pasoActivo} />
    </div>
  );
}

const RAIL_LEFT = "left-[1.75rem] sm:left-[2.25rem]";
const NODE_SIZE = "h-14 w-14 sm:h-16 sm:w-16";

export default function ComoTrabajamos() {
  const [pasoActivo, setPasoActivo] = useState(1);
  const [railFillPx, setRailFillPx] = useState(0);
  const [cardFocus, setCardFocus] = useState<CardFocusState>(DEFAULT_CARD_FOCUS);
  const [subFase, setSubFase] = useState<SubFase>("tu");
  const [narrativaParallax, setNarrativaParallax] = useState(0);
  const [narrativaOpacity, setNarrativaOpacity] = useState(1);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const pasoActivoRef = useRef(1);

  const measureRail = useCallback(() => {
    const nodes = nodeRefs.current.filter(Boolean) as HTMLButtonElement[];
    const firstNode = nodes[0];
    if (!firstNode || nodes.length < 2) return;

    const firstCenter = firstNode.offsetTop + firstNode.offsetHeight / 2;
    const anchorY = window.scrollY + window.innerHeight * 0.42;
    let fillTo = firstCenter;

    for (let i = 1; i < nodes.length; i++) {
      const prevCenter = nodes[i - 1].offsetTop + nodes[i - 1].offsetHeight / 2;
      const center = nodes[i].offsetTop + nodes[i].offsetHeight / 2;
      if (anchorY >= center) {
        fillTo = center;
      } else if (anchorY > prevCenter) {
        const t = (anchorY - prevCenter) / (center - prevCenter);
        fillTo = prevCenter + t * (center - prevCenter);
        break;
      } else {
        break;
      }
    }

    setRailFillPx(Math.max(0, fillTo - firstCenter));
  }, []);

  useEffect(() => {
    const els = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!els.length) return;

    let ticking = false;

    const updateActive = () => {
      ticking = false;
      measureRail();
      const vh = window.innerHeight;
      const anchor = vh * 0.42;
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

      const activeEl = els[bestIdx];
      const progress = activeEl ? getStepScrollProgress(activeEl) : 0;
      const focus = computeCardFocus(progress, reduced);
      setCardFocus(focus);
      setSubFase(progressToSubFase(progress));
      setNarrativaParallax(
        reduced ? 0 : progress > 0.74 ? lerp(0, -48, smoothstep((progress - 0.74) / 0.26)) : 0
      );
      setNarrativaOpacity(
        reduced ? 1 : progress > 0.74 ? lerp(1, 0.88, smoothstep((progress - 0.74) / 0.26)) : 1
      );

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
    <>
      <section className="relative overflow-hidden bg-[#050508] py-16 sm:py-20 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <RevealOnScroll>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-indigo-300">
              Cómo trabajamos
            </p>
            <h1 className="mt-4 text-[2.5rem] font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Un proceso claro,{" "}
              <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                mes con mes
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              En RDC seguimos un flujo estandarizado para que sepas en qué etapa está tu
              contabilidad en cualquier momento. Sin sorpresas, sin retrasos.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section id="proceso" className="relative overflow-hidden bg-[#050508] py-8 sm:py-12 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.18),transparent)]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <RevealOnScroll className="mb-8 sm:mb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-indigo-400">
              Flujo de cumplimiento
            </p>
            <h2 className="mt-4 max-w-4xl text-[2.75rem] font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
              7 pasos que puedes{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
                seguir en tu portal
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-base text-slate-400 sm:text-lg">
              En cada paso, primero enfocamos tu rol, luego el de RDC, y al seguir
              desplazándote pasamos suavemente al siguiente punto del proceso.
            </p>
          </RevealOnScroll>

          <div
            className="sticky top-20 z-20 mb-6 will-change-transform lg:hidden"
            style={{
              transform: `translateY(${cardFocus.panelTranslateY * 0.6}px)`,
              opacity: cardFocus.panelOpacity,
            }}
          >
            <div className="rounded-2xl border border-white/10 bg-[#08080d]/90 p-3 ring-1 ring-white/10 backdrop-blur-md">
              <DualActionCards
                paso={PASOS_CUMPLIMIENTO[pasoActivo - 1]}
                stepIndex={pasoActivo - 1}
                focus={cardFocus}
                subFase={subFase}
              />
            </div>
            <div className="mt-4">
              <MockupPanel paso={pasoActivo} />
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(400px,500px)] lg:items-start lg:gap-12 xl:gap-16">
            <div ref={timelineRef} className="relative">
              {/* Rail continuo — una sola línea de arriba a abajo */}
              <div
                className={`pointer-events-none absolute ${RAIL_LEFT} top-7 w-5 rounded-full bg-white/[0.07] ring-1 ring-inset ring-white/10 sm:top-8 sm:w-6`}
                style={{ bottom: "3.5rem" }}
                aria-hidden
              />
              <div
                className={`pointer-events-none absolute ${RAIL_LEFT} top-7 w-5 overflow-hidden rounded-full sm:top-8 sm:w-6`}
                style={{
                  height: railFillPx,
                  background: fullRailGradient(),
                  boxShadow: "inset 0 0 12px rgba(255,255,255,0.15)",
                  transition: reduced ? "none" : "height 80ms linear",
                }}
                aria-hidden
              />

              {PASOS_CUMPLIMIENTO.map((p, i) => {
                const activo = p.numero === pasoActivo;
                const completado = p.numero < pasoActivo;

                return (
                  <div
                    key={p.numero}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                    }}
                    className={`relative flex scroll-mt-24 gap-5 sm:gap-8 min-h-[118vh] lg:min-h-[145vh] ${
                      i < PASOS_CUMPLIMIENTO.length - 1 ? "pb-10 sm:pb-12" : "pb-6"
                    }`}
                  >
                    <div className="relative w-[4.5rem] shrink-0 sm:w-20">
                      <button
                        ref={(el) => {
                          nodeRefs.current[i] = el;
                        }}
                        type="button"
                        onClick={() => scrollToStep(p.numero)}
                        aria-current={activo ? "step" : undefined}
                        aria-label={`Paso ${p.numero}: ${p.titulo}`}
                        className={`relative z-10 flex ${NODE_SIZE} items-center justify-center rounded-2xl text-lg font-black ring-1 transition-all duration-[900ms] ease-out sm:rounded-[1.25rem] sm:text-xl ${
                          activo
                            ? `scale-105 bg-gradient-to-br ${p.accent} text-white shadow-2xl ${p.glow} ring-white/30`
                            : completado
                              ? "text-white ring-white/20"
                              : "bg-[#0a0a0f] text-slate-500 ring-white/10 hover:text-slate-300"
                        }`}
                        style={
                          completado && !activo
                            ? railGradient(i, Math.min(i + 1, 6))
                            : !activo && !completado
                              ? { background: "#0a0a0f" }
                              : undefined
                        }
                      >
                        {completado && !activo ? <CheckIcon /> : p.numero}
                      </button>
                    </div>

                    <div
                      className={`flex flex-1 flex-col pt-1 will-change-transform ${
                        activo ? "" : "opacity-[0.72]"
                      }`}
                      style={
                        activo && !reduced
                          ? {
                              transform: `translateY(${narrativaParallax}px)`,
                              opacity: narrativaOpacity,
                            }
                          : undefined
                      }
                    >
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ring-1 ${p.badge}`}
                      >
                        Paso {p.numero}
                      </span>
                      <h3
                        className={`mt-4 font-black tracking-[-0.04em] transition-all duration-[900ms] ease-out ${
                          activo
                            ? `bg-gradient-to-br ${p.accent} bg-clip-text text-transparent text-4xl leading-[0.95] sm:text-5xl lg:text-[3.25rem] lg:leading-[0.95] xl:text-6xl`
                            : "text-2xl leading-tight text-slate-400 sm:text-3xl"
                        }`}
                      >
                        {p.titulo}
                      </h3>
                      <p
                        className={`mt-4 max-w-2xl leading-relaxed transition-all duration-[900ms] ${
                          activo
                            ? "text-base text-slate-200 sm:text-lg lg:text-xl lg:leading-relaxed"
                            : "text-base text-slate-400 sm:text-lg"
                        }`}
                      >
                        {p.descripcion}
                      </p>

                      <div className="mt-6 max-w-2xl space-y-3 lg:mt-8">
                        <p
                          className={`text-sm leading-relaxed transition-all duration-[900ms] sm:text-base ${
                            activo ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          <span className="font-bold text-slate-300">¿Por qué? </span>
                          {p.porQue}
                        </p>

                        <p
                          className={`rounded-xl border px-4 py-3 text-xs font-semibold transition-all duration-[900ms] sm:text-sm ${
                            activo
                              ? "border-white/12 bg-white/[0.05] text-slate-300"
                              : "border-white/8 bg-white/[0.03] text-slate-400"
                          }`}
                        >
                          En tu portal: {p.portalHint}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden lg:block">
              <StickyProcesoPanel pasoActivo={pasoActivo} focus={cardFocus} subFase={subFase} />
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
    </>
  );
}
