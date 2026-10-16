import { extraerLineaCapturaSatDeTexto } from "../src/lib/sat-linea-captura.ts";

const casos = [
  [
    "ok-etiquetada-grupos",
    "LÍNEA DE CAPTURA\n1234 5678 9012 3456 7890\nIMPORTE A PAGAR $1,200.00",
    "12345678901234567890",
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
if (fallos) {
  process.exit(1);
}
console.log(`OK ${casos.length} casos`);
