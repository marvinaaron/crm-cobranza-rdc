"use client";

import Link from "next/link";
import Fiscalino from "@/components/Fiscalino";
import ClienteProAccesoLogin from "@/components/publico/ClienteProAccesoLogin";
import { FilaMetodosPago } from "@/components/publico/PaymentMethodLogos";
import "./modal-cliente-pro.css";

type Props = {
  abierto: boolean;
  onCerrar: () => void;
};

export default function ModalClientePro({ abierto, onCerrar }: Props) {
  if (!abierto) return null;

  const loginNext = encodeURIComponent("/herramientas");

  return (
    <div
      className="mp-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cliente-pro-titulo"
    >
      <button
        type="button"
        className="mp-backdrop"
        onClick={onCerrar}
        aria-label="Cerrar"
      />
      <div className="mp-sheet">
        <header className="mp-head">
          <div className="mp-head-copy">
            <h2 id="modal-cliente-pro-titulo">
              Herramientas
              <br />
              <em>sin límite</em>
            </h2>
            <p>
              3 consultas gratis por calculadora. Cliente Pro desbloquea el
              suite ilimitado.
            </p>
          </div>
          <div className="mp-head-owl" aria-hidden>
            <Fiscalino mood="elegant" size={112} />
          </div>
        </header>

        <div className="mp-body">
          <div className="mp-grid">
            <div className="mp-card" data-login="">
              <ClienteProAccesoLogin onCerrar={onCerrar} variante="cine" />
            </div>

            <div className="mp-card">
              <b className="mp-card-titulo">¿Cliente del despacho?</b>
              <p className="mp-card-lead">
                Si ya trabajas con RDC, entra al portal. Los clientes activos
                tienen <strong>Pro incluido</strong>, sin costo extra.
              </p>
              <ul className="mp-checks">
                <li>RFC, RESICO, facturación, vencimiento y SDI ilimitados</li>
                <li>Mismo acceso que tu portal de contabilidad</li>
              </ul>
              <Link
                href={`/portal/login?next=${loginNext}`}
                onClick={onCerrar}
                className="mp-btn"
                data-navy=""
              >
                Ingresar al portal
              </Link>
            </div>
          </div>

          <div className="mp-planes">
            <b>¿Quieres ver planes y pagar?</b>
            <span>
              Compara precios, qué incluye cada plan y paga con los métodos que
              ya conoces.
            </span>
            <div className="mp-metodos">
              <FilaMetodosPago incluirTarjetas={false} />
            </div>
            <Link
              href="/herramientas/pro"
              onClick={onCerrar}
              className="mp-btn"
              data-chispa=""
            >
              Ver planes Cliente Pro+
            </Link>
          </div>

          <button type="button" className="mp-cerrar" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
