import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { actualizarLead, obtenerSiteLead } from "@/lib/site-leads-db";
import { esEstatusLead } from "@/lib/lead-estatus";
import type { EventoLeadTipo } from "@/lib/lead-bitacora";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EVENTOS: EventoLeadTipo[] = [
  "whatsapp",
  "cotizacion",
  "llamada",
  "estatus",
  "alta",
  "paso",
];

type Body = {
  estatus?: unknown;
  motivoRechazo?: unknown;
  siguientePasoEn?: unknown;
  siguientePasoNota?: unknown;
  evento?: { tipo?: unknown; detalle?: unknown };
  clienteId?: unknown;
};

function isoONull(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  if (typeof v !== "string") return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Prospecto inválido." }, { status: 400 });
  }
  const lead = await obtenerSiteLead(id);
  if (!lead) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
  return NextResponse.json({ lead });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Prospecto inválido." }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const estatus = body.estatus === undefined ? undefined : body.estatus;
  if (estatus !== undefined && !esEstatusLead(estatus)) {
    return NextResponse.json({ error: "Estatus no válido." }, { status: 400 });
  }

  const siguientePasoEn = isoONull(body.siguientePasoEn);
  if (body.siguientePasoEn !== undefined && siguientePasoEn === undefined) {
    return NextResponse.json(
      { error: "Fecha de siguiente paso inválida." },
      { status: 400 }
    );
  }

  let evento: { tipo: EventoLeadTipo; detalle?: string } | undefined;
  if (body.evento?.tipo) {
    if (!EVENTOS.includes(body.evento.tipo as EventoLeadTipo)) {
      return NextResponse.json({ error: "Evento no válido." }, { status: 400 });
    }
    evento = {
      tipo: body.evento.tipo as EventoLeadTipo,
      detalle:
        typeof body.evento.detalle === "string"
          ? body.evento.detalle
          : undefined,
    };
  }

  const clienteId =
    body.clienteId === undefined
      ? undefined
      : body.clienteId === null
        ? null
        : Number(body.clienteId);

  if (
    estatus === undefined &&
    siguientePasoEn === undefined &&
    body.siguientePasoNota === undefined &&
    !evento &&
    clienteId === undefined
  ) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  const resultado = await actualizarLead({
    id,
    estatus: esEstatusLead(estatus) ? estatus : undefined,
    motivoRechazo:
      typeof body.motivoRechazo === "string" ? body.motivoRechazo : null,
    siguientePasoEn,
    siguientePasoNota:
      typeof body.siguientePasoNota === "string"
        ? body.siguientePasoNota
        : undefined,
    evento,
    clienteId:
      clienteId === undefined
        ? undefined
        : clienteId === null || Number.isFinite(clienteId)
          ? clienteId
          : undefined,
  });

  if (!resultado.ok) {
    return NextResponse.json({ error: resultado.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, lead: resultado.lead });
}
