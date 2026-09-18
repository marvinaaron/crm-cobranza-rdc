import type { ReactNode } from "react";

type ItemFaq = {
  pregunta: string;
  respuesta: string;
};

type Props = {
  items: ItemFaq[];
  labelledBy?: string;
};

const ICONOS: ReactNode[] = [
  <svg key="help" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>,
  <svg key="book" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>,
  <svg key="calc" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="8.01" y2="10" />
    <line x1="12" y1="10" x2="12.01" y2="10" />
    <line x1="16" y1="10" x2="16.01" y2="10" />
    <line x1="8" y1="14" x2="8.01" y2="14" />
    <line x1="12" y1="14" x2="12.01" y2="14" />
    <line x1="16" y1="14" x2="16.01" y2="14" />
    <line x1="8" y1="18" x2="8.01" y2="18" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
    <line x1="16" y1="18" x2="16.01" y2="18" />
  </svg>,
  <svg key="clock" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>,
  <svg key="file" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>,
];

/**
 * Preguntas siempre visibles, con icono. Sin acordeón: se leen como
 * secciones del blog, no como un menú que hay que abrir.
 */
export default function FaqSecciones({ items, labelledBy }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3" aria-labelledby={labelledBy}>
      {items.map((faq, idx) => (
        <article
          key={faq.pregunta}
          className="flex items-start gap-4 rounded-2xl bg-white ring-1 ring-slate-200 px-4 py-4 sm:px-5"
        >
          <div
            className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0"
            aria-hidden
          >
            {ICONOS[idx % ICONOS.length]}
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-black text-slate-900 leading-snug">
              {faq.pregunta}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              {faq.respuesta}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
