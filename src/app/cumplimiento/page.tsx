"use client";

import { useMemo, useState } from "react";
import { useClientes } from "@/context/ClientesContext";
import {
  type Cliente,
  type Periodo,
  periodoLabel,
  clienteActivoEnPeriodo,
  esIngresoGeneralCliente,
} from "@/lib/clientes";
import {
  type TipoDocumentoSingular,
  DOCUMENTO_CUMPLIMIENTO_LABELS,
  estadoCumplimientoCliente,
  puedeNotificarCumplimiento,
  formatMontoImpuesto,
  formatFechaLimiteImpuesto,
  contarArchivosNomina,
  impuestosConMetadata,
} from "@/lib/cumplimiento";
import {
  abrirCorreoCumplimientoListo,
  copiarCorreoCumplimientoHtml,
  getPortalCumplimientoUrl,
} from "@/lib/correo-cumplimiento";
import { isValidEmail } from "@/lib/email";
import ModalSubirCumplimiento from "@/components/ModalSubirCumplimiento";
import ModalSubirNomina from "@/components/ModalSubirNomina";

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
);

type ModalDoc = {
  cliente: Cliente;
  periodo: Periodo;
  tipo: TipoDocumentoSingular;
};

type ModalNomina = {
  cliente: Cliente;
  periodo: Periodo;
  modo: "nomina";
};

const ESTADO_CHIP: Record<
  ReturnType<typeof estadoCumplimientoCliente>,
  { label: string; clase: string }
> = {
  pendiente: { label: "Sin impuestos", clase: "bg-slate-100 text-slate-500" },
  parcial: { label: "Impuestos incompletos", clase: "bg-amber-100 text-amber-700" },
  listo: { label: "Listo", clase: "bg-emerald-100 text-emerald-700" },
  notificado: { label: "Notificado", clase: "bg-indigo-100 text-indigo-700" },
};

function chipDocumento(cargado: boolean) {
  return cargado
    ? "bg-indigo-600 text-white hover:bg-indigo-700"
    : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100";
}

const COLUMNAS_DOC: TipoDocumentoSingular[] = ["declaracion", "impuestos", "imss"];

export default function CumplimientoPage() {
  const { listaClientes, periodo, getCumplimientoPeriodo, marcarCumplimientoNotificado } =
    useClientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalDoc, setModalDoc] = useState<ModalDoc | null>(null);
  const [modalNomina, setModalNomina] = useState<ModalNomina | null>(null);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [htmlCopiado, setHtmlCopiado] = useState(false);

  const mesLabel = periodoLabel(periodo);

  const clientes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return listaClientes
      .filter((c) => c.activo && !esIngresoGeneralCliente(c))
      .filter((c) => clienteActivoEnPeriodo(c, periodo))
      .filter(
        (c) =>
          !q ||
          c.razonSocial.toLowerCase().includes(q) ||
          c.rfc.toLowerCase().includes(q)
      )
      .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial, "es"));
  }, [listaClientes, periodo, searchTerm]);

  const resumen = useMemo(() => {
    let listos = 0;
    let notificados = 0;
    clientes.forEach((c) => {
      const reg = getCumplimientoPeriodo(c.id, periodo);
      const est = estadoCumplimientoCliente(reg);
      if (est === "listo" || est === "notificado") listos++;
      if (est === "notificado") notificados++;
    });
    return { total: clientes.length, listos, notificados };
  }, [clientes, periodo, getCumplimientoPeriodo]);

  const abrirModalDoc = (
    e: React.MouseEvent,
    cliente: Cliente,
    tipo: TipoDocumentoSingular
  ) => {
    e.stopPropagation();
    setModalDoc({ cliente, periodo, tipo });
  };

  const abrirModalNomina = (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation();
    setModalNomina({ cliente, periodo, modo: "nomina" });
  };

  const enviarNotificacion = (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation();
    const reg = getCumplimientoPeriodo(cliente.id, periodo);
    if (!reg || !puedeNotificarCumplimiento(reg)) return;
    if (!cliente.email?.trim() || !isValidEmail(cliente.email)) {
      window.alert("Este cliente no tiene un correo válido en su expediente.");
      return;
    }
    const ok = abrirCorreoCumplimientoListo(cliente, periodo, reg);
    if (ok) marcarCumplimientoNotificado(cliente.id, periodo);
  };

  const copiarHtml = async (cliente: Cliente) => {
    const reg = getCumplimientoPeriodo(cliente.id, periodo);
    if (!reg || !puedeNotificarCumplimiento(reg)) return;
    await copiarCorreoCumplimientoHtml(cliente, periodo, reg);
    setHtmlCopiado(true);
    setTimeout(() => setHtmlCopiado(false), 2000);
  };

  return (
    <div className="space-y-8 -m-8 p-8 min-h-screen bg-[#F8FAFC]">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">
            Hacienda · SAT
          </p>
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tight">
            Cumplimiento
          </h1>
          <p className="text-slate-400 font-bold text-sm mt-2">
            {mesLabel} · Documentación fiscal por cliente
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="px-5 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Clientes</p>
            <p className="text-xl font-black text-slate-800">{resumen.total}</p>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <p className="text-[8px] font-black uppercase text-emerald-600 tracking-widest">Listos</p>
            <p className="text-xl font-black text-emerald-700">{resumen.listos}</p>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-indigo-50 border border-indigo-100">
            <p className="text-[8px] font-black uppercase text-indigo-600 tracking-widest">Notificados</p>
            <p className="text-xl font-black text-indigo-700">{resumen.notificados}</p>
          </div>
        </div>
      </header>

      <div className="relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
          <SearchIcon />
        </span>
        <input
          type="search"
          placeholder="Buscar por razón social o RFC…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 bg-white text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Cliente
                </th>
                <th className="px-3 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Estatus
                </th>
                {COLUMNAS_DOC.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center"
                  >
                    {DOCUMENTO_CUMPLIMIENTO_LABELS[col]}
                  </th>
                ))}
                <th className="px-3 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center border-l border-slate-100">
                  Nómina
                </th>
                <th className="px-4 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 border-l border-slate-100">
                  Monto / límite
                </th>
                <th className="px-4 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Notificar
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.length > 0 ? (
                clientes.map((cli) => {
                  const reg = getCumplimientoPeriodo(cli.id, periodo);
                  const est = estadoCumplimientoCliente(reg);
                  const chip = ESTADO_CHIP[est];
                  const puedeMail = puedeNotificarCumplimiento(reg);
                  const emailOk = !!cli.email?.trim() && isValidEmail(cli.email);
                  const nNomina = contarArchivosNomina(reg);

                  return (
                    <tr
                      key={cli.id}
                      onClick={() => setSelectedClient(cli)}
                      className="group border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-6">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                          {cli.razonSocial}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{cli.rfc}</p>
                      </td>
                      <td className="px-3 py-6 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${chip.clase}`}
                        >
                          {chip.label}
                        </span>
                      </td>
                      {COLUMNAS_DOC.map((tipo) => (
                        <td key={tipo} className="px-3 py-6 text-center">
                          <button
                            type="button"
                            onClick={(e) => abrirModalDoc(e, cli, tipo)}
                            title={
                              tipo === "declaracion" || tipo === "imss"
                                ? "Solo informativo · sin monto ni fecha"
                                : undefined
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${chipDocumento(!!reg?.[tipo])}`}
                          >
                            <PdfIcon />
                            {reg?.[tipo] ? "PDF" : "Subir"}
                          </button>
                        </td>
                      ))}
                      <td className="px-3 py-6 text-center border-l border-slate-50">
                        <button
                          type="button"
                          onClick={(e) => abrirModalNomina(e, cli)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${chipDocumento(nNomina > 0)}`}
                        >
                          <PdfIcon />
                          {nNomina > 0 ? `${nNomina} arch.` : "Subir"}
                        </button>
                      </td>
                      <td className="px-4 py-6 min-w-[140px] border-l border-slate-50">
                        {reg && impuestosConMetadata(reg) ? (
                          <div>
                            <p className="text-sm font-black text-slate-800 tabular-nums">
                              {formatMontoImpuesto(reg.montoImpuesto)}
                            </p>
                            <p className="text-xs font-bold text-amber-600 mt-1 leading-snug">
                              {formatFechaLimiteImpuesto(reg.fechaLimite)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-6">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            disabled={!puedeMail || !emailOk}
                            onClick={(e) => enviarNotificacion(e, cli)}
                            title={
                              !puedeMail
                                ? "Suba impuestos con monto y fecha límite"
                                : !emailOk
                                  ? "Sin correo válido"
                                  : "Abrir borrador en Gmail"
                            }
                            className={`p-3 rounded-full transition-all ${
                              puedeMail && emailOk
                                ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                : "bg-slate-50 text-slate-300 cursor-not-allowed"
                            }`}
                          >
                            <MailIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-10 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px]"
                  >
                    No hay clientes activos en {mesLabel}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClient && (
        <div className="fixed inset-0 z-[45] flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setSelectedClient(null)}
          />
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto p-8">
            <button
              type="button"
              onClick={() => setSelectedClient(null)}
              className="text-[9px] font-black uppercase text-slate-400 hover:text-red-500 mb-6"
            >
              Cerrar
            </button>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-1">
              {selectedClient.razonSocial}
            </h2>
            <p className="text-[10px] font-mono text-slate-400 mb-6">{selectedClient.rfc}</p>

            {selectedClient.email && (
              <p className="text-[11px] font-bold text-indigo-500 mb-4">{selectedClient.email}</p>
            )}

            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Documentos · {mesLabel}
            </p>
            <div className="flex flex-col gap-2 mb-6">
              {COLUMNAS_DOC.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={(e) => abrirModalDoc(e, selectedClient, tipo)}
                  className="w-full py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-indigo-50 hover:border-indigo-100"
                >
                  {getCumplimientoPeriodo(selectedClient.id, periodo)?.[tipo]
                    ? `Ver / actualizar ${DOCUMENTO_CUMPLIMIENTO_LABELS[tipo]}`
                    : `Subir ${DOCUMENTO_CUMPLIMIENTO_LABELS[tipo]}`}
                </button>
              ))}
              <button
                type="button"
                onClick={(e) => abrirModalNomina(e, selectedClient)}
                className="w-full py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-indigo-50 hover:border-indigo-100"
              >
                {contarArchivosNomina(getCumplimientoPeriodo(selectedClient.id, periodo)) > 0
                  ? "Ver / agregar archivos de nómina"
                  : "Subir nómina (PDF / XML)"}
              </button>
            </div>

            {(() => {
              const reg = getCumplimientoPeriodo(selectedClient.id, periodo);
              if (!reg || !impuestosConMetadata(reg)) return null;
              return (
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 mb-6">
                  <p className="text-[9px] font-black uppercase text-amber-800 mb-1">Pago impuestos</p>
                  <p className="text-lg font-black text-slate-800">
                    {formatMontoImpuesto(reg.montoImpuesto)}
                  </p>
                  <p className="text-xs font-bold text-amber-700 mt-1">
                    {formatFechaLimiteImpuesto(reg.fechaLimite)}
                  </p>
                </div>
              );
            })()}

            <a
              href={`/portal/login?cliente=${selectedClient.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 mb-4 rounded-xl bg-slate-100 text-center text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200"
            >
              Abrir portal del cliente
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  !puedeNotificarCumplimiento(
                    getCumplimientoPeriodo(selectedClient.id, periodo)
                  ) ||
                  !selectedClient.email ||
                  !isValidEmail(selectedClient.email)
                }
                onClick={(e) => enviarNotificacion(e, selectedClient)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40"
              >
                <MailIcon />
                Notificar por correo
              </button>
              <button
                type="button"
                onClick={() => copiarHtml(selectedClient)}
                disabled={
                  !puedeNotificarCumplimiento(
                    getCumplimientoPeriodo(selectedClient.id, periodo)
                  )
                }
                className="px-4 py-3 rounded-xl border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                {htmlCopiado ? "¡Copiado!" : "HTML"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {modalDoc && (
        <ModalSubirCumplimiento
          cliente={modalDoc.cliente}
          periodo={modalDoc.periodo}
          tipo={modalDoc.tipo}
          onClose={() => setModalDoc(null)}
        />
      )}

      {modalNomina && (
        <ModalSubirNomina
          cliente={modalNomina.cliente}
          periodo={modalNomina.periodo}
          onClose={() => setModalNomina(null)}
        />
      )}
    </div>
  );
}
