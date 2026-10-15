import Link from "next/link";
import Logo from "@/components/publico/Logo";

/**
 * Envoltura de login / recuperar / cambiar contraseña.
 * Mismo lenguaje que el portal: canvas gris iOS, logo negro, navy.
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
        background: "#f2f2f7",
        ["--portal-navy" as string]: "#1a164d",
        ["--portal-navy-hover" as string]: "#231f55",
      }}
    >
      <Link
        href="/"
        aria-label="Ir al inicio de RDC Contadores"
        className="relative z-10 inline-flex items-center gap-2 group"
      >
        <Logo
          mark="rdc"
          variante="black"
          alto={36}
          className="opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </Link>

      <div className="relative z-10 flex flex-col items-center w-full">
        {children}
      </div>

      <Link
        href="/"
        className="relative z-10 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center gap-1.5"
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
