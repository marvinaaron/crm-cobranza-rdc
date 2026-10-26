"use client";

import { useState, type ReactNode } from "react";
import { waLink } from "@/lib/contacto-publico";
import "./cta-cine-band.css";

type Props = {
  titulo?: ReactNode;
  subtitulo?: string;
  origenWa?: string;
};

const WA_DEFAULT =
  "Hola. Vi las herramientas del sitio y quiero que lo hagan por mí.";

export default function CtaCineBand({
  titulo = (
    <>
      ¿Lo hacemos
      <br />
      por ti?
    </>
  ),
  subtitulo = "Cotiza tu paquete o escríbenos por WhatsApp. Primera llamada gratis.",
  origenWa = WA_DEFAULT,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<"pf" | "pm">("pf");

  return (
    <section className="hc-cta" id="cotizar" aria-labelledby="hc-cta-titulo">
      <div className="hc-cta-wrap hc-cta-grid">
        <div className="hc-cta-copy">
          <h2 id="hc-cta-titulo">{titulo}</h2>
          <p>{subtitulo}</p>
        </div>

        <form className="hc-dialog" data-ui action="/cotizar" method="get">
          <h3>Empieza aquí</h3>
          <label>
            ¿Cómo te llamamos?
            <input
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="given-name"
              placeholder="María"
            />
          </label>
          <label>
            Tu régimen
            <span className="hc-choice">
              <button
                type="button"
                aria-pressed={tipo === "pf"}
                onClick={() => setTipo("pf")}
              >
                Persona física
              </button>
              <button
                type="button"
                aria-pressed={tipo === "pm"}
                onClick={() => setTipo("pm")}
              >
                Persona moral
              </button>
            </span>
          </label>
          <input type="hidden" name="tipo" value={tipo} />
          <button className="hc-btn" type="submit">
            Cotizar
          </button>
          <a
            className="hc-wa"
            href={waLink(
              nombre.trim()
                ? `${origenWa} Me llamo ${nombre.trim()}.`
                : origenWa
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            O hablar por WhatsApp
          </a>
        </form>
      </div>
    </section>
  );
}
