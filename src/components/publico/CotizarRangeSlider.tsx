"use client";

type Props = {
  min: number;
  max: number;
  step: number;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

/** Slider con track morado y thumb redondo — consistente en Windows, Mac e iOS. */
export default function CotizarRangeSlider({
  min,
  max,
  step,
  value,
  disabled = false,
  onChange,
}: Props) {
  const pct =
    max <= min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div
      className={`cotizar-range-wrap relative w-full h-8 flex items-center ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-slate-200"
        aria-hidden
      />
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-marca-acento pointer-events-none transition-[width] duration-75"
        style={{ width: `${pct}%` }}
        aria-hidden
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="cotizar-range relative z-[1] w-full"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      />
    </div>
  );
}
