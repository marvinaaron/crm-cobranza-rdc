"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useClientes } from "@/context/ClientesContext";
import {
  type Cliente,
  periodoLabel,
} from "@/lib/clientes";
import {
  getCorreoIndividualCliente,
  copiarCorreoLibreHtml,
  type TipoCorreoCobranza,
} from "@/lib/correo";
import {
  getUltimaMarca,
  getUltimoEnvioResend,
  periodoKeyStr,
} from "@/lib/recordatorios";
import { listarFilasCobroManual } from "@/lib/cobro-manual";
import {
  calcularAgingCartera,
  calcularResumenAnual,
} from "@/lib/dashboard-metrics";
import { useNotify, useConfirm } from "@/components/ConfirmProvider";
import ToastExito from "@/components/ToastExito";
import PanelEscalamientosFiscales from "@/components/admin/PanelEscalamientosFiscales";
import AdminPageHeading from "@/components/admin/AdminPageHeading";
import CobroManualLista from "@/components/admin/CobroManualLista";
import PillDeslizable from "@/components/ui/PillDeslizable";
import {
  listarEscalamientosFiscalesAdmin,
  tarjetasFiscalesDesdeLineas,
} from "@/lib/admin/escalamientos-fiscales";

type Tab = "contactar" | "fiscales" | "scripts";

function tabDesdeParam(v: string | null): Tab {
  if (v === "fiscales" || v === "scripts" || v === "contactar") return v;
  return "contactar";
}

export default function RecordatoriosPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-400">Cargando…</p>}>
      <RecordatoriosPageInner />
    </Suspense>
  );
}

function RecordatoriosPageInner() {
  const searchParams = useSearchParams();

  const {
    listaClientes,
    periodo,
    periodoHoy,
    cumplimiento,
    recordatorioLog,
    marcarRecordatorio,
    quitarMarcaRecordatorioMes,
    scriptsCorreo,
    agregarScriptCorreo,
    editarScriptCorreo,
    eliminarScriptCorreo,
  } = useClientes();
  const notify = useNotify();
  const confirm = useConfirm();

  const [tab, setTab] = useState<Tab>(() => tabDesdeParam(searchParams.get("tab")));
  const [toast, setToast] = useState<string | null>(null);

  const hoy = useMemo(() => new Date(), []);
  const pk = periodoKeyStr(periodo);

  const filas = useMemo(() => {
    return listarFilasCobroManual(listaClientes, periodo, hoy).map((f) => {
      const correo = getCorreoIndividualCliente(f.cliente, periodo, hoy);
      const ultima = getUltimaMarca(recordatorioLog, f.cliente.id, pk);
      const enviadoEn = getUltimoEnvioResend(
        recordatorioLog,
        f.cliente.id,
        pk
      )?.contactadoEn;
      return { ...f, correo, ultima, enviadoEn };
    });
  }, [listaClientes, periodo, hoy, recordatorioLog, pk]);

  const mesesAnio = useMemo(
    () => calcularResumenAnual(listaClientes, periodo.anio, periodoHoy),
    [listaClientes, periodo.anio, periodoHoy]
  );
  const aging = useMemo(
    () => calcularAgingCartera(listaClientes, periodo),
    [listaClientes, periodo]
  );

  const lineasFiscales = useMemo(
    () =>
      listarEscalamientosFiscalesAdmin({
        clientes: listaClientes,
        cumplimiento,
        limite: 60,
      }),
    [listaClientes, cumplimiento]
  );

  const pendientesFiscalesHoy = useMemo(
    () =>
      tarjetasFiscalesDesdeLineas(lineasFiscales).filter(
        (t) => t.estado === "por_resolver"
      ).length,
    [lineasFiscales]
  );

  const dispararToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  const onContactado = (cliente: Cliente, tipo: TipoCorreoCobranza) => {
    return (via: "enviado" | "copiado" | "borrador") => {
      marcarRecordatorio(cliente.id, periodo, tipo, via);
    };
  };

  const marcarManual = (cliente: Cliente, tipo: TipoCorreoCobranza) => {
    marcarRecordatorio(cliente.id, periodo, tipo, "manual");
    dispararToast(`Marcado: ${cliente.razonSocial}`);
  };

  const desmarcar = (cliente: Cliente) => {
    quitarMarcaRecordatorioMes(cliente.id, pk);
    dispararToast(`Desmarcado: ${cliente.razonSocial}`);
  };

  return (
    <div className="relative w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <AdminPageHeading
          titulo="Cobro manual"
          subtitulo={`${periodoLabel(periodo)} · dashboard de cartera y cobro a mano`}
        />

        <PillDeslizable
          acento="claro"
          className="mb-6 max-w-xl"
          value={tab}
          onChange={setTab}
          opciones={[
            {
              value: "contactar",
              label:
                filas.length > 0 ? `Por cobrar · ${filas.length}` : "Por cobrar",
            },
            {
              value: "fiscales",
              label:
                pendientesFiscalesHoy > 0
                  ? `Fiscales · ${pendientesFiscalesHoy}`
                  : "Fiscales",
            },
            {
              value: "scripts",
              label:
                scriptsCorreo.length > 0
                  ? `Scripts · ${scriptsCorreo.length}`
                  : "Scripts",
            },
          ]}
        />

        {tab === "contactar" ? (
          <CobroManualLista
            filas={filas}
            periodo={periodo}
            mesesAnio={mesesAnio}
            aging={aging}
            notify={notify}
            onContactado={onContactado}
            marcarManual={marcarManual}
            desmarcar={desmarcar}
          />
        ) : tab === "fiscales" ? (
          <PanelEscalamientosFiscales lineas={lineasFiscales} />
        ) : (
          <ScriptsTab
            scripts={scriptsCorreo}
            agregar={agregarScriptCorreo}
            editar={editarScriptCorreo}
            eliminar={eliminarScriptCorreo}
            confirm={confirm}
            dispararToast={dispararToast}
          />
        )}
      </div>

      <ToastExito visible={!!toast} mensaje={toast ?? ""} />
    </div>
  );
}

function ScriptsTab({
  scripts,
  agregar,
  editar,
  eliminar,
  confirm,
  dispararToast,
}: {
  scripts: ReturnType<typeof useClientes>["scriptsCorreo"];
  agregar: ReturnType<typeof useClientes>["agregarScriptCorreo"];
  editar: ReturnType<typeof useClientes>["editarScriptCorreo"];
  eliminar: ReturnType<typeof useClientes>["eliminarScriptCorreo"];
  confirm: ReturnType<typeof useConfirm>;
  dispararToast: (m: string) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const guardar = () => {
    if (!titulo.trim() || !cuerpo.trim()) return;
    if (editId) {
      editar(editId, titulo, cuerpo);
      dispararToast("Script actualizado");
    } else {
      agregar(titulo, cuerpo);
      dispararToast("Script guardado");
    }
    setTitulo("");
    setCuerpo("");
    setEditId(null);
  };

  const empezarEdicion = (id: string, t: string, c: string) => {
    setEditId(id);
    setTitulo(t);
    setCuerpo(c);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copiar = async (texto: string) => {
    try {
      await copiarCorreoLibreHtml(texto);
      dispararToast("Copiado con formato");
    } catch {
      dispararToast("No se pudo copiar");
    }
  };

  const borrar = async (id: string, t: string) => {
    const ok = await confirm({
      titulo: "Eliminar script",
      mensaje: `Vas a eliminar "${t}". Esta acción no se puede deshacer.`,
      textoConfirmar: "Eliminar",
      tono: "danger",
    });
    if (!ok) return;
    eliminar(id);
    if (editId === id) {
      setEditId(null);
      setTitulo("");
      setCuerpo("");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="rounded-[1.25rem] border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm p-5 h-fit">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 mb-3">
          {editId ? "Editar script" : "Nuevo script"}
        </p>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título (ej. Recordatorio amable)"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-white/5 outline-none text-sm font-bold focus:border-violet-400 focus:ring-2 focus:ring-violet-100 mb-3"
        />
        <textarea
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          placeholder="Escribe aquí el texto reutilizable que copiarás y pegarás en tus correos…"
          rows={8}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-white/5 outline-none text-sm font-medium leading-relaxed resize-y focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed">
          Al copiar, tu texto se envuelve en la plantilla de marca del despacho
          (encabezado y firma). Pégalo en Gmail o Apple Mail con Cmd/Ctrl + V y
          conserva el diseño.
        </p>
        <div className="flex gap-2 mt-3">
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setTitulo("");
                setCuerpo("");
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={guardar}
            disabled={!titulo.trim() || !cuerpo.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 disabled:opacity-50"
          >
            {editId ? "Guardar cambios" : "Guardar script"}
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {scripts.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <p className="text-[11px] font-bold text-slate-400">
              Aún no tienes scripts. Crea uno para reutilizarlo en tus correos.
            </p>
          </div>
        ) : (
          scripts.map((s) => (
            <div
              key={s.id}
              className="rounded-[1.25rem] border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-black text-slate-800 dark:text-white">{s.titulo}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => copiar(s.cuerpo)}
                    title="Copia con el diseño de marca; pégalo en Gmail o Apple Mail"
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700"
                  >
                    Copiar con formato
                  </button>
                  <button
                    type="button"
                    onClick={() => empezarEdicion(s.id, s.titulo, s.cuerpo)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[8px] font-black uppercase tracking-widest hover:bg-slate-200"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => borrar(s.id, s.titulo)}
                    aria-label="Eliminar script"
                    className="grid place-items-center h-7 w-7 rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100 hover:bg-red-100"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-300 mt-2 whitespace-pre-wrap leading-relaxed line-clamp-6">
                {s.cuerpo}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
