/** Clases y utilidades compartidas del portal (alineadas al panel admin). */

// Sin padding-top propio: el espacio respecto al header lo da el `main` del
// PortalShell (pt-16 móvil / lg:pt-2), igual que en la página de Solicitudes.
export const portalPage = "max-w-7xl mx-auto space-y-8 pb-8 w-full";

export const portalCard =
  "rdc-card bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-sm p-6 sm:p-7";

export const portalCardTitle =
  "text-[9px] font-black text-slate-400 uppercase tracking-widest";

export function fmtMxn(n: number, decimals = 0) {
  return `$${n.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
