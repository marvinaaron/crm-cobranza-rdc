"use client";

import Link from "next/link";
import {
  type Cliente,
  type Periodo,
  esMismoPeriodo,
} from "@/lib/clientes";
import { useClientes } from "@/context/ClientesContext";
import {
  getFlujoCumplimiento,
  todosPagosValidados,
} from "@/lib/cumplimiento";
import { categoriasHabilitadasCliente } from "@/lib/config-cumplimiento-cliente";
import { hrefDeclaraciones } from "@/lib/portal/href-declaraciones";

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

type Props = {
  cliente: Cliente;
  periodoVista: Periodo;
  periodoFiscal: Periodo;
};

/** Enero → mes fiscal vigente del mismo año. */
function mesesEjercicioActual(fiscal: Periodo): Periodo[] {
  const lista: Periodo[] = [];
  for (let m = 0; m <= fiscal.mes; m++) {
    lista.push({ mes: m, anio: fiscal.anio });
  }
  return lista;
}

type Tono = "viendo" | "pagar" | "pagado" | "otro";

export default function PortalMesesDeclaracionesNav({
  cliente,
  periodoVista,
  periodoFiscal,
}: Props) {
  const { getCumplimientoPeriodo } = useClientes();
  const cats = categoriasHabilitadasCliente(cliente);
  const meses = mesesEjercicioActual(periodoFiscal);
  if (meses.length === 0) return null;
  const visibles = Math.min(6, meses.length);
  const anchoLista = `${(meses.length / visibles) * 100}%`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-3.5">
      <p className="text-[13px] font-semibold text-slate-500 mb-2">
        Tus meses
      </p>
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1 snap-x snap-mandatory">
        <ul className="flex gap-1.5" style={{ width: anchoLista }}>
          {meses.map((p) => {
            const reg = getCumplimientoPeriodo(cliente.id, p);
            const flujo = getFlujoCumplimiento(reg);
            const pagado =
              todosPagosValidados(reg, cats) || flujo === "completado";
            const porPagar = flujo === "declaraciones";
            const viendo = esMismoPeriodo(p, periodoVista);
            const tono: Tono = viendo
              ? "viendo"
              : porPagar
                ? "pagar"
                : pagado
                  ? "pagado"
                  : "otro";
            const cls =
              tono === "viendo"
                ? "bg-[var(--portal-navy)] text-white"
                : tono === "pagar"
                  ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                  : tono === "pagado"
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-slate-50 text-slate-500";
            return (
              <li key={`${p.anio}-${p.mes}`} className="min-w-0 flex-1 snap-start">
                <Link
                  href={hrefDeclaraciones(p, null)}
                  aria-current={viendo ? "page" : undefined}
                  className={`flex items-center justify-center rounded-xl py-2 text-center whitespace-nowrap ${cls}`}
                >
                  <span className="text-[13px] font-semibold leading-none">
                    {MESES_CORTOS[p.mes]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
