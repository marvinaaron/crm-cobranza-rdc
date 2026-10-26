import { Suspense } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import VolverArriba from "./VolverArriba";
import WhatsAppMano from "./WhatsAppMano";
import ModalPortalRdc from "./ModalPortalRdc";
import { getPostsParaNav } from "@/lib/blog/posts";

export default function PublicShell({
  children,
  flujo,
}: {
  children: React.ReactNode;
  flujo?: boolean;
}) {
  const blogRecientes = getPostsParaNav(3);

  return (
    <div
      className={
        flujo
          ? "h-dvh overflow-hidden flex flex-col bg-[#f6f6f6] text-slate-900"
          : "min-h-screen flex flex-col bg-white text-slate-900"
      }
    >
      <PublicHeader blogRecientes={blogRecientes} />
      <main className={flujo ? "flex-1 min-h-0 overflow-hidden" : "flex-1"}>
        {children}
      </main>
      {flujo ? null : (
        <>
          <PublicFooter />
          <Suspense fallback={null}>
            <WhatsAppMano />
          </Suspense>
          <VolverArriba />
        </>
      )}
      <ModalPortalRdc />
    </div>
  );
}
