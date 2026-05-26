"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Cliente } from "@/lib/clientes";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import CuentaRegresivaEfirma from "@/components/admin/CuentaRegresivaEfirma";
import { opinionUi } from "@/lib/sat/opinion-ui";
import { etiquetaDiasRestantes } from "@/lib/efirma/vigencia";
import type { OpinionPublicaEstado } from "@/lib/sat/types";
import { portalPage, portalCard, portalCardTitle, fmtMxn } from "@/components/portal/portal-ui";

type Props = { cliente: Cliente };

type ResumenSat = {
  rfc: string;
  razonSocial: string;
  regimen: { clave: string; nombre: string; descripcion: string } | null;
  satPortal: {
    opinionAutorizadaEnSat?: boolean;
    opinionPublica?: {
      estado: OpinionPublicaEstado;
      mensaje?: string;
      ultimaConsulta?: string;
    };
  } | null;
  documentos: {
    constancia: { nombreArchivo: string; subidoEn: string } | null;
    opinion: { nombreArchivo: string; subidoEn: string } | null;
  };
  saldoFavor: {
    isr: number;
    iva: number;
    total: number;
    capturadoEn?: string;
  } | null;
  efirma: {
    tieneEfirma: boolean;
    titular?: string;
    vigenciaFinLabel?: string;
    diasRestantes?: number;
    enVentanaAlerta?: boolean;
    estado?: string;
  };
};

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PortalSatView({ cliente }: Props) {
  const [resumen, setResumen] = useState<ResumenSat | null>(null);
  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [consultandoOpinion, setConsultandoOpinion] = useState(false);
  const [opinion, setOpinion] = useState<{
    estado: OpinionPublicaEstado;
    mensaje?: string;
    ultimaConsulta?: string;
  } | null>(null);

  const cargarResumen = useCallback(async () => {
    setCargandoResumen(true);
    try {
      const res = await fetch("/api/portal/sat/resumen");
      const data = await res.json();
      if (res.ok) {
        setResumen(data);
        setOpinion(data.satPortal?.opinionPublica);
      }
    } finally {
      setCargandoResumen(false);
    }
  }, []);

  const consultarOpinion = useCallback(async (force = false) => {
    setConsultandoOpinion(true);
    try {
      const url = force
        ? "/api/portal/opinion-cumplimiento?force=1"
        : "/api/portal/opinion-cumplimiento";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.opinion) {
        setOpinion(data.opinion);
      }
    } finally {
      setConsultandoOpinion(false);
    }
  }, []);

  useEffect(() => {
    void cargarResumen();
    void consultarOpinion(false);
  }, [cargarResumen, consultarOpinion]);

  const ui = opinionUi(opinion?.estado);
  const efirma = resumen?.efirma;

  return (
    <div className={portalPage}>
      <PortalPageHeader
        eyebrow="SAT"
        title="Situación fiscal"
        subtitle={
          <span>
            RFC <strong className="text-blue-600 font-mono">{cliente.rfc}</strong>
            {resumen?.regimen && (
              <>
                {" "}
                · {resumen.regimen.nombre}
              </>
            )}
          </span>
        }
      />

      <PortalSection title="Opinión de cumplimiento (32-D)">
        <div className={`${portalCard} space-y-4`}>
          <div className="flex items-start gap-4">
            <div className={`w-4 h-4 rounded-full mt-1 shrink-0 ${ui.dot}`} />
            <div className="flex-1 min-w-0">
              <p className={portalCardTitle}>Estatus ante el SAT</p>
              {consultandoOpinion ? (
                <p className="text-sm font-bold text-slate-600 mt-2">
                  Consultando servicio público del SAT…
                </p>
              ) : (
                <>
                  <p className="text-xl font-black text-slate-800 mt-1">{ui.etiqueta}</p>
                  <p className="text-sm font-bold text-slate-600 mt-1 leading-snug">
                    {opinion?.mensaje ?? ui.detalle}
                  </p>
                  {opinion?.ultimaConsulta && (
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                      Última consulta: {fmtFecha(opinion.ultimaConsulta)}
                    </p>
                  )}
                </>
              )}
            </div>
            <button
              type="button"
              disabled={consultandoOpinion}
              onClick={() => void consultarOpinion(true)}
              className="shrink-0 px-3 py-2 rounded-xl bg-blue-900 text-white text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              Actualizar
            </button>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-[11px] font-bold text-blue-900 leading-relaxed">
            Para la verificación automática, autorice en{" "}
            <a
              href="https://www.sat.gob.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              sat.gob.mx
            </a>{" "}
            que su opinión de cumplimiento sea consultable de forma pública (trámite
            32-D). Sin ese paso, el SAT no devolverá el estatus en línea; su despacho
            puede subir el PDF manualmente.
          </div>
        </div>
      </PortalSection>

      <PortalSection title="Documentos">
        <div className={`${portalCard} grid gap-3 sm:grid-cols-2`}>
          <DocumentoFila
            titulo="Constancia de situación fiscal"
            meta={resumen?.documentos.constancia}
            href="/api/portal/sat/documento?tipo=constancia"
            cargando={cargandoResumen}
          />
          <DocumentoFila
            titulo="Opinión de cumplimiento (PDF)"
            meta={resumen?.documentos.opinion}
            href="/api/portal/sat/documento?tipo=opinion"
            cargando={cargandoResumen}
          />
        </div>
      </PortalSection>

      <PortalSection title="e.firma (FIEL)">
        <div className={portalCard}>
          {!efirma?.tieneEfirma ? (
            <p className="text-sm font-bold text-slate-500">
              Su despacho aún no ha registrado el certificado en el sistema. Coordine
              con su contador si necesita renovación o carga de archivos.
            </p>
          ) : (
            <div className="flex items-center gap-4">
              {efirma.enVentanaAlerta && efirma.diasRestantes != null && (
                <CuentaRegresivaEfirma
                  diasRestantes={efirma.diasRestantes}
                  tamano="lg"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-800">
                  {efirma.titular ?? "Certificado registrado"}
                </p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">
                  Vigencia hasta{" "}
                  <span className="text-slate-700">{efirma.vigenciaFinLabel}</span>
                </p>
                {efirma.diasRestantes != null && efirma.diasRestantes >= 0 && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mt-2">
                    {etiquetaDiasRestantes(efirma.diasRestantes)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </PortalSection>

      {resumen?.saldoFavor && (
        <PortalSection title="Saldo a favor">
          <div className={portalCard}>
            <p className="text-[11px] font-bold text-slate-500 mb-3">
              Periodo fiscal vigente · capturado por su contador
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className={portalCardTitle}>ISR</p>
                <p className="text-lg font-black text-emerald-700 mt-1">
                  {fmtMxn(resumen.saldoFavor.isr)}
                </p>
              </div>
              <div>
                <p className={portalCardTitle}>IVA</p>
                <p className="text-lg font-black text-emerald-700 mt-1">
                  {fmtMxn(resumen.saldoFavor.iva)}
                </p>
              </div>
              <div>
                <p className={portalCardTitle}>Total</p>
                <p className="text-lg font-black text-emerald-800 mt-1">
                  {fmtMxn(resumen.saldoFavor.total)}
                </p>
              </div>
            </div>
          </div>
        </PortalSection>
      )}

      <PortalSection title="CFDI emitidos y recibidos">
        <div className={`${portalCard} border-dashed border-slate-200 bg-slate-50/80`}>
          <p className="text-sm font-bold text-slate-600 leading-relaxed">
            Próximamente podrá ver un resumen de sus comprobantes fiscales digitales.
            Su despacho utiliza Contpaqi Contabiliza; la integración automática se
            habilitará en una fase posterior sin costo adicional para usted.
          </p>
          <Link
            href="/portal/cumplimiento"
            className="inline-block mt-3 text-[10px] font-black uppercase tracking-widest text-blue-700 hover:text-blue-900"
          >
            Ir a cumplimiento →
          </Link>
        </div>
      </PortalSection>
    </div>
  );
}

function DocumentoFila({
  titulo,
  meta,
  href,
  cargando,
}: {
  titulo: string;
  meta: { nombreArchivo: string; subidoEn: string } | null | undefined;
  href: string;
  cargando: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-4 flex flex-col gap-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        {titulo}
      </p>
      {cargando ? (
        <p className="text-sm font-bold text-slate-400">Cargando…</p>
      ) : meta ? (
        <>
          <p className="text-sm font-bold text-slate-800 truncate">{meta.nombreArchivo}</p>
          <p className="text-[10px] font-bold text-slate-400">
            Subido {fmtFecha(meta.subidoEn)}
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex text-[10px] font-black uppercase tracking-widest text-blue-700 hover:text-blue-900"
          >
            Ver PDF →
          </a>
        </>
      ) : (
        <p className="text-sm font-bold text-slate-400">
          Pendiente — su contador lo publicará pronto.
        </p>
      )}
    </div>
  );
}
