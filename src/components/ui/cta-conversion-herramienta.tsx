import Link from "next/link";

type Props = {
  titulo?: string;
  subtitulo?: string;
};

export default function CtaConversionHerramienta({
  titulo = "¿Cansado de calcular esto cada mes?",
  subtitulo = "Tu contador y portal en un solo lugar. Cotización sin compromiso.",
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <p className="text-sm font-bold text-slate-900">{titulo}</p>
      <p className="mt-1 text-xs text-slate-500 leading-relaxed">{subtitulo}</p>
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Link
          href="/cotizar"
          className="inline-flex h-10 items-center justify-center px-4 rounded-lg bg-marca-navy text-white text-sm font-semibold hover:bg-marca-navy-soft transition-colors"
        >
          Cotizar ahora
        </Link>
        <Link
          href="/contacto"
          className="inline-flex h-10 items-center justify-center px-4 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Hablar por WhatsApp
        </Link>
      </div>
    </div>
  );
}
