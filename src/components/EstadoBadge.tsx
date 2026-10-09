import { calcularEstado, type Cliente, type Periodo } from "@/lib/clientes";

const ESTILOS: Record<string, string> = {
  "AL CORRIENTE": "bg-emerald-50 text-emerald-600",
  PENDIENTE: "bg-amber-50 text-amber-600",
  ATRASADO: "bg-red-50 text-red-600",
  INACTIVO: "bg-slate-100 text-slate-400",
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
      className={`inline-block whitespace-nowrap text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide leading-none ${styles}`}
    >
      {estado}
    </span>
  );
}
