const LOGO_RDC_RATIO = 999 / 396;
const NAVY = { r: 26, g: 22, b: 77 };

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

export type PdfTablaMarcaOpts = {
  titulo: string;
  subtitulo: string;
  columnas: string[];
  filas: string[][];
  filename: string;
  orientacion?: "portrait" | "landscape";
  pie?: string;
};

/**
 * PDF de marca RDC: encabezado navy `#1a164d` + logo blanco.
 * El mismo formato de los PDFs de cumplimiento del portal.
 */
export async function guardarPdfTablaMarca(
  opts: PdfTablaMarcaOpts
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: opts.orientacion ?? "portrait",
    unit: "pt",
    format: "a4",
  });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const cols = opts.columnas;
  const colW = (pageW - margin * 2) / Math.max(cols.length, 1);
  const rowH = 16;
  const headerH = 72;
  const logoH = 26;
  const logoW = logoH * LOGO_RDC_RATIO;
  const logoX = pageW - margin - logoW;
  const textoMax = Math.max(120, logoX - margin - 16);

  const pintarCabeza = () => {
    pdf.setFillColor(NAVY.r, NAVY.g, NAVY.b);
    pdf.rect(0, 0, pageW, headerH, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(opts.titulo, margin, 32, { maxWidth: textoMax });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(opts.subtitulo, margin, 52, { maxWidth: textoMax });
  };

  pintarCabeza();
  const logo = await dataUrlLogoRdcBlanco();
  if (logo) {
    try {
      pdf.addImage(logo, "PNG", logoX, (headerH - logoH) / 2, logoW, logoH);
    } catch {
      /* el PDF sigue útil sin isotipo */
    }
  }

  let y = 96;
  const dibujarColumnas = () => {
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
  };

  dibujarColumnas();

  if (opts.filas.length === 0) {
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Sin movimientos en este periodo.", margin, y + 8);
  } else {
    opts.filas.forEach((fila, idx) => {
      if (y > pageH - margin - rowH) {
        pdf.addPage();
        pintarCabeza();
        if (logo) {
          try {
            pdf.addImage(logo, "PNG", logoX, (headerH - logoH) / 2, logoW, logoH);
          } catch {
            /* */
          }
        }
        y = 96;
        dibujarColumnas();
      }
      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, y - 12, pageW - margin * 2, rowH, "F");
      }
      pdf.setTextColor(30, 41, 59);
      fila.forEach((val, i) => {
        const corto = val.length > 32 ? `${val.slice(0, 30)}…` : val;
        pdf.text(corto, margin + i * colW + 4, y);
      });
      y += rowH;
    });
  }

  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    opts.pie ??
      `Generado ${new Date().toLocaleDateString("es-MX")} · RDC Contadores`,
    margin,
    pageH - 24
  );
  pdf.save(opts.filename);
}
