"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type LineaEscalamientoFiscal,
  tarjetasFiscalesDesdeLineas,
  type TarjetaFiscal,
} from "@/lib/admin/escalamientos-fiscales";

type Props = {
  lineas: LineaEscalamientoFiscal[];
  compact?: boolean;
  embebido?: boolean;
  titulo?: string;
  verTodosHref?: string;
};

type Filtro = "por_resolver" | "resuelto" | "todos";

function Tarjeta({ t }: { t: TarjetaFiscal }) {
  const resuelto = t.estado === "resuelto";
  return (
    <div className="rounded-[1.25rem] bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-[15px] font-semibold text-slate-900">
          {t.razonSocial}
        </p>
        <span
          className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            resuelto
              ? "bg-slate-50 text-slate-500"
              : "bg-slate-100 text-slate-800"
          }`}
        >
          {resuelto ? "Resuelto" : "Por resolver"}
        </span>
      </div>
      <dl className="mt-3 space-y-2">
        <div>
          <dt className="text-[11px] font-semibold text-slate-400">Qué pasa</dt>
          <dd className="text-[13px] text-slate-800 leading-snug">{t.quePasa}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold text-slate-400">Qué hacer</dt>
          <dd className="text-[13px] text-slate-800 leading-snug">{t.resolver}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold text-slate-400">Aviso</dt>
          <dd className="text-[13px] text-slate-500 leading-snug">
            {t.avisos.join(" · ")}
          </dd>
        </div>
      </dl>
      <Link
        href={t.href}
        className="mt-4 inline-flex h-8 items-center px-3 rounded-full bg-slate-900 text-white text-[12px] font-semibold hover:bg-slate-800"
      >
        Abrir ficha
      </Link>
    </div>
  );
}

export default function PanelEscalamientosFiscales({
  lineas,
  compact = false,
  titulo = "Fiscales",
  verTodosHref,
}: Props) {
  const [filtro, setFiltro] = useState<Filtro>("por_resolver");
  const tarjetas = useMemo(
    () => tarjetasFiscalesDesdeLineas(lineas),
    [lineas]
  );

  const porResolver = tarjetas.filter((t) => t.estado === "por_resolver");
  const resueltas = tarjetas.filter((t) => t.estado === "resuelto");

  const visibles = useMemo(() => {
    const base =
      filtro === "por_resolver"
        ? porResolver
        : filtro === "resuelto"
          ? resueltas
          : tarjetas;
    return compact ? base.slice(0, 6) : base;
  }, [filtro, porResolver, resueltas, tarjetas, compact]);

  const kpis = [
    {
      key: "por_resolver" as const,
      label: "Por resolver",
      value: String(porResolver.length),
      detalle: "Siguen abiertos",
    },
    {
      key: "resuelto" as const,
      label: "Resueltos",
      value: String(resueltas.length),
      detalle: "Ya quedaron",
    },
    {
      key: "todos" as const,
      label: "Todos",
      value: String(tarjetas.length),
      detalle: "Avisos del periodo",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <p className="text-[15px] font-semibold text-slate-800">{titulo}</p>
        <p className="mt-0.5 text-[13px] text-slate-400">
          Qué está abierto, cómo se cierra y si ya quedó.
        </p>
      </div>

      <div className="rounded-[1.25rem] bg-white overflow-hidden mb-4">
        <div className="grid grid-cols-3">
          {kpis.map((card, i) => {
            const activa = filtro === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setFiltro(card.key)}
                className={`min-w-0 px-3 py-4 sm:px-5 text-left transition-colors ${
                  i < 2 ? "border-r border-slate-100" : ""
                } ${activa ? "bg-slate-50" : "active:bg-slate-50/80"}`}
              >
                <p className="text-[11px] font-semibold text-slate-400 truncate">
                  {card.label}
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

      {visibles.length === 0 ? (
        <div className="rounded-[1.25rem] bg-white py-16 text-center">
          <p className="text-[15px] font-semibold text-slate-900">
            {filtro === "por_resolver"
              ? "Nada por resolver"
              : filtro === "resuelto"
                ? "Aún no hay resueltos"
                : "Sin avisos fiscales"}
          </p>
          <p className="mt-1 text-[13px] text-slate-400">
            {filtro === "por_resolver"
              ? "Los plazos abiertos aparecen aquí, con el siguiente paso."
              : "Cuando un SAT se cierra o se cobra, pasa a resueltos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibles.map((t) => (
            <Tarjeta key={t.clave} t={t} />
          ))}
        </div>
      )}

      {verTodosHref && compact ? (
        <div className="mt-3 text-right">
          <Link
            href={verTodosHref}
            className="text-[12px] font-semibold text-slate-500 hover:text-slate-800"
          >
            Ver todos
          </Link>
        </div>
      ) : null}
    </div>
  );
}
