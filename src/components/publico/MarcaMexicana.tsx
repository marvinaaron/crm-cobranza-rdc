const VERDE = "#538B58";
const CREMA = "#EDEDE4";
const ROJO = "#DE4237";
const BARRAS = [VERDE, CREMA, ROJO] as const;

type Props = {
  className?: string;
};

/**
 * Tres barras cortas, solo delineadas (verde · crema · rojo),
 * redondeadas e inclinadas 30°.
 */
export default function MarcaMexicana({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 50 20"
      width="50"
      height="20"
      className={className}
      aria-hidden
    >
      <g transform="translate(7,0) skewX(-30) translate(4,0)">
        {BARRAS.map((color, i) => (
          <rect
            key={i}
            x={1 + i * 11.2}
            y={3}
            width="8.5"
            height="14"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            rx={3.4}
          />
        ))}
      </g>
    </svg>
  );
}

export function SelloEmpresaMexicana() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <MarcaMexicana />
      <p className="text-[12px] font-medium text-slate-300 leading-none whitespace-nowrap">
        Empresa 100% mexicana
      </p>
    </div>
  );
}
