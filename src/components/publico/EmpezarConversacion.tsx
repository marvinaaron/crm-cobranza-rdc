"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import Fiscalino from "@/components/Fiscalino";
import ConsentimientoDatosNotice from "@/components/publico/ConsentimientoDatosNotice";
import { correoLeadInvalido, LIMITES_LEAD } from "@/lib/leads-publicos";
import {
  desgloseSolucion,
  type PerfilCotizacion,
} from "@/lib/servicios-cotizables";
import {
  formatearTelefonoMx,
  soloDigitosTelefono,
  telefonoMxValido,
} from "@/lib/telefono-mx";
import "./empezar-flujo.css";

type Paso =
  | "hola"
  | "giro"
  | "cfdi"
  | "alta"
  | "rfc"
  | "cuando"
  | "nombre"
  | "contacto"
  | "cierre"
  | "exito";

type CfdiBanda = "hasta5" | "6a15" | "16a30" | "mas30";
type Alta = "si" | "no" | "nose";
type Cuando = "este" | "siguiente";

const PRECIO_RESICO = 812;

const BANDAS: { id: CfdiBanda; label: string }[] = [
  { id: "hasta5", label: "Hasta 5" },
  { id: "6a15", label: "6 a 15" },
  { id: "16a30", label: "16 a 30" },
  { id: "mas30", label: "Más de 30" },
];

function cfdiDeBanda(b: CfdiBanda): { cfdi: number; cfdiMas50: boolean } {
  if (b === "hasta5") return { cfdi: 5, cfdiMas50: false };
  if (b === "6a15") return { cfdi: 10, cfdiMas50: false };
  if (b === "16a30") return { cfdi: 22, cfdiMas50: false };
  return { cfdi: 50, cfdiMas50: true };
}

function bandaDePerfil(p: PerfilCotizacion): CfdiBanda | null {
  if (p.cfdiMas50) return "mas30";
  if (!p.cfdi || p.cfdi <= 1) return null;
  if (p.cfdi <= 5) return "hasta5";
  if (p.cfdi <= 15) return "6a15";
  if (p.cfdi <= 30) return "16a30";
  return "mas30";
}

function moodDePaso(paso: Paso) {
  if (paso === "hola" || paso === "cfdi" || paso === "contacto" || paso === "cierre") {
    return "elegant" as const;
  }
  if (paso === "giro" || paso === "alta" || paso === "nombre") return "happy" as const;
  if (paso === "exito") return "celebrating" as const;
  return "confident" as const;
}

const EASE_MOVE = "cubic-bezier(0.77, 0, 0.175, 1)";
const MOVE_MS = 200;

function motionReducida() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function bajarDesdeRect(
  from: DOMRect,
  toEl: HTMLElement,
  label: string,
  origen: HTMLElement | null
) {
  if (motionReducida()) return Promise.resolve();
  const to = toEl.getBoundingClientRect();
  const fromCs = origen ? getComputedStyle(origen) : null;
  const toCs = getComputedStyle(toEl);
  const ghost = document.createElement("div");
  ghost.className = "eq-ghost";
  ghost.textContent = label;
  ghost.style.position = "fixed";
  ghost.style.left = `${from.left}px`;
  ghost.style.top = `${from.top}px`;
  ghost.style.width = `${Math.max(from.width, 8)}px`;
  ghost.style.height = `${Math.max(from.height, 8)}px`;
  ghost.style.transformOrigin = "top left";
  ghost.style.zIndex = "40";
  ghost.style.pointerEvents = "none";
  if (fromCs) {
    ghost.style.background = fromCs.backgroundColor;
    ghost.style.color = fromCs.color;
    ghost.style.borderRadius = fromCs.borderRadius;
  }
  document.body.appendChild(ghost);
  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const sx = from.width ? to.width / from.width : 1;
  const sy = from.height ? to.height / from.height : 1;
  return ghost
    .animate(
      [
        {
          transform: "translate(0px, 0px) scale(1, 1)",
          opacity: 1,
          backgroundColor: fromCs?.backgroundColor ?? toCs.backgroundColor,
          color: fromCs?.color ?? toCs.color,
          borderRadius: fromCs?.borderRadius ?? toCs.borderRadius,
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
          opacity: 1,
          backgroundColor: toCs.backgroundColor,
          color: toCs.color,
          borderRadius: toCs.borderRadius,
        },
      ],
      { duration: MOVE_MS, easing: EASE_MOVE, fill: "forwards" }
    )
    .finished.finally(() => ghost.remove())
    .then(() => undefined);
}

function rutaPasos(opts: { hola: boolean; resico: boolean }): Paso[] {
  const pasos: Paso[] = [];
  if (opts.hola) pasos.push("hola");
  pasos.push("giro", "cfdi");
  if (opts.resico) pasos.push("alta");
  pasos.push("rfc", "cuando", "nombre", "contacto", "cierre");
  return pasos;
}

type Props = {
  serviciosIds?: string[];
  perfil?: PerfilCotizacion;
};

export default function EmpezarConversacion({
  serviciosIds = [],
  perfil,
}: Props) {
  const desglose = useMemo(
    () => desgloseSolucion(serviciosIds),
    [serviciosIds]
  );
  const llegaResico = desglose.soloResicoPublico;
  const muestraHola = serviciosIds.length === 0;
  const [quiereResico, setQuiereResico] = useState(
    llegaResico || muestraHola
  );
  const [paso, setPaso] = useState<Paso>(muestraHola ? "hola" : "giro");
  const [dir, setDir] = useState<"fwd" | "back">("fwd");

  const [giro, setGiro] = useState("");
  const [banda, setBanda] = useState<CfdiBanda | null>(
    () => (perfil ? bandaDePerfil(perfil) : null)
  );
  const [alta, setAlta] = useState<Alta | "">("");
  const [rfc, setRfc] = useState("");
  const [cuando, setCuando] = useState<Cuando | "">("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [privacidad, setPrivacidad] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [web, setWeb] = useState("");
  const [listos, setListos] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (serviciosIds.length > 0) s.add("Servicio");
    return s;
  });
  const iniciadoEn = useRef(Date.now());
  const lineaRef = useRef<HTMLUListElement>(null);
  const giroRef = useRef<HTMLInputElement>(null);
  const rfcRef = useRef<HTMLInputElement>(null);
  const nombreRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const precioFijo = quiereResico && banda === "hasta5";
  const honorarios = Boolean(banda) && !precioFijo;
  const etiquetaPrecio = `$${PRECIO_RESICO}`;
  const pasos = rutaPasos({ hola: muestraHola, resico: quiereResico });
  const indice = Math.max(0, pasos.indexOf(paso));
  const puedeAtras = paso !== "exito" && indice > 0;

  const ids = quiereResico
    ? serviciosIds.length
      ? serviciosIds
      : ["impuestos", "facturacion"]
    : serviciosIds;

  const ir = (next: Paso, sentido: "fwd" | "back" = "fwd") => {
    setDir(sentido);
    setError(null);
    setPaso(next);
  };

  const soltar = (
    next: Paso,
    origen: HTMLElement | null,
    chipKey: string,
    label: string
  ) => {
    const from =
      origen && !motionReducida() ? origen.getBoundingClientRect() : null;
    setListos((prev) => {
      const s = new Set(prev);
      s.add(chipKey);
      return s;
    });
    ir(next);
    if (!from) return;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const chip = lineaRef.current?.querySelector<HTMLElement>(
          `[data-k="${chipKey}"]`
        );
        if (!chip) return;
        chip.dataset.wait = "true";
        void bajarDesdeRect(from, chip, label, origen).finally(() => {
          delete chip.dataset.wait;
        });
      });
    });
  };

  const atras = () => {
    if (!puedeAtras) return;
    ir(pasos[indice - 1]!, "back");
  };

  const recap: { paso: Paso; k: string; v: string }[] = [];
  if (quiereResico) {
    recap.push({
      paso: "hola",
      k: "Servicio",
      v: precioFijo
        ? `RESICO · ${etiquetaPrecio}`
        : honorarios
          ? "RESICO · honorarios"
          : `RESICO · ${etiquetaPrecio}`,
    });
  } else if (ids.length) {
    recap.push({ paso: "giro", k: "Servicio", v: "Paquete armado" });
  }
  if (giro.trim()) recap.push({ paso: "giro", k: "Giro", v: giro.trim() });
  if (banda) {
    recap.push({
      paso: "cfdi",
      k: "Facturas",
      v: `${BANDAS.find((b) => b.id === banda)?.label} / mes`,
    });
  }
  if (alta) {
    recap.push({
      paso: "alta",
      k: "Alta 626",
      v: alta === "si" ? "Ya está" : alta === "no" ? "Hay que dar de alta" : "Aún no lo sabe",
    });
  }
  if (rfc.trim()) recap.push({ paso: "rfc", k: "RFC", v: rfc.trim().toUpperCase() });
  if (cuando) {
    recap.push({
      paso: "cuando",
      k: "Inicio",
      v: cuando === "este" ? "Este mes" : "El mes que entra",
    });
  }
  if (nombre.trim()) recap.push({ paso: "nombre", k: "Nombre", v: nombre.trim() });
  if (email.trim()) recap.push({ paso: "contacto", k: "Correo", v: email.trim() });
  const linea = recap.filter((r) => listos.has(r.k));

  const enviar = async () => {
    if (!privacidad) {
      setError("Acepta el aviso de privacidad para continuar.");
      return;
    }
    if (nombre.trim().length < LIMITES_LEAD.nombreMin) {
      setError("Escribe tu nombre completo.");
      return;
    }
    if (correoLeadInvalido(email.trim())) {
      setError("Necesito un correo válido para activarte.");
      return;
    }
    if (telefono.trim() && !telefonoMxValido(telefono)) {
      setError("El WhatsApp debe tener 10 dígitos, o déjalo vacío.");
      return;
    }
    const cfdiVals = banda ? cfdiDeBanda(banda) : { cfdi: 1, cfdiMas50: false };
    const altaLabel =
      alta === "si" ? "sí, ya está en 626" : alta === "no" ? "no, hay que dar de alta" : "aún no lo sabe";
    const mensaje = [
      quiereResico
        ? "Quiero contratar Impuestos RESICO + Facturación."
        : `Quiero empezar con el paquete que armé (${ids.join(", ") || "a cotizar"}).`,
      precioFijo
        ? `Honorarios: ${etiquetaPrecio} IVA incluido / mes.`
        : "Honorarios: presupuesto mensual según la información compartida.",
      `Giro: ${giro.trim()}.`,
      `Facturas al mes: ${banda ? BANDAS.find((b) => b.id === banda)?.label : "no precisó"}.`,
      quiereResico ? `RESICO 626: ${altaLabel}.` : "",
      rfc.trim() ? `RFC: ${rfc.trim().toUpperCase()}.` : "RFC: no lo compartió ahora.",
      `Inicio: ${cuando === "siguiente" ? "el mes que entra" : "este mes"}.`,
    ]
      .filter(Boolean)
      .join(" ");

    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/publico/empezar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: soloDigitosTelefono(telefono) || undefined,
          mensaje,
          fuente: precioFijo ? "empezar-resico" : "empezar-honorarios",
          aceptaPrivacidad: true,
          web,
          iniciadoEn: iniciadoEn.current,
          perfil: {
            ingresos: 0,
            ingresosMas300: false,
            cfdi: cfdiVals.cfdi,
            cfdiMas50: cfdiVals.cfdiMas50,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo confirmar. Intenta de nuevo.");
        return;
      }
      ir("exito");
    } catch {
      setError("Error de conexión. Recarga e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const titulo =
    paso === "hola"
      ? "¿Arrancamos con RESICO?"
      : paso === "giro"
        ? "¿A qué te dedicas?"
        : paso === "cfdi"
          ? "¿Cuántas facturas emites al mes?"
          : paso === "alta"
            ? "¿Ya estás en RESICO?"
            : paso === "rfc"
              ? "¿Tienes RFC a la mano?"
              : paso === "cuando"
                ? "¿Cuándo arrancamos?"
                : paso === "nombre"
                  ? "¿Cómo te llamas?"
                  : paso === "contacto"
                    ? "¿Por dónde te activamos?"
                    : paso === "cierre"
                      ? "Confirma y somos socios"
                      : precioFijo
                        ? "Este precio ya es tuyo"
                        : "Ya somos socios";

  const primerNombre = nombre.trim().split(/\s+/)[0] ?? "";

  const nota =
    paso === "cfdi"
      ? "Solo para honorarios. Nadie más lo ve."
      : paso === "alta" && honorarios
        ? "Con este volumen armamos honorarios a tu medida."
        : paso === "exito"
          ? precioFijo
            ? `${primerNombre ? `${primerNombre}, ` : ""}los ${etiquetaPrecio} al mes ya quedan de tu lado. El despacho te escribe en horario hábil para activar el portal.`
            : `${primerNombre ? `${primerNombre}, ` : ""}con lo que nos compartiste armamos tus honorarios. El despacho te escribe en horario hábil.`
          : null;

  return (
    <div className="eq-page" data-dir={dir}>
      <header className="eq-bar">
        {puedeAtras ? (
          <button type="button" className="eq-back" onClick={atras}>
            Atrás
          </button>
        ) : (
          <span className="eq-back" data-ghost="true" aria-hidden>
            Atrás
          </span>
        )}
        {paso !== "exito" ? (
          <ol className="eq-ticks" aria-label="Avance">
            {pasos.map((p, i) => (
              <li key={p} data-on={i <= indice ? "true" : undefined} />
            ))}
          </ol>
        ) : (
          <span />
        )}
        <span className="eq-count">
          {paso === "exito" ? "Listo" : `${indice + 1} / ${pasos.length}`}
        </span>
      </header>

      <div className="eq-body">
        <section className="eq-view" key={paso}>
          <div className="eq-host">
            <Fiscalino mood={moodDePaso(paso)} size={256} className="eq-owl" />
          </div>
          <h1>{titulo}</h1>
          {nota ? (
            <p className="eq-nota">
          {paso === "cfdi" ? (
            <>
                  <LockIcon /> {nota}
                </>
              ) : (
                nota
              )}
            </p>
          ) : null}

          {paso === "giro" ? (
            <form
              className="eq-field"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (giro.trim().length < 2) {
                    setError("Dime a qué te dedicas, aunque sea en una frase.");
                    return;
                  }
                  soltar("cfdi", null, "Giro", giro.trim());
                }}
            >
              <input
                ref={giroRef}
                className="eq-input"
                value={giro}
                onChange={(e) => setGiro(e.target.value)}
                placeholder="Ej. renta de Airbnb, Uber, consultoría…"
                autoComplete="organization-title"
                autoFocus
              />
            </form>
          ) : null}

          {paso === "cfdi" ? (
            <div className="eq-opts">
              {BANDAS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className="eq-opt"
                  data-on={banda === b.id ? "true" : undefined}
                  onClick={(e) => {
                    setBanda(b.id);
                    soltar(
                      quiereResico ? "alta" : "rfc",
                      e.currentTarget,
                      "Facturas",
                      `${b.label} / mes`
                    );
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          ) : null}

          {paso === "alta" ? (
            <div className="eq-opts">
              {(
                [
                  ["si", "Sí, ya estoy"],
                  ["no", "No, hay que darme de alta"],
                  ["nose", "Aún no lo sé"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className="eq-opt"
                  data-on={alta === id ? "true" : undefined}
                  onClick={(e) => {
                    const v =
                      id === "si"
                        ? "Ya está"
                        : id === "no"
                          ? "Hay que dar de alta"
                          : "Aún no lo sabe";
                    setAlta(id);
                    soltar("rfc", e.currentTarget, "Alta 626", v);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          {paso === "rfc" ? (
            <form
              className="eq-field"
                onSubmit={(e) => {
                  e.preventDefault();
                  const t = rfc.trim().toUpperCase();
                  setRfc(t);
                  if (t) soltar("cuando", null, "RFC", t);
                  else ir("cuando");
                }}
            >
              <input
                ref={rfcRef}
                className="eq-input"
                value={rfc}
                onChange={(e) => setRfc(e.target.value.toUpperCase())}
                placeholder="RFC (opcional)"
                autoComplete="off"
                spellCheck={false}
                autoFocus
              />
            </form>
          ) : null}

          {paso === "cuando" ? (
            <div className="eq-opts">
              <button
                type="button"
                className="eq-opt"
                data-on={cuando === "este" ? "true" : undefined}
                onClick={(e) => {
                  setCuando("este");
                  soltar("nombre", e.currentTarget, "Inicio", "Este mes");
                }}
              >
                Este mes
              </button>
              <button
                type="button"
                className="eq-opt"
                data-on={cuando === "siguiente" ? "true" : undefined}
                onClick={(e) => {
                  setCuando("siguiente");
                  soltar("nombre", e.currentTarget, "Inicio", "El mes que entra");
                }}
              >
                El mes que entra
              </button>
            </div>
          ) : null}

          {paso === "nombre" ? (
            <form
              className="eq-field"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (nombre.trim().length < LIMITES_LEAD.nombreMin) {
                    setError("Nombre y apellido, por favor.");
                    return;
                  }
                  soltar("contacto", null, "Nombre", nombre.trim());
                }}
            >
              <input
                ref={nombreRef}
                className="eq-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
                autoComplete="name"
                autoFocus
              />
            </form>
          ) : null}

          {paso === "contacto" ? (
            <form
              className="eq-field"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (correoLeadInvalido(email.trim())) {
                    setError("Correo inválido.");
                    return;
                  }
                  if (telefono.trim() && !telefonoMxValido(telefono)) {
                    setError("WhatsApp a 10 dígitos, o déjalo vacío.");
                    return;
                  }
                  soltar("cierre", null, "Correo", email.trim());
                }}
            >
              <input
                ref={emailRef}
                className="eq-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                autoFocus
              />
              <input
                className="eq-input"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(formatearTelefonoMx(e.target.value))}
                placeholder="WhatsApp (10 dígitos)"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={13}
              />
            </form>
          ) : null}

          {paso === "cierre" ? (
            <div className="eq-cierre">
              <ConsentimientoDatosNotice
                compacto
                checked={privacidad}
                onChange={setPrivacidad}
                error={error && !privacidad ? error : undefined}
              />
            </div>
          ) : null}

          {paso === "exito" ? (
            <div className="eq-exito">
              <p className="eq-done">
                Gracias por elegirnos. Cuando te activemos, tu portal ya es el de un cliente RDC.
              </p>
              <Link href="/portal/login" className="eq-cta" data-on="true">
                Ir al portal
              </Link>
            </div>
          ) : null}

          {error && (paso !== "cierre" || privacidad) ? (
            <p className="eq-err">{error}</p>
          ) : null}

          {paso === "hola" ||
          paso === "giro" ||
          paso === "rfc" ||
          paso === "nombre" ||
          paso === "contacto" ||
          paso === "cierre" ? (
            <div className="eq-dock">
              {paso === "hola" ? (
                <>
                  <button
                    type="button"
                    className="eq-cta"
                    data-on="true"
                    onClick={(e) => {
                      setQuiereResico(true);
                      soltar(
                        "giro",
                        e.currentTarget,
                        "Servicio",
                        `RESICO · $${PRECIO_RESICO}`
                      );
                    }}
                  >
                    Sí, contratar RESICO · {etiquetaPrecio}
                  </button>
                  <Link href="/cotizar" className="eq-cta">
                    Armar otro paquete
                  </Link>
                </>
              ) : null}

              {paso === "giro" ? (
                <button
                  type="button"
                  className="eq-cta"
                  data-on="true"
                  onClick={() => {
                    if (giro.trim().length < 2) {
                      setError("Dime a qué te dedicas, aunque sea en una frase.");
                      return;
                    }
                    soltar("cfdi", giroRef.current, "Giro", giro.trim());
                  }}
                >
                  Seguir
                </button>
              ) : null}

              {paso === "rfc" ? (
                <button
                  type="button"
                  className="eq-cta"
                  data-on="true"
                  onClick={() => {
                    const t = rfc.trim().toUpperCase();
                    setRfc(t);
                    if (t) soltar("cuando", rfcRef.current, "RFC", t);
                    else ir("cuando");
                  }}
                >
                  {rfc.trim() ? "Seguir" : "Saltar"}
                </button>
              ) : null}

              {paso === "nombre" ? (
                <button
                  type="button"
                  className="eq-cta"
                  data-on="true"
                  onClick={() => {
                    if (nombre.trim().length < LIMITES_LEAD.nombreMin) {
                      setError("Nombre y apellido, por favor.");
                      return;
                    }
                    soltar("contacto", nombreRef.current, "Nombre", nombre.trim());
                  }}
                >
                  Seguir
                </button>
              ) : null}

              {paso === "contacto" ? (
                <button
                  type="button"
                  className="eq-cta"
                  data-on="true"
                  onClick={() => {
                    if (correoLeadInvalido(email.trim())) {
                      setError("Correo inválido.");
                      return;
                    }
                    if (telefono.trim() && !telefonoMxValido(telefono)) {
                      setError("WhatsApp a 10 dígitos, o déjalo vacío.");
                      return;
                    }
                    soltar("cierre", emailRef.current, "Correo", email.trim());
                  }}
                >
                  Seguir
                </button>
              ) : null}

              {paso === "cierre" ? (
                <button
                  type="button"
                  className="eq-cta"
                  data-on="true"
                  disabled={cargando}
                  onClick={() => void enviar()}
                >
                  {cargando
                    ? "Confirmando…"
                    : precioFijo
                      ? `Sí, somos socios · ${etiquetaPrecio} / mes`
                      : "Sí, somos socios"}
                </button>
              ) : null}
            </div>
          ) : null}

          {paso === "hola" ? (
            <nav className="eq-links" aria-label="Para entender RESICO">
              <Link href="/servicios/resico" target="_blank" rel="noopener noreferrer">
                Guía RESICO
              </Link>
              <Link
                href="/blog/que-es-resico-y-quien-puede-usarlo"
                target="_blank"
                rel="noopener noreferrer"
              >
                Artículo en el blog
              </Link>
            </nav>
          ) : null}

          {paso === "rfc" ? (
            <nav className="eq-links" aria-label="Si no tienes el RFC">
              <Link href="/herramientas/rfc" target="_blank" rel="noopener noreferrer">
                Calcular RFC
              </Link>
              <Link
                href="/blog/como-calcular-tu-rfc-con-homoclave"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cómo se arma
              </Link>
            </nav>
          ) : null}
        </section>

        {paso !== "exito" ? (
          <nav className="eq-line" aria-label="Lo que vas confirmando">
            <ul ref={lineaRef} data-rdc-scroll-allow>
              {linea.map((r) => (
                <li key={r.k}>
                  <button
                    type="button"
                    data-k={r.k}
                    onClick={() => {
                      if (r.paso === "hola" && !muestraHola) return;
                      ir(r.paso, "back");
                    }}
                  >
                    {r.v}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>

      <div className="eq-hp" aria-hidden>
        <label htmlFor="empresa_web">Sitio web</label>
        <input
          id="empresa_web"
          name="website"
          value={web}
          tabIndex={-1}
          autoComplete="off"
          onChange={(e) => setWeb(e.target.value)}
        />
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
