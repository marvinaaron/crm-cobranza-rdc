import { Suspense } from "react";
import HerramientasProExitoClient from "./HerramientasProExitoClient";

export default function HerramientasProExitoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-500">
          Confirmando pago…
        </div>
      }
    >
      <HerramientasProExitoClient />
    </Suspense>
  );
}
