"use client";

import { usePortalAuth } from "@/context/PortalAuthContext";
import VisorFiscalView from "@/components/portal/hacienda/VisorFiscalView";
import { portalPageWide } from "@/components/portal/portal-ui";

export default function HaciendaVisorPage() {
  const { cliente } = usePortalAuth();
  return (
    <div className={portalPageWide}>
      <VisorFiscalView clienteId={cliente?.id ?? null} />
    </div>
  );
}
