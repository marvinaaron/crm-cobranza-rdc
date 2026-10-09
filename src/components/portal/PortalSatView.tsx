"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Cliente } from "@/lib/clientes";
import PortalPageHeader from "@/components/portal/PortalPageHeader";
import PortalSection from "@/components/portal/PortalSection";
import Fiscalino from "@/components/Fiscalino";
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
    lineas: { etiqueta: string; monto: number }[];
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

const MESES_CORTOS = [
  "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
  "JUL", "AGO", "SEP", "OCT", "NOV", "DIC",
];

/** "10 JUN 2026, 1:45 P.M." en una sola línea. */
function fmtFechaCorta(iso: string) {
  const d = new Date(iso);
  const dia = d.getDate();
  const mes = MESES_CORTOS[d.getMonth()];
  const anio = d.getFullYear();
  const ampm = d.getHours() >= 12 ? "P.M." : "A.M.";
  let h = d.getHours() % 12;
  if (h === 0) h = 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dia} ${mes} ${anio}, ${h}:${min} ${ampm}`;
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

  // El SAT devuelve un mensaje genérico ("El RFC o CURP consultado no se
  // encuentra autorizado…") porque su servicio admite RFC o CURP. Como aquí
  // solo consultamos por RFC, mostramos un texto propio más claro.
  const detalleEstatus =
    opinion?.estado === "no_autorizada"
      ? "Tu RFC no está autorizado para consultarse de forma pública en el SAT."
      : opinion?.mensaje ?? ui.detalle;

  return (
    <div className={portalPage}>
      <PortalPageHeader
        eyebrow="SAT"
        title="Situación fiscal"
        subtitle={
          <span>
            RFC <strong className="text-[var(--portal-navy)] font-mono">{cliente.rfc}</strong>
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
          {/* Encabezado: etiqueta + botón Actualizar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-3 h-3 rounded-full shrink-0 ${ui.dot}`} />
              <p className={portalCardTitle}>Estatus ante el SAT</p>
            </div>
            <button
              type="button"
              disabled={consultandoOpinion}
              onClick={() => void consultarOpinion(true)}
              className="shrink-0 px-3 py-2 rounded-xl bg-[var(--portal-navy)] text-white text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              Actualizar
            </button>
          </div>

          {/* Estatus a todo el ancho de la tarjeta */}
          {consultandoOpinion ? (
            <p className="text-sm font-bold text-slate-600">
              Consultando servicio público del SAT…
            </p>
          ) : (
            <div>
              <p className="text-xl font-black text-slate-800">{ui.etiqueta}</p>
              <p className="text-sm font-bold text-slate-600 mt-1 leading-snug">
                {detalleEstatus}
              </p>
              {opinion?.ultimaConsulta && (
                <p className="text-[11px] font-bold text-slate-400 mt-2 whitespace-nowrap">
                  Última consulta: {fmtFechaCorta(opinion.ultimaConsulta)}
                </p>
              )}
            </div>
          )}

          {!consultandoOpinion && opinion?.estado === "no_autorizada" && (
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 flex flex-col items-center text-center gap-3">
              <Fiscalino mood="worried" size={56} className="shrink-0" />
              <p className="text-[12px] leading-relaxed text-slate-600 dark:text-white/60 max-w-sm">
                Esto no indica adeudos fiscales. Tu RFC tiene restricciones de
                privacidad en el SAT. Pídele a tu contador que la active para que
                puedas consultarla en cualquier momento.
              </p>
              <Link
                href="/portal/encargos?nueva=opinion-32d"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--portal-navy-border)] text-[var(--portal-navy)] text-[11px] font-bold hover:bg-[var(--portal-navy-soft)] dark:border-white/15 dark:text-[var(--portal-purple)] dark:hover:bg-white/5"
              >
                Solicitar a mi contador →
              </Link>
            </div>
          )}

          <div className="rounded-xl bg-[var(--portal-navy-soft)] border border-[var(--portal-navy-border)] px-4 py-3 text-[11px] font-bold text-[var(--portal-navy)] leading-relaxed">
            Para la verificación automática, autoriza en{" "}
            <a
              href="https://www.sat.gob.mx"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              sat.gob.mx
            </a>{" "}
            que tu opinión de cumplimiento sea consultable de forma pública (trámite
            32-D). Sin ese paso, el SAT no devolverá el estatus en línea; tu contador
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
              Tu contador aún no ha registrado el certificado en el sistema.
              Escríbele si necesitas renovación o carga de archivos.
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
              Periodo fiscal vigente · capturado por tu contador
            </p>
            <div
              className={`grid gap-3 text-center ${
                (resumen.saldoFavor.lineas.length ?? 0) > 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-3"
              }`}
            >
              {resumen.saldoFavor.lineas.map((l, i) => (
                <div key={`${l.etiqueta}-${i}`}>
                  <p className={portalCardTitle}>{l.etiqueta}</p>
                  <p className="text-lg font-black text-emerald-700 mt-1">
                    {fmtMxn(l.monto)}
                  </p>
                </div>
              ))}
              <div
                className={
                  resumen.saldoFavor.lineas.length > 2
                    ? "sm:col-span-2"
                    : ""
                }
              >
                <p className={portalCardTitle}>Total</p>
                <p className="text-lg font-black text-emerald-800 mt-1">
                  {fmtMxn(resumen.saldoFavor.total)}
                </p>
              </div>
            </div>
          </div>
        </PortalSection>
      )}

      <PortalSection title="Consulta de comprobantes">
        <div className={`${portalCard} py-5`}>
          <p className="text-sm font-bold text-slate-700 leading-relaxed">
            Tus CFDI emitidos y recibidos viven en la sección{" "}
            <strong className="text-[var(--portal-navy)]">Hacienda</strong> del menú
            (Clientes, Proveedores y Visor fiscal). Es solo consulta numérica por periodo.
          </p>
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
            className="mt-1 inline-flex text-[10px] font-black uppercase tracking-widest text-[var(--portal-navy)] hover:text-[var(--portal-navy-hover)]"
          >
            Ver PDF →
          </a>
        </>
      ) : (
        <p className="text-sm font-bold text-slate-400">
          Disponible en los próximos 3 días hábiles.
        </p>
      )}
    </div>
  );
}
