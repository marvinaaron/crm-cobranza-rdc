"use client";

import { Suspense } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import InicioPortalView from "@/components/portal/InicioPortalView";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import { portalPage } from "@/components/portal/portal-ui";

function InicioCargando() {
  return (
    <div className={portalPage}>
      <PortalPageHeader eyebrow="Inicio" title="Cargando…" />
      <PortalSection>
        <p className="text-sm font-bold text-slate-400 text-center py-8">
          Preparando tu resumen…
        </p>
      </PortalSection>
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
