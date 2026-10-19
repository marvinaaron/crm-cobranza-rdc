"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import type { Cliente } from "@/lib/clientes";
import type { RegistroEfirma } from "@/lib/efirma/types";
import {
  diasHastaVencimiento,
  estadoVigenciaEfirma,
  etiquetaDiasRestantes,
  formatFechaCertificado,
} from "@/lib/efirma/vigencia";
import CuentaRegresivaEfirma from "@/components/admin/CuentaRegresivaEfirma";
import MenuFiltroIcono from "@/components/admin/MenuFiltroIcono";
import ConsentimientoDatosNotice from "@/components/publico/ConsentimientoDatosNotice";
import { getPeriodoFiscalVigente } from "@/lib/clientes";

const ICON_PROPS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const MailIcon = () => (
  <svg {...ICON_PROPS}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const TrashIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

type FiltroEfirma = "todos" | "alerta" | "vencidas" | "sin_registro";

type ArchivosPendientes = { cer?: File; key?: File };

const SUBIDA_TIMEOUT_MS = 90_000;

async function fetchConTimeout(
  input: RequestInfo,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = SUBIDA_TIMEOUT_MS, ...rest } = init;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...rest, signal: controller.signal });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(
        "La subida tardó demasiado (más de 90 s). Revisa tu internet. Si persiste, confirma que el bucket «efirmas» existe en Supabase."
      );
    }
    throw e;
  } finally {
    window.clearTimeout(timer);
  }
}

function ArchivoEfirmaPill({
  tipo,
  registrado,
  archivo,
  disabled,
  onSelect,
}: {
  tipo: "cer" | "key";
  registrado: boolean;
  archivo?: File;
  disabled?: boolean;
  onSelect: (file: File) => void;
}) {
  const tienePendiente = Boolean(archivo);
  const activo = registrado || tienePendiente;
  const etiqueta = tipo === "cer" ? ".cer" : ".key";

  const titulo = tienePendiente
    ? `${etiqueta} listo: ${archivo!.name}`
    : registrado
      ? `${etiqueta} registrado en servidor`
      : `Seleccionar archivo ${etiqueta}`;

  const clases = activo
    ? "bg-slate-800 text-white hover:bg-slate-700"
    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80";

  return (
    <label
      className={`relative h-8 min-w-[2.5rem] px-2 inline-flex items-center justify-center rounded-lg cursor-pointer transition-colors ${clases} ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
      title={titulo}
    >
      <input
        type="file"
        accept={tipo === "cer" ? ".cer" : ".key,.pem"}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = "";
        }}
      />
      <span className="text-[11px] font-semibold">{etiqueta}</span>
      {tienePendiente && (
        <span
          className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white"
          aria-hidden
        />
      )}
    </label>
  );
}

function BadgeEfirma({
  estado,
}: {
  estado: ReturnType<typeof estadoVigenciaEfirma> | null;
}) {
  if (!estado) {
    return <span className="text-[13px] text-slate-400">Sin registro</span>;
  }
  const map = {
    vigente: { label: "Vigente", cls: "bg-slate-50 text-slate-600" },
    alerta: { label: "Por vencer", cls: "bg-slate-100 text-slate-700" },
    urgente: { label: "Urgente", cls: "bg-slate-800 text-white" },
    vencida: { label: "Vencida", cls: "bg-slate-900 text-white" },
  } as const;
  const m = map[estado];
  return (
    <span
      className={`inline-flex h-6 items-center px-2.5 rounded-full text-[11px] font-semibold ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

function clientesParaApi(lista: Cliente[]) {
  return lista
    .filter((c) => c.activo)
    .map((c) => ({
      id: c.id,
      razonSocial: c.razonSocial,
      email: c.email,
      activo: c.activo,
    }));
}

export default function EfirmasAccesosPanel() {
  const { listaClientes, agregarNotificacion, actualizarCliente } = useClientes();
  const [registros, setRegistros] = useState<RegistroEfirma[]>([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState<FiltroEfirma>("todos");
  const [subiendoId, setSubiendoId] = useState<number | null>(null);
  const [subiendoEtiqueta, setSubiendoEtiqueta] = useState<string | null>(null);
  const [notificandoId, setNotificandoId] = useState<number | null>(null);
  const [enviandoAvisoId, setEnviandoAvisoId] = useState<number | null>(null);
  const [avisoEnviadoIds, setAvisoEnviadoIds] = useState<Set<number>>(
    () => new Set()
  );
  const [avisoVencimientoEnviadoIds, setAvisoVencimientoEnviadoIds] = useState<
    Set<number>
  >(() => new Set());
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [pendientes, setPendientes] = useState<Record<number, ArchivosPendientes>>({});

  const clientesActivos = useMemo(
    () => listaClientes.filter((c) => c.activo),
    [listaClientes]
  );

  const mapaRegistros = useMemo(() => {
    const m = new Map<number, RegistroEfirma>();
    registros.forEach((r) => m.set(r.clienteId, r));
    return m;
  }, [registros]);

  const cargarRegistros = useCallback(async () => {
    setCargando(true);
    setErrorCarga(null);
    try {
      const res = await fetch("/api/admin/efirmas");
      let data: { registros?: RegistroEfirma[]; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Respuesta inválida del servidor.");
      }
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudieron cargar las e.firmas.");
      }
      setRegistros(data.registros ?? []);
    } catch (e) {
      setRegistros([]);
      setErrorCarga(e instanceof Error ? e.message : "Error al cargar e.firmas.");
    } finally {
      setCargando(false);
    }
  }, []);

  const sincronizarRecordatorios = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/efirmas/procesar-recordatorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientes: clientesParaApi(listaClientes) }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.enviados > 0) {
        setMensaje(`Se enviaron ${data.enviados} recordatorio(s) por correo.`);
      }
      const listaRes = await fetch("/api/admin/efirmas");
      const listaData = await listaRes.json().catch(() => ({}));
      const regs: RegistroEfirma[] = listaData.registros ?? [];
      setRegistros(regs);

      const periodo = getPeriodoFiscalVigente();
      regs.forEach((reg) => {
        const dias = diasHastaVencimiento(reg.vigenciaFin);
        if (dias <= 30) {
          const cli = listaClientes.find((c) => c.id === reg.clienteId);
          if (!cli) return;
          agregarNotificacion({
            tipo: "admin_efirma_vence_pronto",
            destinatario: "admin",
            clienteId: reg.clienteId,
            periodo,
            titulo: `🔐 E.firma de ${cli.razonSocial} · ${etiquetaDiasRestantes(dias).toLowerCase()}`,
            detalle: "Coordina la renovación con el cliente antes de que se venza.",
            href: "/accesos",
          });
        }
      });
    } catch {
      // No bloquear la página si falla el envío de recordatorios.
    }
  }, [listaClientes, agregarNotificacion]);

  useEffect(() => {
    void cargarRegistros();
  }, [cargarRegistros]);

  // Recordatorios en segundo plano: no bloquean el primer render ni la carga inicial.
  useEffect(() => {
    if (cargando || errorCarga) return;
    const t = window.setTimeout(() => {
      void sincronizarRecordatorios();
    }, 800);
    return () => window.clearTimeout(t);
  }, [cargando, errorCarga, sincronizarRecordatorios]);

  const filas = useMemo(() => {
    return clientesActivos
      .filter((c) => {
        const q = searchTerm.toLowerCase();
        const match =
          (c.razonSocial ?? "").toLowerCase().includes(q) ||
          (c.rfc ?? "").toLowerCase().includes(q);
        if (!match) return false;
        const reg = mapaRegistros.get(c.id);
        const dias = reg ? diasHastaVencimiento(reg.vigenciaFin) : null;
        if (filtro === "sin_registro") return !reg;
        if (filtro === "vencidas") return reg && dias !== null && dias < 0;
        if (filtro === "alerta") return reg && dias !== null && dias <= 30 && dias >= 0;
        return true;
      })
      .sort((a, b) => {
        const ra = mapaRegistros.get(a.id);
        const rb = mapaRegistros.get(b.id);
        if (!ra && !rb) {
          return (a.razonSocial ?? "").localeCompare(b.razonSocial ?? "", "es");
        }
        if (!ra) return 1;
        if (!rb) return -1;
        return new Date(ra.vigenciaFin).getTime() - new Date(rb.vigenciaFin).getTime();
      });
  }, [clientesActivos, searchTerm, filtro, mapaRegistros]);

  const resumen = useMemo(() => {
    let alerta = 0;
    let vencidas = 0;
    let sinRegistro = 0;
    clientesActivos.forEach((c) => {
      const reg = mapaRegistros.get(c.id);
      if (!reg) {
        sinRegistro += 1;
        return;
      }
      const dias = diasHastaVencimiento(reg.vigenciaFin);
      if (dias < 0) vencidas += 1;
      else if (dias <= 30) alerta += 1;
    });
    return { alerta, vencidas, sinRegistro, total: registros.length };
  }, [clientesActivos, mapaRegistros, registros.length]);

  const subirEfirma = async (cliente: Cliente, cer: File, key: File | null) => {
    setSubiendoId(cliente.id);
    setSubiendoEtiqueta("Subiendo certificado…");
    setMensaje(null);
    const fd = new FormData();
    fd.append("clienteId", String(cliente.id));
    fd.append("cer", cer);
    if (key) fd.append("key", key);
    try {
      const res = await fetchConTimeout("/api/admin/efirmas", { method: "POST", body: fd });
      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("El servidor respondió sin datos válidos.");
      }
      if (!res.ok) {
        setMensaje(data.error ?? `Error al subir (${res.status}).`);
        return;
      }
      setMensaje(`Certificado de ${cliente.razonSocial} registrado correctamente.`);
      setPendientes((p) => {
        const next = { ...p };
        delete next[cliente.id];
        return next;
      });
      setSubiendoId(null);
      setSubiendoEtiqueta(null);
      await cargarRegistros();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "Error de red al subir.");
    } finally {
      setSubiendoId(null);
      setSubiendoEtiqueta(null);
    }
  };

  const subirSoloKey = async (cliente: Cliente, key: File) => {
    setSubiendoId(cliente.id);
    setSubiendoEtiqueta("Subiendo llave .key…");
    setMensaje(null);
    const fd = new FormData();
    fd.append("clienteId", String(cliente.id));
    fd.append("key", key);
    try {
      const res = await fetchConTimeout("/api/admin/efirmas", { method: "PATCH", body: fd });
      let data: { error?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("El servidor respondió sin datos válidos.");
      }
      if (!res.ok) {
        setMensaje(data.error ?? `Error al subir la llave (${res.status}).`);
        return;
      }
      setMensaje(`Llave .key de ${cliente.razonSocial} registrada.`);
      setPendientes((p) => ({
        ...p,
        [cliente.id]: { ...p[cliente.id], key: undefined },
      }));
      setSubiendoId(null);
      setSubiendoEtiqueta(null);
      await cargarRegistros();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "Error de red al subir la llave.");
    } finally {
      setSubiendoId(null);
      setSubiendoEtiqueta(null);
    }
  };

  const confirmarSubida = async (cliente: Cliente, reg: RegistroEfirma | undefined) => {
    const pend = pendientes[cliente.id];
    if (pend?.cer) {
      await subirEfirma(cliente, pend.cer, pend.key ?? null);
      return;
    }
    if (reg && pend?.key) {
      await subirSoloKey(cliente, pend.key);
    }
  };

  const enviarCorreoCliente = async (cliente: Cliente) => {
    setNotificandoId(cliente.id);
    setMensaje(null);
    try {
      const res = await fetch("/api/admin/efirmas/notificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: cliente.id,
          clientes: clientesParaApi(listaClientes),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensaje(data.error ?? "No se pudo enviar el correo.");
        return;
      }
      setMensaje(`Correo enviado a ${cliente.razonSocial}.`);
      setAvisoVencimientoEnviadoIds((prev) => new Set(prev).add(cliente.id));
      await cargarRegistros();
      const reg = mapaRegistros.get(cliente.id);
      const dias = reg ? diasHastaVencimiento(reg.vigenciaFin) : data.diasRestantes ?? 0;
      const periodo = getPeriodoFiscalVigente();
      agregarNotificacion({
        tipo: "efirma_vence_pronto",
        destinatario: "cliente",
        clienteId: cliente.id,
        periodo,
        titulo: `🔐 ${etiquetaDiasRestantes(dias)} · Tu e.firma`,
        detalle: "Escríbenos y la renovamos a tiempo, sin sustos con el SAT.",
        href: "/portal/inicio",
      });
    } finally {
      setNotificandoId(null);
    }
  };

  const enviarAvisoPrivacidad = async (cliente: Cliente) => {
    setEnviandoAvisoId(cliente.id);
    setMensaje(null);
    try {
      const res = await fetch("/api/admin/efirmas/aviso-privacidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId: cliente.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMensaje(data.error ?? "No se pudo enviar el aviso de privacidad.");
        return;
      }
      if (data.avisoPrivacidad) {
        actualizarCliente({
          ...cliente,
          avisoPrivacidad: data.avisoPrivacidad,
        });
      }
      setMensaje(
        `Aviso formal enviado a ${data.to ?? cliente.email}. El cliente acepta en su liga privada; el estatus queda en su expediente.`
      );
      setAvisoEnviadoIds((prev) => new Set(prev).add(cliente.id));
    } finally {
      setEnviandoAvisoId(null);
    }
  };

  const eliminarEfirma = async (clienteId: number) => {
    if (!confirm("¿Eliminar los archivos de e.firma de este cliente?")) return;
    await fetch(`/api/admin/efirmas?clienteId=${clienteId}`, { method: "DELETE" });
    await cargarRegistros();
    setMensaje("Registro eliminado.");
  };

  const tarjetas: Array<{
    key: FiltroEfirma;
    label: string;
    value: number;
    detalle: string;
  }> = [
    {
      key: "todos",
      label: "Registradas",
      value: resumen.total,
      detalle: "Con certificado",
    },
    {
      key: "alerta",
      label: "Por vencer",
      value: resumen.alerta,
      detalle: "En los próximos 30 días",
    },
    {
      key: "vencidas",
      label: "Vencidas",
      value: resumen.vencidas,
      detalle: "Hay que renovar",
    },
    {
      key: "sin_registro",
      label: "Sin registro",
      value: resumen.sinRegistro,
      detalle: "Falta .cer",
    },
  ];

  const renderAcciones = (cli: Cliente) => {
    const reg = mapaRegistros.get(cli.id);
    const dias = reg ? diasHastaVencimiento(reg.vigenciaFin) : null;
    const enAlerta = dias !== null && dias <= 30;
    const subiendo = subiendoId === cli.id;
    const notificando = notificandoId === cli.id;
    const pend = pendientes[cli.id];
    const puedeSubirCer = Boolean(pend?.cer);
    const puedeSubirKey = Boolean(reg && pend?.key);
    const puedeConfirmar = puedeSubirCer || puedeSubirKey;
    const avisoAceptado = Boolean(cli.avisoPrivacidad?.aceptadoEn);
    const avisoEnviado =
      avisoAceptado ||
      Boolean(cli.avisoPrivacidad?.enviadoEn) ||
      avisoEnviadoIds.has(cli.id);

    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <ArchivoEfirmaPill
          tipo="cer"
          registrado={Boolean(reg)}
          archivo={pend?.cer}
          disabled={subiendo}
          onSelect={(cer) =>
            setPendientes((p) => ({
              ...p,
              [cli.id]: { ...p[cli.id], cer },
            }))
          }
        />
        <ArchivoEfirmaPill
          tipo="key"
          registrado={Boolean(reg?.tieneKey)}
          archivo={pend?.key}
          disabled={subiendo}
          onSelect={(key) =>
            setPendientes((p) => ({
              ...p,
              [cli.id]: { ...p[cli.id], key },
            }))
          }
        />
        {puedeConfirmar && (
          <button
            type="button"
            disabled={subiendo || !avisoAceptado}
            onClick={() => void confirmarSubida(cli, reg)}
            className="h-8 px-2.5 rounded-full bg-slate-900 text-white text-[12px] font-semibold hover:bg-slate-800 disabled:opacity-50"
            title={
              avisoAceptado
                ? puedeSubirCer
                  ? "Subir certificado"
                  : "Subir llave"
                : "Espera a que el cliente acepte el aviso de privacidad"
            }
          >
            {subiendo ? "…" : "Subir"}
          </button>
        )}
        <button
          type="button"
          disabled={enviandoAvisoId === cli.id || !cli.email?.trim()}
          onClick={() => void enviarAvisoPrivacidad(cli)}
          title={
            avisoAceptado
              ? "Aviso ya aceptado (puedes reenviar)"
              : avisoEnviado
                ? "Aviso enviado · pendiente de aceptación"
                : cli.email?.trim()
                  ? "Enviar aviso de privacidad por correo"
                  : "Sin correo registrado"
          }
          className={`h-8 w-8 flex items-center justify-center rounded-full disabled:opacity-40 ${
            avisoAceptado
              ? "bg-slate-800 text-white"
              : avisoEnviado
                ? "bg-slate-200 text-slate-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {enviandoAvisoId === cli.id ? (
            <span className="text-[10px] font-semibold">…</span>
          ) : (
            <MailIcon />
          )}
        </button>
        {reg && enAlerta && (
          <button
            type="button"
            disabled={notificando || !cli.email}
            onClick={() => void enviarCorreoCliente(cli)}
            title={
              avisoVencimientoEnviadoIds.has(cli.id)
                ? "Aviso de vencimiento ya enviado"
                : cli.email
                  ? "Avisar al cliente por correo"
                  : "Sin correo registrado"
            }
            className={`h-8 w-8 flex items-center justify-center rounded-full disabled:opacity-40 ${
              avisoVencimientoEnviadoIds.has(cli.id)
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <MailIcon />
          </button>
        )}
        {reg && (
          <button
            type="button"
            title="Eliminar registro"
            onClick={() => {
              void eliminarEfirma(cli.id).then(() => {
                setPendientes((p) => {
                  const next = { ...p };
                  delete next[cli.id];
                  return next;
                });
              });
            }}
            className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      {mensaje && (
        <p
          className={`text-[13px] font-semibold rounded-[1.25rem] px-4 py-3 ${
            mensaje.includes("correctamente") ||
            mensaje.includes("registrada") ||
            mensaje.includes("enviado") ||
            mensaje.includes("recordatorio")
              ? "text-emerald-700 bg-emerald-50"
              : "text-rose-700 bg-rose-50"
          }`}
        >
          {mensaje}
        </p>
      )}

      {errorCarga && (
        <div className="text-[13px] font-semibold text-rose-700 bg-rose-50 rounded-[1.25rem] px-4 py-3 space-y-2">
          <p>{errorCarga}</p>
          <button
            type="button"
            onClick={() => void cargarRegistros()}
            className="text-[13px] font-semibold text-rose-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="rounded-[1.25rem] bg-white overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-[auto_auto_auto]">
          {tarjetas.map((card) => {
            const activa = card.key !== "todos" && filtro === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() =>
                  setFiltro((prev) => (prev === card.key ? "todos" : card.key))
                }
                className={`min-w-0 grid grid-rows-subgrid row-span-3 px-3 py-4 sm:px-5 text-left transition-colors ${
                  activa ? "bg-slate-50" : "active:bg-slate-50/80"
                }`}
              >
                <p className="text-[11px] font-semibold text-slate-500 truncate">
                  {card.label}
                  {activa && card.key !== "todos" ? (
                    <span className="ml-1 text-slate-400">· filtro</span>
                  ) : null}
                </p>
                <p className="mt-1.5 text-[22px] sm:text-[26px] font-bold tabular-nums leading-none tracking-tight text-slate-900">
                  {card.value}
                </p>
                <p className="mt-1.5 text-[11px] text-slate-400 leading-snug truncate min-h-[1.25rem]">
                  {card.detalle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Buscar cliente o RFC…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 w-full sm:w-56 mr-auto px-4 rounded-full bg-white ring-1 ring-black/[0.06] text-[13px] font-medium outline-none"
        />
        <MenuFiltroIcono
          grupos={[
            {
              modo: "single",
              valorPorDefecto: "todos",
              opciones: [
                { id: "todos", label: "Todos" },
                { id: "alerta", label: "Por vencer" },
                { id: "vencidas", label: "Vencidas" },
                { id: "sin_registro", label: "Sin .cer" },
              ],
              seleccion: [filtro],
              onChange: (ids) => setFiltro((ids[0] as FiltroEfirma) ?? "todos"),
            },
          ]}
        />
      </div>

      {cargando ? (
        <p className="text-center py-12 text-slate-400 text-[13px] font-semibold">
          Cargando…
        </p>
      ) : filas.length === 0 ? (
        <div className="rounded-[1.25rem] bg-white py-16 text-center">
          <p className="text-[15px] font-semibold text-slate-900">Sin resultados</p>
          <p className="mt-1 text-[13px] text-slate-400">
            Prueba otro recuadro o quita el filtro.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block rounded-[1.25rem] bg-white overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  <th className="pl-5 pr-3 py-2">Cliente</th>
                  <th className="py-2 pr-3">Vigencia</th>
                  <th className="py-2 pr-3">Estatus</th>
                  <th className="py-2 pr-5 text-right">Archivos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filas.map((cli) => {
                  const reg = mapaRegistros.get(cli.id);
                  const dias = reg ? diasHastaVencimiento(reg.vigenciaFin) : null;
                  const estado = reg ? estadoVigenciaEfirma(reg.vigenciaFin) : null;
                  const enAlerta = dias !== null && dias <= 30;
                  const subiendo = subiendoId === cli.id;
                  const notificando = notificandoId === cli.id;
                  const avisoAceptado = Boolean(cli.avisoPrivacidad?.aceptadoEn);
                  const avisoEnviado =
                    avisoAceptado ||
                    Boolean(cli.avisoPrivacidad?.enviadoEn) ||
                    avisoEnviadoIds.has(cli.id);

                  return (
                    <tr key={cli.id} className="hover:bg-slate-50/80">
                      <td className="pl-5 pr-3 py-3 min-w-0">
                        <p className="font-semibold text-[15px] text-slate-900 truncate">
                          {cli.razonSocial}
                        </p>
                        <p className="text-[12px] text-slate-400 tabular-nums truncate">
                          {cli.rfc}
                          {reg?.titular ? ` · ${reg.titular}` : ""}
                        </p>
                        {avisoAceptado ? (
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Aviso aceptado
                          </p>
                        ) : avisoEnviado ? (
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Aviso enviado · espera aceptación
                          </p>
                        ) : null}
                        {(subiendo || notificando) && (
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {subiendo
                              ? subiendoEtiqueta ?? "Subiendo…"
                              : "Enviando correo…"}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        {reg ? (
                          <div className="flex items-center gap-2">
                            {enAlerta && dias !== null ? (
                              <CuentaRegresivaEfirma
                                diasRestantes={dias}
                                tamano="sm"
                              />
                            ) : null}
                            <div>
                              <p className="text-[13px] font-semibold tabular-nums text-slate-800">
                                {formatFechaCertificado(reg.vigenciaFin)}
                              </p>
                              {dias !== null ? (
                                <p className="text-[11px] text-slate-400">
                                  {etiquetaDiasRestantes(dias)}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[13px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <BadgeEfirma estado={estado} />
                      </td>
                      <td className="py-3 pr-5">
                        <div className="flex items-center justify-end">
                          {renderAcciones(cli)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="lg:hidden rounded-[1.25rem] bg-white divide-y divide-slate-100 overflow-hidden">
            {filas.map((cli) => {
              const reg = mapaRegistros.get(cli.id);
              const dias = reg ? diasHastaVencimiento(reg.vigenciaFin) : null;
              const estado = reg ? estadoVigenciaEfirma(reg.vigenciaFin) : null;
              const enAlerta = dias !== null && dias <= 30;
              const avisoAceptado = Boolean(cli.avisoPrivacidad?.aceptadoEn);
              const avisoEnviado =
                avisoAceptado ||
                Boolean(cli.avisoPrivacidad?.enviadoEn) ||
                avisoEnviadoIds.has(cli.id);

              return (
                <li key={cli.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-slate-900 truncate">
                        {cli.razonSocial}
                      </p>
                      <p className="mt-0.5 text-[12px] text-slate-400">
                        {reg
                          ? formatFechaCertificado(reg.vigenciaFin)
                          : cli.rfc}
                      </p>
                    </div>
                    <BadgeEfirma estado={estado} />
                  </div>
                  {enAlerta && dias !== null ? (
                    <p className="mt-1 text-[12px] text-slate-500">
                      {etiquetaDiasRestantes(dias)}
                    </p>
                  ) : null}
                  {avisoAceptado ? (
                    <p className="mt-1 text-[11px] text-slate-500">Aviso aceptado</p>
                  ) : avisoEnviado ? (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Aviso enviado · espera aceptación
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-center justify-end">
                    {renderAcciones(cli)}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <ConsentimientoDatosNotice
        compacto
        informativo
        checked={false}
        onChange={() => {}}
      />
      <p className="text-[12px] text-slate-400 leading-relaxed max-w-2xl">
        El cliente acepta el aviso en su liga privada; cuando figure como aceptado,
        ya puedes subir .cer y .key. La vigencia se lee del certificado.
        Recordatorios a 30, 15, 7 y 3 días.
      </p>
    </div>
  );
}
