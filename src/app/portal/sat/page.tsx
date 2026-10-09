"use client";

import { usePortalAuth } from "@/context/PortalAuthContext";
import PortalSatView from "@/components/portal/PortalSatView";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import { portalPage } from "@/components/portal/portal-ui";

export default function PortalSatPage() {
  const { cliente } = usePortalAuth();
  if (!cliente) {
    return (
      <div className={portalPage}>
        <PortalPageHeader eyebrow="SAT" title="Cargando…" />
        <PortalSection>
          <p className="text-sm font-bold text-slate-400 text-center py-8">
            Preparando su situación fiscal…
          </p>
        </PortalSection>
      </div>
    );
  }
  return <PortalSatView cliente={cliente} />;
}
