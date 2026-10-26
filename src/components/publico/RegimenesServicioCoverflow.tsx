"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Fiscalino from "@/components/Fiscalino";
import EspecialidadIcon from "@/components/publico/EspecialidadIcon";
import HonorariosShowcase from "@/components/publico/HonorariosShowcase";
import RegimenIcon from "@/components/publico/RegimenIcon";
import PillDeslizable from "@/components/ui/PillDeslizable";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { TONOS_ESPECIALIDAD } from "@/lib/especialidad-tonos";
import { TONOS_REGIMEN } from "@/lib/regimen-tonos";
import {
  RECIBOS_ALBUM,
  type AlbumSlug,
  type ReciboAlbum,
} from "@/lib/servicios-honorarios-album";
import {
  ESPECIALIDADES_PAGINA,
  ESPECIALIDADES_SERVICIO,
  SLUGS_ESPECIALIDAD,
  type EspecialidadSlug,
} from "@/lib/servicios-especialidades";
import {
  REGIMENES_SERVICIO,
  SLUGS_REGIMEN_PF,
  SLUGS_REGIMEN_PM,
  type RegimenSlug,
} from "@/lib/servicios-regimenes";
import "./servicios-coverflow.css";

type TabServicios = "pf" | "pm" | "otras";

const PILL_OPCIONES: { value: TabServicios; label: string }[] = [
  { value: "pf", label: "Personas físicas" },
  { value: "pm", label: "Personas morales" },
  { value: "otras", label: "Otras especialidades" },
];

const TAB_HASH: Record<TabServicios, string> = {
  pf: "#personas-fisicas",
  pm: "#personas-morales",
  otras: "#otras-especialidades",
};

const RESICO_INDEX = SLUGS_REGIMEN_PF.indexOf("resico");
const CARD_SPACING = 196;
const CARD_SPACING_REDUCED = 168;
const DRAG_THRESHOLD = 10;

type AlbumVisual = {
  slug: AlbumSlug;
  titulo: string;
  codigo: string;
  campo: string;
  chispa: string;
  face: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
};

function hexDeClase(clase: string, fallback: string) {
  const m = clase.match(/#([0-9A-Fa-f]{6})/i);
  return m ? `#${m[1]}` : fallback;
}

function hashToTab(hash: string): TabServicios {
  if (hash === "#personas-morales") return "pm";
  if (hash === "#otras-especialidades") return "otras";
  return "pf";
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function wrappedOffset(cardIndex: number, activeIndex: number, total: number): number {
  let offset = cardIndex - activeIndex;
  const half = total / 2;
  if (offset > half) offset -= total;
  if (offset < -half) offset += total;
  return offset;
}

function albumDeRegimen(slug: RegimenSlug): AlbumVisual {
  const regimen = REGIMENES_SERVICIO[slug];
  const tono = TONOS_REGIMEN[slug];
  return {
    slug,
    titulo: regimen.titulo,
    codigo: `SAT ${regimen.codigoSat}`,
    campo: tono.campo,
    chispa: tono.chispa,
    face: hexDeClase(tono.iconBg, "#E8EEF4"),
    iconBg: tono.iconBg,
    iconColor: tono.iconColor,
    icon: <RegimenIcon slug={slug} size={32} className={tono.iconColor} />,
  };
}

function albumDeEspecialidad(slug: EspecialidadSlug): AlbumVisual {
  const especialidad = ESPECIALIDADES_SERVICIO[slug];
  const pagina = ESPECIALIDADES_PAGINA[slug];
  const tono = TONOS_ESPECIALIDAD[slug];
  return {
    slug,
    titulo: especialidad.titulo,
    codigo: pagina.autoridadCorto,
    campo: tono.campo,
    chispa: tono.chispa,
    face: hexDeClase(tono.iconBg, "#F6E9C8"),
    iconBg: tono.iconBg,
    iconColor: tono.iconColor,
    icon: <EspecialidadIcon slug={slug} size={32} className={tono.iconColor} />,
  };
}

const ALBUMES_PF = SLUGS_REGIMEN_PF.map(albumDeRegimen);
const ALBUMES_PM = SLUGS_REGIMEN_PM.map(albumDeRegimen);
const ALBUMES_OTRAS = SLUGS_ESPECIALIDAD.map(albumDeEspecialidad);

function coverflowStyle(
  offset: number,
  reduced: boolean,
  dragPx: number,
  instant: boolean,
): React.CSSProperties {
  const abs = Math.abs(offset);
  const spacing = reduced ? CARD_SPACING_REDUCED : CARD_SPACING;
  const x = offset * spacing + dragPx;
  const rotateY = offset * -38;
  const scale = offset === 0 ? 1 : abs === 1 ? 0.86 : 0.72;
  const translateZ = offset === 0 ? 0 : -abs * 55;
  const zIndex = 30 - abs * 8;
  const visible = abs <= 2;

  return {
    transform: reduced
      ? `translate3d(calc(-50% + ${x}px), -50%, 0) scale(${offset === 0 ? 1 : 0.88})`
      : `translate3d(calc(-50% + ${x}px), -50%, ${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
    zIndex,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? "auto" : "none",
    transition: instant
      ? "none"
      : reduced
        ? "transform 0.25s ease, opacity 0.25s ease"
        : "transform 420ms var(--ease-out), opacity 180ms ease",
  };
}

function AlbumCover({ album, active }: { album: AlbumVisual; active: boolean }) {
  return (
    <div
      className="album-cover-face"
      style={{ background: album.face }}
      data-active={active ? "true" : undefined}
    >
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white">
        {album.icon}
      </span>
      <p
        className="mt-5 text-[11px] font-semibold tracking-[0.18em] uppercase"
        style={{ color: album.campo }}
      >
        {album.codigo}
      </p>
      <h3
        className="mt-2 text-[1.4rem] font-black leading-tight tracking-tight sm:text-[1.6rem]"
        style={{ color: album.campo }}
      >
        {album.titulo}
      </h3>
    </div>
  );
}

function BoletoHonorarios({
  recibo,
  album,
}: {
  recibo: ReciboAlbum;
  album: AlbumVisual;
}) {
  return (
    <div key={recibo.slug} className="album-ticket">
      <div className="boleto">
        <span className="boleto-notch is-top" aria-hidden />
        <span className="boleto-notch is-bottom" aria-hidden />
        <span className="boleto-perf" aria-hidden>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} />
          ))}
        </span>

        <div className="boleto-main">
          <div className="flex items-start gap-4">
            <Fiscalino mood={recibo.mood} size={88} className="shrink-0 [animation:none]" />
            <p className="pt-2 text-[17px] font-semibold leading-snug text-marca-navy">
              {recibo.frase}
            </p>
          </div>
          <p className="mt-6 text-[clamp(1.6rem,3vw,2.4rem)] font-black leading-tight tracking-tight text-marca-navy">
            {album.titulo}
          </p>
          <ul className="mt-5 grid list-none gap-2 sm:grid-cols-2">
            {recibo.incluye.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[15px] leading-snug text-marca-navy">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marca-navy" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href={recibo.guia.href}
            className="album-cta mt-6 inline-flex text-sm font-bold text-[#7c3aed]"
          >
            {recibo.guia.label} →
          </Link>
        </div>

        <div className="boleto-stub">
          {recibo.precio.tipo === "publico" ? (
            <>
              <p className="album-monto text-[clamp(2.6rem,6vw,4.2rem)] font-black leading-none tracking-tight text-marca-navy">
                {recibo.precio.monto}
              </p>
              <p className="mt-2 text-sm font-semibold text-marca-navy/55">
                {recibo.precio.periodo} · {recibo.precio.nota}
              </p>
            </>
          ) : (
            <>
              <p className="text-[clamp(1.6rem,3.4vw,2.2rem)] font-black leading-tight tracking-tight text-marca-navy">
                {recibo.precio.etiqueta}
              </p>
              <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-marca-navy/55">
                {recibo.precio.nota}
              </p>
            </>
          )}
          <Link
            href={recibo.cta.href}
            className="album-cta mt-6 inline-flex w-full items-center justify-center rounded-full bg-marca-navy px-4 py-3.5 text-sm font-bold text-white"
          >
            {recibo.cta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

function CoverflowAlbums({
  items,
  active,
  onActive,
  ariaLabel,
}: {
  items: AlbumVisual[];
  active: number;
  onActive: (index: number) => void;
  ariaLabel: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [instant, setInstant] = useState(false);
  const skipClick = useRef(false);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    lastX: number;
    lastT: number;
    velocity: number;
    moved: boolean;
  } | null>(null);

  const goTo = useCallback(
    (index: number, fromKeyboard = false) => {
      if (fromKeyboard) {
        setInstant(true);
        onActive(mod(index, items.length));
        requestAnimationFrame(() => setInstant(false));
        return;
      }
      onActive(mod(index, items.length));
    },
    [items.length, onActive],
  );

  const goPrev = useCallback((fromKeyboard = false) => {
    goTo(active - 1, fromKeyboard);
  }, [active, goTo]);

  const goNext = useCallback((fromKeyboard = false) => {
    goTo(active + 1, fromKeyboard);
  }, [active, goTo]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      lastX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || e.pointerId !== state.pointerId) return;
    const dx = e.clientX - state.startX;
    const now = performance.now();
    state.velocity = (e.clientX - state.lastX) / Math.max(1, now - state.lastT);
    state.lastX = e.clientX;
    state.lastT = now;
    if (!state.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      state.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    setDragPx(dx);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || e.pointerId !== state.pointerId) return;
    drag.current = null;
    skipClick.current = state.moved;
    const dx = state.moved ? e.clientX - state.startX : 0;
    const projected = dx + state.velocity * 220;
    setDragging(false);
    setDragPx(0);
    if (projected > 80) goPrev();
    else if (projected < -80) goNext();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev(true);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext(true);
    }
  };

  return (
    <div
      className={`relative mx-auto max-w-4xl ${dragging ? "is-dragging" : ""} ${instant ? "is-instant" : ""}`}
      aria-label={ariaLabel}
      aria-roledescription="carrusel"
    >
      <button
        type="button"
        onClick={() => goPrev()}
        aria-label="Álbum anterior"
        className="album-btn album-arrow absolute left-0 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full sm:flex lg:hidden sm:-left-1 sm:h-11 sm:w-11"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => goNext()}
        aria-label="Siguiente álbum"
        className="album-btn album-arrow absolute right-0 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full sm:flex lg:hidden sm:-right-1 sm:h-11 sm:w-11"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <div
        role="listbox"
        tabIndex={0}
        aria-activedescendant={`album-${items[active]?.slug}`}
        className="relative mx-auto h-[300px] max-w-full overflow-x-clip overflow-y-visible px-10 [touch-action:pan-y] sm:h-[320px] sm:px-14"
        style={{ perspective: reduced ? undefined : "1200px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          {items.map((album, i) => {
            const offset = wrappedOffset(i, active, items.length);
            const isCenter = offset === 0;
            return (
              <article
                key={album.slug}
                id={`album-${album.slug}`}
                role="option"
                aria-selected={isCenter}
                className="album-cover absolute left-1/2 top-1/2 h-[260px] w-[220px] sm:h-[280px] sm:w-[240px]"
                style={coverflowStyle(offset, reduced, dragPx, instant)}
              >
                <button
                  type="button"
                  className="album-btn h-full w-full"
                  aria-label={
                    isCenter ? album.titulo : `Ver ${album.titulo}`
                  }
                  onClick={() => {
                    if (skipClick.current) {
                      skipClick.current = false;
                      return;
                    }
                    if (!isCenter) onActive(i);
                  }}
                >
                  <AlbumCover album={album} active={isCenter} />
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        {items.map((album, i) => (
          <button
            key={album.slug}
            type="button"
            aria-label={`Ver ${album.titulo}`}
            aria-current={i === active ? "true" : undefined}
            onClick={() => onActive(i)}
            className="album-btn album-dot"
          />
        ))}
      </div>
    </div>
  );
}

export default function RegimenesServicioCoverflow() {
  const [tab, setTab] = useState<TabServicios>("pf");
  const [active, setActive] = useState(RESICO_INDEX);

  useEffect(() => {
    const sync = () => {
      const next = hashToTab(window.location.hash);
      setTab(next);
      setActive(next === "pf" ? RESICO_INDEX : 0);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const onTabChange = useCallback((next: TabServicios) => {
    setTab(next);
    setActive(next === "pf" ? RESICO_INDEX : 0);
    window.history.replaceState(null, "", `/servicios${TAB_HASH[next]}`);
  }, []);

  const albums = tab === "pf" ? ALBUMES_PF : tab === "pm" ? ALBUMES_PM : ALBUMES_OTRAS;
  const current = albums[active] ?? albums[0];
  const recibo = RECIBOS_ALBUM[current.slug];

  useEffect(() => {
    const node = document.querySelector<HTMLElement>(".album-name[aria-current='true']");
    node?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [active, tab]);

  return (
    <div
      className="album-page"
      style={{
        ["--album-wash" as string]: current.campo,
        ["--album-spark" as string]: current.chispa,
      }}
    >
      <section id="regimenes-servicio" className="relative scroll-mt-24 pb-10 pt-12 sm:pb-14 sm:pt-16">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h1 className="album-wordmark text-white">Servicios y honorarios</h1>
          <p className="mt-5 max-w-xl text-[clamp(1.15rem,2.4vw,1.7rem)] font-semibold leading-snug tracking-tight text-[var(--album-spark)]">
            Gira tu régimen. El recibo cambia con el álbum.
          </p>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--album-muted)]">
            El único precio público es RESICO. El resto se cotiza en 24 horas.
          </p>

          <div className="mb-10 mt-8 px-2 sm:flex sm:justify-center">
            <PillDeslizable
              opciones={PILL_OPCIONES}
              value={tab}
              onChange={onTabChange}
              compact
              scrollable
              acento="claro"
            />
          </div>

          <div
            id={tab === "otras" ? "otras-especialidades" : undefined}
            className="grid items-start gap-8 lg:grid-cols-12"
          >
            <nav
              className="album-index flex gap-5 overflow-x-auto pb-2 lg:col-span-4 lg:block lg:overflow-visible lg:pb-0"
              aria-label="Índice de servicios"
            >
              {albums.map((album, i) => (
                <button
                  key={album.slug}
                  type="button"
                  className="album-name shrink-0 whitespace-nowrap lg:whitespace-normal"
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => setActive(i)}
                >
                  {album.titulo}
                </button>
              ))}
            </nav>

            <div className="lg:col-span-8">
              <CoverflowAlbums
                key={tab}
                items={albums}
                active={active}
                onActive={setActive}
                ariaLabel={
                  tab === "pf"
                    ? "Regímenes persona física"
                    : tab === "pm"
                      ? "Regímenes persona moral"
                      : "Otras especialidades"
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 pb-6 sm:px-6 lg:px-8" aria-live="polite">
        <div className="mx-auto max-w-5xl">
          <BoletoHonorarios recibo={recibo} album={current} />
          <p className="mt-5 text-xs leading-relaxed text-[var(--album-spark)]">
            Los honorarios definitivos se confirman tras revisar tu situación (volumen de operaciones,
            régimen, empleados, complementos). Sin sorpresas.
          </p>
        </div>
      </section>

      <div className="album-fade" aria-hidden />

      <HonorariosShowcase />
    </div>
  );
}

export function AlbumCtaBanda() {
  return (
    <Link href="/cotizar" className="album-banda">
      <p className="absolute left-5 top-5 m-0 max-w-xs text-[17px] font-semibold leading-snug text-white">
        Arma tu paquete. Portal incluido. Sin compromiso.
      </p>
      <svg
        className="absolute right-5 top-5"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path d="M7 17 17 7M8 7h9v9" />
      </svg>
      <p className="album-banda-verb">COTIZAR</p>
    </Link>
  );
}
