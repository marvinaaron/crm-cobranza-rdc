"use client";

import { useState } from "react";
import ModalClientePro from "@/components/publico/ModalClientePro";
import {
  formatPrecioMxn,
  PRECIO_HERRAMIENTA_MENSUAL,
} from "@/lib/herramientas/pricing";

export default function HubHerramientasIntro() {
  const [proAbierto, setProAbierto] = useState(false);

  return (
    <>
      <header className="hh-intro">
        <div className="hh-intro-copy">
          <h1>
            Herramientas
            <br />
            <em>fiscales</em>
          </h1>
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
        </div>

        <aside className="hh-intro-pro">
          <div className="hh-intro-pro-card">
            <div className="hh-intro-pro-main">
              <p className="hh-intro-pro-titulo">ilimitadas</p>
              <p className="hh-intro-pro-texto">
                ¿Quieres acceso ilimitado a nuestras herramientas Pro?
                Calculadora de RFC, cálculo de ISR RESICO, calculadora de
                recargos SAT y más — sin tope de consultas.
              </p>
            </div>
            <button
              type="button"
              className="hh-pro-btn"
              onClick={() => setProAbierto(true)}
            >
              <span className="hh-pro-btn-label">Quiero ser Cliente Pro</span>
              <span className="hh-pro-btn-precio">
                desde {formatPrecioMxn(PRECIO_HERRAMIENTA_MENSUAL)}/mes
              </span>
            </button>
          </div>
        </aside>
      </header>
      <ModalClientePro
        abierto={proAbierto}
        onCerrar={() => setProAbierto(false)}
      />
    </>
  );
}
