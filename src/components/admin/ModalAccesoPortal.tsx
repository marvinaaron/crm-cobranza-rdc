"use client";

import { useCallback, useEffect, useState } from "react";
import type { Cliente } from "@/lib/clientes";
import ConfirmDialog from "@/components/ConfirmDialog";

type AccesoInfo = {
  exists: boolean;
  authUserId?: string;
  email?: string;
  lastSignInAt?: string;
};

type Props = {
  cliente: Cliente | null;
  onClose: () => void;
};

export default function ModalAccesoPortal({ cliente, onClose }: Props) {
  const [info, setInfo] = useState<AccesoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [requiereReasignar, setRequiereReasignar] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "ok" | "err";
    texto: string;
  } | null>(null);

  const recargar = useCallback(async () => {
    if (!cliente) return;
    setLoading(true);
    setMensaje(null);
    try {
      const r = await fetch(`/api/portal/acceso?clienteId=${cliente.id}`);
      const data = (await r.json()) as AccesoInfo & { error?: string };
      if (!r.ok) {
        setMensaje({ tipo: "err", texto: data.error ?? "Error consultando." });
        return;
      }
      setInfo(data);
      setEmail(data.email ?? cliente.email ?? "");
    } finally {
      setLoading(false);
    }
  }, [cliente]);

  useEffect(() => {
    if (cliente) void recargar();
  }, [cliente, recargar]);

  if (!cliente) return null;

  /** Crea / actualiza el acceso y manda correo de invitación al cliente. */
  async function crearOInvitar(opts?: { forzarReasignar?: boolean }) {
    if (!cliente) return;
    if (!email.trim()) {
      setMensaje({ tipo: "err", texto: "Captura el correo del cliente." });
      return;
    }
    setLoading(true);
    setMensaje(null);
    try {
      const r = await fetch("/api/portal/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: cliente.id,
          email: email.trim(),
          nombreCliente: cliente.razonSocial,
          enviarInvitacion: true,
          forzarReasignar: opts?.forzarReasignar === true,
        }),
      });
      const data = (await r.json()) as {
        email?: string;
        error?: string;
        codigo?: string;
        correoEnviado?: boolean;
        correoError?: string;
      };
      if (!r.ok) {
        if (data.codigo === "EMAIL_YA_VINCULADO") {
          setRequiereReasignar(true);
          setMensaje({
            tipo: "err",
            texto:
              "Este correo ya tiene un acceso anterior. Puedes reasignarlo a este cliente (se borrará el vínculo previo).",
          });
        } else {
          setRequiereReasignar(false);
          setMensaje({ tipo: "err", texto: data.error ?? "Error al guardar." });
        }
        return;
      }
      setRequiereReasignar(false);
      const correoFinal = data.email ?? email.trim();
      if (data.correoEnviado) {
        setMensaje({
          tipo: "ok",
          texto: `Listo. Enviamos un correo a ${correoFinal} con un enlace para crear su contraseña. Si no llega en 1 minuto, pídele que revise la carpeta de Spam.`,
        });
      } else {
        setMensaje({
          tipo: "err",
          texto: `Acceso creado, pero el correo no se envió${
            data.correoError ? `: ${data.correoError}` : "."
          }. Puedes usar "Reenviar invitación" para volver a intentarlo.`,
        });
      }
      await recargar();
    } finally {
      setLoading(false);
    }
  }

  /**
   * Reenvía el correo. Si el cliente NUNCA ha iniciado sesión, mandamos la
   * plantilla "invite" (bienvenida + crear contraseña). Si ya entró antes,
   * mandamos "recovery" (restablecer contraseña).
   */
  async function reenviarInvitacion() {
    if (!cliente) return;
    const correo = (info?.email ?? email).trim();
    if (!correo) {
      setMensaje({ tipo: "err", texto: "Define un correo primero." });
      return;
    }
    const yaIngreso = Boolean(info?.lastSignInAt);
    const tipo: "invite" | "recovery" = yaIngreso ? "recovery" : "invite";

    setLoading(true);
    setMensaje(null);
    try {
      const r = await fetch("/api/portal/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: correo,
          nombreCliente: cliente.razonSocial,
          tipo,
        }),
      });
      if (!r.ok) {
        const data = (await r.json()) as { error?: string };
        setMensaje({
          tipo: "err",
          texto: data.error ?? "No se pudo enviar el correo.",
        });
        return;
      }
      setMensaje({
        tipo: "ok",
        texto:
          tipo === "invite"
            ? `Invitación enviada a ${correo}. Si no llega en 1 minuto, revisa la carpeta de Spam.`
            : `Enlace de cambio de contraseña enviado a ${correo}.`,
      });
    } finally {
      setLoading(false);
    }
  }

  async function eliminar() {
    if (!cliente) return;
    if (!info?.exists) return;
    setLoading(true);
    setMensaje(null);
    try {
      const r = await fetch("/api/portal/acceso", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId: cliente.id }),
      });
      if (!r.ok) {
        const data = (await r.json()) as { error?: string };
        setMensaje({
          tipo: "err",
          texto: data.error ?? "No se pudo eliminar.",
        });
        return;
      }
      setMensaje({ tipo: "ok", texto: "Acceso eliminado." });
      await recargar();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Acceso al portal del cliente
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-900">
              {cliente.razonSocial}
            </h2>
            <p className="text-xs text-slate-500">{cliente.rfc}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Estado:</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                info?.exists
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {info?.exists ? "Acceso activo" : "Sin acceso"}
            </span>
          </div>
          {info?.exists && info.email ? (
            <p className="mt-1 text-xs text-slate-500">
              Correo registrado: <span className="font-semibold">{info.email}</span>
            </p>
          ) : null}
          {info?.lastSignInAt ? (
            <p className="mt-0.5 text-xs text-slate-400">
              Último inicio de sesión:{" "}
              {new Date(info.lastSignInAt).toLocaleString("es-MX")}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">
              Correo del cliente
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@correo.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              El cliente recibirá aquí un enlace para elegir su propia
              contraseña. Por seguridad, no guardamos ni mostramos contraseñas.
            </span>
          </label>

          {mensaje ? (
            <p
              className={`rounded-md px-3 py-2 text-sm ${
                mensaje.tipo === "ok"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {mensaje.texto}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-2">
            {!info?.exists ? (
              requiereReasignar ? (
                <button
                  type="button"
                  onClick={() => void crearOInvitar({ forzarReasignar: true })}
                  disabled={loading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {loading
                    ? "Procesando…"
                    : "Reasignar acceso a este cliente"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void crearOInvitar()}
                  disabled={loading}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? "Procesando…" : "Crear acceso y enviar invitación"}
                </button>
              )
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void reenviarInvitacion()}
                  disabled={loading}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading
                    ? "Enviando…"
                    : info?.lastSignInAt
                      ? "Enviar enlace de cambio de contraseña"
                      : "Reenviar invitación"}
                </button>
                {info.email !== email.trim() && email.trim() ? (
                  <button
                    type="button"
                    onClick={() => void crearOInvitar()}
                    disabled={loading}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cambiar correo y reenviar
                  </button>
                ) : null}
              </>
            )}
            <button
              type="button"
              onClick={() => setConfirmEliminar(true)}
              disabled={loading || !info?.exists}
              className="ml-auto rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Eliminar acceso
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmEliminar}
        titulo="Eliminar acceso al portal"
        mensaje={`El cliente "${cliente.razonSocial}" dejará de poder iniciar sesión. El registro del cliente y su historial NO se borran (para eso usa el botón de basura en la lista).`}
        textoConfirmar="Eliminar acceso"
        tono="danger"
        onConfirmar={async () => {
          await eliminar();
          setConfirmEliminar(false);
        }}
        onCancelar={() => setConfirmEliminar(false)}
      />
    </div>
  );
}
