import Image from "next/image";

export default function HeroPatternBg({
  heroFrom,
  heroTo,
}: {
  heroFrom: string;
  heroTo: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <Image
        src="/pattern/aguila-mx.png"
        alt=""
        width={900}
        height={900}
        className="absolute -right-[5%] -bottom-[15%] w-[550px] sm:w-[650px] lg:w-[800px] h-auto brightness-0 invert opacity-[0.20] sm:opacity-[0.24] select-none -scale-x-100"
        priority
      />

      <div
        className={`absolute inset-0 bg-gradient-to-br ${heroFrom} ${heroTo}`}
        style={{
          maskImage:
            "linear-gradient(to right, black 0%, black 50%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, black 0%, black 50%, transparent 100%)",
        }}
      />

      <div
        className="absolute -left-[28%] top-1/2 w-[550px] sm:w-[650px] lg:w-[800px] -translate-y-1/2"
        style={{
          opacity: 0.05,
          maskImage:
            "linear-gradient(to right, black 70%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, black 70%, transparent 100%)",
        }}
      >
        <Image
          src="/pattern/calendario-azteca.png"
          alt=""
          width={1400}
          height={1400}
          className="w-full h-auto select-none"
          priority
        />
      </div>
    </div>
  );
}
