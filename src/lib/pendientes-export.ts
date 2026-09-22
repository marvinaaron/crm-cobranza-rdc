import type { Cliente } from "@/lib/clientes";
import {
  ESTADO_PENDIENTE_META,
  formatFechaCorta,
  progresoTimeline,
  type Pendiente,
} from "@/lib/pendientes";

export async function exportarPendientesExcel(
  pendientes: Pendiente[],
  clientes: Cliente[]
): Promise<void> {
  const XLSX = await import("xlsx");
  const nombre = (id: number | null) =>
    id == null
      ? "Despacho"
      : clientes.find((c) => c.id === id)?.razonSocial ?? `Cliente #${id}`;

  const filas = pendientes.map((p) => ({
    Pendiente: p.titulo,
    Cliente: nombre(p.clienteId),
    Estado: ESTADO_PENDIENTE_META[p.estado].label,
    Inicio: formatFechaCorta(p.inicio),
    Fin: formatFechaCorta(p.fin),
    "Deadline interno": p.deadlineInterno
      ? formatFechaCorta(p.deadlineInterno)
      : "",
    "Avance %": progresoTimeline(p.inicio, p.fin),
    Encargo: p.encargoId ? "Sí" : "",
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), "Pendientes");
  const slug = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `pendientes-RDC-${slug}.xlsx`);
}
