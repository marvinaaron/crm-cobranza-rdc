import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { enviarCorreo } from "@/lib/mailer";
import {
  descargarPdfDelBucket,
  type DestinoPdfCrm,
} from "@/lib/supabase/pdfs-crm-storage";

export const runtime = "nodejs";

const MAX_ADJunto_BYTES = 3_500_000;
const DESTINOS_ADJunto: DestinoPdfCrm[] = [
  "facturas",
  "cumplimiento",
  "comprobantes-honorarios",
  "comprobantes-impuestos",
];

/**
 * POST /api/admin/correo/enviar
 *
 * Endpoint genérico para enviar un correo HTML a un cliente desde el CRM
 * usando Resend. El navegador construye el HTML (con `buildCorreoCobranza`
 * o cualquier plantilla del módulo `mailer/templates`) y aquí solo lo
 * entregamos. Esto evita duplicar la lógica de plantillas en el servidor
 * y permite reutilizar el endpoint para cobranza, recordatorios de e.firma,
 * cumpleaños, avisos futuros, etc.
 */

type BodyEnvio = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: {
    filename: string;
    content: string;
    contentType?: string;
  }[];
  storageAttachments?: {
    destino: DestinoPdfCrm;
    path: string;
    filename: string;
  }[];
};

function esDestinoAdjunto(v: string): v is DestinoPdfCrm {
  return (DESTINOS_ADJunto as string[]).includes(v);
}

export async function POST(req: Request) {
  const supabase = await getSupabaseServer();
  const { data: sess } = await supabase.auth.getUser();
  const user = sess.user;
  if (!user) {
    return NextResponse.json({ error: "Sin sesión." }, { status: 401 });
  }
  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  if (appMeta.rol !== "admin") {
    return NextResponse.json(
      { error: "Solo administradores." },
      { status: 403 }
    );
  }

  let body: BodyEnvio;
  try {
    body = (await req.json()) as BodyEnvio;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!body.to || !body.subject || !body.html) {
    return NextResponse.json(
      { error: "Faltan campos requeridos (to, subject, html)." },
      { status: 400 }
    );
  }

  const adjuntos: {
    filename: string;
    content: Buffer;
    contentType?: string;
  }[] = [];

  for (const a of body.attachments ?? []) {
    const filename = a.filename?.trim();
    const raw = a.content?.replace(/\s/g, "") ?? "";
    if (!filename || !raw) continue;
    const buffer = Buffer.from(raw, "base64");
    if (buffer.length === 0 || buffer.length > MAX_ADJunto_BYTES) {
      return NextResponse.json(
        { error: "El PDF adjunto es inválido o demasiado grande." },
        { status: 400 }
      );
    }
    adjuntos.push({
      filename,
      content: buffer,
      contentType: a.contentType || "application/pdf",
    });
  }

  for (const s of body.storageAttachments ?? []) {
    const filename = s.filename?.trim();
    const path = s.path?.trim();
    if (!filename || !path || !esDestinoAdjunto(s.destino)) {
      return NextResponse.json(
        { error: "Adjunto de Storage inválido." },
        { status: 400 }
      );
    }
    try {
      const { buffer, contentType } = await descargarPdfDelBucket(
        s.destino,
        path
      );
      if (buffer.length > MAX_ADJunto_BYTES) {
        return NextResponse.json(
          { error: "El PDF adjunto es demasiado grande." },
          { status: 400 }
        );
      }
      adjuntos.push({ filename, content: buffer, contentType });
    } catch (e) {
      return NextResponse.json(
        {
          error:
            e instanceof Error
              ? e.message
              : "No se pudo leer el PDF de la factura.",
        },
        { status: 502 }
      );
    }
  }

  const resultado = await enviarCorreo({
    to: body.to,
    subject: body.subject,
    html: body.html,
    text: body.text,
    replyTo: body.replyTo,
    attachments: adjuntos.length > 0 ? adjuntos : undefined,
  });

  if (!resultado.ok) {
    return NextResponse.json(
      { error: resultado.error ?? "No se pudo enviar el correo." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, id: resultado.id });
}
