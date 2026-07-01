import { Suspense } from "react";
import AdminCfdiPage from "./AdminCfdiPage";

export default function CfdiPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto py-12 text-center text-sm font-bold text-slate-400">
          Cargando CFDI…
        </div>
      }
    >
      <AdminCfdiPage />
    </Suspense>
  );
}
