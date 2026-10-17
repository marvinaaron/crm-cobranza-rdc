import { adivinarDestinoPdf } from "../src/lib/clasificar-pdf-cumplimiento.ts";

const casos = [
  [
    "09 Impuestos Carolina 2026.pdf",
    { tipoId: "impuestos", mes: 8, anio: 2026 },
  ],
  [
    "09 Declaracion Carolina Munguia 2026.pdf",
    { tipoId: "declaracion", mes: 8, anio: 2026 },
  ],
  [
    "09CarolinaMunguiaImpuestos2026.pdf",
    { tipoId: "impuestos", mes: 8, anio: 2026 },
  ],
  [
    "04 Acuse Juan Perez 2026.pdf",
    { tipoId: "declaracion", mes: 3, anio: 2026 },
  ],
  [
    "12_Impuestos_Cliente_2025.pdf",
    { tipoId: "impuestos", mes: 11, anio: 2025 },
  ],
  [
    "sipare marzo 2026.pdf",
    { tipoId: "sipare", mes: 2, anio: 2026 },
  ],
];

let fallos = 0;
for (const [nombre, esperado] of casos) {
  const got = adivinarDestinoPdf(nombre);
  if (
    got.tipoId !== esperado.tipoId ||
    got.mes !== esperado.mes ||
    got.anio !== esperado.anio
  ) {
    console.error(`FAIL ${nombre}: got ${JSON.stringify(got)} expected ${JSON.stringify(esperado)}`);
    fallos += 1;
  }
}

if (fallos) process.exit(1);
console.log(`OK ${casos.length} casos`);
