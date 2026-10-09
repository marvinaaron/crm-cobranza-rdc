import Link from "next/link";

const SLUG_BLOG = "/blog/cuando-vence-mi-declaracion-segun-rfc";

function IconoGuia() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h5" />
    </svg>
  );
}

/** Salida hacia la guía: la herramienta no explica las reglas, el blog sí. */
export default function VencimientoSeoBloques() {
  return (
    <Link
      href={SLUG_BLOG}
      className="group mt-8 flex items-start gap-4 rounded-2xl bg-white ring-1 ring-sky-100 shadow-sm px-5 py-5 hover:ring-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <span
        aria-hidden
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700"
      >
        <IconoGuia />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-black text-slate-900 tracking-tight">
          ¿Quieres entender por qué esa fecha?
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-slate-600">
          En la guía está el 6º dígito del RFC, qué pasa si cae en fin de
          semana y un ejemplo completo. Aquí solo calculamos tu vencimiento.
        </span>
        <span className="mt-2 inline-block text-sm font-bold text-sky-700 group-hover:text-sky-900">
          Leer la guía
        </span>
      </span>
    </Link>
  );
}
