import Link from "next/link";

const SLUG_BLOG = "/blog/como-calcular-tu-rfc-con-homoclave";

const PARTES = [
  {
    bloque: "4 letras",
    que: "Apellidos y nombre",
    ejemplo: "LOMA",
  },
  {
    bloque: "6 dígitos",
    que: "Fecha de nacimiento (AAMMDD)",
    ejemplo: "900315",
  },
  {
    bloque: "3 caracteres",
    que: "Homoclave + dígito verificador",
    ejemplo: "AB1",
  },
];

/**
 * Texto y tabla en HTML de servidor: es lo que Google cita para
 * “calculadora RFC con homoclave”, no un <details> cerrado.
 */
export default function RfcSeoBloques() {
  return (
    <section className="mt-8 space-y-6 text-slate-600">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Cómo se calcula el RFC con homoclave
        </h2>
        <p className="mt-2 text-sm sm:text-base leading-relaxed">
          El RFC de persona física tiene{" "}
          <strong className="text-slate-800 font-semibold">13 caracteres</strong>
          : 4 letras del nombre, 6 dígitos de la fecha de nacimiento y 3 de
          homoclave. Esta calculadora aplica el algoritmo público del SAT. El
          RFC oficial es el de tu Constancia de Situación Fiscal.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-violet-100 shadow-sm">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
        />
        <table className="w-full text-sm">
          <caption className="sr-only">
            Partes del RFC de persona física: letras, fecha y homoclave
          </caption>
          <thead>
            <tr className="text-slate-500 border-b border-slate-100 bg-slate-50">
              <th className="text-left font-bold uppercase tracking-wider text-[10px] px-5 py-2.5">
                Bloque
              </th>
              <th className="text-left font-bold uppercase tracking-wider text-[10px] px-5 py-2.5">
                Qué usa
              </th>
              <th className="text-right font-bold uppercase tracking-wider text-[10px] px-5 py-2.5">
                Ejemplo
              </th>
            </tr>
          </thead>
          <tbody>
            {PARTES.map((fila) => (
              <tr key={fila.bloque} className="border-b border-slate-50">
                <td className="px-5 py-2.5 font-semibold text-slate-800">
                  {fila.bloque}
                </td>
                <td className="px-5 py-2.5">{fila.que}</td>
                <td className="px-5 py-2.5 text-right font-mono font-black text-marca-navy tabular-nums">
                  {fila.ejemplo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-5 py-3 text-xs text-slate-400">
          Ejemplo: Ana López Martínez, 15 de marzo de 1990 → LOMA900315AB1.
        </p>
      </div>

      <Link
        href={SLUG_BLOG}
        className="group flex items-start gap-4 rounded-2xl bg-white ring-1 ring-sky-100 shadow-sm px-5 py-5 hover:ring-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        <span className="min-w-0">
          <span className="block text-base font-black text-slate-900 tracking-tight">
            ¿Quieres el desglose letra por letra?
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-slate-600">
            En la guía está José, María, partículas (De, Del, La) y por qué la
            homoclave a veces no coincide con el SAT. Aquí solo calculamos.
          </span>
          <span className="mt-2 inline-block text-sm font-bold text-sky-700 group-hover:text-sky-900">
            Leer la guía
          </span>
        </span>
      </Link>
    </section>
  );
}
