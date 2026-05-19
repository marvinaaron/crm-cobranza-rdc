"use client";

import { usePortalAuth } from "@/context/PortalAuthContext";
import PortalCumplimientoVista from "@/components/portal/PortalCumplimientoVista";

export default function PortalCumplimientoPage() {
  const { cliente } = usePortalAuth();
  if (!cliente) return null;
  return <PortalCumplimientoVista cliente={cliente} />;
}
