import { formatFechaIso } from "@/lib/clientes";
import type { MovimientoBancarioEnriquecido } from "@/lib/cobranza-caja";
import { guardarPdfTablaMarca } from "@/lib/pdf-marca-rdc";

export type FilaExportBanco = {
  Fecha: string;
  Importe: number;
  Cliente: string;
  RFC: string;
  "Meses pagados": string;
  Método: string;
  Cuenta: string;
  Factura: string;
};

export function construirExportBanco(
  movimientos: MovimientoBancarioEnriquecido[]
): { filas: FilaExportBanco[]; total: number } {
  const filas: FilaExportBanco[] = movimientos.map((m) => ({
    Fecha: formatFechaIso(m.fechaPago),
    Importe: m.monto,
    Cliente: m.clienteNombre,
    RFC: m.rfc,
    "Meses pagados": m.mesesPagadosLabel,
    Método: m.metodoLabel,
    Cuenta: m.cuentaLabel ?? "—",
    Factura: m.facturado ? "Facturado" : "Pendiente",
  }));
  const total = filas.reduce((a, f) => a + f.Importe, 0);
  return { filas, total };
}

export async function exportarBancoExcel(
  movimientos: MovimientoBancarioEnriquecido[],
  rangoLabel: string
): Promise<void> {
  const { filas, total } = construirExportBanco(movimientos);
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(filas);
  XLSX.utils.book_append_sheet(wb, hoja, "Estado de cuenta");
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Estado de cuenta", rangoLabel],
      ["Movimientos", filas.length],
      ["Total", total],
      ["Generado", new Date().toLocaleString("es-MX")],
    ]),
    "Resumen"
  );
  const slug = rangoLabel.replace(/[^\dA-Za-z]+/g, "-").slice(0, 40);
  XLSX.writeFile(wb, `banco-RDC-${slug || "export"}.xlsx`);
}

export async function exportarBancoPdf(
  movimientos: MovimientoBancarioEnriquecido[],
  rangoLabel: string,
  cuentaLabel: string
): Promise<void> {
  const { filas, total } = construirExportBanco(movimientos);
  const columnas = [
    "Fecha",
    "Importe",
    "Cliente",
    "Meses pagados",
    "Método",
    "Factura",
  ];
  const filasPdf = filas.map((f) => [
    f.Fecha,
    `$${f.Importe.toLocaleString("es-MX")}`,
    f.Cliente,
    f["Meses pagados"],
    f.Cuenta !== "—" ? `${f.Método} · ${f.Cuenta}` : f.Método,
    f.Factura,
  ]);
  filasPdf.push([
    "Total",
    `$${total.toLocaleString("es-MX")}`,
    `${filas.length} movimientos`,
    "",
    "",
    "",
  ]);
  const slug = rangoLabel.replace(/[^\dA-Za-z]+/g, "-").slice(0, 40);
  await guardarPdfTablaMarca({
    titulo: "Estado de cuenta",
    subtitulo: `${cuentaLabel} · ${rangoLabel}`,
    columnas,
    filas: filasPdf,
    filename: `banco-RDC-${slug || "export"}.pdf`,
    orientacion: "landscape",
  });
}
