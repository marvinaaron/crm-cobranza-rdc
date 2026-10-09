import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { emailTieneProHerramientas } from "@/lib/herramientas/pro-db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json({
      loggedIn: false,
      esPro: false,
      email: null,
    });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        /* read-only en GET */
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({
      loggedIn: false,
      esPro: false,
      email: null,
    });
  }

  const esClientePortal = Boolean(user.app_metadata?.clienteId);
  const esPro =
    esClientePortal || (await emailTieneProHerramientas(user.email));

  return NextResponse.json({
    loggedIn: true,
    esPro,
    email: user.email,
    esClientePortal,
  });
}
