"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CotizarIcon from "@/components/publico/CotizarIcon";
import Fiscalino from "@/components/Fiscalino";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  CFDI_MAX,
  PAQUETES_COTIZABLES,
  PERFIL_VACIO,
  REGIMENES_COTIZABLES_PF,
  REGIMENES_COTIZABLES_PM,
  SERVICIOS_COTIZABLES,
  desgloseSolucion,
  formatearCfdi,
  hrefEmpezarConPaquete,
  serviciosRelacionadosPendientes,
  type PaqueteCotizable,
  type PerfilCotizacion,
  type TipoEmpresaId,
} from "@/lib/servicios-cotizables";
import "./cotizar.css";

const RESICO = PAQUETES_COTIZABLES.find((p) => p.id === "resico-facturacion")!;
const MEDIDA = PAQUETES_COTIZABLES.filter((p) => p.id !== "resico-facturacion");
const SERVICIO_BY_ID = new Map(SERVICIOS_COTIZABLES.map((s) => [s.id, s]));

const CORTO: Record<string, string> = {
  nominas: "Nómina",
  imss: "IMSS",
  sua: "SUA",
  contabilidad: "Contabilidad",
  impuestos: "Impuestos",
  facturacion: "Facturación",
  repse: "REPSE",
  "icsoe-sisub": "ICSOE & SISUB",
  anual: "Anual",
  "anual-fed": "Anual FED",
  constitucion: "Constitución",
  asesoria: "Asesoría",
  regularizacion: "Regularización",
};

function corto(id: string) {
  return CORTO[id] ?? SERVICIO_BY_ID.get(id)?.label ?? id;
}

const GRUPOS_SUELTOS = [
  { titulo: "Personal", ids: ["nominas", "imss", "sua"] },
  {
    titulo: "Impuestos y facturas",
    ids: ["impuestos", "facturacion", "anual", "anual-fed", "regularizacion"],
  },
  { titulo: "Subcontratación", ids: ["repse", "icsoe-sisub"] },
  { titulo: "Empresa", ids: ["contabilidad", "constitucion", "asesoria"] },
] as const;

function formatoPrecio(n: number) {
  return `$${n.toLocaleString("es-MX")}`;
}

function IconPlus({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconStar({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.4 14.7 8.3l6.5.7-4.9 4.4 1.4 6.5L12 16.7 6.3 19.9l1.4-6.5-4.9-4.4 6.5-.7Z"
      />
    </svg>
  );
}

function IconCart({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function Ico({ id, size = 20 }: { id: string; size?: number }) {
  return (
    <span className="cq-ico" data-id={id}>
      <CotizarIcon id={id} size={size} />
    </span>
  );
}

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
  const [bolsaAbierta, setBolsaAbierta] = useState(false);
  const [pulso, setPulso] = useState(false);
  const [bolsaMovil, setBolsaMovil] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setBolsaMovil(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Mismo lock que el header: evita pelear overflow:hidden a mano en body.
  useScrollLock(bolsaAbierta && bolsaMovil);

  useEffect(() => {
    if (!bolsaAbierta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBolsaAbierta(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bolsaAbierta]);

  const latir = () => {
    setPulso(true);
    window.setTimeout(() => setPulso(false), 420);
  };

  const aplicarPerfilPaquete = (paq: PaqueteCotizable) => {
    if (!paq.perfilSugerido) return;
    setPerfil((p) => ({
      ...p,
      tipo: paq.perfilSugerido?.tipo ?? p.tipo,
      regimenes: paq.perfilSugerido?.regimenes?.length
        ? [...new Set([...p.regimenes, ...(paq.perfilSugerido.regimenes ?? [])])]
        : p.regimenes,
    }));
  };

  const agregarPaquete = (paq: PaqueteCotizable) => {
    const ya = paq.servicioIds.every((id) => seleccion.has(id));
    if (ya) return;
    setSeleccion((prev) => {
      const next = new Set(prev);
      for (const id of paq.servicioIds) next.add(id);
      return next;
    });
    aplicarPerfilPaquete(paq);
    latir();
    setBolsaAbierta(true);
  };

  const quitarPaquete = (paq: PaqueteCotizable) => {
    setSeleccion((prev) => {
      const next = new Set(prev);
      for (const id of paq.servicioIds) next.delete(id);
      return next;
    });
  };

  const toggleServicio = (id: string) => {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        latir();
        setBolsaAbierta(true);
      }
      return next;
    });
  };

  const quitarLinea = (id: string) => {
    const paq = PAQUETES_COTIZABLES.find((p) => p.id === id);
    if (paq) quitarPaquete(paq);
    else {
      setSeleccion((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const vaciar = () => setSeleccion(new Set());

  const setCfdi = (n: number) => {
    const v = Math.min(CFDI_MAX, Math.max(1, Math.round(n)));
    setPerfil((p) => ({
      ...p,
      cfdi: v,
      cfdiMas50: v >= CFDI_MAX,
    }));
  };

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
  };

  const ids = useMemo(() => [...seleccion], [seleccion]);
  const hrefEmpezar = hrefEmpezarConPaquete(ids, perfil);
  const desglose = desgloseSolucion(ids);
  const relacionados = serviciosRelacionadosPendientes(ids, 3);
  const nLineas = desglose.lineas.length;
  const hayCosas = nLineas > 0;
  const paqueteEnBolsa = (paq: PaqueteCotizable) =>
    paq.servicioIds.every((id) => seleccion.has(id));

  const ctaLabel = desglose.soloResicoPublico
    ? "Continuar"
    : "Pedir cotización";

  const totalLabel = desglose.soloResicoPublico
    ? `${formatoPrecio(RESICO.precioDesde!)} / mes`
    : desglose.incluyeResicoPublico
      ? `${formatoPrecio(RESICO.precioDesde!)} + cotización`
      : hayCosas
        ? "Se cotiza"
        : "—";

  const dockLabel = desglose.soloResicoPublico
    ? `Bolsa · ${formatoPrecio(RESICO.precioDesde!)}`
    : hayCosas
      ? `Bolsa · ${nLineas}`
      : "Bolsa vacía";

  const renderBolsa = (opts?: { cerrar?: boolean }) => (
    <div className="cq-bag">
      <div className="cq-bag-head">
        <h2>
          <span className="cq-cart" aria-hidden>
            <IconCart size={22} />
          </span>
          Bolsa
          <span className={`cq-count${pulso ? " cq-pulse" : ""}`}>
            {nLineas}
          </span>
        </h2>
        {hayCosas ? (
          <button type="button" className="cq-vaciar" onClick={vaciar}>
            Vaciar
          </button>
        ) : null}
        {opts?.cerrar ? (
          <button
            type="button"
            className="cq-close"
            onClick={() => setBolsaAbierta(false)}
            aria-label="Cerrar bolsa"
          >
            ×
          </button>
        ) : null}
      </div>

      {!hayCosas ? (
        <div className="cq-empty">
          <Fiscalino mood="sleeping" size={120} className="cq-owl" />
          <p>
            Aún no hay nada aquí.
            <span>Un paquete o un servicio suelto.</span>
          </p>
        </div>
      ) : (
        <ul className="cq-lines">
          {desglose.lineas.map((linea) => (
            <li key={linea.id} className="cq-line">
              <Ico id={linea.id} size={18} />
              <strong>{linea.label}</strong>
              <span
                className="cq-line-price"
                data-kind={linea.tipo === "publico" ? "price" : "ask"}
              >
                {linea.tipo === "publico" && linea.monto
                  ? formatoPrecio(linea.monto)
                  : "Se cotiza"}
              </span>
              <button
                type="button"
                className="cq-icon-btn"
                onClick={() => quitarLinea(linea.id)}
                aria-label={`Sacar ${linea.label} de la bolsa`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {relacionados.length > 0 ? (
        <div className="cq-suggest">
          <p>¿Le sumamos esto?</p>
          <div className="cq-suggest-row">
            {relacionados.map((s) => (
              <button
                key={s.id}
                type="button"
                className="cq-suggest-add"
                onClick={() => toggleServicio(s.id)}
              >
                <span aria-hidden>+</span>
                {corto(s.id)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="cq-foot">
        {hayCosas ? (
          <div className="cq-total">
            <span>{desglose.soloResicoPublico ? "Total" : "Tu paquete"}</span>
            <b>{totalLabel}</b>
          </div>
        ) : null}
        {hayCosas ? (
          <Link href={hrefEmpezar} className="cq-go">
            {ctaLabel}
          </Link>
        ) : (
          <span className="cq-go" aria-disabled="true">
            Agrega algo a la bolsa
          </span>
        )}
        <p className="cq-note">
          {desglose.soloResicoPublico
            ? "IVA incluido. Empiezas cuando quieras."
            : "El único precio público es RESICO. El resto lo armamos a tu medida."}
        </p>
      </div>
    </div>
  );

  return (
    <section className="cq-page" id="armar-cotizacion">
      <div className="cq-wrap">
        <header className="cq-head">
          <h1 className="cq-title">Arma tu paquete</h1>
          <p className="cq-lead">Tu presupuesto, a tu medida.</p>
        </header>

        <div className="cq-store">
          <div className="cq-shelf">
            <div className="cq-who" role="group" aria-label="Tipo de contribuyente">
              {(
                [
                  ["nuevo", "Empiezo"],
                  ["fisica", "Persona física"],
                  ["moral", "Persona moral"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className="cq-chip"
                  aria-pressed={perfil.tipo === id}
                  onClick={() => setTipo(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <article className="cq-volume">
              <div className="cq-volume-head">
                <Ico id="facturacion" size={20} />
                <div className="cq-volume-copy">
                  <h2>¿Cuántas facturas emites al mes?</h2>
                  <b>{formatearCfdi(perfil)}</b>
                </div>
              </div>
              <div
                className="cq-range-wrap"
                style={{
                  ["--cq-pct" as string]: `${
                    ((Math.max(1, perfil.cfdiMas50 ? CFDI_MAX : perfil.cfdi) - 1) /
                      (CFDI_MAX - 1)) *
                    100
                  }%`,
                }}
              >
                <span className="cq-range-track" aria-hidden />
                <span className="cq-range-fill" aria-hidden />
                <input
                  className="cq-range"
                  type="range"
                  min={1}
                  max={CFDI_MAX}
                  step={1}
                  value={perfil.cfdiMas50 ? CFDI_MAX : perfil.cfdi}
                  onChange={(e) => setCfdi(Number(e.target.value))}
                  aria-label="¿Cuántas facturas emites al mes?"
                  aria-valuetext={formatearCfdi(perfil)}
                />
              </div>
            </article>

            <article className="cq-deal">
              <span className="cq-fav" aria-hidden>
                <IconStar />
              </span>
              <div className="cq-deal-top">
                <Ico id={RESICO.id} size={26} />
                <div>
                  <h2>{RESICO.nombre}</h2>
                  <p className="cq-deal-tag">{RESICO.tagline}</p>
                  <p className="cq-hot">
                    <i className="cq-live" aria-hidden />
                    Lo más solicitado
                  </p>
                </div>
              </div>
              <p className="cq-price">
                {formatoPrecio(RESICO.precioDesde!)}
                <span>
                  <i className="cq-live" aria-hidden />
                  IVA incluido / mes
                </span>
              </p>
              <p className="cq-deal-note">
                El único paquete con precio a la vista. El resto se cotiza a
                tu medida.
              </p>
              <div className="cq-deal-actions">
                {paqueteEnBolsa(RESICO) ? (
                  <button
                    type="button"
                    className="cq-out"
                    onClick={() => quitarPaquete(RESICO)}
                  >
                    Sacar de la bolsa
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cq-add"
                    onClick={() => agregarPaquete(RESICO)}
                  >
                    <IconCart size={16} />
                    Agregar a la bolsa
                  </button>
                )}
              </div>
              <details className="cq-incluye">
                <summary>Qué incluye</summary>
                <ul>
                  {RESICO.incluye.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            </article>

            <div>
              <header className="cq-block">
                <h2>Paquetes</h2>
                <p>Varios servicios juntos, un solo mes.</p>
              </header>
              <ul className="cq-grid">
                {MEDIDA.map((paq) => {
                  const on = paqueteEnBolsa(paq);
                  return (
                    <li
                      key={paq.id}
                      className="cq-tile cq-pack"
                      data-id={paq.id}
                      data-on={on ? "true" : "false"}
                    >
                      <div className="cq-tile-head">
                        <span className="cq-stack" aria-hidden>
                          {paq.servicioIds.slice(0, 3).map((id) => (
                            <Ico key={id} id={id} size={15} />
                          ))}
                        </span>
                        <div>
                          <h3>{paq.nombre}</h3>
                          <span className="cq-pack-n">
                            {paq.servicioIds.length} servicios
                          </span>
                        </div>
                      </div>
                      <p>{paq.tagline}</p>
                      <ul className="cq-bits">
                        {paq.servicioIds.map((id) => (
                          <li key={id}>{corto(id)}</li>
                        ))}
                      </ul>
                      <div className="cq-tile-foot">
                        <span className="cq-ask">Se cotiza</span>
                        {on ? (
                          <button
                            type="button"
                            className="cq-out"
                            onClick={() => quitarPaquete(paq)}
                          >
                            Sacar
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="cq-add"
                            onClick={() => agregarPaquete(paq)}
                          >
                            <IconPlus />
                            Agregar paquete
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <header className="cq-block">
                <h2>Servicios sueltos</h2>
                <p>Uno por uno, sin armar paquete.</p>
              </header>
              <div className="cq-sku-groups">
                {GRUPOS_SUELTOS.map((grupo) => {
                  const items = grupo.ids
                    .map((id) => SERVICIO_BY_ID.get(id))
                    .filter((s): s is NonNullable<typeof s> => Boolean(s));
                  if (items.length === 0) return null;
                  return (
                    <section
                      key={grupo.titulo}
                      className="cq-sku-group"
                      data-n={items.length}
                    >
                      <h3>{grupo.titulo}</h3>
                      <ul className="cq-skus">
                        {items.map((s) => {
                          const on = seleccion.has(s.id);
                          return (
                            <li
                              key={s.id}
                              className="cq-sku"
                              data-id={s.id}
                              data-on={on ? "true" : "false"}
                            >
                              <Ico id={s.id} size={18} />
                              <div>
                                <h3>{s.label}</h3>
                                <p>{s.hint}</p>
                              </div>
                              {on ? (
                                <button
                                  type="button"
                                  className="cq-out"
                                  onClick={() => toggleServicio(s.id)}
                                >
                                  Sacar
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="cq-add"
                                  onClick={() => toggleServicio(s.id)}
                                >
                                  <IconPlus />
                                  Agregar
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="cq-bag-slot" aria-label="Tu bolsa">
            {renderBolsa()}
          </aside>
        </div>
      </div>

      <div className="cq-dock">
        <button
          type="button"
          className="cq-dock-open"
          onClick={() => setBolsaAbierta(true)}
        >
          <span className="cq-cart" aria-hidden>
            <IconCart size={18} />
          </span>
          <span className={`cq-count${pulso ? " cq-pulse" : ""}`}>{nLineas}</span>
          {dockLabel}
        </button>
        {hayCosas ? (
          <Link href={hrefEmpezar} className="cq-go">
            {ctaLabel}
          </Link>
        ) : null}
      </div>

      <div
        className="cq-sheet-root"
        data-open={bolsaAbierta ? "true" : "false"}
      >
        <button
          type="button"
          className="cq-backdrop"
          aria-label="Cerrar bolsa"
          onClick={() => setBolsaAbierta(false)}
        />
        <div className="cq-sheet" role="dialog" aria-label="Tu bolsa">
          <span className="cq-handle" aria-hidden />
          {renderBolsa({ cerrar: true })}
        </div>
      </div>
    </section>
  );
}
