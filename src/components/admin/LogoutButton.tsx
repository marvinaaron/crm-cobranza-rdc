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
  const { efectivoExpandido } = useSidebarColapso();

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
      title={!efectivoExpandido ? "Cerrar sesión" : undefined}
      className={`flex w-full items-center rounded-xl text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100 disabled:opacity-50 ${
        efectivoExpandido ? "space-x-3 p-3" : "justify-center p-2.5"
      }`}
    >
      <span>
        <LogOutIcon />
      </span>
      {efectivoExpandido && (
        <span className="font-semibold text-[13px]">
          {pending ? "Cerrando…" : "Cerrar sesión"}
        </span>
      )}
    </button>
  );
}
