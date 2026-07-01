"use client";

import TablaConsultaCfdi from "@/components/portal/hacienda/TablaConsultaCfdi";
import { portalPage } from "@/components/portal/portal-ui";

export default function HaciendaProveedoresPage() {
  return (
    <div className={portalPage}>
      <TablaConsultaCfdi
        vista="proveedores"
        titulo="Proveedores"
        subtitulo="CFDI recibidos de tus proveedores"
      />
    </div>
  );
}
