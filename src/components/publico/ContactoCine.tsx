"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Fiscalino from "@/components/Fiscalino";
import {
  CONTACTO_PUBLICO,
  waLink,
} from "@/lib/contacto-publico";
import { hrefEmpezarResico } from "@/lib/servicios-cotizables";
import ContactoQuickForm from "./ContactoQuickForm";
import EstadoDisponibilidad from "./EstadoDisponibilidad";
import { IconoMarcaRed, REDES_MARCA } from "./redes-marca";
import "./contacto-cine.css";

const WA_PLATICAR = waLink(
  "Hola. Vi tu página de contacto y quiero platicar por WhatsApp antes de agendar o contratar.",
);

const HREF_RESICO = hrefEmpezarResico();

const SEMANA = [
  { letra: "D", nombre: "Domingo", habil: false },
  { letra: "L", nombre: "Lunes", habil: true },
  { letra: "M", nombre: "Martes", habil: true },
  { letra: "M", nombre: "Miércoles", habil: true },
  { letra: "J", nombre: "Jueves", habil: true },
  { letra: "V", nombre: "Viernes", habil: true },
  { letra: "S", nombre: "Sábado", habil: false },
] as const;

const TRAZO = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconoCalendario() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...TRAZO}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconoAlta() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...TRAZO}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

/** Tienda simple. */
function IconoWaTienda() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M3 9h18l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H5.7a1.5 1.5 0 0 1-1.5-1.3L3 9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M3 9 4.8 4.5h14.4L21 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 21.5v-6h4v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Teléfono simple. */
function IconoWaLlamar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M8.2 3.4c.4-1 1.6-1.35 2.5-.7l1.7 1.2c.7.5.85 1.45.35 2.15L11.8 7.7c-.25.35-.25.8 0 1.15l2.4 3.9c.25.4.7.6 1.15.5l1.85-.35c.85-.15 1.65.45 1.7 1.3l.15 2.15c.05.95-.7 1.75-1.65 1.7-3.4-.2-6.7-2.5-9-5.9-2.2-3.25-3-7-2.35-10.35.15-.85.9-1.45 1.75-1.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** iPhone gris + chat WhatsApp iOS; el globo verde refleja el mensaje del form. */
function MockupWhatsAppPhone({ mensaje }: { mensaje: string }) {
  const texto = mensaje.trim();
  return (
    <div className="ct-wa-phone" aria-hidden>
      <div className="ct-wa-phone-frame">
        <div className="ct-wa-phone-island" />
        <div className="ct-wa-phone-screen">
          <header className="ct-wa-chat-bar">
            <span className="ct-wa-back" />
            <span className="ct-wa-avatar">
              <Image
                src="/logos/rdc-white.png"
                alt=""
                width={22}
                height={22}
                className="ct-wa-avatar-img"
              />
            </span>
            <span className="ct-wa-chat-meta">
              <b>Mi Contador</b>
            </span>
            <span className="ct-wa-actions-glass">
              <span className="ct-wa-act">
                <IconoWaTienda />
              </span>
              <span className="ct-wa-act" data-call="">
                <IconoWaLlamar />
              </span>
            </span>
          </header>
          <div className="ct-wa-chat">
            <p className="ct-wa-bubble" data-in="">
              Hola, soy Fiscalino. ¿En qué te ayudo con el SAT?
            </p>
            <p
              className="ct-wa-bubble"
              data-out=""
              data-empty={texto ? undefined : ""}
            >
              {texto || "Tu mensaje aparece aquí…"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactoCine() {
  const [mensaje, setMensaje] = useState("");

  return (
    <div className="ct-page">
      <section className="ct-intro">
        <h1>Tres formas de llegar.</h1>
        <div className="ct-copy">
          <p>
            Elige una. No hay orden correcto: depende de si quieres una
            videollamada, platicar ahora, o arrancar RESICO porque ya lo
            tienes claro.
          </p>
          <div className="ct-disp">
            <EstadoDisponibilidad claro />
            <div className="ct-horario">
              <ol
                className="ct-semana"
                aria-label="Lunes a viernes, 9:00 a 5:00"
              >
                {SEMANA.map((d, i) => (
                  <li
                    key={`${d.nombre}-${i}`}
                    data-on={d.habil ? "" : undefined}
                  >
                    <abbr title={d.nombre}>{d.letra}</abbr>
                  </li>
                ))}
              </ol>
              <p className="ct-hora">9:00 – 5:00</p>
            </div>
          </div>
        </div>
        <div className="ct-host">
          <p className="ct-globo">
            Hola, soy Fiscalino.
            <span>
              Tú eliges la puerta. Yo te conecto con el despacho.
            </span>
          </p>
          <Fiscalino mood="elegant" size={148} />
        </div>
      </section>

      <section className="ct-vias" aria-label="Cómo contactarnos">
        <article className="ct-via">
          <h2>Agendar asesoría 1:1</h2>
          <p>
            Videollamada de unos 40 minutos. Te conocemos y conoces el
            despacho. La primera no se cobra — todavía no hay contrato.
          </p>
          <a
            className="ct-btn"
            href={CONTACTO_PUBLICO.calendly.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconoCalendario />
            Buscar horario
          </a>
        </article>

        <article className="ct-via">
          <h2>Hablar por WhatsApp</h2>
          <p>
            Si quieres platicar primero, sin calendario. Fiscalino toma el
            mensaje para que no esperes; el contador entra cuando el caso lo
            pide.
          </p>
          <a
            className="ct-btn"
            data-wa=""
            href={WA_PLATICAR}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconoMarcaRed red="whatsapp" size={18} />
            Abrir WhatsApp
          </a>
        </article>

        <article className="ct-via">
          <h2>Contratar RESICO</h2>
          <p>
            Ya vas por ese régimen y quieres el alta. Fiscalino te hace unas
            preguntas y confirmas el servicio — el primer mes se ve en el
            despacho, aquí no hay pasarela.
          </p>
          <Link className="ct-btn" data-hire="" href={HREF_RESICO}>
            <IconoAlta />
            Empezar alta
          </Link>
        </article>
      </section>

      <section className="ct-block">
        <div className="ct-lado">
          <h2>Si vas por WhatsApp, dos líneas bastan.</h2>
          <p>
            Compártenos tu info de contacto y lo que te está pasando con el SAT.
            Se abre un chat con tu explicación y nosotros la atendemos de
            inmediato (Fiscalino nos ayuda mucho con eso). En cuanto llega a
            manos del equipo, un contador continúa la interacción.
          </p>
          <MockupWhatsAppPhone mensaje={mensaje} />
        </div>
        <div className="ct-form" data-ui>
          <h2 id="quickform-title">Lo mandas de un clic</h2>
          <ContactoQuickForm
            origen="contacto"
            mensaje={mensaje}
            onMensajeChange={setMensaje}
            invitarCaret
          />
        </div>
      </section>

      <nav className="ct-redes" aria-label="Redes">
        {REDES_MARCA.map((r) => (
          <a
            key={r.nombre}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={r.nombre}
          >
            <IconoMarcaRed red={r.red} />
          </a>
        ))}
      </nav>
    </div>
  );
}
