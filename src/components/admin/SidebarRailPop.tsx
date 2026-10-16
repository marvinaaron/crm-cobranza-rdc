"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export type RailMenuItem = {
  name: string;
  href: string;
  icon: ReactNode;
  activo?: boolean;
};

const RAIL_W = 72; // lg:w-[4.5rem]

export function SidebarRailTip({
  label,
  top,
}: {
  label: string;
  top: number;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[80] px-2.5 py-1 rounded-md bg-slate-900 text-white text-[12px] font-medium shadow-lg whitespace-nowrap"
      style={{ left: RAIL_W + 8, top, transform: "translateY(-50%)" }}
    >
      {label}
    </div>,
    document.body
  );
}

export function SidebarRailMenu({
  items,
  top,
  onClose,
  onNavigate,
}: {
  items: RailMenuItem[];
  top: number;
  onClose: () => void;
  onNavigate: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPtr = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPtr);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPtr);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const maxH = typeof window !== "undefined" ? window.innerHeight - 16 : 480;
  const clampedTop = Math.max(8, Math.min(top, maxH - 80));

  return createPortal(
    <div
      ref={ref}
      role="menu"
      className="fixed z-[80] min-w-[200px] max-w-[240px] rounded-xl bg-white dark:bg-[#2c2c2e] shadow-[0_12px_40px_rgba(15,23,42,0.18)] ring-1 ring-black/10 dark:ring-white/10 py-1 overflow-hidden"
      style={{ left: RAIL_W + 8, top: clampedTop }}
    >
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          role="menuitem"
          onClick={onNavigate}
          className={`flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${
            it.activo
              ? "bg-[var(--admin-sidebar-active)] font-semibold text-slate-900 dark:text-white"
              : "font-medium text-slate-600 hover:bg-[var(--admin-sidebar-hover)] hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          }`}
        >
          <span
            className={`shrink-0 ${
              it.activo ? "text-slate-800 dark:text-white" : "text-slate-400"
            }`}
          >
            {it.icon}
          </span>
          <span className="min-w-0 truncate">{it.name}</span>
        </Link>
      ))}
    </div>,
    document.body
  );
}
