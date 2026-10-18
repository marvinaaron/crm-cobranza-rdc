"use client";

import { useEffect, useState, type ReactNode } from "react";
import PillDeslizable from "@/components/ui/PillDeslizable";

type Opcion<T extends string> = { value: T; label: string; disabled?: boolean };

type Props<T extends string> = {
  opciones: Opcion<T>[];
  value: T;
  onChange: (v: T) => void;
  paneles: Record<T, ReactNode>;
  acento?: "marca" | "portal" | "claro";
  size?: "md" | "sm";
  className?: string;
  pillClassName?: string;
  scrollable?: boolean;
  compact?: boolean;
  label?: string;
};

/**
 * Píldora iOS: el contenido se desliza SOLO si arrastras o tocas la píldora.
 * El cuerpo de la página no se puede swipear.
 */
export default function PillPaginas<T extends string>({
  opciones,
  value,
  onChange,
  paneles,
  acento = "portal",
  size = "md",
  className = "",
  pillClassName = "",
  scrollable = false,
  compact = false,
  label,
}: Props<T>) {
  const n = opciones.length;
  const idx = Math.max(0, opciones.findIndex((o) => o.value === value));
  const [progress, setProgress] = useState(idx);
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    if (!arrastrando) setProgress(idx);
  }, [idx, arrastrando]);

  const irA = (v: T) => {
    setArrastrando(false);
    const i = opciones.findIndex((o) => o.value === v);
    setProgress(i < 0 ? 0 : i);
    onChange(v);
  };

  return (
    <div className={className}>
      <PillDeslizable
        acento={acento}
        size={size}
        label={label}
        className={pillClassName}
        scrollable={scrollable}
        compact={compact}
        opciones={opciones}
        value={value}
        onChange={irA}
        progress={n > 1 ? progress : undefined}
        instantThumb={arrastrando}
        onScrub={
          n > 1
            ? (p) => {
                setArrastrando(true);
                setProgress(p);
              }
            : undefined
        }
      />
      <div className="mt-3 overflow-x-clip overscroll-x-none [touch-action:pan-y]">
        <div
          className="flex w-full items-start gap-6 [touch-action:pan-y]"
          style={{
            transform: `translate3d(calc(${-progress} * (100% + 1.5rem)), 0, 0)`,
            transition: arrastrando
              ? "none"
              : "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          {opciones.map((op) => (
            <div key={op.value} className="w-full min-w-full shrink-0 basis-full">
              {paneles[op.value]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
