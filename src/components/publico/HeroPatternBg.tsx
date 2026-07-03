import Image from "next/image";
import type { ReactNode } from "react";

export default function HeroPatternBg({
  icon,
  heroFrom,
  heroTo,
}: {
  icon?: ReactNode;
  heroFrom: string;
  heroTo: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Eagle image — no mask, full presence */}
      <Image
        src="/pattern/aguila-mx.png"
        alt=""
        width={900}
        height={900}
        className="absolute -right-[5%] -bottom-[15%] w-[550px] sm:w-[650px] lg:w-[800px] h-auto brightness-0 invert opacity-[0.20] sm:opacity-[0.24] select-none -scale-x-100"
        priority
      />

      {/* Full-width color overlay on top of eagle.
          Solid from the left up to ~50%, then fades to transparent toward the right */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${heroFrom} ${heroTo}`}
        style={{
          maskImage:
            "linear-gradient(to right, black 0%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, black 0%, black 50%, transparent 100%)",
        }}
      />

      {/* Large decorative icon — bottom-left, cropped by overflow:hidden */}
      {icon ? (
        <div className="absolute -left-[8%] -bottom-[20%] w-[280px] sm:w-[360px] lg:w-[440px] h-auto text-white/[0.07] sm:text-white/[0.09]">
          {icon}
        </div>
      ) : null}
    </div>
  );
}
