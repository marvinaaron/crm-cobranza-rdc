"use client";

import type { OrdenTablaDir } from "@/lib/tabla-orden";

function IconoOrden({ activo, dir }: { activo: boolean; dir: OrdenTablaDir }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${activo ? "opacity-100" : "opacity-30"}`}
      aria-hidden
    >
      {activo && dir === "desc" ? (
        <polyline points="6 9 12 15 18 9" />
      ) : (
        <polyline points="18 15 12 9 6 15" />
      )}
    </svg>
  );
}

type Props = {
  label: string;
  activo: boolean;
  dir: OrdenTablaDir;
  onClick: () => void;
  className?: string;
  align?: "left" | "center" | "right";
};

export default function EncabezadoOrdenable({
  label,
  activo,
  dir,
  onClick,
  className = "",
  align = "left",
}: Props) {
  const alineacion =
    align === "center"
      ? "justify-center"
      : align === "right"
        ? "justify-end"
        : "justify-start";

  return (
    <button
      type="button"
      onClick={onClick}
      title={
        activo
          ? `Orden ${dir === "asc" ? "ascendente" : "descendente"} · clic para invertir`
          : `Ordenar por ${label}`
      }
      className={`inline-flex items-center gap-0.5 w-full hover:text-violet-700 transition-colors ${alineacion} ${activo ? "text-violet-700" : ""} ${className}`}
    >
      <span>{label}</span>
      <IconoOrden activo={activo} dir={dir} />
    </button>
  );
}

export function etiquetaOrdenActivo(dir: OrdenTablaDir): string {
  return dir === "asc" ? "ascendente" : "descendente";
}
