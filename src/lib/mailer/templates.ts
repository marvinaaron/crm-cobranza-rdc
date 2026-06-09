/**
 * Plantillas HTML de los correos transaccionales del portal del cliente.
 *
 * Estilo: minimalista, profesional, monocromo + un único color de acento
 * (azul indigo, alineado con el branding del CRM). Sin imágenes externas
 * para que se vea consistente en Gmail/Outlook/Apple Mail. Solo HTML inline
 * (los clientes de correo descartan <style> y clases).
 */

import { WHATSAPP_URL_CORREO } from "@/lib/workspace-email";

const COLOR_ACENTO = "#4f46e5"; // indigo-600
const COLOR_TEXTO = "#0f172a"; // slate-900
const COLOR_SUAVE = "#475569"; // slate-600
const COLOR_BORDE = "#e2e8f0"; // slate-200

type ParamsCorreo = {
  /** Razón social o nombre del cliente. */
  nombreCliente: string;
  /** URL completa para el botón principal (magic link / recovery link). */
  url: string;
  /** Nombre del despacho que envía. */
  nombreDespacho: string;
  /** Correo de soporte para que el cliente pueda responder dudas. */
  correoSoporte: string;
  /** URL del sitio del despacho (footer). */
  sitioWeb?: string;
};

/** Envoltura común para todos los correos. */
function shell(params: {
  titulo: string;
  preheader: string;
  body: string;
  sitioWeb?: string;
}) {
  // Logo en encabezado: versión gris claro para que contraste bien tanto en
  // clientes de correo con tema claro como oscuro.
  const cabecera = params.sitioWeb
    ? `
          <tr>
            <td style="padding:32px 32px 0;">
              <a href="${escapeAttr(params.sitioWeb)}" target="_blank" style="text-decoration:none;display:inline-block;">
                <img
                  src="${escapeAttr(stripTrailingSlash(params.sitioWeb))}/logos/rdc-gray.png?v=3"
                  alt="RDC Contadores"
                  height="28"
                  style="display:block;height:28px;width:auto;border:0;outline:none;">
              </a>
            </td>
          </tr>`
    : "";

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escape(params.titulo)}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${COLOR_TEXTO};-webkit-font-smoothing:antialiased;">
  <!-- preheader (texto invisible que aparece en la vista previa del inbox) -->
  <div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${escape(params.preheader)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;background:#ffffff;border:1px solid ${COLOR_BORDE};border-radius:16px;overflow:hidden;">
          ${cabecera}
          ${params.body}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function botonPrincipal(url: string, etiqueta: string, color: string = COLOR_ACENTO) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
    <tr>
      <td align="center" style="border-radius:10px;background:${color};">
        <a href="${escapeAttr(url)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.025em;">
          ${escape(etiqueta)}
        </a>
      </td>
    </tr>
  </table>`;
}

function footer(params: { nombreDespacho: string; correoSoporte: string; sitioWeb?: string }) {
  const sitio = params.sitioWeb
    ? `<a href="${escapeAttr(params.sitioWeb)}" style="color:${COLOR_SUAVE};text-decoration:none;">${escape(stripProtocol(params.sitioWeb))}</a> · `
    : "";
  return `
  <tr>
    <td style="padding:0 32px 32px;">
      <hr style="border:none;border-top:1px solid ${COLOR_BORDE};margin:0 0 20px;">
      <p style="margin:0;font-size:11px;color:${COLOR_SUAVE};line-height:1.6;">
        Este correo fue enviado por <strong style="color:${COLOR_TEXTO};">${escape(params.nombreDespacho)}</strong>.<br>
        ${sitio}<a href="mailto:${escapeAttr(params.correoSoporte)}" style="color:${COLOR_SUAVE};text-decoration:none;">${escape(params.correoSoporte)}</a>
      </p>
      <p style="margin:12px 0 0;font-size:10px;color:#94a3b8;line-height:1.5;">
        Si no esperabas este correo, simplemente ignóralo.
      </p>
    </td>
  </tr>`;
}

/**
 * Firma personalizada con contexto humano (Aaron Rosales · Tu contador).
 * `cierre` permite cambiar el remate ("Atentamente," / "Con cariño,").
 * `align` para los correos centrados (cumpleaños).
 */
/**
 * Bloque de redes sociales (WhatsApp, Instagram, Facebook, YouTube) con
 * iconos PNG hospedados en el sitio del despacho. Va debajo de la firma.
 */
function redesSociales(sitioWeb: string | undefined, align: "left" | "center" = "left") {
  if (!sitioWeb) return "";
  const base = stripTrailingSlash(sitioWeb);
  const redes: Array<[string, string, string]> = [
    ["whatsapp", "WhatsApp", WHATSAPP_URL_CORREO],
    ["instagram", "Instagram", "https://www.instagram.com/rdccontadores/"],
    ["facebook", "Facebook", "https://www.facebook.com/rd.contadores.mx/"],
    ["youtube", "YouTube", "https://www.youtube.com/@rdccontadores"],
  ];
  const celdas = redes
    .map(
      ([archivo, nombre, url]) =>
        `<td style="padding:0 7px;"><a href="${escapeAttr(url)}" target="_blank" style="text-decoration:none;"><img src="${base}/logos/redes/${archivo}.png" alt="${nombre}" width="24" height="24" style="display:block;width:24px;height:24px;border:0;outline:none;"></a></td>`
    )
    .join("");
  const tablaAlign = align === "center" ? "center" : "left";
  return `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${tablaAlign}" style="margin:18px 0 0;">
            <tr><td style="padding:0 0 8px;text-align:${align};">
              <p style="margin:0;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;font-weight:bold;">Síguenos</p>
            </td></tr>
            <tr><td align="${tablaAlign}">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${celdas}</tr></table>
            </td></tr>
          </table>`;
}

function firmaPersonal(
  p: { nombreDespacho: string; correoSoporte: string; sitioWeb?: string },
  opts?: { cierre?: string; align?: "left" | "center" }
) {
  const cierre = opts?.cierre ?? "Atentamente,";
  const align = opts?.align ?? "left";
  const sitio = p.sitioWeb
    ? ` · <a href="${escapeAttr(p.sitioWeb)}" style="color:${COLOR_ACENTO};text-decoration:none;">${escape(stripProtocol(p.sitioWeb))}</a>`
    : "";
  return `
          <p style="margin:24px 0 0;text-align:${align};font-size:14px;line-height:1.5;color:${COLOR_SUAVE};">${escape(cierre)}</p>
          <p style="margin:2px 0 0;text-align:${align};font-size:15px;line-height:1.5;color:${COLOR_TEXTO};font-weight:bold;">Aaron Rosales</p>
          <p style="margin:2px 0 0;text-align:${align};font-size:13px;line-height:1.5;color:${COLOR_SUAVE};">Tu contador · ${escape(p.nombreDespacho)}</p>
          <p style="margin:2px 0 0;text-align:${align};font-size:13px;line-height:1.5;color:${COLOR_SUAVE};"><a href="mailto:${escapeAttr(p.correoSoporte)}" style="color:${COLOR_ACENTO};text-decoration:none;">${escape(p.correoSoporte)}</a>${sitio}</p>
          <p style="margin:10px 0 0;text-align:${align};font-size:12px;line-height:1.5;color:#9ca3af;">Respondemos en horario hábil · Lun–Vie 9:00–17:00</p>
          ${redesSociales(p.sitioWeb, align)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plantilla 1: invitación a nuevo cliente
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parámetros de la invitación. Incluye correo del cliente y contraseña
 * temporal, que mostramos explícitamente para que el cliente pueda
 * copiarla y pegarla en el portal de login.
 */
type ParamsInvitacion = Omit<ParamsCorreo, "url"> & {
  correoCliente: string;
  passwordTemporal: string;
  urlPortal: string;
};

export function plantillaInvitacionPortal(p: ParamsInvitacion): {
  asunto: string;
  html: string;
  texto: string;
} {
  const asunto = `Tu acceso al portal · ${p.nombreDespacho}`;
  const html = shell({
    titulo: asunto,
    preheader: `Tu cuenta del portal ya está lista. Usuario: ${p.correoCliente}. Contraseña temporal incluida.`,
    sitioWeb: p.sitioWeb,
    body: `
      <tr>
        <td style="padding:24px 32px 8px;">
          <h1 style="margin:0 0 18px;font-size:22px;font-weight:800;color:${COLOR_TEXTO};line-height:1.3;">
            Bienvenido al portal del cliente
          </h1>
          <p style="margin:0 0 12px;font-size:14px;color:${COLOR_SUAVE};line-height:1.65;">
            Hola <strong style="color:${COLOR_TEXTO};">${escape(p.nombreCliente)}</strong>, ya creamos tu cuenta en el portal de ${escape(p.nombreDespacho)}.
          </p>
          <p style="margin:0 0 18px;font-size:14px;color:${COLOR_SUAVE};line-height:1.65;">
            Desde el portal podrás consultar tus impuestos del periodo, descargar declaraciones y facturas, y subir tus comprobantes de pago.
          </p>

          <p style="margin:18px 0 10px;font-size:13px;font-weight:700;color:${COLOR_TEXTO};letter-spacing:0.02em;">
            Estos son tus datos de acceso:
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 10px;background:#f1f5f9;border-radius:10px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${COLOR_SUAVE};text-transform:uppercase;letter-spacing:0.08em;">
                  Usuario
                </p>
                <p style="margin:0;font-size:15px;font-weight:700;color:${COLOR_TEXTO};line-height:1.4;word-break:break-all;font-family:'SFMono-Regular',Menlo,Consolas,monospace;">
                  ${escape(p.correoCliente)}
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${COLOR_ACENTO};text-transform:uppercase;letter-spacing:0.08em;">
                  Contraseña temporal
                </p>
                <p style="margin:0;font-size:18px;font-weight:800;color:${COLOR_TEXTO};line-height:1.3;letter-spacing:0.03em;font-family:'SFMono-Regular',Menlo,Consolas,monospace;">
                  ${escape(p.passwordTemporal)}
                </p>
                <p style="margin:6px 0 0;font-size:11px;color:${COLOR_SUAVE};line-height:1.4;">
                  Cópiala tal cual. Al iniciar sesión te pediremos que definas tu propia contraseña.
                </p>
              </td>
            </tr>
          </table>

          ${botonPrincipal(p.urlPortal, "Entrar al portal")}

          <p style="margin:0 0 6px;font-size:12px;color:${COLOR_SUAVE};line-height:1.5;">
            Si el botón no funciona, abre este enlace en tu navegador:
          </p>
          <p style="margin:0 0 8px;font-size:11px;line-height:1.6;word-break:break-all;">
            <a href="${escapeAttr(p.urlPortal)}" style="color:${COLOR_ACENTO};text-decoration:none;">${escape(p.urlPortal)}</a>
          </p>
          <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
            Esta contraseña es temporal y única para tu primer acceso. Por seguridad, no la compartas y cámbiala apenas entres.
          </p>
        </td>
      </tr>
      ${footer({ ...p, nombreDespacho: p.nombreDespacho, correoSoporte: p.correoSoporte, sitioWeb: p.sitioWeb })}
    `,
  });

  const texto = `${p.nombreDespacho}

Bienvenido al portal del cliente.

Hola ${p.nombreCliente},

Ya creamos tu cuenta en el portal de ${p.nombreDespacho}. Estos son tus datos de acceso:

Usuario: ${p.correoCliente}
Contraseña temporal: ${p.passwordTemporal}

Entra al portal aquí:
${p.urlPortal}

Al iniciar sesión te pediremos que definas tu propia contraseña.

— ${p.nombreDespacho}
${p.correoSoporte}`;

  return { asunto, html, texto };
}

// ─────────────────────────────────────────────────────────────────────────────
// Plantilla 2: recuperación de contraseña
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Plantilla: invitación a nuevo administrador del CRM
// ─────────────────────────────────────────────────────────────────────────────

type ParamsInvitacionAdmin = Omit<ParamsCorreo, "url" | "nombreCliente"> & {
  nombreAdmin: string;
  correoAdmin: string;
  passwordTemporal: string;
  urlLogin: string;
};

export function plantillaInvitacionAdmin(p: ParamsInvitacionAdmin): {
  asunto: string;
  html: string;
  texto: string;
} {
  const asunto = `Acceso al CRM · ${p.nombreDespacho}`;
  const html = shell({
    titulo: asunto,
    preheader: `Tu cuenta de administrador ya está lista. Usuario: ${p.correoAdmin}. Contraseña temporal incluida.`,
    sitioWeb: p.sitioWeb,
    body: `
      <tr>
        <td style="padding:24px 32px 8px;">
          <h1 style="margin:0 0 18px;font-size:22px;font-weight:800;color:${COLOR_TEXTO};line-height:1.3;">
            Acceso al CRM del despacho
          </h1>
          <p style="margin:0 0 12px;font-size:14px;color:${COLOR_SUAVE};line-height:1.65;">
            Hola <strong style="color:${COLOR_TEXTO};">${escape(p.nombreAdmin)}</strong>, te creamos una cuenta de administrador en el CRM de ${escape(p.nombreDespacho)}.
          </p>
          <p style="margin:0 0 18px;font-size:14px;color:${COLOR_SUAVE};line-height:1.65;">
            Estos son tus datos de acceso. Por seguridad, cambia la contraseña apenas entres desde tu perfil.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 10px;background:#f1f5f9;border-radius:10px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${COLOR_SUAVE};text-transform:uppercase;letter-spacing:0.08em;">
                  Usuario
                </p>
                <p style="margin:0;font-size:15px;font-weight:700;color:${COLOR_TEXTO};line-height:1.4;word-break:break-all;font-family:'SFMono-Regular',Menlo,Consolas,monospace;">
                  ${escape(p.correoAdmin)}
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${COLOR_ACENTO};text-transform:uppercase;letter-spacing:0.08em;">
                  Contraseña temporal
                </p>
                <p style="margin:0;font-size:18px;font-weight:800;color:${COLOR_TEXTO};line-height:1.3;letter-spacing:0.03em;font-family:'SFMono-Regular',Menlo,Consolas,monospace;">
                  ${escape(p.passwordTemporal)}
                </p>
              </td>
            </tr>
          </table>

          ${botonPrincipal(p.urlLogin, "Entrar al CRM")}

          <p style="margin:0 0 6px;font-size:12px;color:${COLOR_SUAVE};line-height:1.5;">
            Si el botón no funciona, abre este enlace:
          </p>
          <p style="margin:0 0 8px;font-size:11px;line-height:1.6;word-break:break-all;">
            <a href="${escapeAttr(p.urlLogin)}" style="color:${COLOR_ACENTO};text-decoration:none;">${escape(p.urlLogin)}</a>
          </p>
        </td>
      </tr>
      ${footer({ nombreDespacho: p.nombreDespacho, correoSoporte: p.correoSoporte, sitioWeb: p.sitioWeb })}
    `,
  });

  const texto = `${p.nombreDespacho}

Acceso al CRM del despacho

Hola ${p.nombreAdmin},

Te creamos una cuenta de administrador en el CRM. Estos son tus datos de acceso:

Usuario: ${p.correoAdmin}
Contraseña temporal: ${p.passwordTemporal}

Entra al CRM aquí:
${p.urlLogin}

Por seguridad, cambia la contraseña apenas entres desde tu perfil.

— ${p.nombreDespacho}
${p.correoSoporte}`;

  return { asunto, html, texto };
}

// ─────────────────────────────────────────────────────────────────────────────
// Plantilla 2: recuperación de contraseña
// ─────────────────────────────────────────────────────────────────────────────

type ParamsRecuperacion = Omit<ParamsCorreo, "url"> & {
  correoCliente: string;
  passwordTemporal: string;
  urlPortal: string;
};

export function plantillaRecuperacionPortal(p: ParamsRecuperacion): {
  asunto: string;
  html: string;
  texto: string;
} {
  const asunto = `Tu nueva contraseña temporal · ${p.nombreDespacho}`;
  const html = shell({
    titulo: asunto,
    preheader: "Generamos una contraseña temporal para que vuelvas a entrar.",
    sitioWeb: p.sitioWeb,
    body: `
      <tr>
        <td style="padding:24px 32px 8px;">
          <h1 style="margin:0 0 18px;font-size:22px;font-weight:800;color:${COLOR_TEXTO};line-height:1.3;">
            Nueva contraseña temporal
          </h1>
          <p style="margin:0 0 12px;font-size:14px;color:${COLOR_SUAVE};line-height:1.65;">
            Hola <strong style="color:${COLOR_TEXTO};">${escape(p.nombreCliente)}</strong>,
          </p>
          <p style="margin:0 0 18px;font-size:14px;color:${COLOR_SUAVE};line-height:1.65;">
            Generamos una contraseña temporal para que vuelvas a entrar al portal. Si no la solicitaste, ignora este correo y la anterior seguirá funcionando.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 10px;background:#f1f5f9;border-radius:10px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${COLOR_SUAVE};text-transform:uppercase;letter-spacing:0.08em;">
                  Usuario
                </p>
                <p style="margin:0;font-size:15px;font-weight:700;color:${COLOR_TEXTO};line-height:1.4;word-break:break-all;font-family:'SFMono-Regular',Menlo,Consolas,monospace;">
                  ${escape(p.correoCliente)}
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${COLOR_ACENTO};text-transform:uppercase;letter-spacing:0.08em;">
                  Contraseña temporal
                </p>
                <p style="margin:0;font-size:18px;font-weight:800;color:${COLOR_TEXTO};line-height:1.3;letter-spacing:0.03em;font-family:'SFMono-Regular',Menlo,Consolas,monospace;">
                  ${escape(p.passwordTemporal)}
                </p>
                <p style="margin:6px 0 0;font-size:11px;color:${COLOR_SUAVE};line-height:1.4;">
                  Cópiala tal cual. Al iniciar sesión te pediremos que definas tu propia contraseña.
                </p>
              </td>
            </tr>
          </table>

          ${botonPrincipal(p.urlPortal, "Entrar al portal")}

          <p style="margin:0 0 6px;font-size:12px;color:${COLOR_SUAVE};line-height:1.5;">
            Si el botón no funciona, abre este enlace en tu navegador:
          </p>
          <p style="margin:0 0 8px;font-size:11px;line-height:1.6;word-break:break-all;">
            <a href="${escapeAttr(p.urlPortal)}" style="color:${COLOR_ACENTO};text-decoration:none;">${escape(p.urlPortal)}</a>
          </p>
        </td>
      </tr>
      ${footer({ nombreDespacho: p.nombreDespacho, correoSoporte: p.correoSoporte, sitioWeb: p.sitioWeb })}
    `,
  });

  const texto = `${p.nombreDespacho}

Nueva contraseña temporal

Hola ${p.nombreCliente},

Generamos una contraseña temporal para tu cuenta del portal. Si no la solicitaste, ignora este correo.

Usuario: ${p.correoCliente}
Contraseña temporal: ${p.passwordTemporal}

Entra al portal aquí:
${p.urlPortal}

Al iniciar sesión te pediremos que definas tu propia contraseña.

— ${p.nombreDespacho}
${p.correoSoporte}`;

  return { asunto, html, texto };
}

type ParamsEfirma = {
  nombreCliente: string;
  diasRestantes: number;
  fechaVencimiento: string;
  urlPortal: string;
  nombreDespacho: string;
  correoSoporte: string;
  sitioWeb?: string;
};

/** Recordatorio de e.firma próxima a vencer (30 / 15 / 7 / 3 días). */
export function plantillaEfirmaProximaVencer(p: ParamsEfirma) {
  const urgencia =
    p.diasRestantes <= 3
      ? "urgente"
      : p.diasRestantes <= 7
        ? "importante"
        : "recordatorio";
  const asunto =
    p.diasRestantes <= 0
      ? `${p.nombreDespacho} · Tu e.firma ha vencido`
      : p.diasRestantes <= 3
        ? `${p.nombreDespacho} · URGENTE: renueva tu e.firma (${p.diasRestantes} días)`
        : `${p.nombreDespacho} · Renueva tu e.firma (${p.diasRestantes} días restantes)`;

  const cuerpoUrgencia =
    p.diasRestantes <= 0
      ? "Tu certificado de e.firma (FIEL) ya no está vigente. Es indispensable renovarlo para continuar con trámites ante el SAT sin interrupciones."
      : p.diasRestantes === 1
        ? "Tu certificado de e.firma (FIEL) vence mañana. Te recomendamos renovarlo hoy mismo con tu contador."
        : `Tu certificado de e.firma (FIEL) vence en <strong>${p.diasRestantes} días</strong> (${escape(p.fechaVencimiento)}). Te recomendamos agendar la renovación con tu contador a la brevedad.`;

  const html = shell({
    titulo: asunto,
    preheader: `Renueva tu e.firma · ${p.diasRestantes} días`,
    sitioWeb: p.sitioWeb,
    body: `
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${COLOR_ACENTO};text-transform:uppercase;letter-spacing:0.1em;">
            ${urgencia === "urgente" ? "Aviso urgente" : urgencia === "importante" ? "Aviso importante" : "Recordatorio"}
          </p>
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:800;color:${COLOR_TEXTO};line-height:1.3;">
            Renovación de e.firma
          </h1>
          <p style="margin:0 0 14px;font-size:14px;color:${COLOR_SUAVE};line-height:1.65;">
            Hola, <strong>${escape(p.nombreCliente)}</strong>,
          </p>
          <p style="margin:0 0 18px;font-size:14px;color:${COLOR_SUAVE};line-height:1.65;">
            ${cuerpoUrgencia}
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:0.08em;">
                  Fecha de vencimiento
                </p>
                <p style="margin:0;font-size:16px;font-weight:800;color:${COLOR_TEXTO};">
                  ${escape(p.fechaVencimiento)}
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:0 0 18px;font-size:13px;color:${COLOR_SUAVE};line-height:1.6;">
            En <strong>${escape(p.nombreDespacho)}</strong> no hacemos trámites con tu e.firma sin que lo sepas antes.
            Este aviso es informativo para que coordines la renovación a tiempo con nosotros.
          </p>
          ${botonPrincipal(p.urlPortal, "Ir a mi portal")}
          ${firmaPersonal({ nombreDespacho: p.nombreDespacho, correoSoporte: p.correoSoporte, sitioWeb: p.sitioWeb })}
        </td>
      </tr>
      ${footer({ nombreDespacho: p.nombreDespacho, correoSoporte: p.correoSoporte, sitioWeb: p.sitioWeb })}
    `,
  });

  const texto = `${p.nombreDespacho} — Renovación de e.firma

Hola, ${p.nombreCliente},

${p.diasRestantes <= 0 ? "Tu e.firma (FIEL) ya venció." : `Tu e.firma vence en ${p.diasRestantes} días (${p.fechaVencimiento}).`}

Coordina la renovación con tu contador en ${p.nombreDespacho}.
Portal: ${p.urlPortal}

Atentamente,
Aaron Rosales
Tu contador · ${p.nombreDespacho}
${p.correoSoporte}`;

  return { asunto, html, texto };
}

// ─────────────────────────────────────────────────────────────────────────────
// Plantilla: propuesta / presupuesto de servicios
// ─────────────────────────────────────────────────────────────────────────────

type ParamsPresupuesto = {
  nombreCliente: string;
  /** Honorario mensual ya formateado (ej. "$4,408"). */
  montoMensual: string;
  /** Liga pública del presupuesto (/p/<token>). Va SOLO dentro del botón. */
  urlPresupuesto: string;
  /** Folio para el asunto / referencia (ej. "001-0000139"). */
  folio: string;
  /** Vigencia formateada (ej. "15 de junio de 2026"). Opcional. */
  vigenciaTexto?: string;
  nombreDespacho: string;
  correoSoporte: string;
  sitioWeb?: string;
};

/**
 * Correo de envío de propuesta. Muestra el honorario mensual y un botón
 * llamativo "Ver y aceptar mi propuesta" — la liga viaja DENTRO del botón,
 * nunca como texto visible. Al abrir, el cliente acepta y ve las animaciones.
 */
export function plantillaPresupuesto(p: ParamsPresupuesto): {
  asunto: string;
  html: string;
  texto: string;
} {
  const NAVY = "#0f172a"; // navy de marca (solo para este correo)
  const NAVY_BG = "#f1f5f9"; // fondo suave navy/slate
  const NAVY_BORDE = "#cbd5e1"; // borde navy/slate
  const asunto = `Tu propuesta de servicios · ${p.nombreDespacho}`;
  const vigencia = p.vigenciaTexto
    ? `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px;background:#f1f5f9;border-radius:10px;">
            <tr>
              <td style="padding:12px 18px;">
                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:${COLOR_SUAVE};text-transform:uppercase;letter-spacing:0.08em;">
                  Vigencia de la propuesta
                </p>
                <p style="margin:0;font-size:14px;font-weight:700;color:${COLOR_TEXTO};">
                  Válida hasta el ${escape(p.vigenciaTexto)}
                </p>
              </td>
            </tr>
          </table>`
    : "";

  const html = shell({
    titulo: asunto,
    preheader: `Tu propuesta de ${p.nombreDespacho} está lista · ${p.montoMensual} al mes (IVA incluido).`,
    sitioWeb: p.sitioWeb,
    body: `
      <tr>
        <td style="padding:24px 32px 8px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${NAVY};text-transform:uppercase;letter-spacing:0.1em;">
            Propuesta de servicios
          </p>
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:${COLOR_TEXTO};line-height:1.3;">
            Tu propuesta está lista
          </h1>
          <p style="margin:0 0 12px;font-size:14px;color:${COLOR_SUAVE};line-height:1.65;">
            Hola <strong style="color:${COLOR_TEXTO};">${escape(p.nombreCliente)}</strong>, preparamos una propuesta de servicios contables y fiscales a tu medida en <strong>${escape(p.nombreDespacho)}</strong>.
          </p>
          <p style="margin:0 0 18px;font-size:14px;color:${COLOR_SUAVE};line-height:1.65;">
            Ábrela para ver el detalle de lo que incluye y, si todo está bien, puedes aceptarla con un solo clic.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px;background:${NAVY_BG};border:1px solid ${NAVY_BORDE};border-radius:10px;">
            <tr>
              <td style="padding:16px 18px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:${NAVY};text-transform:uppercase;letter-spacing:0.08em;">
                  Honorario mensual
                </p>
                <p style="margin:0;font-size:26px;font-weight:800;color:${COLOR_TEXTO};line-height:1.2;">
                  ${escape(p.montoMensual)}
                </p>
                <p style="margin:4px 0 0;font-size:11px;color:${COLOR_SUAVE};">IVA incluido</p>
              </td>
            </tr>
          </table>

          ${vigencia}

          ${botonPrincipal(p.urlPresupuesto, "Ver y aceptar mi propuesta", NAVY)}

          <p style="margin:0 0 6px;font-size:12px;color:${COLOR_SUAVE};line-height:1.5;">
            El botón te lleva a tu propuesta segura y personalizada. Si tienes cualquier duda, respóndenos este correo o escríbenos por WhatsApp.
          </p>
          ${firmaPersonal({ nombreDespacho: p.nombreDespacho, correoSoporte: p.correoSoporte, sitioWeb: p.sitioWeb })}
        </td>
      </tr>
      ${footer({ nombreDespacho: p.nombreDespacho, correoSoporte: p.correoSoporte, sitioWeb: p.sitioWeb })}
    `,
  });

  const texto = `${p.nombreDespacho} — Tu propuesta de servicios

Hola ${p.nombreCliente},

Preparamos una propuesta de servicios contables y fiscales a tu medida.

Honorario mensual: ${p.montoMensual} (IVA incluido)${
    p.vigenciaTexto ? `\nVigencia: válida hasta el ${p.vigenciaTexto}` : ""
  }

Ver y aceptar tu propuesta:
${p.urlPresupuesto}

Si tienes cualquier duda, respóndenos este correo.

Atentamente,
Aaron Rosales
Tu contador · ${p.nombreDespacho}
${p.correoSoporte}`;

  return { asunto, html, texto };
}

// ─────────────────────────────────────────────────────────────────────────────
// Plantilla: felicitación de cumpleaños
// ─────────────────────────────────────────────────────────────────────────────

type ParamsCumpleanos = {
  nombreCliente: string;
  nombreDespacho: string;
  correoSoporte: string;
  sitioWeb?: string;
  /** Si true, el copy cambia a "aniversario" (apropiado para empresas). */
  esPersonaMoral?: boolean;
};

/**
 * Felicitación festiva con confeti, gradiente y un tono cálido.
 * Diseñado para verse bien en Gmail/Outlook/Apple Mail (todo HTML inline,
 * sin imágenes externas; los "confetis" son cuadritos de color absolutos).
 *
 * Si `esPersonaMoral` es true, el copy se adapta a "aniversario de la
 * empresa" — más apropiado que "feliz cumpleaños, ACME SA DE CV".
 */
export function plantillaCumpleanos(p: ParamsCumpleanos): {
  asunto: string;
  html: string;
  texto: string;
} {
  const esMoral = p.esPersonaMoral === true;
  const emoji = esMoral ? "🥂" : "🎂";
  const tituloPpal = esMoral ? "¡Feliz aniversario!" : "¡Feliz cumpleaños!";
  const preheader = esMoral
    ? `Hoy es un día especial. En ${p.nombreDespacho} celebramos un año más de ${p.nombreCliente}.`
    : `Hoy es tu día. En ${p.nombreDespacho} te deseamos un cumpleaños increíble.`;
  const asunto = esMoral
    ? `🥂 ¡Feliz aniversario, ${p.nombreCliente}!`
    : `🎂 ¡Feliz cumpleaños, ${p.nombreCliente}!`;

  // Paleta festiva
  const VIOLETA = "#7c3aed";
  const ROSA = "#ec4899";
  const AMARILLO = "#facc15";
  const TURQUESA = "#06b6d4";

  // Mini "confeti" generado con divs absolutos.
  const confetis = [
    { left: "8%", top: "18px", rot: -22, color: ROSA, w: 8, h: 14 },
    { left: "18%", top: "44px", rot: 14, color: AMARILLO, w: 10, h: 10 },
    { left: "30%", top: "12px", rot: 38, color: TURQUESA, w: 6, h: 16 },
    { left: "44%", top: "60px", rot: -8, color: VIOLETA, w: 12, h: 6 },
    { left: "58%", top: "26px", rot: 24, color: ROSA, w: 8, h: 8 },
    { left: "70%", top: "10px", rot: -34, color: AMARILLO, w: 6, h: 14 },
    { left: "82%", top: "50px", rot: 18, color: TURQUESA, w: 10, h: 10 },
    { left: "92%", top: "22px", rot: -12, color: VIOLETA, w: 8, h: 14 },
  ]
    .map(
      (c) =>
        `<span style="position:absolute;left:${c.left};top:${c.top};display:inline-block;width:${c.w}px;height:${c.h}px;background:${c.color};border-radius:2px;transform:rotate(${c.rot}deg);"></span>`
    )
    .join("\n");

  const cuerpo1 = esMoral
    ? `Hoy celebramos un año más de <strong>${escape(p.nombreCliente)}</strong>. En <strong>${escape(p.nombreDespacho)}</strong> reconocemos el esfuerzo, el compromiso y los logros que han construido a su empresa hasta este día.`
    : `Hoy es tu día y en <strong>${escape(p.nombreDespacho)}</strong> queremos desearte muchísimo éxito en tu negocio, salud y prosperidad para seguir creciendo juntos.`;
  const cuerpo2 = esMoral
    ? `Es un honor acompañarles un ejercicio más. ¡Felicidades por este aniversario y gracias por su confianza!`
    : `Estamos aquí para acompañarte un año más en cada paso de tu camino. ¡Gracias por confiar en nosotros!`;
  const tarjeta = esMoral
    ? "🥂 Aniversario · 🚀 Crecimiento · 🤝 Confianza"
    : "🎉 Mucho éxito · 🥂 Salud · 🎁 Bendiciones";

  const html = shell({
    titulo: asunto,
    preheader,
    sitioWeb: p.sitioWeb,
    body: `
      <tr>
        <td style="padding:0;">
          <!-- Cabecera festiva con gradiente y confetis -->
          <div style="position:relative;background:linear-gradient(135deg,${VIOLETA} 0%,${ROSA} 100%);padding:64px 32px 56px;text-align:center;overflow:hidden;">
            ${confetis}
            <p style="margin:0 0 14px;font-size:60px;line-height:1;">${emoji}</p>
            <h1 style="margin:0 0 8px;font-size:30px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;line-height:1.15;">
              ${tituloPpal}
            </h1>
            <p style="margin:0;font-size:16px;font-weight:700;color:rgba(255,255,255,0.95);">
              ${escape(p.nombreCliente)}
            </p>
          </div>

          <!-- Mensaje -->
          <div style="padding:36px 36px 12px;text-align:center;">
            <p style="margin:0 0 14px;font-size:15px;color:${COLOR_TEXTO};line-height:1.7;">
              ${cuerpo1}
            </p>
            <p style="margin:0 0 22px;font-size:15px;color:${COLOR_SUAVE};line-height:1.7;">
              ${cuerpo2}
            </p>

            <!-- Tarjetita de "deseos" -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 6px;">
              <tr>
                <td align="center" style="padding:18px 18px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:14px;">
                  <p style="margin:0;font-size:13px;font-weight:700;color:${VIOLETA};letter-spacing:0.04em;text-transform:uppercase;">
                    ${tarjeta}
                  </p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Firma cálida -->
          <div style="padding:8px 36px 28px;">
            ${firmaPersonal(
              { nombreDespacho: p.nombreDespacho, correoSoporte: p.correoSoporte, sitioWeb: p.sitioWeb },
              { cierre: "Con cariño,", align: "center" }
            )}
          </div>
        </td>
      </tr>
      ${footer({ nombreDespacho: p.nombreDespacho, correoSoporte: p.correoSoporte, sitioWeb: p.sitioWeb })}
    `,
  });

  const texto = esMoral
    ? `¡Feliz aniversario, ${p.nombreCliente}!

Hoy celebramos un año más de su empresa. En ${p.nombreDespacho}
reconocemos el esfuerzo y compromiso que les ha traído hasta hoy.
Es un honor acompañarles un ejercicio más.

Con cariño,
Aaron Rosales
Tu contador · ${p.nombreDespacho}
${p.correoSoporte}`
    : `¡Feliz cumpleaños, ${p.nombreCliente}!

Hoy es tu día y en ${p.nombreDespacho} queremos desearte muchísimo éxito
en tu negocio, salud y prosperidad para seguir creciendo juntos.
Estamos aquí para acompañarte un año más en cada paso de tu camino.
¡Gracias por confiar en nosotros!

Con cariño,
Aaron Rosales
Tu contador · ${p.nombreDespacho}
${p.correoSoporte}`;

  return { asunto, html, texto };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return escape(s);
}

function stripProtocol(u: string): string {
  return u.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function stripTrailingSlash(u: string): string {
  return u.replace(/\/$/, "");
}
