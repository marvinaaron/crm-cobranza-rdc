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
          // chispa cobriza muy discreta, fuera de esquina (zona inferior-izquierda)
          "radial-gradient(ellipse 240px 200px at 18% 78%, rgba(234, 88, 12, 0.28), transparent 70%)",
          // toque menta intenso, fuera de esquina (zona superior derecha)
          "radial-gradient(ellipse 320px 280px at 78% 22%, rgba(52, 211, 153, 0.55), transparent 70%)",
          // gran mancha violeta dominante (centro-derecha hacia abajo)
          "radial-gradient(ellipse 1100px 900px at 70% 68%, rgba(124, 58, 237, 0.95), transparent 75%)",
          // gran mancha navy dominante (centro-izquierda hacia arriba)
          "radial-gradient(ellipse 1100px 900px at 28% 32%, rgba(15, 23, 80, 0.95), transparent 75%)",
          // base oscura uniforme para que las manchas tengan profundidad
          "linear-gradient(135deg, #050b24 0%, #1a0b3a 100%)",
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
