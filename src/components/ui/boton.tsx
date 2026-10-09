import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variante = "primario" | "secundario" | "whatsapp";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  icono?: ReactNode;
  fullWidth?: boolean;
};

const ESTILOS: Record<Variante, string> = {
  primario:
    "bg-marca-navy text-white hover:bg-marca-navy-soft border border-transparent",
  secundario:
    "bg-white text-marca-navy border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
  whatsapp:
    "bg-[#25D366] text-white hover:bg-[#1ebe57] border border-transparent",
};

export function Boton({
  variante = "primario",
  icono,
  fullWidth,
  className = "",
  children,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${ESTILOS[variante]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {icono}
      {children}
    </button>
  );
}
