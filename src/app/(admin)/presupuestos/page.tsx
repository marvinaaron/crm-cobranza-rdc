"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useClientes } from "@/context/ClientesContext";
import Fiscalino from "@/components/Fiscalino";
import { useConfirm, useNotify } from "@/components/ConfirmProvider";
import { useScrollLock } from "@/hooks/useScrollLock";
import PresupuestoWizard from "@/components/admin/presupuestos/PresupuestoWizard";
import PresupuestoDocumento, {
  descargarPresupuestoPDF,
} from "@/components/admin/presupuestos/PresupuestoDocumento";
import {
  type Presupuesto,
  type EstadoPresupuesto,
  ESTADO_PRESUPUESTO_META,
  REGIMENES_PRESUPUESTO,
  OBJECION_META,
  DATOS_PRESUPUESTO,
  catalogoEfectivo,
  precioDeRegimen,
  montoMensualPresupuesto,
  fmtMoneda,
  fmtFechaLarga,
  fechaVencimiento,
} from "@/lib/presupuestos";
import { plantillaPresupuesto } from "@/lib/mailer/templates";
import {
  DESPACHO_NOMBRE,
  DESPACHO_EMAIL,
  DESPACHO_SITIO,
} from "@/lib/workspace-email";
import { isValidEmail } from "@/lib/email";
import { etiquetaEstadoAvisoPrivacidad } from "@/lib/aviso-privacidad";

type Tab = "lista" | "catalogo";

const ESTADOS: EstadoPresupuesto[] = [
  "borrador",
  "enviado",
  "aceptado",
  "rechazado",
];

export default function PresupuestosPage() {
  const {
    presupuestos,
    eliminarPresupuesto,
    cambiarEstadoPresupuesto,
  } = useClientes();
  const router = useRouter();
  const confirm = useConfirm();
  const notify = useNotify();

  const [tab, setTab] = useState<Tab>("lista");
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [editando, setEditando] = useState<Presupuesto | null>(null);
  const [detalleId, setDetalleId] = useState<string | null>(null);

  const detalle = presupuestos.find((p) => p.id === detalleId) ?? null;

  const ordenados = useMemo(
    () =>
      [...presupuestos].sort((a, b) =>
        (b.creadoEn || "").localeCompare(a.creadoEn || "")
      ),
    [presupuestos]
  );

  const stats = useMemo(() => {
    const aceptados = presupuestos.filter((p) => p.estado === "aceptado");
    const mensualAceptado = aceptados.reduce(
      (s, p) => s + montoMensualPresupuesto(p),
      0
    );
    return {
      total: presupuestos.length,
      enviados: presupuestos.filter((p) => p.estado === "enviado").length,
      aceptados: aceptados.length,
      mensualAceptado,
    };
  }, [presupuestos]);

  const abrirNuevo = () => {
    setEditando(null);
    setWizardAbierto(true);
  };

  const abrirEditar = (p: Presupuesto) => {
    setEditando(p);
    setWizardAbierto(true);
    setDetalleId(null);
  };

  const eliminar = async (p: Presupuesto) => {
    const ok = await confirm({
      titulo: "Eliminar presupuesto",
      mensaje: `¿Eliminar el presupuesto ${p.folio} de ${p.cliente.razonSocial}? Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    eliminarPresupuesto(p.id);
    setDetalleId(null);
    notify({ titulo: "Presupuesto eliminado" });
  };

  const convertirEnCliente = (p: Presupuesto) => {
    router.push(`/clientes?prePresupuesto=${encodeURIComponent(p.id)}`);
  };

  return (
    <div className="relative font-sans text-slate-800 dark:text-slate-100 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.3em] mb-1">
              Ventas
            </p>
            <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter leading-none text-slate-800 dark:text-white">
              Presupuestos
            </h1>
          </div>
          <button
            onClick={abrirNuevo}
            className="bg-violet-600 hover:bg-violet-700 text-white h-12 px-6 rounded-full font-black text-[11px] uppercase tracking-widest shadow-md shadow-violet-600/25 transition active:scale-95 flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Nuevo presupuesto
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["lista", "catalogo"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                tab === t
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-100 dark:shadow-violet-900/40"
                  : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-white/10"
              }`}
            >
              {t === "lista" ? "Mis presupuestos" : "Catálogo de servicios"}
            </button>
          ))}
        </div>

        {tab === "lista" && (
          <>
            {presupuestos.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard label="Total" valor={String(stats.total)} />
                <StatCard label="Enviados" valor={String(stats.enviados)} tono="blue" />
                <StatCard label="Aceptados" valor={String(stats.aceptados)} tono="emerald" />
                <StatCard
                  label="Mensual aceptado"
                  valor={fmtMoneda(stats.mensualAceptado)}
                  tono="violet"
                />
              </div>
            )}

            {ordenados.length === 0 ? (
              <EmptyState onNuevo={abrirNuevo} />
            ) : (
              <div className="space-y-2">
                {ordenados.map((p) => (
                  <PresupuestoRow
                    key={p.id}
                    presupuesto={p}
                    onAbrir={() => setDetalleId(p.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "catalogo" && <CatalogoServicios />}
      </div>

      {wizardAbierto && (
        <PresupuestoWizard
          abierto={wizardAbierto}
          presupuestoExistente={editando}
          onClose={() => setWizardAbierto(false)}
          onSaved={() => {
            setWizardAbierto(false);
            notify({ titulo: "Presupuesto guardado" });
          }}
        />
      )}

      {detalle && (
        <DetallePresupuesto
          presupuesto={detalle}
          onClose={() => setDetalleId(null)}
          onEditar={() => abrirEditar(detalle)}
          onEliminar={() => eliminar(detalle)}
          onEstado={(e) => cambiarEstadoPresupuesto(detalle.id, e)}
          onConvertir={() => convertirEnCliente(detalle)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  valor,
  tono = "slate",
}: {
  label: string;
  valor: string;
  tono?: "slate" | "blue" | "emerald" | "violet";
}) {
  const colores: Record<string, string> = {
    slate: "text-slate-800 dark:text-white",
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    violet: "text-violet-600",
  };
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className={`text-xl font-black mt-1 ${colores[tono]}`}>{valor}</p>
    </div>
  );
}

function EstadoChip({ estado }: { estado: EstadoPresupuesto }) {
  const m = ESTADO_PRESUPUESTO_META[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${m.chip}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function PresupuestoRow({
  presupuesto: p,
  onAbrir,
}: {
  presupuesto: Presupuesto;
  onAbrir: () => void;
}) {
  return (
    <button
      onClick={onAbrir}
      className="w-full text-left bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-4 hover:border-violet-200 dark:hover:border-violet-500/30 hover:shadow-sm transition group"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-bold text-slate-400 tabular-nums">
            {p.folio}
          </span>
          <EstadoChip estado={p.estado} />
        </div>
        <p className="font-black text-slate-800 dark:text-white truncate">
          {p.cliente.razonSocial}
        </p>
        <p className="text-[11px] text-slate-400">{fmtFechaLarga(p.fecha)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-black text-violet-700 dark:text-violet-300 tabular-nums">
          {fmtMoneda(montoMensualPresupuesto(p))}
        </p>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
          / mes
        </p>
      </div>
      <svg
        className="text-slate-300 group-hover:text-violet-400 transition shrink-0"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

function EmptyState({ onNuevo }: { onNuevo: () => void }) {
  return (
    <div className="text-center py-16 px-6 bg-white dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
      <Fiscalino mood="confident" size={140} className="mx-auto" />
      <h3 className="text-xl font-black text-slate-800 dark:text-white mt-4">
        Aún no tienes presupuestos
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
        Crea tu primer presupuesto profesional en menos de un minuto. Fiscalino
        te ayuda a cerrar el trato.
      </p>
      <button
        onClick={onNuevo}
        className="mt-6 bg-violet-600 hover:bg-violet-700 text-white h-12 px-7 rounded-full font-black text-[11px] uppercase tracking-widest shadow-md shadow-violet-600/25 transition active:scale-95 inline-flex items-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Crear primer presupuesto
      </button>
    </div>
  );
}

function DetallePresupuesto({
  presupuesto: p,
  onClose,
  onEditar,
  onEliminar,
  onEstado,
  onConvertir,
}: {
  presupuesto: Presupuesto;
  onClose: () => void;
  onEditar: () => void;
  onEliminar: () => void;
  onEstado: (e: EstadoPresupuesto) => void;
  onConvertir: () => void;
}) {
  useScrollLock(true);
  const { asegurarTokenPresupuesto, prepararLigaPublica, actualizarPresupuesto } =
    useClientes();
  const notify = useNotify();
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [enviandoAviso, setEnviandoAviso] = useState(false);

  const ligaDeToken = (token: string): string => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/p/${token}`;
  };

  const correoCliente = (p.cliente.email || "").trim();
  const correoValido = isValidEmail(correoCliente);
  const estadoAviso = etiquetaEstadoAvisoPrivacidad(p.avisoPrivacidad);

  const enviarAvisoPrivacidad = async () => {
    if (!correoValido || enviandoAviso) return;
    setEnviandoAviso(true);
    try {
      const res = await fetch("/api/admin/presupuestos/aviso-privacidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presupuestoId: p.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo enviar el aviso.");
      }
      if (data.avisoPrivacidad) {
        actualizarPresupuesto(p.id, { avisoPrivacidad: data.avisoPrivacidad });
      }
      void notify({
        titulo: "Aviso de privacidad enviado",
        mensaje: `Correo formal enviado a ${data.to}. El prospecto acepta en su liga privada.`,
        tono: "info",
      });
    } catch (e) {
      void notify({
        titulo: "No se pudo enviar el aviso",
        mensaje:
          e instanceof Error ? e.message : "Intenta de nuevo en un momento.",
        tono: "danger",
      });
    } finally {
      setEnviandoAviso(false);
    }
  };

  const enviarPorCorreo = async () => {
    if (!correoValido || enviandoCorreo) return;
    setEnviandoCorreo(true);
    try {
      const token = await prepararLigaPublica(p.id);
      const liga = ligaDeToken(token);
      const { asunto, html, texto } = plantillaPresupuesto({
        nombreCliente: p.cliente.razonSocial || "Hola",
        montoMensual: fmtMoneda(montoMensualPresupuesto(p)),
        urlPresupuesto: liga,
        folio: p.folio,
        vigenciaTexto: fmtFechaLarga(fechaVencimiento(p)),
        nombreDespacho: DESPACHO_NOMBRE,
        correoSoporte: DESPACHO_EMAIL,
        sitioWeb: DESPACHO_SITIO,
      });
      const res = await fetch("/api/admin/correo/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: correoCliente,
          subject: asunto,
          html,
          text: texto,
          replyTo: DESPACHO_EMAIL,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "No se pudo enviar el correo.");
      }
      notify({
        titulo: "Correo enviado",
        mensaje: `La propuesta llegó a ${correoCliente}`,
      });
    } catch (e) {
      notify({
        titulo: "No se pudo enviar",
        mensaje:
          e instanceof Error ? e.message : "Intenta de nuevo en un momento.",
        tono: "danger",
      });
    } finally {
      setEnviandoCorreo(false);
    }
  };

  const copiarLiga = async () => {
    // Token sincrónico para escribir al portapapeles dentro del gesto del clic.
    const token = asegurarTokenPresupuesto(p.id);
    const liga = ligaDeToken(token);
    try {
      await navigator.clipboard.writeText(liga);
    } catch {
      // Algunos navegadores bloquean el portapapeles; igual mostramos la liga.
    }
    notify({ titulo: "Preparando liga…", mensaje: "Guardando en la nube" });
    // Persiste token + marca enviado en la nube antes de que el cliente la abra.
    await prepararLigaPublica(p.id);
    notify({ titulo: "Liga copiada y lista", mensaje: liga });
  };

  const enviarWhatsApp = async () => {
    // Abrimos la pestaña primero (dentro del gesto) para no ser bloqueados.
    const ventana = window.open("about:blank", "_blank", "noopener");
    const token = await prepararLigaPublica(p.id);
    const liga = ligaDeToken(token);
    const texto = encodeURIComponent(
      `Hola ${p.cliente.razonSocial}, te comparto tu propuesta de ${DATOS_PRESUPUESTO.despacho}. Puedes revisarla y aceptarla aquí: ${liga}`
    );
    const tel = (p.cliente.telefono || "").replace(/\D/g, "");
    const base = tel
      ? `https://wa.me/${tel.length === 10 ? `52${tel}` : tel}`
      : "https://wa.me/";
    const url = `${base}?text=${texto}`;
    if (ventana) ventana.location.href = url;
    else window.open(url, "_blank", "noopener");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center sm:p-6 no-print">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-3xl bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] overflow-hidden border border-slate-100 dark:border-white/10">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <EstadoChip estado={p.estado} />
            <span className="text-sm font-bold text-slate-500 truncate">
              {p.folio}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-500 transition"
            aria-label="Cerrar"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Estado switcher */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">
            Estado:
          </span>
          {ESTADOS.map((e) => {
            const activo = p.estado === e;
            const m = ESTADO_PRESUPUESTO_META[e];
            return (
              <button
                key={e}
                onClick={() => onEstado(e)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                  activo
                    ? m.chip + " ring-2 ring-offset-1 ring-violet-300 dark:ring-offset-slate-900"
                    : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Compartir liga pública */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">
            Compartir:
          </span>
          <button
            onClick={copiarLiga}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-200 text-[11px] font-bold hover:border-violet-300 transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
            Copiar liga
          </button>
          <button
            onClick={enviarWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition active:scale-95"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.82 2.42a8.19 8.19 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.24-.01-.37.11-.49.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.34-.77-1.83-.2-.48-.4-.42-.56-.42z" /></svg>
            WhatsApp
          </button>
          <button
            onClick={enviarPorCorreo}
            disabled={!correoValido || enviandoCorreo}
            title={
              correoValido
                ? `Enviar a ${correoCliente}`
                : "Este cliente no tiene correo válido"
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
            {enviandoCorreo ? "Enviando…" : "Enviar por correo"}
          </button>
          <button
            type="button"
            onClick={() => void enviarAvisoPrivacidad()}
            disabled={!correoValido || enviandoAviso}
            title={
              correoValido
                ? "Enviar aviso de privacidad formal (liga privada)"
                : "Agrega un correo al prospecto"
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:border-marca-navy/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviandoAviso ? "Enviando aviso…" : "Aviso de privacidad"}
          </button>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ring-1 ${
              estadoAviso.tono === "ok"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : estadoAviso.tono === "pendiente"
                  ? "bg-amber-50 text-amber-800 ring-amber-200"
                  : "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/15"
            }`}
          >
            Privacidad: {estadoAviso.label}
          </span>
        </div>
        {!correoValido && (
          <p className="px-6 -mt-1 pb-2 text-[10px] font-semibold text-amber-600">
            Agrega un correo válido al prospecto para enviar la propuesta o el aviso de privacidad.
          </p>
        )}

        {/* Respuesta del prospecto (rechazo con objeción) */}
        {p.estado === "rechazado" && p.objecionMotivo && (
          <div className="px-6 py-3 bg-rose-50 dark:bg-rose-500/10 border-b border-rose-100 dark:border-rose-500/20">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-0.5">
              Motivo del rechazo
            </p>
            <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
              {OBJECION_META[p.objecionMotivo].emoji}{" "}
              {OBJECION_META[p.objecionMotivo].label}
            </p>
            {p.objecionComentario && (
              <p className="text-[13px] text-rose-600/80 dark:text-rose-300/70 mt-1 italic">
                “{p.objecionComentario}”
              </p>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-black/30 px-4 py-6 sm:px-6">
          <PresupuestoDocumento presupuesto={p} />
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900">
          <button
            onClick={onEliminar}
            className="text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition inline-flex items-center gap-1.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            Eliminar
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => descargarPresupuestoPDF(p.folio)}
              className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-200 text-[11px] font-bold uppercase tracking-widest hover:border-violet-300 transition"
            >
              Descargar PDF
            </button>
            <button
              onClick={onEditar}
              className="px-4 py-2.5 rounded-full border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-200 text-[11px] font-bold uppercase tracking-widest hover:border-violet-300 transition"
            >
              Editar
            </button>
            {p.estado === "aceptado" && (
              <button
                onClick={onConvertir}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest transition active:scale-95"
              >
                Convertir en cliente →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogoServicios() {
  const {
    catalogoServicios,
    agregarServicioCatalogo,
    editarServicioCatalogo,
    eliminarServicioCatalogo,
    preciosRegimen,
    setPrecioRegimen,
  } = useClientes();
  const confirm = useConfirm();

  const catalogo = catalogoEfectivo(catalogoServicios);

  const inputCls =
    "w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-violet-400 transition";

  return (
    <div className="space-y-6">
      {/* Precios por régimen */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          Precios por régimen
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Honorario mensual base (sin IVA) por categoría. Lo eliges al crear un
          presupuesto y se llena solo.
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {REGIMENES_PRESUPUESTO.map((r) => (
            <div
              key={r.clave}
              className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-3.5 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-violet-500">
                  {r.grupo}
                </p>
                <p className="font-bold text-slate-800 dark:text-white text-sm leading-tight">
                  {r.nombre}
                </p>
              </div>
              <div className="w-28 shrink-0 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  className={`${inputCls} pl-6 text-right font-bold`}
                  value={precioDeRegimen(preciosRegimen, r.clave) || ""}
                  onChange={(e) =>
                    setPrecioRegimen(r.clave, Number(e.target.value) || 0)
                  }
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-white/10" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Servicios reutilizables que puedes agregar a cualquier presupuesto.
        </p>
        <button
          onClick={() =>
            agregarServicioCatalogo({
              servicio: "Nuevo servicio",
              descripcion: "",
              precioSugerido: 0,
              activo: true,
            })
          }
          className="px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-widest transition active:scale-95"
        >
          + Servicio
        </button>
      </div>

      <div className="space-y-2">
        {catalogo.map((s) => (
          <div
            key={s.id}
            className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-3.5"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  className={inputCls}
                  value={s.servicio}
                  onChange={(e) =>
                    editarServicioCatalogo(s.id, { servicio: e.target.value })
                  }
                />
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  value={s.descripcion}
                  onChange={(e) =>
                    editarServicioCatalogo(s.id, { descripcion: e.target.value })
                  }
                  placeholder="Descripción"
                />
              </div>
              <div className="w-28 shrink-0 space-y-2">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={s.precioSugerido}
                  onChange={(e) =>
                    editarServicioCatalogo(s.id, {
                      precioSugerido: Number(e.target.value) || 0,
                    })
                  }
                />
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={s.activo}
                    onChange={(e) =>
                      editarServicioCatalogo(s.id, { activo: e.target.checked })
                    }
                  />
                  Activo
                </label>
                <button
                  onClick={async () => {
                    const ok = await confirm({
                      titulo: "Eliminar servicio",
                      mensaje: `¿Eliminar "${s.servicio}" del catálogo?`,
                      textoConfirmar: "Eliminar",
                      tono: "danger",
                    });
                    if (ok) eliminarServicioCatalogo(s.id);
                  }}
                  className="w-full text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
