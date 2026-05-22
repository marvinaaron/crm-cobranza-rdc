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

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
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
        titulo: "Renueve su e.firma",
        detalle: etiquetaDiasRestantes(dias),
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
    <div className="space-y-6 max-w-full overflow-x-hidden">
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

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Buscar cliente o RFC…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-100 bg-white text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
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
              className={`px-3 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
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

            return (
              <div
                key={cli.id}
                className={`rounded-2xl bg-white ring-1 p-3 sm:p-4 shadow-sm overflow-hidden min-w-0 ${
                  estado === "vencida"
                    ? "ring-red-200 bg-red-50/30"
                    : enAlerta
                      ? "ring-amber-200"
                      : "ring-slate-100"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">
                      {cli.razonSocial}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                      {cli.rfc}
                    </p>
                  </div>
                  {dias !== null && enAlerta && (
                    <CuentaRegresivaEfirma diasRestantes={dias} tamano="sm" />
                  )}
                </div>

                {reg ? (
                  <div className="mt-2 space-y-1 min-w-0">
                    <p className="text-[11px] text-slate-600 truncate">
                      <span className="font-bold">Titular:</span> {reg.titular}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Vence:{" "}
                      <span className="font-black">
                        {formatFechaCertificado(reg.vigenciaFin)}
                      </span>
                      {reg.tieneKey && (
                        <span className="ml-1 text-[9px] font-black uppercase text-emerald-600">
                          · .key
                        </span>
                      )}
                    </p>
                    {enAlerta && dias !== null && (
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">
                        {etiquetaDiasRestantes(dias)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] font-bold text-slate-400">
                    Sin certificado registrado
                  </p>
                )}

                <input
                  id={`key-${cli.id}`}
                  type="file"
                  accept=".key,.pem"
                  className="sr-only"
                  title="Archivo .key (opcional)"
                />

                <div className="mt-3 grid grid-cols-2 gap-2 w-full">
                  <label className="cursor-pointer col-span-2 sm:col-span-1">
                    <input
                      type="file"
                      accept=".cer"
                      className="sr-only"
                      disabled={subiendoId === cli.id}
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
                    <span className="flex w-full items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-violet-700">
                      <KeyIcon />
                      {subiendoId === cli.id ? "Subiendo…" : reg ? "Actualizar .cer" : "Subir .cer"}
                    </span>
                  </label>

                  <label
                    htmlFor={`key-${cli.id}`}
                    className="cursor-pointer col-span-2 sm:col-span-1"
                  >
                    <span className="flex w-full items-center justify-center px-3 py-2.5 rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-100 text-[9px] font-black uppercase tracking-widest hover:bg-slate-100">
                      Añadir .key
                    </span>
                  </label>

                  {reg && enAlerta && (
                    <button
                      type="button"
                      disabled={notificandoId === cli.id || !cli.email}
                      onClick={() => enviarCorreoCliente(cli)}
                      title={
                        cli.email ? "Enviar correo al cliente" : "Sin correo registrado"
                      }
                      className="col-span-2 sm:col-span-1 flex w-full items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-200 text-[9px] font-black uppercase tracking-widest hover:bg-amber-100 disabled:opacity-40"
                    >
                      <MailIcon />
                      {notificandoId === cli.id ? "…" : "Avisar"}
                    </button>
                  )}

                  {reg && (
                    <button
                      type="button"
                      onClick={() => eliminarEfirma(cli.id)}
                      className={`${
                        reg && enAlerta ? "col-span-2 sm:col-span-1" : "col-span-2"
                      } w-full px-3 py-2.5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-red-600 hover:bg-red-50 ring-1 ring-slate-100`}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
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
