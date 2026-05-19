"use client";

import { Suspense } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import HonorariosPortalView from "@/components/portal/HonorariosPortalView";

export default function PortalHonorariosPage() {
  const { cliente } = usePortalAuth();
  if (!cliente) return null;
  return (
    <Suspense fallback={null}>
      <HonorariosPortalView cliente={cliente} />
    </Suspense>
  );
}
