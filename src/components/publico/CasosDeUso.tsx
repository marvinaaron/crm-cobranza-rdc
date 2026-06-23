"use client";

/**
 * Sección "Para quién trabajamos": carrusel Cover Flow con loop infinito
 * visual, cards glass de colores tenues y emoji circular con brillo.
 */

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type CardTheme = {
  activeGlass: string;
  sideGlass: string;
  glow: string;
  ring: string;
  shadow: string;
  title: string;
};

type Caso = {
  titulo: string;
  descripcion: string;
  emoji: string;
  theme: CardTheme;
};

const CASOS: Caso[] = [
  {
    titulo: "Transportistas",
    descripcion:
      "Acreditamos el IEPS de tu diésel, controlamos comprobantes de combustible y casetas, y dejamos al día tus complementos Carta Porte.",
    emoji: "🚛",
    theme: {
      activeGlass: "bg-gradient-to-br from-orange-300/35 via-amber-200/25 to-white/40",
      sideGlass: "bg-gradient-to-br from-orange-200/20 to-white/30",
      glow: "from-orange-400/50 via-amber-300/40 to-orange-200/20",
      ring: "ring-orange-300/50",
      shadow: "shadow-orange-300/25",
      title: "text-orange-950",
    },
  },
  {
    titulo: "Dentistas",
    descripcion:
      "Facturación a pacientes con CFDI de servicios médicos, RESICO PF con honorarios y declaración anual con deducciones personales.",
    emoji: "🦷",
    theme: {
      activeGlass: "bg-gradient-to-br from-cyan-300/35 via-sky-200/25 to-white/40",
      sideGlass: "bg-gradient-to-br from-cyan-200/20 to-white/30",
      glow: "from-cyan-400/50 via-sky-300/40 to-teal-200/20",
      ring: "ring-cyan-300/50",
      shadow: "shadow-cyan-300/25",
      title: "text-cyan-950",
    },
  },
  {
    titulo: "Contratistas",
    descripcion:
      "Padrón REPSE vigente, presentación de informes ICSOE y SISUB ante IMSS e Infonavit. Somos de los pocos despachos que lo hacemos mes con mes.",
    emoji: "🏗️",
    theme: {
      activeGlass: "bg-gradient-to-br from-slate-400/30 via-blue-200/25 to-white/40",
      sideGlass: "bg-gradient-to-br from-slate-300/20 to-white/30",
      glow: "from-slate-400/45 via-blue-300/35 to-indigo-200/20",
      ring: "ring-slate-400/45",
      shadow: "shadow-slate-400/25",
      title: "text-slate-900",
    },
  },
  {
    titulo: "Sector automotriz",
    descripcion:
      "Agencias, talleres y refaccionarias. Manejo fiscal de unidades nuevas y usadas, control de inventario, garantías y clientes flotilleros.",
    emoji: "🚗",
    theme: {
      activeGlass: "bg-gradient-to-br from-rose-300/35 via-red-200/20 to-white/40",
      sideGlass: "bg-gradient-to-br from-rose-200/20 to-white/30",
      glow: "from-rose-400/50 via-red-300/35 to-pink-200/20",
      ring: "ring-rose-300/50",
      shadow: "shadow-rose-300/25",
      title: "text-rose-950",
    },
  },
  {
    titulo: "Honorarios",
    descripcion:
      "Freelancers, consultores y profesionistas independientes. Optimización de retenciones, RESICO PF cuando conviene y saldo a favor maximizado.",
    emoji: "💼",
    theme: {
      activeGlass: "bg-gradient-to-br from-indigo-300/35 via-violet-200/25 to-white/40",
      sideGlass: "bg-gradient-to-br from-indigo-200/20 to-white/30",
      glow: "from-indigo-400/50 via-violet-300/40 to-purple-200/20",
      ring: "ring-indigo-300/50",
      shadow: "shadow-indigo-300/30",
      title: "text-indigo-950",
    },
  },
  {
    titulo: "Escuelas y colegios",
    descripcion:
      "Instituciones con autorización SEP. CFDI de colegiaturas deducible para padres, nómina docente con prestaciones e IMSS, Infonavit e ISN al día.",
    emoji: "🏫",
    theme: {
      activeGlass: "bg-gradient-to-br from-emerald-300/35 via-green-200/25 to-white/40",
      sideGlass: "bg-gradient-to-br from-emerald-200/20 to-white/30",
      glow: "from-emerald-400/50 via-green-300/40 to-lime-200/20",
      ring: "ring-emerald-300/50",
      shadow: "shadow-emerald-300/25",
      title: "text-emerald-950",
    },
  },
  {
    titulo: "Fotógrafos",
    descripcion:
      "Estudios y fotógrafos independientes. Manejo de equipo deducible, retención de honorarios y facturación a empresas o particulares con CFDI 4.0.",
    emoji: "📷",
    theme: {
      activeGlass: "bg-gradient-to-br from-fuchsia-300/35 via-purple-200/25 to-white/40",
      sideGlass: "bg-gradient-to-br from-fuchsia-200/20 to-white/30",
      glow: "from-fuchsia-400/50 via-purple-300/40 to-violet-200/20",
      ring: "ring-fuchsia-300/50",
      shadow: "shadow-fuchsia-300/25",
      title: "text-fuchsia-950",
    },
  },
  {
    titulo: "Ingenieros en proyectos",
    descripcion:
      "Consultoría y proyectos por etapas. Facturación parcial por avance de obra, retenciones y comprobantes de gastos de viaje y viáticos.",
    emoji: "⚙️",
    theme: {
      activeGlass: "bg-gradient-to-br from-sky-300/35 via-blue-200/25 to-white/40",
      sideGlass: "bg-gradient-to-br from-sky-200/20 to-white/30",
      glow: "from-sky-400/50 via-blue-300/40 to-indigo-200/20",
      ring: "ring-sky-300/50",
      shadow: "shadow-sky-300/25",
      title: "text-sky-950",
    },
  },
];

const VISIBLE_OFFSETS = [-2, -1, 0, 1, 2] as const;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function coverflowStyle(offset: number, reduced: boolean): React.CSSProperties {
  const abs = Math.abs(offset);
  const spacing = reduced ? 160 : 190;
  const x = offset * spacing;
  const rotateY = offset * -34;
  const scale = offset === 0 ? 1 : abs === 1 ? 0.86 : 0.72;
  const zIndex = 20 - abs * 5;
  const opacity = offset === 0 ? 1 : abs === 1 ? 0.88 : 0.62;

  return {
    transform: reduced
      ? `translate(calc(-50% + ${x}px), -50%) scale(${offset === 0 ? 1 : 0.88})`
      : `translate(calc(-50% + ${x}px), -50%) scale(${scale}) rotateY(${rotateY}deg)`,
    zIndex,
    opacity,
    transition: "transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.4s ease",
  };
}

function EmojiGlow({ emoji, theme, active }: { emoji: string; theme: CardTheme; active: boolean }) {
  return (
    <div className="mb-5 flex justify-center">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className={`absolute h-16 w-16 rounded-full bg-gradient-to-br ${theme.glow} blur-xl transition-opacity duration-500 ${
            active ? "opacity-90 scale-125" : "opacity-50 scale-100"
          }`}
        />
        <div
          aria-hidden
          className={`absolute h-14 w-14 rounded-full bg-gradient-to-br ${theme.glow} blur-md transition-opacity duration-500 ${
            active ? "opacity-70" : "opacity-40"
          }`}
        />
        <span
          className={`relative flex h-14 w-14 items-center justify-center rounded-full text-2xl backdrop-blur-md bg-white/35 ring-2 transition-all duration-500 ${theme.ring} ${
            active ? "scale-110 shadow-lg" : "scale-95"
          }`}
        >
          {emoji}
        </span>
      </div>
    </div>
  );
}

function CasoCard({ caso, active }: { caso: Caso; active: boolean }) {
  const { theme } = caso;

  return (
    <div
      className={`flex h-full flex-col rounded-2xl p-6 text-center backdrop-blur-2xl transition-all duration-500 sm:p-7 ${
        active
          ? `${theme.activeGlass} border border-white/70 shadow-2xl ${theme.shadow} ring-1 ring-white/50`
          : `${theme.sideGlass} border border-white/45 shadow-lg shadow-slate-300/15 ring-1 ring-white/30`
      }`}
    >
      <EmojiGlow emoji={caso.emoji} theme={theme} active={active} />
      <h3
        className={`mb-2 font-bold transition-all duration-300 ${
          active ? `text-lg ${theme.title}` : "text-base text-slate-700"
        }`}
      >
        {caso.titulo}
      </h3>
      <p
        className={`flex-1 text-sm leading-relaxed transition-colors duration-300 ${
          active ? "text-slate-700" : "text-slate-500 line-clamp-4"
        }`}
      >
        {caso.descripcion}
      </p>
    </div>
  );
}

function CoverflowCarousel() {
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  const touchStart = useRef<number | null>(null);

  const goPrev = useCallback(() => {
    setActive((i) => mod(i - 1, CASOS.length));
  }, []);

  const goNext = useCallback(() => {
    setActive((i) => mod(i + 1, CASOS.length));
  }, []);

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
    <div className="relative mx-auto max-w-4xl">
      <button
        type="button"
        onClick={goPrev}
        aria-label="Perfil anterior"
        className="absolute left-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-md ring-1 ring-white/80 backdrop-blur-md transition hover:bg-white hover:text-indigo-600 sm:-left-2 sm:h-11 sm:w-11"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Siguiente perfil"
        className="absolute right-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-md ring-1 ring-white/80 backdrop-blur-md transition hover:bg-white hover:text-indigo-600 sm:-right-2 sm:h-11 sm:w-11"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div
        className="relative mx-auto h-[300px] max-w-full overflow-hidden px-10 sm:h-[320px] sm:px-14"
        style={{ perspective: reduced ? undefined : "1400px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          {VISIBLE_OFFSETS.map((offset) => {
            const index = mod(active + offset, CASOS.length);
            const caso = CASOS[index];

            return (
              <article
                key={`slot-${offset}`}
                className="absolute left-1/2 top-1/2 w-[260px] sm:w-[300px]"
                style={{
                  ...coverflowStyle(offset, reduced),
                  transformOrigin: "center center",
                }}
                aria-hidden={offset !== 0}
              >
                <CasoCard caso={caso} active={offset === 0} />
                {offset === 0 && !reduced && (
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -bottom-8 left-2 right-2 h-10 rounded-2xl opacity-30 blur-sm bg-gradient-to-b ${caso.theme.glow}`}
                    style={{ transform: "scaleY(-1)" }}
                  />
                )}
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {CASOS.map((c, i) => (
          <button
            key={c.titulo}
            type="button"
            aria-label={`Ver ${c.titulo}`}
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

export default function CasosDeUso() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-indigo-50/50 to-white" />
      <div aria-hidden className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Para quién trabajamos
          </p>
          <h2 className="mb-3 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
            Llevamos la contabilidad de{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              negocios
            </span>{" "}
            como el tuyo
          </h2>
          <p className="mx-auto max-w-xl text-sm text-slate-500">
            Cada giro tiene sus particularidades fiscales. Desliza o usa las flechas para ver los
            perfiles que atendemos a diario.
          </p>
        </div>

        <CoverflowCarousel />

        <p className="mt-8 text-center text-xs text-slate-400">
          ¿No te ves en la lista? También trabajamos contigo —{" "}
          <Link href="/contacto" className="text-indigo-600 hover:underline">
            cuéntanos tu caso
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
