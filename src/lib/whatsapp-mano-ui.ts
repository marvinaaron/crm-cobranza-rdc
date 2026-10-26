/** Ruta donde el visitante ocultó el botón flotante de WhatsApp. */
export const WA_MANO_STORAGE_KEY = "rdc-wa-mano-oculto-en";

/** Aviso a VolverArriba (y otros) cuando cambia la visibilidad del botón. */
export const WA_MANO_EVENT = "rdc-wa-mano";

export function waManoVisibleEn(pathname: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(WA_MANO_STORAGE_KEY) !== pathname;
  } catch {
    return true;
  }
}

export function avisarWaManoCambio() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WA_MANO_EVENT));
}
