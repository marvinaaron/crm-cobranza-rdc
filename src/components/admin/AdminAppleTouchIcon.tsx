"use client";

import { useEffect } from "react";

const ICON_LIGHT = "/apple-touch-icon-admin.png";
const ICON_DARK = "/apple-touch-icon-admin-dark.png";

/**
 * iOS/Safari ignora media queries en <link rel="apple-touch-icon"> estáticos.
 * Este componente elige el ícono correcto en tiempo de ejecución según el
 * tema del sistema, justo antes de que el usuario use "Añadir a pantalla de inicio".
 */
export default function AdminAppleTouchIcon() {
  useEffect(() => {
    const aplicar = () => {
      const oscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const href = oscuro ? ICON_DARK : ICON_LIGHT;

      document
        .querySelectorAll('link[rel="apple-touch-icon"]')
        .forEach((el) => el.remove());

      const link = document.createElement("link");
      link.rel = "apple-touch-icon";
      link.sizes = "180x180";
      link.href = `${href}?v=3`;
      document.head.appendChild(link);
    };

    aplicar();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => aplicar();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return null;
}
