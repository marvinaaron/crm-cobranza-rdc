import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listarSiteLeads } from "@/lib/site-leads-db";

export const dynamic = "force-dynamic";

/** GET → prospectos capturados desde /empezar y formularios públicos. */
export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const leads = await listarSiteLeads();
    return NextResponse.json({ leads });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al leer prospectos." },
      { status: 500 }
    );
  }
}
