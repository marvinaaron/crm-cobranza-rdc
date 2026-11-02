"use client";

import { Suspense } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import PortalCumplimientoVista from "@/components/portal/PortalCumplimientoVista";
import { PortalSkeletonCumplimiento } from "@/components/portal/PortalSkeleton";

export default function PortalCumplimientoPage() {
  const { cliente } = usePortalAuth();
  if (!cliente) {
    return <PortalSkeletonCumplimiento />;
  }
  return (
    <Suspense fallback={<PortalSkeletonCumplimiento />}>
      <PortalCumplimientoVista cliente={cliente} />
    </Suspense>
  );
}
