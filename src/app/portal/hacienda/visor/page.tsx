"use client";

import VisorFiscalView from "@/components/portal/hacienda/VisorFiscalView";
import { portalPageWide } from "@/components/portal/portal-ui";

export default function HaciendaVisorPage() {
  return (
    <div className={portalPageWide}>
      <VisorFiscalView />
    </div>
  );
}
