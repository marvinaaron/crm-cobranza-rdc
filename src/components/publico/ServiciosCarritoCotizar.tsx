"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CotizarRangeSlider from "@/components/publico/CotizarRangeSlider";
import PillDeslizable from "@/components/ui/PillDeslizable";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import {
  CFDI_MAX,
  INGRESOS_MAX,
  PAQUETES_COTIZABLES,
  PERFIL_VACIO,
  REGIMENES_COTIZABLES_PF,
  REGIMENES_COTIZABLES_PM,
  SERVICIOS_COTIZABLES,
  formatearCfdi,
  formatearIngresos,
  hrefEmpezarConPaquete,
  mensajeCombinacion,
  mensajeWhatsAppPaquete,
  perfilListoParaRecomendar,
  precioPublicoSeleccion,
  progresoCotizacion,
  recomendarPaqueteId,
  resumenPerfilCorto,
  serviciosRelacionadosPendientes,
  type PaqueteCotizable,
  type PerfilCotizacion,
  type TipoEmpresaId,
} from "@/lib/servicios-cotizables";

function IconCart({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

const ACENTOS_SERVICIO = [
  "from-indigo-500 via-violet-500 to-fuchsia-500",
  "from-cyan-400 via-sky-500 to-blue-600",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-rose-400 via-orange-400 to-amber-400",
] as const;

const PREVIEW_DEFAULT = 4;

/**
 * Configurador de solución contable:
 * perfil → recomendación → personalizar → progreso → checkout.
 */
export default function ServiciosCarritoCotizar({
  paqueteInicialId,
}: {
  paqueteInicialId?: string;
}) {
  const paqueteSeed = useMemo(
    () => PAQUETES_COTIZABLES.find((p) => p.id === paqueteInicialId),
    [paqueteInicialId]
  );

  const [seleccion, setSeleccion] = useState<Set<string>>(() => {
    if (!paqueteSeed) return new Set();
    return new Set(paqueteSeed.servicioIds);
  });
  const [perfil, setPerfil] = useState<PerfilCotizacion>(() => {
    if (!paqueteSeed?.perfilSugerido) return PERFIL_VACIO;
    return {
      ...PERFIL_VACIO,
      tipo: paqueteSeed.perfilSugerido.tipo,
      regimenes: [...(paqueteSeed.perfilSugerido.regimenes ?? [])],
    };
  });
  const [carritoAbierto, setCarritoAbierto] = useState(
    () => Boolean(paqueteSeed)
  );
  const [cartPulse, setCartPulse] = useState(false);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [pulsePaquete, setPulsePaquete] = useState<string | null>(null);

  const pulseCart = () => {
    setCartPulse(true);
    window.setTimeout(() => setCartPulse(false), 450);
  };

  const toggle = (id: string) => {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        pulseCart();
      }
      return next;
    });
    setCarritoAbierto(true);
  };

  const agregarPaquete = (paq: PaqueteCotizable) => {
    const yaCompleto = paq.servicioIds.every((id) => seleccion.has(id));
    if (yaCompleto) return;
    setSeleccion((prev) => {
      const next = new Set(prev);
      for (const id of paq.servicioIds) next.add(id);
      return next;
    });
    pulseCart();
    setPulsePaquete(paq.id);
    window.setTimeout(() => setPulsePaquete(null), 500);
    if (paq.perfilSugerido) {
      setPerfil((p) => ({
        ...p,
        tipo: paq.perfilSugerido?.tipo ?? p.tipo,
        regimenes:
          paq.perfilSugerido?.regimenes?.length
            ? [
                ...new Set([
                  ...p.regimenes,
                  ...(paq.perfilSugerido.regimenes ?? []),
                ]),
              ]
            : p.regimenes,
      }));
    }
    setCarritoAbierto(true);
  };

  const paqueteCompletoEnCarrito = (paq: PaqueteCotizable) =>
    paq.servicioIds.every((id) => seleccion.has(id));

  const setTipo = (id: TipoEmpresaId) => {
    setPerfil((p) => ({
      ...p,
      tipo: id,
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
    setCarritoAbierto(true);
  };

  const setRegimen = (id: string) => {
    setPerfil((p) => ({
      ...p,
      regimenes: id === "__skip__" ? [] : [id],
    }));
    setCarritoAbierto(true);
  };

  const ids = useMemo(() => [...seleccion], [seleccion]);
  const hrefEmpezar = hrefEmpezarConPaquete(ids, perfil);
  const progreso = progresoCotizacion(perfil, ids);
  const precio = precioPublicoSeleccion(ids);
  const combinacion = mensajeCombinacion(ids);
  const relacionados = serviciosRelacionadosPendientes(ids, 3);
  const resumenPerfil = resumenPerfilCorto(perfil);
  const mostrarRecomendacion = perfilListoParaRecomendar(perfil);
  const recomendadoId = mostrarRecomendacion
    ? recomendarPaqueteId(perfil)
    : null;

  const regimenesLista =
    perfil.tipo === "fisica"
      ? REGIMENES_COTIZABLES_PF
      : perfil.tipo === "moral"
        ? REGIMENES_COTIZABLES_PM
        : [];

  const tipoPillValue: TipoEmpresaId = perfil.tipo ?? "nuevo";
  const regimenPillValue = perfil.regimenes[0] ?? "__skip__";

  const paquetesOrdenados = useMemo(() => {
    if (!recomendadoId) return [...PAQUETES_COTIZABLES];
    const rec = PAQUETES_COTIZABLES.find((p) => p.id === recomendadoId);
    const resto = PAQUETES_COTIZABLES.filter((p) => p.id !== recomendadoId);
    return rec ? [rec, ...resto] : [...PAQUETES_COTIZABLES];
  }, [recomendadoId]);

  const waHref = CONTACTO_PUBLICO.whatsapp.buildUrl(
    ids.length > 0 || perfil.tipo
      ? mensajeWhatsAppPaquete({ mensaje: "", ids, perfil })
      : "Hola, vi su cotizador en rdcontadores.com y me gustaría platicar."
  );

  const toggleExpand = (id: string) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const CartBody = (
    <>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-marca-acento ring-2 ring-marca-acento/20 ${
              cartPulse ? "cotizar-cart-pulse" : ""
            }`}
          >
            <IconCart />
            {ids.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-0.5 rounded-full bg-marca-acento text-white text-[9px] font-black flex items-center justify-center tabular-nums ring-2 ring-white">
                {ids.length}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 leading-tight">
              Tu solución
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {ids.length === 0
                ? "Sin servicios aún"
                : `${ids.length} servicio${ids.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="lg:hidden text-[11px] font-bold text-slate-500"
          onClick={() => setCarritoAbierto(false)}
        >
          Cerrar
        </button>
      </div>

      {/* Progreso */}
      <div className="mb-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Avance
          </p>
          <p className="text-[11px] font-black tabular-nums text-marca-acento">
            {progreso.pct}%
          </p>
        </div>
        <div
          className="h-1.5 rounded-full bg-slate-200 overflow-hidden"
          role="progressbar"
          aria-valuenow={progreso.pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso de cotización"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-marca-acento transition-[width] duration-300 ease-out"
            style={{ width: `${progreso.pct}%` }}
          />
        </div>
        <ul className="mt-2.5 space-y-1">
          {progreso.pasos.map((paso) => (
            <li
              key={paso.id}
              className="flex items-center gap-2 text-[11px]"
            >
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${
                  paso.done
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {paso.done ? "✓" : "○"}
              </span>
              <span
                className={
                  paso.done
                    ? "font-semibold text-slate-800"
                    : "text-slate-400"
                }
              >
                {paso.label}
              </span>
            </li>
          ))}
        </ul>
        {progreso.listo && (
          <p className="mt-2 text-[11px] font-bold text-marca-acento">
            Tu solución está lista
          </p>
        )}
      </div>

      {combinacion && (
        <div className="mb-3 rounded-xl bg-violet-50 ring-1 ring-violet-100 px-3 py-2.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-marca-acento">
            {combinacion.titulo}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-600 leading-snug">
            {combinacion.detalle}
          </p>
        </div>
      )}

      {precio && (
        <div className="mb-3 rounded-xl bg-white ring-1 ring-indigo-100 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Referencia de precio
          </p>
          <p className="mt-0.5 flex items-baseline gap-1">
            <span className="text-2xl font-black tabular-nums text-slate-900">
              ${precio.monto.toLocaleString("es-MX")}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ mes</span>
          </p>
          <p className="text-[10px] text-slate-500">{precio.etiqueta}</p>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 max-h-[32vh] lg:max-h-[min(18rem,40vh)]">
        {ids.length === 0 && !perfil.tipo ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center">
            <p className="text-sm font-semibold text-slate-600">
              Empieza por tu perfil
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Cuéntanos de ti y te armamos una solución.
            </p>
          </div>
        ) : (
          <>
            {resumenPerfil && (
              <div className="flex items-start gap-2 rounded-lg bg-violet-50 px-2.5 py-2 ring-1 ring-violet-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-marca-acento shrink-0 mt-0.5">
                  Perfil
                </span>
                <span className="flex-1 text-xs font-semibold text-slate-800 leading-snug">
                  {resumenPerfil}
                </span>
              </div>
            )}
            {ids.map((id) => {
              const s = SERVICIOS_COTIZABLES.find((x) => x.id === id);
              if (!s) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 ring-1 ring-indigo-100 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-md object-cover shrink-0"
                  />
                  <span className="flex-1 text-xs font-bold text-slate-900 leading-snug">
                    {s.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-rose-600"
                  >
                    Quitar
                  </button>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
        <Link
          href={hrefEmpezar}
          className="inline-flex w-full items-center justify-center gap-1.5 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-marca-acento text-white text-xs font-bold hover:opacity-95 transition shadow-md shadow-indigo-200/50"
        >
          {progreso.listo ? "Continuar →" : "Ir a checkout · Empezar"}
        </Link>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center h-9 rounded-xl text-[11px] font-bold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 hover:bg-emerald-100 transition"
        >
          WhatsApp con mi solución
        </a>
      </div>
    </>
  );

  const renderPaqueteCard = (paq: PaqueteCotizable, destacado: boolean) => {
    const on = paqueteCompletoEnCarrito(paq);
    const preview = paq.previewCount ?? PREVIEW_DEFAULT;
    const abierto = expandidos.has(paq.id);
    const visibles = abierto ? paq.incluye : paq.incluye.slice(0, preview);
    const hayMas = paq.incluye.length > preview;

    return (
      <li
        key={paq.id}
        className={`relative rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ${
          destacado
            ? "lg:scale-[1.02] z-[1] shadow-2xl shadow-indigo-900/30 ring-2 ring-marca-acento"
            : on
              ? "ring-2 ring-emerald-400/70 shadow-lg"
              : "ring-1 ring-white/10 shadow-xl shadow-slate-900/20 hover:-translate-y-0.5"
        } bg-[radial-gradient(circle_at_15%_15%,#1e3a5f_0%,#0f1d2e_45%,#0a1424_100%)] text-white ${
          pulsePaquete === paq.id ? "cotizar-cart-pulse" : ""
        }`}
      >
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-violet-500/25 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl"
          aria-hidden
        />

        <div className="relative p-4 sm:p-5 flex flex-col h-full">
          <div className="flex items-center justify-between gap-2">
            {destacado ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/40 to-marca-acento/50 text-[9px] font-bold uppercase tracking-wider ring-1 ring-white/25">
                ✦ Recomendado para ti
              </span>
            ) : paq.popular ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-[9px] font-bold uppercase tracking-wider ring-1 ring-white/20">
                Más solicitado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-wider ring-1 ring-white/10 text-white/70">
                Paquete
              </span>
            )}
            <div className="flex -space-x-1.5">
              {paq.servicioIds.slice(0, 3).map((sid) => {
                const srv = SERVICIOS_COTIZABLES.find((x) => x.id === sid);
                if (!srv) return null;
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={sid}
                    src={srv.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-md object-cover ring-1 ring-white/20"
                  />
                );
              })}
            </div>
          </div>

          <h3 className="mt-3 text-[15px] font-black leading-snug">
            {paq.nombre}
          </h3>
          <p className="mt-1.5 text-[11px] text-white/80 leading-snug">
            {paq.beneficio}
          </p>

          {paq.precioDesde != null ? (
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums">
                  ${paq.precioDesde.toLocaleString("es-MX")}
                </span>
                <span className="text-xs text-white/75 font-semibold">
                  / mes
                </span>
              </div>
              <p className="text-[10px] text-white/55 mt-0.5">
                IVA incluido
                {destacado ? " · Precio calculado para tu perfil" : ""}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[11px] font-semibold text-white/60">
              Cotización a la medida
            </p>
          )}

          <ul className="mt-3 space-y-1.5 flex-1">
            {visibles.map((l) => (
              <li
                key={l}
                className="flex items-start gap-2 text-[10px] text-white/90 leading-snug"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-300 shrink-0 mt-0.5"
                  aria-hidden
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{l}</span>
              </li>
            ))}
          </ul>

          {hayMas && (
            <button
              type="button"
              onClick={() => toggleExpand(paq.id)}
              className="mt-2 self-start text-[10px] font-bold text-white/70 hover:text-white underline-offset-2 hover:underline"
              aria-expanded={abierto}
            >
              {abierto
                ? "Ver menos"
                : `+ Ver todo lo incluido (${paq.incluye.length - preview} más)`}
            </button>
          )}

          <button
            type="button"
            onClick={() => agregarPaquete(paq)}
            disabled={on}
            className={`mt-4 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-[11px] font-bold transition w-full ${
              on
                ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40 cursor-default"
                : destacado
                  ? "bg-gradient-to-r from-indigo-600 to-marca-acento text-white hover:opacity-95 shadow-lg shadow-indigo-900/40"
                  : "bg-white text-marca-navy hover:bg-slate-50 shadow-lg"
            }`}
          >
            {on ? (
              <>
                <span aria-hidden>✓</span> Agregado
              </>
            ) : (
              <>
                Quiero este paquete
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </li>
    );
  };

  return (
    <section
      id="armar-cotizacion"
      className="relative pb-28 lg:pb-10 bg-[#f7f5fb]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-marca-acento">
            Configurador · sin cobro
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
            Armamos tu{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-marca-acento bg-clip-text text-transparent">
              solución contable
            </span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Cuéntanos de ti, te recomendamos un paquete y lo personalizas. Al
            final cotizas en Empezar o por WhatsApp.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 lg:gap-8 items-start">
          <div className="space-y-6 min-w-0">
            {/* 1 · Perfil */}
            <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1">
                1 · Cuéntanos de ti
              </p>
              <h2 className="text-lg font-black text-slate-900 mb-3">
                ¿Qué tipo de contribuyente eres?
              </h2>

              <PillDeslizable
                opciones={[
                  { value: "nuevo", label: "Soy nuevo · orientación" },
                  { value: "fisica", label: "Persona física" },
                  { value: "moral", label: "Persona moral / empresa" },
                ]}
                value={tipoPillValue}
                onChange={(v) => setTipo(v)}
                scrollable
              />

              {regimenesLista.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <PillDeslizable
                    label="Régimen (opcional)"
                    opciones={[
                      { value: "__skip__", label: "Aún no lo sé" },
                      ...regimenesLista.map((r) => ({
                        value: r.id,
                        label: r.label,
                      })),
                    ]}
                    value={regimenPillValue}
                    onChange={setRegimen}
                    scrollable
                  />
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="font-bold uppercase tracking-wider text-slate-500">
                      Facturación / mes
                    </span>
                    <span className="font-black tabular-nums text-slate-800">
                      {formatearIngresos(perfil)}
                    </span>
                  </div>
                  <CotizarRangeSlider
                    min={0}
                    max={INGRESOS_MAX}
                    step={5_000}
                    value={
                      perfil.ingresosMas300 ? INGRESOS_MAX : perfil.ingresos
                    }
                    disabled={perfil.ingresosMas300}
                    onChange={(v) => {
                      setPerfil((p) => ({
                        ...p,
                        ingresosMas300: false,
                        ingresos: v,
                      }));
                      setCarritoAbierto(true);
                    }}
                  />
                  <label className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={perfil.ingresosMas300}
                      onChange={(e) => {
                        setPerfil((p) => ({
                          ...p,
                          ingresosMas300: e.target.checked,
                          ingresos: e.target.checked
                            ? INGRESOS_MAX
                            : p.ingresos,
                        }));
                        setCarritoAbierto(true);
                      }}
                      className="h-3 w-3 rounded text-indigo-600"
                    />
                    +$300K
                  </label>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="font-bold uppercase tracking-wider text-slate-500">
                      CFDI / mes
                    </span>
                    <span className="font-black tabular-nums text-slate-800">
                      {formatearCfdi(perfil)}
                    </span>
                  </div>
                  <CotizarRangeSlider
                    min={1}
                    max={CFDI_MAX}
                    step={1}
                    value={perfil.cfdiMas50 ? CFDI_MAX : perfil.cfdi}
                    disabled={perfil.cfdiMas50}
                    onChange={(v) => {
                      setPerfil((p) => ({
                        ...p,
                        cfdiMas50: false,
                        cfdi: v,
                      }));
                      setCarritoAbierto(true);
                    }}
                  />
                  <label className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={perfil.cfdiMas50}
                      onChange={(e) => {
                        setPerfil((p) => ({
                          ...p,
                          cfdiMas50: e.target.checked,
                          cfdi: e.target.checked ? CFDI_MAX : p.cfdi,
                        }));
                        setCarritoAbierto(true);
                      }}
                      className="h-3 w-3 rounded text-indigo-600"
                    />
                    +50
                  </label>
                </div>
              </div>

              {resumenPerfil && (
                <div className="mt-4 rounded-xl bg-violet-50 ring-1 ring-violet-100 px-3.5 py-3 flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-marca-acento text-white text-[10px] font-black shrink-0">
                    ✓
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-marca-acento">
                      Perfil identificado
                    </p>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {resumenPerfil}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2 · Recomendación + paquetes */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1">
                2 · Tu solución recomendada
              </p>
              <h2 className="text-lg font-black text-slate-900 mb-3">
                {mostrarRecomendacion
                  ? "Recomendado para ti"
                  : "Elige un punto de partida"}
              </h2>
              {!mostrarRecomendacion && (
                <p className="text-sm text-slate-500 mb-3">
                  Completa el paso 1 para ver una recomendación personalizada.
                </p>
              )}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 items-stretch">
                {paquetesOrdenados.map((paq) =>
                  renderPaqueteCard(paq, paq.id === recomendadoId)
                )}
              </ul>
            </div>

            {/* Relacionados */}
            {relacionados.length > 0 && (
              <div className="rounded-2xl bg-white ring-1 ring-violet-100 shadow-sm p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-marca-acento">
                  Normalmente se combina con
                </p>
                <ul className="mt-3 space-y-2">
                  {relacionados.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 px-3 py-2.5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.icon}
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 leading-snug">
                          {s.label}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {s.hint}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(s.id)}
                        className="shrink-0 h-8 px-3 rounded-lg bg-marca-navy text-white text-[10px] font-bold hover:bg-marca-acento transition"
                      >
                        + Agregar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3 · Completa tu solución */}
            <div>
              <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    3 · Completa tu solución
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    Servicios que puedes agregar
                  </p>
                </div>
                <p className="text-[11px] text-slate-500">
                  {SERVICIOS_COTIZABLES.length} disponibles
                </p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {SERVICIOS_COTIZABLES.map((s, i) => {
                  const on = seleccion.has(s.id);
                  const acento =
                    ACENTOS_SERVICIO[i % ACENTOS_SERVICIO.length];
                  return (
                    <li
                      key={s.id}
                      className={`group relative rounded-2xl bg-white ring-1 shadow-sm overflow-hidden transition-all duration-300 ${
                        on
                          ? "opacity-45 grayscale-[0.65] bg-slate-50 ring-slate-200 scale-[0.98]"
                          : "ring-slate-200/90 hover:shadow-lg hover:-translate-y-1 hover:ring-marca-acento/30"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${acento}`}
                      />
                      {on && (
                        <span className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-800 ring-1 ring-emerald-200">
                          ✓ Agregado
                        </span>
                      )}
                      <div className="p-3.5 flex flex-col h-full">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex -space-x-2 shrink-0 transition duration-300 ${
                              on ? "opacity-60" : ""
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={s.icon}
                              alt=""
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-100 bg-[#0f1d2e]"
                            />
                            {s.iconExtra && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={s.iconExtra}
                                alt=""
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-xl object-cover ring-1 ring-white bg-[#0f1d2e]"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pr-14">
                            <p className="text-sm font-black text-slate-900 leading-snug">
                              {s.label}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500 leading-snug line-clamp-3">
                              {s.hint}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => !on && toggle(s.id)}
                          disabled={on}
                          aria-disabled={on}
                          className={`mt-3 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-[11px] font-bold transition ${
                            on
                              ? "bg-slate-100 text-slate-500 ring-1 ring-slate-200 cursor-default"
                              : "bg-marca-navy text-white hover:bg-marca-acento"
                          }`}
                        >
                          {on ? (
                            <>
                              <span aria-hidden>✓</span> Agregado
                            </>
                          ) : (
                            <>
                              <span aria-hidden>+</span> Agregar a mi solución
                            </>
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Prueba social (datos reales del sitio) */}
            <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 px-4 py-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-amber-400 text-sm tracking-tight" aria-hidden>
                ★★★★★
              </div>
              <blockquote className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-relaxed">
                  “Antes vivía con el pendiente del SAT cada mes. Con RDC ya no
                  me preocupo: me avisan, me explican y todo sale a tiempo.”
                </p>
                <footer className="mt-1 text-[11px] font-semibold text-slate-500">
                  — Dr. Ramírez · Consultorio dental · Guadalajara
                </footer>
              </blockquote>
            </div>

            {progreso.listo && (
              <div className="rounded-2xl bg-[radial-gradient(circle_at_15%_15%,#1e3a5f_0%,#0f1d2e_55%,#0a1424_100%)] text-white p-5 sm:p-6 ring-1 ring-marca-acento/40">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-marca-acento-soft">
                  ✦ Tu solución está lista
                </p>
                <p className="mt-2 text-lg font-black">
                  {resumenPerfil ?? "Perfil listo"} · {ids.length} servicio
                  {ids.length === 1 ? "" : "s"}
                </p>
                {precio && (
                  <p className="mt-1 text-sm text-white/80">
                    Referencia desde{" "}
                    <span className="font-black text-white">
                      ${precio.monto.toLocaleString("es-MX")}
                    </span>
                    /mes
                  </p>
                )}
                <Link
                  href={hrefEmpezar}
                  className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-marca-acento text-white text-sm font-bold hover:opacity-95 transition"
                >
                  Continuar →
                </Link>
              </div>
            )}
          </div>

          <aside className="hidden lg:block sticky top-20 self-start rounded-2xl bg-white ring-2 ring-marca-acento shadow-xl shadow-indigo-200/50 p-4">
            {CartBody}
          </aside>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
        {!carritoAbierto ? (
          <button
            type="button"
            onClick={() => setCarritoAbierto(true)}
            className={`pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-marca-navy text-white px-4 py-3 shadow-2xl shadow-indigo-900/30 ring-2 ring-marca-acento ${
              cartPulse ? "cotizar-cart-pulse" : ""
            }`}
          >
            <span className="inline-flex items-center gap-2 font-bold text-sm min-w-0">
              <IconCart className="text-marca-acento-soft shrink-0" />
              <span className="truncate">
                {ids.length} servicio{ids.length === 1 ? "" : "s"}
                {precio
                  ? ` · desde $${precio.monto.toLocaleString("es-MX")}/mes`
                  : ""}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-marca-acento px-3 py-1 text-xs font-black">
              Continuar →
            </span>
          </button>
        ) : (
          <div className="pointer-events-auto mx-auto w-full max-w-md rounded-2xl bg-white ring-2 ring-marca-acento shadow-2xl shadow-indigo-200/50 p-4 max-h-[75vh] flex flex-col">
            {CartBody}
          </div>
        )}
      </div>
    </section>
  );
}
