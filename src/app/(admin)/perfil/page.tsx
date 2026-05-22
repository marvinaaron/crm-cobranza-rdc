"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import { useConfirm } from "@/components/ConfirmProvider";
import { useAdminPerfil } from "@/components/admin/AdminPerfilContext";
import CropAvatarModal from "@/components/admin/CropAvatarModal";
import PushToggleAdmin from "@/components/admin/PushToggleAdmin";
import type { Modulo } from "@/lib/admin/permisos";
import { MODULOS_META } from "@/lib/admin/permisos";

type PerfilDatos = {
  nombreCompleto?: string;
  cargo?: string;
  telefono?: string;
  cedulaProfesional?: string;
  ubicacion?: string;
  notas?: string;
  avatarPath?: string;
  avatarUrl?: string;
};

type RespPerfil = {
  id: string;
  email: string;
  propietario: boolean;
  permisos: Modulo[];
  perfil: PerfilDatos;
};

type Mensaje = { tipo: "ok" | "err"; texto: string };

export default function PerfilPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const { refrescar: refrescarSidebar } = useAdminPerfil();
  const [datos, setDatos] = useState<RespPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  // form datos personales
  const [form, setForm] = useState<PerfilDatos>({});
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [msgDatos, setMsgDatos] = useState<Mensaje | null>(null);

  // form correo
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [guardandoEmail, setGuardandoEmail] = useState(false);
  const [msgEmail, setMsgEmail] = useState<Mensaje | null>(null);

  // form contraseña
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [guardandoPwd, setGuardandoPwd] = useState(false);
  const [msgPwd, setMsgPwd] = useState<Mensaje | null>(null);

  // foto
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [msgFoto, setMsgFoto] = useState<Mensaje | null>(null);
  const [archivoCrop, setArchivoCrop] = useState<File | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/perfil");
      if (r.ok) {
        const data = (await r.json()) as RespPerfil;
        setDatos(data);
        setForm(data.perfil);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const inicial =
    (form.nombreCompleto ?? datos?.email ?? "?").trim().charAt(0).toUpperCase() ||
    "?";

  async function guardarDatos() {
    setGuardandoDatos(true);
    setMsgDatos(null);
    try {
      const r = await fetch("/api/admin/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) {
        setMsgDatos({
          tipo: "err",
          texto: data.error ?? "No se pudieron guardar los datos.",
        });
        return;
      }
      setMsgDatos({ tipo: "ok", texto: "Datos guardados." });
      await refrescarSidebar();
      router.refresh();
    } finally {
      setGuardandoDatos(false);
    }
  }

  async function guardarEmail() {
    if (!nuevoEmail.trim()) return;
    setGuardandoEmail(true);
    setMsgEmail(null);
    try {
      const r = await fetch("/api/admin/perfil/correo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoEmail: nuevoEmail.trim() }),
      });
      const data = (await r.json()) as { error?: string; mensaje?: string };
      if (!r.ok) {
        setMsgEmail({
          tipo: "err",
          texto: data.error ?? "No se pudo cambiar el correo.",
        });
        return;
      }
      setMsgEmail({
        tipo: "ok",
        texto: data.mensaje ?? "Correo de confirmación enviado.",
      });
      setNuevoEmail("");
    } finally {
      setGuardandoEmail(false);
    }
  }

  async function guardarPassword() {
    setMsgPwd(null);
    if (nueva !== confirmar) {
      setMsgPwd({ tipo: "err", texto: "Las contraseñas no coinciden." });
      return;
    }
    setGuardandoPwd(true);
    try {
      const r = await fetch("/api/admin/perfil/contrasena", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual, nueva }),
      });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) {
        setMsgPwd({
          tipo: "err",
          texto: data.error ?? "No se pudo cambiar la contraseña.",
        });
        return;
      }
      setMsgPwd({ tipo: "ok", texto: "Contraseña actualizada." });
      setActual("");
      setNueva("");
      setConfirmar("");
    } finally {
      setGuardandoPwd(false);
    }
  }

  function elegirArchivoFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    setMsgFoto(null);
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMsgFoto({
        tipo: "err",
        texto: "La imagen original no debe pesar más de 10 MB.",
      });
      return;
    }
    setArchivoCrop(file);
  }

  async function subirRecorte(blob: Blob) {
    setSubiendoFoto(true);
    setMsgFoto(null);
    try {
      const fd = new FormData();
      fd.append("file", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      const r = await fetch("/api/admin/perfil/foto", {
        method: "POST",
        body: fd,
      });
      const data = (await r.json()) as { error?: string; avatarUrl?: string };
      if (!r.ok) {
        setMsgFoto({ tipo: "err", texto: data.error ?? "No se pudo subir." });
        return;
      }
      setMsgFoto({ tipo: "ok", texto: "Foto actualizada." });
      setArchivoCrop(null);
      await cargar();
      await refrescarSidebar();
      router.refresh();
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function quitarFoto() {
    const ok = await confirm({
      titulo: "Quitar foto de perfil",
      mensaje:
        "Se eliminará tu foto actual. Puedes subir otra cuando quieras.",
      textoConfirmar: "Quitar",
      tono: "danger",
    });
    if (!ok) return;
    setSubiendoFoto(true);
    setMsgFoto(null);
    try {
      const r = await fetch("/api/admin/perfil/foto", { method: "DELETE" });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) {
        setMsgFoto({ tipo: "err", texto: data.error ?? "Error al quitar." });
        return;
      }
      setMsgFoto({ tipo: "ok", texto: "Foto eliminada." });
      await cargar();
      await refrescarSidebar();
      router.refresh();
    } finally {
      setSubiendoFoto(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-8">
        <p className="text-slate-400 font-bold text-sm">Cargando perfil…</p>
      </div>
    );
  }

  if (!datos) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
      <header>
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">
          Mi perfil
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-800">
          {form.nombreCompleto || "Datos del administrador"}
        </h1>
        <p className="text-slate-400 font-bold mt-2 text-sm">
          {datos.email}
          {datos.propietario ? (
            <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full bg-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest">
              Propietario
            </span>
          ) : null}
        </p>
      </header>

      {/* Foto + datos personales en grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Avatar */}
        <section className="md:col-span-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7 flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 self-start">
            Foto de perfil
          </p>
          <div className="relative">
            {form.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatarUrl}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-4 ring-slate-100 flex items-center justify-center text-white text-4xl font-black">
                {inicial}
              </div>
            )}
          </div>
          <div className="mt-5 w-full space-y-2">
            <button
              type="button"
              onClick={() => inputFotoRef.current?.click()}
              disabled={subiendoFoto}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50"
            >
              {subiendoFoto
                ? "Procesando…"
                : form.avatarUrl
                  ? "Cambiar foto"
                  : "Subir foto"}
            </button>
            {form.avatarUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    // "Editar" abre el modal de recorte con la foto ACTUAL
                    // descargada como blob (necesario porque el modal recibe File).
                    void abrirEditorDeFotoActual(
                      form.avatarUrl!,
                      setArchivoCrop,
                      setMsgFoto
                    );
                  }}
                  disabled={subiendoFoto}
                  className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50"
                >
                  Editar / recortar
                </button>
                <button
                  type="button"
                  onClick={() => void quitarFoto()}
                  disabled={subiendoFoto}
                  className="w-full py-2.5 rounded-xl border border-rose-200 bg-white text-rose-700 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 disabled:opacity-50"
                >
                  Quitar foto
                </button>
              </>
            ) : null}
            <input
              ref={inputFotoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={elegirArchivoFoto}
              className="hidden"
            />
            {msgFoto ? (
              <p
                className={`text-xs font-bold mt-2 ${
                  msgFoto.tipo === "ok" ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {msgFoto.texto}
              </p>
            ) : null}
          </div>
          <p className="text-[10px] font-bold text-slate-400 text-center mt-4 leading-relaxed">
            PNG, JPG o WebP · máx. 10 MB
          </p>
        </section>

        <CropAvatarModal
          open={Boolean(archivoCrop)}
          file={archivoCrop}
          onConfirmar={subirRecorte}
          onCancelar={() => setArchivoCrop(null)}
        />

        {/* Datos personales */}
        <section className="md:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Datos personales
          </p>
          <h2 className="text-lg font-black text-slate-800 mb-5">
            Información del administrador
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              label="Nombre completo"
              value={form.nombreCompleto ?? ""}
              onChange={(v) => setForm({ ...form, nombreCompleto: v })}
              placeholder="Ej. Aarón Rosales"
            />
            <Campo
              label="Cargo / Puesto"
              value={form.cargo ?? ""}
              onChange={(v) => setForm({ ...form, cargo: v })}
              placeholder="Ej. Contador titular"
            />
            <Campo
              label="Cédula profesional"
              value={form.cedulaProfesional ?? ""}
              onChange={(v) => setForm({ ...form, cedulaProfesional: v })}
              placeholder="Ej. 12345678"
            />
            <Campo
              label="Teléfono"
              value={form.telefono ?? ""}
              onChange={(v) => setForm({ ...form, telefono: v })}
              placeholder="Ej. +52 55 1234 5678"
            />
            <div className="sm:col-span-2">
              <Campo
                label="Ubicación"
                value={form.ubicacion ?? ""}
                onChange={(v) => setForm({ ...form, ubicacion: v })}
                placeholder="Ciudad, Estado"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Notas
              </label>
              <textarea
                value={form.notas ?? ""}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                rows={3}
                placeholder="Información adicional (interna)"
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-medium text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
              />
            </div>
          </div>
          {msgDatos ? (
            <p
              className={`text-xs font-bold mt-4 ${
                msgDatos.tipo === "ok" ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {msgDatos.texto}
            </p>
          ) : null}
          <div className="flex justify-end mt-5">
            <button
              type="button"
              onClick={() => void guardarDatos()}
              disabled={guardandoDatos}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50"
            >
              {guardandoDatos ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </section>
      </div>

      {/* Permisos */}
      {!datos.propietario ? (
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Tus permisos
          </p>
          <h2 className="text-lg font-black text-slate-800 mb-4">Módulos a los que tienes acceso</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {datos.permisos.map((m) => (
              <div
                key={m}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-700">
                  {MODULOS_META[m].label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-3">
            Si necesitas más accesos, pídeselos al propietario del despacho.
          </p>
        </section>
      ) : null}

      {/* Seguridad: correo + contraseña */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Seguridad · correo
          </p>
          <h2 className="text-lg font-black text-slate-800 mb-2">
            Cambiar correo
          </h2>
          <p className="text-[11px] text-slate-500 font-medium mb-4 leading-relaxed">
            Actual: <span className="font-bold text-slate-700">{datos.email}</span>
            <br />
            Recibirás un correo de confirmación en el nuevo. El cambio aplica al hacer click ahí.
          </p>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
            Nuevo correo
          </label>
          <input
            type="email"
            value={nuevoEmail}
            onChange={(e) => setNuevoEmail(e.target.value)}
            placeholder="nuevo@correo.com"
            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-medium text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
          />
          {msgEmail ? (
            <p
              className={`text-xs font-bold mt-3 ${
                msgEmail.tipo === "ok" ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {msgEmail.texto}
            </p>
          ) : null}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => void guardarEmail()}
              disabled={guardandoEmail || !nuevoEmail.trim()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50"
            >
              {guardandoEmail ? "Enviando…" : "Enviar confirmación"}
            </button>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Seguridad · contraseña
          </p>
          <h2 className="text-lg font-black text-slate-800 mb-4">
            Cambiar contraseña
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Contraseña actual
              </label>
              <PasswordInput
                value={actual}
                onChange={setActual}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Nueva contraseña
              </label>
              <PasswordInput
                value={nueva}
                onChange={setNueva}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Confirmar nueva
              </label>
              <PasswordInput
                value={confirmar}
                onChange={setConfirmar}
                placeholder="Repite la nueva contraseña"
              />
            </div>
          </div>
          {msgPwd ? (
            <p
              className={`text-xs font-bold mt-3 ${
                msgPwd.tipo === "ok" ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {msgPwd.texto}
            </p>
          ) : null}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => void guardarPassword()}
              disabled={guardandoPwd || !actual || !nueva || !confirmar}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50"
            >
              {guardandoPwd ? "Cambiando…" : "Actualizar contraseña"}
            </button>
          </div>
        </section>
      </div>

      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
          Avisos · push
        </p>
        <h2 className="text-lg font-black text-slate-800 mb-2">
          Notificaciones en tu celular
        </h2>
        <p className="text-[11px] text-slate-500 font-medium mb-4 leading-relaxed">
          Recibe avisos en tiempo real cuando un cliente sube un comprobante,
          paga o se acerca un vencimiento. Activa este toggle desde el CRM
          instalado como PWA en cada dispositivo (Mac, iPhone, iPad).
        </p>
        <PushToggleAdmin />
      </section>
    </div>
  );
}

/**
 * Descarga la foto actual y la convierte en File para volver a abrir el
 * editor de recorte sobre ella.
 */
async function abrirEditorDeFotoActual(
  url: string,
  setArchivo: (f: File) => void,
  setMsg: (m: Mensaje) => void
) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const file = new File([blob], "avatar-actual.jpg", {
      type: blob.type || "image/jpeg",
    });
    setArchivo(file);
  } catch {
    setMsg({
      tipo: "err",
      texto: "No se pudo cargar la foto actual para editarla.",
    });
  }
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-medium text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}
