import type { RegimenSlug } from "@/lib/servicios-regimenes";

type Props = {
  slug: RegimenSlug;
  className?: string;
  size?: number;
};

export default function RegimenIcon({ slug, className = "", size = 18 }: Props) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: size > 100 ? 1.5 : 2,
    className,
    "aria-hidden": true as const,
  };

  switch (slug) {
    case "sueldos-salarios":
      return (
        <svg {...props}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <path d="M12 12v4M10 14h4" />
        </svg>
      );
    case "resico":
      return (
        <svg {...props}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "actividades-empresariales":
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "arrendamiento":
      return (
        <svg {...props}>
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "plataformas-tecnologicas":
      return (
        <svg {...props}>
          <rect x="7" y="2" width="10" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    case "rif":
      return (
        <svg {...props}>
          <path d="M4 19h16M6 16V8M10 16V5M14 16v-6M18 16v-3" />
        </svg>
      );
    case "regimen-general":
      return (
        <svg {...props}>
          <rect x="3" y="9" width="18" height="12" rx="1.5" />
          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </svg>
      );
    case "fines-no-lucrativos":
      return (
        <svg {...props}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
  }
}
