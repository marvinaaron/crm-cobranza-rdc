import { calcularEstado, type Cliente, type Periodo } from "@/lib/clientes";

const ESTILOS: Record<string, string> = {
  "AL CORRIENTE": "bg-emerald-50 text-emerald-700",
  PENDIENTE: "bg-amber-50 text-amber-700",
  ATRASADO: "bg-rose-50 text-rose-700",
  INACTIVO: "bg-slate-100 text-slate-500",
};

const ETIQUETAS: Record<string, string> = {
  "AL CORRIENTE": "Al corriente",
  PENDIENTE: "Pendiente",
  ATRASADO: "Atrasado",
  INACTIVO: "Inactivo",
};

type Props = {
  cliente: Cliente;
  periodo: Periodo;
};

export default function EstadoBadge({ cliente, periodo }: Props) {
  const estado = calcularEstado(cliente, periodo);
  const styles = ESTILOS[estado] ?? ESTILOS.ATRASADO;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap h-6 px-2.5 rounded-full text-[11px] font-semibold leading-none ${styles}`}
    >
      {ETIQUETAS[estado] ?? estado}
    </span>
  );
}
