"use client";

import TablaConsultaCfdi from "@/components/portal/hacienda/TablaConsultaCfdi";
import { portalPage } from "@/components/portal/portal-ui";

export default function HaciendaClientesPage() {
  return (
    <div className={portalPage}>
      <TablaConsultaCfdi
        vista="clientes"
        titulo="Clientes"
        subtitulo="CFDI emitidos a tus clientes"
      />
    </div>
  );
}
