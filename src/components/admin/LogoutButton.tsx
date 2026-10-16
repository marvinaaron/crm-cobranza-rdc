"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { RUTA_LOGIN_ADMIN } from "@/lib/auth/rutas";
import { useSidebarColapso } from "@/components/admin/SidebarColapsoContext";

const LogOutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const { colapsado } = useSidebarColapso();

  async function handleLogout() {
    setPending(true);
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
      router.push(RUTA_LOGIN_ADMIN);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={pending}
      className="flex w-full items-center gap-3 h-10 px-3 rounded-[8px] overflow-hidden text-slate-400 transition-colors hover:bg-[var(--admin-sidebar-hover)] hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100 disabled:opacity-50"
    >
      <span className="w-9 h-9 shrink-0 flex items-center justify-center">
        <LogOutIcon />
      </span>
      <span
        className={`min-w-0 whitespace-nowrap font-semibold text-[13px] pr-3 transition-opacity duration-200 ${
          colapsado ? "opacity-0" : "opacity-100"
        }`}
      >
        {pending ? "Cerrando…" : "Cerrar sesión"}
      </span>
    </button>
  );
}
