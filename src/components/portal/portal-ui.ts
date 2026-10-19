/** Lenguaje visual del portal: iOS / Savio. Fondo gris, bloques blancos, navy. */

export const portalPage =
  "max-w-2xl mx-auto space-y-7 pb-8 w-full pt-5 sm:pt-6";

export const portalInicioPage =
  "max-w-xl mx-auto space-y-7 pb-8 w-full pt-5 sm:pt-6";

/** Visor fiscal / tablas anchas. */
export const portalPageWide =
  "max-w-5xl mx-auto space-y-7 pb-8 w-full pt-5 sm:pt-6";

export const portalCard =
  "bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6";

export const portalCardTitle = "text-[13px] font-semibold text-slate-500";

export const portalAuthCard =
  "w-full max-w-md bg-white dark:bg-[#2c2c2e] rounded-2xl p-8 sm:p-9";

export const portalBtnPrimary =
  "inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[var(--portal-navy)] hover:bg-[var(--portal-navy-hover)] text-white text-[15px] font-semibold transition-colors disabled:opacity-50";

export const portalTextAccent = "text-[var(--portal-navy)]";

export const portalTextNavy = "text-[var(--portal-navy)]";

export function fmtMxn(n: number, decimals = 0) {
  return `$${n.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
