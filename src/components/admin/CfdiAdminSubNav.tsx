"use client";

import {
  HaciendaClientesIcon,
  HaciendaProveedoresIcon,
  HaciendaVisorIcon,
} from "@/components/portal/HaciendaNav";

export type CfdiAdminTab = "visor" | "clientes" | "proveedores" | "carga";

function CargaXmlIcon({ activo, size = 18 }: { activo?: boolean; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={activo ? 2 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

const TABS: Array<{
  id: CfdiAdminTab;
  label: string;
  icon: typeof HaciendaVisorIcon;
}> = [
  { id: "visor", label: "Visor fiscal", icon: HaciendaVisorIcon },
  { id: "clientes", label: "Clientes", icon: HaciendaClientesIcon },
  { id: "proveedores", label: "Proveedores", icon: HaciendaProveedoresIcon },
  { id: "carga", label: "Carga XML", icon: CargaXmlIcon },
];

type Props = {
  tab: CfdiAdminTab;
  onTabChange: (tab: CfdiAdminTab) => void;
  disabled?: boolean;
};

export default function CfdiAdminSubNav({ tab, onTabChange, disabled }: Props) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1 pb-0.5"
      aria-label="Secciones CFDI"
    >
      {TABS.map((item) => {
        const activo = tab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onTabChange(item.id)}
            className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              activo
                ? "bg-violet-700 text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80"
            }`}
          >
            <Icon activo={activo} size={16} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export function parseCfdiAdminTab(raw: string | null): CfdiAdminTab {
  if (
    raw === "clientes" ||
    raw === "proveedores" ||
    raw === "visor" ||
    raw === "carga"
  ) {
    return raw;
  }
  return "visor";
}
