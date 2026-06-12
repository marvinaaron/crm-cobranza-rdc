import Link from "next/link";
import Logo from "@/components/publico/Logo";

/**
 * Envoltura común para las páginas de autenticación del portal de cliente
 * (login, recuperar contraseña, cambiar contraseña).
 *
 * Renderiza:
 *  - Fondo con gradiente navy→violeta en diagonal (puente visual entre el
 *    portal del cliente y la consola admin).
 *  - Encabezado con el logo RDC en blanco, clickeable a la home pública.
 *  - El contenido (children) centrado en una tarjeta.
 *  - Un pie discreto con un enlace "Volver al sitio" para que el cliente
 *    pueda regresar fácilmente a rdcontadores.com tras cerrar sesión.
 */
export default function PortalAuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6 gap-6"
      style={{
        background:
          "linear-gradient(105deg, #0a1130 0%, #0a1130 42%, #6b21a8 100%)",
      }}
    >
      {/* Patrón de puntos sutil (mismo estilo que el bloque del portal y las tarjetas del blog) */}
      <div
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <Link
        href="/"
        aria-label="Ir al inicio de RDC Contadores"
        className="relative z-10 inline-flex items-center gap-2 group"
      >
        <Logo
          mark="rdc"
          variante="white"
          alto={36}
          className="opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </Link>

      <div className="relative z-10 flex flex-col items-center w-full">
        {children}
      </div>

      <Link
        href="/"
        className="relative z-10 text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors inline-flex items-center gap-1.5"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Volver al sitio
      </Link>
    </div>
  );
}
