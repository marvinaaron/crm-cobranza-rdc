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
    ? "bg-slate-900 text-white ring-slate-900 hover:bg-slate-800"
    : "bg-white text-slate-900 ring-slate-300 hover:bg-slate-50";

  return (
    <label
      className={`relative h-9 min-w-[2.75rem] px-2.5 inline-flex items-center justify-center rounded-lg ring-1 cursor-pointer transition-colors ${clases} ${
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
      <span className="text-[10px] font-black uppercase tracking-wide">{etiqueta}</span>
      {tienePendiente && (
        <span
          className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white"
          aria-hidden
        />
      )}
    </label>
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
  const { listaClientes, agregarNotificacion } = useClientes();
  const [registros, setRegistros] = useState<RegistroEfirma[]>([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState<FiltroEfirma>("todos");
  const [subiendoId, setSubiendoId] = useState<number | null>(null);
  const [subiendoEtiqueta, setSubiendoEtiqueta] = useState<string | null>(null);
  const [notificandoId, setNotificandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [pendientes, setPendientes] = useState<Record<number, ArchivosPendientes>>({});
  const [consentimientoCliente, setConsentimientoCliente] = useState<Record<number, boolean>>({});

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

  const eliminarEfirma = async (clienteId: number) => {
    if (!confirm("¿Eliminar los archivos de e.firma de este cliente?")) return;
    await fetch(`/api/admin/efirmas?clienteId=${clienteId}`, { method: "DELETE" });
    await cargarRegistros();
    setMensaje("Registro eliminado.");
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto overflow-x-hidden">
      <header>
        <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.3em] mb-1.5">
          SAT · FIEL
        </p>
        <h1 className="text-2xl lg:text-4xl font-black text-slate-800 uppercase tracking-tight">
          E.firmas
        </h1>
        <p className="text-slate-400 font-bold text-xs lg:text-sm mt-1.5">
          Vigencia de certificados · Recordatorios automáticos a 30, 15, 7 y 3 días
        </p>
      </header>

      <ConsentimientoDatosNotice
        compacto
        informativo
        checked={false}
        onChange={() => {}}
      />

      <p className="text-[10px] text-slate-500 -mt-4">
        Al subir archivos .cer / .key confirma por cliente que autorizó el tratamiento conforme al
        aviso de privacidad.
      </p>

      {mensaje && (
        <p
          className={`text-sm font-bold rounded-xl px-4 py-3 border ${
            mensaje.includes("correctamente") ||
            mensaje.includes("registrada") ||
            mensaje.includes("enviado") ||
            mensaje.includes("recordatorio")
              ? "text-emerald-700 bg-emerald-50 border-emerald-100"
              : "text-red-700 bg-red-50 border-red-100"
          }`}
        >
          {mensaje}
        </p>
      )}

      {errorCarga && (
        <div className="text-sm font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 space-y-2">
          <p>{errorCarga}</p>
          <p className="text-xs font-medium text-red-600/90">
            Si dice que falta la tabla{" "}
            <code className="bg-white px-1 rounded">cliente_efirma</code>, ejecuta la
            migración en Supabase SQL Editor.
          </p>
          <button
            type="button"
            onClick={() => void cargarRegistros()}
            className="text-[10px] font-black uppercase tracking-widest text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Registradas", value: resumen.total, color: "text-slate-800" },
          { label: "Por vencer (30d)", value: resumen.alerta, color: "text-amber-600" },
          { label: "Vencidas", value: resumen.vencidas, color: "text-red-600" },
          { label: "Sin registro", value: resumen.sinRegistro, color: "text-slate-400" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm"
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {k.label}
            </p>
            <p className={`text-2xl font-black tabular-nums ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <input
          type="search"
          placeholder="Buscar cliente o RFC…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full lg:flex-1 px-4 py-3 rounded-2xl border border-slate-100 bg-white text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["todos", "Todos"],
              ["alerta", "Por vencer"],
              ["vencidas", "Vencidas"],
              ["sin_registro", "Sin .cer"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFiltro(k)}
              className={`px-3 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filtro === k
                  ? "bg-violet-600 text-white"
                  : "bg-white text-slate-500 ring-1 ring-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <p className="text-center py-12 text-slate-400 font-bold text-sm">Cargando…</p>
      ) : (
        <div className="space-y-3">
          {filas.map((cli) => {
            const reg = mapaRegistros.get(cli.id);
            const dias = reg ? diasHastaVencimiento(reg.vigenciaFin) : null;
            const estado = reg ? estadoVigenciaEfirma(reg.vigenciaFin) : null;
            const enAlerta = dias !== null && dias <= 30;

            const subiendo = subiendoId === cli.id;
            const notificando = notificandoId === cli.id;
            const pend = pendientes[cli.id];
            const puedeSubirCer = Boolean(pend?.cer);
            const puedeSubirKey = Boolean(reg && pend?.key);
            const puedeConfirmar = puedeSubirCer || puedeSubirKey;

            return (
              <div
                key={cli.id}
                className={`rounded-2xl bg-white ring-1 px-4 py-3 shadow-sm overflow-hidden min-w-0 ${
                  estado === "vencida"
                    ? "ring-red-200 bg-red-50/30"
                    : enAlerta
                      ? "ring-amber-200"
                      : "ring-slate-100"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 w-full">
                  {dias !== null && enAlerta && (
                    <CuentaRegresivaEfirma diasRestantes={dias} tamano="sm" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">
                      {cli.razonSocial}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      {cli.rfc}
                    </p>
                  </div>

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
                        disabled={subiendo || !consentimientoCliente[cli.id]}
                        onClick={() => void confirmarSubida(cli, reg)}
                        className="h-9 px-2.5 rounded-lg bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50"
                        title={
                          consentimientoCliente[cli.id]
                            ? puedeSubirCer
                              ? "Subir certificado"
                              : "Subir llave"
                            : "Marca la autorización del cliente"
                        }
                      >
                        {subiendo ? "…" : "Subir"}
                      </button>
                    )}
                    {reg && enAlerta && (
                      <button
                        type="button"
                        disabled={notificando || !cli.email}
                        onClick={() => enviarCorreoCliente(cli)}
                        title={
                          cli.email ? "Avisar al cliente por correo" : "Sin correo registrado"
                        }
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100 disabled:opacity-40"
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
                        className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 ring-1 ring-slate-100"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>

                {puedeConfirmar ? (
                  <label className="mt-2 flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentimientoCliente[cli.id] ?? false}
                      onChange={(e) =>
                        setConsentimientoCliente((p) => ({
                          ...p,
                          [cli.id]: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-marca-navy"
                    />
                    <span className="text-[10px] text-slate-600 leading-snug">
                      El cliente aceptó el aviso de privacidad y autorizó el tratamiento de su
                      e.firma para trámites del encargo.
                    </span>
                  </label>
                ) : null}

                {reg ? (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                    <p className="text-[11px] text-slate-600 truncate min-w-0 max-w-full">
                      <span className="font-bold">Titular:</span> {reg.titular}
                    </p>
                    <p className="text-[11px] text-slate-600 whitespace-nowrap">
                      Vence:{" "}
                      <span className="font-black">
                        {formatFechaCertificado(reg.vigenciaFin)}
                      </span>
                    </p>
                    {enAlerta && dias !== null && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">
                        {etiquetaDiasRestantes(dias)}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] font-bold text-slate-400">
                    Sin certificado registrado
                  </p>
                )}

                {(subiendo || notificando) && (
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-violet-600">
                    {subiendo
                      ? subiendoEtiqueta ?? "Subiendo…"
                      : "Enviando correo…"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-slate-400 leading-relaxed max-w-2xl">
        Los archivos .cer y .key se almacenan de forma privada. La vigencia se lee automáticamente del
        certificado. Los recordatorios por correo se envían a 30, 15, 7 y 3 días antes del
        vencimiento cuando visitas esta sección o al pulsar &quot;Avisar&quot;.
      </p>
    </div>
  );
}
