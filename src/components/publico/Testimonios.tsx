/**
 * Sección de testimonios reales de clientes. Editar `TESTIMONIOS` con citas
 * verdaderas recolectadas por WhatsApp/correo. Mantener 3 (o múltiplos de 3)
 * para que la cuadrícula de 3 columnas quede balanceada. Cierra con la
 * tarjeta de comparativa.
 *
 * Cada testimonio lleva un acento de color (verde, naranja, rojo) tomado de
 * la paleta de avatares del Hero. Si algún cliente nos comparte su foto,
 * basta con poner `foto: "/equipo/o-clientes/nombre.jpg"`; mientras tanto se
 * muestra un avatar con sus iniciales en el color del acento.
 */

import Image from "next/image";
import Link from "next/link";

type Acento = "verde" | "naranja" | "rojo";

type Testimonio = {
  texto: string;
  autor: string;
  giro: string;
  iniciales: string;
  acento: Acento;
  /** Ruta pública de la foto del cliente (opcional). */
  foto?: string;
};

/** Tokens de color por acento (mismos tonos que los avatares del Hero). */
const ACENTOS: Record<
  Acento,
  { avatar: string; comillas: string; ring: string; barra: string }
> = {
  verde: {
    avatar: "from-emerald-500 to-emerald-600",
    comillas: "text-emerald-200",
    ring: "ring-emerald-100",
    barra: "from-emerald-400 to-emerald-500",
  },
  naranja: {
    avatar: "from-amber-500 to-orange-500",
    comillas: "text-amber-200",
    ring: "ring-amber-100",
    barra: "from-amber-400 to-orange-500",
  },
  rojo: {
    avatar: "from-rose-500 to-rose-600",
    comillas: "text-rose-200",
    ring: "ring-rose-100",
    barra: "from-rose-400 to-rose-500",
  },
};

const TESTIMONIOS: Testimonio[] = [
  {
    texto:
      "Lo que más nos estresaba era hacer un cambio de contador, pero con RDC y todo su sistema nos ayudó incluso a reducir nuestros impuestos casi un 20%. Su estrategia del despacho funcionó.",
    autor: "Directora",
    giro: "Kinder y primaria · Persona moral",
    iniciales: "DK",
    acento: "verde",
  },
  {
    texto:
      "Yo no sabía que mi contador anterior nunca me había presentado una declaración. Ahora veo 24/7 mi situación, mi hoja de impuestos y nunca pago tarde. Me encanta que el teléfono me lo recuerda con anticipación.",
    autor: "Persona física",
    giro: "Honorarios · RESICO",
    iniciales: "PF",
    acento: "naranja",
  },
  {
    texto:
      "Antes vivía con el pendiente del SAT cada mes. Con RDC ya no me preocupo: me avisan, me explican y todo sale a tiempo. El portal me deja ver mis comprobantes cuando los necesito.",
    autor: "Dr. Ramírez",
    giro: "Consultorio dental · Guadalajara",
    iniciales: "DR",
    acento: "rojo",
  },
];

function TestimonioCard({ t }: { t: Testimonio }) {
  const a = ACENTOS[t.acento];
  return (
    <article className="group relative flex flex-col h-full overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Barra de acento superior */}
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.barra}`}
        aria-hidden="true"
      />

      <p
        className={`text-5xl leading-none mb-3 font-serif ${a.comillas}`}
        aria-hidden="true"
      >
        &ldquo;
      </p>
      <p className="text-slate-600 text-sm leading-relaxed italic mb-6 flex-1">
        {t.texto}
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        {t.foto ? (
          <Image
            src={t.foto}
            alt={t.autor}
            width={44}
            height={44}
            className={`w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ${a.ring}`}
          />
        ) : (
          <span
            className={`w-11 h-11 rounded-full bg-gradient-to-br ${a.avatar} flex items-center justify-center text-white text-sm font-black flex-shrink-0 ring-2 ${a.ring}`}
            aria-hidden="true"
          >
            {t.iniciales}
          </span>
        )}
        <div>
          <p className="text-slate-900 font-bold text-sm">{t.autor}</p>
          <p className="text-slate-400 text-xs">{t.giro}</p>
        </div>
      </div>
    </article>
  );
}

export default function Testimonios() {
  return (
    <section className="py-14 sm:py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-2">
            Lo que dicen nuestros clientes
          </p>
          <h2 className="text-slate-900 text-2xl md:text-3xl font-black tracking-tight mb-3">
            Confianza ganada{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              cliente por cliente
            </span>
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Despachos como el nuestro se construyen con relaciones de años. Esto es
            lo que algunos de nuestros clientes dicen sobre trabajar con RDC.
          </p>
        </div>

        {/* Tres testimonios del mismo tamaño */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {TESTIMONIOS.map((t) => (
            <TestimonioCard key={t.autor} t={t} />
          ))}
        </div>

        {/* Card de comparativa */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-block bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2">
              ¿Aún dudas en cambiarte?
            </span>
            <p className="text-indigo-900 font-bold text-sm mb-1">
              Despacho tradicional vs RDC
            </p>
            <p className="text-indigo-600 text-xs">
              10 diferencias concretas. Sin promesas vacías.
            </p>
          </div>
          <Link
            href="/comparativa"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all flex-shrink-0"
          >
            Ver comparativa →
          </Link>
        </div>
      </div>
    </section>
  );
}
