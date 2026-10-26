"use client";

import { useId, useState } from "react";
import { FileText, Mail, User } from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { Campo, CampoArea } from "@/components/ui/campo";
import ConsentimientoDatosNotice from "@/components/publico/ConsentimientoDatosNotice";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

const MAX_PALABRAS = 100;

function contarPalabras(texto: string) {
  const t = texto.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function limitarPalabras(texto: string, max: number) {
  const t = texto.trimStart();
  if (!t.trim()) return texto;
  const partes = t.split(/(\s+)/);
  let palabras = 0;
  let out = "";
  for (const p of partes) {
    if (/^\s+$/.test(p)) {
      if (palabras > 0) out += p;
      continue;
    }
    if (palabras >= max) break;
    out += p;
    palabras += 1;
  }
  return out;
}

function mensajeDatos(nombre: string, rfc: string, correo: string) {
  const partes = [`Hola Contador! Soy ${nombre.trim()}`];
  if (rfc.trim()) partes.push(`mi RFC es ${rfc.trim()}`);
  if (correo.trim()) partes.push(`mi correo ${correo.trim()}`);
  if (partes.length === 1) return `${partes[0]}.`;
  if (partes.length === 2) return `${partes[0]}, ${partes[1]}.`;
  return `${partes[0]}, ${partes[1]} y ${partes[2]}.`;
}

/**
 * Formulario express de contacto → WhatsApp con mensaje estructurado.
 */

export default function ContactoQuickForm({
  origen,
  mensaje: mensajeCtrl,
  onMensajeChange,
  invitarCaret = false,
}: {
  origen?: string;
  /** Si se pasa, el mensaje queda controlado (p. ej. live en el mockup). */
  mensaje?: string;
  onMensajeChange?: (value: string) => void;
  /** Caret azul parpadeante tipo iPhone cuando el área está vacía. */
  invitarCaret?: boolean;
}) {
  const caretId = useId();
  const [nombre, setNombre] = useState("");
  const [rfc, setRfc] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensajeLocal, setMensajeLocal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mensajeFocus, setMensajeFocus] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);

  const controlado = mensajeCtrl !== undefined;
  const mensaje = controlado ? mensajeCtrl : mensajeLocal;
  const setMensaje = (v: string) => {
    const limitado = limitarPalabras(v, MAX_PALABRAS);
    if (!controlado) setMensajeLocal(limitado);
    onMensajeChange?.(limitado);
  };

  const palabras = contarPalabras(mensaje);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !mensaje.trim()) {
      setError("Necesitamos tu nombre y un mensaje.");
      return;
    }
    if (!aceptaPrivacidad) {
      setError("Acepta el aviso de privacidad para continuar.");
      return;
    }
    setError(null);

    const msg1 = mensajeDatos(nombre, rfc, correo);
    const msg2 = [
      origen === "contacto"
        ? "Vi tu página web y quise contactarte por lo siguiente:"
        : "Quise contactarte por lo siguiente:",
      mensaje.trim(),
    ].join("\n");

    const url1 = CONTACTO_PUBLICO.whatsapp.buildUrl(msg1);
    const url2 = CONTACTO_PUBLICO.whatsapp.buildUrl(msg2);
    window.open(url1, "_blank", "noopener,noreferrer");
    window.setTimeout(() => {
      window.open(url2, "_blank", "noopener,noreferrer");
    }, 650);
  };

  const mostrarCaret =
    invitarCaret && !mensaje.trim() && !mensajeFocus;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3"
      aria-labelledby="quickform-title"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo
          id="qf-nombre"
          label="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Carla Hernández"
          autoComplete="name"
          icon={<User size={16} strokeWidth={2} />}
        />
        <Campo
          id="qf-rfc"
          label="RFC (opcional)"
          value={rfc}
          onChange={(e) => setRfc(e.target.value.toUpperCase())}
          placeholder="XAXX010101000"
          autoComplete="off"
          autoCapitalize="characters"
          icon={<FileText size={16} strokeWidth={2} />}
        />
      </div>

      <Campo
        id="qf-correo"
        label="Correo (opcional)"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        placeholder="tu@correo.com"
        autoComplete="email"
        inputMode="email"
        icon={<Mail size={16} strokeWidth={2} />}
      />

      <div className="ct-qf-area">
        <CampoArea
          id="qf-mensaje"
          label="¿En qué te ayudamos?"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onFocus={() => setMensajeFocus(true)}
          onBlur={() => setMensajeFocus(false)}
          placeholder={
            invitarCaret
              ? "Cuéntanos brevemente tu situación…"
              : "Cuéntanos brevemente tu situación: régimen, empleados, dudas…"
          }
          rows={invitarCaret ? 6 : 3}
          className={invitarCaret ? "ct-qf-area-ios" : undefined}
          aria-describedby={
            [mostrarCaret ? caretId : null, "qf-mensaje-limite"]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        {mostrarCaret ? (
          <span id={caretId} className="ct-qf-caret" aria-hidden />
        ) : null}
        <p
          id="qf-mensaje-limite"
          className={`mt-1 text-xs text-right ${
            palabras >= MAX_PALABRAS ? "text-slate-700 font-medium" : "text-slate-400"
          }`}
        >
          {palabras}/{MAX_PALABRAS} palabras
        </p>
      </div>

      <ConsentimientoDatosNotice
        id="qf-acepta-privacidad"
        checked={aceptaPrivacidad}
        onChange={(v) => {
          setAceptaPrivacidad(v);
          if (v) setError(null);
        }}
        error={
          error && !aceptaPrivacidad
            ? error
            : undefined
        }
      />

      {error && aceptaPrivacidad ? (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      ) : null}

      <Boton type="submit" variante="whatsapp" fullWidth>
        Enviar por WhatsApp
      </Boton>

      <p className="text-xs text-slate-500 text-center leading-relaxed">
        Se abren dos mensajes listos: tus datos y luego el motivo. Tú solo
        envías.
      </p>
    </form>
  );
}
