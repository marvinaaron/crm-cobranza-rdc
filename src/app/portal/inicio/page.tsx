"use client";

import { Suspense } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import InicioPortalView from "@/components/portal/InicioPortalView";
import { PortalSkeletonInicio } from "@/components/portal/PortalSkeleton";

export default function PortalInicioPage() {
  const { cliente } = usePortalAuth();
  if (!cliente) return <PortalSkeletonInicio />;
  return (
    <Suspense fallback={<PortalSkeletonInicio />}>
      <InicioPortalView cliente={cliente} />
    </Suspense>
  );
}
