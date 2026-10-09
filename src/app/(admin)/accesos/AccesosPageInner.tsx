"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AccesosSubNav, {
  buildAccesosUrl,
  parseAccesosTab,
  type AccesosTab,
} from "@/components/admin/AccesosSubNav";
import TablaContrasenasAccesos from "@/components/admin/TablaContrasenasAccesos";
import EfirmasAccesosPanel from "@/components/admin/EfirmasAccesosPanel";

export default function AccesosPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseAccesosTab(searchParams.get("tab"));

  const onTabChange = useCallback(
    (next: AccesosTab) => {
      router.replace(buildAccesosUrl(next));
    },
    [router]
  );

  return (
    <div className="space-y-6 w-full max-w-[100rem] mx-auto overflow-x-hidden">
      <header>
        <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.3em] mb-1.5">
          Despacho · Credenciales
        </p>
        <h1 className="text-2xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight">
          Accesos
        </h1>
        <p className="text-slate-400 font-bold text-xs lg:text-sm mt-1.5">
          E.firmas · Contraseñas SAT, IMSS, REPSE e INFONAVIT
        </p>
      </header>

      <AccesosSubNav tab={tab} onTabChange={onTabChange} />

      {tab === "efirmas" ? (
        <div className="-mt-2 [&_header]:hidden">
          <EfirmasAccesosPanel />
        </div>
      ) : (
        <TablaContrasenasAccesos />
      )}
    </div>
  );
}
