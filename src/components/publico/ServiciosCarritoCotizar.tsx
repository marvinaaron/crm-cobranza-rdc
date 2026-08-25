"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import {
  CFDI_MAX,
  INGRESOS_MAX,
  PERFIL_VACIO,
  REGIMENES_COTIZABLES_PF,
  REGIMENES_COTIZABLES_PM,
  SERVICIOS_COTIZABLES,
  TIPOS_EMPRESA,
  copyIncentivoPaquete,
  formatearCfdi,
  formatearIngresos,
  hrefEmpezarConPaquete,
  mensajeWhatsAppPaquete,
  type PerfilCotizacion,
  type TipoEmpresaId,
} from "@/lib/servicios-cotizables";

type Props = {
  /** Variante embebida (menos aire) vs página dedicada. */
  compacto?: boolean;
};

/**
 * Armado compacto de cotización → /empezar o WhatsApp con el mismo paquete.
 */
export default function ServiciosCarritoCotizar({ compacto = true }: Props) {
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [perfil, setPerfil] = useState<PerfilCotizacion>(PERFIL_VACIO);

  const toggle = (id: string) => {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setTipo = (id: TipoEmpresaId) => {
    setPerfil((p) => ({
      ...p,
      tipo: p.tipo === id ? undefined : id,
      regimenes:
        id === "fisica"
          ? p.regimenes.filter((r) =>
              REGIMENES_COTIZABLES_PF.some((x) => x.id === r)
            )
          : id === "moral"
            ? p.regimenes.filter((r) =>
                REGIMENES_COTIZABLES_PM.some((x) => x.id === r)
              )
            : [],
    }));
  };

  const toggleRegimen = (id: string) => {
    setPerfil((p) => {
      const set = new Set(p.regimenes);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...p, regimenes: [...set] };
    });
  };

  const ids = useMemo(() => [...seleccion], [seleccion]);
  const incentivo = copyIncentivoPaquete(ids.length);
  const hrefEmpezar = hrefEmpezarConPaquete(ids, perfil);
  const listo =
    ids.length > 0 ||
    Boolean(perfil.tipo) ||
    perfil.regimenes.length > 0 ||
    perfil.ingresos > 0 ||
    perfil.ingresosMas300 ||
    perfil.cfdi > 1 ||
    perfil.cfdiMas50;

  const regimenesLista =
    perfil.tipo === "fisica"
      ? REGIMENES_COTIZABLES_PF
      : perfil.tipo === "moral"
        ? REGIMENES_COTIZABLES_PM
        : [];

  const primario = TIPOS_EMPRESA.find((t) => t.primario)!;
  const secundarios = TIPOS_EMPRESA.filter((t) => !t.primario);

  const waHref = CONTACTO_PUBLICO.whatsapp.buildUrl(
    listo
      ? mensajeWhatsAppPaquete({
          mensaje: "",
          ids,
          perfil,
        })
      : "Hola, vi su cotizador en rdcontadores.com y me gustaría platicar de mis servicios."
  );

  return (
    <section
      id="armar-cotizacion"
      className={`relative bg-gradient-to-b from-white via-violet-50/35 to-white overflow-hidden ${
        compacto ? "py-8 sm:py-10" : "py-14 sm:py-16"
      }`}
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-5 sm:mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-600">
            Cotizador
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Arma tu{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              cotización
            </span>
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Elige perfil y servicios. Luego deja tus datos o escríbenos por
            WhatsApp — sin pagar aquí.
          </p>
        </div>

        {/* Tipo — fila compacta */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1.5">
            ¿Qué tipo de empresa eres?
          </p>
          <div className="flex flex-col sm:flex-row gap-1.5">
            <button
              type="button"
              onClick={() => setTipo(primario.id)}
              aria-pressed={perfil.tipo === primario.id}
              className={`sm:flex-[1.35] text-left rounded-xl px-3 py-2.5 ring-1 transition-all ${
                perfil.tipo === primario.id
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white ring-indigo-500 shadow-md"
                  : "bg-indigo-50/80 text-slate-900 ring-indigo-200 hover:ring-indigo-400"
              }`}
            >
              <span
                className={`text-[9px] font-bold uppercase tracking-wider ${
                  perfil.tipo === primario.id
                    ? "text-indigo-100"
                    : "text-indigo-600"
                }`}
              >
                Si no eres experto
              </span>
              <span className="block text-sm font-black leading-tight mt-0.5">
                Soy nuevo · necesito orientación
              </span>
            </button>
            {secundarios.map((t) => {
              const on = perfil.tipo === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipo(t.id)}
                  aria-pressed={on}
                  className={`sm:flex-1 text-left rounded-xl px-3 py-2.5 ring-1 transition-all ${
                    on
                      ? "bg-indigo-50 ring-indigo-400"
                      : "bg-white ring-slate-200 hover:ring-indigo-200"
                  }`}
                >
                  <span className="block text-sm font-bold text-slate-900 leading-tight">
                    {t.label}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {t.hint}
                  </span>
                </button>
              );
            })}
          </div>

          {perfil.tipo === "nuevo" && (
            <p className="mt-2 text-[11px] text-indigo-700 bg-indigo-50/80 rounded-lg px-2.5 py-1.5">
              Te orientamos en la cotización — esta página también es para quien
              apenas empieza.
            </p>
          )}

          {regimenesLista.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1.5">
                Régimen{" "}
                <span className="normal-case tracking-normal font-medium text-slate-400">
                  (opcional, puedes marcar varios)
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {regimenesLista.map((r) => {
                  const on = perfil.regimenes.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRegimen(r.id)}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ring-1 transition-all ${
                        on
                          ? "bg-indigo-600 text-white ring-indigo-600"
                          : "bg-white text-slate-700 ring-slate-200 hover:ring-indigo-300"
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-[4px] flex items-center justify-center text-[9px] ${
                          on
                            ? "bg-white/20 text-white"
                            : "ring-1 ring-slate-300 text-transparent"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sliders compactos */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-white ring-1 ring-slate-200 px-3.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                Ingresos / mes
              </p>
              <p className="text-xs font-black tabular-nums text-slate-900">
                {formatearIngresos(perfil)}
              </p>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Para estrategia fiscal — opcional
            </p>
            <input
              type="range"
              min={0}
              max={INGRESOS_MAX}
              step={5_000}
              value={perfil.ingresosMas300 ? INGRESOS_MAX : perfil.ingresos}
              disabled={perfil.ingresosMas300}
              onChange={(e) =>
                setPerfil((p) => ({
                  ...p,
                  ingresosMas300: false,
                  ingresos: Number(e.target.value),
                }))
              }
              className="mt-2 w-full h-1.5 accent-indigo-600 disabled:opacity-40"
              aria-label="Ingresos mensuales aproximados"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 tabular-nums">$0</span>
              <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={perfil.ingresosMas300}
                  onChange={(e) =>
                    setPerfil((p) => ({
                      ...p,
                      ingresosMas300: e.target.checked,
                      ingresos: e.target.checked ? INGRESOS_MAX : p.ingresos,
                    }))
                  }
                  className="h-3 w-3 rounded border-slate-300 text-indigo-600"
                />
                +$300K
              </label>
              <span className="text-[9px] text-slate-400 tabular-nums">
                $300k
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white ring-1 ring-slate-200 px-3.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                CFDI / mes
              </p>
              <p className="text-xs font-black tabular-nums text-slate-900">
                {formatearCfdi(perfil)}
              </p>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Volumen de trabajo contable — opcional
            </p>
            <input
              type="range"
              min={1}
              max={CFDI_MAX}
              step={1}
              value={perfil.cfdiMas50 ? CFDI_MAX : perfil.cfdi}
              disabled={perfil.cfdiMas50}
              onChange={(e) =>
                setPerfil((p) => ({
                  ...p,
                  cfdiMas50: false,
                  cfdi: Number(e.target.value),
                }))
              }
              className="mt-2 w-full h-1.5 accent-indigo-600 disabled:opacity-40"
              aria-label="Volumen de CFDI emitidos al mes"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 tabular-nums">1</span>
              <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={perfil.cfdiMas50}
                  onChange={(e) =>
                    setPerfil((p) => ({
                      ...p,
                      cfdiMas50: e.target.checked,
                      cfdi: e.target.checked ? CFDI_MAX : p.cfdi,
                    }))
                  }
                  className="h-3 w-3 rounded border-slate-300 text-indigo-600"
                />
                +50
              </label>
              <span className="text-[9px] text-slate-400 tabular-nums">50</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(220px,280px)] gap-4 items-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1.5">
              Servicios que necesitas
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {SERVICIOS_COTIZABLES.map((s) => {
                const on = seleccion.has(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => toggle(s.id)}
                      aria-pressed={on}
                      className={`w-full text-left flex items-center gap-2 rounded-lg px-2.5 py-2 ring-1 transition-all ${
                        on
                          ? "bg-indigo-50 ring-indigo-300"
                          : "bg-white ring-slate-200 hover:ring-indigo-200"
                      }`}
                    >
                      <span
                        className={`shrink-0 w-4 h-4 rounded-[4px] flex items-center justify-center text-[9px] ${
                          on
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-transparent ring-1 ring-slate-300"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12px] font-bold text-slate-900 leading-snug">
                          {s.label}
                        </span>
                        <span className="block text-[10px] text-slate-500 leading-snug line-clamp-1">
                          {s.hint}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="relative lg:sticky lg:top-20 rounded-2xl bg-gradient-to-br from-marca-navy-deep via-marca-navy to-indigo-950 text-white p-4 shadow-lg ring-1 ring-white/10 overflow-hidden">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(124,58,237,0.3),transparent_50%)]"
            />
            <div className="relative">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                Tu paquete
              </p>
              <p className="mt-0.5 text-base font-black">{incentivo.titulo}</p>
              <p className="mt-1 text-[11px] text-slate-300 leading-snug">
                {incentivo.detalle}
              </p>

              <div className="mt-3 max-h-36 overflow-y-auto space-y-1 text-[11px] text-indigo-100/90">
                {perfil.tipo && (
                  <p>
                    · {TIPOS_EMPRESA.find((t) => t.id === perfil.tipo)?.label}
                  </p>
                )}
                {perfil.regimenes.map((id) => {
                  const r = [
                    ...REGIMENES_COTIZABLES_PF,
                    ...REGIMENES_COTIZABLES_PM,
                  ].find((x) => x.id === id);
                  return r ? <p key={id}>· {r.label}</p> : null;
                })}
                {(perfil.ingresos > 0 || perfil.ingresosMas300) && (
                  <p>· {formatearIngresos(perfil)}</p>
                )}
                {(perfil.cfdi > 1 || perfil.cfdiMas50) && (
                  <p>· {formatearCfdi(perfil)}</p>
                )}
                {ids.length === 0 ? (
                  <p className="text-slate-400 italic">Sin servicios aún</p>
                ) : (
                  ids.map((id) => {
                    const s = SERVICIOS_COTIZABLES.find((x) => x.id === id);
                    return s ? (
                      <p key={id} className="flex gap-1">
                        <span className="text-indigo-400">✓</span>
                        <span className="min-w-0">{s.label}</span>
                      </p>
                    ) : null;
                  })
                )}
              </div>

              <p className="mt-3 text-[11px] text-slate-400">
                <span className="tabular-nums font-black text-white">
                  {ids.length}
                </span>{" "}
                servicio{ids.length === 1 ? "" : "s"}
              </p>

              <Link
                href={hrefEmpezar}
                className={`mt-3 inline-flex w-full items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-bold transition-all ${
                  listo
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-95"
                    : "bg-white text-marca-navy hover:bg-slate-100"
                }`}
              >
                Continuar a Empezar →
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex w-full items-center justify-center h-9 rounded-lg text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-500/10 transition"
              >
                O WhatsApp directo
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
