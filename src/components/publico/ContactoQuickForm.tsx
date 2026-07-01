"use client";

import { useState } from "react";
import { Phone, User } from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { Campo, CampoArea } from "@/components/ui/campo";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

/**
 * Formulario express de contacto → WhatsApp con mensaje estructurado.
 */

export default function ContactoQuickForm() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !mensaje.trim()) {
      setError("Necesitamos tu nombre y un mensaje.");
      return;
    }
    setError(null);
    const cuerpo = [
      `Hola, soy ${nombre.trim()}.`,
      telefono.trim() ? `Mi teléfono: ${telefono.trim()}.` : null,
      "",
      mensaje.trim(),
      "",
      "(Enviado desde rdcontadores.com)",
    ]
      .filter(Boolean)
      .join("\n");

    const url = CONTACTO_PUBLICO.whatsapp.buildUrl(cuerpo);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-labelledby="quickform-title"
    >
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
        id="qf-tel"
        label="Teléfono (opcional)"
        type="tel"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        placeholder="33 1234 5678"
        autoComplete="tel"
        inputMode="tel"
        icon={<Phone size={16} strokeWidth={2} />}
      />

      <CampoArea
        id="qf-mensaje"
        label="¿En qué te ayudamos?"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        placeholder="Cuéntanos brevemente tu situación: régimen, empleados, dudas…"
        rows={4}
      />

      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}

      <Boton type="submit" variante="whatsapp" fullWidth>
        Enviar por WhatsApp
      </Boton>

      <p className="text-xs text-slate-500 text-center leading-relaxed">
        Abrimos tu WhatsApp con el mensaje listo. Sin formularios que se pierden
        en correos.
      </p>
    </form>
  );
}
