"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useClientes } from "@/context/ClientesContext";
import { AlcanceCfdiProvider } from "@/context/AlcanceCfdiContext";
import VisorFiscalView from "@/components/portal/hacienda/VisorFiscalView";
import TablaConsultaCfdi from "@/components/portal/hacienda/TablaConsultaCfdi";
import CfdiIngestaPanel from "@/components/admin/CfdiIngestaPanel";
import CfdiSyncInfoPanel from "@/components/admin/CfdiSyncInfoPanel";
import CfdiAdminSubNav, {
  parseCfdiAdminTab,
  type CfdiAdminTab,
} from "@/components/admin/CfdiAdminSubNav";

function buildCfdiUrl(clienteId: number | null, tab: CfdiAdminTab): string {
  const params = new URLSearchParams();
  if (clienteId != null) params.set("cliente", String(clienteId));
  if (tab !== "visor") params.set("tab", tab);
  const qs = params.toString();
  return qs ? `/cfdi?${qs}` : "/cfdi";
}

export default function AdminCfdiPage() {
  const { listaClientes } = useClientes();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recargarSeñal, setRecargarSeñal] = useState(0);

  const tab = parseCfdiAdminTab(searchParams.get("tab"));

  const clientesActivos = useMemo(
    () =>
      [...listaClientes]
        .filter((c) => c.activo)
        .sort((a, b) => a.razonSocial.localeCompare(b.razonSocial, "es")),
    [listaClientes]
  );

  const clienteIdParam = searchParams.get("cliente");
  const clienteId = clienteIdParam ? Number.parseInt(clienteIdParam, 10) : null;
  const clienteSeleccionado =
    clienteId != null && Number.isFinite(clienteId)
      ? clientesActivos.find((c) => c.id === clienteId) ?? null
      : null;

  useEffect(() => {
    if (clienteIdParam && !clienteSeleccionado && clientesActivos.length > 0) {
      router.replace(buildCfdiUrl(null, tab));
    }
  }, [clienteIdParam, clienteSeleccionado, clientesActivos.length, router, tab]);

  const onClienteChange = useCallback(
    (id: string) => {
      const nextId = id ? Number.parseInt(id, 10) : null;
      router.replace(buildCfdiUrl(nextId, tab));
    },
    [router, tab]
  );

  const onTabChange = useCallback(
    (nextTab: CfdiAdminTab) => {
      router.replace(buildCfdiUrl(clienteSeleccionado?.id ?? null, nextTab));
    },
    [router, clienteSeleccionado?.id]
  );

  const onIngestaOk = useCallback(() => {
    setRecargarSeñal((n) => n + 1);
  }, []);

  return (
    <AlcanceCfdiProvider>
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-violet-600 uppercase tracking-[0.25em] mb-1">
            Hacienda · SAT
          </p>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-800 uppercase tracking-tight">
            CFDI
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Visor, consultas y carga manual por carpetas (XML + metadata de cancelados).
          </p>
        </div>
        <label className="flex flex-col gap-1.5 shrink-0 w-full sm:w-72">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Cliente
          </span>
          <select
            value={clienteSeleccionado?.id ?? ""}
            onChange={(e) => onClienteChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-violet-200"
          >
            <option value="">— Seleccionar —</option>
            {clientesActivos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.razonSocial}
              </option>
            ))}
          </select>
        </label>
      </div>

      <CfdiAdminSubNav
        tab={tab}
        onTabChange={onTabChange}
        disabled={!clienteSeleccionado}
      />

      {tab === "carga" && clienteSeleccionado ? <CfdiSyncInfoPanel /> : null}

      {!clienteSeleccionado ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
          <p className="text-sm font-bold text-slate-600">
            Elige un cliente para ver visor, clientes, proveedores o cargar XML.
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            Enlace directo:{" "}
            <code className="text-[10px] bg-white px-1 rounded">
              /cfdi?cliente=ID&amp;tab=carga
            </code>
          </p>
        </div>
      ) : (
        <div className="min-w-0 w-full">
          {tab === "visor" && (
            <VisorFiscalView
              modo="admin"
              clienteId={clienteSeleccionado.id}
              clienteLabel={clienteSeleccionado.razonSocial}
              recargarSeñal={recargarSeñal}
            />
          )}
          {tab === "clientes" && (
            <TablaConsultaCfdi
              modo="admin"
              vista="clientes"
              titulo="Clientes"
              subtitulo="CFDI emitidos a sus clientes"
              clienteId={clienteSeleccionado.id}
              clienteLabel={clienteSeleccionado.razonSocial}
              recargarSeñal={recargarSeñal}
            />
          )}
          {tab === "proveedores" && (
            <TablaConsultaCfdi
              modo="admin"
              vista="proveedores"
              titulo="Proveedores"
              subtitulo="CFDI recibidos de proveedores"
              clienteId={clienteSeleccionado.id}
              clienteLabel={clienteSeleccionado.razonSocial}
              recargarSeñal={recargarSeñal}
            />
          )}
          {tab === "carga" && (
            <CfdiIngestaPanel
              variant="page"
              cliente={{
                id: clienteSeleccionado.id,
                rfc: clienteSeleccionado.rfc,
                razonSocial: clienteSeleccionado.razonSocial,
              }}
              onIngestaOk={onIngestaOk}
            />
          )}
        </div>
      )}
    </div>
    </AlcanceCfdiProvider>
  );
}
