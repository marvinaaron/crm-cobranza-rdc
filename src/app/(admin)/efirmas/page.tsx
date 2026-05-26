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

const UploadIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const RefreshIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const KeyIcon = () => (
  <svg {...ICON_PROPS}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
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

export default function EfirmasPage() {
  const { listaClientes, agregarNotificacion } = useClientes();
  const [registros, setRegistros] = useState<RegistroEfirma[]>([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState<FiltroEfirma>("todos");
  const [subiendoId, setSubiendoId] = useState<number | null>(null);
  const [notificandoId, setNotificandoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

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
    try {
      const res = await fetch("/api/admin/efirmas");
      const data = await res.json();
      if (res.ok && data.registros) {
        setRegistros(data.registros);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  const sincronizarRecordatorios = useCallback(async () => {
    const res = await fetch("/api/admin/efirmas/procesar-recordatorios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientes: clientesParaApi(listaClientes) }),
    });
    const data = await res.json();
    if (data.enviados > 0) {
      setMensaje(`Se enviaron ${data.enviados} recordatorio(s) por correo.`);
    }
    const listaRes = await fetch("/api/admin/efirmas");
    const listaData = await listaRes.json();
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
          titulo: `E.firma · ${cli.razonSocial}`,
          detalle: etiquetaDiasRestantes(dias),
          href: "/efirmas",
        });
      }
    });
  }, [listaClientes, agregarNotificacion]);

  useEffect(() => {
    void (async () => {
      await cargarRegistros();
      await sincronizarRecordatorios();
    })();
    // Solo al montar la página
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filas = useMemo(() => {
    return clientesActivos
      .filter((c) => {
        const q = searchTerm.toLowerCase();
        const match =
          c.razonSocial.toLowerCase().includes(q) ||
          c.rfc.toLowerCase().includes(q);
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
        if (!ra && !rb) return a.razonSocial.localeCompare(b.razonSocial);
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
    setMensaje(null);
    const fd = new FormData();
    fd.append("clienteId", String(cliente.id));
    fd.append("cer", cer);
    if (key) fd.append("key", key);
    try {
      const res = await fetch("/api/admin/efirmas", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMensaje(data.error ?? "Error al subir.");
        return;
      }
      setMensaje(`Certificado de ${cliente.razonSocial} registrado correctamente.`);
      await cargarRegistros();
    } finally {
      setSubiendoId(null);
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
        titulo: "Tu e.firma está por vencer",
        detalle: `${etiquetaDiasRestantes(dias)}. Escríbenos para renovarla a tiempo y evitar contratiempos con el SAT.`,
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

      {mensaje && (
        <p className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          {mensaje}
        </p>
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
          className="w-full lg:flex-1 px-4 py-3 rounded-2xl border border-slate-100 bg-white text-base lg:text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
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

                  <input
                    id={`key-${cli.id}`}
                    type="file"
                    accept=".key,.pem"
                    className="sr-only"
                    title="Archivo .key (opcional)"
                  />

                  <div className="flex items-center gap-1.5 shrink-0">
                    <label
                      title={reg ? "Actualizar .cer" : "Subir .cer"}
                      className={`cursor-pointer h-9 w-9 flex items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700 ${
                        subiendo ? "opacity-50" : ""
                      }`}
                    >
                      <input
                        type="file"
                        accept=".cer"
                        className="sr-only"
                        disabled={subiendo}
                        onChange={(e) => {
                          const cer = e.target.files?.[0];
                          if (!cer) return;
                          const keyInput = document.getElementById(
                            `key-${cli.id}`
                          ) as HTMLInputElement | null;
                          const key = keyInput?.files?.[0] ?? null;
                          void subirEfirma(cli, cer, key);
                          e.target.value = "";
                        }}
                      />
                      {reg ? <RefreshIcon /> : <UploadIcon />}
                    </label>

                    <label
                      htmlFor={`key-${cli.id}`}
                      title="Añadir archivo .key"
                      className="cursor-pointer h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-100 hover:bg-slate-100"
                    >
                      <KeyIcon />
                    </label>

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
                        onClick={() => eliminarEfirma(cli.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 ring-1 ring-slate-100"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>

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
                    {reg.tieneKey && (
                      <span className="text-[9px] font-black uppercase text-emerald-600">
                        .key OK
                      </span>
                    )}
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
                    {subiendo ? "Subiendo certificado…" : "Enviando correo…"}
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
