import { construirIcsMundial } from "@/lib/mundial/ics";
import { EQUIPOS } from "@/lib/mundial/datos";
import { prepararPartidosMundial } from "@/lib/mundial/preparar";
import { obtenerResultados } from "@/lib/mundial/resultados";

// Usa Buffer (plegado UTF-8) y debe revalidarse seguido para los suscriptores.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sirve el calendario .ics del Mundial 2026 para suscripción (webcal/Apple,
 * Google, Outlook) o descarga directa.
 *
 *   /api/mundial-2026                → todos los partidos
 *   /api/mundial-2026?equipo=México  → solo los de esa selección
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const equipoParam = searchParams.get("equipo");
  const equipo = equipoParam && equipoParam in EQUIPOS ? equipoParam : null;

  const resultados = await obtenerResultados();
  const partidos = prepararPartidosMundial(resultados);
  const ics = construirIcsMundial({ equipo, partidos });

  const nombreArchivo = equipo
    ? `mundial-2026-${equipo.toLowerCase().replace(/\s+/g, "-")}.ics`
    : "mundial-2026.ics";

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${nombreArchivo}"`,
      // Caché corta + revalidación para que las apps de calendario refresquen.
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
