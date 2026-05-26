/**
 * Sección de testimonios reales de clientes. Editar `TESTIMONIOS` con citas
 * verdaderas recolectadas por WhatsApp/correo. Mantener 3 a 6 para que la
 * cuadrícula se vea balanceada.
 */

type Testimonio = {
  texto: string;
  autor: string;
  giro: string;
  iniciales: string;
  tonoAvatar: "indigo" | "emerald" | "amber" | "rose" | "slate" | "blue" | "violet";
};

const TONO_AVATAR: Record<Testimonio["tonoAvatar"], string> = {
  indigo: "bg-indigo-100 text-indigo-700",
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-700",
  violet: "bg-violet-100 text-violet-700",
};

const TESTIMONIOS: Testimonio[] = [
  {
    texto:
      "Lo que más nos estresaba era hacer un cambio de contador, pero con RDC y todo su sistema nos ayudó incluso a reducir nuestros impuestos casi un 20%. Su estrategia del despacho funcionó.",
    autor: "Directora",
    giro: "Kinder y primaria · Persona moral",
    iniciales: "DK",
    tonoAvatar: "violet",
  },
  {
    texto:
      "Yo no sabía que mi contador anterior nunca me había presentado una declaración. Ahora veo 24/7 mi situación, mi hoja de impuestos y nunca pago tarde. Me encanta que el teléfono me lo recuerda con anticipación.",
    autor: "Persona física",
    giro: "Honorarios · RESICO",
    iniciales: "PF",
    tonoAvatar: "emerald",
  },
  {
    texto:
      "Antes vivía con el pendiente del SAT cada mes. Con RDC ya no me preocupo: me avisan, me explican y todo sale a tiempo. El portal me deja ver mis comprobantes cuando los necesito.",
    autor: "Dr. Ramírez",
    giro: "Consultorio dental · Tijuana",
    iniciales: "DR",
    tonoAvatar: "indigo",
  },
];

const QuoteIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    className="text-indigo-200"
  >
    <path d="M9 7H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1a3 3 0 0 1-3 3H3v2h1a5 5 0 0 0 5-5V7zm12 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v1a3 3 0 0 1-3 3h-1v2h1a5 5 0 0 0 5-5V7z" />
  </svg>
);

const StarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    className="text-amber-400"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function Testimonios() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
            Lo que dicen nuestros clientes
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Confianza ganada cliente por cliente
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Despachos como el nuestro se construyen con relaciones de años. Esto es
            lo que algunos de nuestros clientes dicen sobre trabajar con RDC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIOS.map((t) => (
            <article
              key={t.autor}
              className="relative bg-white rounded-2xl p-6 ring-1 ring-slate-200 hover:ring-indigo-300 hover:shadow-xl transition-all flex flex-col"
            >
              <QuoteIcon />
              <div className="flex items-center gap-1 mt-3 mb-3">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed flex-1">"{t.texto}"</p>
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-slate-100">
                <span
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm ${TONO_AVATAR[t.tonoAvatar]}`}
                >
                  {t.iniciales}
                </span>
                <div>
                  <p className="text-sm font-black text-slate-900">{t.autor}</p>
                  <p className="text-xs text-slate-500">{t.giro}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
