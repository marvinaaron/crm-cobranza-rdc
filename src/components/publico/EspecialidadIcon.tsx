import type { EspecialidadSlug } from "@/lib/servicios-especialidades";

type Props = {
  slug: EspecialidadSlug;
  className?: string;
  size?: number;
  wash?: string;
};

export default function EspecialidadIcon({
  slug,
  className = "",
  size = 18,
  wash,
}: Props) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: wash ? "currentColor" : "none",
    fillOpacity: wash ? 0.22 : undefined,
    stroke: "currentColor",
    strokeWidth: 2,
    className,
    "aria-hidden": true as const,
  };

  if (slug === "repse") {
    return (
      <svg {...props}>
        <rect x="3" y="8" width="18" height="12" rx="1.5" />
        <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M9 14h6M9 17h4" />
      </svg>
    );
  }
  if (slug === "icsoe") {
    return (
      <svg {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 13h6M9 17h4" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
