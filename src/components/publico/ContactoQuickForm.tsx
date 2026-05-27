"use client";

/**
 * Formulario express de contacto. 3 campos (nombre, teléfono, mensaje) y
 * un solo botón: al enviar, abre WhatsApp del despacho con un mensaje
 * estructurado ya pre-llenado.
 *
 * No envía a un backend — la "entrega" es el chat de WhatsApp. Esto
 * elimina fricción (sin email, sin spam, sin esperar) y mantiene la
 * conversación en el canal que el contador realmente usa.
 */

import { useState } from "react";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";

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
      className="space-y-3"
      aria-labelledby="quickform-title"
    >
      <div>
        <label
          htmlFor="qf-nombre"
          className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1"
        >
          Tu nombre
        </label>
        <input
          id="qf-nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Carla Hernández"
          autoComplete="name"
          className="w-full px-4 py-2.5 rounded-xl bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500 outline-none text-sm text-slate-900 placeholder:text-slate-400 transition"
        />
      </div>

      <div>
        <label
          htmlFor="qf-tel"
          className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1"
        >
          Teléfono (opcional)
        </label>
        <input
          id="qf-tel"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="33 1234 5678"
          autoComplete="tel"
          inputMode="tel"
          className="w-full px-4 py-2.5 rounded-xl bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500 outline-none text-sm text-slate-900 placeholder:text-slate-400 transition"
        />
      </div>

      <div>
        <label
          htmlFor="qf-mensaje"
          className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1"
        >
          ¿En qué te ayudamos?
        </label>
        <textarea
          id="qf-mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Cuéntanos brevemente tu situación: régimen, número de empleados, dudas específicas…"
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500 outline-none text-sm text-slate-900 placeholder:text-slate-400 transition resize-none"
        />
      </div>

      {error && (
        <p className="text-[12px] text-rose-600 font-medium">{error}</p>
      )}

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-bold transition-colors shadow-md shadow-emerald-500/30"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 32 32"
          fill="currentColor"
          aria-hidden
        >
          <path d="M16.001 3.2C8.93 3.2 3.2 8.93 3.2 16c0 2.26.6 4.46 1.74 6.4L3.2 28.8l6.56-1.72A12.78 12.78 0 0 0 16 28.8c7.07 0 12.8-5.73 12.8-12.8S23.07 3.2 16 3.2zm6.81 17.74c-.29.81-1.69 1.55-2.33 1.64-.62.09-1.41.13-2.28-.14-.52-.16-1.2-.39-2.06-.76-3.63-1.57-6-5.23-6.18-5.47-.18-.24-1.47-1.96-1.47-3.74 0-1.77.93-2.65 1.26-3.01.33-.36.72-.45.96-.45h.69c.22 0 .52-.08.81.62.29.7.99 2.41 1.08 2.59.09.18.15.39.03.62-.12.24-.18.39-.36.6-.18.21-.38.47-.54.63-.18.18-.37.38-.16.74.21.36.93 1.53 2 2.47 1.37 1.22 2.52 1.6 2.88 1.78.36.18.57.15.78-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.07.98 2.43 1.16.36.18.6.27.69.42.09.15.09.87-.2 1.68z" />
        </svg>
        Enviar por WhatsApp
      </button>

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        Al enviar, abrimos tu WhatsApp con el mensaje listo — tú solo das
        tocar. Sin formularios que se pierden en correos.
      </p>
    </form>
  );
}
