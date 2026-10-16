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
import AdminPageHeading from "@/components/admin/AdminPageHeading";

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
      <AdminPageHeading
        titulo="Accesos"
        subtitulo="E.firmas · Contraseñas SAT, IMSS, REPSE e INFONAVIT"
      />

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
