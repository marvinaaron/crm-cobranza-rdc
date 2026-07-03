import Link from "next/link";
import Logo from "@/components/publico/Logo";

type Props = {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  /** Variante compacta para paneles admin (e.firma). */
  compacto?: boolean;
  /** Solo texto legal, sin casilla (banner informativo). */
  informativo?: boolean;
};

/**
 * Casilla + aviso de no publicidad / uso legítimo de datos.
 * Reutilizable en /empezar y al registrar e.firma de clientes.
 */
export default function ConsentimientoDatosNotice({
  id = "acepta-privacidad",
  checked,
  onChange,
  error,
  compacto = false,
  informativo = false,
}: Props) {
  return (
    <div
      className={`border-t pt-4 ${
        error ? "border-red-200" : "border-slate-200"
      } ${compacto ? "" : "mt-1"}`}
    >
      {!compacto ? (
        <div className="flex items-center gap-2 mb-3">
          <Logo mark="r" alto={22} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Compromiso RDC Contadores
          </p>
        </div>
      ) : null}

      <p className={`text-[11px] leading-relaxed text-slate-600 ${compacto ? "" : "mb-3"}`}>
        <strong className="text-slate-800">RDC Contadores</strong> <strong>no utilizará</strong> tu correo ni tu teléfono para publicidad,
        promociones de terceros, spam ni esquemas de fraude. Solo los usamos para dar seguimiento a
        tu solicitud, prestar servicios contables y fiscales que nos encargues, y comunicarte
        obligaciones o avisos relacionados con tu cuenta. Responsable:{" "}
        <strong>Aaron Rosales</strong>, contador titular del despacho.
      </p>

      <label
        htmlFor={id}
        className={`flex items-start gap-2.5 ${informativo ? "hidden" : "cursor-pointer"} ${compacto ? "mt-2" : ""}`}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={`mt-0.5 h-4 w-4 rounded border-slate-300 text-marca-navy focus:ring-marca-navy/30 ${
            error ? "border-red-500" : ""
          }`}
        />
        <span className="text-xs text-slate-700 leading-relaxed">
          Acepto el{" "}
          <Link
            href="/aviso-de-privacidad"
            target="_blank"
            className="font-semibold text-marca-navy hover:underline"
          >
            aviso de privacidad
          </Link>{" "}
          y entiendo que mis datos se tratarán únicamente para los fines descritos.
        </span>
      </label>

      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
