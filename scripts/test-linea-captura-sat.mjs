import {
  extraerLineaCapturaSatDeTexto,
  extraerLineaCapturaSatDePaginas,
  formatearLineaCapturaSat,
} from "../src/lib/sat-linea-captura.ts";

const casos = [
  [
    "ok-acuse-sat-real",
    `SECCIÓN LÍNEA DE CAPTURA
Línea de Captura: 0426 10TC 8900 4889 1299 Importe total a pagar: $1,143
Vigente hasta: 23/02/2026
042610TC890048891299 1143`,
    "042610TC8900488912991143",
  ],
  [
    "ok-ejemplo-sat-hex-importe",
    `SECCIÓN LÍNEA DE CAPTURA
El importe a cargo determinado en esta declaración, deberá ser pagado en las instituciones de crédito autorizadas, utilizando para tal efecto la línea de captura que se indica.
Línea de Captura: 0426 7F73 1500 5140 0254 Importe total a pagar: $668
Vigente hasta: 26/10/2026
04267F73150051400254 668`,
    "04267F73150051400254668",
  ],
  [
    "ok-acuse-sin-codigo-barras",
    `Línea de Captura: 0426 10TC 8900 4889 1299
Importe total a pagar: $1,143`,
    "042610TC8900488912991143",
  ],
  [
    "ok-acuse-tokens-sueltos",
    "Línea de Captura: 0 4 2 6 1 0 T C 8 9 0 0 4 8 8 9 1 2 9 9 Importe total a pagar: $1,143",
    "042610TC8900488912991143",
  ],
  [
    "ok-etiquetada-grupos-con-importe",
    "LÍNEA DE CAPTURA\n1234 5678 9012 3456 7890\nIMPORTE A PAGAR $1,200.00",
    "123456789012345678901200",
  ],
  [
    "ok-etiquetada-seguida",
    "Linea de captura: 12345678901234567890 Fecha límite 17/05/2026",
    "12345678901234567890",
  ],
  [
    "ok-clave-referencia",
    "CLAVE DE REFERENCIA 99887766554433221100 RFC XAXX010101000",
    "99887766554433221100",
  ],
  [
    "ok-importe-dolar-al-final",
    "Línea de Captura: 0426 10TC 8900 4889 1299 $272",
    "042610TC890048891299272",
  ],
  [
    "ok-importe-tres-cifras-grupo",
    `Línea de Captura: 0426 10TC 8900 4889 1299 272
Vigente hasta: 27/04/2026`,
    "042610TC890048891299272",
  ],
  [
    "ok-dpa-importe-abajo",
    `LÍNEA DE CAPTURA
042610TC890048891299
IMPORTE
$272.00
VIGENTE HASTA
27/04/2026`,
    "042610TC890048891299272",
  ],
  [
    "ok-dolar-separado",
    "Línea de Captura: 0426 10TC 8900 4889 1299 $ 272",
    "042610TC890048891299272",
  ],
  ["vacio", "Acuse de recibo sin número de pago", null],
  [
    "ok-importe-un-digito-no-eco-0426",
    `SECCIÓN LÍNEA DE CAPTURA
Línea de Captura: 0426 10TC 8900 4889 1299 Importe total a pagar: $8
042610TC890048891299 0426 10TC 8900 4889 1299`,
    "042610TC8900488912998",
  ],
  [
    "ok-barcode-repite-0426-pero-importe-es-1143",
    `042610TC890048891299 0426 10TC 8900 4889 1299
Línea de Captura: 0426 10TC 8900 4889 1299
Importe total a pagar: $1,143`,
    "042610TC8900488912991143",
  ],
];

let fallos = 0;
for (const [nombre, texto, esperado] of casos) {
  const got = extraerLineaCapturaSatDeTexto(texto);
  if (got !== esperado) {
    console.error(`FAIL ${nombre}: got ${got} expected ${esperado}`);
    fallos += 1;
  }
}

const formateado = formatearLineaCapturaSat("04267F73150051400254668");
if (formateado !== "0426 7F73 1500 5140 0254 668") {
  console.error(`FAIL formato: got ${formateado}`);
  fallos += 1;
}

const formateadoAcuse = formatearLineaCapturaSat("042610TC8900488912991143");
if (formateadoAcuse !== "0426 10TC 8900 4889 1299 1143") {
  console.error(`FAIL formato-acuse: got ${formateadoAcuse}`);
  fallos += 1;
}

const formateadoImporteLargo = formatearLineaCapturaSat("042610TC89004889129912345");
if (formateadoImporteLargo !== "0426 10TC 8900 4889 1299 12345") {
  console.error(`FAIL formato-importe-junto: got ${formateadoImporteLargo}`);
  fallos += 1;
}

const formateadoTres = formatearLineaCapturaSat("042610TC890048891299272");
if (formateadoTres !== "0426 10TC 8900 4889 1299 272") {
  console.error(`FAIL formato-tres-cifras: got ${formateadoTres}`);
  fallos += 1;
}

const formateadoConDolar = formatearLineaCapturaSat("0426 10TC 8900 4889 1299 $272");
if (formateadoConDolar !== "0426 10TC 8900 4889 1299 272") {
  console.error(`FAIL formato-dolar: got ${formateadoConDolar}`);
  fallos += 1;
}

const paginasEco = extraerLineaCapturaSatDePaginas(
  [
    "Declaración del periodo 04/2026. ISR determinado.",
    `SECCIÓN LÍNEA DE CAPTURA
Línea de Captura: 0426 10TC 8900 4889 1299
Importe total a pagar: $8`,
  ]
);
if (paginasEco !== "042610TC8900488912998") {
  console.error(`FAIL paginas-hoja-2: got ${paginasEco}`);
  fallos += 1;
}

if (fallos) {
  process.exit(1);
}
console.log(`OK ${casos.length + 6} casos`);
