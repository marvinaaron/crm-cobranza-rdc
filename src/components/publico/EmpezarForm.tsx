"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, MessageSquare, Phone, User } from "lucide-react";
import ConsentimientoDatosNotice from "@/components/publico/ConsentimientoDatosNotice";
import { Boton } from "@/components/ui/boton";
import { Campo, CampoArea } from "@/components/ui/campo";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import {
  formatearTelefonoMx,
  soloDigitosTelefono,
  telefonoMxValido,
} from "@/lib/telefono-mx";

type Errores = {
  nombre?: string;
  email?: string;
  telefono?: string;
  mensaje?: string;
  privacidad?: string;
};

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EmpezarForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const validar = (): Errores => {
    const next: Errores = {};
    if (nombre.trim().length < 2) {
      next.nombre = "Indica tu nombre.";
    }
    if (!emailValido(email.trim())) {
      next.email = "Correo electrónico inválido.";
    }
    if (!telefonoMxValido(telefono)) {
      next.telefono = "Usa 10 dígitos (ej. 33 1234 5678) o déjalo vacío.";
    }
    if (mensaje.trim().length < 5) {
      next.mensaje = "Cuéntanos en qué te ayudamos (mínimo unas palabras).";
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

    try {
      const res = await fetch("/api/publico/empezar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefonoLimpio || undefined,
          mensaje: mensaje.trim(),
          aceptaPrivacidad: true,
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
      <div className="border-t border-slate-200 pt-8 text-center">
        <p className="text-lg font-bold text-slate-900">¡Listo, {nombre.split(" ")[0]}!</p>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Recibimos tu solicitud. Te contactamos en horario hábil, usualmente en
          menos de 2 horas.
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

  return (
    <form onSubmit={(e) => void enviar(e)} className="space-y-5 border-t border-slate-200 pt-8" noValidate>
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
            if (errores.telefono) setErrores((p) => ({ ...p, telefono: undefined }));
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
            if (errores.mensaje) setErrores((p) => ({ ...p, mensaje: undefined }));
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
            if (errores.privacidad) setErrores((p) => ({ ...p, privacidad: undefined }));
          }}
          error={errores.privacidad}
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Boton type="submit" fullWidth disabled={cargando}>
          {cargando ? "Enviando…" : "Solicitar información"}
        </Boton>

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
    </form>
  );
}
