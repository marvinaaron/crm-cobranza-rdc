"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { formatCurrencyInput } from "@/lib/monto-input";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: string;
  onChange: (value: string) => void;
  /** 0 = solo enteros con coma de miles. 2 = permite centavos. */
  decimales?: number;
};

/** Input de monto: solo números, coma de miles al escribir. */
const MontoInput = forwardRef<HTMLInputElement, Props>(function MontoInput(
  { value, onChange, decimales = 0, className, ...rest },
  ref
) {
  return (
    <input
      {...rest}
      ref={ref}
      type="text"
      inputMode={decimales > 0 ? "decimal" : "numeric"}
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(formatCurrencyInput(e.target.value, decimales))}
      className={className}
    />
  );
});

export default MontoInput;
