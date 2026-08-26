"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
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
  desgloseSolucion,
  formatearCfdi,
  formatearIngresos,
  hrefEmpezarConPaquete,
  mensajeCombinacion,
  mensajeWhatsAppPaquete,
  perfilListoParaRecomendar,
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
const RESICO = PAQUETES_COTIZABLES.find((p) => p.id === "resico-facturacion")!;

/**
 * Configurador + cotizador (modelo comercial real):
 * solo RESICO tiene precio público; el resto es solicitud de cotización.
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
  const configRef = useRef<HTMLDivElement>(null);
  const solucionesRef = useRef<HTMLDivElement>(null);

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
  const [mostrarConfig, setMostrarConfig] = useState(
    () => Boolean(paqueteSeed) && paqueteSeed?.id !== "resico-facturacion"
  );

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
    pulseCart();
    setCarritoAbierto(true);
  };

  const setRegimen = (id: string) => {
    setPerfil((p) => ({
      ...p,
      regimenes: id === "__skip__" ? [] : [id],
    }));
    pulseCart();
    setCarritoAbierto(true);
  };

  const irAConfigurador = () => {
    setMostrarConfig(true);
    window.setTimeout(() => {
      configRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const irASolucionesMedida = () => {
    setMostrarConfig(true);
    window.setTimeout(() => {
      solucionesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const ids = useMemo(() => [...seleccion], [seleccion]);
  const hrefEmpezar = hrefEmpezarConPaquete(ids, perfil);
  const progreso = progresoCotizacion(perfil, ids);
  const desglose = desgloseSolucion(ids);
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

  const paquetesCotizacion = useMemo(
    () => PAQUETES_COTIZABLES.filter((p) => p.id !== "resico-facturacion"),
    []
  );

  const ctaPrincipalLabel = desglose.soloResicoPublico
    ? "Empezar con este paquete →"
    : ids.length > 0
      ? "Solicitar mi cotización →"
      : "Ir a Empezar →";

  /** Progreso como recompensa: no mostrar 0% al llegar. */
  const progresoActivo = progreso.pct > 0;

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
                {desglose.lineas.length || ids.length}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900 leading-tight">
              Tu solución
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {ids.length === 0
                ? "Construyámosla juntos"
                : desglose.soloResicoPublico
                  ? "Precio público RESICO"
                  : "Solicitud de cotización"}
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

      <div className="mb-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Tu solicitud
          </p>
          {progresoActivo && (
            <p className="text-[11px] font-black tabular-nums text-marca-acento">
              {progreso.pct}% completado
            </p>
          )}
        </div>
        {progresoActivo && (
          <div
            className="h-1.5 rounded-full bg-slate-200 overflow-hidden mb-0"
            role="progressbar"
            aria-valuenow={progreso.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso de la solicitud"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-marca-acento transition-[width] duration-300 ease-out"
              style={{ width: `${progreso.pct}%` }}
            />
          </div>
        )}
        <ul className={progresoActivo ? "mt-2.5 space-y-1" : "space-y-1"}>
          {progreso.pasos.map((paso) => (
            <li key={paso.id} className="flex items-center gap-2 text-[11px]">
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black transition-colors duration-200 ${
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
      </div>

      {combinacion && relacionados.length === 0 && (
        <div className="mb-3 rounded-xl bg-violet-50 ring-1 ring-violet-100 px-3 py-2.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-marca-acento">
            {combinacion.titulo}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-600 leading-snug">
            {combinacion.detalle}
          </p>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 max-h-[32vh] lg:max-h-[min(18rem,40vh)]">
        {desglose.lineas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-violet-200/80 bg-violet-50/40 px-3 py-5 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Construyámosla juntos
            </p>
            <p className="mt-1 text-[11px] text-slate-500 leading-snug">
              A medida que elijas lo que necesitas, aparecerá aquí.
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
            {desglose.lineas.map((linea) => (
              <div
                key={linea.id}
                className="rounded-lg bg-white px-2.5 py-2 ring-1 ring-indigo-100 shadow-sm"
              >
                <p className="text-xs font-bold text-slate-900 leading-snug">
                  {linea.label}
                </p>
                {linea.tipo === "publico" && linea.monto != null ? (
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    <span className="font-black tabular-nums text-slate-900">
                      ${linea.monto.toLocaleString("es-MX")}
                    </span>
                    /mes ·{" "}
                    <span className="text-emerald-700 font-semibold">
                      ✓ Precio público
                    </span>
                  </p>
                ) : (
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                    Cotización personalizada
                  </p>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {relacionados.length > 0 && (
        <div className="mt-3 rounded-xl bg-violet-50/80 ring-1 ring-violet-100 p-2.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-marca-acento mb-2">
            También podemos ayudarte con
          </p>
          <ul className="space-y-1.5">
            {relacionados.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 ring-1 ring-violet-100/80"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-900 leading-snug truncate">
                    {s.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(s.id)}
                  className="shrink-0 h-7 px-2.5 rounded-lg bg-marca-navy text-white text-[10px] font-bold hover:bg-marca-acento transition active:scale-[0.97]"
                >
                  + Agregar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {desglose.lineas.length > 0 && (
        <p className="mt-3 text-[11px] text-slate-600 leading-snug">
          {desglose.soloResicoPublico
            ? "Puedes empezar con el precio público RESICO."
            : desglose.incluyeResicoPublico
              ? "Incluye RESICO con precio público; el resto se cotiza a la medida."
              : "Tu solución requiere una cotización personalizada."}
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
        <Link
          href={hrefEmpezar}
          className="inline-flex w-full items-center justify-center gap-1.5 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-marca-acento text-white text-xs font-bold hover:opacity-95 transition shadow-md shadow-indigo-200/50"
        >
          {ctaPrincipalLabel}
        </Link>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center h-9 rounded-xl text-[11px] font-bold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 hover:bg-emerald-100 transition"
        >
          WhatsApp con mi solicitud
        </a>
      </div>
    </>
  );

  const renderPaqueteCard = (
    paq: PaqueteCotizable,
    opts: { destacado?: boolean; entrada?: boolean }
  ) => {
    const on = paqueteCompletoEnCarrito(paq);
    const esPublico = paq.precioDesde != null;
    const preview = paq.previewCount ?? PREVIEW_DEFAULT;
    const abierto = expandidos.has(paq.id);
    const visibles = abierto ? paq.incluye : paq.incluye.slice(0, preview);
    const hayMas = paq.incluye.length > preview;
    const destacado = Boolean(opts.destacado);
    const entrada = Boolean(opts.entrada);

    return (
      <li
        key={paq.id}
        className={`relative rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ${
          destacado || entrada
            ? "z-[1] shadow-2xl shadow-indigo-900/30 ring-2 ring-marca-acento"
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
        <div className="relative p-4 sm:p-5 flex flex-col h-full">
          <div className="flex items-center justify-between gap-2">
            {destacado ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/40 to-marca-acento/50 text-[9px] font-bold uppercase tracking-wider ring-1 ring-white/25">
                ✦ Recomendado para ti
              </span>
            ) : entrada ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-[9px] font-bold uppercase tracking-wider ring-1 ring-white/20">
                Precio público · entrada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-wider ring-1 ring-white/10 text-white/70">
                Solución personalizada
              </span>
            )}
          </div>

          <h3 className="mt-3 text-[15px] sm:text-base font-black leading-snug">
            {paq.nombre}
          </h3>
          <p className="mt-1.5 text-[11px] text-white/80 leading-snug">
            {paq.beneficio}
          </p>

          {esPublico ? (
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums">
                  ${paq.precioDesde!.toLocaleString("es-MX")}
                </span>
                <span className="text-xs text-white/75 font-semibold">
                  / mes
                </span>
              </div>
              <p className="text-[10px] text-white/55 mt-0.5">
                Precio público · IVA incluido
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[12px] font-semibold text-white/70">
              Cotización a la medida · sin precio fijo público
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
                : esPublico
                  ? "bg-gradient-to-r from-indigo-600 to-marca-acento text-white hover:opacity-95 shadow-lg shadow-indigo-900/40"
                  : "bg-white text-marca-navy hover:bg-slate-50 shadow-lg"
            }`}
          >
            {on ? (
              <>
                <span aria-hidden>✓</span> Agregado a tu solución
              </>
            ) : esPublico ? (
              <>
                Empezar con este paquete
                <span aria-hidden>→</span>
              </>
            ) : (
              <>
                Solicitar cotización
                <span aria-hidden>→</span>
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
            Configurador + cotizador · sin compromiso
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
            ¿Qué{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-marca-acento bg-clip-text text-transparent">
              necesitas
            </span>
            ?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Empieza directo si ya sabes qué necesitas, o déjanos orientarte.
            Cotización sin compromiso.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 lg:gap-8 items-start">
          <div className="space-y-6 min-w-0">
            {/* Camino A — entrada rápida RESICO */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1">
                Camino rápido
              </p>
              <h2 className="text-lg font-black text-slate-900 mb-3">
                Ya sé lo que quiero
              </h2>
              <ul className="grid grid-cols-1 max-w-xl">
                {renderPaqueteCard(RESICO, { entrada: true })}
              </ul>
              <p className="mt-3 text-sm text-slate-600 leading-snug max-w-xl">
                ¿No eres RESICO? También tenemos soluciones para empresas,
                nómina y REPSE.{" "}
                <button
                  type="button"
                  onClick={irASolucionesMedida}
                  className="font-bold text-marca-acento hover:underline underline-offset-2"
                >
                  Ver soluciones a medida ↓
                </button>
              </p>
            </div>

            {/* Camino B */}
            <div className="rounded-2xl bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/50 ring-1 ring-violet-200/70 shadow-sm p-4 sm:p-5">
              <h2 className="text-lg font-black text-slate-900">
                ✦ ¿No sabes qué necesitas?
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-2xl">
                Te hacemos 3 preguntas y te recomendamos por dónde empezar.
              </p>
              <button
                type="button"
                onClick={irAConfigurador}
                className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-marca-acento text-white text-sm font-bold hover:opacity-95 transition shadow-md shadow-indigo-200/40"
              >
                Encontrar mi solución →
              </button>
              <p className="mt-2.5 text-[11px] font-semibold text-slate-500">
                ⏱ Rápido y sin compromiso
              </p>
            </div>

            {/* Configurador */}
            <div
              ref={configRef}
              id="configurador"
              className={`space-y-6 scroll-mt-24 ${
                mostrarConfig ? "" : "hidden lg:block lg:opacity-90"
              }`}
            >
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm p-4 sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1">
                  1 · Cuéntanos de ti
                </p>
                <h2 className="text-lg font-black text-slate-900 mb-3">
                  Entendemos tu situación
                </h2>

                <PillDeslizable
                  opciones={[
                    { value: "nuevo", label: "Soy nuevo · orientación" },
                    { value: "fisica", label: "Persona física" },
                    { value: "moral", label: "Persona moral / empresa" },
                  ]}
                  value={tipoPillValue}
                  onChange={(v) => {
                    setTipo(v);
                    setMostrarConfig(true);
                  }}
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
                        Facturación aprox. / mes
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
                        setMostrarConfig(true);
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
                        CFDI aprox. / mes
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
                        setMostrarConfig(true);
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
                      <p className="mt-1 text-[11px] text-slate-500">
                        Usamos esto para recomendar una solución — no para
                        calcular un precio.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recomendación */}
              {mostrarRecomendacion && recomendadoId && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1">
                    2 · Esto creemos que necesitas
                  </p>
                  <h2 className="text-lg font-black text-slate-900 mb-3">
                    Recomendado para ti
                  </h2>
                  <ul className="grid grid-cols-1 max-w-xl">
                    {renderPaqueteCard(
                      PAQUETES_COTIZABLES.find((p) => p.id === recomendadoId)!,
                      { destacado: true }
                    )}
                  </ul>
                </div>
              )}

              {/* Otras soluciones a cotizar */}
              <div
                ref={solucionesRef}
                id="soluciones-a-medida"
                className="scroll-mt-24"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1">
                  Soluciones a medida
                </p>
                <h2 className="text-lg font-black text-slate-900 mb-1">
                  Empresas, nómina y REPSE
                </h2>
                <p className="text-sm text-slate-500 mb-3">
                  Cotización personalizada según tu caso. Agrégalas a tu
                  solicitud.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 items-stretch">
                  {paquetesCotizacion.map((paq) =>
                    renderPaqueteCard(paq, {
                      destacado: paq.id === recomendadoId,
                    })
                  )}
                </ul>
              </div>

              {relacionados.length > 0 && (
                <div className="rounded-2xl bg-white ring-1 ring-violet-100 shadow-sm p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-marca-acento">
                    También podemos ayudarte con
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
                          className="shrink-0 h-8 px-3 rounded-lg bg-marca-navy text-white text-[10px] font-bold hover:bg-marca-acento transition active:scale-[0.97]"
                        >
                          + Agregar a mi solución
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                            ✓ En tu solución
                          </span>
                        )}
                        <div className="p-3.5 flex flex-col h-full">
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex -space-x-2 shrink-0 ${
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
                            className={`mt-3 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-[11px] font-bold transition active:scale-[0.98] ${
                              on
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 cursor-default"
                                : "bg-marca-navy text-white hover:bg-marca-acento shadow-sm shadow-indigo-200/40"
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

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 px-4 py-4 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div
                  className="text-amber-400 text-sm tracking-tight"
                  aria-hidden
                >
                  ★★★★★
                </div>
                <blockquote className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    “Antes vivía con el pendiente del SAT cada mes. Con RDC ya
                    no me preocupo: me avisan, me explican y todo sale a
                    tiempo.”
                  </p>
                  <footer className="mt-1 text-[11px] font-semibold text-slate-500">
                    — Dr. Ramírez · Consultorio dental · Guadalajara
                  </footer>
                </blockquote>
              </div>

              {ids.length > 0 && (
                <div className="rounded-2xl bg-[radial-gradient(circle_at_15%_15%,#1e3a5f_0%,#0f1d2e_55%,#0a1424_100%)] text-white p-5 sm:p-6 ring-1 ring-marca-acento/40">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-marca-acento-soft">
                    ✦ Tu solución está lista
                  </p>
                  <p className="mt-2 text-lg font-black">
                    {desglose.soloResicoPublico
                      ? "RESICO con precio público"
                      : "Listo para solicitar cotización"}
                  </p>
                  <p className="mt-1 text-sm text-white/75">
                    {desglose.lineas.length} elemento
                    {desglose.lineas.length === 1 ? "" : "s"} en tu solicitud
                    {desglose.incluyeResicoPublico && !desglose.soloResicoPublico
                      ? " · incluye RESICO $812/mes (público)"
                      : ""}
                  </p>
                  <Link
                    href={hrefEmpezar}
                    className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-marca-acento text-white text-sm font-bold hover:opacity-95 transition"
                  >
                    {ctaPrincipalLabel}
                  </Link>
                </div>
              )}
            </div>
          </div>

          <aside className="hidden lg:block sticky top-20 self-start rounded-2xl bg-white ring-2 ring-marca-acento shadow-xl shadow-indigo-200/50 p-4">
            {CartBody}
          </aside>
        </div>
      </div>

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
                {desglose.soloResicoPublico
                  ? `RESICO · $${RESICO.precioDesde}/mes`
                  : ids.length > 0
                    ? `${desglose.lineas.length} en tu solicitud`
                    : "Tu solución"}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-marca-acento px-3 py-1 text-xs font-black">
              Ver →
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
