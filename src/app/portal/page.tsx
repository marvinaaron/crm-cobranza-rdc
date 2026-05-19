"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePortalAuth } from "@/context/PortalAuthContext";

export default function PortalIndexPage() {
  const router = useRouter();
  const { ready, session } = usePortalAuth();

  useEffect(() => {
    if (!ready) return;
    router.replace(session ? "/portal/honorarios" : "/portal/login");
  }, [ready, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-sm font-bold text-slate-400">Cargando…</p>
    </div>
  );
}
