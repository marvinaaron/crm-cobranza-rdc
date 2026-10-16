"use client";

type Opcion<T extends string> = {
  id: T;
  label: string;
  /** Fondo del thumb cuando esta opción está activa. */
  thumbClass?: string;
  /** Color del texto cuando esta opción está activa. */
  labelActivaClass?: string;
};

type Props<T extends string> = {
  opciones: [Opcion<T>, Opcion<T>];
  valor: T;
  onChange: (id: T) => void;
  className?: string;
};

/**
 * Pastilla iOS de dos estados. El thumb se desliza; cada lado puede
 * llevar su propio color (p. ej. Inactivos en naranja).
 */
export default function DeslizadorDosOpciones<T extends string>({
  opciones,
  valor,
  onChange,
  className = "",
}: Props<T>) {
  const indice = opciones[0].id === valor ? 0 : 1;
  const activa = opciones[indice];

  return (
    <div
      className={`relative h-10 w-[15.25rem] shrink-0 rounded-full bg-slate-100 p-1 ${className}`}
      role="tablist"
      aria-label="Filtro de cartera"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-sm transition-[left,background-color] duration-200 ease-out ${
          activa.thumbClass ?? "bg-white"
        } ${indice === 0 ? "left-1" : "left-[calc(50%+2px)]"}`}
      />
      <div className="relative z-10 flex h-full">
        {opciones.map((op) => {
          const on = op.id === valor;
          return (
            <button
              key={op.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(op.id)}
              className={`flex-1 rounded-full text-[13px] font-semibold transition-colors ${
                on ? (op.labelActivaClass ?? "text-slate-900") : "text-slate-500 hover:text-slate-700"
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
