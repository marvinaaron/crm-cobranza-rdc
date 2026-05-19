"use client";

import { useRef, useState } from "react";
import { type Periodo, periodoLabel } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import { MAX_COMPROBANTE_BYTES } from "@/lib/comprobantes";
import { abrirCorreoEvento } from "@/lib/correo-eventos";
import { isValidEmail } from "@/lib/email";
import { portalCard, portalCardTitle } from "@/components/portal/portal-ui";

type Props = {
  clienteId: number;
  periodo: Periodo;
};

export default function SubirComprobante({ clienteId, periodo }: Props) {
  const { subirComprobante, getComprobantePeriodo, listaClientes } = useClientes();
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [correoEnviado, setCorreoEnviado] = useState(false);

  const existente = getComprobantePeriodo(clienteId, periodo);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setOk(false);

    if (file.size > MAX_COMPROBANTE_BYTES) {
      setError("El archivo no debe superar 3 MB.");
      return;
    }

    const permitidos = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!permitidos.includes(file.type)) {
      setError("Use imagen (JPG, PNG) o PDF.");
      return;
    }

    setSubiendo(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      subirComprobante(clienteId, periodo, {
        nombreArchivo: file.name,
        tipoMime: file.type,
        dataUrl,
      });
      const cliente = listaClientes.find((c) => c.id === clienteId);
      let enviado = false;
      if (cliente?.email && isValidEmail(cliente.email)) {
        enviado = abrirCorreoEvento(cliente, periodo, "comprobante_recibido");
      }
      setCorreoEnviado(enviado);
      setOk(true);
      setTimeout(() => {
        setOk(false);
        setCorreoEnviado(false);
      }, 5000);
    } catch {
      setError("No se pudo cargar el archivo. Intente de nuevo.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className={portalCard}>
      <p className={`${portalCardTitle} mb-1`}>
        Comprobante de pago
      </p>
      <p className="text-sm font-bold text-slate-600 mb-4">
        {periodoLabel(periodo)}
      </p>

      {existente ? (
        <div className={`rounded-2xl px-4 py-3 mb-4 border ${
            existente.estado === "aceptado"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-violet-50 border-violet-100"
          }`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${
              existente.estado === "aceptado" ? "text-emerald-700" : "text-violet-700"
            }`}>
            {existente.estado === "aceptado" ? "Pago confirmado" : "En validación"}
          </p>
          <p className="text-xs font-bold text-slate-600 mt-1 truncate">{existente.nombreArchivo}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {existente.estado === "aceptado"
              ? "El despacho aplicó su pago a la cuenta."
              : "El despacho está revisando su comprobante."}
          </p>
        </div>
      ) : (
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Suba su ticket o comprobante para que el despacho valide su pago más rápido.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={onFile}
      />

      <button
        type="button"
        disabled={subiendo}
        onClick={() => inputRef.current?.click()}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:opacity-95 disabled:opacity-60 transition-all shadow-md shadow-indigo-100"
      >
        {subiendo ? "Subiendo…" : existente ? "Reemplazar comprobante" : "Subir comprobante"}
      </button>

      {error && (
        <p className="mt-2 text-[11px] font-bold text-red-600">{error}</p>
      )}
      {ok && (
        <div className="mt-2 space-y-1">
          <p className="text-[11px] font-bold text-emerald-600">
            ¡Comprobante recibido! Quedó en validación.
          </p>
          {correoEnviado && (
            <p className="text-[10px] font-bold text-indigo-600">
              Se abrió un correo de confirmación para enviar a su bandeja.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
