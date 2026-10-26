type Props = {
  id: string;
  size?: number;
  className?: string;
};

const base = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

/**
 * Iconos de trazo por id. Uno distinto para cada paquete y servicio,
 * con un cubo genérico si mañana llega un id nuevo — nunca reusa foto.
 */
export default function CotizarIcon({ id, size = 22, className = "" }: Props) {
  const props = {
    ...base,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className,
  };

  switch (id) {
    case "resico-facturacion":
      return (
        <svg {...props}>
          <path d="M12 3 4.5 6.5v5.2c0 4.5 3.2 7.4 7.5 9.3 4.3-1.9 7.5-4.8 7.5-9.3V6.5L12 3Z" />
          <path d="M9.2 12.2 11.1 14l3.7-4.2" />
        </svg>
      );
    case "nomina-imss":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.6 19c.5-3 2.6-4.6 5.4-4.6S14.3 16 14.8 19" />
          <circle cx="17" cy="9" r="2.3" />
          <path d="M16.2 14.4c2.1.3 3.5 1.6 4 3.6" />
        </svg>
      );
    case "contable-base":
      return (
        <svg {...props}>
          <path d="M4 6.5h16v12.2H4z" />
          <path d="M8 6.5V4.8h8v1.7" />
          <path d="M8 11h8M8 14.5h5.5" />
        </svg>
      );
    case "contable-repse":
      return (
        <svg {...props}>
          <rect x="3.5" y="8" width="17" height="12" rx="1.6" />
          <path d="M8 8V6.2A2.2 2.2 0 0 1 10.2 4h3.6A2.2 2.2 0 0 1 16 6.2V8" />
          <path d="M9 13.2h6M9 16.4h4" />
        </svg>
      );
    case "sua":
      return (
        <svg {...props}>
          <rect x="4" y="3.5" width="16" height="17" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "imss":
      return (
        <svg {...props}>
          <path d="M12 21s-7.2-4.3-7.2-10.2A4.8 4.8 0 0 1 12 7.2a4.8 4.8 0 0 1 7.2 3.6C19.2 16.7 12 21 12 21Z" />
        </svg>
      );
    case "facturacion":
      return (
        <svg {...props}>
          <path d="M14 3H7.2A1.7 1.7 0 0 0 5.5 4.7v14.6A1.7 1.7 0 0 0 7.2 21h9.6a1.7 1.7 0 0 0 1.7-1.7V8Z" />
          <path d="M14 3v5h5.3" />
          <path d="M9 13h6M9 16.4h4" />
        </svg>
      );
    case "repse":
      return (
        <svg {...props}>
          <circle cx="12" cy="11" r="6.4" />
          <circle cx="12" cy="11" r="2.4" />
          <path d="M9.2 18.8 12 16.8l2.8 2" />
        </svg>
      );
    case "icsoe-sisub":
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3.5v3M16 3.5v3M4 9.5h16" />
          <circle cx="12" cy="15" r="2.2" />
        </svg>
      );
    case "impuestos":
      return (
        <svg {...props}>
          <circle cx="7.4" cy="7.4" r="2.5" />
          <circle cx="16.6" cy="16.6" r="2.5" />
          <path d="M18.4 5.6 5.6 18.4" />
        </svg>
      );
    case "regularizacion":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.2" />
          <path d="M12 8v5" />
          <circle cx="12" cy="16.2" r="0.7" fill="currentColor" stroke="none" />
        </svg>
      );
    case "nominas":
      return (
        <svg {...props}>
          <rect x="3.5" y="6" width="17" height="12" rx="2" />
          <path d="M3.5 10h17" />
          <circle cx="8.2" cy="14.2" r="1.1" />
        </svg>
      );
    case "contabilidad":
      return (
        <svg {...props}>
          <path d="M4 19V6.5L12 4l8 2.5V19" />
          <path d="M12 4v15" />
          <path d="M4 19h16" />
        </svg>
      );
    case "anual":
      return (
        <svg {...props}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3.5v3M16 3.5v3M4 9.5h16" />
          <path d="M8 13h8M8 16.4h5" />
        </svg>
      );
    case "anual-fed":
      return (
        <svg {...props}>
          <path d="M7 7h10v13H7z" />
          <path d="M5 5h10v2" />
          <path d="M9.2 12h5.6M9.2 15.2h3.8" />
        </svg>
      );
    case "constitucion":
      return (
        <svg {...props}>
          <path d="M4 20h16" />
          <path d="M6 20V9.5L12 5l6 4.5V20" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "asesoria":
      return (
        <svg {...props}>
          <path d="M4.5 18.5 7 16H17a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v10.5Z" />
          <path d="M8.5 9.4h7M8.5 12.4h4.5" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
  }
}
