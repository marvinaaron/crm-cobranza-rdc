"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  activarPushParaCliente,
  estadoPermisoPush,
  pushActivoEnDispositivo,
  pushSoportado,
} from "@/lib/push/client";

/**
 * Tour de bienvenida del portal del cliente.
 *
 * Aparece automáticamente la PRIMERA vez que un cliente entra al portal
 * (se recuerda por cliente en localStorage) y está enfocado en las dos
 * acciones que más nos importan: instalar el portal como app y activar las
 * notificaciones. Se puede volver a abrir manualmente disparando el evento
 * global `rdc:abrir-onboarding` (hay un botón para ello en Perfil), lo que
 * permite probarlo cuantas veces se quiera.
 */

const STORAGE_PREFIX = "rdc-portal-tour-v1-";
export const EVENTO_ABRIR_ONBOARDING = "rdc:abrir-onboarding";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Plataforma = "ios" | "android" | "escritorio";

function detectarPlataforma(): Plataforma {
  if (typeof navigator === "undefined") return "escritorio";
  const ua = navigator.userAgent || "";
  const esIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (esIOS) return "ios";
  if (/android/i.test(ua)) return "android";
  return "escritorio";
}

function estaInstalada(): boolean {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone =
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(mm || iosStandalone);
}

/* ----------------------------- Íconos ----------------------------- */

const IconChevron = ({ flip }: { flip?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={flip ? { transform: "scaleX(-1)" } : undefined}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconCheck = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconApp = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <path d="M12 18h.01" />
  </svg>
);

const IconCampana = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const IconBrujula = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const IconCohete = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const IconCompartir = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16V4" />
    <path d="m8 8 4-4 4 4" />
    <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5" />
  </svg>
);

const IconMas = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/* ------------------------- Componente ------------------------- */

const SECCIONES = [
  { nombre: "Inicio", desc: "Tu resumen al instante: qué falta y qué está al día." },
  { nombre: "Mi Cuenta", desc: "Tu cumplimiento mensual y situación fiscal ante el SAT." },
  { nombre: "Honorarios", desc: "Lo que debes, paga en línea y sube tus comprobantes." },
  { nombre: "Solicitudes", desc: "Pídenos trámites y dales seguimiento sin perder nada." },
];

export default function PortalOnboarding({ clienteId }: { clienteId: number }) {
  const [abierto, setAbierto] = useState(false);
  const [paso, setPaso] = useState(0);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [instalada, setInstalada] = useState(false);
  const [pushEstado, setPushEstado] = useState<
    "inactivo" | "trabajando" | "activo" | "denegado" | "no-soportado"
  >("inactivo");

  const plataforma = useMemo(detectarPlataforma, []);
  const storageKey = `${STORAGE_PREFIX}${clienteId}`;

  const verificarPush = useCallback(async () => {
    if (!pushSoportado()) {
      setPushEstado("no-soportado");
      return;
    }
    const permiso = estadoPermisoPush();
    if (permiso === "denied") {
      setPushEstado("denegado");
      return;
    }
    const activo = await pushActivoEnDispositivo();
    setPushEstado(activo ? "activo" : "inactivo");
  }, []);

  // Mostrar automáticamente la primera vez; escuchar el evento de reapertura.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let visto = false;
    try {
      visto = Boolean(localStorage.getItem(storageKey));
    } catch {}
    let t: ReturnType<typeof setTimeout> | undefined;
    if (!visto) {
      t = setTimeout(() => {
        setPaso(0);
        setAbierto(true);
      }, 900);
    }
    const abrir = () => {
      setPaso(0);
      setAbierto(true);
    };
    window.addEventListener(EVENTO_ABRIR_ONBOARDING, abrir);
    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener(EVENTO_ABRIR_ONBOARDING, abrir);
    };
  }, [storageKey]);

  // Capturar el prompt de instalación de la PWA (Android / escritorio).
  useEffect(() => {
    if (typeof window === "undefined") return;
    setInstalada(estaInstalada());
    void verificarPush();
    const onVis = () => void verificarPush();
    document.addEventListener("visibilitychange", onVis);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalada(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [verificarPush]);

  // Al llegar al paso de notificaciones, revalidar por si ya las activó antes.
  useEffect(() => {
    if (!abierto || paso !== 2) return;
    void verificarPush();
  }, [abierto, paso, verificarPush]);

  const cerrar = useCallback(() => {
    try {
      localStorage.setItem(storageKey, new Date().toISOString());
    } catch {}
    setAbierto(false);
  }, [storageKey]);

  const instalarApp = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const res = await deferred.userChoice;
      if (res.outcome === "accepted") setInstalada(true);
      setDeferred(null);
    } catch {}
  }, [deferred]);

  const activarNotis = useCallback(async () => {
    setPushEstado("trabajando");
    const r = await activarPushParaCliente();
    if (r.ok) {
      setPushEstado("activo");
      return;
    }
    if (r.razon === "denegado") setPushEstado("denegado");
    else if (r.razon === "no-soportado") setPushEstado("no-soportado");
    else setPushEstado("inactivo");
  }, []);

  if (!abierto) return null;

  const pasos = [
    /* 0 · Bienvenida */
    {
      icono: <IconCohete />,
      eyebrow: "Bienvenido a tu portal",
      titulo: "Tu despacho, en tu bolsillo",
      cuerpo: (
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Desde aquí ves tu cumplimiento fiscal, tus honorarios y puedes pedirnos
          trámites en segundos. Te damos un recorrido de 30 segundos para dejarlo
          listo. ¿Empezamos?
        </p>
      ),
    },
    /* 1 · Instalar como app */
    {
      icono: <IconApp />,
      eyebrow: "Paso 1 de 3",
      titulo: instalada ? "¡Ya tienes la app! 🎉" : "Instala el portal como app",
      cuerpo: instalada ? (
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Detectamos que ya abriste el portal como aplicación. Así entras de un
          toque desde tu pantalla de inicio, sin buscar la dirección.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Tenla a un toque en tu pantalla de inicio, como cualquier app. Es lo
            que permite recibir avisos y entrar más rápido.
          </p>
          {plataforma === "ios" ? (
            <div className="rounded-2xl bg-[var(--portal-navy-soft)] dark:bg-[var(--portal-navy-soft)]0/10 ring-1 ring-[var(--portal-navy-border)] dark:ring-[var(--portal-navy-border)] p-4 space-y-2.5">
              <Instruccion
                n={1}
                texto={
                  <>
                    Toca <IconCompartir /> <b>Compartir</b> en la barra de Safari.
                  </>
                }
              />
              <Instruccion
                n={2}
                texto={
                  <>
                    Elige <b>“Añadir a pantalla de inicio”</b>.
                  </>
                }
              />
              <Instruccion n={3} texto={<>Confirma con <b>“Añadir”</b>.</>} />
            </div>
          ) : deferred ? (
            <button
              type="button"
              onClick={() => void instalarApp()}
              className="w-full py-3 rounded-2xl bg-[var(--portal-navy)] text-white text-sm font-bold hover:bg-[var(--portal-navy-hover)] transition-colors"
            >
              Instalar app ahora
            </button>
          ) : plataforma === "android" ? (
            <div className="rounded-2xl bg-[var(--portal-navy-soft)] dark:bg-[var(--portal-navy-soft)]0/10 ring-1 ring-[var(--portal-navy-border)] dark:ring-[var(--portal-navy-border)] p-4 space-y-2.5">
              <Instruccion
                n={1}
                texto={
                  <>
                    Abre el menú <IconMas /> de Chrome (arriba a la derecha).
                  </>
                }
              />
              <Instruccion
                n={2}
                texto={
                  <>
                    Toca <b>“Instalar app”</b> o <b>“Añadir a pantalla principal”</b>.
                  </>
                }
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-[var(--portal-navy-soft)] dark:bg-[var(--portal-navy-soft)]0/10 ring-1 ring-[var(--portal-navy-border)] dark:ring-[var(--portal-navy-border)] p-4">
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Busca el ícono de <b>instalar</b> en la barra de direcciones de tu
                navegador y confírmalo. Así abrirás el portal como una app de
                escritorio.
              </p>
            </div>
          )}
        </div>
      ),
    },
    /* 2 · Notificaciones */
    {
      icono: <IconCampana />,
      eyebrow: "Paso 2 de 3",
      titulo:
        pushEstado === "activo"
          ? "¡Notificaciones listas!"
          : "Activa tus notificaciones",
      cuerpo: (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {pushEstado === "activo"
              ? "Ya recibirás avisos cuando tu factura esté lista, validemos un pago o se acerque un vencimiento."
              : "Te avisamos al instante cuando tu factura esté lista, validemos un pago o se acerque un vencimiento. Sin estar revisando."}
          </p>
          {plataforma === "ios" && !instalada && pushEstado !== "activo" ? (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-200 dark:ring-amber-400/20 p-4">
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                En iPhone primero instala el portal como app (paso anterior).
                Después vuelve a abrirlo desde tu pantalla de inicio y aquí
                podrás activar las notificaciones.
              </p>
            </div>
          ) : pushEstado === "activo" ? (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-200 dark:ring-emerald-400/20 p-4 text-emerald-700 dark:text-emerald-300">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <IconCheck />
              </span>
              <span className="text-sm font-bold leading-snug">
                Notificaciones activadas en este dispositivo
              </span>
            </div>
          ) : pushEstado === "denegado" ? (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 ring-1 ring-rose-200 dark:ring-rose-400/20 p-4">
              <p className="text-xs leading-relaxed text-rose-700 dark:text-rose-300">
                Tu navegador tiene bloqueadas las notificaciones para este sitio.
                Ábrelas desde los permisos del navegador y vuelve a intentarlo.
              </p>
            </div>
          ) : pushEstado === "no-soportado" ? (
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 ring-1 ring-slate-200 dark:ring-white/10 p-4">
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Este navegador no soporta notificaciones. Te recomendamos Chrome,
                Edge o Safari recientes (en iPhone, instalando el portal como app).
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void activarNotis()}
              disabled={pushEstado === "trabajando"}
              className="w-full py-3 rounded-2xl bg-[var(--portal-navy)] text-white text-sm font-bold hover:bg-[var(--portal-navy-hover)] transition-colors disabled:opacity-50"
            >
              {pushEstado === "trabajando"
                ? "Activando…"
                : "Activar notificaciones"}
            </button>
          )}
        </div>
      ),
    },
    /* 3 · Recorrido rápido */
    {
      icono: <IconBrujula />,
      eyebrow: "Paso 3 de 3",
      titulo: "Conoce tus secciones",
      cuerpo: (
        <ul className="space-y-2.5">
          {SECCIONES.map((s) => (
            <li
              key={s.nombre}
              className="flex items-start gap-3 rounded-2xl bg-slate-50 dark:bg-white/5 ring-1 ring-slate-100 dark:ring-white/10 p-3"
            >
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--portal-navy)] text-white">
                <IconCheck />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {s.nombre}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  {s.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ),
    },
    /* 4 · Listo */
    {
      icono: <IconCohete />,
      eyebrow: "¡Todo listo!",
      titulo: "Ya puedes empezar",
      cuerpo: (
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Cualquier duda, escríbele a tu contador desde el portal. Puedes volver a
          ver esta guía cuando quieras desde <b>Perfil</b>. ¡Bienvenido!
        </p>
      ),
    },
  ];

  const total = pasos.length;
  const actual = pasos[paso];
  const esUltimo = paso === total - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Guía de bienvenida"
    >
      <button
        type="button"
        aria-label="Cerrar guía"
        onClick={cerrar}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-[subir_.35s_ease]">
        {/* Cabecera con ícono */}
        <div className="relative px-6 pt-7 pb-5 bg-gradient-to-br from-[var(--portal-navy)] to-[var(--portal-navy-hover)] text-white">
          <button
            type="button"
            onClick={cerrar}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-[11px] font-bold uppercase tracking-widest"
          >
            Saltar
          </button>
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 text-white">
            {actual.icono}
          </span>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
            {actual.eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-black leading-tight">
            {actual.titulo}
          </h2>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 max-h-[55vh] overflow-y-auto">{actual.cuerpo}</div>

        {/* Pie: progreso + navegación */}
        <div className="px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {pasos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === paso
                    ? "w-5 bg-[var(--portal-navy)] dark:bg-[var(--portal-purple)]"
                    : "w-1.5 bg-slate-200 dark:bg-white/15"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            {paso > 0 ? (
              <button
                type="button"
                onClick={() => setPaso((p) => Math.max(0, p - 1))}
                className="inline-flex items-center gap-1 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                <IconChevron flip />
                Atrás
              </button>
            ) : (
              <span className="flex-1" />
            )}
            <button
              type="button"
              onClick={() => (esUltimo ? cerrar() : setPaso((p) => p + 1))}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-[var(--portal-navy)] text-white text-sm font-bold hover:bg-[var(--portal-navy-hover)] transition-colors"
            >
              {esUltimo ? "Empezar a usar el portal" : "Siguiente"}
              {!esUltimo && <IconChevron />}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes subir {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function Instruccion({ n, texto }: { n: number; texto: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--portal-navy)] text-white text-[11px] font-black">
        {n}
      </span>
      <span className="inline-flex flex-wrap items-center gap-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
        {texto}
      </span>
    </div>
  );
}
