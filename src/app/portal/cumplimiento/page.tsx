"use client";

import { Suspense } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import PortalCumplimientoVista from "@/components/portal/PortalCumplimientoVista";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import { portalPage } from "@/components/portal/portal-ui";

function CumplimientoCargando() {
  return (
    <div className={portalPage}>
        <PortalPageHeader eyebrow="Mi cuenta" title="Declaraciones" subtitle="Cargando…" />
      <PortalSection>
        <p className="text-sm font-bold text-slate-400 text-center py-8">Cargando…</p>
      </PortalSection>
    </div>
  );
}

export default function PortalCumplimientoPage() {
  const { cliente } = usePortalAuth();
  if (!cliente) {
    return <CumplimientoCargando />;
  }
  return (
    <Suspense fallback={<CumplimientoCargando />}>
      <PortalCumplimientoVista cliente={cliente} />
    </Suspense>
  );
}
