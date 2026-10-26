"use client";

import { useState } from "react";
import { Mail, User, MessageSquare } from "lucide-react";
import { Boton } from "@/components/ui/boton";
import { Campo, CampoArea } from "@/components/ui/campo";
import ConsentimientoDatosNotice from "@/components/publico/ConsentimientoDatosNotice";

const TIPOS = [
  { value: "eliminacion", label: "Eliminar / cancelar mis datos" },
  { value: "acceso", label: "Acceso a mis datos" },
  { value: "rectificacion", label: "Rectificar datos incorrectos" },
  { value: "oposicion", label: "Oposición a un tratamiento" },
] as const;

/**
 * Formulario público para derechos ARCO / eliminación de datos.
 */
export default function SolicitudDatosForm() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]["value"]>("eliminacion");
  const [detalle, setDetalle] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre.trim() || !correo.trim()) {
      setError("Nombre y correo son obligatorios.");
      return;
    }
    if (!acepta) {
      setError("Debes aceptar el aviso de privacidad.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/publico/solicitud-datos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          correo: correo.trim(),
          tipo,
          detalle: detalle.trim(),
          aceptaPrivacidad: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "No pudimos enviar la solicitud.");
        return;
      }
      setOk(true);
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-sm text-emerald-900">
        <p className="font-bold">Solicitud enviada</p>
        <p className="mt-2 text-emerald-800/90 leading-relaxed">
          Recibimos tu pedido. Te responderemos al correo indicado en los plazos
          que marca la ley. Si no ves respuesta en unos días, escribe a{" "}
          <a
            href="mailto:contacto@rdcontadores.com"
            className="font-semibold underline"
          >
            contacto@rdcontadores.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void enviar(e)} className="space-y-4">
      <Campo
        id="arco-nombre"
        label="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        autoComplete="name"
        required
        icon={<User size={16} strokeWidth={2} />}
      />
      <Campo
        id="arco-correo"
        label="Correo de contacto"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        autoComplete="email"
        required
        icon={<Mail size={16} strokeWidth={2} />}
      />

      <div>
        <label
          htmlFor="arco-tipo"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          ¿Qué solicitas?
        </label>
        <select
          id="arco-tipo"
          value={tipo}
          onChange={(e) =>
            setTipo(e.target.value as (typeof TIPOS)[number]["value"])
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-marca-navy/30"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <CampoArea
        id="arco-detalle"
        label="Detalle (opcional)"
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
        rows={3}
        placeholder="Ej. fui prospecto en /empezar, o soy cliente del portal…"
        icon={<MessageSquare size={16} strokeWidth={2} />}
      />

      <ConsentimientoDatosNotice
        id="arco-privacidad"
        checked={acepta}
        onChange={setAcepta}
        error={error && !acepta ? error : undefined}
      />

      {error && acepta ? (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      ) : null}

      <Boton type="submit" fullWidth disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar solicitud"}
      </Boton>
    </form>
  );
}
