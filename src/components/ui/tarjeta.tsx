import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

const PADDING = {
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Tarjeta({ children, className = "", padding = "md" }: Props) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white ${PADDING[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
