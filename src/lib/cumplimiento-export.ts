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
  getFlujoCumplimiento,
  FLUJO_CUMPLIMIENTO_LABELS,
} from "@/lib/cumplimiento";
import {
  categoriaAplicaCliente,
  categoriasConPagoEnPreview,
} from "@/lib/config-cumplimiento-cliente";
import { regimenPorClave } from "@/lib/regimenes-fiscales";
import {
  fechaLimiteSATConOverride,
  fechaLimiteIMSS,
  fechaLimiteEstatal,
} from "@/lib/portal/fechas-fiscales";
import {
  periodoRepseDesdePeriodoMensual,
  type RegistroRepse,
} from "@/lib/repse";
import {
  MESES_ABREV_FEDERAL,
  construirMatrizFederalAnual,
  formatMontoFederalCorto,
  totalesMesFederal,
} from "@/lib/cumplimiento-federal-anual";

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
    const vencSat = fedOn
      ? fmtFecha(fechaLimiteSATConOverride(c.rfc, periodo, reg?.fechaLimiteDeclaracion))
      : "N/A";
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
      "Previo visto cliente": siNo(clienteConfirmoPreview(reg)),
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

export type OpcionesExportAnualCliente = {
  cliente: Cliente;
  anio: number;
  getRegistro: (periodo: Periodo) => RegistroCumplimiento | undefined;
};

/** Doce meses de un cliente: para el Excel anual del portal. */
export function construirExportCumplimientoAnualCliente(
  opts: OpcionesExportAnualCliente
): {
  resumen: (string | number)[][];
  filas: FilaExportCumplimiento[];
  aplica: { federales: boolean; imss: boolean; estatales: boolean };
} {
  const { cliente, anio, getRegistro } = opts;
  const fedOn = categoriaAplicaCliente(cliente, "federales");
  const imssCfg = categoriaAplicaCliente(cliente, "imss");
  const estCfg = categoriaAplicaCliente(cliente, "estatales");

  const filas: FilaExportCumplimiento[] = Array.from({ length: 12 }, (_, mes) => {
    const periodo: Periodo = { mes, anio };
    const reg = getRegistro(periodo);
    const regB = reg ? asegurarBloques(reg) : undefined;
    const imssOn = imssCfg && !!regB?.imss.activo;
    const estOn = estCfg && !!regB?.estatales.activo;
    const catsPago = reg
      ? categoriasConPagoEnPreview(cliente, asegurarBloques(reg))
      : [];
    const fedPago =
      fedOn && !!reg && categoriaConPagoEnRegistro(reg, "federales");
    const imssPago =
      imssOn && !!reg && categoriaConPagoEnRegistro(reg, "imss");
    const estPago =
      estOn && !!reg && categoriaConPagoEnRegistro(reg, "estatales");
    const totalCargo = catsPago.reduce(
      (s, cat) => s + getSubtotalCategoria(reg!, cat),
      0
    );
    const vencSat = fedOn
      ? fmtFecha(
          fechaLimiteSATConOverride(
            cliente.rfc,
            periodo,
            reg?.fechaLimiteDeclaracion
          )
        )
      : "";

    return {
      Mes: periodoLabel(periodo),
      Estado: FLUJO_CUMPLIMIENTO_LABELS[getFlujoCumplimiento(reg)],
      "Federales a cargo": fedPago
        ? formatMontoImpuesto(montoCat(reg, "federales", fedOn, fedPago))
        : "",
      "IMSS a cargo": imssPago
        ? formatMontoImpuesto(montoCat(reg, "imss", imssOn, imssPago))
        : "",
      "Estatales a cargo": estPago
        ? formatMontoImpuesto(montoCat(reg, "estatales", estOn, estPago))
        : "",
      "Total a cargo": totalCargo > 0 ? formatMontoImpuesto(totalCargo) : "",
      "Pagos validados": catsPago.length
        ? siNo(todosPagosValidados(reg, catsPago))
        : "",
      "Venc. declaración SAT": vencSat,
    };
  });

  const resumen: (string | number)[][] = [
    ["Cumplimiento anual", String(anio)],
    ["Cliente", cliente.razonSocial],
    ["RFC", cliente.rfc],
    ["Régimen", labelRegimen(cliente)],
    ["Generado", new Date().toLocaleString("es-MX")],
    [],
  ];

  return {
    resumen,
    filas,
    aplica: { federales: fedOn, imss: imssCfg, estatales: estCfg },
  };
}

export async function exportarCumplimientoAnualCliente(
  datos: ReturnType<typeof construirExportCumplimientoAnualCliente>,
  cliente: Cliente,
  anio: number
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
    "Meses"
  );
  const rfc = cliente.rfc.replace(/[^A-Z0-9]/gi, "").slice(0, 13) || "cliente";
  XLSX.writeFile(wb, `cumplimiento-${rfc}-${anio}.xlsx`);
}

function slugRfc(cliente: Cliente): string {
  return cliente.rfc.replace(/[^A-Z0-9]/gi, "").slice(0, 13) || "cliente";
}

const LOGO_RDC_RATIO = 999 / 396;

async function dataUrlLogoRdcBlanco(): Promise<string | null> {
  try {
    const res = await fetch("/logos/rdc-white.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function guardarPdfPortalCliente(opts: {
  titulo: string;
  cliente: Cliente;
  anio: number;
  columnas: string[];
  filas: string[][];
  filename: string;
}): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const cols = opts.columnas;
  const colW = (pageW - margin * 2) / Math.max(cols.length, 1);
  const rowH = 18;
  const headerH = 72;
  const logoH = 26;
  const logoW = logoH * LOGO_RDC_RATIO;
  const logoX = pageW - margin - logoW;
  const textoMax = Math.max(120, logoX - margin - 16);

  pdf.setFillColor(26, 22, 77);
  pdf.rect(0, 0, pageW, headerH, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(opts.titulo, margin, 32, { maxWidth: textoMax });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(
    `${opts.cliente.razonSocial} · ${opts.cliente.rfc} · ${opts.anio}`,
    margin,
    52,
    { maxWidth: textoMax }
  );
  const logo = await dataUrlLogoRdcBlanco();
  if (logo) {
    try {
      pdf.addImage(logo, "PNG", logoX, (headerH - logoH) / 2, logoW, logoH);
    } catch {
      /* el PDF sigue siendo útil sin isotipo */
    }
  }

  let y = 96;
  pdf.setTextColor(30, 41, 59);
  pdf.setFillColor(242, 242, 247);
  pdf.rect(margin, y - 12, pageW - margin * 2, rowH, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  cols.forEach((col, i) => {
    pdf.text(col, margin + i * colW + 4, y);
  });
  y += rowH;
  pdf.setFont("helvetica", "normal");

  if (opts.filas.length === 0) {
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Sin movimientos registrados en este año.", margin, y + 8);
  } else {
    opts.filas.forEach((fila, idx) => {
      if (y > pageH - margin - rowH) {
        pdf.addPage();
        y = margin + 16;
      }
      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, y - 12, pageW - margin * 2, rowH, "F");
      }
      pdf.setTextColor(30, 41, 59);
      fila.forEach((val, i) => {
        const corto = val.length > 28 ? `${val.slice(0, 26)}…` : val;
        pdf.text(corto, margin + i * colW + 4, y);
      });
      y += rowH;
    });
  }

  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    `Generado ${new Date().toLocaleDateString("es-MX")} · RDC Contadores`,
    margin,
    pageH - 24
  );
  pdf.save(opts.filename);
}

export async function exportarCumplimientoAnualClientePdf(
  datos: ReturnType<typeof construirExportCumplimientoAnualCliente>,
  cliente: Cliente,
  anio: number
): Promise<void> {
  const columnas = ["Mes"];
  if (datos.aplica.federales) columnas.push("Federales");
  if (datos.aplica.imss) columnas.push("IMSS");
  if (datos.aplica.estatales) columnas.push("Estatales");
  columnas.push("Total");

  await guardarPdfPortalCliente({
    titulo: `Cumplimiento anual ${anio}`,
    cliente,
    anio,
    columnas,
    filas: datos.filas.map((f) => {
      const celdas: string[] = [String(f.Mes ?? "")];
      if (datos.aplica.federales) {
        celdas.push(String(f["Federales a cargo"] || "—"));
      }
      if (datos.aplica.imss) {
        celdas.push(String(f["IMSS a cargo"] || "—"));
      }
      if (datos.aplica.estatales) {
        celdas.push(String(f["Estatales a cargo"] || "—"));
      }
      celdas.push(String(f["Total a cargo"] || "—"));
      return celdas;
    }),
    filename: `cumplimiento-${slugRfc(cliente)}-${anio}.pdf`,
  });
}

export async function exportarImpuestosPagadosClientePdf(
  cliente: Cliente,
  anio: number,
  pagos: { mes: number; categoria: string; monto: number; pagadoEn?: string }[]
): Promise<void> {
  const delAnio = pagos
    .filter((p) => Number.isFinite(p.mes) && p.monto > 0)
    .sort((a, b) => a.mes - b.mes);
  await guardarPdfPortalCliente({
    titulo: `Impuestos pagados ${anio}`,
    cliente,
    anio,
    columnas: ["Mes", "Impuesto", "Monto", "Pagado"],
    filas: delAnio.map((p) => [
      periodoLabel({ mes: p.mes, anio }),
      p.categoria,
      formatMontoImpuesto(p.monto),
      p.pagadoEn
        ? new Date(p.pagadoEn).toLocaleDateString("es-MX")
        : "—",
    ]),
    filename: `impuestos-pagados-${slugRfc(cliente)}-${anio}.pdf`,
  });
}

function textoCeldaFederal(c: {
  inactivo: boolean;
  monto: number;
  sinPago: boolean;
}): string {
  if (c.inactivo || (c.monto === 0 && !c.sinPago)) return "—";
  if (c.sinPago && c.monto === 0) return "0";
  return formatMontoFederalCorto(c.monto);
}

export async function exportarVistaFederalExcel(
  clientes: Cliente[],
  periodo: Periodo,
  getRegistro: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined
): Promise<void> {
  const XLSX = await import("xlsx");
  const matriz = construirMatrizFederalAnual(
    clientes,
    periodo.anio,
    getRegistro
  );
  const totales = totalesMesFederal(matriz);
  const granTotal = totales.reduce((a, b) => a + b, 0);
  const encabezado = [
    "Contribuyente",
    "RFC",
    ...MESES_ABREV_FEDERAL,
    "Anual",
  ];
  const filas = matriz.map((r) => [
    r.cliente.razonSocial,
    r.cliente.rfc,
    ...r.celdas.map((c) =>
      c.inactivo || c.monto === 0 ? (c.sinPago ? 0 : "") : c.monto
    ),
    r.anual,
  ]);
  const pie = [
    "Total mes",
    "",
    ...totales.map((t) => (t !== 0 ? t : "")),
    granTotal,
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      [`Impuestos federales SAT · ${periodo.anio}`],
      ["Importe a cargo por mes (ENE–DIC)"],
      ["Generado", new Date().toLocaleString("es-MX")],
      ["Clientes", clientes.length],
      ["Suma del año", granTotal],
      [],
      encabezado,
      ...filas,
      pie,
    ]),
    "Federal"
  );
  XLSX.writeFile(wb, `cumplimiento-federal-RDC-${periodo.anio}.xlsx`);
}

export async function exportarVistaFederalPdf(
  clientes: Cliente[],
  periodo: Periodo,
  getRegistro: (
    clienteId: number,
    periodo: Periodo
  ) => RegistroCumplimiento | undefined
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const matriz = construirMatrizFederalAnual(
    clientes,
    periodo.anio,
    getRegistro
  );
  const totales = totalesMesFederal(matriz);
  const granTotal = totales.reduce((a, b) => a + b, 0);

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const nameW = 128;
  const anualW = 56;
  const mesW = (pageW - margin * 2 - nameW - anualW) / 12;
  const rowH = 16;
  const fontSize = 7;

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Impuestos federales SAT · ${periodo.anio}`, margin, margin + 2);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `Importe a cargo por mes · ${clientes.length} cliente${
      clientes.length === 1 ? "" : "s"
    } · ${new Date().toLocaleDateString("es-MX")} · Suma del año ${formatMontoImpuesto(granTotal)}`,
    margin,
    margin + 16
  );

  let y = margin + 34;

  const xMes = (i: number) => margin + nameW + i * mesW;
  const xAnual = margin + nameW + 12 * mesW;

  const dibujarEncabezado = () => {
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, y - 11, pageW - margin * 2, rowH, "F");
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(100, 116, 139);
    pdf.text("Contribuyente", margin + 3, y);
    MESES_ABREV_FEDERAL.forEach((label, i) => {
      pdf.text(label, xMes(i) + mesW / 2, y, { align: "center" });
    });
    pdf.text("Anual", xAnual + anualW - 3, y, { align: "right" });
    y += rowH;
    pdf.setTextColor(15, 23, 42);
  };

  dibujarEncabezado();

  matriz.forEach((r, idx) => {
    if (y > pageH - margin - rowH * 2) {
      pdf.addPage();
      y = margin + 16;
      dibujarEncabezado();
    }
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, y - 11, pageW - margin * 2, rowH, "F");
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(fontSize);
    const nombre =
      r.cliente.razonSocial.length > 22
        ? `${r.cliente.razonSocial.slice(0, 20)}…`
        : r.cliente.razonSocial;
    pdf.text(nombre, margin + 3, y);
    pdf.setFont("helvetica", "normal");
    r.celdas.forEach((c, i) => {
      const txt = textoCeldaFederal(c);
      if (c.pagado && c.monto !== 0) pdf.setTextColor(4, 120, 87);
      else if (c.aFavor && c.monto !== 0) pdf.setTextColor(15, 118, 110);
      else if (c.publicado && c.monto !== 0) pdf.setTextColor(180, 83, 9);
      else pdf.setTextColor(71, 85, 105);
      pdf.text(txt, xMes(i) + mesW / 2, y, { align: "center" });
    });
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      r.anual !== 0 ? formatMontoFederalCorto(r.anual) : "—",
      xAnual + anualW - 3,
      y,
      { align: "right" }
    );
    y += rowH;
  });

  if (y > pageH - margin - rowH) {
    pdf.addPage();
    y = margin + 16;
  }
  pdf.setFillColor(241, 245, 249);
  pdf.rect(margin, y - 11, pageW - margin * 2, rowH, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(71, 85, 105);
  pdf.text("Total mes", margin + 3, y);
  totales.forEach((t, i) => {
    pdf.text(
      t !== 0 ? formatMontoFederalCorto(t) : "—",
      xMes(i) + mesW / 2,
      y,
      { align: "center" }
    );
  });
  pdf.setTextColor(15, 23, 42);
  pdf.text(formatMontoFederalCorto(granTotal), xAnual + anualW - 3, y, {
    align: "right",
  });

  pdf.save(`cumplimiento-federal-RDC-${periodo.anio}.pdf`);
}
