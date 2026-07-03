import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  COOKIE_USO_LOCAL,
  COOKIE_VISITOR,
  esCalculadoraId,
  nuevoVisitorId,
  type CalculadoraId,
} from "@/lib/herramientas/uso-calculadora";
import {
  obtenerEstadoCalculadora,
  parseContadoresLocal,
  registrarCalculoCalculadora,
  serializarContadoresLocal,
} from "@/lib/herramientas/uso-calculadora-db";
import { emailTieneProHerramientas } from "@/lib/herramientas/pro-db";

export const dynamic = "force-dynamic";

async function resolverEsPro(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return false;
  if (user.app_metadata?.clienteId) return true;
  return emailTieneProHerramientas(user.email);
}

function ensureVisitor(jar: Awaited<ReturnType<typeof cookies>>) {
  let visitorId = jar.get(COOKIE_VISITOR)?.value;
  const setVisitor = !visitorId;
  if (!visitorId) visitorId = nuevoVisitorId();
  return { visitorId, setVisitor };
}

function readLocal(jar: Awaited<ReturnType<typeof cookies>>) {
  return parseContadoresLocal(jar.get(COOKIE_USO_LOCAL)?.value);
}

function attachCookies(
  res: NextResponse,
  opts: {
    setVisitor?: boolean;
    visitorId?: string;
    contadoresLocal?: ReturnType<typeof parseContadoresLocal>;
    writeLocal?: boolean;
  }
) {
  if (opts.setVisitor && opts.visitorId) {
    res.cookies.set(COOKIE_VISITOR, opts.visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
  }
  if (opts.writeLocal && opts.contadoresLocal) {
    res.cookies.set(COOKIE_USO_LOCAL, serializarContadoresLocal(opts.contadoresLocal), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
  }
  return res;
}

export async function GET(req: NextRequest) {
  const herramienta = req.nextUrl.searchParams.get("herramienta");
  if (!herramienta || !esCalculadoraId(herramienta)) {
    return NextResponse.json({ error: "Herramienta no válida." }, { status: 400 });
  }

  const jar = await cookies();
  const { visitorId, setVisitor } = ensureVisitor(jar);
  const esPro = await resolverEsPro();
  const local = readLocal(jar);
  const estado = await obtenerEstadoCalculadora(
    visitorId,
    herramienta as CalculadoraId,
    esPro,
    local
  );

  return attachCookies(NextResponse.json(estado), {
    setVisitor,
    visitorId,
  });
}

export async function POST(req: NextRequest) {
  let body: { herramienta?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const herramienta = body.herramienta;
  if (!herramienta || !esCalculadoraId(herramienta)) {
    return NextResponse.json({ error: "Herramienta no válida." }, { status: 400 });
  }

  const jar = await cookies();
  const { visitorId, setVisitor } = ensureVisitor(jar);
  const esPro = await resolverEsPro();
  const local = readLocal(jar);

  const antes = await obtenerEstadoCalculadora(
    visitorId,
    herramienta as CalculadoraId,
    esPro,
    local
  );

  if (!antes.puedeCalcular) {
    return attachCookies(
      NextResponse.json(
        {
          error: "Límite de consultas alcanzado. Desbloquea Cliente Pro.",
          uso: antes,
          bloqueado: true,
        },
        { status: 402 }
      ),
      { setVisitor, visitorId }
    );
  }

  const { estado, contadoresLocal } = await registrarCalculoCalculadora(
    visitorId,
    herramienta as CalculadoraId,
    esPro,
    local
  );

  const writeLocal = Object.keys(contadoresLocal).length > 0;

  return attachCookies(NextResponse.json({ ok: true, uso: estado }), {
    setVisitor,
    visitorId,
    contadoresLocal,
    writeLocal,
  });
}
