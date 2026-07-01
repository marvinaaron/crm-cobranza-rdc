"use client";

import { usePortalAuth } from "@/context/PortalAuthContext";
import PortalCfdiVisor from "@/components/portal/PortalCfdiVisor";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import { portalPage } from "@/components/portal/portal-ui";

export default function PortalCfdiPage() {
  const { cliente } = usePortalAuth();
  if (!cliente) {
    return (
      <div className={portalPage}>
        <PortalPageHeader eyebrow="SAT" title="Comprobantes CFDI" subtitle="Cargando…" />
        <PortalSection>
          <p className="text-sm font-bold text-slate-400 text-center py-8">
            Preparando visor de comprobantes…
          </p>
        </PortalSection>
      </div>
    );
  }
  return <PortalCfdiVisor />;
}
