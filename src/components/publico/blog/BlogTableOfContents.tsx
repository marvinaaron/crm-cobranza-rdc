"use client";

import { useEffect, useMemo, useState } from "react";
import type { BloqueContenido } from "@/lib/blog/posts";

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BlogTableOfContents({
  bloques,
}: {
  bloques: BloqueContenido[];
}) {
  const subtitulos = useMemo(
    () =>
      bloques
        .filter((b): b is { tipo: "subtitulo"; texto: string } => b.tipo === "subtitulo")
        .map((b) => ({ id: slugify(b.texto), texto: b.texto })),
    [bloques]
  );

  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (subtitulos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 }
    );

    subtitulos.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [subtitulos]);

  if (subtitulos.length < 2) return null;

  return (
    <nav
      className="hidden min-[1700px]:block fixed top-28 w-52 z-30"
      style={{ left: "max(1.5rem, calc(50vw - 50rem))" }}
      aria-label="Tabla de contenido"
    >
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Contenido
        </p>
        <ul className="space-y-1 border-l border-slate-200">
          {subtitulos.map(({ id, texto }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`block pl-3 py-1 text-[13px] leading-snug transition-colors border-l-2 -ml-px ${
                  activeId === id
                    ? "border-marca-navy text-marca-navy font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {texto}
              </a>
            </li>
          ))}
        </ul>
    </nav>
  );
}
