import {
  type Cliente,
  type Periodo,
  periodoLabel,
  clienteActivoEnPeriodo,
  esIngresoGeneralCliente,
  calcularEstado,
  getCompromisoMes,
  getMontoPagado,
  getTotalPendiente,
  getTotalExtraPorCobrar,
  getTotalDeudaPendiente,
} from "@/lib/clientes";

export type FilaExportCobranza = {
  Cliente: string;
  RFC: string;
  Correo: string;
  "Día pago": string;
  "Compromiso mes": number;
  "Pagado mes": number;
  "Pendiente honorarios": number;
  "Extra por cobrar": number;
  "Deuda total": number;
  Estatus: string;
};

export function construirExportCobranza(
  clientes: Cliente[],
  periodo: Periodo
): { resumen: (string | number)[][]; filas: FilaExportCobranza[] } {
  const filas: FilaExportCobranza[] = [];

  let totalHonorarios = 0;
  let totalExtras = 0;
  let totalDeuda = 0;

  for (const c of clientes) {
    if (!c.activo) continue;
    if (esIngresoGeneralCliente(c)) {
      filas.push({
        Cliente: c.razonSocial,
        RFC: c.rfc,
        Correo: c.email ?? "",
        "Día pago": "—",
        "Compromiso mes": 0,
        "Pagado mes": getMontoPagado(c, periodo),
        "Pendiente honorarios": 0,
        "Extra por cobrar": 0,
        "Deuda total": 0,
        Estatus: "Ingresos diversos",
      });
      continue;
    }
    if (!clienteActivoEnPeriodo(c, periodo)) continue;

    const pendHon = getTotalPendiente(c, periodo);
    const extra = getTotalExtraPorCobrar(c);
    const deuda = getTotalDeudaPendiente(c, periodo);
    totalHonorarios += pendHon;
    totalExtras += extra;
    totalDeuda += deuda;

    filas.push({
      Cliente: c.razonSocial,
      RFC: c.rfc,
      Correo: c.email ?? "",
      "Día pago": String(c.fechaPago),
      "Compromiso mes": getCompromisoMes(c, periodo),
      "Pagado mes": getMontoPagado(c, periodo),
      "Pendiente honorarios": pendHon,
      "Extra por cobrar": extra,
      "Deuda total": deuda,
      Estatus: calcularEstado(c, periodo),
    });
  }

  const resumen: (string | number)[][] = [
    ["Resumen de cobranza", periodoLabel(periodo)],
    ["Generado", new Date().toLocaleString("es-MX")],
    [],
    ["Clientes en reporte", filas.length],
    ["Pendiente honorarios (suma)", totalHonorarios],
    ["Extra por cobrar (suma)", totalExtras],
    ["Deuda total (suma)", totalDeuda],
  ];

  return { resumen, filas };
}

export async function exportarCobranzaExcel(
  clientes: Cliente[],
  periodo: Periodo
): Promise<void> {
  const datos = construirExportCobranza(clientes, periodo);
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(datos.filas),
    "CLIENTES"
  );
  const slug = `${periodo.anio}-${String(periodo.mes + 1).padStart(2, "0")}`;
  XLSX.writeFile(wb, `cobranza-RDC-${slug}.xlsx`);
}

const COLUMNAS_PDF: (keyof FilaExportCobranza)[] = [
  "Cliente",
  "RFC",
  "Compromiso mes",
  "Pagado mes",
  "Pendiente honorarios",
  "Extra por cobrar",
  "Deuda total",
  "Estatus",
];

export async function exportarCobranzaPdf(
  clientes: Cliente[],
  periodo: Periodo
): Promise<void> {
  const datos = construirExportCobranza(clientes, periodo);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 28;
  const cols = COLUMNAS_PDF;
  const colW = (pageW - margin * 2) / cols.length;
  const rowH = 14;
  const fontSize = 6.5;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Cobranza · ${periodoLabel(periodo)}`, margin, margin);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `${datos.filas.length} clientes · ${new Date().toLocaleDateString("es-MX")}`,
    margin,
    margin + 14
  );

  let y = margin + 32;

  const dibujarEncabezado = () => {
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, y - rowH + 4, pageW - margin * 2, rowH, "F");
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", "bold");
    cols.forEach((col, i) => {
      const x = margin + i * colW + 2;
      const texto = col.length > 16 ? `${col.slice(0, 14)}…` : col;
      pdf.text(texto, x, y);
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
      pdf.rect(margin, y - rowH + 4, pageW - margin * 2, rowH, "F");
    }
    cols.forEach((col, i) => {
      const raw = fila[col];
      const texto =
        typeof raw === "number"
          ? raw.toLocaleString("es-MX")
          : String(raw ?? "");
      const corto = texto.length > 22 ? `${texto.slice(0, 20)}…` : texto;
      pdf.text(corto, margin + i * colW + 2, y);
    });
    y += rowH;
  });

  const slug = `${periodo.anio}-${String(periodo.mes + 1).padStart(2, "0")}`;
  pdf.save(`cobranza-RDC-${slug}.pdf`);
}
