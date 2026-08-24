"use client";

import { useCallback, useEffect, useState } from "react";
import AvisoPrivacidadContenido from "@/components/publico/AvisoPrivacidadContenido";
import Logo from "@/components/publico/Logo";

type EstadoAviso = {
  razonSocial: string;
  aceptado: boolean;
  enviadoEn: string | null;
  aceptadoEn: string | null;
  version: string;
};

function formatearFecha(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AvisoPrivacidadAceptacion({
  token,
}: {
  token: string;
}) {
  const [estado, setEstado] = useState<EstadoAviso | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [acepto, setAcepto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/aviso/${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "no-encontrado"
            ? "Este enlace no es válido o ya no está disponible."
            : data.error ?? "No se pudo cargar el aviso."
        );
        setEstado(null);
        return;
      }
      setEstado(data as EstadoAviso);
      if (data.aceptado) setExito(true);
    } catch {
      setError("No se pudo cargar el aviso. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const registrarAceptacion = async () => {
    if (!acepto || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/aviso/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aceptar: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar la aceptación.");
        return;
      }
      setExito(true);
      setEstado((prev) =>
        prev
          ? {
              ...prev,
              aceptado: true,
              aceptadoEn: data.aceptadoEn ?? new Date().toISOString(),
              version: data.version ?? prev.version,
            }
          : prev
      );
    } catch {
      setError("Error de red al registrar. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-sm text-slate-500">
        Cargando aviso de privacidad…
      </div>
    );
  }

  if (error && !estado) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <Logo mark="r" alto={36} className="mx-auto mb-4" />
        <h1 className="text-xl font-black text-slate-900 mb-2">Enlace no válido</h1>
        <p className="text-sm text-slate-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-marca-navy mb-2">
          Aceptación formal · confidencial
        </p>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {estado?.razonSocial}
        </h2>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Esta liga es personal. Al aceptar, queda constancia de la fecha en el
          expediente de RDC Contadores, conforme a la LFPDPPP.
        </p>
        {estado?.aceptadoEn ? (
          <p className="mt-3 text-xs font-semibold text-emerald-700">
            Aceptado el {formatearFecha(estado.aceptadoEn)}
            {estado.version ? ` · versión ${estado.version}` : ""}
          </p>
        ) : null}
      </div>

      <AvisoPrivacidadContenido />

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        {exito || estado?.aceptado ? (
          <div className="text-center py-2">
            <p className="text-base font-black text-emerald-700 mb-1">
              Aceptación registrada
            </p>
            <p className="text-sm text-slate-600">
              Gracias. Ya puedes cerrar esta ventana. El despacho verá el
              estatus en tu expediente.
            </p>
          </div>
        ) : (
          <>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acepto}
                onChange={(e) => setAcepto(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-marca-navy focus:ring-marca-navy/30"
              />
              <span className="text-sm text-slate-700 leading-relaxed">
                He leído el aviso de privacidad y{" "}
                <strong>acepto el tratamiento de mis datos personales</strong>{" "}
                conforme a los fines ahí descritos, como titular de la información
                asociada a <strong>{estado?.razonSocial}</strong>.
              </span>
            </label>
            {error ? (
              <p className="mt-3 text-xs text-red-600">{error}</p>
            ) : null}
            <button
              type="button"
              disabled={!acepto || enviando}
              onClick={() => void registrarAceptacion()}
              className="mt-5 w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-marca-navy px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? "Registrando…" : "Acepto el aviso de privacidad"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
