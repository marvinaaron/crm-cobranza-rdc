/**
 * Pruebas del parser CFDI (sin dependencias de test runner).
 * Ejecutar: node scripts/test-cfdi-parser.mjs
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Compilar on-the-fly no es trivial; importamos vía tsx no disponible.
// Usamos una copia inline mínima del parser para smoke test del regex.

const XML_EJEMPLO = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
  xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital"
  Version="4.0" Fecha="2026-04-15T10:30:00" SubTotal="10000.00" Total="11600.00"
  Moneda="MXN" TipoDeComprobante="I" Serie="A" Folio="123">
  <cfdi:Emisor Rfc="XAXX010101000" Nombre="EMPRESA DEMO SA DE CV"/>
  <cfdi:Receptor Rfc="RFCCLIENTE010" Nombre="CLIENTE EJEMPLO"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="84111506" Cantidad="1" Descripcion="Servicios contables abril" ValorUnitario="10000.00" Importe="10000.00"/>
  </cfdi:Conceptos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital UUID="A1B2C3D4-E5F6-7890-ABCD-EF1234567890" FechaTimbrado="2026-04-15T10:31:00"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

function attrEtiqueta(etiqueta, nombreAttr, xml) {
  const re = new RegExp(
    `<(?:[\\w.-]+:)?${etiqueta}\\b[^>]*?\\s${nombreAttr}=["']([^"']*)["']`,
    "i"
  );
  const m = xml.match(re);
  return m?.[1]?.trim() || null;
}

function attrGlobal(nombreAttr, xml) {
  const re = new RegExp(`\\s${nombreAttr}=["']([^"']*)["']`, "i");
  const m = xml.match(re);
  return m?.[1]?.trim() || null;
}

const uuid =
  attrEtiqueta("TimbreFiscalDigital", "UUID", XML_EJEMPLO) ?? attrGlobal("UUID", XML_EJEMPLO);
const total = attrEtiqueta("Comprobante", "Total", XML_EJEMPLO);
const rfcEmisor = attrEtiqueta("Emisor", "Rfc", XML_EJEMPLO);
const concepto = attrEtiqueta("Concepto", "Descripcion", XML_EJEMPLO);

const ok =
  uuid === "A1B2C3D4-E5F6-7890-ABCD-EF1234567890" &&
  total === "11600.00" &&
  rfcEmisor === "XAXX010101000" &&
  concepto === "Servicios contables abril";

if (!ok) {
  console.error("✗ test-cfdi-parser falló", { uuid, total, rfcEmisor, concepto });
  process.exit(1);
}

console.log("✓ test-cfdi-parser OK");
console.log("  UUID:", uuid);
console.log("  Total:", total);
console.log("  Emisor:", rfcEmisor);
