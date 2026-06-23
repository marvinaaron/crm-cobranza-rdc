import Image from "next/image";
import Link from "next/link";
import ConfetiMundial from "@/components/publico/ConfetiMundial";

function IconoCalendarioBalon() {
  return (
    <svg
      width="20"
      height="20"
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
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] bg-[#1d1d1f] text-white ring-1 ring-black/[0.08]">
        <ConfetiMundial />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-14"
          aria-hidden="true"
        >
          <Image src="/mundial/columna-26.png" alt="" fill className="object-cover" />
        </div>

        <div className="relative flex flex-col items-center gap-6 py-8 pl-14 pr-8 text-center sm:flex-row sm:gap-8 sm:py-10 sm:pl-24 sm:pr-12 sm:text-left">
          <div className="relative shrink-0">
            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white sm:h-36 sm:w-36">
              <Image
                src="/mundial/emblema-26.png"
                alt="Emblema del Mundial 2026"
                width={250}
                height={386}
                className="h-[78%] w-auto object-contain"
              />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
              Mundial 2026
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Calendario completo en tu celular
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400 sm:mx-0">
              Fixture con horarios de México que se actualiza solo. Gratis, cortesía de RDC.
            </p>
            <Link
              href="/mundial-2026"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <IconoCalendarioBalon />
              Agregar al calendario
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
