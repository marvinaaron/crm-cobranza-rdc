"use client";

export type AccesosTab = "efirmas" | "contrasenas";

const TABS: Array<{ id: AccesosTab; label: string }> = [
  { id: "efirmas", label: "E.firma" },
  { id: "contrasenas", label: "Contraseñas" },
];

type Props = {
  tab: AccesosTab;
  onTabChange: (tab: AccesosTab) => void;
};

export default function AccesosSubNav({ tab, onTabChange }: Props) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1 pb-0.5"
      aria-label="Secciones Accesos"
    >
      {TABS.map((item) => {
        const activo = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              activo
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export function parseAccesosTab(raw: string | null): AccesosTab {
  if (raw === "contrasenas" || raw === "efirmas") return raw;
  return "efirmas";
}

export function buildAccesosUrl(tab: AccesosTab): string {
  return tab === "efirmas" ? "/accesos" : `/accesos?tab=${tab}`;
}
