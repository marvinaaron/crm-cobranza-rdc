import { NextResponse } from "next/server";
import { guardarSiteLead } from "@/lib/site-leads-db";
import {
  ipDeRequest,
  ipExcedioLimite,
  validarLeadPublico,
} from "@/lib/leads-publicos";
import { enviarPushATodosLosAdmins } from "@/lib/push/server";
import { partirMensajeLead } from "@/lib/lead-mensaje";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/publico/empezar
 * Registra un prospecto desde /empezar u otros formularios públicos.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const validado = validarLeadPublico(body);
  if (!validado.ok) {
    if (validado.error === "honeypot") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: validado.error }, { status: 400 });
  }

  const ip = ipDeRequest(req);
  if (ipExcedioLimite(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta más tarde o escríbenos por WhatsApp." },
      { status: 429 }
    );
  }

  const resultado = await guardarSiteLead({
    nombre: validado.data.nombre,
    email: validado.data.email,
    telefono: validado.data.telefono,
    mensaje: validado.data.mensaje,
    fuente: validado.data.fuente,
    ingresosMensuales: validado.data.ingresosMensuales,
    ingresosMas300: validado.data.ingresosMas300,
    cfdiMensuales: validado.data.cfdiMensuales,
    cfdiMas50: validado.data.cfdiMas50,
  });

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: 503 });
  }

  const lead = resultado.lead;
  if (lead) {
    const partido = partirMensajeLead(lead.mensaje);
    const excerpt =
      (partido.libre || lead.mensaje || "").replace(/\s+/g, " ").slice(0, 140);
    try {
      await enviarPushATodosLosAdmins({
        title: "¡Nuevo prospecto!",
        body: excerpt
          ? `${lead.nombre}: ${excerpt}`
          : `${lead.nombre} acaba de pedir cotización.`,
        url: "/prospectos",
        tag: `prospecto-${lead.id}`,
        renotify: true,
        requireInteraction: true,
        actions: [
          { action: "abrir", title: "Ver prospecto" },
        ],
        data: {
          url: "/prospectos",
          actionUrls: { abrir: "/prospectos" },
          tipo: "admin_prospecto_nuevo",
          leadId: lead.id,
        },
      });
    } catch {
      // El alta del prospecto no depende del push.
    }
  }

  return NextResponse.json({ ok: true });
}
