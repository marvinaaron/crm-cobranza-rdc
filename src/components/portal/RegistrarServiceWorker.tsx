"use client";

import { useEffect } from "react";
import { registrarServiceWorker } from "@/lib/push/client";

/**
 * Registra el service worker en cuanto el portal del cliente carga.
 * No pide permisos de notificación: solo deja el SW listo para que, al
 * activar push desde Perfil, no haya retraso.
 */
export default function RegistrarServiceWorker() {
  useEffect(() => {
    void registrarServiceWorker();
  }, []);
  return null;
}
