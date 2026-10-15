"use client";

import TablaConsultaCfdi from "@/components/portal/hacienda/TablaConsultaCfdi";
import { portalPageWide } from "@/components/portal/portal-ui";

export default function HaciendaClientesPage() {
  return (
    <div className={portalPageWide}>
      <TablaConsultaCfdi
        vista="clientes"
        titulo="Clientes"
        subtitulo="CFDI emitidos a tus clientes"
      />
    </div>
  );
}
