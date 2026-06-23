/**
 * Sección "Logos de credibilidad": respaldo tecnológico (suite CONTPAQi con
 * los logos originales) y formación/membresías (CEFOR y Cámara de Comercio).
 * Replica el stack tecnológico de la página "Nosotros". Solo presentación.
 */

import Image from "next/image";
import { Fragment } from "react";

const PRODUCTOS = [
  {
    src: "/marcas/contpaqi-contabiliza.png",
    alt: "CONTPAQi Contabiliza",
    descripcion:
      "Contabilidad electrónica, pólizas, balanzas y reportes alineados a la normatividad del SAT.",
  },
  {
    src: "/marcas/contpaqi-personia.png",
    alt: "CONTPAQi Personia",
    descripcion:
      "Cálculo y timbrado de nómina, recibos CFDI 4.0, IMSS, Infonavit e ISN.",
  },
  {
    src: "/marcas/contpaqi-vende.png",
    alt: "CONTPAQi Vende",
    descripcion:
      "Facturación electrónica, control de ventas e inventarios para PF y PM.",
  },
];

export default function LogosCredibilidad() {
  return (
    <section className="border-t border-black/[0.04] py-14 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-slate-500 mb-2">
            Respaldado por
          </p>
          <h2 className="text-slate-900 text-3xl md:text-4xl font-semibold tracking-tight mb-3 leading-tight">
            Software estándar de la industria
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Operamos sobre el ecosistema CONTPAQi, certificado por el SAT — el
            estándar profesional de despachos serios en México.
          </p>
        </div>

        {/* Stack CONTPAQi con logos reales (igual que Nosotros) */}
        <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-marca-navy">
                Stack tecnológico
              </p>
              <h3 className="mt-2 text-xl sm:text-2xl font-black text-slate-900">
                Software fiscal de gama alta, certificado por el SAT
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest ring-1 ring-emerald-100 self-start sm:self-auto">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Certificado SAT
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
            {PRODUCTOS.map((p, idx) => (
              <Fragment key={p.alt}>
                <article className="relative flex-1 rounded-2xl bg-slate-50 ring-1 ring-slate-100 p-5 flex flex-col">
                  <div className="h-14 flex items-center justify-start">
                    <Image
                      src={p.src}
                      alt={p.alt}
                      width={240}
                      height={72}
                      className="max-h-14 w-auto object-contain"
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                    {p.descripcion}
                  </p>
                </article>
                {idx < PRODUCTOS.length - 1 && (
                  <div
                    className="relative flex items-center justify-center py-4 sm:py-0 sm:w-12 shrink-0"
                    aria-hidden
                  >
                    <span className="hidden sm:block absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-violet-200 via-violet-400 to-violet-200" />
                    <span className="sm:hidden absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-violet-200 via-violet-400 to-violet-200" />
                    <span className="relative z-10 w-8 h-8 rounded-full bg-white ring-2 ring-violet-300 flex items-center justify-center shadow-sm">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="text-marca-navy"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          <p className="mt-5 text-[11px] text-slate-400 text-center sm:text-left">
            CONTPAQi® y los logotipos de sus productos son marcas registradas
            por Computación en Acción, S.A. de C.V.
          </p>
        </div>

        {/* Formación continua y membresías — logos reales en grayscale */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] uppercase tracking-[0.22em] text-slate-400">
          <span className="font-bold">Formación continua en:</span>
          <a
            href="https://cefor.mx"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CEFOR"
            title="CEFOR"
            className="inline-flex items-center opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
          >
            <Image
              src="/marcas/cefor.png"
              alt="CEFOR"
              width={88}
              height={26}
              className="h-6 w-auto object-contain"
            />
          </a>
          <a
            href="https://www.camaradecomerciogdl.mx/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Cámara de Comercio de Guadalajara"
            title="Cámara de Comercio de Guadalajara"
            className="inline-flex items-center opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
          >
            <Image
              src="/marcas/camara-comercio-gdl.png"
              alt="Cámara de Comercio de Guadalajara"
              width={88}
              height={30}
              className="h-7 w-auto object-contain"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
