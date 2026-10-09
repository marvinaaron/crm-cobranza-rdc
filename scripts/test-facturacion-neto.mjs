/**
 * Valida el motor de facturación neto vs valores del Excel de referencia.
 * Ejecutar: node scripts/test-facturacion-neto.mjs
 */

const RET_IVA_2_3_DE_16 = 0.106667;
const RET_ISR_RESICO = 0.0125;
const RET_ISR_PFAE = 0.1;

function redondear(n) {
  return Math.round(n * 100) / 100;
}

function calcularDesdeNeto(neto, tasaIva, retIvaSub, retIsrSub) {
  const factor = 1 + tasaIva - retIvaSub - retIsrSub;
  const subtotal = redondear(neto / factor);
  const iva = redondear(subtotal * tasaIva);
  const retIva = redondear(subtotal * retIvaSub);
  const retIsr = redondear(subtotal * retIsrSub);
  const totalCfdi = redondear(subtotal + iva);
  const netoVerificado = redondear(subtotal + iva - retIva - retIsr);
  return { subtotal, iva, retIva, retIsr, totalCfdi, netoVerificado };
}

function assertCerca(actual, esperado, etiqueta, tolerancia = 0.02) {
  const diff = Math.abs(actual - esperado);
  if (diff > tolerancia) {
    console.error(`✗ ${etiqueta}: esperado ${esperado}, obtuvo ${actual} (Δ ${diff})`);
    return false;
  }
  console.log(`✓ ${etiqueta}: ${actual}`);
  return true;
}

let ok = true;

// RESICO honorarios → PM, neto $10,000 (Excel: subtotal 9607.69)
{
  const r = calcularDesdeNeto(10000, 0.16, RET_IVA_2_3_DE_16, RET_ISR_RESICO);
  ok =
    assertCerca(r.subtotal, 9607.69, "RESICO honorarios subtotal") && ok;
  ok = assertCerca(r.iva, 1537.23, "RESICO honorarios IVA") && ok;
  ok = assertCerca(r.retIva, 1024.82, "RESICO honorarios ret IVA") && ok;
  ok = assertCerca(r.retIsr, 120.1, "RESICO honorarios ret ISR") && ok;
  ok = assertCerca(r.totalCfdi, 11144.92, "RESICO honorarios total CFDI") && ok;
}

// PFAE honorarios → PM, neto $10,000 (Excel: subtotal 10489.51)
{
  const r = calcularDesdeNeto(10000, 0.16, RET_IVA_2_3_DE_16, RET_ISR_PFAE);
  ok =
    assertCerca(r.subtotal, 10489.51, "PFAE honorarios subtotal") && ok;
  ok = assertCerca(r.iva, 1678.32, "PFAE honorarios IVA") && ok;
  ok = assertCerca(r.retIva, 1118.88, "PFAE honorarios ret IVA") && ok;
  ok = assertCerca(r.retIsr, 1048.95, "PFAE honorarios ret ISR") && ok;
  ok = assertCerca(r.totalCfdi, 12167.83, "PFAE honorarios total CFDI") && ok;
}

// Casa doméstica RESICO: sin IVA, solo ret ISR 1.25%
{
  const r = calcularDesdeNeto(10000, 0, 0, RET_ISR_RESICO);
  ok = assertCerca(r.subtotal, 10126.58, "RESICO casa doméstica subtotal") && ok;
  ok = assertCerca(r.retIsr, 126.58, "RESICO casa doméstica ret ISR") && ok;
}

console.log(ok ? "\n✅ Todos los tests pasaron." : "\n❌ Algunos tests fallaron.");
process.exit(ok ? 0 : 1);
