"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import MapaGlifoMexico, { INFO_ESTADOS } from "./MapaGlifoMexico";
import "./nosotros-cine.css";

const CONTPAQI = [
  {
    src: "/marcas/contpaqi-contabilidad.png",
    alt: "CONTPAQi Contabilidad",
    texto:
      "Contabilidad electrónica, pólizas, balanzas y reportes alineados al SAT.",
  },
  {
    src: "/marcas/contpaqi-nominas.png",
    alt: "CONTPAQi Nóminas",
    texto: "Cálculo y timbrado de nómina, CFDI 4.0, IMSS, Infonavit e ISN.",
  },
  {
    src: "/marcas/contpaqi-vende.png",
    alt: "CONTPAQi Vende",
    texto: "Facturación electrónica y control de ventas para PF y PM.",
  },
] as const;

export default function NosotrosCine() {
  const [estado, setEstado] = useState("jal");
  const [mapaListo, setMapaListo] = useState(false);
  const info = INFO_ESTADOS[estado];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMapaListo(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setMapaListo(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div className="ns-page">
      <section className="ns-intro">
        <h1>Somos un despacho contable en Guadalajara.</h1>
        <div className="ns-abrir">
          <p>
            RDC Contadores somos un despacho contable y fiscal con más de 10
            años trabajando y especializándonos. Llevamos el cumplimiento de
            personas físicas y morales — declaraciones, acuses y honorarios —
            en{" "}
            <mark className="ns-marca-texto">un portal y una app propios</mark>.
            No un Excel que llega por correo.
          </p>
          <p>
            <mark className="ns-marca-texto">
              <strong>Nuestra oficina es virtual</strong>
            </mark>
            , y eso nos abre las
            puertas para atender en toda la República. El SAT no pregunta desde
            qué ciudad presentamos: WhatsApp, videollamada y el mismo portal,
            estés en Guadalajara o en Chihuahua.
          </p>
          <p>
            Atendemos RESICO, actividades empresariales, plataformas
            tecnológicas, arrendamiento, sueldos y personas morales. Los libros
            corren en CONTPAQi, autorizado ante el SAT. Cuando contratas, sabes
            quién firma tu contabilidad.
          </p>
          <p>
            Contamos con certificaciones y nos actualizamos de forma constante
            para estar al día con reformas y cambios en las leyes vigentes.{" "}
            <mark className="ns-marca-texto">La capacitación es continua</mark>{" "}
            en espacios especializados, entre ellos CEFOR, de la Cámara de
            Comercio de Guadalajara.
          </p>
        </div>
        <aside className="ns-sitio">
          <p>
            El sitio no es un folleto. Trae las mismas calculadoras y tablas
            que usamos en el despacho.
          </p>
          <ul>
            <li>
              <Link href="/herramientas/rfc">Calcula tu RFC</Link>
            </li>
            <li>
              <Link href="/herramientas/isr-resico">ISR RESICO</Link>
            </li>
            <li>
              <Link href="/herramientas/calculadora-facturacion">
                Factura neto → CFDI
              </Link>
            </li>
            <li>
              <Link href="/herramientas/vencimiento-declaracion">
                Vencimiento de declaración
              </Link>
            </li>
            <li>
              <Link href="/herramientas/recargos-sat">Recargos SAT</Link>
            </li>
            <li>
              <Link href="/herramientas/isr-2026">Tarifas ISR 2026</Link>
            </li>
            <li>
              <Link href="/comparativa">Portal vs otros despachos</Link>
            </li>
            <li>
              <Link href="/herramientas">Todas las herramientas</Link>
            </li>
          </ul>
          <p>
            Si ya sabes qué contratar, <Link href="/empezar">empieza</Link>. Si
            quieres armar el paquete, <Link href="/cotizar">cotiza</Link>.
          </p>
        </aside>
        <ul className="ns-hechos">
          <li>
            <Image
              src="/icon-192-v2.png"
              alt=""
              width={48}
              height={48}
              className="ns-marca"
            />
            <span>
              <strong>Portal y app propios.</strong> Cumplimiento, acuses y
              honorarios en el celular del cliente. Lo ves el mismo día, no
              esperas el PDF del mes.
            </span>
          </li>
          <li>
            <Image
              src="/fiscalino/fiscalino-elegant.png"
              alt=""
              width={48}
              height={48}
            />
            <span>
              <strong>Fiscalino, nuestra IA.</strong> Toma el primer WhatsApp
              para que la conversación no se quede en visto. El contador entra
              cuando el caso lo pide.
            </span>
          </li>
          <li>
            <Image
              src="/cotizar/iconos/sat.png"
              alt=""
              width={48}
              height={48}
              className="ns-marca"
            />
            <span>
              <strong>CONTPAQi y SAT.</strong> Contabilidad electrónica, nómina
              y facturación en software certificado. Las declaraciones salen a
              tiempo.
            </span>
          </li>
        </ul>
      </section>

      <section className="ns-hero">
        <h2>Atendemos clientes en siete estados.</h2>
        <div className={mapaListo ? "ns-glyph is-in" : "ns-glyph"} aria-hidden>
          <MapaGlifoMexico seleccion={estado} onSelect={setEstado} />
        </div>
        <aside className="ns-nota">
          <h3>¿Importa que no estemos en el mismo estado de la República?</h3>
          <p>
            Casi todos nos lo preguntan. No. La contabilidad es 100% digital, así
            que el servicio se adapta en línea: WhatsApp, portal y las mismas
            obligaciones ante el SAT, estés en Chihuahua o en Puebla.
          </p>
          <p>
            La base es Guadalajara. El SAT no pregunta desde qué ciudad
            presentamos. Hablas con la misma persona, no con un buzón. Toca un
            estado en el mapa.
          </p>
          {info ? (
            <p className="ns-live" aria-live="polite">
              {info.ciudad} · {info.perfil}
            </p>
          ) : null}
        </aside>
        <div className="ns-dock">
          <Link className="ns-btn" href="/empezar">
            Empezar
          </Link>
          <Link className="ns-btn" data-ghost="" href="/contacto">
            Escribirnos
          </Link>
        </div>
      </section>

      <section className="ns-block" data-layout="persona">
        <h2>Hablas con tu contador, no con un call center.</h2>
        <div className="ns-copy">
          <p>
            La primera llamada o videollamada no se cobra. Queremos conocerte:
            a qué te dedicas, cómo facturas y qué te está pesando con el SAT.
            Tú conoces el despacho y nuestros servicios. Todavía no hay
            contrato.
          </p>
          <p>
            Si nos escribes por WhatsApp, Fiscalino — nuestra IA — responde la
            primera interacción para que no esperes. El contador entra en cuanto
            el caso lo pide, y sigue siendo la misma persona de tu lado.
          </p>
          <p>
            Cuando contratas, sabes quién firma tu contabilidad — y tienes su
            WhatsApp. No un buzón, no un call center.
          </p>
        </div>
        <figure className="ns-cita">
          <span className="ns-cita-mark" aria-hidden>
            {"\u201C"}
          </span>
          <blockquote>
            No vendo contabilidad. Vendo tranquilidad: que cuando llegue el día
            17, sepas que todo está en regla y al día.
          </blockquote>
          <figcaption>
            <div className="ns-foto">
              <Image
                src="/equipo/aaron.jpg"
                alt=""
                width={320}
                height={320}
              />
            </div>
            <cite>Aaron Rosales · Contador público</cite>
          </figcaption>
        </figure>
      </section>

      <section className="ns-block">
        <h2>Los libros corren en CONTPAQi.</h2>
        <div className="ns-copy">
          <p>
            El estándar de despachos serios en México, autorizado ante el SAT.
            No un Excel que llega por correo.
          </p>
        </div>
        <div className="ns-logos">
          {CONTPAQI.map((p) => (
            <figure key={p.alt}>
              <Image
                src={p.src}
                alt={p.alt}
                width={240}
                height={72}
                className="h-14 w-auto object-contain"
              />
              <figcaption>{p.texto}</figcaption>
            </figure>
          ))}
        </div>
        <p className="ns-note">
          CONTPAQi® y los logotipos de sus productos son marcas registradas por
          Computación en Acción, S.A. de C.V.
        </p>
      </section>

      <section className="ns-block" data-layout="portal">
        <div className="ns-copy">
          <h2>El portal es nuestro.</h2>
          <p>
            Cumplimiento, honorarios y acuses en un solo lugar. Lo ves en el
            celular, no esperas el PDF del mes.
          </p>
        </div>
        <div className="ns-ui" data-ui>
          <p>Tu portal</p>
          <div className="ns-row">
            <span>Opinión 32-D</span>
            <span>Positiva</span>
          </div>
          <div className="ns-row">
            <span>IVA mensual</span>
            <span>Presentado</span>
          </div>
          <div className="ns-row">
            <span>ISR RESICO</span>
            <span>Presentado</span>
          </div>
          <div className="ns-row">
            <span>Honorarios</span>
            <span>Al corriente</span>
          </div>
        </div>
      </section>

      <section className="ns-cta">
        <h2>Si estás en otro estado, también.</h2>
        <div className="ns-cta-foot">
          <p>
            Te asignamos contador y te activamos el portal. La distancia no
            cambia el servicio.
          </p>
          <div className="ns-dock">
            <Link className="ns-btn" href="/empezar">
              Empezar
            </Link>
            <Link className="ns-btn" data-ghost="" href="/contacto">
              Escribirnos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
