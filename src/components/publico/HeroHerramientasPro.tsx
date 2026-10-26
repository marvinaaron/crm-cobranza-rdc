"use client";

import { useState } from "react";
import Link from "next/link";
import Fiscalino from "@/components/Fiscalino";
import ModalClientePro from "@/components/publico/ModalClientePro";
import {
  formatPrecioMxn,
  PRECIO_BUNDLE_MENSUAL,
} from "@/lib/herramientas/pricing";

export default function HeroHerramientasPro() {
  const [proAbierto, setProAbierto] = useState(false);

  return (
    <>
      <section className="hp-hero">
        <div className="hp-wrap hp-hero-grid">
          <div className="hp-hero-copy">
            <h1>
              Todas.
              <br />
              <em className="hp-ilimitadas" tabIndex={0}>
                Ilimitadas.
              </em>
            </h1>
            <p className="hp-hero-lead">
              RFC, RESICO, facturación, vencimiento, INPC, ISR y más — sin tope,
              con el mismo color de producto que ya conoces.
            </p>
          </div>

          <div className="hp-hero-acciones">
            <div className="hp-fiscalino" aria-hidden>
              <Fiscalino mood="elegant" size={148} />
            </div>
            <a href="#planes" className="hp-btn" data-chispa="">
              Ver planes desde {formatPrecioMxn(PRECIO_BUNDLE_MENSUAL)}/mes
            </a>
            <Link
              href="/portal/login?next=/herramientas/pro"
              className="hp-btn"
              data-ghost=""
            >
              Ya soy cliente RDC
            </Link>
            <button
              type="button"
              className="hp-btn"
              data-ghost=""
              onClick={() => setProAbierto(true)}
            >
              Ya soy cliente Pro
            </button>
          </div>
        </div>
      </section>

      <ModalClientePro
        abierto={proAbierto}
        onCerrar={() => setProAbierto(false)}
      />
    </>
  );
}
