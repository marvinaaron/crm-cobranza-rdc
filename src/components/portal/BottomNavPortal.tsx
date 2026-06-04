"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BadgeSeccion } from "@/lib/notificaciones-badges";

type Props = {
  badges: Record<string, BadgeSeccion>;
  avatarUrl?: string;
  inicial: string;
};

type IconProps = { active: boolean };

const stroke = (active: boolean) => (active ? 2 : 1.5);

const HomeIcon = ({ active }: IconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke(active)} strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const CuentaIcon = ({ active }: IconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke(active)} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
);

const HonorariosIcon = ({ active }: IconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke(active)} strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
);

const EncargosIcon = ({ active }: IconProps) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke(active)} strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
);

type Tab = {
  href: string;
  label: string;
  icon?: (p: IconProps) => React.ReactElement;
  isActive: (path: string) => boolean;
  badgeKey?: string;
  profile?: boolean;
};

const TABS: Tab[] = [
  {
    href: "/portal/inicio",
    label: "Inicio",
    icon: HomeIcon,
    isActive: (p) => p === "/portal/inicio",
  },
  {
    href: "/portal/cumplimiento",
    label: "Mi Cuenta",
    icon: CuentaIcon,
    isActive: (p) => p === "/portal/cumplimiento" || p === "/portal/sat",
    badgeKey: "/portal/cumplimiento",
  },
  {
    href: "/portal/honorarios",
    label: "Honorarios",
    icon: HonorariosIcon,
    isActive: (p) => p === "/portal/honorarios",
    badgeKey: "/portal/honorarios",
  },
  {
    href: "/portal/encargos",
    label: "Encargos",
    icon: EncargosIcon,
    isActive: (p) => p === "/portal/encargos",
    badgeKey: "/portal/encargos",
  },
  {
    href: "/portal/perfil",
    label: "Perfil",
    profile: true,
    isActive: (p) => p === "/portal/perfil",
  },
];

/** Color del badge según la tab y la severidad. */
function colorBadge(tab: Tab, count: number): string {
  if (tab.href === "/portal/honorarios") {
    // Rojo si adeudo vencido (+2 meses), naranja si es el mes corriente.
    return count >= 2 ? "bg-red-500" : "bg-orange-400";
  }
  return "bg-indigo-600";
}

export default function BottomNavPortal({ badges, avatarUrl, inicial }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 dark:bg-slate-900 dark:border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      <div className="flex justify-around items-center h-16">
        {TABS.map((tab) => {
          const activo = tab.isActive(pathname);
          const badge = tab.badgeKey ? badges[tab.badgeKey] : undefined;
          const color = activo ? "text-indigo-600" : "text-slate-400";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-150"
              aria-current={activo ? "page" : undefined}
            >
              <span className={`relative ${color}`}>
                {tab.profile ? (
                  avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Perfil"
                      className={`w-7 h-7 rounded-full object-cover ${
                        activo ? "ring-2 ring-indigo-600" : "ring-1 ring-slate-200"
                      }`}
                    />
                  ) : (
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                        activo
                          ? "bg-indigo-50 text-indigo-600 ring-2 ring-indigo-600"
                          : "bg-slate-200 text-slate-600 border border-dashed border-slate-300"
                      }`}
                    >
                      {inicial}
                    </span>
                  )
                ) : (
                  tab.icon?.({ active: activo })
                )}
                {badge && badge.count > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full ${colorBadge(
                      tab,
                      badge.count
                    )} text-white text-[10px] font-bold flex items-center justify-center`}
                  >
                    {badge.count}
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] leading-none ${
                  activo ? "text-indigo-600 font-medium" : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
