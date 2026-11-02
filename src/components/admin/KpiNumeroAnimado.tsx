"use client";

import { useCountUp } from "@/hooks/useCountUp";

type Props = {
  value: number;
  /** Sin signo de pesos (conteos: clientes, comprobantes…). */
  esCantidad?: boolean;
  /** Sufijo % (p. ej. tasa de cobranza). */
  esPct?: boolean;
  className?: string;
};

/** KPI admin: sube de 0 al valor (~650 ms). */
export default function KpiNumeroAnimado({
  value,
  esCantidad = false,
  esPct = false,
  className,
}: Props) {
  const n = useCountUp(value);
  const entero = Math.round(n);
  const texto = esPct
    ? `${entero}%`
    : esCantidad
      ? entero.toLocaleString("es-MX")
      : `$${entero.toLocaleString("es-MX")}`;
  return <span className={className}>{texto}</span>;
}
