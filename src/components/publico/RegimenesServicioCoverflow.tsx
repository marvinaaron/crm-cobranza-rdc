"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import RegimenIcon from "@/components/publico/RegimenIcon";
import PillDeslizable from "@/components/ui/PillDeslizable";
import {
  ESPECIALIDADES_PAGINA,
  ESPECIALIDADES_SERVICIO,
  SLUGS_ESPECIALIDAD,
  type EspecialidadServicio,
  type EspecialidadSlug,
} from "@/lib/servicios-especialidades";
import {
  REGIMENES_SERVICIO,
  SLUGS_REGIMEN_PF,
  SLUGS_REGIMEN_PM,
  type RegimenServicio,
  type RegimenSlug,
} from "@/lib/servicios-regimenes";

type TabServicios = "pf" | "pm" | "otras";

const PILL_OPCIONES: { value: TabServicios; label: string }[] = [
  { value: "pf", label: "Personas físicas" },
  { value: "pm", label: "Personas morales" },
  { value: "otras", label: "Otras especialidades" },
];

const TAB_HASH: Record<TabServicios, string> = {
  pf: "#personas-fisicas",
  pm: "#personas-morales",
  otras: "#otras-especialidades",
};

function hashToTab(hash: string): TabServicios {
  if (hash === "#personas-morales") return "pm";
  if (hash === "#otras-especialidades") return "otras";
  return "pf";
}

type CardTheme = {
  activeGlass: string;
  glow: string;
  ring: string;
  title: string;
};

const THEMES: Record<RegimenSlug, CardTheme> = {
  "sueldos-salarios": {
    activeGlass: "bg-gradient-to-br from-slate-300/35 via-slate-200/25 to-white/40",
    glow: "from-slate-400/45 via-slate-300/35 to-slate-200/20",
    ring: "ring-slate-300/50",
    title: "text-slate-900",
  },
  resico: {
    activeGlass: "bg-gradient-to-br from-violet-300/35 via-indigo-200/25 to-white/40",
    glow: "from-violet-400/50 via-indigo-300/40 to-purple-200/20",
    ring: "ring-violet-300/50",
    title: "text-violet-950",
  },
  "actividades-empresariales": {
    activeGlass: "bg-gradient-to-br from-cyan-300/35 via-sky-200/25 to-white/40",
    glow: "from-cyan-400/50 via-sky-300/40 to-teal-200/20",
    ring: "ring-cyan-300/50",
    title: "text-cyan-950",
  },
  arrendamiento: {
    activeGlass: "bg-gradient-to-br from-amber-300/35 via-orange-200/25 to-white/40",
    glow: "from-amber-400/50 via-orange-300/40 to-yellow-200/20",
    ring: "ring-amber-300/50",
    title: "text-amber-950",
  },
  "plataformas-tecnologicas": {
    activeGlass: "bg-gradient-to-br from-emerald-300/35 via-green-200/25 to-white/40",
    glow: "from-emerald-400/50 via-green-300/40 to-lime-200/20",
    ring: "ring-emerald-300/50",
    title: "text-emerald-950",
  },
  rif: {
    activeGlass: "bg-gradient-to-br from-stone-300/35 via-zinc-200/25 to-white/40",
    glow: "from-stone-400/45 via-zinc-300/35 to-slate-200/20",
    ring: "ring-stone-300/50",
    title: "text-stone-900",
  },
  "regimen-general": {
    activeGlass: "bg-gradient-to-br from-indigo-300/35 via-blue-200/25 to-white/40",
    glow: "from-indigo-400/50 via-blue-300/40 to-slate-200/20",
    ring: "ring-indigo-300/50",
    title: "text-indigo-950",
  },
  "fines-no-lucrativos": {
    activeGlass: "bg-gradient-to-br from-rose-300/35 via-pink-200/25 to-white/40",
    glow: "from-rose-400/50 via-pink-300/40 to-rose-200/20",
    ring: "ring-rose-300/50",
    title: "text-rose-950",
  },
};

const ESPECIALIDAD_THEMES: Record<EspecialidadSlug, CardTheme> = {
  repse: {
    activeGlass: "bg-gradient-to-br from-amber-300/35 via-orange-200/25 to-white/40",
    glow: "from-amber-400/50 via-orange-300/40 to-yellow-200/20",
    ring: "ring-amber-300/50",
    title: "text-amber-950",
  },
  icsoe: {
    activeGlass: "bg-gradient-to-br from-emerald-300/35 via-green-200/25 to-white/40",
    glow: "from-emerald-400/50 via-green-300/40 to-lime-200/20",
    ring: "ring-emerald-300/50",
    title: "text-emerald-950",
  },
  sisub: {
    activeGlass: "bg-gradient-to-br from-rose-300/35 via-red-200/25 to-white/40",
    glow: "from-rose-400/50 via-red-300/40 to-rose-200/20",
    ring: "ring-rose-300/50",
    title: "text-rose-950",
  },
};

const CARD_SPACING = 210;
const CARD_SPACING_REDUCED = 175;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function wrappedOffset(cardIndex: number, activeIndex: number, total: number): number {
  let offset = cardIndex - activeIndex;
  const half = total / 2;
  if (offset > half) offset -= total;
  if (offset < -half) offset += total;
  return offset;
}

function coverflowStyle(offset: number, reduced: boolean): React.CSSProperties {
  const abs = Math.abs(offset);
  const spacing = reduced ? CARD_SPACING_REDUCED : CARD_SPACING;
  const x = offset * spacing;
  const rotateY = offset * -38;
  const scale = offset === 0 ? 1 : abs === 1 ? 0.86 : 0.72;
  const translateZ = offset === 0 ? 0 : -abs * 55;
  const zIndex = 30 - abs * 8;
  const visible = abs <= 2;

  return {
    transform: reduced
      ? `translate3d(calc(-50% + ${x}px), -50%, 0) scale(${offset === 0 ? 1 : 0.88})`
      : `translate3d(calc(-50% + ${x}px), -50%, ${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
    zIndex,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? "auto" : "none",
    transition: reduced
      ? "transform 0.25s ease"
      : "transform 0.65s cubic-bezier(0.22, 0.61, 0.36, 1)",
  };
}

function EspecialidadIcon({ slug, className }: { slug: EspecialidadSlug; className: string }) {
  const props = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.75,
    className,
    "aria-hidden": true as const,
  };

  if (slug === "repse") {
    return (
      <svg {...props}>
        <rect x="3" y="8" width="18" height="12" rx="1.5" />
        <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M9 14h6M9 17h4" />
      </svg>
    );
  }
  if (slug === "icsoe") {
    return (
      <svg {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function EspecialidadCard({
  especialidad,
  theme,
}: {
  especialidad: EspecialidadServicio;
  theme: CardTheme;
}) {
  const pagina = ESPECIALIDADES_PAGINA[especialidad.slug];

  return (
    <Link
      href={`/servicios/${especialidad.slug}`}
      className="group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-white/90 text-center shadow-lg ring-1 ring-white/70 transition-shadow hover:shadow-xl sm:min-h-[320px]"
    >
      <div aria-hidden className="absolute inset-0 bg-white" />
      <div aria-hidden className={`absolute inset-0 ${theme.activeGlass}`} />
      <div className="relative z-10 flex h-full flex-col p-6 sm:p-7">
        <div className="mb-4 flex justify-center">
          <div className="relative flex items-center justify-center">
            <div
              aria-hidden
              className={`absolute h-16 w-16 rounded-full bg-gradient-to-br ${theme.glow} blur-xl scale-125 opacity-80`}
            />
            <span
              className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-white ring-2 ${theme.ring} shadow-sm`}
            >
              <EspecialidadIcon slug={especialidad.slug} className={especialidad.iconColor} />
            </span>
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          {pagina.autoridadCorto}
        </p>
        <h3 className={`mt-2 text-xl font-black sm:text-2xl ${theme.title}`}>{especialidad.titulo}</h3>
        <p className="mt-1 text-xs font-semibold text-slate-500">{especialidad.subtitulo}</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3">
          {especialidad.resumen}
        </p>
        <span className="mt-4 inline-flex items-center justify-center gap-1 text-sm font-bold text-slate-800 group-hover:gap-2 transition-all">
          Ver guía completa
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

function RegimenCard({ regimen, theme }: { regimen: RegimenServicio; theme: CardTheme }) {
  const badge = regimen.badge.split("·")[0]?.trim() ?? regimen.badge;

  return (
    <Link
      href={`/servicios/${regimen.slug}`}
      className="group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-white/90 text-center shadow-lg ring-1 ring-white/70 transition-shadow hover:shadow-xl sm:min-h-[320px]"
    >
      <div aria-hidden className="absolute inset-0 bg-white" />
      <div aria-hidden className={`absolute inset-0 ${theme.activeGlass}`} />
      <div className="relative z-10 flex h-full flex-col p-6 sm:p-7">
        <div className="mb-4 flex justify-center">
          <div className="relative flex items-center justify-center">
            <div aria-hidden className={`absolute h-16 w-16 rounded-full bg-gradient-to-br ${theme.glow} blur-xl scale-125 opacity-80`} />
            <span className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-white ring-2 ${theme.ring} shadow-sm`}>
              <RegimenIcon slug={regimen.slug} size={28} className={regimen.iconColor} />
            </span>
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          SAT {regimen.codigoSat} · {badge}
        </p>
        <h3 className={`mt-2 text-xl font-black sm:text-2xl ${theme.title}`}>{regimen.titulo}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-4">{regimen.subtitulo}</p>
        <span className="mt-4 inline-flex items-center justify-center gap-1 text-sm font-bold text-slate-800 group-hover:gap-2 transition-all">
          Ver detalle
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

function CoverflowEspecialidades() {
  const items = SLUGS_ESPECIALIDAD.map((slug) => ESPECIALIDADES_SERVICIO[slug]);
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  const touchStart = useRef<number | null>(null);

  const goPrev = useCallback(() => {
    setActive((i) => mod(i - 1, items.length));
  }, [items.length]);

  const goNext = useCallback(() => {
    setActive((i) => mod(i + 1, items.length));
  }, [items.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 48) {
      if (delta > 0) goPrev();
      else goNext();
    }
    touchStart.current = null;
  };

  return (
    <div className="relative mx-auto max-w-4xl" aria-label="Otras especialidades">
      <button
        type="button"
        onClick={goPrev}
        aria-label="Especialidad anterior"
        className="absolute left-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md ring-1 ring-slate-200/80 backdrop-blur-md transition hover:bg-white hover:text-indigo-600 sm:-left-2 sm:h-11 sm:w-11"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Siguiente especialidad"
        className="absolute right-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md ring-1 ring-slate-200/80 backdrop-blur-md transition hover:bg-white hover:text-indigo-600 sm:-right-2 sm:h-11 sm:w-11"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div
        className="relative mx-auto h-[360px] max-w-full overflow-x-clip overflow-y-visible px-10 sm:h-[380px] sm:px-14"
        style={{ perspective: reduced ? undefined : "1200px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          {items.map((especialidad, i) => {
            const offset = wrappedOffset(i, active, items.length);
            const isCenter = offset === 0;
            const theme = ESPECIALIDAD_THEMES[especialidad.slug];

            return (
              <article
                key={especialidad.slug}
                className="absolute left-1/2 top-1/2 w-[270px] will-change-transform sm:w-[300px]"
                style={{
                  ...coverflowStyle(offset, reduced),
                  transformOrigin: "center center",
                }}
                aria-hidden={!isCenter}
              >
                <EspecialidadCard especialidad={especialidad} theme={theme} />
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {items.map((e, i) => (
          <button
            key={e.slug}
            type="button"
            aria-label={`Ver ${e.titulo}`}
            aria-current={i === active ? "true" : undefined}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-indigo-600" : "w-1.5 bg-slate-300 hover:bg-indigo-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CoverflowRegimenes({ slugs, ariaLabel }: { slugs: readonly RegimenSlug[]; ariaLabel: string }) {
  const items = slugs.map((slug) => REGIMENES_SERVICIO[slug]);
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  const touchStart = useRef<number | null>(null);

  const goPrev = useCallback(() => {
    setActive((i) => mod(i - 1, items.length));
  }, [items.length]);

  const goNext = useCallback(() => {
    setActive((i) => mod(i + 1, items.length));
  }, [items.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 48) {
      if (delta > 0) goPrev();
      else goNext();
    }
    touchStart.current = null;
  };

  return (
    <div className="relative mx-auto max-w-4xl" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={goPrev}
        aria-label="Régimen anterior"
        className="absolute left-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md ring-1 ring-slate-200/80 backdrop-blur-md transition hover:bg-white hover:text-indigo-600 sm:-left-2 sm:h-11 sm:w-11"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Siguiente régimen"
        className="absolute right-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-md ring-1 ring-slate-200/80 backdrop-blur-md transition hover:bg-white hover:text-indigo-600 sm:-right-2 sm:h-11 sm:w-11"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div
        className="relative mx-auto h-[320px] max-w-full overflow-x-clip overflow-y-visible px-10 sm:h-[340px] sm:px-14"
        style={{ perspective: reduced ? undefined : "1200px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          {items.map((regimen, i) => {
            const offset = wrappedOffset(i, active, items.length);
            const isCenter = offset === 0;
            const theme = THEMES[regimen.slug];

            return (
              <article
                key={regimen.slug}
                className="absolute left-1/2 top-1/2 w-[270px] will-change-transform sm:w-[300px]"
                style={{
                  ...coverflowStyle(offset, reduced),
                  transformOrigin: "center center",
                }}
                aria-hidden={!isCenter}
              >
                <RegimenCard regimen={regimen} theme={theme} />
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {items.map((r, i) => (
          <button
            key={r.slug}
            type="button"
            aria-label={`Ver ${r.titulo}`}
            aria-current={i === active ? "true" : undefined}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-indigo-600" : "w-1.5 bg-slate-300 hover:bg-indigo-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function RegimenesServicioCoverflow() {
  const [tab, setTab] = useState<TabServicios>("pf");

  useEffect(() => {
    const sync = () => setTab(hashToTab(window.location.hash));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const onTabChange = useCallback((next: TabServicios) => {
    setTab(next);
    const hash = TAB_HASH[next];
    window.history.replaceState(null, "", `/servicios${hash}`);
    document.getElementById("regimenes-servicio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const descripcion =
    tab === "pf"
      ? "Seis regímenes del SAT para persona física. Elige el tuyo y conoce obligaciones, peculiaridades y cómo te acompañamos."
      : tab === "pm"
        ? "Régimen general y fines no lucrativos para personas morales: obligaciones, marco legal y acompañamiento mensual."
        : "REPSE, ICSOE y SISUB para empresas que subcontratan personal u obras especializadas. Cumplimiento ante STPS e IMSS.";

  return (
    <section
      id="regimenes-servicio"
      className="relative scroll-mt-24 overflow-hidden py-14 sm:py-16"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-50" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy">
            Por régimen y especialidad
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">
            ¿Qué hacemos en tu caso?
          </h2>
          <p className="mt-3 text-sm text-slate-600 max-w-2xl mx-auto">{descripcion}</p>
        </div>

        <div className="mb-8 flex justify-center px-2">
          <PillDeslizable
            opciones={PILL_OPCIONES}
            value={tab}
            onChange={onTabChange}
            compact
          />
        </div>

        <div id={tab === "otras" ? "otras-especialidades" : undefined}>
          {tab === "pf" ? (
            <CoverflowRegimenes slugs={SLUGS_REGIMEN_PF} ariaLabel="Regímenes persona física" />
          ) : null}
          {tab === "pm" ? (
            <CoverflowRegimenes slugs={SLUGS_REGIMEN_PM} ariaLabel="Regímenes persona moral" />
          ) : null}
          {tab === "otras" ? <CoverflowEspecialidades /> : null}
        </div>
      </div>
    </section>
  );
}
