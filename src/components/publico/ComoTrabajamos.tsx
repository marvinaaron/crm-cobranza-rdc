"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import ProcesoPortalMockup from "@/components/publico/ProcesoPortalMockup";
import PillDeslizable from "@/components/ui/PillDeslizable";
import "./como-trabajamos.css";

const PASOS = [
  {
    titulo: "Sin iniciar",
    ves: "En Declaraciones ves el mes en «Sin iniciar». No hay botón urgente.",
    tuParte: "Si te pedimos un estado de cuenta o un dato, mándalo por WhatsApp.",
    nosotros: "Bajamos tus CFDIs del SAT y reunimos bancos.",
  },
  {
    titulo: "En preparación",
    ves: "El pill cambia a «En preparación». Tú no tienes que hacer nada.",
    tuParte: "Espera. Si falta un documento, te escribimos.",
    nosotros: "Registramos el mes en CONTPAQi y armamos el previo.",
  },
  {
    titulo: "Revisión",
    ves: "Aparecen tus cifras: ingresos, gastos y cuánto pagar. Aún no pagas.",
    tuParte: "Revisa ingresos, gastos y el total a pagar.",
    nosotros: "Publicamos el resumen. No presentamos hasta que marques visto.",
  },
  {
    titulo: "Resumen",
    ves: "Tocas «Marcar como visto». Ese es el permiso para declarar.",
    tuParte: "Toca «Marcar como visto» si las cifras están bien.",
    nosotros: "Con tu visto, presentamos la declaración al SAT.",
  },
  {
    titulo: "Declarando",
    ves: "Bajas el acuse y la línea de captura en PDF. El pago es en el banco, no aquí.",
    tuParte: "Descarga acuse y línea. Paga en tu banco o en el SAT.",
    nosotros: "Subimos los PDFs oficiales a tu app.",
  },
  {
    titulo: "Pago",
    ves: "Subes la foto o el PDF del pago que hiciste en el banco.",
    tuParte: "Paga con la línea de captura y sube el comprobante.",
    nosotros: "Validamos monto y referencia y cerramos el mes.",
  },
  {
    titulo: "Completado",
    ves: "El mes queda en Completado. Acuses y pagos siguen en tu historial.",
    tuParte: "Consulta lo que quieras; este periodo ya no tiene pendientes.",
    nosotros: "Archivamos declaración, línea y pago.",
  },
] as const;

const CAPITULOS = [
  {
    id: "preparar",
    etiqueta: "01",
    nombre: "Preparar",
    titulo: "El mes se mueve en tu teléfono.",
    cuerpo: "Tienes una app propia. Nosotros preparamos el expediente; tú ves el estado en Declaraciones.",
    pasos: [0, 1],
  },
  {
    id: "revisar",
    etiqueta: "02",
    nombre: "Revisar",
    titulo: "Las cifras salen. Tú aún no pagas.",
    cuerpo: "Publicamos ingresos, gastos y cuánto pagar. Tu visto es el permiso para declarar.",
    pasos: [2, 3],
  },
  {
    id: "declarar",
    etiqueta: "03",
    nombre: "Declarar",
    titulo: "Se declara. El pago es en el banco.",
    cuerpo: "Bajas acuse y línea de captura. Pagas fuera. Subes el comprobante a la app.",
    pasos: [4, 5],
  },
  {
    id: "archivar",
    etiqueta: "04",
    nombre: "Archivar",
    titulo: "El mes queda. En tu historial.",
    cuerpo: "Cerramos el periodo. Acuses y pagos siguen en Declaraciones cuando los necesites.",
    pasos: [6],
  },
] as const;

const AVISOS = [
  { titulo: "Previo de impuestos publicado", tiempo: "Hace 2 h" },
  { titulo: "Declaraciones listas", tiempo: "Ayer" },
  { titulo: "Mes completado", tiempo: "Hace 3 d" },
] as const;

const INSTALAR = {
  iphone: [
    "Abre tu portal en Safari (no en Chrome).",
    "Toca Compartir, el cuadrado con la flecha hacia arriba.",
    "Elige «Añadir a pantalla de inicio» y confirma.",
  ],
  android: [
    "Abre tu portal en Chrome.",
    "Toca el menú de tres puntos, arriba a la derecha.",
    "Elige «Instalar app» o «Añadir a pantalla principal».",
  ],
} as const;

function IconShareIos({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15V4M8.5 7.5 12 4l3.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VistaSafari() {
  return (
    <div className="proceso-paso-ui" aria-hidden>
      <span className="proceso-paso-app">
        <img src="/proceso/safari.png" alt="" width={32} height={32} />
        <span>Safari</span>
      </span>
    </div>
  );
}

function VistaChrome() {
  return (
    <div className="proceso-paso-ui" aria-hidden>
      <span className="proceso-paso-app">
        <img src="/proceso/chrome.svg" alt="" width={32} height={32} />
        <span>Chrome</span>
      </span>
    </div>
  );
}

function VistaTocar({ children }: { children: ReactNode }) {
  return (
    <div className="proceso-paso-ui proceso-paso-ui-tocar" aria-hidden>
      <span className="proceso-tap">{children}</span>
    </div>
  );
}

function VistaFila({
  icono,
  etiqueta,
}: {
  icono: ReactNode;
  etiqueta: string;
}) {
  return (
    <div className="proceso-paso-fila" aria-hidden>
      <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#e8edf2] text-marca-navy">
        {icono}
      </span>
      <span className="min-w-0 truncate text-[12px] font-bold text-slate-900">{etiqueta}</span>
    </div>
  );
}

function VistaHome() {
  return (
    <div className="proceso-shot" aria-hidden>
      <div className="proceso-shot-dock">
        <span className="proceso-home-ghost" />
        <span className="proceso-home-ghost" />
        <span className="proceso-home-app">
          <span className="proceso-home-halo" aria-hidden />
          <span className="proceso-home-pulse" aria-hidden />
          <span className="proceso-home-pulse" aria-hidden />
          <img src="/apple-touch-icon-v2.png" alt="" width={44} height={44} />
        </span>
        <span className="proceso-home-ghost" />
      </div>
      <span className="proceso-shot-home" />
    </div>
  );
}

function uiDePaso(plataforma: "iphone" | "android", i: number) {
  if (plataforma === "iphone") {
    if (i === 0) return <VistaSafari />;
    if (i === 1) {
      return (
        <VistaTocar>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-marca-navy text-white">
            <IconShareIos />
          </span>
        </VistaTocar>
      );
    }
    return (
      <VistaFila
        icono={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <rect x="2" y="2" width="10" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7 4.5v5M4.5 7h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        }
        etiqueta="Añadir a pantalla de inicio"
      />
    );
  }
  if (i === 0) return <VistaChrome />;
  if (i === 1) {
    return (
      <VistaTocar>
        <span className="flex h-9 w-9 flex-col items-center justify-center gap-[3px] rounded-full bg-marca-navy">
          <span className="h-[3px] w-[3px] rounded-full bg-white" />
          <span className="h-[3px] w-[3px] rounded-full bg-white" />
          <span className="h-[3px] w-[3px] rounded-full bg-white" />
        </span>
      </VistaTocar>
    );
  }
  return (
    <VistaFila
      icono={
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <rect x="2.5" y="1.5" width="9" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 5.2v4M5 7.2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      }
      etiqueta="Instalar app"
    />
  );
}

const PRESS =
  "touch-manipulation select-none active:scale-[0.97] transition-transform duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]";

function capituloDePaso(paso: number) {
  return CAPITULOS.find((c) => c.pasos.includes(paso as 0 | 1 | 2 | 3 | 4 | 5 | 6)) ?? CAPITULOS[0];
}

export default function ComoTrabajamos() {
  const pista = useRef<HTMLElement>(null);
  const [paso, setPaso] = useState(0);
  const [plataforma, setPlataforma] = useState<"iphone" | "android">("iphone");
  const actual = PASOS[paso];
  const capitulo = capituloDePaso(paso);
  const capIndex = CAPITULOS.findIndex((c) => c.id === capitulo.id);

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const cinema = window.matchMedia("(min-width: 1024px)");
    let raf = 0;
    const esCinema = () => window.innerWidth >= 1024;
    const leer = () => {
      if (!esCinema()) return;
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total);
      const i = Math.min(6, Math.floor((scrolled / total) * 7));
      setPaso((prev) => (prev === i ? prev : i));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(leer);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    cinema.addEventListener("change", leer);
    leer();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cinema.removeEventListener("change", leer);
      cancelAnimationFrame(raf);
    };
  }, []);

  const irAPaso = (i: number) => {
    const el = pista.current;
    if (!el) return;
    const cinema = window.innerWidth >= 1024;
    const total = el.offsetHeight - window.innerHeight;
    if (!cinema || total <= 0) {
      setPaso(i);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY + ((i + 0.35) / 7) * total;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="proceso-page text-[#0f1d2e]">
      <section
        ref={pista}
        id="flujo"
        className="proceso-track relative"
        aria-label="El mes en Declaraciones"
      >
        <div className="proceso-frame proceso-stage flex flex-col text-[#0f1d2e]">
          <div className="proceso-stage-clip mx-auto flex h-full w-full max-w-6xl flex-col px-5 sm:px-8">
            <p className="proceso-kicker pt-3 text-center text-slate-400 sm:pt-4">
              Tu app · Declaraciones · {capitulo.etiqueta} / 04
            </p>

            <nav aria-label="Capítulos del mes" className="mt-2 flex justify-center">
              <div className="proceso-caps rounded-full bg-white/90 p-1 shadow-[0_8px_28px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.05] backdrop-blur-md">
                <PillDeslizable
                  acento="claro"
                  size="sm"
                  compact
                  className="[&_.rdc-ios-pill-claro]:bg-[#e5e5ea]"
                  opciones={CAPITULOS.map((c) => ({ value: c.id, label: c.nombre }))}
                  value={capitulo.id}
                  onChange={(id) => {
                    const c = CAPITULOS.find((x) => x.id === id);
                    if (c) irAPaso(c.pasos[0]);
                  }}
                />
              </div>
            </nav>

            <div className="mt-3 grid min-h-0 flex-1 items-start gap-6 pt-1 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-5">
              <div className="flex min-h-0 min-w-0 flex-col self-stretch">
                <div className="hidden min-h-0 flex-[0.75] lg:block" aria-hidden />
                <div key={capitulo.id} className="proceso-copy min-w-0">
                  <h1 className="max-w-[14ch] text-balance text-[clamp(30px,4.6vw,56px)] font-black leading-[1.08] tracking-tight">
                    {capitulo.titulo}
                  </h1>
                  <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-slate-600 sm:text-base">
                    {capitulo.cuerpo}
                  </p>
                  <p className="mt-4 max-w-[44ch] text-[14px] leading-relaxed text-slate-700">
                    {actual.ves}
                  </p>
                  <dl className="mt-6 grid max-w-[46ch] gap-3 text-sm leading-relaxed sm:grid-cols-2">
                    <div>
                      <dt className="proceso-kicker mb-1.5 text-[10px] text-slate-400">Tú</dt>
                      <dd className="text-slate-700">{actual.tuParte}</dd>
                    </div>
                    <div>
                      <dt className="proceso-kicker mb-1.5 text-[10px] text-slate-400">RDC</dt>
                      <dd className="text-slate-700">{actual.nosotros}</dd>
                    </div>
                  </dl>
                  {capIndex === 1 ? (
                    <ul className="mt-6 max-w-[42ch] space-y-1.5 border-t border-slate-200 pt-4">
                      <li className="proceso-kicker mb-2 text-[10px] text-slate-400">Actividad reciente</li>
                      {AVISOS.map((n) => (
                        <li key={n.titulo} className="flex justify-between gap-4 text-sm text-slate-600">
                          <span className="font-bold text-slate-900">{n.titulo}</span>
                          <span className="shrink-0 text-slate-400">{n.tiempo}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="hidden min-h-0 flex-1 lg:block" aria-hidden />
                <div className="proceso-pila">
                  <div className="proceso-pila-track">
                    <span
                      className="proceso-progress"
                      style={{ transform: `scaleX(${(paso + 1) / 7})` }}
                    />
                  </div>
                  <div className="proceso-pila-nav">
                    <ol className="proceso-pila-pasos">
                      {PASOS.map((p, i) => {
                        const on = i === paso;
                        const hecho = i < paso;
                        return (
                          <li key={p.titulo}>
                            <button
                              type="button"
                              onClick={() => irAPaso(i)}
                              aria-current={on ? "step" : undefined}
                              aria-label={p.titulo}
                              className={`${PRESS} proceso-pila-dot ${on ? "is-on" : ""} ${hecho ? "is-done" : ""}`}
                            />
                          </li>
                        );
                      })}
                    </ol>
                    <p
                      className="proceso-pila-label"
                      style={{
                        left: `${(paso / 6) * 100}%`,
                        transform:
                          paso === 0
                            ? "none"
                            : paso === 6
                              ? "translateX(-100%)"
                              : "translateX(-50%)",
                      }}
                    >
                      {actual.titulo}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center self-end lg:justify-end">
                <div className="proceso-mano">
                  <div className="proceso-mano-screen">
                    <div className="proceso-mano-ui">
                      <ProcesoPortalMockup paso={paso + 1} enFoto />
                    </div>
                  </div>
                  <img
                    src="/proceso/iphone-15-pro.png"
                    alt=""
                    width={474}
                    height={586}
                    className="proceso-mano-foto pointer-events-none select-none"
                  />
                </div>
              </div>
            </div>

            <p className="proceso-kicker mt-4 hidden pb-5 text-slate-400 sm:block lg:hidden">
              Baja para ver el mes
            </p>
          </div>
        </div>
      </section>

      <section id="app" className="proceso-alpine scroll-mt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
          <div className="order-2 lg:order-1">
            <p className="proceso-kicker text-marca-navy">Mini tutorial</p>
            <h2 className="mt-3 max-w-[14ch] text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              No se descarga de una tienda.
            </h2>
            <p className="mt-4 max-w-[46ch] leading-relaxed text-slate-600">
              Es tu portal, instalado en la pantalla de inicio. Cuando eres cliente te damos
              usuario. Entras una vez por Safari o Chrome y la dejas como cualquier app.
            </p>
            <Link
              href="/portal/login"
              className={`mt-8 inline-flex items-center gap-2 rounded-xl bg-marca-navy px-5 py-3 text-sm font-bold text-white hover:bg-marca-navy-soft ${PRESS}`}
            >
              Ya soy cliente · entrar
            </Link>
          </div>

          <div className="proceso-tutorial order-1 lg:order-2">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b border-[#0f1d2e]/10">
              <p className="proceso-kicker pb-3 text-marca-navy">3 pasos</p>
              <div className="flex gap-5">
                {(["iphone", "android"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlataforma(p)}
                    aria-pressed={plataforma === p}
                    className={`${PRESS} relative shrink-0 pb-3 text-sm font-bold ${
                      plataforma === p ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {p === "iphone" ? "iPhone" : "Android"}
                    {plataforma === p ? (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#06b6d4]" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
            <ol className="mt-5 space-y-3">
              {INSTALAR[plataforma].map((pasoInstalar, i) => (
                <li key={pasoInstalar} className="proceso-paso">
                  {uiDePaso(plataforma, i)}
                  <span className="proceso-paso-num">{i + 1}</span>
                  <span className="min-w-0 pt-0.5 text-sm leading-snug text-pretty text-slate-800">
                    {pasoInstalar}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-5 border-t border-[#0f1d2e]/10 pt-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Así queda
              </p>
              <VistaHome />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              En la computadora, el navegador muestra un ícono de instalar en la barra de
              direcciones. Es el mismo portal.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
