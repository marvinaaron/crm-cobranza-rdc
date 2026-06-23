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
    titulo: "Chofer de plataforma",
    descripcion:
      "Uber, DiDi e InDrive. RESICO PF, control de ingresos por app, deducciones de combustible y mantenimiento, y declaraciones sin sorpresas.",
    emoji: "🚕",
    theme: {
      activeGlass: "bg-gradient-to-br from-yellow-300/35 via-amber-200/25 to-white/40",
      sideGlass: "bg-gradient-to-br from-yellow-200/20 to-white/30",
      glow: "from-yellow-400/50 via-amber-300/40 to-orange-200/20",
      ring: "ring-yellow-400/50",
      shadow: "shadow-yellow-300/25",
      title: "text-amber-950",
    },
  },
  {
    titulo: "Repartidores",
    descripcion:
      "Rappi, Uber Eats y reparto propio. Ingresos por entregas, RESICO cuando conviene, comprobación de gastos de moto o bici y cumplimiento mensual.",
    emoji: "🛵",
    theme: {
      activeGlass: "bg-gradient-to-br from-lime-300/35 via-green-200/25 to-white/40",
      sideGlass: "bg-gradient-to-br from-lime-200/20 to-white/30",
      glow: "from-lime-400/50 via-green-300/40 to-emerald-200/20",
      ring: "ring-lime-400/50",
      shadow: "shadow-lime-300/25",
      title: "text-lime-950",
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
    titulo: "Vendedor online",
    descripcion:
      "Amazon, Mercado Libre y tiendas propias. RESICO o régimen general según tu facturación, control de comisiones de plataforma, IVA e inventario simplificado.",
    emoji: "🛒",
    theme: {
      activeGlass: "bg-gradient-to-br from-teal-300/35 via-cyan-200/25 to-white/40",
      sideGlass: "bg-gradient-to-br from-teal-200/20 to-white/30",
      glow: "from-teal-400/50 via-cyan-300/40 to-sky-200/20",
      ring: "ring-teal-300/50",
      shadow: "shadow-teal-300/25",
      title: "text-teal-950",
    },
  },
  {
    titulo: "Maestros",
    descripcion:
      "Docentes por honorarios o clases particulares. RESICO PF, facturación a colegios o familias, retenciones de ISR y declaración anual con deducciones personales.",
    emoji: "👩‍🏫",
    theme: {
      activeGlass: "bg-gradient-to-br from-violet-300/35 via-purple-200/25 to-white/40",
      sideGlass: "bg-gradient-to-br from-violet-200/20 to-white/30",
      glow: "from-violet-400/50 via-purple-300/40 to-fuchsia-200/20",
      ring: "ring-violet-300/50",
      shadow: "shadow-violet-300/25",
      title: "text-violet-950",
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
    titulo: "Ingenieros",
    descripcion:
      "Personas físicas y morales en consultoría, construcción e industria. Facturación de servicios, retenciones, control de gastos deducibles y cumplimiento mensual.",
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

const CARD_SPACING = 190;
const CARD_SPACING_REDUCED = 160;
const MAX_VISIBLE_OFFSET = 2;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

/** Offset circular: la tarjeta más cercana por la izquierda/derecha sin saltos bruscos. */
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
  const scale = offset === 0 ? 1 : abs === 1 ? 0.86 : abs === 2 ? 0.72 : 0.6;
  const translateZ = offset === 0 ? 0 : -abs * 55;
  const zIndex = 30 - abs * 8;
  const visible = abs <= MAX_VISIBLE_OFFSET;

  return {
    transform: reduced
      ? `translate3d(calc(-50% + ${x}px), -50%, 0) scale(${offset === 0 ? 1 : 0.88})`
      : `translate3d(calc(-50% + ${x}px), -50%, ${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
    zIndex,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? "auto" : "none",
    transition: reduced
      ? "transform 0.25s ease, opacity 0.2s ease"
      : "transform 0.65s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.35s ease",
  };
}

function EmojiGlow({ emoji, theme, prominent }: { emoji: string; theme: CardTheme; prominent: boolean }) {
  return (
    <div className="mb-5 flex justify-center">
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden
          className={`absolute h-16 w-16 rounded-full bg-gradient-to-br ${theme.glow} blur-xl transition-transform duration-[650ms] ${
            prominent ? "scale-125 opacity-80" : "scale-100 opacity-55"
          }`}
        />
        <span
          className={`relative flex h-14 w-14 items-center justify-center rounded-full text-2xl bg-white/90 ring-2 transition-transform duration-[650ms] ${theme.ring} ${
            prominent ? "scale-110 shadow-md" : "scale-100"
          }`}
        >
          {emoji}
        </span>
      </div>
    </div>
  );
}

function CasoCard({ caso, offset }: { caso: Caso; offset: number }) {
  const { theme } = caso;
  const isCenter = offset === 0;

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/80 text-center shadow-md ring-1 ring-white/60 transition-[box-shadow] duration-[650ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] sm:shadow-lg ${
        isCenter ? `shadow-xl ${theme.shadow}` : ""
      }`}
    >
      {/* Base sólida + tinte de color (misma opacidad en todo el recorrido) */}
      <div aria-hidden className="absolute inset-0 bg-white/92 backdrop-blur-md" />
      <div aria-hidden className={`absolute inset-0 ${theme.activeGlass}`} />
      <div className="relative z-10 flex h-full flex-col p-6 sm:p-7">
        <EmojiGlow emoji={caso.emoji} theme={theme} prominent={isCenter} />
        <h3
          className={`mb-2 font-bold transition-all duration-[650ms] ${
            isCenter ? `text-lg ${theme.title}` : "text-base text-slate-800"
          }`}
        >
          {caso.titulo}
        </h3>
        <p
          className={`flex-1 text-sm leading-relaxed ${
            isCenter ? "text-slate-700" : "text-slate-600 line-clamp-4"
          }`}
        >
          {caso.descripcion}
        </p>
      </div>
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
        className="relative mx-auto h-[300px] max-w-full overflow-x-clip overflow-y-visible px-10 sm:h-[320px] sm:px-14"
        style={{ perspective: reduced ? undefined : "1200px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          {CASOS.map((caso, i) => {
            const offset = wrappedOffset(i, active, CASOS.length);
            const isCenter = offset === 0;

            return (
              <article
                key={caso.titulo}
                className="absolute left-1/2 top-1/2 w-[260px] will-change-transform sm:w-[300px]"
                style={{
                  ...coverflowStyle(offset, reduced),
                  transformOrigin: "center center",
                }}
                aria-hidden={!isCenter}
              >
                <CasoCard caso={caso} offset={offset} />
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
