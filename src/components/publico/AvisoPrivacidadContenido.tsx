import Link from "next/link";

const CLAUSULA = "text-[11px] leading-relaxed text-slate-600 mb-4";
const TITULO_SEC = "text-xs font-bold uppercase tracking-widest text-slate-800 mt-8 mb-3";
const TITULO_SUB = "text-[11px] font-bold text-slate-700 mt-4 mb-2";

export default function AvisoPrivacidadContenido() {
  const anio = new Date().getFullYear();

  return (
    <article className="max-w-3xl mx-auto">
      <header className="border-b border-slate-200 pb-6 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-2">
          Documento legal · México
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Aviso de privacidad
        </h1>
        <p className="text-[11px] text-slate-500 mt-2">
          RDC Contadores · Última actualización: mayo {anio}
        </p>
      </header>

      <p className={CLAUSULA}>
        En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los
        Particulares (LFPDPPP) y su Reglamento, <strong>RDC Contadores</strong> (&quot;el
        Despacho&quot;, &quot;nosotros&quot;) pone a su disposición el presente aviso de privacidad.
        Al utilizar nuestro sitio web, portal de clientes o contratar nuestros servicios
        profesionales, usted (&quot;el Titular&quot;, &quot;el Cliente&quot;) reconoce haber leído
        y entendido este documento.
      </p>

      <p className={`${CLAUSULA} bg-slate-50 border border-slate-100 rounded-lg px-4 py-3`}>
        <strong>Principio de transparencia y consentimiento informado.</strong> En RDC Contadores
        no recabamos, utilizamos ni tratamos datos personales, documentos fiscales, archivos de
        e.firma (.cer / .key), comprobantes de pago, declaraciones ni información confidencial de
        carácter alguno <strong>sin que el Cliente tenga conocimiento previo</strong>, sin una
        relación profesional vigente o sin una instrucción expresa del Cliente. Toda gestión con su
        información se realiza en el marco del encargo contable y fiscal que usted nos ha conferido.
      </p>

      <h2 className={TITULO_SEC}>1. Responsable del tratamiento</h2>
      <p className={CLAUSULA}>
        Responsable: RDC Contadores.
        <br />
        Domicilio: disponible bajo solicitud en{" "}
        <Link href="/contacto" className="text-marca-navy hover:underline">
          contacto
        </Link>
        .
        <br />
        Correo:{" "}
        <a
          href="mailto:contacto@rdcontadores.com"
          className="text-marca-navy hover:underline"
        >
          contacto@rdcontadores.com
        </a>
      </p>

      <h2 className={TITULO_SEC}>2. Datos personales que recabamos</h2>
      <p className={CLAUSULA}>Podemos recabar las siguientes categorías de datos:</p>
      <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-slate-600 mb-4">
        <li>
          <strong>Identificación y contacto:</strong> nombre, razón social, RFC, correo
          electrónico, teléfono.
        </li>
        <li>
          <strong>Fiscales y contables:</strong> información para cumplimiento de obligaciones ante
          el SAT, IMSS, estados; estados financieros; comprobantes; facturas; declaraciones.
        </li>
        <li>
          <strong>Portal y autenticación:</strong> usuario, contraseña (almacenada de forma segura),
          preferencias de notificación.
        </li>
        <li>
          <strong>E.firma (FIEL):</strong> únicamente cuando el Cliente nos entrega voluntariamente
          sus archivos .cer y .key para trámites autorizados; se almacenan en servidores cifrados con
          acceso restringido al personal autorizado del Despacho.
        </li>
        <li>
          <strong>Técnicos:</strong> dirección IP, tipo de navegador, cookies estrictamente
          necesarias para el funcionamiento del sitio y la sesión.
        </li>
      </ul>
      <p className={CLAUSULA}>
        No solicitamos datos personales sensibles en el sentido del artículo 3, fracción VI, de la
        LFPDPPP, salvo que la ley o el encargo profesional lo exijan y usted lo autorice por escrito.
      </p>

      <h2 className={TITULO_SEC}>3. Finalidades del tratamiento</h2>
      <h3 className={TITULO_SUB}>Finalidades primarias (necesarias para el servicio)</h3>
      <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600 mb-3">
        <li>Prestación de servicios de contabilidad, fiscal y cumplimiento.</li>
        <li>Administración de honorarios, cobranza y comprobantes en el portal.</li>
        <li>Comunicación sobre obligaciones fiscales, vencimientos y documentación.</li>
        <li>Recordatorios de vigencia de e.firma, previa autorización del Cliente.</li>
        <li>Envío de notificaciones por correo y, si el Cliente las activa, push en su dispositivo.</li>
      </ul>
      <h3 className={TITULO_SUB}>Finalidades secundarias</h3>
      <p className={CLAUSULA}>
        Envío de información relevante del Despacho o boletines. Si no desea estas finalidades,
        puede manifestarlo a{" "}
        <a href="mailto:contacto@rdcontadores.com" className="text-marca-navy hover:underline">
          contacto@rdcontadores.com
        </a>
        .
      </p>

      <h2 className={TITULO_SEC}>4. Transferencia de datos</h2>
      <p className={CLAUSULA}>
        Podemos compartir datos únicamente con: (i) autoridades competentes cuando la ley lo exija;
        (ii) proveedores tecnológicos que nos prestan hosting, correo o almacenamiento (p. ej. Vercel,
        Supabase, Resend), bajo contratos de confidencialidad; (iii) cuando usted lo instruya
        expresamente. No vendemos ni comercializamos sus datos personales.
      </p>

      <h2 className={TITULO_SEC}>5. Derechos ARCO y revocación</h2>
      <p className={CLAUSULA}>
        Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición, así como
        revocar su consentimiento, enviando solicitud a{" "}
        <a href="mailto:contacto@rdcontadores.com" className="text-marca-navy hover:underline">
          contacto@rdcontadores.com
        </a>
        . Responderemos en los plazos que marca la ley. La revocación no tendrá efectos retroactivos
        respecto de tratamientos ya realizados conforme al encargo.
      </p>

      <h2 className={TITULO_SEC}>6. Medidas de seguridad</h2>
      <p className={CLAUSULA}>
        Implementamos controles administrativos, técnicos y físicos razonables: cifrado en tránsito
        (HTTPS), acceso autenticado al portal, almacenamiento privado de documentos y e.firma,
        cierre de sesión por inactividad y segregación de roles en la consola administrativa.
      </p>

      <h2 className={TITULO_SEC}>7. Conservación</h2>
      <p className={CLAUSULA}>
        Conservamos los datos durante la vigencia de la relación profesional y el plazo que exijan
        las disposiciones fiscales y mercantiles aplicables. Transcurrido ese plazo, procederemos a
        su bloqueo o eliminación segura cuando proceda.
      </p>

      <h2 className={TITULO_SEC}>8. Cookies y tecnologías similares</h2>
      <p className={CLAUSULA}>
        Utilizamos cookies necesarias para mantener su sesión y preferencias. No utilizamos cookies
        de publicidad comportamental de terceros en el portal de clientes.
      </p>

      <h2 className={TITULO_SEC}>9. Cambios al aviso</h2>
      <p className={CLAUSULA}>
        Podemos actualizar este aviso. La versión vigente estará publicada en esta URL. Cambios
        sustanciales serán comunicados por correo o mediante aviso en el portal cuando corresponda.
      </p>

      <h2 className={TITULO_SEC}>10. Autoridad</h2>
      <p className={CLAUSULA}>
        Si considera que su derecho a la protección de datos ha sido vulnerado, puede acudir al
        Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales
        (INAI).
      </p>

      <footer className="mt-10 pt-6 border-t border-slate-200 text-[10px] text-slate-400">
        © {anio} RDC Contadores. Este aviso forma parte de los términos de uso del sitio y del
        portal de clientes.
      </footer>
    </article>
  );
}
