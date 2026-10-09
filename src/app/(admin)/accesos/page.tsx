import { Suspense } from "react";
import AccesosPageInner from "./AccesosPageInner";

export default function AccesosPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center py-12 text-slate-400 font-bold text-sm">Cargando…</p>
      }
    >
      <AccesosPageInner />
    </Suspense>
  );
}
