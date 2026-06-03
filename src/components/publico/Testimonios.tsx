/**
 * Sección de testimonios reales de clientes. Editar `TESTIMONIOS` con citas
 * verdaderas recolectadas por WhatsApp/correo. Mantener 3 a 6 para que la
 * cuadrícula se vea balanceada. Cierra con la tarjeta de comparativa.
 */

import Link from "next/link";

type Testimonio = {
  texto: string;
  autor: string;
  giro: string;
  iniciales: string;
};

const TESTIMONIOS: Testimonio[] = [
  {
    texto:
      "Lo que más nos estresaba era hacer un cambio de contador, pero con RDC y todo su sistema nos ayudó incluso a reducir nuestros impuestos casi un 20%. Su estrategia del despacho funcionó.",
    autor: "Directora",
    giro: "Kinder y primaria · Persona moral",
    iniciales: "DK",
  },
  {
    texto:
      "Yo no sabía que mi contador anterior nunca me había presentado una declaración. Ahora veo 24/7 mi situación, mi hoja de impuestos y nunca pago tarde. Me encanta que el teléfono me lo recuerda con anticipación.",
    autor: "Persona física",
    giro: "Honorarios · RESICO",
    iniciales: "PF",
  },
  {
    texto:
      "Antes vivía con el pendiente del SAT cada mes. Con RDC ya no me preocupo: me avisan, me explican y todo sale a tiempo. El portal me deja ver mis comprobantes cuando los necesito.",
    autor: "Dr. Ramírez",
    giro: "Consultorio dental · Guadalajara",
    iniciales: "DR",
  },
];

function TestimonioCard({ t }: { t: Testimonio }) {
  return (
    <article className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
      <p
        className="text-4xl leading-none mb-3 text-indigo-200 font-serif"
        aria-hidden="true"
      >
        &ldquo;
      </p>
      <p className="text-slate-600 text-sm leading-relaxed italic mb-5">
        {t.texto}
      </p>
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {t.iniciales}
        </span>
        <div>
          <p className="text-slate-900 font-semibold text-sm">{t.autor}</p>
          <p className="text-slate-400 text-xs">{t.giro}</p>
        </div>
      </div>
    </article>
  );
}

export default function Testimonios() {
  const [uno, dos, tres] = TESTIMONIOS;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-2">
            Lo que dicen nuestros clientes
          </p>
          <h2 className="text-slate-900 text-2xl md:text-3xl font-bold mb-3">
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

        {/* Dos primeros en grid, el tercero a ancho completo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
          {uno && <TestimonioCard t={uno} />}
          {dos && <TestimonioCard t={dos} />}
        </div>
        {tres && (
          <div className="w-full">
            <TestimonioCard t={tres} />
          </div>
        )}

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
