"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { BlogPostVista, CategoriaBlog, CategoriaId } from "@/lib/blog/posts";
import BlogCardDark from "./BlogCardDark";

/**
 * Grid del índice del blog con filtro por categoría en "tab pills" (client).
 *
 * - Las pills muestran todas las categorías (aunque aún no tengan posts),
 *   para que el blog comunique su alcance editorial desde el día uno.
 * - Se sincroniza con el query param `cat` (que setean los chips del hero):
 *   un click en "Trámites SAT" arriba filtra esta lista.
 * - Al cambiar de pill, las cards hacen un fade suave (opacity + scale).
 */
export default function BlogIndice({
  posts,
  categorias,
}: {
  posts: BlogPostVista[];
  categorias: CategoriaBlog[];
}) {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");
  const [filtro, setFiltro] = useState<CategoriaId | "todas">("todas");
  const [visible, setVisible] = useState(true);

  // Sincroniza el filtro con el query param `cat` (chips del hero).
  useEffect(() => {
    const valido = categorias.some((c) => c.id === catParam);
    setFiltro(valido ? (catParam as CategoriaId) : "todas");
  }, [catParam, categorias]);

  const visibles = useMemo(
    () =>
      filtro === "todas"
        ? posts
        : posts.filter((p) => p.categoria === filtro),
    [filtro, posts]
  );

  // Cambia el filtro con un fade out → in suave.
  function cambiarFiltro(nuevo: CategoriaId | "todas") {
    if (nuevo === filtro) return;
    setVisible(false);
    window.setTimeout(() => {
      setFiltro(nuevo);
      setVisible(true);
    }, 150);
  }

  return (
    <div>
      {/* Tab pills de categoría */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <TabPill
          activo={filtro === "todas"}
          onClick={() => cambiarFiltro("todas")}
          label="Todos"
        />
        {categorias.map((cat) => (
          <TabPill
            key={cat.id}
            activo={filtro === cat.id}
            onClick={() => cambiarFiltro(cat.id)}
            label={cat.label}
          />
        ))}
      </div>

      <div
        className={`transition-all duration-150 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {visibles.length === 0 ? (
          <p className="text-center text-white/50 py-16">
            Pronto publicaremos artículos en esta categoría. 🙌
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {visibles.map((post) => (
              <li key={post.slug}>
                <BlogCardDark post={post} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TabPill({
  activo,
  onClick,
  label,
}: {
  activo: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${
        activo
          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-violet-900/50"
          : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
