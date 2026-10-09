/** Colores del logotipo SUA (muestra 0–1 de mac → sRGB). */
export const SUA_S = "#050E7B"; // R 0.018 G 0.055 B 0.481 · azul
export const SUA_U = "#FEFD53"; // R 0.997 G 0.991 B 0.325 · amarillo
export const SUA_A = "#DE3D1B"; // R 0.871 G 0.238 B 0.104 · rojo

function Letra({
  children,
  color,
}: {
  children: string;
  color: string;
}) {
  return (
    <span
      className="border-b-[3px] pb-px text-slate-900"
      style={{ borderBottomColor: color }}
    >
      {children}
    </span>
  );
}

export default function PalabraSua({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="SUA"
      className={`inline-flex items-baseline gap-px font-black leading-none tracking-wide align-middle ${className}`}
    >
      <Letra color={SUA_S}>S</Letra>
      <Letra color={SUA_U}>U</Letra>
      <Letra color={SUA_A}>A</Letra>
    </span>
  );
}
