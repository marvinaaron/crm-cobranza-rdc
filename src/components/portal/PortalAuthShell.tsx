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
          // chispa cobriza muy discreta, fuera de esquina
          "radial-gradient(ellipse 240px 200px at 22% 82%, rgba(234, 88, 12, 0.26), transparent 70%)",
          // toque menta intenso, fuera de esquina
          "radial-gradient(ellipse 320px 260px at 82% 18%, rgba(52, 211, 153, 0.55), transparent 70%)",
          // mancha azul cielo (mismo tono de 'PORTAL DEL CLIENTE')
          "radial-gradient(ellipse 520px 420px at 88% 78%, rgba(147, 197, 253, 0.55), transparent 72%)",
          // mancha violeta intensa (centro hacia derecha)
          "radial-gradient(ellipse 900px 760px at 70% 60%, rgba(124, 58, 237, 0.85), transparent 75%)",
          // mancha navy gigante y dominante (cubre la mayor parte del lienzo)
          "radial-gradient(ellipse 1700px 1300px at 30% 38%, rgba(10, 18, 70, 0.98), transparent 78%)",
          // base muy oscura para profundidad
          "linear-gradient(135deg, #04081e 0%, #0c0a2e 100%)",
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
