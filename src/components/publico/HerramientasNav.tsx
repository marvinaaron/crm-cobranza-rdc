import Link from "next/link";
import { HERRAMIENTAS } from "@/lib/seo/herramientas-config";

const ETIQUETAS: Record<string, string> = {
  inpc: "INPC",
  isr: "ISR 2026",
  uma: "UMA",
  salario: "Salario mínimo",
  recargos: "Recargos",
  divisas: "Tipo de cambio",
};

type Props = {
  activo?: string;
};

/** Enlaces internos entre herramientas (SEO + navegación). */
export default function HerramientasNav({ activo }: Props) {
  return (
    <nav
      aria-label="Herramientas fiscales"
      className="flex flex-wrap gap-2 mb-6"
    >
      <Link
        href="/herramientas"
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          activo === "hub"
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-900"
        }`}
      >
        Todas
      </Link>
      {HERRAMIENTAS.map((h) => (
        <Link
          key={h.id}
          href={h.path}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activo === h.id
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-900"
          }`}
        >
          {ETIQUETAS[h.id] ?? h.id}
        </Link>
      ))}
    </nav>
  );
}
