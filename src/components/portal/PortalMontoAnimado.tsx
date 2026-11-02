"use client";

import { fmtMxn } from "@/components/portal/portal-ui";
import { useCountUp } from "@/hooks/useCountUp";

type Props = {
  value: number;
  decimals?: number;
  className?: string;
};

/** Monto MXN que sube de 0 al valor real (portal cliente). */
export default function PortalMontoAnimado({
  value,
  decimals = 0,
  className,
}: Props) {
  const n = useCountUp(value);
  return <span className={className}>{fmtMxn(n, decimals)}</span>;
}
