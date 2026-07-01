"use client";

import { usePathname, useRouter } from "next/navigation";
import PillDeslizable from "@/components/ui/PillDeslizable";

const PESTANAS = [
  { href: "/portal/cumplimiento", label: "Declaraciones" },
  { href: "/portal/sat", label: "Situación fiscal" },
] as const;

export default function MiCuentaTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const activo =
    PESTANAS.find(
      (p) => pathname === p.href || pathname.startsWith(`${p.href}/`)
    )?.href ?? PESTANAS[0].href;

  return (
    <PillDeslizable
      opciones={PESTANAS.map((p) => ({ value: p.href, label: p.label }))}
      value={activo}
      onChange={(href) => router.push(href)}
      acento="portal"
    />
  );
}
