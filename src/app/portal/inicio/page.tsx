"use client";

import { Suspense } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import InicioPortalView from "@/components/portal/InicioPortalView";
import { portalInicioPage } from "@/components/portal/portal-ui";

function InicioCargando() {
  return (
    <div className={portalInicioPage}>
      <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-slate-900 px-1">
        Cargando…
      </h1>
      <p className="text-[15px] text-slate-400 px-1">Preparando tu resumen.</p>
    </div>
  );
}

export default function PortalInicioPage() {
  const { cliente } = usePortalAuth();
  if (!cliente) return <InicioCargando />;
  return (
    <Suspense fallback={<InicioCargando />}>
      <InicioPortalView cliente={cliente} />
    </Suspense>
  );
}
