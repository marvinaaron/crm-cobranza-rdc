"use client";

import { useRef, useState } from "react";
import MontoInput from "@/components/MontoInput";
import { caparImporteMx } from "@/lib/monto-input";

type Props = {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  onEnter?: () => void;
};

/** Misma regla que el pago manual del admin: comas, 6 dígitos, pop al teclear. */
export default function ImporteConZoom({
  id,
  value,
  onChange,
  ariaLabel,
  onEnter,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [pop, setPop] = useState(0);
  const prevDigits = useRef(value.replace(/\D/g, "").length);
  const visible = value || "0";
  const vacio = !value;

  return (
    <div className="hz-input-wrap">
      <MontoInput
        id={id}
        value={value}
        onChange={(v) => {
          const capped = caparImporteMx(v);
          const ahora = capped.replace(/\D/g, "").length;
          if (ahora > prevDigits.current) setPop((n) => n + 1);
          prevDigits.current = ahora;
          onChange(capped);
        }}
        aria-label={ariaLabel}
        enterKeyHint="done"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
        className="absolute inset-0 z-10 w-full h-full opacity-0"
        style={{ fontSize: 16 }}
      />
      <div
        aria-hidden
        className={`hz-importe ${vacio ? "is-empty" : ""}`}
      >
        <span>$</span>
        {visible.split("").map((ch, i) => {
          const esNuevo = !vacio && i === visible.length - 1 && pop > 0;
          return (
            <span
              key={`${i}-${ch}-${esNuevo ? pop : "s"}`}
              className={esNuevo ? "rdc-digit-pop" : "inline-block"}
            >
              {ch}
            </span>
          );
        })}
        {focused ? <span className="rdc-importe-caret" /> : null}
      </div>
    </div>
  );
}
