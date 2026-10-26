import { NextResponse, type NextRequest } from "next/server";
import { enviarCorreo } from "@/lib/mailer";
import { NEGOCIO } from "@/lib/seo/negocio";

export const dynamic = "force-dynamic";

const TIPOS = new Set([
  "eliminacion",
  "acceso",
  "rectificacion",
  "oposicion",
]);

const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Recibe solicitudes ARCO / eliminación desde /solicitud-datos
 * y las reenvía por correo al despacho.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const nombre = typeof raw.nombre === "string" ? raw.nombre.trim() : "";
  const correo = typeof raw.correo === "string" ? raw.correo.trim() : "";
  const tipo = typeof raw.tipo === "string" ? raw.tipo.trim() : "";
  const detalle = typeof raw.detalle === "string" ? raw.detalle.trim() : "";

  if (nombre.length < 2 || nombre.length > 120) {
    return NextResponse.json({ error: "Nombre inválido." }, { status: 400 });
  }
  if (!RE_CORREO.test(correo) || correo.length > 160) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }
  if (!TIPOS.has(tipo)) {
    return NextResponse.json({ error: "Tipo de solicitud inválido." }, { status: 400 });
  }
  if (raw.aceptaPrivacidad !== true) {
    return NextResponse.json(
      { error: "Debes aceptar el aviso de privacidad." },
      { status: 400 }
    );
  }
  if (detalle.length > 2000) {
    return NextResponse.json({ error: "El detalle es demasiado largo." }, { status: 400 });
  }

  const etiquetas: Record<string, string> = {
    eliminacion: "Eliminación / cancelación",
    acceso: "Acceso",
    rectificacion: "Rectificación",
    oposicion: "Oposición",
  };

  const dest =
    process.env.NEXT_PUBLIC_DESPACHO_EMAIL?.trim() || NEGOCIO.email;

  const resultado = await enviarCorreo({
    to: dest,
    subject: `[ARCO] ${etiquetas[tipo] ?? tipo} · ${nombre}`,
    replyTo: correo,
    text: [
      `Solicitud de derechos de datos personales`,
      ``,
      `Tipo: ${etiquetas[tipo] ?? tipo}`,
      `Nombre: ${nombre}`,
      `Correo: ${correo}`,
      `Detalle: ${detalle || "(sin detalle)"}`,
      `Fecha: ${new Date().toISOString()}`,
    ].join("\n"),
    html: `
      <p><strong>Solicitud ARCO / datos personales</strong></p>
      <ul>
        <li><strong>Tipo:</strong> ${etiquetas[tipo] ?? tipo}</li>
        <li><strong>Nombre:</strong> ${nombre}</li>
        <li><strong>Correo:</strong> ${correo}</li>
        <li><strong>Detalle:</strong> ${detalle ? detalle.replace(/</g, "&lt;") : "(sin detalle)"}</li>
      </ul>
      <p style="color:#64748b;font-size:12px">Enviado desde /solicitud-datos</p>
    `,
  });

  if (!resultado.ok) {
    return NextResponse.json(
      {
        error:
          "No pudimos enviar el correo ahora. Escríbenos a contacto@rdcontadores.com.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
