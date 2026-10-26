/**
 * Testimonios cinema: tres citas del mismo tamaño, sección compacta.
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
  foto?: string;
};

const ACENTOS: Record<Acento, string> = {
  verde: "bg-emerald-500",
  naranja: "bg-amber-500",
  rojo: "bg-rose-500",
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

function Avatar({ t }: { t: Testimonio }) {
  if (t.foto) {
    return (
      <Image
        src={t.foto}
        alt={t.autor}
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white ${ACENTOS[t.acento]}`}
      aria-hidden
    >
      {t.iniciales}
    </span>
  );
}

export default function Testimonios() {
  return (
    <section className="bg-[#f6f6f6] py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-xl">
          <h2 className="text-xl font-black tracking-[-0.03em] text-marca-navy sm:text-2xl">
            Confianza ganada cliente por cliente.
          </h2>
          <p className="mt-1.5 text-sm text-marca-navy/55">
            Relaciones de años. Esto dicen algunos clientes de trabajar con RDC.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {TESTIMONIOS.map((t) => (
            <blockquote
              key={t.autor}
              className="flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-marca-navy/8 sm:p-5"
            >
              <p className="flex-1 text-sm leading-snug tracking-[-0.01em] text-marca-navy/80">
                “{t.texto}”
              </p>
              <div className="mt-4 flex items-start gap-2.5">
                <Avatar t={t} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold tracking-tight text-marca-navy">
                      {t.autor}
                    </p>
                    <span
                      className="flex shrink-0 items-center gap-0.5 text-amber-400"
                      aria-label="5 de 5 estrellas"
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-marca-navy/45">
                    {t.giro}
                  </p>
                </div>
              </div>
            </blockquote>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-marca-navy/10 pt-5">
          <div>
            <p className="text-sm font-bold tracking-tight text-marca-navy">
              Despacho tradicional vs RDC
            </p>
            <p className="text-xs text-marca-navy/50">
              10 diferencias concretas. Sin promesas vacías.
            </p>
          </div>
          <Link
            href="/comparativa"
            className="shrink-0 rounded-xl bg-marca-navy px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-marca-navy-deep"
          >
            Ver comparativa →
          </Link>
        </div>
      </div>
    </section>
  );
}
