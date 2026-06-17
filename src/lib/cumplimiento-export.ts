import {
  type Cliente,
  type Periodo,
  periodoLabel,
} from "@/lib/clientes";
import {
  type RegistroCumplimiento,
  type CategoriaId,
  asegurarBloques,
  contarArchivosNomina,
  contabilidadIniciada,
  clienteConfirmoPreview,
  documentoAdminCargado,
  esSinPagoImpuestos,
  formatMontoImpuesto,
  getFechaLimiteCategoria,
  getSaldoFavorPeriodo,
  getSubtotalCategoria,
  previewPublicado,
  todosPagosValidados,
  categoriaConPagoEnRegistro,
  pagoValidadoCategoria,
} from "@/lib/cumplimiento";
import {
  categoriaAplicaCliente,
  categoriasConPagoEnPreview,
} from "@/lib/config-cumplimiento-cliente";
import { regimenPorClave } from "@/lib/regimenes-fiscales";
import {
  fechaLimiteSAT,
  fechaLimiteIMSS,
  fechaLimiteEstatal,
} from "@/lib/portal/fechas-fiscales";
import {
  periodoRepseDesdePeriodoMensual,
  type RegistroRepse,
} from "@/lib/repse";

export type FilaExportCumplimiento = Record<string, string | number>;

function fmtFecha(d: Date): string {
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function siNo(v: boolean): string {
  return v ? "Sí" : "No";
}

function labelRegimen(c: Cliente): string {
  if (!c.regimenFiscalClave) return "Sin régimen";
  return regimenPorClave(c.regimenFiscalClave)?.label ?? c.regimenFiscalClave;
}

function montoCat(
  reg: RegistroCumplimiento | undefined,
  cat: CategoriaId,
  aplica: boolean,
  conPago: boolean
): number {
  if (!reg || !aplica || !conPago) return 0;
  return getSubtotalCategoria(reg, cat);
}

function fechaCat(
  reg: RegistroCumplimiento | undefined,
  cat: CategoriaId,
  aplica: boolean,
  conPago: boolean,
  fallback: string
): string {
  if (!aplica) return "N/A";
  if (!reg || !conPago) return fallback;
  const f = getFechaLimiteCategoria(reg, cat);
  return f || fallback;
}

export type OpcionesExportCumplimiento = {
  clientes: Cliente[];
  periodo: Periodo;
  pasoLabel: (cliente: Cliente) => string;
  getRegistro: (clienteId: number) => RegistroCumplimiento | undefined;
  getRegistroRepse?: (
    clienteId: number,
    periodoRepse: ReturnType<typeof periodoRepseDesdePeriodoMensual>
  ) => RegistroRepse | undefined;
};

export function construirExportCumplimiento(
  opts: OpcionesExportCumplimiento
): { resumen: (string | number)[][]; filas: FilaExportCumplimiento[]; columnas: string[] } {
  const { clientes, periodo, pasoLabel, getRegistro, getRegistroRepse } = opts;
  const periodoRepse = periodoRepseDesdePeriodoMensual(periodo);
  const mes = periodoLabel(periodo);

  const resumen: (string | number)[][] = [
    ["Cumplimiento fiscal", mes],
    ["Generado", new Date().toLocaleString("es-MX")],
    ["Clientes en reporte", clientes.length],
    [],
  ];

  const filas: FilaExportCumplimiento[] = clientes.map((c) => {
    const reg = getRegistro(c.id);
    const regB = reg ? asegurarBloques(reg) : undefined;
    const fedOn = categoriaAplicaCliente(c, "federales");
    const imssOn =
      categoriaAplicaCliente(c, "imss") && !!regB?.imss.activo;
    const estOn =
      categoriaAplicaCliente(c, "estatales") && !!regB?.estatales.activo;
    const repseOn = c.configRepse?.habilitado === true;
    const catsPago = reg ? categoriasConPagoEnPreview(c, asegurarBloques(reg)) : [];
    const fedPago = fedOn && !!reg && categoriaConPagoEnRegistro(reg, "federales");
    const imssPago = imssOn && !!reg && categoriaConPagoEnRegistro(reg, "imss");
    const estPago = estOn && !!reg && categoriaConPagoEnRegistro(reg, "estatales");
    const saldo = getSaldoFavorPeriodo(reg);
    const repseReg = getRegistroRepse?.(c.id, periodoRepse);
    const vencSat = fedOn ? fmtFecha(fechaLimiteSAT(c.rfc, periodo)) : "N/A";
    const vencImssCalc = imssOn ? fmtFecha(fechaLimiteIMSS(periodo)) : "N/A";
    const vencEstCalc = estOn ? fmtFecha(fechaLimiteEstatal(periodo)) : "N/A";
    const totalCargo = catsPago.reduce(
      (s, cat) => s + getSubtotalCategoria(reg!, cat),
      0
    );

    return {
      Periodo: mes,
      Cliente: c.razonSocial,
      RFC: c.rfc,
      Régimen: labelRegimen(c),
      "Clave régimen": c.regimenFiscalClave ?? "",
      "PF / PM": c.esPersonaMoral ? "PM" : "PF",
      Email: c.email ?? "",
      Flujo: pasoLabel(c),
      "Venc. declaración SAT": vencSat,
      "Sin pago impuestos": siNo(esSinPagoImpuestos(reg)),
      "Contabilidad iniciada": siNo(contabilidadIniciada(reg)),
      "Previo publicado": siNo(previewPublicado(reg)),
      "Previo validado cliente": siNo(clienteConfirmoPreview(reg)),
      "Saldo a favor total": saldo ? formatMontoImpuesto(saldo.total) : "",
      "Saldo a favor detalle": saldo
        ? saldo.lineas.map((l) => `${l.etiqueta}: ${formatMontoImpuesto(l.monto)}`).join("; ")
        : "",
      "Federales aplica": siNo(fedOn),
      "Federales a cargo": fedPago ? formatMontoImpuesto(montoCat(reg, "federales", fedOn, fedPago)) : "",
      "Federales fecha límite pago": fechaCat(
        reg,
        "federales",
        fedOn,
        fedPago,
        vencSat
      ),
      "Federales declaración PDF": fedOn
        ? siNo(documentoAdminCargado(reg, "declaracion"))
        : "N/A",
      "Federales impuestos PDF": fedOn
        ? siNo(documentoAdminCargado(reg, "impuestos"))
        : "N/A",
      "IMSS aplica": siNo(imssOn),
      "IMSS a cargo": imssPago
        ? formatMontoImpuesto(montoCat(reg, "imss", imssOn, imssPago))
        : "",
      "IMSS fecha límite pago": fechaCat(reg, "imss", imssOn, imssPago, vencImssCalc),
      "IMSS SIPARE PDF": imssOn ? siNo(documentoAdminCargado(reg, "sipare")) : "N/A",
      "IMSS EMA PDFs": imssOn ? String(regB?.imss.ema.length ?? 0) : "N/A",
      "IMSS EBA PDFs": imssOn ? String(regB?.imss.eba.length ?? 0) : "N/A",
      "Estatales aplica": siNo(estOn),
      "Estatales a cargo": estPago
        ? formatMontoImpuesto(montoCat(reg, "estatales", estOn, estPago))
        : "",
      "Estatales fecha límite pago": fechaCat(
        reg,
        "estatales",
        estOn,
        estPago,
        vencEstCalc
      ),
      "Estatales nómina archivos": estOn ? String(contarArchivosNomina(reg)) : "N/A",
      "Estatales línea captura PDF": estOn
        ? siNo(documentoAdminCargado(reg, "estatales"))
        : "N/A",
      "REPSE aplica": siNo(repseOn),
      "REPSE SISUB PDF": repseOn ? siNo(!!repseReg?.sisub) : "N/A",
      "REPSE ICSOE PDF": repseOn ? siNo(!!repseReg?.icsoe) : "N/A",
      "Total impuestos a cargo": totalCargo > 0 ? formatMontoImpuesto(totalCargo) : "",
      "Pagos validados": catsPago.length
        ? siNo(todosPagosValidados(reg, catsPago))
        : "",
      "Pago federales validado": fedPago ? siNo(pagoValidadoCategoria(reg, "federales")) : "",
      "Pago IMSS validado": imssPago ? siNo(pagoValidadoCategoria(reg, "imss")) : "",
      "Pago estatales validado": estPago ? siNo(pagoValidadoCategoria(reg, "estatales")) : "",
    };
  });

  const columnas =
    filas.length > 0 ? Object.keys(filas[0]) : ["Periodo", "Cliente", "RFC"];

  return { resumen, filas, columnas };
}

/** Columnas esenciales para el PDF (caben en landscape). */
const COLUMNAS_PDF = [
  "Cliente",
  "RFC",
  "Régimen",
  "Venc. declaración SAT",
  "Flujo",
  "Federales a cargo",
  "Federales fecha límite pago",
  "Saldo a favor total",
  "IMSS a cargo",
  "Estatales a cargo",
  "Total impuestos a cargo",
];

export async function exportarCumplimientoExcel(
  datos: ReturnType<typeof construirExportCumplimiento>,
  periodo: Periodo
): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(datos.resumen),
    "Resumen"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(datos.filas),
    "Detalle"
  );
  const slug = `${periodo.anio}-${String(periodo.mes + 1).padStart(2, "0")}`;
  XLSX.writeFile(wb, `cumplimiento-RDC-${slug}.xlsx`);
}

export async function exportarCumplimientoPdf(
  datos: ReturnType<typeof construirExportCumplimiento>,
  periodo: Periodo
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 28;
  const cols = COLUMNAS_PDF.filter((c) =>
    datos.filas.length ? c in datos.filas[0] : true
  );
  const colW = (pageW - margin * 2) / cols.length;
  const rowH = 14;
  const fontSize = 6.5;

  const titulo = `Cumplimiento · ${periodoLabel(periodo)}`;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(titulo, margin, margin);
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
      const texto = col.length > 18 ? `${col.slice(0, 16)}…` : col;
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
      const val = String(fila[col] ?? "");
      const corto = val.length > 22 ? `${val.slice(0, 20)}…` : val;
      pdf.text(corto, margin + i * colW + 2, y);
    });
    y += rowH;
  });

  const slug = `${periodo.anio}-${String(periodo.mes + 1).padStart(2, "0")}`;
  pdf.save(`cumplimiento-RDC-${slug}.pdf`);
}
