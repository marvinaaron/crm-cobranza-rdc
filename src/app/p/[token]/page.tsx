import type { Metadata } from "next";
import {
  leerPresupuestoPorToken,
  marcarPresupuestoVisto,
} from "@/lib/supabase/crm-estado-db";
import { DATOS_PRESUPUESTO } from "@/lib/presupuestos";
import PresupuestoPublicoCliente from "./PresupuestoPublicoCliente";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Propuesta · ${DATOS_PRESUPUESTO.despacho}`,
  robots: { index: false, follow: false },
};

export default async function PresupuestoPublicoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const presupuesto = await leerPresupuestoPorToken(token);

  if (!presupuesto) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-slate-50">
        <div className="max-w-sm">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-2xl font-black text-slate-800">
            No encontramos esta propuesta
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Es posible que el enlace haya cambiado o expirado. Escríbenos y con
            gusto te compartimos uno nuevo.
          </p>
          <p className="text-sm font-bold text-violet-700 mt-4">
            {DATOS_PRESUPUESTO.contactoTel}
          </p>
        </div>
      </main>
    );
  }

  await marcarPresupuestoVisto(token).catch(() => {});

  return <PresupuestoPublicoCliente presupuesto={presupuesto} token={token} />;
}
