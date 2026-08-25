"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  type PerfilCotizacion,
  type TipoEmpresaId,
} from "@/lib/servicios-cotizables";

/**
 * Selector tipo “carrito” + perfil (tipo, régimen, ingresos, CFDI).
 * Todo viaja a /empezar precargado en el mensaje / WhatsApp.
 */
export default function ServiciosCarritoCotizar() {
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
      // Al cambiar de familia, limpia regímenes que no aplican
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
  const href = hrefEmpezarConPaquete(ids, perfil);
  const listoParaCotizar =
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

  return (
    <section className="relative py-14 sm:py-16 bg-gradient-to-b from-white via-violet-50/40 to-white overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-violet-200/35 blur-3xl"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-600">
            Arma tu cotización
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            ¿Qué necesitas que{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              llevemos por ti
            </span>
            ?
          </h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Cuéntanos un poco de tu negocio y marca servicios — como un carrito,
            sin pagar aquí. Nos ayuda a cotizar con estrategia, no a chismear.
          </p>
        </div>

        {/* Tipo de empresa — primario para no-expertos */}
        <div className="mb-6 sm:mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
            ¿Qué tipo de empresa eres?
          </p>

          <button
            type="button"
            onClick={() => setTipo(primario.id)}
            aria-pressed={perfil.tipo === primario.id}
            className={`w-full text-left rounded-3xl px-5 py-5 sm:px-6 sm:py-6 ring-2 transition-all mb-3 ${
              perfil.tipo === primario.id
                ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white ring-indigo-400 shadow-lg shadow-indigo-200/60"
                : "bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-slate-900 ring-indigo-300 hover:ring-indigo-500 hover:shadow-md"
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                perfil.tipo === primario.id
                  ? "text-indigo-100"
                  : "text-indigo-600"
              }`}
            >
              Empieza aquí si no eres experto
            </span>
            <span className="mt-1.5 block text-lg sm:text-xl font-black leading-snug">
              {primario.label}
            </span>
            <span
              className={`mt-1.5 block text-sm leading-relaxed ${
                perfil.tipo === primario.id
                  ? "text-indigo-100/95"
                  : "text-slate-600"
              }`}
            >
              {primario.hint}
            </span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {secundarios.map((t) => {
              const on = perfil.tipo === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipo(t.id)}
                  aria-pressed={on}
                  className={`text-left rounded-2xl px-4 py-3.5 ring-1 transition-all ${
                    on
                      ? "bg-gradient-to-br from-indigo-50 to-violet-50 ring-indigo-400 shadow-sm"
                      : "bg-white ring-slate-200 hover:ring-indigo-200"
                  }`}
                >
                  <span className="block text-sm font-black text-slate-900">
                    {t.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {t.hint}
                  </span>
                </button>
              );
            })}
          </div>

          {perfil.tipo === "nuevo" && (
            <p className="mt-3 text-xs text-indigo-700 bg-indigo-50 ring-1 ring-indigo-100 rounded-xl px-3.5 py-2.5 leading-relaxed">
              Perfecto. En la cotización te ayudamos a elegir régimen sin
              complicarte — esta página también es para quien apenas empieza.
            </p>
          )}

          {regimenesLista.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                ¿Qué régimen eres?{" "}
                <span className="normal-case tracking-normal font-semibold text-slate-400">
                  (puedes marcar más de uno)
                </span>
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {regimenesLista.map((r) => {
                  const on = perfil.regimenes.includes(r.id);
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => toggleRegimen(r.id)}
                        aria-pressed={on}
                        className={`w-full text-left flex items-start gap-3 rounded-2xl px-3.5 py-3 ring-1 transition-all ${
                          on
                            ? "bg-indigo-50 ring-indigo-300"
                            : "bg-white ring-slate-200 hover:ring-indigo-200"
                        }`}
                      >
                        <span
                          className={`mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center ${
                            on
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-transparent ring-2 ring-slate-300"
                          }`}
                          aria-hidden
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-slate-900 leading-snug">
                            {r.label}
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            {r.hint}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Sliders perfil */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Ingresos */}
          <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Ingresos aprox. al mes
                </p>
                <p className="mt-1 text-xs text-slate-500 leading-snug">
                  Opcional. Nos orienta a una estrategia para que pagues lo justo
                  de impuestos — no es chisme.
                </p>
              </div>
              <p className="shrink-0 text-sm font-black tabular-nums text-slate-900">
                {formatearIngresos(perfil)}
              </p>
            </div>

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
              className="mt-4 w-full accent-indigo-600 disabled:opacity-40"
              aria-label="Ingresos mensuales aproximados"
            />
            <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400 tabular-nums">
              <span>$0</span>
              <span>$300,000</span>
            </div>

            <label className="mt-3 flex items-center gap-2 cursor-pointer select-none">
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
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-700">
                +$300K al mes
              </span>
            </label>
          </div>

          {/* CFDI */}
          <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                  CFDI emitidos al mes
                </p>
                <p className="mt-1 text-xs text-slate-500 leading-snug">
                  Opcional. Nos dice el volumen de trabajo contable que
                  tendremos contigo.
                </p>
              </div>
              <p className="shrink-0 text-sm font-black tabular-nums text-slate-900">
                {formatearCfdi(perfil)}
              </p>
            </div>

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
              className="mt-4 w-full accent-indigo-600 disabled:opacity-40"
              aria-label="Volumen de CFDI emitidos al mes"
            />
            <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400 tabular-nums">
              <span>1</span>
              <span>50</span>
            </div>

            <label className="mt-3 flex items-center gap-2 cursor-pointer select-none">
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
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-700">+50 CFDI</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(260px,320px)] gap-6 lg:gap-8 items-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
              Servicios que necesitas
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {SERVICIOS_COTIZABLES.map((s) => {
                const on = seleccion.has(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => toggle(s.id)}
                      aria-pressed={on}
                      className={`w-full text-left flex items-start gap-3 rounded-2xl px-4 py-3.5 ring-1 transition-all duration-200 ${
                        on
                          ? "bg-gradient-to-br from-indigo-50 to-violet-50 ring-indigo-300 shadow-sm shadow-indigo-100"
                          : "bg-white ring-slate-200 hover:ring-indigo-200 hover:bg-violet-50/40"
                      }`}
                    >
                      <span
                        className={`mt-0.5 shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                          on
                            ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white scale-105 shadow-sm shadow-violet-300"
                            : "bg-white text-transparent ring-2 ring-slate-300"
                        }`}
                        aria-hidden
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-sm font-bold leading-snug ${
                            on ? "text-slate-900" : "text-slate-800"
                          }`}
                        >
                          {s.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {s.hint}
                        </span>
                      </span>
                      {on && (
                        <span className="ml-auto shrink-0 text-[10px] font-black uppercase tracking-wider text-indigo-600">
                          +
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="relative lg:sticky lg:top-24 rounded-3xl bg-gradient-to-br from-marca-navy-deep via-marca-navy to-indigo-950 text-white p-5 sm:p-6 shadow-xl ring-1 ring-white/10 overflow-hidden">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(124,58,237,0.35),transparent_50%)]"
            />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-400">
                Tu paquete
              </p>
              <p className="mt-1 text-lg font-black">{incentivo.titulo}</p>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {incentivo.detalle}
              </p>

              {(perfil.tipo ||
                perfil.regimenes.length > 0 ||
                perfil.ingresos > 0 ||
                perfil.ingresosMas300 ||
                perfil.cfdi > 1 ||
                perfil.cfdiMas50) && (
                <ul className="mt-4 space-y-1.5 text-xs text-indigo-100/90">
                  {perfil.tipo && (
                    <li>
                      ·{" "}
                      {
                        TIPOS_EMPRESA.find((t) => t.id === perfil.tipo)?.label
                      }
                    </li>
                  )}
                  {perfil.regimenes.map((id) => {
                    const r = [
                      ...REGIMENES_COTIZABLES_PF,
                      ...REGIMENES_COTIZABLES_PM,
                    ].find((x) => x.id === id);
                    return r ? <li key={id}>· {r.label}</li> : null;
                  })}
                  {(perfil.ingresos > 0 || perfil.ingresosMas300) && (
                    <li>· Ingresos {formatearIngresos(perfil)}</li>
                  )}
                  {(perfil.cfdi > 1 || perfil.cfdiMas50) && (
                    <li>· {formatearCfdi(perfil)}</li>
                  )}
                </ul>
              )}

              <div className="mt-4 min-h-[5rem]">
                {ids.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">
                    Aún sin servicios — márcalos a la izquierda.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {ids.map((id) => {
                      const s = SERVICIOS_COTIZABLES.find((x) => x.id === id);
                      if (!s) return null;
                      return (
                        <li
                          key={id}
                          className="flex items-start gap-2 text-sm text-white/95"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span className="leading-snug">{s.label}</span>
                          <button
                            type="button"
                            onClick={() => toggle(id)}
                            className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white"
                            aria-label={`Quitar ${s.label}`}
                          >
                            Quitar
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  <span className="tabular-nums font-black text-white">
                    {ids.length}
                  </span>{" "}
                  seleccionado{ids.length === 1 ? "" : "s"}
                </span>
                {ids.length >= 2 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Mejor precio al cotizar
                  </span>
                )}
              </div>

              <Link
                href={href}
                className={`mt-5 inline-flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all ${
                  listoParaCotizar
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40 hover:opacity-95"
                    : "bg-white text-marca-navy hover:bg-slate-100"
                }`}
              >
                {listoParaCotizar
                  ? "Ir al cotizador con mi paquete →"
                  : "Ir al cotizador →"}
              </Link>
              <p className="mt-2.5 text-[11px] text-slate-400 text-center leading-snug">
                En Empezar verás perfil + servicios precargados. Formulario y
                WhatsApp llevan lo mismo.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
