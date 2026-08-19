import Link from "next/link";
import type { BloqueContenido } from "@/lib/blog/posts";
import MockOpinionCumplimiento from "@/components/publico/blog/MockOpinionCumplimiento";
import MockVencimientoDeclaracion from "@/components/publico/blog/MockVencimientoDeclaracion";
import MockEfirmaVigente from "@/components/publico/blog/MockEfirmaVigente";

/**
 * Renderiza el cuerpo de un artículo a partir de sus bloques tipados.
 * Es un Server Component (sin estado): solo mapea cada bloque a su markup.
 *
 * Tipos soportados: parrafo, subtitulo, lista, cita, callout, tabla, cta.
 * Agregar un tipo nuevo = añadirlo al union en `posts.ts` y un `case` aquí.
 */

const CALLOUT_ESTILOS = {
  tip: {
    contenedor: "bg-emerald-50 ring-emerald-200",
    titulo: "text-emerald-800",
    texto: "text-emerald-900/80",
    icono: "text-emerald-600",
    path: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
  },
  info: {
    contenedor: "bg-sky-50 ring-sky-200",
    titulo: "text-sky-800",
    texto: "text-sky-900/80",
    icono: "text-sky-600",
    path: "M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z",
  },
  alerta: {
    contenedor: "bg-amber-50 ring-amber-200",
    titulo: "text-amber-800",
    texto: "text-amber-900/80",
    icono: "text-amber-600",
    path: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  },
} as const;

/** Interpreta `**negritas**` y enlaces markdown `[texto](/ruta)` en los bloques. */
function TextoRico({ children }: { children: string }) {
  const partes = children.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {partes.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-slate-900">
              {p.slice(2, -2)}
            </strong>
          );
        }
        const enlace = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (enlace) {
          const [, etiqueta, href] = enlace;
          const interno = href.startsWith("/");
          const clase =
            "font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900";
          return interno ? (
            <Link key={i} href={href} className={clase}>
              {etiqueta}
            </Link>
          ) : (
            <a
              key={i}
              href={href}
              className={clase}
              target="_blank"
              rel="noopener noreferrer"
            >
              {etiqueta}
            </a>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function Callout({
  variante = "info",
  titulo,
  texto,
}: {
  variante?: "tip" | "info" | "alerta";
  titulo?: string;
  texto: string;
}) {
  const e = CALLOUT_ESTILOS[variante];
  return (
    <aside
      className={`my-6 rounded-2xl ring-1 p-5 flex items-start gap-4 ${e.contenedor}`}
    >
      <span className={`shrink-0 mt-0.5 ${e.icono}`} aria-hidden="true">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={e.path} />
        </svg>
      </span>
      <div className="min-w-0">
        {titulo && (
          <p className={`text-sm font-black mb-1 ${e.titulo}`}>{titulo}</p>
        )}
        <p className={`text-sm leading-relaxed ${e.texto}`}>
          <TextoRico>{texto}</TextoRico>
        </p>
      </div>
    </aside>
  );
}

export default function BlogContenido({
  bloques,
}: {
  bloques: BloqueContenido[];
}) {
  return (
    <div className="space-y-5">
      {bloques.map((b, i) => {
        switch (b.tipo) {
          case "parrafo":
            return (
              <p
                key={i}
                className="text-[17px] leading-relaxed text-slate-700"
              >
                <TextoRico>{b.texto}</TextoRico>
              </p>
            );

          case "subtitulo": {
            const headingId = b.texto
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            return (
              <h2
                key={i}
                id={headingId}
                className="pt-4 text-2xl font-black tracking-tight text-slate-900 scroll-mt-24"
              >
                {b.texto}
              </h2>
            );
          }

          case "lista":
            return b.estilo === "numeros" ? (
              <ol key={i} className="space-y-2.5 pl-1">
                {b.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-marca-navy/10 text-marca-navy text-xs font-black">
                      {j + 1}
                    </span>
                    <span className="text-[17px] leading-relaxed text-slate-700">
                      <TextoRico>{item}</TextoRico>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="space-y-2.5 pl-1">
                {b.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span
                      className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-marca-navy"
                      aria-hidden="true"
                    />
                    <span className="text-[17px] leading-relaxed text-slate-700">
                      <TextoRico>{item}</TextoRico>
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "cita":
            return (
              <blockquote
                key={i}
                className="my-6 border-l-4 border-marca-navy/30 pl-5 py-1"
              >
                <p className="text-lg italic text-slate-800 leading-relaxed">
                  “<TextoRico>{b.texto}</TextoRico>”
                </p>
                {b.autor && (
                  <footer className="mt-2 text-sm font-semibold text-slate-500">
                    — {b.autor}
                  </footer>
                )}
              </blockquote>
            );

          case "callout":
            return (
              <Callout
                key={i}
                variante={b.variante}
                titulo={b.titulo}
                texto={b.texto}
              />
            );

          case "tabla": {
            const derecha = new Set(b.alinearDerecha ?? []);
            return (
              <figure key={i} className="my-6">
                <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500">
                        {b.encabezados.map((h, j) => (
                          <th
                            key={j}
                            className={`font-bold uppercase tracking-wider text-[10px] px-4 py-2.5 ${
                              derecha.has(j) ? "text-right" : "text-left"
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {b.filas.map((fila, r) => (
                        <tr
                          key={r}
                          className="bg-white hover:bg-slate-50/60 transition-colors"
                        >
                          {fila.map((celda, c) => (
                            <td
                              key={c}
                              className={`px-4 py-2.5 tabular-nums ${
                                derecha.has(c) ? "text-right" : "text-left"
                              } ${
                                c === 0
                                  ? "font-semibold text-slate-800"
                                  : "text-slate-600"
                              }`}
                            >
                              {celda}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {b.pie && (
                  <figcaption className="mt-2 text-xs text-slate-400">
                    {b.pie}
                  </figcaption>
                )}
              </figure>
            );
          }

          case "faq":
            return (
              <section key={i} className="my-8">
                {b.titulo && (
                  <h2
                    id="preguntas-frecuentes"
                    className="pt-4 text-2xl font-black tracking-tight text-slate-900 scroll-mt-24"
                  >
                    {b.titulo}
                  </h2>
                )}
                <div className="mt-4 divide-y divide-slate-200 rounded-2xl ring-1 ring-slate-200 overflow-hidden bg-white">
                  {b.items.map((item, j) => (
                    <details
                      key={j}
                      className="group px-4 sm:px-5 py-1 open:bg-indigo-50/60"
                      open={j === 0}
                    >
                      <summary className="cursor-pointer list-none flex items-start justify-between gap-3 py-3.5 text-[15px] font-bold text-slate-800 [&::-webkit-details-marker]:hidden">
                        <span>
                          <TextoRico>{item.pregunta}</TextoRico>
                        </span>
                        <span className="mt-0.5 shrink-0 text-indigo-500 transition-transform group-open:rotate-180">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </span>
                      </summary>
                      <p className="pb-4 text-[15px] leading-relaxed text-slate-600">
                        <TextoRico>{item.respuesta}</TextoRico>
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            );

          case "cta":
            return (
              <div
                key={i}
                className="my-8 rounded-2xl bg-[radial-gradient(circle_at_15%_15%,#1e3a5f_0%,#0f1d2e_45%,#0a1424_100%)] ring-1 ring-marca-navy/40 p-6 sm:p-7 text-center shadow-xl"
              >
                <p className="text-white/90 text-base sm:text-lg font-semibold leading-relaxed max-w-lg mx-auto">
                  {b.texto}
                </p>
                <Link
                  href={b.href}
                  className="group mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-marca-navy text-sm font-bold hover:bg-slate-50 transition-all hover:-translate-y-0.5 shadow-lg"
                >
                  {b.etiquetaBoton}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            );

          case "mock":
            if (b.variante === "opinion-cumplimiento") {
              return (
                <MockOpinionCumplimiento
                  key={i}
                  titulo={b.titulo}
                  pie={b.pie}
                />
              );
            }
            if (b.variante === "efirma-vigente") {
              return (
                <MockEfirmaVigente
                  key={i}
                  titulo={b.titulo}
                  pie={b.pie}
                />
              );
            }
            if (b.variante === "vencimiento-declaracion") {
              return (
                <MockVencimientoDeclaracion
                  key={i}
                  titulo={b.titulo}
                  pie={b.pie}
                />
              );
            }
            return null;

          default:
            return null;
        }
      })}
    </div>
  );
}
