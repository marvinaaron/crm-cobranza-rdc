"use client";

import PillDeslizable from "@/components/ui/PillDeslizable";

export type AccesosTab = "efirmas" | "contrasenas";

type Props = {
  tab: AccesosTab;
  onTabChange: (tab: AccesosTab) => void;
};

export default function AccesosSubNav({ tab, onTabChange }: Props) {
  return (
    <PillDeslizable
      acento="claro"
      className="mb-2 max-w-md"
      value={tab}
      onChange={onTabChange}
      opciones={[
        { value: "efirmas", label: "E.firma" },
        { value: "contrasenas", label: "Contraseñas" },
      ]}
    />
  );
}

export function parseAccesosTab(raw: string | null): AccesosTab {
  if (raw === "contrasenas" || raw === "efirmas") return raw;
  return "efirmas";
}

export function buildAccesosUrl(tab: AccesosTab): string {
  return tab === "efirmas" ? "/accesos" : `/accesos?tab=${tab}`;
}
