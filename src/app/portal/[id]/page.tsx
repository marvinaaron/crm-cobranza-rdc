"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Enlaces antiguos /portal/123 redirigen al login con sugerencia de usuario. */
export default function PortalLegacyRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    if (id) {
      router.replace(`/portal/login?cliente=${id}`);
    } else {
      router.replace("/portal/login");
    }
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-sm font-bold text-slate-400">Redirigiendo al inicio de sesión…</p>
    </div>
  );
}
