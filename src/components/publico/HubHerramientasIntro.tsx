"use client";

import { useState } from "react";
import ModalClientePro from "@/components/publico/ModalClientePro";
import {
  formatPrecioMxn,
  PRECIO_BUNDLE_MENSUAL,
} from "@/lib/herramientas/pricing";

export default function HubHerramientasIntro() {
  const [proAbierto, setProAbierto] = useState(false);

  return (
    <>
      <header className="hh-intro">
        <div className="hh-intro-titulo">
          <h1>Herramientas fiscales</h1>
          <button
            type="button"
            className="hh-pro-btn"
            onClick={() => setProAbierto(true)}
          >
            <span className="hh-pro-btn-label">Herramientas ilimitadas</span>
            <span className="hh-pro-btn-precio">
              desde {formatPrecioMxn(PRECIO_BUNDLE_MENSUAL)}/mes
            </span>
          </button>
        </div>
        <p>
          Calculadoras con icono RDC y color de producto:{" "}
          <strong>3 consultas gratis</strong> por herramienta. Abajo, tablas
          oficiales (ISR, INPC, UMA, salario, recargos y divisas) sin tope. Sin
          registro.
        </p>
        <nav className="hh-saltos" aria-label="Secciones">
          <a href="#calculadoras">Calculadoras</a>
          <a href="#tablas">Tablas fiscales</a>
          <a href="#cotizar">Que lo haga el despacho</a>
        </nav>
      </header>
      <ModalClientePro
        abierto={proAbierto}
        onCerrar={() => setProAbierto(false)}
      />
    </>
  );
}
