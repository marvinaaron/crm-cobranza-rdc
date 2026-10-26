import Link from "next/link";

const P = "text-[11px] leading-relaxed text-slate-600 mb-4";
const H2 = "text-xs font-bold uppercase tracking-widest text-slate-800 mt-8 mb-3";

/**
 * Términos y condiciones del sitio público (no comercio electrónico).
 * Despacho en México; no sustituyen asesoría legal.
 */
export default function TerminosContenido() {
  const anio = new Date().getFullYear();

  return (
    <article className="max-w-3xl mx-auto">
      <header className="border-b border-slate-200 pb-6 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-3">
          Documento legal · México
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Términos y condiciones
        </h1>
        <p className="text-[11px] text-slate-500 mt-2">
          RDC Contadores · Última actualización: octubre {anio}
        </p>
      </header>

      <p className={P}>
        Al acceder y usar{" "}
        <strong>rdcontadores.com</strong> y servicios relacionados (portal de
        clientes, herramientas públicas y formularios), usted acepta estos
        términos. Si no está de acuerdo, no utilice el sitio. Responsable:{" "}
        <strong>RDC Contadores</strong> (Aaron Rosales), Guadalajara, Jalisco,
        México.
      </p>

      <h2 className={H2}>1. Naturaleza del sitio</h2>
      <p className={P}>
        Este sitio es informativo y de captación de prospectos.{" "}
        <strong>No operamos una tienda en línea</strong> de productos físicos.
        Mostramos precios orientativos de servicios profesionales; la
        contratación definitiva se confirma con el despacho. Las herramientas
        fiscales gratuitas son de apoyo informativo y no sustituyen asesoría
        personalizada ni presentan declaraciones ante el SAT.
      </p>

      <h2 className={H2}>2. Cuentas y portal</h2>
      <p className={P}>
        El acceso al portal de clientes es exclusivo para quienes tienen
        relación de servicio vigente. Usted es responsable de custodiar sus
        credenciales y de la información que carga. Podemos suspender accesos
        ante uso indebido, riesgo de seguridad o terminación del encargo.
      </p>

      <h2 className={H2}>3. Contenido y propiedad intelectual</h2>
      <p className={P}>
        Marcas, logotipos, textos, diseños y el personaje Fiscalino son de RDC
        Contadores o se usan con licencia. Queda prohibida su reproducción
        comercial sin autorización escrita.
      </p>

      <h2 className={H2}>4. Privacidad</h2>
      <p className={P}>
        El tratamiento de datos personales se rige por nuestro{" "}
        <Link
          href="/aviso-de-privacidad"
          className="text-marca-navy font-semibold hover:underline"
        >
          aviso de privacidad
        </Link>
        . Para ejercer derechos ARCO o solicitar eliminación de datos use el
        formulario de{" "}
        <Link
          href="/solicitud-datos"
          className="text-marca-navy font-semibold hover:underline"
        >
          solicitud de datos
        </Link>
        .
      </p>

      <h2 className={H2}>5. Limitación de responsabilidad</h2>
      <p className={P}>
        El contenido público se ofrece “tal cual”. No garantizamos resultados
        fiscales concretos derivados del solo uso del sitio o de las
        calculadoras. La relación profesional queda sujeta a los acuerdos
        particulares con cada cliente.
      </p>

      <h2 className={H2}>6. Pagos en línea</h2>
      <p className={P}>
        Cuando habilitemos cobro de honorarios o herramientas Pro vía Stripe u
        otro procesador, el cargo corresponde al servicio indicado en el
        checkout. No aplica botón de arrepentimiento de comercio electrónico de
        bienes muebles; las disputas de cargos se atienden según el procesador
        y la relación de servicio.
      </p>

      <h2 className={H2}>7. Contacto</h2>
      <p className={P}>
        Correo:{" "}
        <a
          href="mailto:contacto@rdcontadores.com"
          className="text-marca-navy hover:underline"
        >
          contacto@rdcontadores.com
        </a>
        . También puede usar{" "}
        <Link href="/contacto" className="text-marca-navy hover:underline">
          /contacto
        </Link>
        .
      </p>

      <footer className="mt-10 pt-6 border-t border-slate-200 text-[10px] text-slate-400">
        © {anio} RDC Contadores · Estos términos pueden actualizarse; la
        versión vigente es la publicada en esta URL.
      </footer>
    </article>
  );
}
