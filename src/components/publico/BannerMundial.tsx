import Image from "next/image";
import Link from "next/link";

/**
 * Banner temporal de la home (mientras dura el Mundial). Estética inspirada en
 * la identidad vibrante del Mundial 2026 / Draftea: fondo negro elegante con
 * acentos de color (franjas diagonales + halo morado) y un emblema circular del
 * "26" tipo medalla. Para retirarlo al terminar el torneo basta con quitar
 * <BannerMundial /> de src/app/page.tsx.
 */

const FRANJAS = [
  { color: "#f43f5e", w: "w-6" },
  { color: "#8b5cf6", w: "w-4" },
  { color: "#22c55e", w: "w-8" },
  { color: "#f97316", w: "w-5" },
  { color: "#3b82f6", w: "w-3" },
];

export default function BannerMundial() {
  return (
    <section className="px-4 pt-4 pb-6 sm:px-6 sm:pt-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f] px-6 py-8 shadow-[0_30px_80px_-30px_rgba(124,58,237,0.55)] sm:px-10 sm:py-10">
        {/* Halo morado para profundidad (Draftea) */}
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-fuchsia-600/20 blur-3xl"
          aria-hidden="true"
        />

        {/* Franjas vibrantes diagonales en el borde derecho (estilo FIFA 26) */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden translate-x-10 -skew-x-12 items-stretch gap-3 sm:flex"
          aria-hidden="true"
        >
          {FRANJAS.map((f, i) => (
            <div
              key={i}
              className={`${f.w} h-full`}
              style={{ backgroundColor: f.color, opacity: 0.9 }}
            />
          ))}
        </div>

        {/* Velo oscuro para mantener legible el texto sobre las franjas */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center gap-7 text-center sm:flex-row sm:gap-9 sm:text-left">
          {/* Emblema circular tipo medalla */}
          <div className="relative shrink-0">
            <div
              className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-rose-500 via-violet-500 to-orange-400 opacity-90 blur-[3px]"
              aria-hidden="true"
            />
            <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white shadow-2xl ring-1 ring-white/30 sm:h-40 sm:w-40">
              <Image
                src="/mundial/emblema-26.png"
                alt="Emblema del Mundial 2026"
                width={500}
                height={500}
                className="h-[80%] w-[80%] object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500/25 to-rose-500/25 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white ring-1 ring-white/15">
              ⚽ Edición Mundial 2026
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
              RDC te acompaña en el{" "}
              <span className="font-display bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">
                Mundial 2026
              </span>
            </h2>
            <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-white/60 sm:mx-0 sm:text-base">
              Llévate todos los partidos en tu calendario. Te regalamos el
              fixture completo con horarios de México que se actualiza solo.
            </p>
            <Link
              href="/mundial-2026"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-black text-white shadow-xl shadow-violet-600/40 transition hover:scale-[1.03] active:scale-95"
            >
              📲 Baja el calendario a tu celular
            </Link>
          </div>
        </div>

        {/* Créditos en miniatura, casi imperceptibles */}
        <p className="relative mt-7 text-center text-[9px] leading-relaxed text-white/25 sm:text-left">
          El emblema y la marca FIFA World Cup 26™ son propiedad de la FIFA.
          Imagen con fines ilustrativos; RDC Contadores no está afiliado ni
          patrocinado por la FIFA.
        </p>
      </div>
    </section>
  );
}
