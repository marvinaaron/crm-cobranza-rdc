import { NextResponse } from "next/server";
import { obtenerSerieInpc } from "@/lib/fiscal/inegi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const datos = await obtenerSerieInpc();
  return NextResponse.json(datos, {
    headers: {
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200",
    },
  });
}
