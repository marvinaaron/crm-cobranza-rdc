import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { MessageSquare, Paperclip, Type, User } from "lucide-react";

/** Iconos estándar para campos del portal — usar en todos los formularios nuevos. */
export type PortalIconoCampo =
  | "dinero"
  | "persona"
  | "texto"
  | "nota"
  | "archivo"
  | "numero";

export function iconoPortalCampo(tipo: PortalIconoCampo): ReactNode {
  switch (tipo) {
    case "dinero":
      return (
        <span className="text-sm font-black leading-none" aria-hidden>
          $
        </span>
      );
    case "persona":
      return <User size={16} strokeWidth={2.5} aria-hidden />;
    case "texto":
      return <Type size={16} strokeWidth={2.5} aria-hidden />;
    case "nota":
      return <MessageSquare size={16} strokeWidth={2.5} aria-hidden />;
    case "archivo":
      return <Paperclip size={16} strokeWidth={2.5} aria-hidden />;
    case "numero":
      return (
        <span className="text-xs font-black leading-none" aria-hidden>
          #
        </span>
      );
  }
}

type TonoCampo = "default" | "violet" | "navy";

const TONO: Record<
  TonoCampo,
  { wrap: string; rail: string; icon: string; input: string; label: string }
> = {
  default: {
    wrap: "border-slate-200 focus-within:border-indigo-400 focus-within:ring-indigo-100",
    rail: "bg-slate-50 border-slate-200 text-slate-500",
    icon: "text-slate-500",
    input: "text-slate-900 placeholder:text-slate-400",
    label: "text-slate-400",
  },
  violet: {
    wrap: "border-violet-200 focus-within:border-violet-400 focus-within:ring-violet-100",
    rail: "bg-violet-50 border-violet-200 text-violet-600",
    icon: "text-violet-600",
    input: "text-violet-950 placeholder:text-violet-400/80",
    label: "text-violet-700",
  },
  navy: {
    wrap: "border-[var(--portal-navy-border)] focus-within:border-[var(--portal-navy)] focus-within:ring-indigo-100",
    rail: "bg-[var(--portal-navy-soft)] border-[var(--portal-navy-border)] text-[var(--portal-navy)]",
    icon: "text-[var(--portal-navy)]",
    input: "text-slate-900 placeholder:text-slate-400",
    label: "text-[var(--portal-navy)]",
  },
};

type BaseProps = {
  label?: string;
  icono: PortalIconoCampo | ReactNode;
  tono?: TonoCampo;
  hint?: string;
  size?: "sm" | "md";
  className?: string;
  id?: string;
};

type PortalCampoInputProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

type PortalCampoTextareaProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
    multiline: true;
  };

function resolverIcono(icono: PortalIconoCampo | ReactNode): ReactNode {
  if (typeof icono === "string") {
    return iconoPortalCampo(icono as PortalIconoCampo);
  }
  return icono;
}

function CampoShell({
  label,
  icono,
  tono = "default",
  hint,
  size = "md",
  className = "",
  id,
  name,
  children,
}: {
  label?: string;
  icono: PortalIconoCampo | ReactNode;
  tono?: TonoCampo;
  hint?: string;
  size?: "sm" | "md";
  className?: string;
  id?: string;
  name?: string;
  children: ReactNode;
}) {
  const t = TONO[tono];
  const inputId = id ?? name;
  const railW = size === "sm" ? "w-9" : "w-11";

  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={inputId}
          className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${t.label}`}
        >
          {label}
        </label>
      ) : null}
      <div
        className={`flex overflow-hidden rounded-xl border bg-white focus-within:ring-2 ${t.wrap}`}
      >
        <span
          className={`flex shrink-0 items-center justify-center border-r ${railW} ${t.rail} ${t.icon}`}
          aria-hidden
        >
          {resolverIcono(icono)}
        </span>
        {children}
      </div>
      {hint ? (
        <p className="mt-1.5 text-[10px] font-medium text-slate-400 leading-relaxed">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Campo de texto con icono a la izquierda (patrón estándar del portal). */
export function PortalCampo({
  label,
  icono,
  tono = "default",
  hint,
  size = "md",
  className = "",
  id,
  name,
  ...props
}: PortalCampoInputProps) {
  const inputPy = size === "sm" ? "py-2" : "py-3";
  const inputText = size === "sm" ? "text-xs font-medium" : "text-sm font-semibold";
  const t = TONO[tono];

  return (
    <CampoShell
      label={label}
      icono={icono}
      tono={tono}
      hint={hint}
      size={size}
      className={className}
      id={id}
      name={name}
    >
      <input
        id={id ?? name}
        name={name}
        className={`flex-1 min-w-0 border-0 bg-transparent px-3 ${inputPy} ${inputText} outline-none ${t.input}`}
        {...props}
      />
    </CampoShell>
  );
}

/** Área de texto con icono a la izquierda (patrón estándar del portal). */
export function PortalCampoArea({
  label,
  icono,
  tono = "default",
  hint,
  size = "md",
  className = "",
  id,
  name,
  rows = 3,
  ...props
}: PortalCampoTextareaProps) {
  const inputPy = size === "sm" ? "py-2" : "py-3";
  const inputText = size === "sm" ? "text-xs font-medium" : "text-sm font-semibold";
  const t = TONO[tono];

  return (
    <CampoShell
      label={label}
      icono={icono}
      tono={tono}
      hint={hint}
      size={size}
      className={className}
      id={id}
      name={name}
    >
      <textarea
        id={id ?? name}
        name={name}
        rows={rows}
        className={`flex-1 min-w-0 border-0 bg-transparent px-3 ${inputPy} ${inputText} resize-none outline-none ${t.input}`}
        {...props}
      />
    </CampoShell>
  );
}
