"use client";

import { PillDeslizableEnlaces } from "@/components/ui/PillDeslizable";

const PESTANAS = [
  { href: "/portal/cumplimiento", label: "Declaraciones" },
  { href: "/portal/sat", label: "Situación fiscal" },
] as const;

export default function MiCuentaTabs() {
  return <PillDeslizableEnlaces opciones={[...PESTANAS]} acento="portal" />;
}
