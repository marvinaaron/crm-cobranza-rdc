import { periodoLabel, type Periodo } from "@/lib/clientes";
import type { LineaConsultaCfdi } from "@/lib/cfdi/consulta";
import { fmtFechaCfdiCorta, metodoPagoCorto } from "@/lib/cfdi/formato";

export { metodoPagoCorto as metodoPagoExport } from "@/lib/cfdi/formato";

export type FilaExportCfdi = {
  Fecha: string;
  "Serie-Folio": string;
  RFC: string;
  "Razón social": string;
  Total: number;
  "Método pago": string;
  "Forma pago": string;
  Estatus: string;
  UUID: string;
};

type ColPdf = { key: keyof FilaExportCfdi; label: string; width: number };

/** Anchos fijos en pt; «Razón social» absorbe el espacio restante. */
const COLS_PDF_FIJAS: ColPdf[] = [
  { key: "Fecha", label: "Fecha", width: 56 },
  { key: "Serie-Folio", label: "Folio", width: 48 },
  { key: "RFC", label: "RFC", width: 78 },
  { key: "Total", label: "Total", width: 58 },
  { key: "Método pago", label: "Mét.", width: 30 },
  { key: "Forma pago", label: "Forma", width: 72 },
  { key: "Estatus", label: "Estatus", width: 46 },
];

function lineaAFila(l: LineaConsultaCfdi): FilaExportCfdi {
  return {
    Fecha: fmtFechaCfdiCorta(l.fecha),
    "Serie-Folio": l.serieFolio,
    RFC: l.rfc,
    "Razón social": l.razonSocial,
    Total: l.total,
    "Método pago": metodoPagoCorto(l),
    "Forma pago": l.formaPago,
    Estatus: l.estatus === "cancelado" ? "Cancelado" : "Vigente",
    UUID: l.uuid,
  };
}

function colsPdfLayout(tableW: number): ColPdf[] {
  const fijas = COLS_PDF_FIJAS.reduce((s, c) => s + c.width, 0);
  const razonW = Math.max(tableW - fijas, 120);
  return [
    COLS_PDF_FIJAS[0],
    COLS_PDF_FIJAS[1],
    COLS_PDF_FIJAS[2],
    { key: "Razón social", label: "Razón social", width: razonW },
    ...COLS_PDF_FIJAS.slice(3),
  ];
}

function truncarCelda(
  pdf: { getTextWidth: (t: string) => number; setFontSize: (n: number) => void },
  texto: string,
  maxW: number,
  fontSize: number
): string {
  pdf.setFontSize(fontSize);
  if (pdf.getTextWidth(texto) <= maxW - 4) return texto;
  let s = texto;
  while (s.length > 1 && pdf.getTextWidth(`${s}…`) > maxW - 4) {
    s = s.slice(0, -1);
  }
  return `${s}…`;
}

export function construirExportCfdiConsulta(params: {
  lineas: LineaConsultaCfdi[];
  periodo: Periodo;
  titulo: string;
  clienteLabel?: string;
  totalMes?: number;
}) {
  const filas = params.lineas.map(lineaAFila);
  const total =
    params.totalMes ??
    params.lineas
      .filter((l) => l.estatus !== "cancelado")
      .reduce((s, l) => s + l.total, 0);

  const resumen: (string | number)[][] = [
    [params.titulo, periodoLabel(params.periodo)],
    ...(params.clienteLabel ? [["Cliente", params.clienteLabel]] : []),
    ["Comprobantes", filas.length],
    ["Total vigente (MXN)", total],
    ["Generado", new Date().toLocaleString("es-MX")],
  ];

  return { resumen, filas };
}

function slugPeriodo(periodo: Periodo) {
  return `${periodo.anio}-${String(periodo.mes + 1).padStart(2, "0")}`;
}

function slugTitulo(titulo: string) {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function exportarCfdiConsultaExcel(
  datos: ReturnType<typeof construirExportCfdiConsulta>,
  periodo: Periodo,
  titulo: string
): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(datos.resumen), "Resumen");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(datos.filas), "Comprobantes");
  const slug = slugPeriodo(periodo);
  XLSX.writeFile(wb, `cfdi-${slugTitulo(titulo)}-${slug}.xlsx`);
}

export async function exportarCfdiConsultaPdf(
  datos: ReturnType<typeof construirExportCfdiConsulta>,
  periodo: Periodo,
  titulo: string
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 28;
  const tableW = pageW - margin * 2;
  const cols = colsPdfLayout(tableW);
  const rowH = 14;
  const fontSize = 7;
  const pad = 3;

  const xCol = (i: number) =>
    margin + cols.slice(0, i).reduce((s, c) => s + c.width, 0) + pad;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${titulo} · ${periodoLabel(periodo)}`, margin, margin);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `${datos.filas.length} comprobantes · ${new Date().toLocaleDateString("es-MX")}`,
    margin,
    margin + 14
  );

  let y = margin + 32;

  const dibujarEncabezado = () => {
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, y - rowH + 4, tableW, rowH, "F");
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", "bold");
    cols.forEach((col, i) => {
      const label = truncarCelda(pdf, col.label, col.width, fontSize);
      const textW = pdf.getTextWidth(label);
      const centered =
        col.key === "Total" || col.key === "Método pago" || col.key === "Estatus";
      const x = centered
        ? xCol(i) + (col.width - pad * 2 - textW) / 2
        : xCol(i);
      pdf.text(label, x, y);
    });
    y += rowH;
  };

  dibujarEncabezado();
  pdf.setFont("helvetica", "normal");

  datos.filas.forEach((fila, idx) => {
    if (y > pageH - margin - rowH) {
      pdf.addPage();
      y = margin + 16;
      dibujarEncabezado();
      pdf.setFont("helvetica", "normal");
    }
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, y - rowH + 4, tableW, rowH, "F");
    }
    cols.forEach((col, i) => {
      const raw = fila[col.key];
      const base =
        typeof raw === "number"
          ? raw.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : String(raw);
      const alineado = truncarCelda(pdf, base, col.width, fontSize);
      const textW = pdf.getTextWidth(alineado);
      const x =
        col.key === "Total" || col.key === "Método pago" || col.key === "Estatus"
          ? xCol(i) + (col.width - pad * 2 - textW) / 2
          : xCol(i);
      pdf.text(alineado, x, y);
    });
    y += rowH;
  });

  pdf.save(`cfdi-${slugTitulo(titulo)}-${slugPeriodo(periodo)}.pdf`);
}
