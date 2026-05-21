import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { esAdmin } from "@/lib/supabase/roles";

/**
 * Segunda capa de protección (servidor): si el proxy no corre o falla,
 * ninguna página admin se renderiza sin sesión admin válida.
 * La verificación de módulos por permisos vive en el `proxy.ts`.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !esAdmin(user)) {
    redirect("/login");
  }

  return <>{children}</>;
}
