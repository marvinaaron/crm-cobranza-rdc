"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

/**
 * Chips de categoría dentro del hero navy del blog.
 *
 * Cada chip enlaza a /blog?cat=<id>#articulos. El filtro real lo aplica
 * `BlogIndice` leyendo el mismo query param, así que el hero y el grid
 * quedan sincronizados sin estado compartido.
 *
 * Visual: fondo semitransparente (white/10, borde white/20); el chip
 * activo usa el gradiente indigo→violet de marca.
 */

const CHIPS: Array<{ cat: string; label: string }> = [
  { cat: "sat", label: "Trámites SAT" },
  { cat: "impuestos", label: "Impuestos" },
  { cat: "guias", label: "Guías prácticas" },
];

export default function BlogHeroChips() {
  const searchParams = useSearchParams();
  const activo = searchParams.get("cat");

  return (
    <div className="mt-8 flex flex-wrap gap-2.5">
      {CHIPS.map((chip) => {
        const esActivo = activo === chip.cat;
        return (
          <Link
            key={chip.cat}
            href={`/blog?cat=${chip.cat}#articulos`}
            scroll={false}
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold transition-all ${
              esActivo
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-violet-900/30"
                : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
            }`}
          >
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
