"use client";

import { type FacturaPago, facturaPdfArchivada, facturaPdfDisponible, facturaRegistrada } from "@/lib/facturas";

const FacturaIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

type Props = {
  factura: FacturaPago | undefined;
  pagadoMes: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
};

export default function BotonFacturaCobranza({
  factura,
  pagadoMes,
  onClick,
  className = "",
}: Props) {
  if (!pagadoMes) {
    return (
      <span className="text-slate-200 text-[10px]" title="Registre el pago para subir la factura">
        —
      </span>
    );
  }

  const registrada = facturaRegistrada(factura);
  const pdfOk = facturaPdfDisponible(factura);
  const archivada = facturaPdfArchivada(factura);

  let titulo = "Subir factura PDF del pago";
  let label = "Subir";
  let estilo =
    "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100";

  if (pdfOk) {
    titulo = "Factura PDF cargada · clic para ver o reemplazar";
    label = "PDF";
    estilo = "bg-slate-800 text-white hover:bg-slate-700";
  } else if (archivada || registrada) {
    titulo = "Facturado · el PDF se archivó tras 12 meses (puede volver a subirse)";
    label = "Facturado";
    estilo =
      "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${estilo} ${className}`}
    >
      <FacturaIcon />
      {label}
    </button>
  );
}
