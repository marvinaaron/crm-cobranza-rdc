import Link from "next/link";
import Logo from "@/components/publico/Logo";

/**
 * Envoltura común para las páginas de autenticación del portal de cliente
 * (login, recuperar contraseña, cambiar contraseña).
 *
 * Renderiza:
 *  - Fondo con gradiente navy→violeta (puente visual entre el portal del
 *    cliente —navy— y la consola admin —violeta—).
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
      className="min-h-screen flex flex-col items-center justify-center p-6 gap-6"
      style={{
        background: [
          // brillo violeta sutil en la esquina superior derecha
          "radial-gradient(at 100% 0%, rgba(167, 139, 250, 0.35), transparent 55%)",
          // brillo azul en la esquina inferior izquierda
          "radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.30), transparent 55%)",
          // navy → azul → indigo → violeta en diagonal
          "linear-gradient(135deg, #050b24 0%, #0f1e57 25%, #1e3a8a 50%, #3730a3 75%, #6d28d9 100%)",
        ].join(", "),
      }}
    >
      <Link
        href="/"
        aria-label="Ir al inicio de RDC Contadores"
        className="inline-flex items-center gap-2 group"
      >
        <Logo
          mark="rdc"
          variante="white"
          alto={36}
          className="opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </Link>

      {children}

      <Link
        href="/"
        className="text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors inline-flex items-center gap-1.5"
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
