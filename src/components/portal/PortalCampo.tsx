import type {
  ChangeEvent,
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

/** Formatea dígitos con comas de miles; opcionalmente conserva decimales. */
export function formatNumeroConComas(
  value: string,
  decimales = false
): string {
  const raw = value.replace(/[^\d.]/g, "");
  const dotIdx = raw.indexOf(".");
  const intRaw =
    dotIdx === -1 ? raw.replace(/\./g, "") : raw.slice(0, dotIdx).replace(/\./g, "");
  const decRaw =
    dotIdx === -1 ? "" : raw.slice(dotIdx + 1).replace(/\./g, "").slice(0, 2);
  const formattedInt = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (!decimales) return formattedInt;
  if (dotIdx === -1) return formattedInt;
  return decRaw.length > 0 ? `${formattedInt}.${decRaw}` : `${formattedInt}.`;
}

type TonoCampo = "default" | "violet" | "navy";

const TONO: Record<
  TonoCampo,
  { wrap: string; icon: string; input: string; label: string }
> = {
  default: {
    wrap: "border-slate-200 focus-within:border-indigo-400 focus-within:ring-indigo-100",
    icon: "text-slate-500",
    input: "text-slate-900 placeholder:text-slate-400",
    label: "text-slate-400",
  },
  violet: {
    wrap: "border-violet-200 focus-within:border-violet-400 focus-within:ring-violet-100",
    icon: "text-violet-600",
    input: "text-violet-950 placeholder:text-violet-400/80",
    label: "text-violet-700",
  },
  navy: {
    wrap: "border-[var(--portal-navy-border)] focus-within:border-[var(--portal-navy)] focus-within:ring-indigo-100",
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
  /** Auto en icono dinero (# decimal) o numero (# entero). */
  numerico?: "entero" | "decimal" | false;
};

type PortalCampoInputProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size">;

type PortalCampoTextareaProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "size">;

function resolverIcono(icono: PortalIconoCampo | ReactNode): ReactNode {
  if (typeof icono === "string") {
    return iconoPortalCampo(icono as PortalIconoCampo);
  }
  return icono;
}

function resolverNumerico(
  icono: PortalIconoCampo | ReactNode,
  numerico?: "entero" | "decimal" | false
): "entero" | "decimal" | undefined {
  if (numerico === false) return undefined;
  if (numerico === "entero" || numerico === "decimal") return numerico;
  if (icono === "dinero") return "decimal";
  if (icono === "numero") return "entero";
  return undefined;
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
  multiline = false,
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
  multiline?: boolean;
  children: ReactNode;
}) {
  const t = TONO[tono];
  const inputId = id ?? name;
  const iconPos = multiline
    ? "absolute left-3 top-3"
    : "absolute left-3 top-1/2 -translate-y-1/2";

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
        className={`relative rounded-xl border bg-white focus-within:ring-2 ${t.wrap}`}
      >
        <span
          className={`pointer-events-none ${iconPos} ${t.icon}`}
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
  numerico,
  onChange,
  ...props
}: PortalCampoInputProps) {
  const inputPy = size === "sm" ? "py-2" : "py-3";
  const inputText = size === "sm" ? "text-xs font-medium" : "text-sm font-semibold";
  const t = TONO[tono];
  const modoNumerico = resolverNumerico(icono, numerico);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    if (!modoNumerico) {
      onChange(e);
      return;
    }
    const formatted = formatNumeroConComas(
      e.target.value,
      modoNumerico === "decimal"
    );
    onChange({
      ...e,
      target: { ...e.target, value: formatted },
    });
  };

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
        inputMode={modoNumerico ? "decimal" : props.inputMode}
        className={`w-full min-w-0 border-0 bg-transparent pl-10 pr-3 ${inputPy} ${inputText} outline-none ${t.input}`}
        onChange={handleChange}
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
      multiline
    >
      <textarea
        id={id ?? name}
        name={name}
        rows={rows}
        className={`w-full min-w-0 border-0 bg-transparent pl-10 pr-3 ${inputPy} ${inputText} resize-none outline-none ${t.input}`}
        {...props}
      />
    </CampoShell>
  );
}
