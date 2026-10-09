"use client";

type Props = {
  titulo: string;
  detalle?: string;
  className?: string;
};

/**
 * Banner de confirmación tras una acción del cliente (subir comprobante,
 * enviar solicitud, etc.). Deja claro qué pasa después.
 */
export default function PortalConfirmacionExito({
  titulo,
  detalle = "Tu contador lo revisará y te avisamos por notificación.",
  className = "",
}: Props) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3.5 ${className}`}
      role="status"
    >
      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-emerald-800 leading-snug">{titulo}</p>
        {detalle ? (
          <p className="text-[11px] font-bold text-emerald-700/90 mt-0.5 leading-relaxed">
            {detalle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
