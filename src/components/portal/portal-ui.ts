/** Clases y utilidades compartidas del portal (alineadas al panel admin). */

export const portalPage = "max-w-7xl mx-auto space-y-8 pb-8 w-full";

export const portalCard =
  "bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-7";

export const portalCardTitle =
  "text-[9px] font-black text-slate-400 uppercase tracking-widest";

export function fmtMxn(n: number, decimals = 0) {
  return `$${n.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
