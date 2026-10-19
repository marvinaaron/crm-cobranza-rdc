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

function periodoAnterior(p: Periodo): Periodo {
  if (p.mes === 0) return { mes: 11, anio: p.anio - 1 };
  return { mes: p.mes - 1, anio: p.anio };
}

function ultimosPeriodos(desde: Periodo, cantidad: number): Periodo[] {
  const lista: Periodo[] = [];
  let actual = { ...desde };
  for (let i = 0; i < cantidad; i++) {
    lista.unshift(actual);
    actual = periodoAnterior(actual);
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
  const meses = ultimosPeriodos(periodoFiscal, 12);

  return (
    <div className="px-1">
      <p className="text-[13px] font-semibold text-slate-500 mb-2">
        Tus meses
      </p>
      <ul className="grid grid-cols-6 gap-1.5">
        {meses.map((p) => {
          const reg = getCumplimientoPeriodo(cliente.id, p);
          const flujo = getFlujoCumplimiento(reg);
          const pagado = todosPagosValidados(reg, cats) || flujo === "completado";
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
                  : "bg-white text-slate-500";
          return (
            <li key={`${p.anio}-${p.mes}`}>
              <Link
                href={hrefDeclaraciones(p, null)}
                aria-current={viendo ? "page" : undefined}
                className={`flex flex-col items-center justify-center rounded-xl py-2.5 text-center ${cls}`}
              >
                <span className="text-[13px] font-semibold leading-none">
                  {MESES_CORTOS[p.mes]}
                </span>
                {porPagar && !viendo ? (
                  <span className="mt-1 text-[10px] font-semibold leading-none">
                    Pagar
                  </span>
                ) : pagado && !viendo ? (
                  <span className="mt-1 text-[10px] font-semibold leading-none">
                    Listo
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
