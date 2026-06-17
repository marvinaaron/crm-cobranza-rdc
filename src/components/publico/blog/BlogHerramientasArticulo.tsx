import BlogToolCard, {
  type HerramientaDestacada,
} from "@/components/publico/blog/BlogToolCard";

type Props = {
  herramienta?: HerramientaDestacada;
  /** Herramienta previa en el flujo (ej. RFC antes de vencimiento). */
  herramientaComplementaria?: HerramientaDestacada;
  compacto?: boolean;
};

function ConectorHerramientas() {
  return (
    <div
      className="relative flex flex-col items-center py-2"
      aria-hidden="true"
    >
      <div className="h-5 w-px bg-gradient-to-b from-indigo-300 via-violet-300 to-amber-300" />
      <span className="mt-1 rounded-full bg-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ring-1 ring-slate-200 shadow-sm">
        luego
      </span>
      <div className="mt-1 h-5 w-px bg-gradient-to-b from-amber-300 to-amber-500/50" />
    </div>
  );
}

/**
 * Sidebar / bloque móvil con una o dos herramientas enlazadas en secuencia.
 * Pensado para artículos donde una herramienta depende de la otra (RFC → vencimiento).
 */
export default function BlogHerramientasArticulo({
  herramienta,
  herramientaComplementaria,
  compacto = false,
}: Props) {
  if (!herramienta && !herramientaComplementaria) return null;

  return (
    <div className="space-y-0">
      {herramientaComplementaria && (
        <BlogToolCard
          herramienta={herramientaComplementaria}
          compacto={compacto}
          variante="complementaria"
        />
      )}
      {herramientaComplementaria && herramienta && <ConectorHerramientas />}
      {herramienta && (
        <BlogToolCard
          herramienta={herramienta}
          compacto={compacto}
          variante="principal"
        />
      )}
    </div>
  );
}
