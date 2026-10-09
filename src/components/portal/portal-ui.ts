/** Clases y utilidades compartidas del portal (paleta Skydropx: navy + morado). */

// Sin padding-top propio: el espacio respecto al header lo da el `main` del
// PortalShell (pt-16 móvil / lg:pt-14 desktop).
export const portalPage = "max-w-7xl mx-auto space-y-8 pb-8 w-full";

export const portalCard =
  "rdc-card bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-sm p-6 sm:p-7";

export const portalCardTitle =
  "text-[9px] font-black text-slate-400 uppercase tracking-widest";

/** Botón primario — navy Skydropx */
export const portalBtnPrimary =
  "bg-[var(--portal-navy)] hover:bg-[var(--portal-navy-hover)] text-white transition-colors";

/** Acento secundario — morado */
export const portalTextAccent = "text-[var(--portal-purple)]";

export const portalTextNavy = "text-[var(--portal-navy)]";

export function fmtMxn(n: number, decimals = 0) {
  return `$${n.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
