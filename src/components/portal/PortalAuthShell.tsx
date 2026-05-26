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
          // chispa cobriza muy discreta, pegada a la esquina inferior izquierda
          "radial-gradient(ellipse 28vmax 22vmax at 5% 100%, rgba(234, 88, 12, 0.22), transparent 60%)",
          // toque menta en la esquina superior derecha
          "radial-gradient(ellipse 32vmax 26vmax at 100% 0%, rgba(52, 211, 153, 0.55), transparent 60%)",
          // azul cielo en la esquina inferior derecha (eco a 'PORTAL DEL CLIENTE')
          "radial-gradient(ellipse 42vmax 36vmax at 100% 100%, rgba(147, 197, 253, 0.55), transparent 65%)",
          // violeta empujado a la esquina superior izquierda (no al centro)
          "radial-gradient(ellipse 50vmax 42vmax at 0% 0%, rgba(124, 58, 237, 0.75), transparent 65%)",
          // mancha navy ENORME centrada (domina todo el centro de la pantalla)
          "radial-gradient(ellipse 110vmax 90vmax at 50% 50%, rgba(8, 14, 60, 0.98), transparent 75%)",
          // base muy oscura para profundidad
          "linear-gradient(135deg, #03061a 0%, #0a0926 100%)",
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
