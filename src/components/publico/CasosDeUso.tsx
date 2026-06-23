"use client";

import Link from "next/link";

type Caso = {
  titulo: string;
  descripcion: string;
  emoji: string;
};

const CASOS: Caso[] = [
  {
    titulo: "Transportistas",
    descripcion:
      "IEPS diésel, combustible, casetas y complementos Carta Porte al día.",
    emoji: "🚛",
  },
  {
    titulo: "Dentistas",
    descripcion: "CFDI servicios médicos, RESICO PF y declaración anual.",
    emoji: "🦷",
  },
  {
    titulo: "Contratistas",
    descripcion: "REPSE, ICSOE y SISUB ante IMSS e Infonavit, mes con mes.",
    emoji: "🏗️",
  },
  {
    titulo: "Sector automotriz",
    descripcion: "Agencias, talleres y refaccionarias con inventario y flotilla.",
    emoji: "🚗",
  },
  {
    titulo: "Honorarios",
    descripcion: "Freelancers y consultores. Retenciones y RESICO optimizado.",
    emoji: "💼",
  },
  {
    titulo: "Escuelas",
    descripcion: "Colegiaturas, nómina docente, IMSS, Infonavit e ISN.",
    emoji: "🏫",
  },
  {
    titulo: "Fotógrafos",
    descripcion: "Equipo deducible, honorarios y CFDI 4.0.",
    emoji: "📷",
  },
  {
    titulo: "Ingeniería",
    descripcion: "Proyectos por etapas, retenciones y viáticos.",
    emoji: "⚙️",
  },
];

function CasoCard({ caso }: { caso: Caso }) {
  return (
    <article className="mx-2 flex w-[200px] min-w-[180px] flex-shrink-0 flex-col rounded-2xl bg-white p-4 ring-1 ring-black/[0.04]">
      <span className="mb-3 text-xl" aria-hidden="true">
        {caso.emoji}
      </span>
      <h3 className="text-sm font-semibold text-slate-900">{caso.titulo}</h3>
      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-500">
        {caso.descripcion}
      </p>
    </article>
  );
}

export default function CasosDeUso() {
  const duplicados = [...CASOS, ...CASOS];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-slate-500">Para quién trabajamos</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Negocios como el tuyo
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-base text-slate-500">
          Cada giro tiene reglas distintas. Estos son los perfiles que atendemos a diario.
        </p>
      </div>

      <div className="casos-marquee relative mt-10 overflow-hidden">
        <div className="casos-track flex items-stretch">
          {duplicados.map((c, i) => (
            <CasoCard key={`${c.titulo}-${i}`} caso={c} />
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        ¿No te ves aquí?{" "}
        <Link href="/contacto" className="font-medium text-indigo-600 hover:underline">
          Cuéntanos tu caso
        </Link>
      </p>

      <style jsx>{`
        .casos-marquee {
          mask-image: linear-gradient(
            to right,
            transparent,
            black 12%,
            black 88%,
            transparent
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 12%,
            black 88%,
            transparent
          );
        }
        .casos-track {
          animation: casos-scroll 55s linear infinite;
          width: max-content;
        }
        .casos-track:hover {
          animation-play-state: paused;
        }
        @keyframes casos-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .casos-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
