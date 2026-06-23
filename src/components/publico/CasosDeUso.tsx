"use client";

/**
 * Sección "Para quién trabajamos": carrusel estilo Cover Flow (Apple).
 * Una tarjeta principal al centro; las demás se apilan a los lados con
 * perspectiva 3D. Cards glassmorphism con navegación por flechas o swipe.
 */

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Caso = {
  titulo: string;
  descripcion: string;
  emoji: string;
};

const CASOS: Caso[] = [
  {
    titulo: "Transportistas",
    descripcion:
      "Acreditamos el IEPS de tu diésel, controlamos comprobantes de combustible y casetas, y dejamos al día tus complementos Carta Porte.",
    emoji: "🚛",
  },
  {
    titulo: "Dentistas",
    descripcion:
      "Facturación a pacientes con CFDI de servicios médicos, RESICO PF con honorarios y declaración anual con deducciones personales.",
    emoji: "🦷",
  },
  {
    titulo: "Contratistas",
    descripcion:
      "Padrón REPSE vigente, presentación de informes ICSOE y SISUB ante IMSS e Infonavit. Somos de los pocos despachos que lo hacemos mes con mes.",
    emoji: "🏗️",
  },
  {
    titulo: "Sector automotriz",
    descripcion:
      "Agencias, talleres y refaccionarias. Manejo fiscal de unidades nuevas y usadas, control de inventario, garantías y clientes flotilleros.",
    emoji: "🚗",
  },
  {
    titulo: "Honorarios",
    descripcion:
      "Freelancers, consultores y profesionistas independientes. Optimización de retenciones, RESICO PF cuando conviene y saldo a favor maximizado.",
    emoji: "💼",
  },
  {
    titulo: "Escuelas y colegios",
    descripcion:
      "Instituciones con autorización SEP. CFDI de colegiaturas deducible para padres, nómina docente con prestaciones e IMSS, Infonavit e ISN al día.",
    emoji: "🏫",
  },
  {
    titulo: "Fotógrafos",
    descripcion:
      "Estudios y fotógrafos independientes. Manejo de equipo deducible, retención de honorarios y facturación a empresas o particulares con CFDI 4.0.",
    emoji: "📷",
  },
  {
    titulo: "Ingenieros en proyectos",
    descripcion:
      "Consultoría y proyectos por etapas. Facturación parcial por avance de obra, retenciones y comprobantes de gastos de viaje y viáticos.",
    emoji: "⚙️",
  },
];

function coverflowStyle(offset: number, reduced: boolean): React.CSSProperties {
  const abs = Math.abs(offset);
  if (abs > 2) {
    return { opacity: 0, pointerEvents: "none", visibility: "hidden" };
  }

  const spacing = reduced ? 160 : 190;
  const x = offset * spacing;
  const rotateY = offset * -34;
  const scale = offset === 0 ? 1 : abs === 1 ? 0.86 : 0.72;
  const zIndex = 20 - abs * 5;
  const opacity = offset === 0 ? 1 : abs === 1 ? 0.82 : 0.55;

  return {
    transform: reduced
      ? `translate(calc(-50% + ${x}px), -50%) scale(${offset === 0 ? 1 : 0.88})`
      : `translate(calc(-50% + ${x}px), -50%) scale(${scale}) rotateY(${rotateY}deg)`,
    zIndex,
    opacity,
    transition: "transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.4s ease",
  };
}

function CasoCard({ caso, active }: { caso: Caso; active: boolean }) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl p-6 sm:p-7 backdrop-blur-xl border transition-shadow duration-500 ${
        active
          ? "bg-white/72 border-white/80 shadow-2xl shadow-indigo-300/25 ring-1 ring-indigo-200/50"
          : "bg-white/45 border-white/55 shadow-lg shadow-slate-300/20 ring-1 ring-white/40"
      }`}
    >
      <span
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all duration-500 ${
          active ? "bg-indigo-100/80 shadow-inner" : "bg-white/50"
        }`}
        aria-hidden="true"
      >
        {caso.emoji}
      </span>
      <h3
        className={`mb-2 font-bold transition-colors duration-300 ${
          active ? "text-lg text-slate-900" : "text-base text-slate-700"
        }`}
      >
        {caso.titulo}
      </h3>
      <p
        className={`flex-1 text-sm leading-relaxed transition-colors duration-300 ${
          active ? "text-slate-600" : "text-slate-500 line-clamp-4"
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
    setActive((i) => (i - 1 + CASOS.length) % CASOS.length);
  }, []);

  const goNext = useCallback(() => {
    setActive((i) => (i + 1) % CASOS.length);
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
      {/* Flechas */}
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

      {/* Escena 3D */}
      <div
        className="relative mx-auto h-[300px] max-w-full overflow-hidden px-10 sm:h-[320px] sm:px-14"
        style={{ perspective: reduced ? undefined : "1400px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {CASOS.map((caso, i) => {
            const offset = i - active;
            return (
              <article
                key={caso.titulo}
                className="absolute left-1/2 top-1/2 w-[260px] sm:w-[300px]"
                style={{
                  ...coverflowStyle(offset, reduced),
                  transformOrigin: "center center",
                }}
                aria-hidden={offset !== 0}
              >
                <CasoCard caso={caso} active={offset === 0} />
                {/* Reflejo sutil bajo la tarjeta activa (estilo Cover Flow) */}
                {offset === 0 && !reduced && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-8 left-2 right-2 h-10 rounded-2xl opacity-25"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(99,102,241,0.15), transparent)",
                      transform: "scaleY(-1) rotateX(180deg)",
                      filter: "blur(4px)",
                    }}
                  />
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Indicadores */}
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {CASOS.map((c, i) => (
          <button
            key={c.titulo}
            type="button"
            aria-label={`Ver ${c.titulo}`}
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
      {/* Fondo con manchas de color para que el glass se note */}
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
