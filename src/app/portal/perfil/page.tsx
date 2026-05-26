"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import { useConfirm } from "@/components/ConfirmProvider";
import CropAvatarModal from "@/components/admin/CropAvatarModal";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import PushToggle from "@/components/portal/PushToggle";
import { portalPage } from "@/components/portal/portal-ui";
import { usePortalPerfil } from "@/components/portal/PortalPerfilContext";

type PerfilDatos = {
  nombre?: string;
  telefono?: string;
  notas?: string;
  avatarPath?: string;
  avatarUrl?: string;
};

type RespPerfil = {
  id: string;
  email: string;
  razonSocial: string;
  rfc: string;
  perfil: PerfilDatos;
};

type Mensaje = { tipo: "ok" | "err"; texto: string };

export default function PortalPerfilPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const { refrescar: refrescarSidebar } = usePortalPerfil();
  const [datos, setDatos] = useState<RespPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PerfilDatos>({});
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [msgDatos, setMsgDatos] = useState<Mensaje | null>(null);

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [guardandoPwd, setGuardandoPwd] = useState(false);
  const [msgPwd, setMsgPwd] = useState<Mensaje | null>(null);

  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [msgFoto, setMsgFoto] = useState<Mensaje | null>(null);
  const [archivoCrop, setArchivoCrop] = useState<File | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/portal/perfil", { cache: "no-store" });
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
    (form.nombre ?? datos?.razonSocial ?? datos?.email ?? "?")
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  async function guardarDatos() {
    setGuardandoDatos(true);
    setMsgDatos(null);
    try {
      const r = await fetch("/api/portal/perfil", {
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

  async function guardarPassword() {
    setMsgPwd(null);
    if (nueva !== confirmar) {
      setMsgPwd({ tipo: "err", texto: "Las contraseñas no coinciden." });
      return;
    }
    if (nueva.length < 6) {
      setMsgPwd({
        tipo: "err",
        texto: "La nueva contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }
    setGuardandoPwd(true);
    try {
      const r = await fetch("/api/portal/perfil/contrasena", {
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
      const r = await fetch("/api/portal/perfil/foto", {
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
      mensaje: "Se eliminará tu foto actual. Puedes subir otra cuando quieras.",
      textoConfirmar: "Quitar",
      tono: "danger",
    });
    if (!ok) return;
    setSubiendoFoto(true);
    setMsgFoto(null);
    try {
      const r = await fetch("/api/portal/perfil/foto", { method: "DELETE" });
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
      <div className={portalPage}>
        <PortalPageHeader eyebrow="Mi perfil" title="Cargando…" />
      </div>
    );
  }

  if (!datos) return null;

  return (
    <div className={portalPage}>
      <PortalPageHeader
        eyebrow="Mi perfil"
        title={form.nombre || datos.razonSocial || "Mis datos"}
        subtitle={
          <span>
            {datos.email}
            {datos.rfc ? (
              <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest">
                {datos.rfc}
              </span>
            ) : null}
          </span>
        }
      />

      {/* Foto + datos personales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="md:col-span-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-7 flex flex-col items-center">
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
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-900 to-indigo-950 ring-4 ring-slate-100 flex items-center justify-center text-white text-4xl font-black">
                {inicial}
              </div>
            )}
          </div>
          <div className="mt-5 w-full space-y-2">
            <button
              type="button"
              onClick={() => inputFotoRef.current?.click()}
              disabled={subiendoFoto}
              className="w-full py-2.5 rounded-xl bg-blue-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 disabled:opacity-50"
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

        <PortalSection
          title="Tus datos"
          className="md:col-span-2"
          headerExtra={
            <span className="text-[10px] font-bold text-slate-400 normal-case tracking-normal">
              Visibles solo para ti y el despacho
            </span>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              label="Tu nombre"
              value={form.nombre ?? ""}
              onChange={(v) => setForm({ ...form, nombre: v })}
              placeholder="Ej. Juan Pérez"
            />
            <Campo
              label="Teléfono"
              value={form.telefono ?? ""}
              onChange={(v) => setForm({ ...form, telefono: v })}
              placeholder="Ej. +52 55 1234 5678"
              type="tel"
            />
            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Notas
              </label>
              <textarea
                value={form.notas ?? ""}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                rows={3}
                placeholder="Cualquier nota que quieras dejar para tu contador"
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
              className="px-6 py-2.5 rounded-xl bg-blue-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 disabled:opacity-50"
            >
              {guardandoDatos ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </PortalSection>
      </div>

      <PortalSection title="Notificaciones push">
        <PushToggle />
      </PortalSection>

      <PortalSection title="Seguridad · cambiar contraseña">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              placeholder="Mínimo 6 caracteres"
              invalid={nueva.length > 0 && nueva.length < 6}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
              Confirmar nueva
            </label>
            <PasswordInput
              value={confirmar}
              onChange={setConfirmar}
              placeholder="Repite la nueva"
              invalid={confirmar.length > 0 && confirmar !== nueva}
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
            disabled={
              guardandoPwd ||
              !actual ||
              !nueva ||
              !confirmar ||
              nueva.length < 6 ||
              nueva !== confirmar
            }
            className="px-5 py-2.5 rounded-xl bg-blue-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 disabled:opacity-50"
          >
            {guardandoPwd ? "Cambiando…" : "Actualizar contraseña"}
          </button>
        </div>
      </PortalSection>
    </div>
  );
}

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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-medium text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}
