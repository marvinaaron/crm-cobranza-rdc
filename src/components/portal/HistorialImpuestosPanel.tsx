"use client";

import { type Cliente } from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import {
  type CategoriaId,
  CATEGORIA_META,
  formatMontoImpuesto,
  formatFechaLimiteImpuestoCorta,
} from "@/lib/cumplimiento";
import { categoriasHabilitadasCliente } from "@/lib/config-cumplimiento-cliente";
import PortalSection from "@/components/portal/PortalSection";

const CALENDLY_ASESORIA = "https://calendly.com/rdcontadores/asesoria";

type Props = { cliente: Cliente };

export default function HistorialImpuestosPanel({ cliente }: Props) {
  const { getHistorialImpuestosCliente } = useClientes();
  const cats = categoriasHabilitadasCliente(cliente);

  const tieneHistorial = cats.some(
    (cat) => getHistorialImpuestosCliente(cliente.id, cat).length > 0
  );

  return (
    <>
      {tieneHistorial && (
        <PortalSection title="Historial de pagos de impuestos">
          <div className="space-y-5">
            {cats.map((cat) => {
              const items = getHistorialImpuestosCliente(cliente.id, cat);
              if (!items.length) return null;
              const meta = CATEGORIA_META[cat];
              return (
                <div key={cat}>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${meta.accent}`}>
                    {meta.label}
                  </p>
                  <ul className="space-y-2">
                    {items.map((h) => (
                      <li
                        key={h.id}
                        className="flex flex-wrap justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                      >
                        <span className="text-xs font-bold text-slate-700">{h.periodoLabel}</span>
                        <span className={`text-sm font-black tabular-nums ${meta.accent}`}>
                          {formatMontoImpuesto(h.monto)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 w-full">
                          Límite: {formatFechaLimiteImpuestoCorta(h.fechaLimite)} · pagado{" "}
                          {new Date(h.pagadoEn).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </PortalSection>
      )}

      <PortalSection title="¿Dudas con sus impuestos?">
        <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
          Agende una asesoría con su contador en el horario que le convenga.
        </p>
        <a
          href={CALENDLY_ASESORIA}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full justify-center py-3.5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800"
        >
          Agendar asesoría en Calendly
        </a>
      </PortalSection>
    </>
  );
}

export { CALENDLY_ASESORIA };
