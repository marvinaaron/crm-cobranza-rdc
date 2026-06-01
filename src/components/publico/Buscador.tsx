"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UMA_VIGENTE } from "@/lib/fiscal/uma";
import { SALARIO_MINIMO_VIGENTE } from "@/lib/fiscal/salario-minimo";
import { INPC_FALLBACK } from "@/lib/fiscal/inpc";

/**
 * Command Palette al estilo Linear/Vercel/GitHub.
 *
 * Se invoca con:
 *   - Click en el icono 🔍 del header
 *   - Atajo de teclado Cmd+K (Mac) o Ctrl+K (Win/Linux)
 *
 * Permite saltar a cualquier herramienta, página o ver el dato fiscal
 * más usado (UMA, salario mínimo, INPC) directamente desde el header
 * sin perder contexto.
 *
 * Implementación:
 *   - Filtro fuzzy básico (lowercase + includes) sobre título, subtítulo
 *     y tags. Suficiente para ~15 ítems; sin dependencias externas.
 *   - Navegación por teclado (↑↓ Enter Esc).
 *   - Bloqueo de scroll del body mientras está abierto.
 *   - Mobile: full-screen drawer; Desktop: modal centrado.
 */

type Categoria = "herramientas" | "paginas" | "datos" | "acciones";

/**
 * Paletas de color para los iconos por comando. Cada item del palette
 * tiene su tono propio, lo que hace el resultado mucho más escaneable
 * de un vistazo (no son todas las opciones grises).
 */
type ColorComando =
  | "indigo"
  | "sky"
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "slate"
  | "navy"
  | "teal";

const PALETA_ICONO: Record<ColorComando, { fondo: string; texto: string }> = {
  indigo: { fondo: "bg-indigo-100", texto: "text-indigo-700" },
  sky: { fondo: "bg-sky-100", texto: "text-sky-700" },
  emerald: { fondo: "bg-emerald-100", texto: "text-emerald-700" },
  amber: { fondo: "bg-amber-100", texto: "text-amber-700" },
  rose: { fondo: "bg-rose-100", texto: "text-rose-700" },
  violet: { fondo: "bg-violet-100", texto: "text-violet-700" },
  slate: { fondo: "bg-slate-100", texto: "text-slate-700" },
  navy: { fondo: "bg-marca-navy/10", texto: "text-marca-navy" },
  teal: { fondo: "bg-teal-100", texto: "text-teal-700" },
};

type Comando = {
  id: string;
  titulo: string;
  subtitulo?: string;
  /** Palabras adicionales que ayudan a encontrar el comando. */
  tags?: string;
  categoria: Categoria;
  icono: React.ReactNode;
  href: string;
  /** Valor accesorio mostrado a la derecha (ej. "$315.04 diario"). */
  badge?: string;
  /** Color del icono del comando. */
  color: ColorComando;
  /** Si el destino es externo (target=_blank). */
  externo?: boolean;
};

const ETIQUETA_CATEGORIA: Record<Categoria, string> = {
  herramientas: "Herramientas fiscales",
  paginas: "Páginas",
  datos: "Datos fiscales rápidos",
  acciones: "Acciones",
};

const ORDEN_CATEGORIA: Categoria[] = [
  "datos",
  "herramientas",
  "paginas",
  "acciones",
];

const fmtMx = (n: number) =>
  n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

const MESES_CORTO = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const ULTIMO_INPC = INPC_FALLBACK[INPC_FALLBACK.length - 1];

/**
 * Set fijo de comandos. El array se rearma en tiempo de render solo si
 * cambian las constantes fiscales (que vienen de imports estáticos), así
 * que en la práctica es estable y memo-amigable.
 */
const COMANDOS: Comando[] = [
  // === DATOS FISCALES RÁPIDOS ===
  {
    id: "dato-uma",
    titulo: `UMA ${UMA_VIGENTE.anio}`,
    subtitulo: `Vigente desde ${UMA_VIGENTE.vigenciaDesde}`,
    tags: "uma unidad medida actualizacion",
    categoria: "datos",
    color: "violet",
    href: "/herramientas/uma",
    badge: `${fmtMx(UMA_VIGENTE.diaria)} diaria`,
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "dato-salario",
    titulo: `Salario mínimo ${SALARIO_MINIMO_VIGENTE.anio}`,
    subtitulo: `Frontera norte ${fmtMx(SALARIO_MINIMO_VIGENTE.fronteraNorte)}`,
    tags: "salario minimo conasami sueldo diario",
    categoria: "datos",
    color: "sky",
    href: "/herramientas/salario-minimo-2026",
    badge: `${fmtMx(SALARIO_MINIMO_VIGENTE.general)} general`,
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <line x1="6" y1="12" x2="6.01" y2="12" />
        <line x1="18" y1="12" x2="18.01" y2="12" />
      </svg>
    ),
  },
  {
    id: "dato-inpc",
    titulo: "INPC más reciente",
    subtitulo: `${MESES_CORTO[ULTIMO_INPC.mes - 1]} ${ULTIMO_INPC.anio} (INEGI)`,
    tags: "inpc indice precios consumidor inflacion inegi",
    categoria: "datos",
    color: "emerald",
    href: "/herramientas/inpc",
    badge: ULTIMO_INPC.valor.toFixed(4),
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
  },

  // === HERRAMIENTAS ===
  {
    id: "h-rfc",
    titulo: "Calculadora de RFC",
    subtitulo: "Persona física con homoclave",
    tags: "rfc registro federal contribuyentes homoclave sat persona fisica",
    categoria: "herramientas",
    color: "indigo",
    href: "/herramientas/rfc",
    badge: "Nuevo",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="11" r="2" />
        <path d="M6 17c.7-1.5 2-2.5 3-2.5s2.3 1 3 2.5" />
        <line x1="14" y1="9" x2="18" y2="9" />
        <line x1="14" y1="13" x2="18" y2="13" />
      </svg>
    ),
  },
  {
    id: "h-isr",
    titulo: "Tarifas ISR 2026",
    subtitulo: "Anual, retenciones, RIF, subsidio empleo",
    tags: "isr impuesto sobre renta tarifa anual mensual subsidio empleo rif",
    categoria: "herramientas",
    color: "amber",
    href: "/herramientas/isr-2026",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "h-inpc",
    titulo: "INPC histórico",
    subtitulo: "Índice nacional de precios al consumidor",
    tags: "inpc inflacion inegi historico variacion",
    categoria: "herramientas",
    color: "emerald",
    href: "/herramientas/inpc",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
  },
  {
    id: "h-uma",
    titulo: "UMA vigente e histórico",
    subtitulo: "Unidad de medida y actualización",
    tags: "uma valor diario mensual anual",
    categoria: "herramientas",
    color: "violet",
    href: "/herramientas/uma",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "h-salario",
    titulo: "Salario mínimo 2026",
    subtitulo: "Zona general y frontera norte",
    tags: "salario minimo conasami general frontera norte profesional",
    categoria: "herramientas",
    color: "sky",
    href: "/herramientas/salario-minimo-2026",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
  },
  {
    id: "h-recargos",
    titulo: "Recargos federales",
    subtitulo: "Pago extemporáneo y mora SAT",
    tags: "recargos sat mora extemporaneo parcialidades pago",
    categoria: "herramientas",
    color: "rose",
    href: "/herramientas/recargos-federales",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" />
        <polyline points="12 9 12 13 14 15" />
      </svg>
    ),
  },
  {
    id: "h-divisas",
    titulo: "Tipo de cambio",
    subtitulo: "USD FIX · UDI · TIIE · divisas",
    tags: "tipo cambio usd dolar fix udi tiie banxico divisas euro",
    categoria: "herramientas",
    color: "teal",
    href: "/herramientas/tipo-de-cambio",
    icono: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
      </svg>
    ),
  },

  // === PÁGINAS ===
  {
    id: "p-inicio",
    titulo: "Inicio",
    subtitulo: "Página principal del despacho",
    tags: "home inicio principal",
    categoria: "paginas",
    color: "navy",
    href: "/",
    icono: IconoCasa(),
  },
  {
    id: "p-servicios",
    titulo: "Servicios",
    subtitulo: "Contabilidad, fiscal, nómina, asesoría",
    tags: "servicios contabilidad fiscal nomina asesoria",
    categoria: "paginas",
    color: "indigo",
    href: "/servicios",
    icono: IconoMaletin(),
  },
  {
    id: "p-proceso",
    titulo: "Cómo trabajamos",
    subtitulo: "Nuestro proceso paso a paso",
    tags: "proceso flujo trabajo onboarding como",
    categoria: "paginas",
    color: "sky",
    href: "/proceso",
    icono: IconoMapa(),
  },
  {
    id: "p-herramientas",
    titulo: "Hub de herramientas",
    subtitulo: "Todas las herramientas fiscales",
    tags: "herramientas hub calculadoras tablas",
    categoria: "paginas",
    color: "violet",
    href: "/herramientas",
    icono: IconoGrid(),
  },
  {
    id: "p-nosotros",
    titulo: "Nosotros",
    subtitulo: "Quiénes somos · equipo y valores",
    tags: "nosotros equipo quienes valores about",
    categoria: "paginas",
    color: "teal",
    href: "/nosotros",
    icono: IconoPersonas(),
  },
  {
    id: "p-contacto",
    titulo: "Contacto",
    subtitulo: "WhatsApp, correo y agenda",
    tags: "contacto whatsapp correo agenda llamada cita",
    categoria: "paginas",
    color: "emerald",
    href: "/contacto",
    icono: IconoBuzon(),
  },
  {
    id: "p-faq",
    titulo: "Preguntas frecuentes",
    subtitulo: "Dudas sobre contratar al despacho",
    tags: "faq preguntas frecuentes dudas",
    categoria: "paginas",
    color: "amber",
    href: "/preguntas-frecuentes",
    icono: IconoInterrogacion(),
  },

  // === ACCIONES ===
  {
    id: "a-login",
    titulo: "Acceso clientes",
    subtitulo: "Entrar al portal del cliente",
    tags: "login acceso portal cliente entrar",
    categoria: "acciones",
    color: "navy",
    href: "/portal/login",
    icono: IconoLlave(),
  },
];

function IconoCasa() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IconoMaletin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
function IconoMapa() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}
function IconoGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconoPersonas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconoBuzon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92V21a1 1 0 0 1-1.11 1 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.18 4.11 1 1 0 0 1 4.18 3h4.09a1 1 0 0 1 1 .75c.15.55.34 1.09.57 1.61a1 1 0 0 1-.22 1.11L7.91 8.18a16 16 0 0 0 6 6l1.71-1.71a1 1 0 0 1 1.11-.22c.52.23 1.06.42 1.61.57a1 1 0 0 1 .75 1z" />
    </svg>
  );
}
function IconoInterrogacion() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconoLlave() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}
function IconoBuscar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconoEquis() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Buscador() {
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState("");
  const [seleccionado, setSeleccionado] = useState(0);
  const [esMac, setEsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listaRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Detecta plataforma para mostrar ⌘K vs Ctrl+K en el hint.
  useEffect(() => {
    setEsMac(
      typeof navigator !== "undefined" &&
        /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent)
    );
  }, []);

  // Cmd/Ctrl+K abre/cierra desde cualquier parte del sitio.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAbierto((v) => !v);
      } else if (e.key === "Escape" && abierto) {
        e.preventDefault();
        setAbierto(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [abierto]);

  // Al abrir: reset query, focus al input, bloquea scroll del body.
  useEffect(() => {
    if (!abierto) return;
    setQuery("");
    setSeleccionado(0);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto]);

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMANDOS;
    return COMANDOS.filter((c) => {
      const haystack =
        `${c.titulo} ${c.subtitulo ?? ""} ${c.tags ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  // Reset selección cuando cambia el filtro.
  useEffect(() => {
    setSeleccionado(0);
  }, [query]);

  // Scroll-into-view al moverse con teclado.
  useEffect(() => {
    if (!listaRef.current) return;
    const el = listaRef.current.querySelector<HTMLElement>(
      `[data-idx="${seleccionado}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [seleccionado]);

  const ejecutar = (cmd: Comando) => {
    setAbierto(false);
    if (cmd.externo) {
      window.open(cmd.href, "_blank", "noopener,noreferrer");
    } else {
      router.push(cmd.href);
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSeleccionado((s) => Math.min(s + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSeleccionado((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = resultados[seleccionado];
      if (target) ejecutar(target);
    }
  };

  // Agrupa resultados por categoría preservando el orden visual deseado.
  const grupos = useMemo(() => {
    const porCategoria = new Map<Categoria, Comando[]>();
    resultados.forEach((c) => {
      const arr = porCategoria.get(c.categoria) ?? [];
      arr.push(c);
      porCategoria.set(c.categoria, arr);
    });
    return ORDEN_CATEGORIA.filter((cat) => porCategoria.has(cat)).map(
      (cat) => ({
        cat,
        items: porCategoria.get(cat)!,
      })
    );
  }, [resultados]);

  // Índice absoluto por item (para correlacionar selección global con
  // resaltado dentro del grupo correcto).
  let idxGlobal = -1;

  return (
    <>
      {/* Trigger: pill rounded-full (menos cuadrado) con look navy
          sutil. En mobile solo el icono, en desktop pill con texto +
          kbd para no perder el atajo. */}
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Buscar en el sitio"
        className="group inline-flex items-center gap-2 h-9 sm:h-10 px-2 sm:pl-3 sm:pr-1.5 rounded-full text-slate-500 hover:text-marca-navy hover:bg-marca-navy/5 sm:bg-slate-100/70 sm:backdrop-blur sm:ring-1 sm:ring-slate-200 sm:hover:ring-marca-navy/30 sm:hover:bg-white transition-all"
      >
        <IconoBuscar />
        <span className="hidden sm:inline text-sm font-medium text-slate-500 group-hover:text-marca-navy">
          Buscar
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white ring-1 ring-slate-200 text-slate-500 group-hover:ring-marca-navy/20 group-hover:text-marca-navy ml-1 transition-colors">
          {esMac ? "⌘" : "Ctrl"}
          <span>K</span>
        </kbd>
      </button>

      {abierto && (
        // Modal estilo Spotlight: backdrop muy borroso pero APENAS
        // oscurecido (slate-900/15) para que el sitio se vea atrás
        // sin la sensación de "ventana negra" arriba.
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[14vh] sm:pt-[18vh] px-3 sm:px-4 bg-slate-900/15 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Buscador del sitio"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAbierto(false);
          }}
        >
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_30px_80px_-15px_rgba(15,29,46,0.45)] ring-1 ring-white/40 overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
              <span className="text-slate-400" aria-hidden="true">
                <IconoBuscar />
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Busca herramientas, datos o páginas..."
                className="flex-1 outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal bg-transparent"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                aria-label="Cerrar buscador"
              >
                <IconoEquis />
              </button>
            </div>

            {/* Resultados */}
            <div
              ref={listaRef}
              className="max-h-[60vh] overflow-y-auto overscroll-contain"
            >
              {resultados.length === 0 ? (
                <div className="px-4 py-14 text-center">
                  <p className="text-sm text-slate-500">
                    Sin resultados para{" "}
                    <span className="font-bold text-slate-800">
                      &ldquo;{query}&rdquo;
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Prueba con &ldquo;RFC&rdquo;, &ldquo;ISR&rdquo;,
                    &ldquo;UMA&rdquo; o &ldquo;contacto&rdquo;.
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {grupos.map(({ cat, items }) => (
                    <div key={cat} className="mb-2 last:mb-0">
                      <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {ETIQUETA_CATEGORIA[cat]}
                      </p>
                      <ul className="space-y-0.5">
                        {items.map((c) => {
                          idxGlobal += 1;
                          const actual = idxGlobal === seleccionado;
                          const idx = idxGlobal;
                          return (
                            <li key={c.id}>
                              <button
                                type="button"
                                data-idx={idx}
                                onClick={() => ejecutar(c)}
                                onMouseEnter={() => setSeleccionado(idx)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                                  actual
                                    ? "bg-marca-navy/5 ring-1 ring-marca-navy/20"
                                    : "hover:bg-slate-50"
                                }`}
                              >
                                <span
                                  className={`inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-all ${
                                    actual
                                      ? `bg-white ${PALETA_ICONO[c.color].texto} ring-1 ring-marca-navy/20 scale-105`
                                      : `${PALETA_ICONO[c.color].fondo} ${PALETA_ICONO[c.color].texto}`
                                  }`}
                                  aria-hidden="true"
                                >
                                  {c.icono}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`text-sm font-bold truncate ${
                                      actual
                                        ? "text-marca-navy"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {c.titulo}
                                  </p>
                                  {c.subtitulo && (
                                    <p className="text-xs text-slate-500 truncate">
                                      {c.subtitulo}
                                    </p>
                                  )}
                                </div>
                                {c.badge && (
                                  <span
                                    className={`shrink-0 inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                      c.id === "h-rfc"
                                        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                                        : actual
                                          ? "bg-white text-marca-navy ring-1 ring-marca-navy/20"
                                          : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {c.badge}
                                  </span>
                                )}
                                {actual && (
                                  <span
                                    className="shrink-0 text-marca-navy"
                                    aria-hidden="true"
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
                                    >
                                      <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer con hints de teclado */}
            <div className="hidden sm:flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  <span>navegar</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd>↵</Kbd>
                  <span>abrir</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Kbd>esc</Kbd>
                  <span>cerrar</span>
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-marca-navy">
                RDC
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white ring-1 ring-slate-200 text-slate-600 font-bold">
      {children}
    </kbd>
  );
}
