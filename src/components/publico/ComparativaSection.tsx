"use client";

import { useEffect, useRef, useState } from "react";
import Fiscalino from "@/components/Fiscalino";
import "./comparativa.css";

type Fila = {
  tab: string;
  aspecto: string;
  tradicional: string;
  rdc: string;
  precio?: string;
};

const FILAS: Fila[] = [
  {
    tab: "Información",
    aspecto: "Cómo recibes información",
    tradicional: "WhatsApp suelto que se pierde entre mensajes",
    rdc: "Portal exclusivo con todo respaldado y ordenado",
  },
  {
    tab: "Declarado",
    aspecto: "Saber si ya declaraste",
    tradicional: "Esperas un “ya quedó” y rezas que sea cierto",
    rdc: "Lo ves en tu calendario, con fecha, hora y acuse",
  },
  {
    tab: "Acuses",
    aspecto: "Acuses del SAT",
    tradicional: "Tienes que pedirlos cada vez que los necesitas",
    rdc: "Disponibles 24/7 en tu portal, descargables al instante",
  },
  {
    tab: "Honorarios",
    aspecto: "Honorarios",
    tradicional:
      "Nadie recuerda si ya pagaste. A fin de año, la sorpresa",
    rdc: "RESICO al mes. Subes el comprobante al portal y se valida el mismo día",
    precio: "$812",
  },
  {
    tab: "Respuesta",
    aspecto: "Tiempo de respuesta",
    tradicional: "Días. A veces semanas",
    rdc: "Horas, en horario hábil (Lun-Vie 9 a 17)",
  },
  {
    tab: "Avisos",
    aspecto: "Recordatorios fiscales",
    tradicional: "Tú los persigues. Si los olvidas, multa",
    rdc: "RDC te avisa antes y lo deja agendado en tu calendario",
  },
  {
    tab: "e.firma",
    aspecto: "Vigencia de tu e.firma",
    tradicional: "“Mándame la tuya cuando la necesite”",
    rdc: "Vigencia visible en el portal. Aviso antes de vencer",
  },
  {
    tab: "Calendario",
    aspecto: "Calendario fiscal",
    tradicional: "Tienes que memorizar fechas o usar Excel",
    rdc: "Sincroniza a iPhone, Google Calendar u Outlook",
  },
  {
    tab: "Quién atiende",
    aspecto: "Quién te atiende",
    tradicional:
      "Un auxiliar diferente cada vez. Tienes que explicar todo de nuevo",
    rdc: "Tu propio contador asignado. Conoce tu negocio desde el día 1",
  },
  {
    tab: "Si te vas",
    aspecto: "Si dejas de ser cliente",
    tradicional: "Te quedas sin papeles y sin histórico",
    rdc: "Te llevas todo el histórico exportado. Sin candados",
  },
];

const N = FILAS.length;
const PRESS =
  "touch-manipulation select-none active:scale-[0.97] transition-transform duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]";

export default function ComparativaSection() {
  const pista = useRef<HTMLElement>(null);
  const [paso, setPaso] = useState(0);
  const [tipo, setTipo] = useState<"pf" | "pm">("pf");
  const [nombre, setNombre] = useState("María");
  const fila = FILAS[paso] ?? FILAS[0];

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    let raf = 0;
    const leer = () => {
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const scrolled = Math.min(
        Math.max(-el.getBoundingClientRect().top, 0),
        total,
      );
      const i = Math.min(N - 1, Math.floor((scrolled / total) * N));
      setPaso((prev) => (prev === i ? prev : i));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(leer);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    leer();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const irAPaso = (i: number) => {
    const el = pista.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    if (total <= 0) {
      setPaso(i);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top =
      el.getBoundingClientRect().top +
      window.scrollY +
      ((i + 0.35) / N) * total;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="vs-page">
      <section
        ref={pista}
        className="vs-track"
        id="vs-lista"
        aria-label="Despachos tradicionales vs el portal RDC"
      >
        <div className="vs-stage">
          <div className="vs-pane vs-pane-old">
            <p className="vs-side">
              <span className="vs-side-emoji" aria-hidden="true">
                📝
              </span>
              Despachos tradicionales
            </p>
            <div className="vs-owl vs-owl-panic" aria-hidden="true">
              <Fiscalino
                mood="desperate"
                size={240}
                className="[animation:none]"
              />
            </div>
            <div className="vs-mid">
              <div className="vs-price-slot" aria-hidden="true">
                {fila.precio ? (
                  <>
                    <p className="vs-price">{fila.precio}</p>
                    <p className="vs-iva">IVA incluido</p>
                  </>
                ) : null}
              </div>
              <div key={`old-${paso}`} className="vs-copy">
                <p className="vs-claim">{fila.tradicional}</p>
              </div>
            </div>
          </div>

          <div className="vs-pane vs-pane-new">
            <p className="vs-side">
              <img
                src="/apple-touch-icon-v2.png"
                alt=""
                width={64}
                height={64}
              />
              RDC
            </p>
            <div className="vs-owl" aria-hidden="true">
              <Fiscalino
                mood="elegant"
                size={240}
                className="[animation:none]"
              />
            </div>
            <div className="vs-mid">
              <div className="vs-price-slot">
                {fila.precio ? (
                  <>
                    <p className="vs-price">{fila.precio}</p>
                    <p className="vs-iva">IVA incluido</p>
                  </>
                ) : null}
              </div>
              <div key={`new-${paso}`} className="vs-copy">
                <p className="vs-claim">{fila.rdc}</p>
              </div>
              <a className="vs-btn" href="#vs-entrar">
                Cotizar
              </a>
            </div>
          </div>

          <div className="vs-pila-wrap">
            <div className="vs-pila">
              <div className="vs-pila-track">
                <span
                  className="vs-progress"
                  style={{ transform: `scaleX(${(paso + 1) / N})` }}
                />
              </div>
              <ol className="vs-pila-pasos">
                {FILAS.map((item, i) => (
                  <li key={item.tab}>
                    <button
                      type="button"
                      onClick={() => irAPaso(i)}
                      aria-current={i === paso ? "step" : undefined}
                      aria-label={item.tab}
                      className={`${PRESS} vs-pila-dot ${i === paso ? "is-on" : ""} ${i < paso ? "is-done" : ""}`}
                    />
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <p key={`paso-${paso}`} className="vs-paso">
            <span className="vs-paso-cine" aria-hidden="true">
              {fila.tab}
            </span>
            <span className="vs-paso-navy">{fila.tab}</span>
          </p>
        </div>
      </section>

      <section className="vs-cta" id="vs-entrar">
        <div className="vs-wrap vs-cta-grid">
          <div className="vs-cta-copy">
            <h2>
              Aún
              <br />
              puedes
            </h2>
            <p>
              Arma tu paquete. Tu presupuesto, a tu medida.
            </p>
          </div>

          <form className="vs-dialog" data-ui action="/cotizar" method="get">
            <h3>Empieza aquí</h3>
            <label>
              ¿Cómo te llamamos?
              <input
                name="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="given-name"
              />
            </label>
            <label>
              Tu régimen
              <span className="vs-choice">
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
            <button className="vs-btn" type="submit">
              Cotizar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
