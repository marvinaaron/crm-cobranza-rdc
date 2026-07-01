"use client";

type Opcion<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type Props<T extends string> = {
  label: string;
  hint?: string;
  opciones: Opcion<T>[];
  value: T;
  onChange: (v: T) => void;
  colorActivo?: "indigo" | "emerald" | "violet";
};

const COLORES = {
  indigo: "bg-indigo-600 text-white ring-transparent",
  emerald: "bg-emerald-600 text-white ring-transparent",
  violet: "bg-violet-600 text-white ring-transparent",
};

export default function PillGrupo<T extends string>({
  label,
  hint,
  opciones,
  value,
  onChange,
  colorActivo = "indigo",
}: Props<T>) {
  const activo = COLORES[colorActivo];
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      {hint ? (
        <p className="text-[11px] font-bold text-slate-500 mb-2 leading-relaxed">
          {hint}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {opciones.map((op) => {
          const isActivo = op.value === value;
          return (
            <button
              key={op.value}
              type="button"
              disabled={op.disabled}
              onClick={() => onChange(op.value)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black transition ring-1 ring-inset disabled:opacity-40 disabled:cursor-not-allowed ${
                isActivo
                  ? activo
                  : "bg-white text-slate-500 ring-slate-200 hover:ring-slate-300"
              }`}
            >
              {op.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
