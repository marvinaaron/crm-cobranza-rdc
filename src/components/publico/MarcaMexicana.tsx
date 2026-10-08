const VERDE = "#538B58";
const CREMA = "#EDEDE4";
const ROJO = "#DE4237";
const BARRAS = [VERDE, CREMA, ROJO] as const;

type Props = {
  className?: string;
};

/**
 * Tres barras solo delineadas (verde · crema · rojo), redondeadas,
 * inclinadas 30°. Se leen como bandera, no como isotipo.
 */
export default function MarcaMexicana({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 58 28"
      width="58"
      height="28"
      className={className}
      aria-hidden
    >
      <g transform="translate(10,0) skewX(-30) translate(6,0)">
        {BARRAS.map((color, i) => (
          <rect
            key={i}
            x={1 + i * 12.4}
            y={5}
            width="10"
            height="18"
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            rx={4}
          />
        ))}
      </g>
    </svg>
  );
}

export function SelloEmpresaMexicana() {
  return (
    <div className="flex items-center gap-2.5">
      <MarcaMexicana />
      <p className="text-[13px] font-semibold text-white leading-tight">
        Empresa 100% mexicana
      </p>
    </div>
  );
}
