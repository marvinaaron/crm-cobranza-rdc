"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  MODULOS,
  MODULOS_META,
  PERMISOS_COBRANZA,
  PERMISOS_CONTADOR,
  type Modulo,
} from "@/lib/admin/permisos";

type AdminEquipo = {
  id: string;
  email: string;
  nombreCompleto?: string;
  cargo?: string;
  avatarUrl?: string;
  propietario: boolean;
  permisos: Modulo[];
  lastSignInAt?: string;
};

type Preset = "todo" | "contador" | "cobranza" | "personalizado";

const PRESETS: Record<Exclude<Preset, "personalizado">, Modulo[]> = {
  todo: [...MODULOS],
  contador: PERMISOS_CONTADOR,
  cobranza: PERMISOS_COBRANZA,
};

export default function EquipoPanel() {
  const confirm = useConfirm();
  const [equipo, setEquipo] = useState<AdminEquipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "err"; texto: string } | null>(
    null
  );

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/equipo", { cache: "no-store" });
      if (r.ok) {
        const data = (await r.json()) as { equipo: AdminEquipo[] };
        setEquipo(data.equipo);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Equipo · {equipo.length} {equipo.length === 1 ? "admin" : "admins"}
          </p>
          <h2 className="text-lg font-black text-slate-800">
            Administradores del despacho
          </h2>
          <p className="text-[11px] text-slate-500 font-medium mt-1 max-w-xl leading-relaxed">
            Invita a colegas con permisos limitados. El propietario tiene acceso
            total y no puede ser eliminado.
          </p>
        </div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700"
          >
            + Invitar admin
          </button>
        ) : null}
      </div>

      {mensaje ? (
        <div
          className={`rounded-2xl border px-5 py-3 ${
            mensaje.tipo === "ok"
              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
              : "bg-rose-50 border-rose-100 text-rose-700"
          }`}
        >
          <p className="text-sm font-bold">{mensaje.texto}</p>
        </div>
      ) : null}

      {showForm ? (
        <FormNuevoAdmin
          onCancelar={() => {
            setShowForm(false);
            setMensaje(null);
          }}
          onCreado={async (texto) => {
            setShowForm(false);
            setMensaje({ tipo: "ok", texto });
            await cargar();
          }}
          onError={(texto) => setMensaje({ tipo: "err", texto })}
        />
      ) : null}

      {loading ? (
        <p className="text-sm font-bold text-slate-400">Cargando equipo…</p>
      ) : (
        <ul className="space-y-3">
          {equipo.map((a) => (
            <FilaAdmin
              key={a.id}
              admin={a}
              onActualizar={async () => {
                await cargar();
              }}
              onEliminar={async () => {
                const ok = await confirm({
                  titulo: "Eliminar administrador",
                  mensaje: `Se eliminará la cuenta de "${
                    a.nombreCompleto || a.email
                  }" y dejará de poder iniciar sesión.`,
                  textoConfirmar: "Eliminar",
                  tono: "danger",
                });
                if (!ok) return;
                const r = await fetch("/api/admin/equipo", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: a.id }),
                });
                if (!r.ok) {
                  const data = (await r.json()) as { error?: string };
                  setMensaje({
                    tipo: "err",
                    texto: data.error ?? "No se pudo eliminar.",
                  });
                  return;
                }
                setMensaje({
                  tipo: "ok",
                  texto: `Eliminado: ${a.nombreCompleto || a.email}`,
                });
                await cargar();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilaAdmin({
  admin,
  onActualizar,
  onEliminar,
}: {
  admin: AdminEquipo;
  onActualizar: () => Promise<void>;
  onEliminar: () => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);
  const [permisos, setPermisos] = useState<Modulo[]>(admin.permisos);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inicial =
    (admin.nombreCompleto || admin.email).charAt(0).toUpperCase() || "?";

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/equipo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: admin.id, permisos }),
      });
      if (!r.ok) {
        const data = (await r.json()) as { error?: string };
        setError(data.error ?? "No se pudo guardar.");
        return;
      }
      setEditando(false);
      await onActualizar();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <li className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        {admin.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={admin.avatarUrl}
            alt=""
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-base font-black ring-2 ring-white shadow shrink-0">
            {inicial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-black text-slate-800 truncate">
              {admin.nombreCompleto || admin.email.split("@")[0]}
            </p>
            {admin.propietario ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest">
                Propietario
              </span>
            ) : null}
          </div>
          <p className="text-[11px] font-bold text-slate-400 truncate">
            {admin.email}
            {admin.cargo ? <span className="ml-2">· {admin.cargo}</span> : null}
          </p>
          {admin.lastSignInAt ? (
            <p className="text-[10px] text-slate-300 mt-0.5">
              Último acceso:{" "}
              {new Date(admin.lastSignInAt).toLocaleString("es-MX")}
            </p>
          ) : null}
        </div>
        {!admin.propietario ? (
          <div className="flex items-center gap-1 shrink-0">
            {!editando ? (
              <button
                type="button"
                onClick={() => setEditando(true)}
                className="rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100"
              >
                Editar
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void onEliminar()}
              className="rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50"
            >
              Eliminar
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-3 ml-16">
        {!editando ? (
          <div className="flex flex-wrap gap-1.5">
            {admin.propietario ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-900">
                Acceso total
              </span>
            ) : admin.permisos.length === 0 ? (
              <span className="text-[11px] font-bold text-rose-500">
                Sin acceso a ningún módulo
              </span>
            ) : (
              admin.permisos.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-widest text-emerald-700"
                >
                  {MODULOS_META[m].label}
                </span>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODULOS.map((m) => {
                const activo = permisos.includes(m);
                return (
                  <label
                    key={m}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      activo
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPermisos([...permisos, m]);
                        } else {
                          setPermisos(permisos.filter((x) => x !== m));
                        }
                      }}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-xs font-black text-slate-800">
                        {MODULOS_META[m].label}
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                        {MODULOS_META[m].descripcion}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
            {error ? (
              <p className="text-xs font-bold text-rose-600">{error}</p>
            ) : null}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditando(false);
                  setPermisos(admin.permisos);
                  setError(null);
                }}
                disabled={guardando}
                className="rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void guardar()}
                disabled={guardando}
                className="rounded-lg bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {guardando ? "Guardando…" : "Guardar permisos"}
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

function FormNuevoAdmin({
  onCancelar,
  onCreado,
  onError,
}: {
  onCancelar: () => void;
  onCreado: (texto: string) => Promise<void>;
  onError: (texto: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [preset, setPreset] = useState<Preset>("contador");
  const [permisos, setPermisos] = useState<Modulo[]>(PERMISOS_CONTADOR);
  const [loading, setLoading] = useState(false);

  // Cambiar preset → ajustar permisos (excepto en personalizado)
  const cambiarPreset = (p: Preset) => {
    setPreset(p);
    if (p !== "personalizado") {
      setPermisos(PRESETS[p]);
    }
  };

  const presetSelected = useMemo<Preset>(() => {
    if (preset === "personalizado") return "personalizado";
    return preset;
  }, [preset]);

  async function crear() {
    if (!email.trim()) {
      onError("Captura un correo.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/admin/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          nombreCompleto: nombre.trim() || undefined,
          cargo: cargo.trim() || undefined,
          permisos,
        }),
      });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) {
        onError(data.error ?? "No se pudo crear el admin.");
        return;
      }
      await onCreado(
        `Invitación enviada a ${email.trim()}. Revisará su correo para crear su contraseña.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Nuevo admin
          </p>
          <h3 className="text-base font-black text-slate-800">Invitar al equipo</h3>
        </div>
        <button
          type="button"
          onClick={onCancelar}
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700"
        >
          Cancelar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
            Correo *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colega@correo.com"
            className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
            Nombre
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Carlos López"
            className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
            Cargo
          </label>
          <input
            type="text"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            placeholder="Ej. Contador asociado"
            className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">
          Permisos
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["todo", "contador", "cobranza", "personalizado"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => cambiarPreset(p)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                presetSelected === p
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {p === "todo"
                ? "Acceso total"
                : p === "contador"
                  ? "Contador"
                  : p === "cobranza"
                    ? "Cobranza"
                    : "Personalizado"}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODULOS.map((m) => {
            const activo = permisos.includes(m);
            return (
              <label
                key={m}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  activo
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                } ${preset !== "personalizado" ? "opacity-80" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => {
                    setPreset("personalizado");
                    if (e.target.checked) {
                      setPermisos([...permisos, m]);
                    } else {
                      setPermisos(permisos.filter((x) => x !== m));
                    }
                  }}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-xs font-black text-slate-800">
                    {MODULOS_META[m].label}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                    {MODULOS_META[m].descripcion}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          disabled={loading}
          className="rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void crear()}
          disabled={loading || !email.trim() || permisos.length === 0}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Enviando…" : "Crear y enviar invitación"}
        </button>
      </div>
    </div>
  );
}
