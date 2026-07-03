import type { ReactNode } from "react";

type LogoProps = {
  className?: string;
};

export function AppleLogo({ className = "h-4 w-4" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export function GoogleGLogo({ className = "h-4 w-4" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/** Wordmark legible a tamaño pequeño (el path completo se distorsiona). */
export function StripeWordmark({ className = "text-sm font-semibold text-[#635BFF]" }: LogoProps) {
  return (
    <span className={className} aria-hidden>
      stripe
    </span>
  );
}

export function VisaLogo({ className = "h-3 w-auto text-slate-500" }: LogoProps) {
  return (
    <svg viewBox="0 0 60 18" className={className} fill="currentColor" aria-hidden>
      <text x="0" y="15" fontFamily="Helvetica, Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="18" letterSpacing="-0.5">
        VISA
      </text>
    </svg>
  );
}

export function MastercardLogo({ className = "h-3.5 w-auto" }: LogoProps) {
  return (
    <svg viewBox="0 0 24 14" className={className} aria-hidden>
      <circle cx="9" cy="7" r="6" fill="#EB001B" />
      <circle cx="15" cy="7" r="6" fill="#F79E1B" fillOpacity="0.95" />
    </svg>
  );
}

export function AmexLogo({ className = "h-3 w-auto text-slate-500" }: LogoProps) {
  return (
    <svg viewBox="0 0 60 18" className={className} fill="currentColor" aria-hidden>
      <text x="0" y="14" fontFamily="Helvetica, Arial, sans-serif" fontWeight="900" fontSize="14" letterSpacing="0.5">
        AMEX
      </text>
    </svg>
  );
}

function MarcaPago({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-slate-800"
      aria-label={label}
      title={label}
    >
      {children}
    </span>
  );
}

export function ApplePayBadge() {
  return (
    <MarcaPago label="Apple Pay">
      <AppleLogo className="h-4 w-4 text-slate-900" />
      <span className="text-sm font-semibold text-slate-900 tracking-tight">Pay</span>
    </MarcaPago>
  );
}

export function GooglePayBadge() {
  return (
    <MarcaPago label="Google Pay">
      <GoogleGLogo />
      <span className="text-sm font-semibold text-slate-700 tracking-tight">Pay</span>
    </MarcaPago>
  );
}

export function StripeBadge() {
  return (
    <MarcaPago label="Stripe">
      <StripeWordmark />
    </MarcaPago>
  );
}

type FilaProps = {
  className?: string;
  incluirTarjetas?: boolean;
  variante?: "claro" | "oscuro";
};

/** Fila de marcas de pago — solo icono + texto, sin cajas ni bordes. */
export function FilaMetodosPago({
  className = "",
  incluirTarjetas = true,
  variante = "claro",
}: FilaProps) {
  const separador = variante === "oscuro" ? "bg-white/25" : "bg-slate-200";
  const textoClaro = variante === "oscuro" ? "text-white" : "";

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 ${className} ${textoClaro}`}
    >
      {incluirTarjetas ? (
        <>
          <VisaLogo className={variante === "oscuro" ? "text-white/90" : undefined} />
          <MastercardLogo />
          <AmexLogo className={variante === "oscuro" ? "text-white/90" : undefined} />
          <span className={`hidden sm:block w-px h-4 ${separador}`} aria-hidden />
        </>
      ) : null}
      {variante === "oscuro" ? (
        <>
          <span className="inline-flex items-center gap-1.5 text-white">
            <AppleLogo className="h-4 w-4" />
            <span className="text-sm font-semibold">Pay</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GoogleGLogo />
            <span className="text-sm font-semibold text-white/90">Pay</span>
          </span>
          <StripeWordmark className="text-sm font-semibold text-white" />
        </>
      ) : (
        <>
          <ApplePayBadge />
          <GooglePayBadge />
          <StripeBadge />
        </>
      )}
    </div>
  );
}
