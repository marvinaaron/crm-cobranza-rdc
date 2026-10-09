import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enviarPushATodosLosAdmins } from "@/lib/push/server";
import { fechaNacimientoDeRFC } from "@/lib/clientes";
import type { SnapshotCliente } from "@/lib/supabase/portal-acceso";

export const runtime = "nodejs";
// Sin caché; cada ejecución debe consultar el estado real de Auth.
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/cumpleanos
 *
 * Cron diario (configurado en `vercel.json`). Cada mañana revisa qué
 * clientes del portal cumplen años (o aniversario, si son persona moral)
 * el día actual en zona horaria de Ciudad de México, y envía una
 * notificación push a todos los admins suscritos.
 *
 * El cron NO envía el correo automáticamente. Es semi-automático:
 * cuando el admin toca la notificación, abre `/clientes?destacar=<id>`
 * y desde ahí presiona el botón de felicitar (que llama a
 * `/api/admin/cumpleanos`). Así el admin siempre revisa antes de mandar.
 *
 * Seguridad: requiere header `Authorization: Bearer ${CRON_SECRET}`,
 * que es el estándar de Vercel Cron Jobs.
 *
 * Limitación: solo detecta clientes con cuenta en el portal (snapshot en
 * Supabase Auth). Los demás siguen disponibles vía el botón manual.
 */
export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET?.trim();
  const provided = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const hoyCdmx = ahoraEnCdmx();
  const mesHoy = hoyCdmx.getMonth();
  const diaHoy = hoyCdmx.getDate();

  const admin = getSupabaseAdmin();
  const candidatos: Array<{ clienteId: number; razonSocial: string }> = [];

  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) {
      return NextResponse.json(
        { error: `Error listando usuarios: ${error.message}` },
        { status: 500 }
      );
    }
    for (const user of data.users) {
      const meta = (user.app_metadata ?? {}) as Record<string, unknown>;
      if (meta.rol !== "cliente") continue;
      const snapshot = meta.snapshot as SnapshotCliente | undefined;
      if (!snapshot || snapshot.activo === false) continue;
      if (snapshot.esIngresoGeneral === true) continue;
      const fecha = fechaNacimientoDeRFC(
        snapshot.rfc,
        snapshot.esPersonaMoral === true
      );
      if (!fecha) continue;
      if (fecha.mes !== mesHoy || fecha.dia !== diaHoy) continue;
      const clienteIdMeta = meta.clienteId;
      const clienteId =
        typeof clienteIdMeta === "number"
          ? clienteIdMeta
          : typeof clienteIdMeta === "string"
            ? Number(clienteIdMeta)
            : NaN;
      if (!Number.isFinite(clienteId)) continue;
      candidatos.push({
        clienteId,
        razonSocial: snapshot.razonSocial || "Cliente",
      });
    }
    if (data.users.length < 200) break;
  }

  if (candidatos.length === 0) {
    return NextResponse.json({ ok: true, notificados: 0, candidatos: [] });
  }

  let totalAdminsNotificados = 0;
  for (const cand of candidatos) {
    const resultado = await enviarPushATodosLosAdmins({
      title: "🎂 Hoy cumple un cliente",
      body: `${cand.razonSocial} celebra hoy. Toca para enviarle la felicitación.`,
      url: `/clientes?destacar=${cand.clienteId}`,
      tag: `cumple-${cand.clienteId}-${hoyCdmx.getFullYear()}`,
      requireInteraction: true,
      data: {
        tipo: "cumpleanos_admin",
        clienteId: cand.clienteId,
      },
    });
    totalAdminsNotificados += resultado.enviadas;
  }

  return NextResponse.json({
    ok: true,
    notificados: candidatos.length,
    candidatos,
    pushEnviadas: totalAdminsNotificados,
  });
}

/**
 * Devuelve la fecha actual ajustada a zona horaria de Ciudad de México
 * (UTC-6 estándar, UTC-5 en horario de verano). En vez de implementar
 * DST manualmente, usamos `Intl.DateTimeFormat` para preguntarle a la
 * runtime cuál es el día/mes "hoy" en CDMX.
 */
function ahoraEnCdmx(): Date {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (tipo: string) =>
    Number(parts.find((p) => p.type === tipo)?.value ?? "0");
  return new Date(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute")
  );
}
