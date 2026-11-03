import AdminPageSkeleton from "@/components/admin/AdminPageSkeleton";

/**
 * Fallback inmediato al navegar entre rutas admin (Cobranza → Clientes, etc.).
 * El shell (sidebar / top bar) se queda; solo el main muestra skeleton.
 */
export default function AdminLoading() {
  return <AdminPageSkeleton />;
}
