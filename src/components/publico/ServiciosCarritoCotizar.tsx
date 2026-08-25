"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CONTACTO_PUBLICO } from "@/lib/contacto-publico";
import {
  CFDI_MAX,
  INGRESOS_MAX,
  PAQUETES_COTIZABLES,
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

/**
 * Experiencia tipo “tienda / carrito” (sin cobro):
 * catálogo de servicios + carrito sticky claro → Empezar o WhatsApp.
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

  const toggle = (id: string) => {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setCarritoAbierto(true);
  };

  const agregarPaquete = (paq: PaqueteCotizable) => {
    setSeleccion((prev) => {
      const next = new Set(prev);
      for (const id of paq.servicioIds) next.add(id);
      return next;
    });
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
    setCarritoAbierto(true);
  };

  const toggleRegimen = (id: string) => {
    setPerfil((p) => {
      const set = new Set(p.regimenes);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...p, regimenes: [...set] };
    });
    setCarritoAbierto(true);
  };

  const ids = useMemo(() => [...seleccion], [seleccion]);
  const incentivo = copyIncentivoPaquete(ids.length);
  const hrefEmpezar = hrefEmpezarConPaquete(ids, perfil);
  const itemsEnCarrito =
    ids.length +
    (perfil.tipo ? 1 : 0) +
    perfil.regimenes.length +
    (perfil.ingresos > 0 || perfil.ingresosMas300 ? 1 : 0) +
    (perfil.cfdi > 1 || perfil.cfdiMas50 ? 1 : 0);

  const regimenesLista =
    perfil.tipo === "fisica"
      ? REGIMENES_COTIZABLES_PF
      : perfil.tipo === "moral"
        ? REGIMENES_COTIZABLES_PM
        : [];

  const primario = TIPOS_EMPRESA.find((t) => t.primario)!;
  const secundarios = TIPOS_EMPRESA.filter((t) => !t.primario);

  const waHref = CONTACTO_PUBLICO.whatsapp.buildUrl(
    itemsEnCarrito > 0
      ? mensajeWhatsAppPaquete({ mensaje: "", ids, perfil })
      : "Hola, vi su cotizador en rdcontadores.com y me gustaría platicar."
  );

  const CartBody = (
    <>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <IconCart />
            {itemsEnCarrito > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center tabular-nums">
                {itemsEnCarrito}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 leading-tight">
              Tu carrito
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {incentivo.titulo}
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

      <p className="text-[11px] text-slate-500 leading-snug mb-3">
        {incentivo.detalle}
      </p>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 max-h-[40vh] lg:max-h-[min(22rem,50vh)]">
        {itemsEnCarrito === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center">
            <p className="text-sm font-semibold text-slate-600">
              Carrito vacío
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Agrega servicios o perfil — se van sumando aquí.
            </p>
          </div>
        ) : (
          <>
            {perfil.tipo && (
              <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-2.5 py-2 ring-1 ring-violet-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
                  Perfil
                </span>
                <span className="flex-1 text-xs font-semibold text-slate-800 truncate">
                  {TIPOS_EMPRESA.find((t) => t.id === perfil.tipo)?.label}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPerfil((p) => ({ ...p, tipo: undefined, regimenes: [] }))
                  }
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                  aria-label="Quitar perfil"
                >
                  ×
                </button>
              </div>
            )}
            {perfil.regimenes.map((id) => {
              const r = [
                ...REGIMENES_COTIZABLES_PF,
                ...REGIMENES_COTIZABLES_PM,
              ].find((x) => x.id === id);
              if (!r) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-200"
                >
                  <span className="text-[10px] font-bold text-indigo-500">
                    Régimen
                  </span>
                  <span className="flex-1 text-xs font-semibold text-slate-800 truncate">
                    {r.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleRegimen(id)}
                    className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                    aria-label={`Quitar ${r.label}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
            {(perfil.ingresos > 0 || perfil.ingresosMas300) && (
              <div className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-200">
                <span className="text-[10px] font-bold text-slate-400">
                  Ingresos
                </span>
                <span className="flex-1 text-xs font-semibold text-slate-800">
                  {formatearIngresos(perfil)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPerfil((p) => ({
                      ...p,
                      ingresos: 0,
                      ingresosMas300: false,
                    }))
                  }
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                  aria-label="Quitar ingresos"
                >
                  ×
                </button>
              </div>
            )}
            {(perfil.cfdi > 1 || perfil.cfdiMas50) && (
              <div className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 ring-1 ring-slate-200">
                <span className="text-[10px] font-bold text-slate-400">
                  CFDI
                </span>
                <span className="flex-1 text-xs font-semibold text-slate-800">
                  {formatearCfdi(perfil)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPerfil((p) => ({ ...p, cfdi: 1, cfdiMas50: false }))
                  }
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                  aria-label="Quitar CFDI"
                >
                  ×
                </button>
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
          className="inline-flex w-full items-center justify-center gap-1.5 h-10 rounded-xl bg-marca-navy text-white text-xs font-bold hover:bg-marca-navy-soft transition"
        >
          Ir a checkout · Empezar
        </Link>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center h-9 rounded-xl text-[11px] font-bold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 hover:bg-emerald-100 transition"
        >
          WhatsApp con mi carrito
        </a>
      </div>
    </>
  );

  return (
    <section
      id="armar-cotizacion"
      className="relative pb-28 lg:pb-10 bg-[#f7f5fb]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="mb-5 sm:mb-6 max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-600">
            Tienda de servicios · sin cobro
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Agrega lo que necesitas a tu{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              carrito
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
            Como en una tienda: sumas servicios, ves el carrito y al final
            checkout en Empezar — o WhatsApp directo.
          </p>
        </header>

        {/* Paquetes: 4 en una fila en desktop (estilo pricing table) */}
        <div className="mb-5 sm:mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
            1 · Paquetes listos
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
            {PAQUETES_COTIZABLES.map((paq) => {
              const on = paqueteCompletoEnCarrito(paq);
              return (
                <li
                  key={paq.id}
                  className={`relative rounded-2xl bg-white ring-1 shadow-sm overflow-hidden transition flex flex-col ${
                    paq.popular
                      ? "ring-indigo-400 shadow-indigo-100/80 lg:scale-[1.02] z-[1]"
                      : on
                        ? "ring-emerald-300"
                        : "ring-slate-200/90"
                  }`}
                >
                  {paq.popular && (
                    <span className="absolute top-0 inset-x-0 bg-indigo-600 py-1 text-center text-[9px] font-black uppercase tracking-wider text-white">
                      Popular
                    </span>
                  )}
                  <div
                    className={`p-3 sm:p-3.5 flex flex-col h-full ${
                      paq.popular ? "pt-7" : ""
                    }`}
                  >
                    <div className="flex flex-wrap gap-1 mb-2">
                      {paq.servicioIds.slice(0, 4).map((sid) => {
                        const srv = SERVICIOS_COTIZABLES.find(
                          (x) => x.id === sid
                        );
                        if (!srv) return null;
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={sid}
                            src={srv.icon}
                            alt=""
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-md object-cover ring-1 ring-slate-100"
                          />
                        );
                      })}
                      {paq.servicioIds.length > 4 && (
                        <span className="h-8 w-8 rounded-md bg-slate-100 text-[10px] font-black text-slate-500 inline-flex items-center justify-center">
                          +{paq.servicioIds.length - 4}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] font-black text-slate-900 leading-snug">
                      {paq.nombre}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500 leading-snug">
                      {paq.tagline}
                    </p>
                    <ul className="mt-2 space-y-0.5 flex-1">
                      {paq.incluye.map((l) => (
                        <li
                          key={l}
                          className="text-[10px] text-slate-600 flex gap-1"
                        >
                          <span className="text-emerald-600 font-bold shrink-0">
                            ✓
                          </span>
                          <span className="leading-snug">{l}</span>
                        </li>
                      ))}
                    </ul>
                    {paq.precioDesde != null ? (
                      <p className="mt-2.5 text-slate-900">
                        <span className="text-[10px] font-semibold text-slate-500">
                          desde{" "}
                        </span>
                        <span className="text-lg font-black tabular-nums">
                          ${paq.precioDesde.toLocaleString("es-MX")}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {" "}
                          / mes
                        </span>
                      </p>
                    ) : (
                      <p className="mt-2.5 text-[10px] font-semibold text-slate-500">
                        Cotización a la medida
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => agregarPaquete(paq)}
                      className={`mt-3 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-[11px] font-bold transition ${
                        on
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : paq.popular
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-slate-900 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {on ? (
                        <>
                          <span aria-hidden>✓</span> En el carrito
                        </>
                      ) : (
                        <>
                          <span aria-hidden>+</span> Agregar paquete
                        </>
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 lg:gap-6 items-start">
          {/* Catálogo */}
          <div className="space-y-5 min-w-0">
            {/* Filtros de perfil */}
            <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm p-3.5 sm:p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
                2 · Tu perfil
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setTipo(primario.id)}
                  aria-pressed={perfil.tipo === primario.id}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 transition ${
                    perfil.tipo === primario.id
                      ? "bg-indigo-600 text-white ring-indigo-600"
                      : "bg-indigo-50 text-indigo-800 ring-indigo-200 hover:ring-indigo-400"
                  }`}
                >
                  Soy nuevo · necesito orientación
                </button>
                {secundarios.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipo(t.id)}
                    aria-pressed={perfil.tipo === t.id}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold ring-1 transition ${
                      perfil.tipo === t.id
                        ? "bg-slate-900 text-white ring-slate-900"
                        : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-400"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {regimenesLista.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
                    Régimen (opcional)
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
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition ${
                            on
                              ? "bg-violet-600 text-white ring-violet-600"
                              : "bg-slate-50 text-slate-700 ring-slate-200 hover:ring-violet-300"
                          }`}
                        >
                          {on ? "✓ " : "+ "}
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="font-bold uppercase tracking-wider text-slate-500">
                      Ingresos / mes
                    </span>
                    <span className="font-black tabular-nums text-slate-800">
                      {formatearIngresos(perfil)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={INGRESOS_MAX}
                    step={5_000}
                    value={
                      perfil.ingresosMas300 ? INGRESOS_MAX : perfil.ingresos
                    }
                    disabled={perfil.ingresosMas300}
                    onChange={(e) => {
                      setPerfil((p) => ({
                        ...p,
                        ingresosMas300: false,
                        ingresos: Number(e.target.value),
                      }));
                      setCarritoAbierto(true);
                    }}
                    className="w-full h-1.5 accent-indigo-600 disabled:opacity-40"
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
                  <input
                    type="range"
                    min={1}
                    max={CFDI_MAX}
                    step={1}
                    value={perfil.cfdiMas50 ? CFDI_MAX : perfil.cfdi}
                    disabled={perfil.cfdiMas50}
                    onChange={(e) => {
                      setPerfil((p) => ({
                        ...p,
                        cfdiMas50: false,
                        cfdi: Number(e.target.value),
                      }));
                      setCarritoAbierto(true);
                    }}
                    className="w-full h-1.5 accent-indigo-600 disabled:opacity-40"
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
            </div>

            {/* Catálogo de servicios */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
                3 · Servicios sueltos — toca “Agregar”
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SERVICIOS_COTIZABLES.map((s) => {
                  const on = seleccion.has(s.id);
                  return (
                    <li
                      key={s.id}
                      className={`rounded-2xl bg-white ring-1 shadow-sm overflow-hidden transition ${
                        on
                          ? "ring-indigo-300 shadow-indigo-100"
                          : "ring-slate-200/90"
                      }`}
                    >
                      <div className="p-3.5 flex flex-col h-full">
                        <div className="flex items-start gap-3">
                          <div className="flex -space-x-2 shrink-0">
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
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-900 leading-snug">
                              {s.label}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                              {s.hint}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggle(s.id)}
                          className={`mt-3 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-[11px] font-bold transition ${
                            on
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-slate-900 text-white hover:bg-indigo-700"
                          }`}
                        >
                          {on ? (
                            <>
                              <span aria-hidden>✓</span> En el carrito
                            </>
                          ) : (
                            <>
                              <span aria-hidden>+</span> Agregar
                            </>
                          )}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Carrito desktop — panel claro tipo bolsa */}
          <aside className="hidden lg:block sticky top-20 self-start rounded-2xl bg-white ring-1 ring-slate-200 shadow-xl shadow-slate-200/60 p-4">
            {CartBody}
          </aside>
        </div>
      </div>

      {/* Barra móvil tipo carrito flotante */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
        {!carritoAbierto ? (
          <button
            type="button"
            onClick={() => setCarritoAbierto(true)}
            className="pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl bg-marca-navy text-white px-4 py-3 shadow-2xl shadow-slate-900/30"
          >
            <span className="inline-flex items-center gap-2 font-bold text-sm">
              <IconCart className="text-indigo-200" />
              Ver carrito
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-black tabular-nums">
              {itemsEnCarrito}
            </span>
          </button>
        ) : (
          <div className="pointer-events-auto mx-auto w-full max-w-md rounded-2xl bg-white ring-1 ring-slate-200 shadow-2xl p-4 max-h-[70vh] flex flex-col">
            {CartBody}
          </div>
        )}
      </div>
    </section>
  );
}
