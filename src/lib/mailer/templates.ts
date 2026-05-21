/**
 * Plantillas HTML de los correos transaccionales del portal del cliente.
 *
 * Estilo: minimalista, profesional, monocromo + un único color de acento
 * (azul indigo, alineado con el branding del CRM). Sin imágenes externas
 * para que se vea consistente en Gmail/Outlook/Apple Mail. Solo HTML inline
 * (los clientes de correo descartan <style> y clases).
 */

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
function shell(params: { titulo: string; preheader: string; body: string }) {
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
          ${params.body}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function botonPrincipal(url: string, etiqueta: string) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
    <tr>
      <td align="center" style="border-radius:10px;background:${COLOR_ACENTO};">
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
    body: `
      <tr>
        <td style="padding:36px 32px 8px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${COLOR_ACENTO};text-transform:uppercase;letter-spacing:0.12em;">
            ${escape(p.nombreDespacho)}
          </p>
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
    body: `
      <tr>
        <td style="padding:36px 32px 8px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${COLOR_ACENTO};text-transform:uppercase;letter-spacing:0.12em;">
            ${escape(p.nombreDespacho)}
          </p>
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
    body: `
      <tr>
        <td style="padding:36px 32px 8px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${COLOR_ACENTO};text-transform:uppercase;letter-spacing:0.12em;">
            ${escape(p.nombreDespacho)}
          </p>
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
