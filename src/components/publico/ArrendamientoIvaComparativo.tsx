function IconoCasa({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect
        x="134"
        y="26"
        width="16"
        height="40"
        rx="2"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M24 82 L100 20 L176 82"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M24 82 L100 20 L176 82"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <rect
        x="44"
        y="82"
        width="112"
        height="66"
        rx="7"
        fill="currentColor"
        opacity="0.1"
      />
      <rect
        x="44"
        y="82"
        width="112"
        height="66"
        rx="7"
        stroke="currentColor"
        strokeWidth="5.5"
      />
      <rect
        x="84"
        y="108"
        width="32"
        height="40"
        rx="3"
        fill="currentColor"
        opacity="0.28"
      />
      <rect
        x="56"
        y="96"
        width="20"
        height="20"
        rx="3"
        stroke="currentColor"
        strokeWidth="4"
      />
      <rect
        x="124"
        y="96"
        width="20"
        height="20"
        rx="3"
        stroke="currentColor"
        strokeWidth="4"
      />
    </svg>
  );
}

function IconoLocal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M26 72 L36 40 H164 L174 72 Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M26 72 L36 40 H164 L174 72 Z"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinejoin="round"
      />
      <path
        d="M52 40 v32 M76 40 v32 M100 40 v32 M124 40 v32 M148 40 v32"
        stroke="currentColor"
        strokeWidth="4"
        opacity="0.4"
      />
      <rect
        x="40"
        y="72"
        width="120"
        height="76"
        rx="7"
        fill="currentColor"
        opacity="0.1"
      />
      <rect
        x="40"
        y="72"
        width="120"
        height="76"
        rx="7"
        stroke="currentColor"
        strokeWidth="5.5"
      />
      <rect
        x="52"
        y="88"
        width="54"
        height="36"
        rx="3"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path d="M79 88 v36" stroke="currentColor" strokeWidth="4" />
      <rect
        x="118"
        y="100"
        width="28"
        height="48"
        rx="3"
        fill="currentColor"
        opacity="0.28"
      />
    </svg>
  );
}

export default function ArrendamientoIvaComparativo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <article className="relative overflow-hidden rounded-[1.25rem] bg-[#f2f2f7] px-4 py-4">
        <div className="absolute top-3 right-3 flex size-16 items-center justify-center rounded-xl bg-[#F8E0D4] text-[#3C1A16]">
          <IconoCasa className="h-14 w-[4.5rem]" />
        </div>
        <p className="pr-[4.75rem] text-[11px] font-bold uppercase tracking-[0.14em] text-[#B04A28]">
          Casa habitación
        </p>
        <p className="mt-1 pr-[4.75rem] text-[28px] font-black tracking-tight leading-none text-[#3C1A16]">
          Exento
        </p>
        <ul className="mt-3 space-y-1.5 text-[14px] text-slate-600 leading-snug">
          <li>Vivienda para habitar, sin amueblar ni hospedaje.</li>
          <li>El CFDI no lleva IVA ni retención de IVA.</li>
        </ul>
        <div className="mt-4 rounded-2xl bg-[#3C1A16] px-3.5 py-3 text-white">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#E8895A]">
            No es tasa 0%
          </p>
          <p className="mt-1 text-[13px] leading-snug text-white/90">
            Es exento: no cobras IVA y no lo acreditas. En tasa 0% sí
            acreditas; aquí no.
          </p>
        </div>
      </article>

      <article className="relative overflow-hidden rounded-[1.25rem] bg-[#f2f2f7] px-4 py-4">
        <div className="absolute top-3 right-3 flex size-16 items-center justify-center rounded-xl bg-[#3C1A16] text-[#E8895A]">
          <IconoLocal className="h-14 w-[4.5rem]" />
        </div>
        <p className="pr-[4.75rem] text-[11px] font-bold uppercase tracking-[0.14em] text-[#B04A28]">
          Arrendamiento comercial
        </p>
        <p className="mt-1 pr-[4.75rem] text-[28px] font-black tracking-tight leading-none text-[#3C1A16]">
          IVA 16%
        </p>
        <ul className="mt-3 space-y-1.5 text-[14px] text-slate-600 leading-snug">
          <li>Local, oficina, bodega o casa amueblada.</li>
          <li>Trasladas 16%. Si te paga una PM, retiene 2/3.</li>
        </ul>
        <div className="mt-4 rounded-2xl bg-white px-3.5 py-3 ring-1 ring-black/[0.04]">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#B04A28]">
            El ISR no cambia
          </p>
          <p className="mt-1 text-[13px] leading-snug text-slate-600">
            El 35% o los CFDI siguen en el ISR. El uso del inmueble solo
            decide el IVA.
          </p>
        </div>
      </article>
    </div>
  );
}
