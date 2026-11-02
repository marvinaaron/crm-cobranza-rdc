"use client";

import { Suspense } from "react";
import { usePortalAuth } from "@/context/PortalAuthContext";
import HonorariosPortalView from "@/components/portal/HonorariosPortalView";
import { PortalSkeletonHonorarios } from "@/components/portal/PortalSkeleton";

export default function PortalHonorariosPage() {
  const { cliente } = usePortalAuth();
  if (!cliente) return <PortalSkeletonHonorarios />;
  return (
    <Suspense fallback={<PortalSkeletonHonorarios />}>
      <HonorariosPortalView cliente={cliente} />
    </Suspense>
  );
}
