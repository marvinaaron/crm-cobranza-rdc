import { extraerLineaCapturaSatDeTexto, formatearLineaCapturaSat } from "../src/lib/sat-linea-captura.ts";

const casos = [
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
  ["vacio", "Acuse de recibo sin número de pago", null],
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

if (fallos) {
  process.exit(1);
}
console.log(`OK ${casos.length + 1} casos`);
