"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, MessageSquare, Phone, User } from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { Campo, CampoArea } from "@/components/ui/campo";
import { Tarjeta } from "@/components/ui/tarjeta";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

export default function EmpezarForm() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const res = await fetch("/api/publico/empezar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, telefono, mensaje }),
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
      <Tarjeta className="text-center">
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
      </Tarjeta>
    );
  }

  return (
    <Tarjeta>
      <form onSubmit={(e) => void enviar(e)} className="space-y-4">
        <Campo
          label="Tu nombre"
          name="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Carla Hernández"
          autoComplete="name"
          required
          icon={<User size={16} strokeWidth={2} />}
        />
        <Campo
          label="Correo electrónico"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          autoComplete="email"
          required
          icon={<Mail size={16} strokeWidth={2} />}
        />
        <Campo
          label="WhatsApp o teléfono"
          name="telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="33 1234 5678"
          autoComplete="tel"
          inputMode="tel"
          hint="Opcional, pero nos ayuda a responderte más rápido."
          icon={<Phone size={16} strokeWidth={2} />}
        />
        <CampoArea
          label="¿En qué te ayudamos?"
          name="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Régimen fiscal, si ya tienes contador, empleados, etc."
          rows={3}
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
    </Tarjeta>
  );
}
