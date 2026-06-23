/**
 * Sección "Por qué RDC" — tono claro continuo (estilo Apple).
 */

import Link from "next/link";

const STATS = [
  {
    numero: "0",
    titulo: "Declaraciones brincadas",
    descripcion: "Cada obligación en tiempo y forma.",
  },
  {
    numero: "< 2h",
    titulo: "Tiempo de respuesta",
    descripcion: "Hablas directo con tu contador.",
  },
  {
    numero: "24/7",
    titulo: "Acceso al portal",
    descripcion: "SAT, IMSS y honorarios en un solo lugar.",
  },
  {
    numero: "100%",
    titulo: "Digital",
    descripcion: "Documentos y pagos en línea.",
  },
];

const PORTAL_CHECKS = [
  "Opinión 32-D en tiempo real",
  "Calendario fiscal sincronizable",
  "Pago con tarjeta desde el portal",
  "Alerta de vencimiento de e.firma",
];

export default function PorQueRdc() {
  return (
    <section className="border-t border-black/[0.04] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-slate-500">Por qué elegirnos</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            No somos un call center. Somos tu contador.
          </h2>
          <p className="mt-3 text-base text-slate-500">
            Datos reales de cómo trabajamos, no promesas genéricas.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {STATS.map((s) => (
            <div
              key={s.titulo}
              className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.04]"
            >
              <p className="text-3xl font-semibold tabular-nums text-slate-900">{s.numero}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{s.titulo}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.descripcion}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-black/[0.04]">
          <div className="grid grid-cols-1 items-center gap-8 p-8 sm:p-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-500">Tecnología propia</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Portal exclusivo para clientes
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-500">
                Desarrollado in-house. Tu SAT, IMSS y honorarios accesibles las 24 horas.
              </p>
              <Link
                href="/portal/login"
                className="mt-5 inline-flex items-center text-sm font-semibold text-indigo-600 hover:underline"
              >
                Entrar al portal →
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PORTAL_CHECKS.map((check) => (
                <li
                  key={check}
                  className="rounded-xl bg-[#f5f5f7] px-3.5 py-3 text-sm text-slate-700"
                >
                  {check}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
