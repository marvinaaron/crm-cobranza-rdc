/**
 * Capa de confeti decorativa (CSS puro, sin JS) para las secciones del Mundial.
 *
 * Las piezas son deterministas (derivadas del índice) para que el render del
 * servidor y del cliente coincidan y no haya hidratación rota. Se posiciona en
 * absoluto, así que el contenedor padre debe ser `relative overflow-hidden`.
 */

const COLORES = [
  "#7c3aed", // morado (acento primario)
  "#9333ea", // morado magenta (acento secundario)
  "#10b981", // emerald
  "#f59e0b", // amber
  "#e3007d", // rosa mexicano (acento puntual)
  "#0ea5e9", // sky
];

function piezas(cantidad: number) {
  return Array.from({ length: cantidad }, (_, i) => {
    const left = (i * 53 + 7) % 100;
    const delay = (i % 6) * 0.65 + (i % 3) * 0.2;
    const duration = 3.6 + (i % 5) * 0.5;
    const color = COLORES[i % COLORES.length];
    const redondo = i % 4 === 0;
    return { left, delay, duration, color, redondo };
  });
}

export default function ConfetiMundial({ cantidad = 22 }: { cantidad?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {piezas(cantidad).map((p, i) => (
        <span
          key={i}
          className="mundial-confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            borderRadius: p.redondo ? "9999px" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
