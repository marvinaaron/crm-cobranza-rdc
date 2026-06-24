"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
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

function railGradient(fromIdx: number, toIdx: number): CSSProperties {
  return {
    background: `linear-gradient(to bottom, ${RAIL_COLORS[fromIdx]}, ${RAIL_COLORS[toIdx]})`,
  };
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

function RailSegment({
  filled,
  fromIdx,
  toIdx,
}: {
  filled: boolean;
  fromIdx: number;
  toIdx: number;
}) {
  return (
    <div
      className={`w-5 flex-1 min-h-12 overflow-hidden rounded-full transition-opacity duration-700 sm:w-6 ${
        filled ? "shadow-[inset_0_0_10px_rgba(255,255,255,0.12)]" : "bg-white/[0.06] ring-1 ring-inset ring-white/10"
      }`}
      style={filled ? railGradient(fromIdx, toIdx) : undefined}
      aria-hidden
    />
  );
}

export default function ComoTrabajamos() {
  const [pasoActivo, setPasoActivo] = useState(1);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const els = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!els.length) return;

    let ticking = false;

    const updateActive = () => {
      ticking = false;
      const vh = window.innerHeight;
      const anchor = vh * 0.38;
      let bestIdx = 0;
      let bestDist = Infinity;

      els.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 100 || rect.top > vh - 60) return;
        const dist = Math.abs(rect.top + rect.height * 0.25 - anchor);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });

      setPasoActivo((prev) => (prev === bestIdx + 1 ? prev : bestIdx + 1));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActive);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateActive();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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

      <section id="proceso" className="relative overflow-hidden bg-[#050508] py-12 sm:py-20 text-white">
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
          <RevealOnScroll className="mb-12 sm:mb-16">
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
              Qué haces tú, qué hace RDC y por qué importa cada etapa. Desplázate con calma — la
              información de cada paso siempre está visible.
            </p>
          </RevealOnScroll>

          <div className="sticky top-20 z-20 mb-8 lg:hidden">
            <MockupPanel paso={pasoActivo} />
          </div>

          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-start lg:gap-14 xl:gap-20">
            <div className="relative">
              {PASOS_CUMPLIMIENTO.map((p, i) => {
                const activo = p.numero === pasoActivo;
                const completado = p.numero < pasoActivo;
                const ultimo = i === PASOS_CUMPLIMIENTO.length - 1;
                const segmentAboveFilled = pasoActivo >= p.numero;
                const segmentBelowFilled = pasoActivo > p.numero;

                return (
                  <div
                    key={p.numero}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                    }}
                    className={`relative flex scroll-mt-28 gap-6 py-14 sm:gap-8 sm:py-20 lg:gap-10 ${
                      activo ? "" : ""
                    }`}
                  >
                    <div className="flex w-[4.5rem] shrink-0 flex-col items-center sm:w-20">
                      {i > 0 ? (
                        <RailSegment filled={segmentAboveFilled} fromIdx={i - 1} toIdx={i} />
                      ) : (
                        <div className="min-h-4 flex-1" aria-hidden />
                      )}

                      <button
                        type="button"
                        onClick={() => scrollToStep(p.numero)}
                        aria-current={activo ? "step" : undefined}
                        aria-label={`Paso ${p.numero}: ${p.titulo}`}
                        className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black ring-1 transition-all duration-500 ease-out sm:h-16 sm:w-16 sm:rounded-[1.25rem] sm:text-xl ${
                          activo
                            ? `scale-105 bg-gradient-to-br ${p.accent} text-white shadow-2xl ${p.glow} ring-white/30`
                            : completado
                              ? "text-white ring-white/20"
                              : "bg-white/[0.06] text-slate-500 ring-white/10 hover:bg-white/10"
                        }`}
                        style={
                          completado && !activo
                            ? { background: `linear-gradient(135deg, ${RAIL_COLORS[i]}, ${RAIL_COLORS[Math.min(i + 1, 6)]})` }
                            : undefined
                        }
                      >
                        {completado && !activo ? <CheckIcon /> : p.numero}
                      </button>

                      {!ultimo ? (
                        <RailSegment filled={segmentBelowFilled} fromIdx={i} toIdx={i + 1} />
                      ) : (
                        <div className="min-h-4 flex-1" aria-hidden />
                      )}
                    </div>

                    <div
                      className={`flex flex-1 flex-col transition-opacity duration-500 ${
                        activo ? "opacity-100" : "opacity-[0.72]"
                      }`}
                    >
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ring-1 ${p.badge}`}
                      >
                        Paso {p.numero}
                      </span>
                      <h3
                        className={`mt-4 font-black tracking-[-0.04em] transition-all duration-500 ${
                          activo
                            ? `bg-gradient-to-br ${p.accent} bg-clip-text text-transparent text-4xl leading-[0.95] sm:text-5xl lg:text-6xl`
                            : "text-2xl leading-tight text-slate-400 sm:text-3xl"
                        }`}
                      >
                        {p.titulo}
                      </h3>
                      <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                        {p.descripcion}
                      </p>

                      <div className="mt-8 max-w-2xl space-y-4">
                        <div
                          className={`rounded-2xl border p-5 ring-1 sm:p-6 ${
                            activo
                              ? "border-emerald-400/30 bg-emerald-500/[0.08] ring-emerald-400/20"
                              : "border-white/8 bg-white/[0.03] ring-white/5"
                          }`}
                        >
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                            Lo que tú haces
                          </p>
                          <ol className="mt-4 space-y-3">
                            {p.tuParte.map((accion, n) => (
                              <li key={accion} className="flex items-start gap-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-xs font-black text-emerald-300 ring-1 ring-emerald-400/25">
                                  {n + 1}
                                </span>
                                <span className="pt-0.5 text-sm leading-relaxed text-slate-200 sm:text-base">
                                  {accion}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div
                          className={`rounded-2xl border p-5 ring-1 sm:p-6 ${
                            activo
                              ? "border-white/12 bg-white/[0.05] ring-white/8"
                              : "border-white/6 bg-white/[0.02] ring-white/4"
                          }`}
                        >
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                            Lo que hace RDC
                          </p>
                          <ul className="mt-4 space-y-2.5">
                            {p.nosotros.map((item) => (
                              <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                                <span
                                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: RAIL_COLORS[i] }}
                                />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <p className="text-sm leading-relaxed text-slate-500">
                          <span className="font-bold text-slate-400">¿Por qué? </span>
                          {p.porQue}
                        </p>

                        <p className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-slate-400">
                          En tu portal: {p.portalHint}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-24">
                <div className="transition-opacity duration-700 ease-out">
                  <MockupPanel paso={pasoActivo} />
                </div>
              </div>
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
