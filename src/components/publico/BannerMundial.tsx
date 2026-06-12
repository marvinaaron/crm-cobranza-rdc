import Image from "next/image";
import Link from "next/link";
import ConfetiMundial from "@/components/publico/ConfetiMundial";

/**
 * Banner temporal de la home (mientras dura el Mundial). Estética inspirada en
 * la identidad del Mundial 2026: textura oscura tipo fieltro, marco de "26" de
 * colores en los bordes, confeti cayendo y un emblema circular tipo medalla.
 * Para retirarlo al terminar el torneo basta con quitar <BannerMundial /> de
 * src/app/page.tsx.
 */

/** Icono calendario + balón (sustituye al emoji del botón). */
function IconoCalendarioBalon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M3 9.5h18" />
      <path d="M8 2.5v3M16 2.5v3" />
      <circle cx="12" cy="15" r="3.4" />
      <path
        d="M12 12.3l1.95 1.42-0.74 2.29h-2.42l-0.74-2.29z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export default function BannerMundial() {
  return (
    <section className="px-4 pt-4 pb-6 sm:px-6 sm:pt-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(124,58,237,0.55)]">
        {/* Textura de fondo (fieltro oscuro del arte oficial) */}
        <Image
          src="/mundial/textura-mundial.png"
          alt=""
          fill
          className="object-cover"
          aria-hidden
          priority
        />
        <div className="absolute inset-0 bg-[#0a0a0f]/40" aria-hidden="true" />

        {/* Confeti cayendo */}
        <ConfetiMundial />

        {/* Marco de "26" de colores en el borde izquierdo */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-14" aria-hidden="true">
          <Image src="/mundial/columna-26.png" alt="" fill className="object-cover" />
        </div>

        {/* Contenido */}
        <div className="relative flex flex-col items-center gap-7 py-8 pl-14 pr-8 text-center sm:flex-row sm:gap-9 sm:py-10 sm:pl-24 sm:pr-12 sm:text-left">
          {/* Emblema circular tipo medalla con aurora grande */}
          <div className="relative shrink-0">
            <div
              className="absolute left-1/2 top-1/2 -z-0 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-rose-500/50 via-violet-500/50 to-orange-400/50 blur-3xl sm:h-72 sm:w-72"
              aria-hidden="true"
            />
            <div
              className="absolute -inset-2 rounded-full bg-gradient-to-tr from-rose-500 via-violet-500 to-orange-400 opacity-90 blur-[4px]"
              aria-hidden="true"
            />
            <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-white shadow-2xl ring-1 ring-white/30 sm:h-40 sm:w-40">
              <Image
                src="/mundial/emblema-26.png"
                alt="Emblema del Mundial 2026"
                width={250}
                height={386}
                className="h-[78%] w-auto object-contain"
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
              className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-base font-black text-slate-900 shadow-xl shadow-black/30 transition hover:scale-[1.03] active:scale-95"
            >
              <IconoCalendarioBalon />
              Baja el calendario a tu celular
            </Link>
          </div>
        </div>

        {/* Créditos en miniatura, casi imperceptibles */}
        <p className="relative pb-6 pl-14 pr-8 text-center text-[9px] leading-relaxed text-white/25 sm:pl-24 sm:pr-12 sm:text-left">
          El emblema y la marca FIFA World Cup 26™ son propiedad de la FIFA.
          Imagen con fines ilustrativos; RDC Contadores no está afiliado ni
          patrocinado por la FIFA.
        </p>
      </div>
    </section>
  );
}
