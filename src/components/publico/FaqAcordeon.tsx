type ItemFaq = {
  pregunta: string;
  respuesta: string;
};

type Props = {
  items: ItemFaq[];
  /** id para `aria-labelledby` del encabezado externo (opcional). */
  labelledBy?: string;
};

/**
 * Acordeón de preguntas frecuentes.
 *
 * Implementado con `<details>/<summary>` nativos: sin estado de React,
 * sin JS para abrir/cerrar y accesible por defecto (teclado, lectores
 * de pantalla). Google sigue indexando las respuestas porque el
 * contenido vive en el DOM aunque esté colapsado.
 *
 * El estilo conserva el mismo "recuadro" usado en todas las
 * herramientas: blanco, ring slate-200, rounded-2xl. Solo la chevron
 * derecha rota al expandir para reforzar el feedback visual.
 */
export default function FaqAcordeon({ items, labelledBy }: Props) {
  if (items.length === 0) return null;

  return (
    <dl className="space-y-3" aria-labelledby={labelledBy}>
      {items.map((f) => (
        <details
          key={f.pregunta}
          className="group rounded-2xl ring-1 ring-slate-200 bg-white open:ring-slate-300 open:shadow-sm transition-all overflow-hidden"
        >
          <summary className="flex items-start gap-3 px-5 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-slate-50/60 transition-colors">
            <dt className="flex-1 font-bold text-slate-900 text-sm sm:text-base leading-snug">
              {f.pregunta}
            </dt>
            <span
              aria-hidden="true"
              className="mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 shrink-0 transition-transform group-open:rotate-180 group-open:bg-indigo-100 group-open:text-indigo-700"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </summary>
          <dd className="px-5 pb-4 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
            <div className="pt-3">{f.respuesta}</div>
          </dd>
        </details>
      ))}
    </dl>
  );
}
