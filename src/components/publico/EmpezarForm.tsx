"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Mail, MessageSquare, Phone, User } from "lucide-react";
import ConsentimientoDatosNotice from "@/components/publico/ConsentimientoDatosNotice";
import { Campo, CampoArea } from "@/components/ui/campo";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import {
  claseCtaUrgencia,
  copyCtaUrgencia,
  enriquecerMensajeConChecklist,
  fuenteLeadDesdeTono,
  type TonoUrgencia,
} from "@/lib/autocalificacion-urgencia";
import {
  formatearTelefonoMx,
  soloDigitosTelefono,
  telefonoMxValido,
} from "@/lib/telefono-mx";
import { LIMITES_LEAD, correoLeadInvalido, pareceTextoAleatorio } from "@/lib/leads-publicos";

type Errores = {
  nombre?: string;
  email?: string;
  telefono?: string;
  mensaje?: string;
  privacidad?: string;
};

type Props = {
  /** Tono del CTA según checklist (opcional: sin marcar = neutro). */
  tono?: TonoUrgencia;
  /** Ítems marcados; se anexan al mensaje al enviar. No bloquean el envío. */
  checklistItems?: string[];
  /** Variante embebida en layout de dos columnas. */
  embebido?: boolean;
};

export default function EmpezarForm({
  tono = "neutro",
  checklistItems = [],
  embebido = false,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [web, setWeb] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const iniciadoEn = useRef(Date.now());

  const tieneEmail = email.trim().length > 0 && !correoLeadInvalido(email.trim());
  /** El API exige correo; el teléfono refuerza el contacto pero no sustituye. */
  const formListo =
    nombre.trim().length >= LIMITES_LEAD.nombreMin &&
    tieneEmail &&
    mensaje.trim().length >= LIMITES_LEAD.mensajeMin &&
    aceptaPrivacidad;

  const validar = (): Errores => {
    const next: Errores = {};
    if (nombre.trim().length < LIMITES_LEAD.nombreMin) {
      next.nombre = "Indica tu nombre completo.";
    } else if (pareceTextoAleatorio(nombre.trim())) {
      next.nombre = "Usa tu nombre real (letras y, si puedes, apellido).";
    }
    if (!email.trim()) {
      next.email = "Agrega tu correo electrónico.";
    } else if (correoLeadInvalido(email.trim())) {
      next.email = "Correo electrónico inválido.";
    }
    if (telefono.trim() && !telefonoMxValido(telefono)) {
      next.telefono = "Usa 10 dígitos (ej. 33 1234 5678).";
    }
    if (mensaje.trim().length < LIMITES_LEAD.mensajeMin) {
      next.mensaje =
        "Cuéntanos un poco más: régimen, si ya tienes contador, etc.";
    } else if (
      mensaje.trim().split(/\s+/).filter(Boolean).length < 2 ||
      pareceTextoAleatorio(mensaje.trim())
    ) {
      next.mensaje = "Escribe con tus palabras en qué te podemos ayudar.";
    }
    if (!aceptaPrivacidad) {
      next.privacidad = "Debes aceptar el aviso de privacidad.";
    }
    return next;
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nextErrores = validar();
    setErrores(nextErrores);
    if (Object.keys(nextErrores).length > 0) return;

    setCargando(true);

    const telefonoLimpio = soloDigitosTelefono(telefono);
    const mensajeFinal = enriquecerMensajeConChecklist(
      mensaje.trim(),
      checklistItems
    );

    try {
      const res = await fetch("/api/publico/empezar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefonoLimpio || undefined,
          mensaje: mensajeFinal,
          fuente: fuenteLeadDesdeTono(tono),
          aceptaPrivacidad: true,
          web,
          iniciadoEn: iniciadoEn.current,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar. Intenta por WhatsApp.");
        return;
      }

      setExito(true);
    } catch {
      setError("Error de conexión. Escríbenos por WhatsApp.");
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
    return (
      <div
        className={
          embebido
            ? "rounded-3xl bg-white ring-1 ring-slate-200 shadow-lg p-6 sm:p-8 text-center"
            : "border-t border-slate-200 pt-8 text-center"
        }
      >
        <p className="text-lg font-bold text-slate-900">
          ¡Listo, {nombre.split(" ")[0]}!
        </p>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Recibimos tu solicitud
          {tono === "urgente"
            ? " con prioridad"
            : tono === "calido"
              ? " — te contactamos pronto"
              : ""}
          . Te respondemos en horario hábil, usualmente en menos de 2 horas.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/portal/login"
            className="inline-flex h-10 items-center justify-center px-4 rounded-lg bg-marca-navy text-white text-sm font-semibold hover:bg-marca-navy-soft transition"
          >
            Acceso clientes
          </Link>
          <a
            href={CONTACTO_PUBLICO.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center px-4 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            WhatsApp directo
          </a>
        </div>
      </div>
    );
  }

  const ctaLabel = cargando ? "Enviando…" : copyCtaUrgencia(tono);
  const ctaClass = claseCtaUrgencia(tono);

  return (
    <form
      onSubmit={(e) => void enviar(e)}
      className={
        embebido
          ? "relative rounded-3xl bg-white ring-1 ring-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden"
          : "relative space-y-5 border-t border-slate-200 pt-8"
      }
      noValidate
    >
      {embebido && (
        <div
          className={`absolute inset-x-0 top-0 h-1.5 ${
            tono === "urgente"
              ? "bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600"
              : tono === "calido"
                ? "bg-gradient-to-r from-indigo-600 to-violet-600"
                : "bg-gradient-to-r from-slate-700 to-slate-900"
          }`}
          aria-hidden
        />
      )}

      <div className={embebido ? "p-6 sm:p-8 space-y-5" : "contents"}>
        {embebido && (
          <div className="mb-1">
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                tono === "urgente"
                  ? "text-rose-600"
                  : tono === "calido"
                    ? "text-violet-600"
                    : "text-slate-500"
              }`}
            >
              Cotización
            </p>
            <h2 className="text-sm font-black text-slate-900">
              Tus datos para responderte
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Los checks de la izquierda son opcionales. Sin ellos también
              enviamos tu cotización.
            </p>
          </div>
        )}

        <div
          className="absolute -left-[10000px] h-0 w-0 overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="empresa_web">Sitio web</label>
          <input
            id="empresa_web"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={web}
            onChange={(e) => setWeb(e.target.value)}
          />
        </div>

        <Campo
          label="Tu nombre"
          name="nombre"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            if (errores.nombre) setErrores((p) => ({ ...p, nombre: undefined }));
          }}
          placeholder="Ej. Carla Hernández"
          autoComplete="name"
          error={errores.nombre}
          icon={<User size={16} strokeWidth={2} />}
        />
        <Campo
          label="Correo electrónico"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errores.email) setErrores((p) => ({ ...p, email: undefined }));
          }}
          placeholder="tu@correo.com"
          autoComplete="email"
          error={errores.email}
          icon={<Mail size={16} strokeWidth={2} />}
        />
        <Campo
          label="WhatsApp o teléfono"
          name="telefono"
          type="tel"
          value={telefono}
          onChange={(e) => {
            setTelefono(formatearTelefonoMx(e.target.value));
            if (errores.telefono)
              setErrores((p) => ({ ...p, telefono: undefined }));
          }}
          placeholder="33 1234 5678"
          autoComplete="tel"
          inputMode="numeric"
          maxLength={13}
          hint="Opcional. Solo números, 10 dígitos."
          error={errores.telefono}
          icon={<Phone size={16} strokeWidth={2} />}
        />
        <CampoArea
          label="¿En qué te ayudamos?"
          name="mensaje"
          value={mensaje}
          onChange={(e) => {
            setMensaje(e.target.value);
            if (errores.mensaje)
              setErrores((p) => ({ ...p, mensaje: undefined }));
          }}
          placeholder="Régimen fiscal, si ya tienes contador, empleados, etc."
          rows={3}
          error={errores.mensaje}
          icon={<MessageSquare size={16} strokeWidth={2} />}
        />

        <ConsentimientoDatosNotice
          checked={aceptaPrivacidad}
          onChange={(v) => {
            setAceptaPrivacidad(v);
            if (errores.privacidad)
              setErrores((p) => ({ ...p, privacidad: undefined }));
          }}
          error={errores.privacidad}
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando || !formListo}
          className={`inline-flex w-full items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-45 disabled:cursor-not-allowed ${ctaClass} ${
            tono === "urgente" && formListo && !cargando ? "animate-pulse" : ""
          }`}
        >
          {ctaLabel}
          {!cargando && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
        </button>

        {tono === "urgente" && (
          <p className="text-center text-[11px] font-bold text-rose-600">
            Prioridad alta — te contactamos lo antes posible hoy.
          </p>
        )}
        {tono === "calido" && (
          <p className="text-center text-[11px] font-semibold text-violet-600">
            Ya hay señales claras: mejor platicarlo pronto.
          </p>
        )}

        <p className="text-xs text-slate-500 text-center leading-relaxed">
          Sin contratos forzosos. También puedes{" "}
          <a
            href={CONTACTO_PUBLICO.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-marca-navy hover:underline"
          >
            escribir por WhatsApp
          </a>
          .
        </p>
      </div>
    </form>
  );
}
