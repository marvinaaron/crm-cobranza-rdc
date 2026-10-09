"use client";

import VisorFiscalView from "@/components/portal/hacienda/VisorFiscalView";
import { portalPage } from "@/components/portal/portal-ui";

export default function HaciendaVisorPage() {
  return (
    <div className={portalPage}>
      <VisorFiscalView />
    </div>
  );
}
