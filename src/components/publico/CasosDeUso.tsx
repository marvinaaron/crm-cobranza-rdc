"use client";

/**
 * Sección "Para quién trabajamos": carrusel infinito (marquee) con los
 * perfiles de cliente reales del despacho. Se inspira en el ticker de
 * divisas para dar sensación de movimiento sin saturar la página.
 */

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

function CasoCard({ caso }: { caso: Caso }) {
  return (
    <article className="flex flex-col flex-shrink-0 w-[200px] min-w-[180px] mx-2 bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <span
        className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-lg mb-3"
        aria-hidden="true"
      >
        {caso.emoji}
      </span>
      <h3 className="text-slate-900 text-sm font-semibold mb-1">
        {caso.titulo}
      </h3>
      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
        {caso.descripcion}
      </p>
    </article>
  );
}

export default function CasosDeUso() {
  const duplicados = [...CASOS, ...CASOS];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-2">
            Para quién trabajamos
          </p>
          <h2 className="text-slate-900 text-2xl md:text-3xl font-bold mb-3">
            Llevamos la contabilidad de{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              negocios
            </span>{" "}
            como el tuyo
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto mb-8">
            Cada giro tiene sus particularidades fiscales. Estos son los perfiles
            de cliente que trabajamos día a día.
          </p>
        </div>
      </div>

      {/* Carrusel infinito full-width */}
      <div className="relative overflow-hidden py-1">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-white to-transparent" />

        <div className="casos-track flex items-stretch will-change-transform">
          {duplicados.map((c, i) => (
            <CasoCard key={`${c.titulo}-${i}`} caso={c} />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mt-8 text-center text-slate-400 text-xs">
          ¿No te ves en la lista? También trabajamos contigo —{" "}
          <Link
            href="/contacto"
            className="text-indigo-600 hover:underline"
          >
            cuéntanos tu caso
          </Link>
          .
        </p>
      </div>

      <style jsx>{`
        .casos-track {
          animation: casos-scroll 60s linear infinite;
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
