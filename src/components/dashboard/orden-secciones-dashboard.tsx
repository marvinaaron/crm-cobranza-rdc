"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

export const IDS_SECCION = [
  "siguiente",
  "calendario",
  "dinero",
  "crecimiento",
  "analisis",
  "escalamientos",
  "facturacion",
  "agenda",
] as const;

export type IdSeccion = (typeof IDS_SECCION)[number];

const STORAGE_ORDEN = "dashboard-orden-secciones";

function fusionarOrden(guardado: unknown): IdSeccion[] {
  const validos = new Set<string>(IDS_SECCION);
  const desdeSave = Array.isArray(guardado)
    ? guardado.filter((x): x is IdSeccion => validos.has(String(x)))
    : [];
  const faltan = IDS_SECCION.filter((id) => !desdeSave.includes(id));
  return [...desdeSave, ...faltan];
}

function moverSeccion(
  orden: IdSeccion[],
  desde: IdSeccion,
  hacia: IdSeccion
): IdSeccion[] {
  if (desde === hacia) return orden;
  const next = orden.filter((id) => id !== desde);
  const i = next.indexOf(hacia);
  if (i < 0) return orden;
  next.splice(i, 0, desde);
  return next;
}

export function useOrdenSeccionesDashboard() {
  const [editando, setEditando] = useState(false);
  const [orden, setOrden] = useState<IdSeccion[]>(() => [...IDS_SECCION]);
  const [arrastrando, setArrastrando] = useState<IdSeccion | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_ORDEN);
      if (raw) setOrden(fusionarOrden(JSON.parse(raw)));
    } catch {
      // modo privado, etc.
    }
  }, []);

  useEffect(() => {
    if (!editando) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditando(false);
        setArrastrando(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editando]);

  const mover = (desde: IdSeccion, hacia: IdSeccion) => {
    setOrden((prev) => {
      const next = moverSeccion(prev, desde, hacia);
      try {
        window.localStorage.setItem(STORAGE_ORDEN, JSON.stringify(next));
      } catch {
        // mismo motivo
      }
      return next;
    });
  };

  const toggleEditando = () => {
    setArrastrando(null);
    setEditando((v) => !v);
  };

  return {
    editando,
    toggleEditando,
    orden,
    mover,
    arrastrando,
    setArrastrando,
  };
}

export function BloqueOrdenable({
  id,
  editando,
  arrastrando,
  orden,
  onMover,
  onArrastrando,
  children,
}: {
  id: IdSeccion;
  editando: boolean;
  arrastrando: IdSeccion | null;
  orden: IdSeccion[];
  onMover: (desde: IdSeccion, hacia: IdSeccion) => void;
  onArrastrando: (id: IdSeccion | null) => void;
  children: ReactNode;
}) {
  const indice = orden.indexOf(id);
  const soyYo = arrastrando === id;
  const arrastrandoEste = useRef(false);

  const soltar = (e: ReactPointerEvent<HTMLButtonElement>) => {
    arrastrandoEste.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    onArrastrando(null);
  };

  return (
    <div
      data-seccion-dashboard={id}
      style={{
        order: indice < 0 ? 99 : indice,
      }}
      className={`relative ${
        soyYo ? "z-20 scale-[0.99] opacity-90" : ""
      } ${editando ? "pl-8 sm:pl-9" : ""}`}
    >
      {editando && (
        <button
          type="button"
          aria-label="Arrastrar sección"
          onPointerDown={(e) => {
            e.preventDefault();
            arrastrandoEste.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            onArrastrando(id);
          }}
          onPointerMove={(e) => {
            if (!arrastrandoEste.current) return;
            const bajo = document.elementFromPoint(e.clientX, e.clientY);
            const dest = bajo?.closest(
              "[data-seccion-dashboard]"
            ) as HTMLElement | null;
            const hacia = dest?.dataset.seccionDashboard as
              | IdSeccion
              | undefined;
            if (hacia && hacia !== id) onMover(id, hacia);
          }}
          onPointerUp={soltar}
          onPointerCancel={soltar}
          className="absolute left-0 top-3 z-10 p-1.5 inline-flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing touch-none hover:text-slate-700"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <circle cx="8" cy="6" r="1.6" />
            <circle cx="16" cy="6" r="1.6" />
            <circle cx="8" cy="12" r="1.6" />
            <circle cx="16" cy="12" r="1.6" />
            <circle cx="8" cy="18" r="1.6" />
            <circle cx="16" cy="18" r="1.6" />
          </svg>
        </button>
      )}
      {children}
    </div>
  );
}
